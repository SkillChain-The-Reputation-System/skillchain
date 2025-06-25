import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.26",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true, // Enable IR-based compilation to resolves stack too deep errors
    },
  },  
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },    amoy: {
      url: process.env.AMOY_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: Number(process.env.CHAIN_ID) || 80002,
      timeout: 120000, // Increased to 120 seconds
      httpHeaders: {},
      gas: 2100000,
      gasPrice: 30000000000, // 30 gwei
    },
  },
};

export default config;
