# ERC-20 Token on Google Kubernetes Engine

This project deploys an ERC-20 token using a Geth node running on Google Kubernetes Engine (GKE).

## Prerequisites

- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
- [kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl)
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/)

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file with your configuration:
   ```
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_API_KEY
   SEPOLIA_PRIVATE_KEY=your_private_key_here
   ```

3. Authenticate with Google Cloud and get GKE credentials:
   ```
   gcloud auth login
   gcloud container clusters get-credentials erc-20 --region europe-west1 --project play-project-325908
   ```

## Testing the GKE Deployment

### 1. Port-forward the Geth service

In one terminal, run:
```
kubectl port-forward service/erc20-erc20-geth 8545:8545 -n erc20
```

This will forward your local port 8545 to the Geth node running in the cluster.

### 2. Check your wallet balance

To check your wallet balance on the local Geth node:
```
npm run balance
```

### 3. Deploy and test the token

Deploy the ERC-20 token to the port-forwarded Geth node:
```
npm run test:gke
```

This will:
- Deploy the token contract to the Geth node
- Save deployment information to `deployment.json`
- Test basic token functionality
- Display instructions for importing the token into MetaMask

### 4. Check token balances

To check the token balance of an address:
```
npm run check:token
```

Or specify a token address and account:
```
npx hardhat run scripts/check-token-balance.js <tokenAddress> <accountAddress> --network localhost
```

## Interacting with the Token in MetaMask

1. Open MetaMask and add a new network:
   - Network Name: GKE Geth
   - RPC URL: http://localhost:8545
   - Chain ID: 1337
   - Currency Symbol: ETH

2. Import the token:
   - Click "Import Tokens"
   - Enter the token address from `deployment.json`
   - The token symbol and decimals should auto-populate

3. You can now send and receive tokens through MetaMask.

## Troubleshooting

- **Connection issues**: Ensure the port-forwarding is active in a separate terminal.
- **Insufficient funds**: The Geth node needs to have ETH in the test account to deploy contracts.
- **Deployment failures**: Check the Geth logs for more information:
  ```
  kubectl logs -f deployment/erc20-erc20-geth -n erc20
  ```

## CI/CD Pipeline

The project includes a GitHub Actions workflow that automatically:
1. Builds a Docker image with Geth
2. Deploys it to GKE
3. Deploys the ERC-20 token contract to the Sepolia network in production mode
