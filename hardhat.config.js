require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY || "";
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";

// Get user private key from environment variable
const USER_PRIVATE_KEY = process.env.USER_PRIVATE_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: USER_PRIVATE_KEY ? [USER_PRIVATE_KEY] : (SEPOLIA_PRIVATE_KEY ? [SEPOLIA_PRIVATE_KEY] : []),
      chainId: 11155111
    },
    "sepolia-fork": {
      url: "http://127.0.0.1:8545",
      chainId: 11155111, // Sepolia chain ID
      accounts: USER_PRIVATE_KEY ? [USER_PRIVATE_KEY] : [],
      timeout: 60000, // 60 seconds
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts: USER_PRIVATE_KEY ? [USER_PRIVATE_KEY] : [],
      timeout: 60000, // 60 seconds
      gas: 5000000,
      gasPrice: 8000000000, // 8 gwei
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
}; 