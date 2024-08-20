import { createConfig, loadBalance } from "@ponder/core";
import { http } from "viem";

import { ERC20Abi } from "./abis/USDCAbi";

const publicRpcUrls = [
	"https://eth.llamarpc.com",
	"https://rpc.mevblocker.io/fast",
	"https://eth.drpc.org",
	"https://mainnet.gateway.tenderly.co",
];

const loadBalanceProvider = loadBalance(publicRpcUrls.map((url) => http(url)));

export default createConfig({
	database: {
		kind: "postgres",
		publishSchema: "indexer",
	},
	networks: {
		mainnet: { chainId: 1, transport: loadBalanceProvider },
	},
	contracts: {
		USDC: {
			abi: ERC20Abi,
			address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
			network: "mainnet",
			startBlock: 20569026,
		},
	},
});
