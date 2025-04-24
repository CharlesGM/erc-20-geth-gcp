# ERC-20 Token on GKE with Geth

This project demonstrates how to deploy an ERC-20 token contract on Ethereum and run a Geth node on Google Kubernetes Engine (GKE). It includes complete deployment pipelines using GitHub Actions and integration with MetaMask for testing.

## Table of Contents
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
  - [Deploying the Token](#deploying-the-token-to-local-node)
  - [Managing Tokens](#managing-tokens)
  - [Verifying Transactions](#verifying-transactions-on-the-blockchain)
- [Connecting with MetaMask](#connecting-with-metamask)
- [Deploying to GKE](#deploying-to-gke)
- [Helm Chart Deployment](#helm-chart-deployment)
- [Architecture](#architecture)
- [Testing Your Deployment](#testing-your-deployment)

## Project Structure

- `contracts/` - Solidity smart contracts
  - `SimpleToken.sol` - ERC-20 token implementation using OpenZeppelin
- `scripts/` - Deployment and utility scripts
  - `deploy.js` - Script to deploy the token contract with configurable recipient
  - `check-balance.js` - Script to check ETH and token balances for any address
  - `transfer-tokens.js` - Script to transfer tokens between accounts
- `docker/` - Docker configuration for Geth
  - `geth/` - Geth node configuration
- `terraform/` - Infrastructure as Code for GCP/GKE
  - `modules/gke/` - Terraform module for GKE cluster setup
- `charts/` - Helm chart for Kubernetes deployment
- `.github/workflows/` - GitHub Actions pipelines
  - `ci.yaml` - Main CI/CD pipeline for build and deployment

## Prerequisites

- Node.js (v18+)
- npm or yarn
- Docker and Docker Compose
- kubectl for Kubernetes interaction
- Helm (v3+) for chart deployment
- Access to a GKE cluster (for production deployment)
- Metamask wallet (for testing)
- Sepolia ETH (for testnet deployment)
- Terraform (v1.0+) for infrastructure provisioning

## Local Development

### Setting Up the Environment

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/erc-20-geth-gcp.git
   cd erc-20-geth-gcp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your environment file:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your specific settings.

### Compiling the Smart Contracts

Compile the ERC-20 token contract:
```bash
npm run compile
```

### Running the Local Ethereum Node

Start a local Ethereum development node with Docker Compose:
```bash
docker-compose up -d
```

This launches a Geth node in development mode with:
- HTTP-RPC endpoint at http://localhost:8545
- WebSocket endpoint at ws://localhost:8546
- Auto-mining enabled
- Pre-funded development accounts

### Deploying the Token to Local Node

Deploy the ERC-20 token to your local node:

```bash
# Deploy with tokens assigned to the deployer (default)
npm run deploy:local

# Deploy with tokens assigned to your MetaMask wallet
RECIPIENT_ADDRESS=0xYourMetaMaskAddress npx hardhat run scripts/deploy.js --network localhost
```

The script will:
1. Connect to the local Geth node
2. Use a pre-funded development account to deploy the contract
3. Mint all tokens to either the deployer or your specified address
4. Output the contract address and token details

### Managing Tokens

Check token balances:
```bash
# Check the balance of the deployer
npm run balance

# Check the balance of any address for a specific token
ADDRESS=0xYourAddress TOKEN_ADDRESS=0xTokenAddress npx hardhat run scripts/check-balance.js --network localhost
```

Transfer tokens:
```bash
# Transfer tokens to another address (like your MetaMask wallet)
RECIPIENT_ADDRESS=0xRecipientAddress AMOUNT=1000 TOKEN_ADDRESS=0xTokenAddress npx hardhat run scripts/transfer-tokens.js --network localhost
```

### Verifying Transactions on the Blockchain

After deploying or transferring tokens, you can verify the transactions on the blockchain using the JSON-RPC API:

#### 1. Check Current Block Number

```bash
curl -X POST --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  -H "Content-Type: application/json" http://localhost:8545
```

#### 2. Examine Block Contents

```bash
# Replace <blockNumber> with the block number from the previous call (in hex)
curl -X POST --data '{"jsonrpc":"2.0","method":"eth_getBlockByNumber","params":["<blockNumber>", true],"id":1}' \
  -H "Content-Type: application/json" http://localhost:8545
```

#### 3. Check Transaction Details

```bash
# Replace <txHash> with your transaction hash
curl -X POST --data '{"jsonrpc":"2.0","method":"eth_getTransactionReceipt","params":["<txHash>"],"id":1}' \
  -H "Content-Type: application/json" http://localhost:8545
```

#### 4. Check Token Balance (Using JSON-RPC)

For advanced users, you can also check token balances using the low-level JSON-RPC API:

```bash
# Create a call data to query balanceOf(address) for your address
# Format: 0x70a08231000000000000000000000000<your-address-without-0x>
curl -X POST --data '{"jsonrpc":"2.0","method":"eth_call","params":[{"to":"<tokenAddress>", "data":"0x70a08231000000000000000000000000<addressWithout0x>"},"latest"],"id":1}' \
  -H "Content-Type: application/json" http://localhost:8545
```

The result will be a hex-encoded number that you'll need to convert to decimal and divide by 10^18 (for tokens with 18 decimals).

## Connecting with MetaMask

### Adding the Local Network

1. Open MetaMask
2. Go to Networks > Add Network
3. Fill in the following details:
   - Network Name: `Local Geth`
   - RPC URL: `http://localhost:8545`
   - Chain ID: `1337` (for local dev mode)
   - Currency Symbol: `ETH`

### Adding the Sepolia Testnet

1. Open MetaMask
2. Go to Networks > Add Network
3. Select "Sepolia" from the list of popular networks

### Adding Your Token

After deploying the contract:

1. In MetaMask, click "Import tokens"
2. Enter the contract address from the deployment output
3. The token symbol and decimals should auto-fill
4. Click "Add Custom Token"

### Receiving Test Tokens

For local development:
- You can deploy directly to your MetaMask address using the `RECIPIENT_ADDRESS` environment variable
- Alternatively, you can deploy to the default account and transfer tokens using the transfer script
- The contract owner can mint additional tokens if needed

For Sepolia testnet:
- Deploy the contract using your MetaMask account's private key in `.env`
- The tokens will be minted to your address automatically

## Deploying to GKE

The project is set up to automatically deploy to GKE using GitHub Actions when pushing to the main branch.

### Prerequisites for GKE Deployment

1. A GKE cluster with appropriate permissions
2. The following GitHub Secrets configured in your repository:
   - `GCP_PROJECT_ID` - Your Google Cloud Project ID
   - `GCP_WORKLOAD_IDENTITY_PROVIDER` - Workload Identity Provider for GitHub Actions
   - `GCP_SERVICE_ACCOUNT` - Service account configured with container.admin and artifactregistry.writer roles
   - `SEPOLIA_PRIVATE_KEY` - (For production) Private key for contract deployment

### Funding Your Wallet for Sepolia Deployment

When deploying to the Sepolia testnet in production mode, the deployment wallet needs to have Sepolia ETH to pay for gas fees:

1. Extract your wallet address from your private key (don't share your private key):
   ```js
   const { ethers } = require('ethers');
   const wallet = new ethers.Wallet('your-private-key');
   console.log(wallet.address);
   ```

2. Get Sepolia ETH from a faucet:
   - Visit [Sepolia Faucet](https://sepoliafaucet.com/) 
   - Or [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
   - Or [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)
   - Enter your wallet address and complete verification

3. Verify your balance before deploying:
   ```bash
   # Using curl
   curl -X POST --data '{"jsonrpc":"2.0","method":"eth_getBalance","params":["YOUR_WALLET_ADDRESS", "latest"],"id":1}' \
     -H "Content-Type: application/json" https://sepolia.infura.io/v3/YOUR_INFURA_KEY
   
   # Or using Etherscan
   # Visit https://sepolia.etherscan.io/address/YOUR_WALLET_ADDRESS
   ```

4. You need at least 0.1 Sepolia ETH for deploying the contract.

### Infrastructure Provisioning

The infrastructure is defined as code using Terraform:

1. Update variables in `terraform/terraform.tfvars`
2. Initialize and apply the Terraform configuration:
   ```bash
   cd terraform
   terraform init
   terraform apply
   ```

### CI/CD Pipeline

The GitHub Actions workflow in `.github/workflows/ci.yaml` handles:

1. Building and compiling the smart contracts
2. Building the Geth Docker image
3. Pushing the image to GCP Artifact Registry
4. Deploying to GKE using Helm
5. Deploying the smart contract (in production environment)

You can also trigger the workflow manually and select the deployment environment (dev, staging, prod).

## Helm Chart Deployment

This project includes a Helm chart for more flexible Kubernetes deployments.

### Installing the Helm Chart

1. Customize the values in `charts/erc20-geth/values.yaml` if needed
2. Install the chart:
   ```bash
   helm install erc20-geth ./charts/erc20-geth
   ```

Alternatively, use the provided deployment script:
```bash
./deploy-helm.sh
```

The script supports the following options:
- `-r, --release-name`: Set the release name (default: erc20-geth)
- `-n, --namespace`: Set the Kubernetes namespace (default: default)
- `-f, --values`: Specify a custom values file

### Accessing the Geth Node

After deploying with Helm, access the Geth node using port forwarding:
```bash
kubectl port-forward service/erc20-geth 8545:8545
kubectl port-forward service/erc20-geth 8546:8546
```

See the Helm chart README (`charts/erc20-geth/README.md`) for detailed configuration options.

## Architecture

### Smart Contract

The ERC-20 token contract (`SimpleToken.sol`) is built using OpenZeppelin libraries and includes:
- Standard ERC-20 functionality
- Minting capability (owner only)
- Configurable token parameters (name, symbol, decimals, initial supply)

### Infrastructure

- **Development**: Docker Compose with Geth in dev mode
- **Production**: GKE with:
  - Standard GKE cluster with workload identity
  - Persistent volumes for blockchain data
  - Geth node configured for Sepolia testnet
  - GitHub Actions CI/CD pipeline using GCP Workload Identity Federation
  - Automated Helm chart deployment

### Security

The infrastructure follows security best practices:
- Minimal IAM permissions using the principle of least privilege
- Workload Identity Federation for secure CI/CD authentication
- Private GKE cluster with authorized networks
- Network policies enabled

## Testing Your Deployment

After successfully deploying the infrastructure with Terraform and running the CI/CD pipeline, follow these steps to test your ERC-20 token deployment:

### Accessing Your GKE Cluster

First, set up your local environment to access the GKE cluster:

```bash
# Configure kubectl to use your GKE cluster
gcloud container clusters get-credentials erc-20 --region europe-west1 --project play-project-325908

# Verify connection to the cluster
kubectl get nodes
```

### Verify Deployment Status

Check that all components are deployed and running:

```bash
kubectl get pods -n erc20
kubectl get services -n erc20
kubectl get deployments -n erc20
```

Ensure all pods are in the `Running` state and the service is available.

### Examine Deployment Details

```bash
# Check deployment details
kubectl describe deployment erc20-geth -n erc20

# Check service details
kubectl describe service erc20-geth -n erc20

# Check logs from the Geth node
kubectl logs deployment/erc20-geth -n erc20
```

### Access Your Geth Node

Set up port forwarding to access your deployed Geth node:

```bash
kubectl port-forward service/erc20-geth 8545:8545 -n erc20
```

Keep this terminal open while testing. In a new terminal, you can now interact with your Geth node as if it were running locally:

```bash
# Check block number
curl -X POST --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  -H "Content-Type: application/json" http://localhost:8545
```

### Check Contract Deployment

To find the address of your deployed token contract:

```bash
# Check logs for deployment information
kubectl logs deployment/erc20-geth -n erc20 | grep "Token deployed to"

# Alternatively, check recent transactions
curl -X POST --data '{"jsonrpc":"2.0","method":"eth_getBlockByNumber","params":["latest", true],"id":1}' \
  -H "Content-Type: application/json" http://localhost:8545
```

### Test Your Token on GKE

Once you have the contract address from the logs, you can test it using your scripts:

```bash
# Check token balance
ADDRESS=0xYourAddress TOKEN_ADDRESS=0xContractAddress npx hardhat run scripts/check-balance.js --network sepolia

# Transfer tokens
RECIPIENT_ADDRESS=0xRecipientAddress AMOUNT=100 TOKEN_ADDRESS=0xContractAddress npx hardhat run scripts/transfer-tokens.js --network sepolia
```

### Using K9s (Optional)

For a more interactive experience, you can use K9s, a terminal-based UI for Kubernetes:

```bash
# Install K9s (if not already installed)
brew install k9s

# Launch K9s and navigate to the erc20 namespace
k9s -n erc20
```

### Cleaning Up Resources

When you're done testing, you can clean up resources:

```bash
# Delete the port-forwarding process
# (Press Ctrl+C in the terminal where port-forwarding is running)

# Optionally, scale down the deployment when not in use to save resources
kubectl scale deployment erc20-geth --replicas=0 -n erc20

# To scale it back up when needed
kubectl scale deployment erc20-geth --replicas=1 -n erc20
```

### Troubleshooting Common Issues

If you encounter issues:

- **Pod not starting**: Check events with `kubectl describe pod <pod-name> -n erc20`
- **Cannot connect to RPC**: Ensure port forwarding is active and the service is running
- **MetaMask connection error**: Verify the RPC URL and chain ID are correct
- **Transaction failures**: Check if your account has enough ETH for gas
