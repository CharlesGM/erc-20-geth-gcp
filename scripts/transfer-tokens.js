const { ethers } = require("hardhat");

async function main() {
  // Get the recipient address from environment variable
  const recipientAddress = process.env.RECIPIENT_ADDRESS;
  
  // Get amount from environment variable, default to 1000 tokens
  const amount = process.env.AMOUNT ? parseFloat(process.env.AMOUNT) : 1000;
  
  // Get token address from environment variable
  const tokenAddress = process.env.TOKEN_ADDRESS;
  
  if (!recipientAddress || !ethers.isAddress(recipientAddress)) {
    console.error("Please provide a valid recipient Ethereum address");
    console.error("Usage: RECIPIENT_ADDRESS=0x... [AMOUNT=1000] TOKEN_ADDRESS=0x... npx hardhat run scripts/transfer-tokens.js --network <network>");
    process.exit(1);
  }
  
  if (!tokenAddress || !ethers.isAddress(tokenAddress)) {
    console.error("Please provide a valid token contract address");
    console.error("Usage: RECIPIENT_ADDRESS=0x... [AMOUNT=1000] TOKEN_ADDRESS=0x... npx hardhat run scripts/transfer-tokens.js --network <network>");
    process.exit(1);
  }
  
  try {
    const [sender] = await ethers.getSigners();
    console.log("Sender account:", sender.address);
    console.log("Recipient account:", recipientAddress);
    console.log("Token contract address:", tokenAddress);
    
    // Get the SimpleToken contract instance
    const SimpleToken = await ethers.getContractFactory("SimpleToken");
    const token = SimpleToken.attach(tokenAddress);
    
    // Get token details
    const name = await token.name();
    const symbol = await token.symbol();
    const decimals = await token.decimals();
    
    // Format the amount with proper decimals
    const amountToSend = ethers.parseUnits(amount.toString(), decimals);
    
    // Check sender balance
    const senderBalance = await token.balanceOf(sender.address);
    const formattedSenderBalance = ethers.formatUnits(senderBalance, decimals);
    console.log(`Sender balance before transfer: ${formattedSenderBalance} ${symbol}`);
    
    if (senderBalance < amountToSend) {
      console.error(`Insufficient balance. You have ${formattedSenderBalance} ${symbol} but trying to send ${amount} ${symbol}`);
      process.exit(1);
    }
    
    console.log(`Transferring ${amount} ${symbol} to ${recipientAddress}...`);
    
    // Send tokens
    const tx = await token.transfer(recipientAddress, amountToSend);
    console.log("Transaction hash:", tx.hash);
    console.log("Waiting for transaction confirmation...");
    await tx.wait();
    
    // Get updated balances
    const newSenderBalance = await token.balanceOf(sender.address);
    const formattedNewSenderBalance = ethers.formatUnits(newSenderBalance, decimals);
    
    const recipientBalance = await token.balanceOf(recipientAddress);
    const formattedRecipientBalance = ethers.formatUnits(recipientBalance, decimals);
    
    console.log(`Transfer complete!`);
    console.log(`Sender balance after transfer: ${formattedNewSenderBalance} ${symbol}`);
    console.log(`Recipient balance after transfer: ${formattedRecipientBalance} ${symbol}`);
    console.log("");
    console.log("MetaMask Import Instructions:");
    console.log("--------------------------");
    console.log("1. Open MetaMask");
    console.log("2. Click 'Import tokens'");
    console.log(`3. Enter the contract address: ${tokenAddress}`);
    console.log(`4. Token Symbol: ${symbol}`);
    console.log(`5. Decimals: ${decimals}`);
    console.log("6. Click 'Import'");
  } catch (error) {
    console.error("Error transferring tokens:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 