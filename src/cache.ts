import { BentoCache, bentostore } from "bentocache";
import { memoryDriver } from "bentocache/drivers/memory";
// import { redisDriver } from "bentocache/drivers/redis";

export const cache = new BentoCache({
	default: "ponderCache",
	stores: {
		// A first cache store named "myCache" using
		// only L1 in-memory cache
		ponderCache: bentostore().useL1Layer(memoryDriver({ maxSize: 10_000 })),

		// A second cache store named "multitier" using
		// a in-memory cache as L1 and a Redis cache as L2
		// multitier: bentostore()
		// 	.useL1Layer(memoryDriver({ maxSize: 10_000 }))
		// 	.useL2Layer(
		// 		redisDriver({
		// 			connection: { host: "127.0.0.1", port: 6379 },
		// 		}),
		// 	),
	},
});
