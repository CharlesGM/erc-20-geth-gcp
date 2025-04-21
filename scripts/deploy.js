const { ethers } = require("hardhat");

// Simple delay function
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  try {
    const [deployer] = await ethers.getSigners();
    
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

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
      deployer.address
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
      console.log("Token deployed to:", await token.getAddress());
      console.log(`Token Name: ${tokenName}`);
      console.log(`Token Symbol: ${tokenSymbol}`);
      console.log(`Token Decimals: ${tokenDecimals}`);
      console.log(`Initial Supply: ${initialSupply} ${tokenSymbol}`);
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