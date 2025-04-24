require('dotenv').config();
const { ethers } = require('hardhat');
const fs = require('fs');

async function main() {
  try {
    // Get the signer
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with address:", deployer.address);
    
    // Check ETH balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH");
    
    if (balance < ethers.parseEther("0.01")) {
      console.warn("WARNING: Low balance for deployment. You need at least 0.01 ETH for deployment.");
      console.warn("Get Sepolia ETH from a faucet before deploying.");
      process.exit(1);
    }
    
    // Network check
    const network = await ethers.provider.getNetwork();
    console.log("Network:", network.name);
    console.log("Chain ID:", network.chainId);
    
    const blockNumber = await ethers.provider.getBlockNumber();
    console.log("Current block number:", blockNumber);
    
    // Deploy the token contract
    console.log("\nDeploying SimpleToken contract...");
    const SimpleToken = await ethers.getContractFactory("SimpleToken");
    
    // Token parameters
    const tokenName = "My Sepolia Token";
    const tokenSymbol = "MST";
    const tokenDecimals = 18;
    const initialSupply = 1000000; // 1 million tokens
    
    const token = await SimpleToken.deploy(
      tokenName,
      tokenSymbol,
      tokenDecimals,
      initialSupply,
      deployer.address
    );
    
    console.log("Transaction sent. Waiting for confirmation...");
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();
    
    console.log("\nToken deployed to:", tokenAddress);
    
    // Save deployment information
    const deploymentInfo = {
      network: "Sepolia",
      chainId: network.chainId.toString(),
      contractAddress: tokenAddress,
      tokenName: tokenName,
      tokenSymbol: tokenSymbol,
      tokenDecimals: tokenDecimals,
      initialSupply: initialSupply.toString(),
      deployerAddress: deployer.address,
      deploymentTime: new Date().toISOString(),
      blockNumber: blockNumber.toString()
    };
    
    const deploymentFile = 'sepolia-deployment.json';
    fs.writeFileSync(
      deploymentFile,
      JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log(`Deployment information saved to ${deploymentFile}`);
    
    // Etherscan verification instructions
    console.log("\n--------------------------");
    console.log("NEXT STEPS:");
    console.log("--------------------------");
    console.log("1. Verify your contract on Etherscan:");
    console.log(`   npx hardhat verify --network sepolia ${tokenAddress} "${tokenName}" "${tokenSymbol}" ${tokenDecimals} ${initialSupply} ${deployer.address}`);
    console.log("\n2. Import the token in MetaMask:");
    console.log("   - Network: Sepolia");
    console.log(`   - Token Address: ${tokenAddress}`);
    console.log(`   - Token Symbol: ${tokenSymbol}`);
    console.log(`   - Decimals: ${tokenDecimals}`);
    console.log("--------------------------");

  } catch (error) {
    console.error("Error during deployment:", error.message);
    // Log more details if it's a transaction error
    if (error.transaction) {
      console.error("Transaction hash:", error.transaction.hash);
      console.error("From:", error.transaction.from);
      console.error("To:", error.transaction.to || "contract creation");
      console.error("Gas limit:", error.transaction.gasLimit.toString());
      console.error("Gas price:", ethers.formatUnits(error.transaction.gasPrice || 0, "gwei"), "gwei");
    }
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 