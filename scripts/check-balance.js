const { ethers } = require("hardhat");

async function main() {
  // Get the address from environment variable or use the first signer
  const [defaultAccount] = await ethers.getSigners();
  const address = process.env.ADDRESS || defaultAccount.address;
  
  // Get token address from environment variable
  const tokenAddress = process.env.TOKEN_ADDRESS;
  
  // Check ETH balance
  const ethBalance = await ethers.provider.getBalance(address);
  console.log("Account:", address);
  console.log("ETH Balance:", ethers.formatEther(ethBalance), "ETH");
  
  // Check token balance if token address is provided
  if (tokenAddress) {
    if (!ethers.isAddress(tokenAddress)) {
      console.error("Invalid token address provided");
      return;
    }
    
    try {
      // Get the token contract instance
      const SimpleToken = await ethers.getContractFactory("SimpleToken");
      const token = SimpleToken.attach(tokenAddress);
      
      // Get token details
      const name = await token.name();
      const symbol = await token.symbol();
      const decimals = await token.decimals();
      
      // Get token balance
      const balance = await token.balanceOf(address);
      const formattedBalance = ethers.formatUnits(balance, decimals);
      
      console.log(`Token: ${name} (${symbol})`);
      console.log(`Token Address: ${tokenAddress}`);
      console.log(`Token Balance: ${formattedBalance} ${symbol}`);
    } catch (error) {
      console.error("Error checking token balance:", error.message);
    }
  } else {
    console.log("No token address provided. To check token balance:");
    console.log("TOKEN_ADDRESS=0x... [ADDRESS=0x...] npx hardhat run scripts/check-balance.js --network <network>");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 