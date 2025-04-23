const { ethers } = require("hardhat");

async function main() {
  const [account] = await ethers.getSigners();
  const tokenAddress = "0x89B3b961059AeF468455C0d0dd43932495b09cD7";
  
  // Get the SimpleToken contract instance
  const SimpleToken = await ethers.getContractFactory("SimpleToken");
  const token = SimpleToken.attach(tokenAddress);
  
  // Get token details
  const name = await token.name();
  const symbol = await token.symbol();
  const decimals = await token.decimals();
  
  // Get token balance
  const balance = await token.balanceOf(account.address);
  const formattedBalance = ethers.formatUnits(balance, decimals);
  
  console.log(`Token: ${name} (${symbol})`);
  console.log(`Address: ${tokenAddress}`);
  console.log(`Account: ${account.address}`);
  console.log(`Balance: ${formattedBalance} ${symbol}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 