import { createSchema } from "@ponder/core";

export default createSchema((p) => ({
	Transfer: p.createTable(
		{
			id: p.string(),
			to: p.hex(),
			from: p.hex(),
			amount: p.bigint(),
			time: p.bigint(),
			chain: p.string(),
		},
		{
			fromChainIndex: p.index("from"),
		},
	),
}));
