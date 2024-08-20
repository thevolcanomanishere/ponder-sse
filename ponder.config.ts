import { createConfig } from "@ponder/core";
import { http } from "viem";

import { UnverifiedContractAbi } from "./abis/UnverifiedContractAbi";

export default createConfig({
  networks: {
    mainnet: { chainId: 1, transport: http(process.env.PONDER_RPC_URL_1) },
  },
  contracts: {
    UnverifiedContract: {
      abi: UnverifiedContractAbi,
      address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      network: "mainnet",
    },
  },
});
