import { ponder } from "@/generated";
import { type SSEStreamingApi, streamSSE } from "hono/streaming";
import { getAddress } from "viem";
import { and, eq } from "@ponder/core";
import Redis from "ioredis";
import { cache, watchCacheSpace } from "../cache";

if (!process.env.REDIS_URL) {
	throw new Error("REDIS_URL is not set");
}

const subscribe = new Redis(process.env.REDIS_URL);

subscribe.subscribe("USDC:Transfer");

subscribe.on("message", (channel, message) => {
	const parsed = JSON.parse(message) as {
		to: string;
		from: string;
		amount: string;
		time: string;
		chain: string;
	};
	if (channel === "USDC:Transfer") {
		const streams = allStreams.values();

		for (const stream of streams) {
			stream.writeSSE({
				event: "allEvents",
				data: message,
			});
		}
	}

	if (sseStreamers.has(parsed.from)) {
		const stream = sseStreamers.get(parsed.from) as SSEStreamingApi;

		stream.writeSSE({
			event: "allEvents",
			data: message,
		});
	}
});

// @ts-expect-error - augmenting BigInt
BigInt.prototype.toJSON = function () {
	return this.toString();
};

/**
 * The collection of individual address streams
 */
const sseStreamers = new Map<string, SSEStreamingApi>();

ponder.get("/sse/:address", async (c) => {
	const address = c.req.param("address");

	if (!address) {
		return c.text("Missing params");
	}

	const addressValidated = getAddress(address);

	if (!addressValidated) {
		return c.text("Invalid address param");
	}

	const { Transfer } = c.tables;

	const transfers = await c.db
		.select()
		.from(Transfer)
		.where(eq(Transfer.from, addressValidated));

	// @ts-expect-error - context type clashes with the one from the `streamSSE` function
	return streamSSE(c, async (stream) => {
		sseStreamers.set(addressValidated, stream);

		stream.onAbort(() => {
			console.log("Aborted");
			sseStreamers.delete(addressValidated);
		});

		c.req.raw.signal.addEventListener("abort", () => {
			console.log(">>> stream closed");
		});

		// Send all historical transfers if they exist
		await stream.writeSSE({
			data: JSON.stringify(transfers),
			event: "USDC:Transfers",
		});

		// This keeps the connection open until the client closes it
		await new Promise(() => {});
	});
});

/**
 * The collection of connections to users that are streaming all events
 */
const allStreams = new Map<string, SSEStreamingApi>();

ponder.get("/allEvents", async (c) => {
	// @ts-expect-error - context type clashes with the one from the `streamSSE` function
	return streamSSE(c, async (stream) => {
		const reqId = crypto.randomUUID();
		c.req.raw.headers.set("reqId", reqId);

		stream.onAbort(() => {
			console.log("Aborted ", reqId);
			allStreams.delete(reqId);
		});

		c.req.raw.signal.addEventListener("abort", () => {
			console.log(">>> stream closed");
		});

		allStreams.set(reqId, stream);

		// This keeps the connection open until the client closes it
		await new Promise(() => {});
	});
});

ponder.post("/watchAddress/:address", async (c) => {
	const address = c.req.param("address");

	if (!address) {
		return c.text("Missing params");
	}

	const addressValidated = getAddress(address);

	if (!addressValidated) {
		return c.text("Invalid address");
	}

	await watchCacheSpace.set(`${addressValidated}`, true);

	console.log(`Watching ${addressValidated}`);

	return c.text("OK");
});

ponder.hono.delete("/watchAddress/:address", async (c) => {
	const address = c.req.param("address");

	if (!address) {
		return c.text("Missing params");
	}

	const addressValidated = getAddress(address);

	if (!addressValidated) {
		return c.text("Invalid address");
	}

	await watchCacheSpace.delete(`${addressValidated}`);

	return c.text("OK");
});
