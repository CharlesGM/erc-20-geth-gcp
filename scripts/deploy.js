const { ethers } = require("hardhat");

// Simple delay function
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  try {
    const [deployer] = await ethers.getSigners();
    
    // Get the recipient address from environment variable or use deployer
    const recipientAddress = process.env.RECIPIENT_ADDRESS || deployer.address;
    
    if (!ethers.isAddress(recipientAddress)) {
      console.error("Invalid recipient address");
      console.error("Set a valid Ethereum address in the RECIPIENT_ADDRESS environment variable");
      process.exit(1);
    }
    
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());
    console.log("Initial token holder will be:", recipientAddress);

    const tokenName = "My Simple Token";
    const tokenSymbol = "MST";
    const tokenDecimals = 18;
    const initialSupply = 1000000; // 1 million tokens

    const SimpleToken = await ethers.getContractFactory("SimpleToken");
    
    console.log("Deploying token contract...");
    const token = await SimpleToken.deploy(
      tokenName,
      tokenSymbol,
      tokenDecimals,
      initialSupply,
      recipientAddress // Use the provided address as the initial token holder and owner
    );
    
    console.log("Transaction sent, waiting for deployment. This may take a moment...");
    
    // Add a retry mechanism for waiting for deployment
    let retries = 5;
    let deployed = false;
    
    while (retries > 0 && !deployed) {
      try {
        await token.waitForDeployment();
        deployed = true;
      } catch (error) {
        console.log(`Waiting for deployment... (${retries} retries left)`);
        console.log("Error:", error.message);
        retries--;
        
        // Wait longer between retries
        await delay(10000); // 10 seconds
      }
    }
    
    if (deployed) {
      const tokenAddress = await token.getAddress();
      console.log("Token deployed to:", tokenAddress);
      console.log(`Token Name: ${tokenName}`);
      console.log(`Token Symbol: ${tokenSymbol}`);
      console.log(`Token Decimals: ${tokenDecimals}`);
      console.log(`Initial Supply: ${initialSupply} ${tokenSymbol}`);
      console.log("");
      console.log("MetaMask Import Instructions:");
      console.log("--------------------------");
      console.log("1. Open MetaMask");
      console.log("2. Click 'Import tokens'");
      console.log(`3. Enter the contract address: ${tokenAddress}`);
      console.log(`4. Token Symbol: ${tokenSymbol}`);
      console.log(`5. Decimals: ${tokenDecimals}`);
      console.log("6. Click 'Import'");
    } else {
      console.log("Failed to deploy after multiple attempts. The node might need more time to initialize.");
    }
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 