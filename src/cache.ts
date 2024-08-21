import { BentoCache, bentostore } from "bentocache";
import { memoryDriver } from "bentocache/drivers/memory";
import { redisBusDriver, redisDriver } from "bentocache/drivers/redis";
import { Redis } from "ioredis";
// import { redisDriver } from "bentocache/drivers/redis";

const redisConnection = new Redis(process.env.REDIS_URL as string);

export const cache = new BentoCache({
	default: "ponderCache",
	stores: {
		ponderCache: bentostore()
			.useL1Layer(memoryDriver({ maxSize: 10_000 }))
			.useL2Layer(redisDriver({ connection: redisConnection }))
			.useBus(
				redisBusDriver({
					connection: {
						host: "redis",
						port: 6379,
					},
				}),
			),
	},
});

export const watchCacheSpace = cache.namespace("watchSpace");
