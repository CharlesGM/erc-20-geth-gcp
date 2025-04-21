# ERC-20 Token on GKE with Geth

This project demonstrates how to deploy an ERC-20 token contract on Ethereum and run a Geth node on Google Kubernetes Engine (GKE). It includes complete deployment pipelines using GitHub Actions and integration with MetaMask for testing.

## Table of Contents
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Connecting with MetaMask](#connecting-with-metamask)
- [Deploying to GKE](#deploying-to-gke)
- [Helm Chart Deployment](#helm-chart-deployment)
- [Architecture](#architecture)
- [Testing Your Deployment](#testing-your-deployment)

## Project Structure

- `contracts/` - Solidity smart contracts
  - `SimpleToken.sol` - ERC-20 token implementation using OpenZeppelin
- `scripts/` - Deployment and utility scripts
  - `deploy.js` - Script to deploy the token contract with configurable parameters
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
npm run deploy:local
```

The script will:
1. Connect to the local Geth node
2. Use a pre-funded development account to deploy the contract (NOT your MetaMask wallet)
3. Output the contract address and token details

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
- The deployer account holds all tokens initially
- You can create a script to transfer tokens to your MetaMask address
- Use a faucet script to transfer ETH from local dev accounts to your MetaMask wallet

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

### Verify Deployment Status

Check that all components are deployed and running:

```bash
kubectl get pods -n erc20
kubectl get services -n erc20
```

Ensure all pods are in the `Running` state and the service is available.

### Access Your Geth Node

Set up port forwarding to access your deployed Geth node:

```bash
kubectl port-forward service/erc20-geth 8545:8545 -n erc20
```

Keep this terminal open while testing.

### Check Node Synchronization

Verify your node is operational by checking the current block number:

```bash
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  http://localhost:8545
```

### Configure MetaMask

1. Open MetaMask
2. Add a new network with the following details:
   - Network Name: `GKE Geth`
   - RPC URL: `http://localhost:8545`
   - Chain ID: 
     - `1337` (for dev environment)
     - `11155111` (for Sepolia testnet)
   - Currency: `ETH`

### Verify Your Token Contract

1. Find the deployed contract address in the CI logs or by checking:
   ```bash
   kubectl logs deployment/erc20-geth -n erc20 | grep "Contract deployed to"
   ```

2. In MetaMask:
   - Click "Import tokens"
   - Enter the contract address
   - The token symbol and decimals should auto-fill
   - Confirm you have the expected token balance

### Test Token Functionality

1. Send a small amount of tokens to another account
2. Verify the transaction was successful and balances updated correctly
3. Check that the token implements the ERC-20 standard functions correctly

### Monitor Logs

Keep an eye on your node's logs to ensure everything is operating correctly:

```bash
kubectl logs deployment/erc20-geth -n erc20 -f
```

### Troubleshooting Common Issues

If you encounter issues:

- **Pod not starting**: Check events with `kubectl describe pod <pod-name> -n erc20`
- **Cannot connect to RPC**: Ensure port forwarding is active and the service is running
- **MetaMask connection error**: Verify the RPC URL and chain ID are correct
- **Transaction failures**: Check if your account has enough ETH for gas
