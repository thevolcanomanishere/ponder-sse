import { createConfig, loadBalance } from "@ponder/core";
import { http } from "viem";

import { ERC20Abi } from "./abis/USDCAbi";
import { base } from "viem/chains";

const publicRpcUrls = [
	"https://eth.llamarpc.com",
	"https://rpc.mevblocker.io/fast",
	"https://eth.drpc.org",
	"https://mainnet.gateway.tenderly.co",
];

const ethLoadBalanceProvider = loadBalance(
	publicRpcUrls.map((url) => http(url)),
);

const basePublicRpcUrls = [
	"https://base.llamarpc.com",
	"https://base.drpc.org",
	"https://base-rpc.publicnode.com",
	"https://mainnet.base.org",
	"https://developer-access-mainnet.base.org",
	"https://base.api.onfinality.io/public",
	"https://base.rpc.subquery.network/public",
	"https://base.blockpi.network/v1/rpc/public",
	"https://base.gateway.tenderly.co",
	"https://gateway.tenderly.co/public/base",
	"https://base.meowrpc.com",
	"https://1rpc.io/base",
	"https://endpoints.omniatech.io/v1/base/mainnet/public",
];

const baseLoadBalanceProvider = loadBalance(
	basePublicRpcUrls.map((url) => http(url)),
);

export default createConfig({
	database: {
		kind: "postgres",
		publishSchema: "indexer",
	},
	networks: {
		mainnet: { chainId: 1, transport: ethLoadBalanceProvider },
		base: { chainId: base.id, transport: baseLoadBalanceProvider },
	},
	contracts: {
		USDC: {
			abi: ERC20Abi,
			// This address is overridden in the base config below
			address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
			network: {
				mainnet: {
					startBlock: 20577844,
					maxBlockRange: 200,
				},
				base: {
					// This overrides the address in the parent
					address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
					startBlock: 18732594,
					maxBlockRange: 200,
				},
			},
		},
	},
});
