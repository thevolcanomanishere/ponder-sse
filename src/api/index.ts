import { ponder } from "@/generated";
import { Context } from "hono";
import { type SSEStreamingApi, streamSSE } from "hono/streaming";
import { getAddress } from "viem";
import { eq } from "@ponder/core";
import Redis from "ioredis";

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
	};
	if (channel === "USDC:Transfer") {
		const streams = allStreams.values();

		for (const stream of streams) {
			stream.writeSSE({
				event: channel,
				data: message,
			});
		}
	}

	if (sseStreamers.has(parsed.from)) {
		const stream = sseStreamers.get(parsed.from) as SSEStreamingApi;

		stream.writeSSE({
			event: channel,
			data: message,
		});
	}
});

// @ts-expect-error - augmenting BigInt
BigInt.prototype.toJSON = function () {
	return this.toString();
};

const sseStreamers = new Map<string, SSEStreamingApi>();

ponder.get("/sse/:from", async (c) => {
	const from = c.req.param("from");

	if (!from) {
		return c.text("No from param");
	}

	const addressValidated = getAddress(from);

	if (!addressValidated) {
		return c.text("Invalid from param");
	}

	const { Transfer } = c.tables;

	const transfers = await c.db
		.select()
		.from(Transfer)
		.where(eq(Transfer.from, addressValidated))
		.limit(10);

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
			event: "transfer",
		});

		// This keeps the connection open until the client closes it
		await new Promise(() => {});
	});
});

const allStreams = new Map<string, SSEStreamingApi>();

ponder.get("/allEvents", async (c) => {
	console.log("All Events FIRED");
	// @ts-expect-error - context type clashes with the one from the `streamSSE` function
	return streamSSE(c, async (stream) => {
		const reqId = crypto.randomUUID();
		c.req.raw.headers.set("reqId", reqId);

		console.log("RequestId ", reqId);

		stream.onAbort(() => {
			console.log("Aborted ", reqId);
			allStreams.delete(reqId);
		});

		c.req.raw.signal.addEventListener("abort", () => {
			console.log(">>> stream closed");
		});

		allStreams.set(reqId, stream);

		await stream.writeSSE({
			event: "allEvents",
			data: "Connected",
		});

		// This keeps the connection open until the client closes it
		await new Promise(() => {});
	});
});
