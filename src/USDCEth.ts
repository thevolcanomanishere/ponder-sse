import { ponder } from "@/generated";
import Redis from "ioredis";
import { cache, watchCacheSpace } from "./cache";
import { getAddress } from "viem";

if (!process.env.REDIS_URL) {
	throw new Error("REDIS_URL is not set");
}

const publisher = new Redis(process.env.REDIS_URL);

ponder.on("USDC:Transfer", async ({ event, context }) => {
	const { Transfer } = context.db;
	if (
		await watchCacheSpace.has(
			`${getAddress(event.args.from)}${context.network.name}`,
		)
	) {
		console.log(`Hit! Found ${event.args.from} on ${context.network.name}`);
		await Transfer.create({
			id: event.log.id,
			data: {
				to: event.args.to,
				from: event.args.from,
				amount: event.args.value,
				time: event.block.timestamp,
				chain: context.network.name,
			},
		});

		await publisher.publish(
			"USDC:Transfer",
			JSON.stringify({
				to: event.args.to,
				from: event.args.from,
				amount: event.args.value,
				time: event.block.timestamp,
				chain: context.network.name,
			}),
		);
	}
});
