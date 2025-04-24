require('dotenv').config();
const { ethers } = require('hardhat');

async function main() {
  // Get private key from .env file
  const privateKey = process.env.SEPOLIA_PRIVATE_KEY;
  
  if (!privateKey) {
    console.error("Error: SEPOLIA_PRIVATE_KEY not found in .env file");
    process.exit(1);
  }
  
  try {
    // Create wallet from private key
    const wallet = new ethers.Wallet(privateKey);
    console.log("Wallet address:", wallet.address);
    
    // Connect to Sepolia provider
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/");
    const connectedWallet = wallet.connect(provider);
    
    // Get wallet balance
    const balance = await provider.getBalance(wallet.address);
    const balanceInEth = ethers.formatEther(balance);
    
    console.log("Sepolia ETH Balance:", balanceInEth, "ETH");
    
    // Check if balance is sufficient
    if (balance < ethers.parseEther("0.1")) {
      console.log("\nWARNING: Wallet has insufficient funds for contract deployment.");
      console.log("You need at least 0.1 Sepolia ETH to deploy the contract.");
      console.log("\nPlease visit one of these faucets to get Sepolia ETH:");
      console.log("- https://sepoliafaucet.com/");
      console.log("- https://www.infura.io/faucet/sepolia");
      console.log("- https://www.alchemy.com/faucets/ethereum-sepolia");
    } else {
      console.log("\nWallet has sufficient funds for contract deployment.");
    }
  } catch (error) {
    console.error("Error checking balance:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 