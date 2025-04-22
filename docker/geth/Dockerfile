FROM ethereum/client-go:stable

WORKDIR /root

# Create entrypoint script directly in the image
RUN echo '#!/bin/bash' > /entrypoint.sh && \
    echo 'set -e' >> /entrypoint.sh && \
    echo '' >> /entrypoint.sh && \
    echo '# Default network is Sepolia if not set' >> /entrypoint.sh && \
    echo 'NETWORK=${GETH_NETWORK:-sepolia}' >> /entrypoint.sh && \
    echo 'DATA_DIR=${GETH_DATA_DIR:-/data/geth}' >> /entrypoint.sh && \
    echo 'RPC_PORT=${GETH_RPC_PORT:-8545}' >> /entrypoint.sh && \
    echo 'WS_PORT=${GETH_WS_PORT:-8546}' >> /entrypoint.sh && \
    echo '' >> /entrypoint.sh && \
    echo '# Create data directory if it doesn'"'"'t exist' >> /entrypoint.sh && \
    echo 'mkdir -p $DATA_DIR' >> /entrypoint.sh && \
    echo '' >> /entrypoint.sh && \
    echo '# Start Geth with specific network and ports' >> /entrypoint.sh && \
    echo 'if [ "$NETWORK" = "sepolia" ]; then' >> /entrypoint.sh && \
    echo '  exec geth \\' >> /entrypoint.sh && \
    echo '    --sepolia \\' >> /entrypoint.sh && \
    echo '    --datadir="$DATA_DIR" \\' >> /entrypoint.sh && \
    echo '    --http \\' >> /entrypoint.sh && \
    echo '    --http.addr=0.0.0.0 \\' >> /entrypoint.sh && \
    echo '    --http.port=$RPC_PORT \\' >> /entrypoint.sh && \
    echo '    --http.corsdomain="*" \\' >> /entrypoint.sh && \
    echo '    --http.api="eth,net,web3,personal,txpool" \\' >> /entrypoint.sh && \
    echo '    --ws \\' >> /entrypoint.sh && \
    echo '    --ws.addr=0.0.0.0 \\' >> /entrypoint.sh && \
    echo '    --ws.port=$WS_PORT \\' >> /entrypoint.sh && \
    echo '    --ws.origins="*" \\' >> /entrypoint.sh && \
    echo '    --ws.api="eth,net,web3,personal,txpool" \\' >> /entrypoint.sh && \
    echo '    --syncmode=light' >> /entrypoint.sh && \
    echo 'else' >> /entrypoint.sh && \
    echo '  # Development mode with local blockchain' >> /entrypoint.sh && \
    echo '  exec geth \\' >> /entrypoint.sh && \
    echo '    --dev \\' >> /entrypoint.sh && \
    echo '    --datadir="$DATA_DIR" \\' >> /entrypoint.sh && \
    echo '    --http \\' >> /entrypoint.sh && \
    echo '    --http.addr=0.0.0.0 \\' >> /entrypoint.sh && \
    echo '    --http.port=$RPC_PORT \\' >> /entrypoint.sh && \
    echo '    --http.corsdomain="*" \\' >> /entrypoint.sh && \
    echo '    --http.api="eth,net,web3,personal,miner,txpool" \\' >> /entrypoint.sh && \
    echo '    --ws \\' >> /entrypoint.sh && \
    echo '    --ws.addr=0.0.0.0 \\' >> /entrypoint.sh && \
    echo '    --ws.port=$WS_PORT \\' >> /entrypoint.sh && \
    echo '    --ws.origins="*" \\' >> /entrypoint.sh && \
    echo '    --ws.api="eth,net,web3,personal,miner,txpool" \\' >> /entrypoint.sh && \
    echo '    --mine \\' >> /entrypoint.sh && \
    echo '    --miner.threads=1 \\' >> /entrypoint.sh && \
    echo '    --allow-insecure-unlock' >> /entrypoint.sh && \
    echo 'fi' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh

EXPOSE 8545 8546 30303 30303/udp

ENTRYPOINT ["/entrypoint.sh"] 