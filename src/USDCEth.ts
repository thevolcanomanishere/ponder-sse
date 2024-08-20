import { ponder } from "@/generated";
import Redis from "ioredis";

if (!process.env.REDIS_URL) {
	throw new Error("REDIS_URL is not set");
}

const publisher = new Redis(process.env.REDIS_URL);

ponder.on("USDC:Transfer", async ({ event, context }) => {
	const { Transfer } = context.db;

	await Transfer.create({
		id: event.log.id,
		data: {
			to: event.args.to,
			from: event.args.from,
			amount: event.args.value,
			time: event.block.timestamp,
		},
	});

	await publisher.publish(
		"USDC:Transfer",
		JSON.stringify({
			to: event.args.to,
			from: event.args.from,
			amount: event.args.value,
			time: event.block.timestamp,
		}),
	);
});
