#!/bin/bash

# List of HTTP(S) RPC endpoints
rpc_urls=(
    "https://base.llamarpc.com"
    "https://base.drpc.org"
    "https://base-rpc.publicnode.com"
    "https://mainnet.base.org"
    "https://developer-access-mainnet.base.org"
    "https://base-mainnet.public.blastapi.io"
    "https://base.api.onfinality.io/public"
    "https://base.rpc.subquery.network/public"
    "https://base.blockpi.network/v1/rpc/public"
    "https://base.gateway.tenderly.co"
    "https://gateway.tenderly.co/public/base"
    "https://base.meowrpc.com"
    "https://1rpc.io/base"
    "https://base-pokt.nodies.app"
    "https://endpoints.omniatech.io/v1/base/mainnet/public"
    "https://base-mainnet.gateway.tatum.io"
    "https://public.stackup.sh/api/v1/node/base-mainnet"
    "https://rpc.notadegen.com/base"
    "https://base-mainnet.diamondswap.org/rpc"
)

# JSON-RPC request payload to test eth_getLogs within the first 200 blocks
payload='{"jsonrpc":"2.0","method":"eth_getLogs","params":[{"fromBlock":"0x0","toBlock":"0xc8","address":"0x0000000000000000000000000000000000000000"}],"id":1}'

# Function to test an endpoint
check_rpc() {
    local url=$1
    response=$(curl -s -X POST -H "Content-Type: application/json" --data "$payload" $url)
    
    if [[ $response == *"result"* ]]; then
        echo "✅ $url supports eth_getLogs"
    else
        echo "❌ $url does not support eth_getLogs"
    fi
}

# Loop through all HTTP(S) RPC URLs and test them
for url in "${rpc_urls[@]}"; do
    check_rpc $url
done
