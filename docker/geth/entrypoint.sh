#!/bin/bash
set -e

# Default network is Sepolia if not set
NETWORK=${GETH_NETWORK:-sepolia}
DATA_DIR=${GETH_DATA_DIR:-/data/geth}
RPC_PORT=${GETH_RPC_PORT:-8545}
WS_PORT=${GETH_WS_PORT:-8546}

# Create data directory if it doesn't exist
mkdir -p $DATA_DIR

# Start Geth with specific network and ports
if [ "$NETWORK" = "sepolia" ]; then
  echo "Starting Geth on Sepolia testnet..."
  exec geth \
    --sepolia \
    --datadir="$DATA_DIR" \
    --http \
    --http.addr=0.0.0.0 \
    --http.port=$RPC_PORT \
    --http.corsdomain="*" \
    --http.api="eth,net,web3,personal,txpool" \
    --ws \
    --ws.addr=0.0.0.0 \
    --ws.port=$WS_PORT \
    --ws.origins="*" \
    --ws.api="eth,net,web3,personal,txpool" \
    --syncmode=snap
else
  # Development mode with local blockchain
  echo "Starting Geth in development mode..."
  exec geth \
    --dev \
    --datadir="$DATA_DIR" \
    --http \
    --http.addr=0.0.0.0 \
    --http.port=$RPC_PORT \
    --http.corsdomain="*" \
    --http.api="eth,net,web3,personal,miner,txpool" \
    --ws \
    --ws.addr=0.0.0.0 \
    --ws.port=$WS_PORT \
    --ws.origins="*" \
    --ws.api="eth,net,web3,personal,miner,txpool" \
    --allow-insecure-unlock
fi 