require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ignition-ethers");
require('dotenv').config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    fuji: {
      url: "https://ava-testnet.blastapi.io/4cd59212-8630-45fe-8bed-5966f323a83c/ext/bc/C/rpc",
      chainId: 43113,
      accounts: [PRIVATE_KEY],
    },
    baseSepolia: {
      url: "https://sepolia.base.org",
      chainId: 84532,
      accounts: [PRIVATE_KEY],
    }
  }
};
