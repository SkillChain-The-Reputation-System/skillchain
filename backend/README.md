# SkillChain Backend

This package contains the smart contracts and deployment scripts with **dual-network support** for both localhost and Polygon Amoy testnet.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file in the backend root directory and provide your configuration:

```bash
# Polygon Amoy Testnet Configuration
AMOY_RPC_URL=https://polygon-amoy.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY
PRIVATE_KEY=your_wallet_private_key_here
CHAIN_ID=80002

# Optional: For custom gas settings on Amoy
# GAS_LIMIT=2100000
# GAS_PRICE=30000000000
```

**Required environment variables:**
- `AMOY_RPC_URL`: Polygon Amoy RPC URL (get from [Alchemy](https://www.alchemy.com/) or [QuickNode](https://www.quicknode.com/))
- `PRIVATE_KEY`: Your wallet private key for deployment (ensure it has MATIC for gas fees)
- `CHAIN_ID`: Optional, defaults to 80002 for Amoy testnet

**⚠️ Security Note:** Never commit your `.env` file to version control. It contains sensitive private keys.

## � Prerequisites for Amoy Deployment

Before deploying to Polygon Amoy testnet, ensure:

1. **Get Test MATIC**: Your wallet needs MATIC tokens for gas fees
   - Visit [Polygon Faucet](https://faucet.polygon.technology/)
   - Select "Polygon Amoy" network
   - Enter your wallet address
   - Request test MATIC tokens

2. **Add Amoy Network to MetaMask** (if using MetaMask):
   - Network Name: Polygon Amoy
   - RPC URL: https://rpc-amoy.polygon.technology/
   - Chain ID: 80002
   - Currency Symbol: MATIC
   - Block Explorer: https://amoy.polygonscan.com/

## �📋 Deployment Commands

### Deploy to Localhost (Development)
```bash
# Terminal 1: Start Hardhat node
npx hardhat node

# Terminal 2: Deploy contracts
npm run deploy:local
```

### Deploy to Polygon Amoy (Production)
```bash
npm run deploy:amoy
```

### Additional Utility Commands
```bash
# Regenerate frontend config only (after deployment)
npm run regenerate:config

# Clean Amoy deployment state (if deployment fails)
npm run clean:amoy

# Check nonce status on Amoy (for debugging)
npm run check:nonce:amoy
```

## 🌐 Comprehensive Deployment Guide

### Smart Contracts Overview

The SkillChain backend deploys the following contracts in sequence:

1. **Libraries** - Core mathematical and utility functions
2. **RoleManager** - Manages user roles and permissions
3. **UserDataManager** - Handles user profile data
4. **ReputationManager** - Core reputation calculation system
5. **JobManager** - Job posting and management
6. **JobApplicationManager** - Job application workflow
7. **ChallengeManager** - Challenge creation and management
8. **SolutionManager** - Solution submission and evaluation
9. **ChallengeCostManager** - Challenge cost calculations
10. **MeetingManager** - Meeting scheduling and management
11. **RecruiterDataManager** - Recruiter-specific data
12. **RecruiterSubscription** - Subscription management
13. **ModerationEscrow** - Escrow system for moderation

### Deployment Process

The deployment script (`scripts/deploy_and_copy.ts`) performs the following steps:

1. **Pre-deployment checks**:
   - Validates environment variables
   - Checks nonce synchronization (Amoy only)
   - Cleans incomplete deployment states

2. **Contract deployment**:
   - Deploys contracts in batches (smaller batches for Amoy to avoid nonce conflicts)
   - Automatically retries failed deployments on Amoy
   - Adds delays between deployments for network stability

3. **Post-deployment tasks**:
   - Copies contract ABIs to frontend
   - Generates dual-network configuration file
   - Updates frontend with contract addresses

### Network-Specific Configurations

#### Localhost Development
- **Chain ID**: 31337
- **RPC URL**: http://127.0.0.1:8545
- **Gas Settings**: Default Hardhat settings
- **Deployment Strategy**: All contracts deployed simultaneously

#### Polygon Amoy Testnet
- **Chain ID**: 80002
- **RPC URL**: From environment variable `AMOY_RPC_URL`
- **Gas Limit**: 2,100,000
- **Gas Price**: 30 Gwei
- **Deployment Strategy**: Batched deployment with retry logic
- **Special Features**:
  - Nonce conflict prevention
  - Automatic retry on deployment failures
  - Network stability delays between batches

## 🔧 Troubleshooting Common Issues

### 1. Deployment Failures on Amoy

**Issue**: Contract deployment fails with nonce errors
```bash
Error: nonce has already been used
```

**Solution**:
```bash
# Clean deployment state and retry
npm run clean:amoy
npm run deploy:amoy
```

### 2. Gas Estimation Failures

**Issue**: Gas estimation fails or transactions revert
```bash
Error: gas required exceeds allowance
```

**Solutions**:
- Ensure your wallet has sufficient MATIC tokens
- Check if RPC endpoint is responsive
- Try increasing gas limit in `hardhat.config.ts`

### 3. RPC Connection Issues

**Issue**: Connection timeout or RPC errors
```bash
Error: timeout of 120000ms exceeded
```

**Solutions**:
- Verify your `AMOY_RPC_URL` is correct
- Try a different RPC provider (Alchemy, QuickNode, Polygon public RPC)
- Check internet connection

### 4. Private Key Issues

**Issue**: Invalid private key or unauthorized transactions
```bash
Error: invalid sender or unauthorized
```

**Solutions**:
- Ensure private key is correctly formatted (64 hex characters)
- Verify the wallet has MATIC for gas fees
- Double-check the private key matches the intended wallet

### 5. Frontend Configuration Issues

**Issue**: Frontend can't connect to deployed contracts

**Solutions**:
```bash
# Regenerate frontend configuration
npm run regenerate:config
```

## 🛠️ Advanced Configuration

### Custom Gas Settings

You can customize gas settings for Amoy deployment by modifying `hardhat.config.ts`:

```typescript
amoy: {
  // ... other settings
  gas: 3000000,        // Increase gas limit
  gasPrice: 50000000000, // 50 Gwei
  timeout: 180000,     // 3 minutes timeout
}
```

### Batch Size Configuration

For networks with strict rate limiting, you can adjust batch size in `deploy_and_copy.ts`:

```typescript
// Smaller batches for slower networks
const batchSize = NETWORK === "amoy" ? 2 : moduleFiles.length;
```

### Environment-Specific Deployment

You can create environment-specific configurations:

```bash
# Deploy with custom chain ID
CHAIN_ID=80001 npm run deploy:amoy

# Deploy with specific network name
NETWORK=mumbai npm run deploy:amoy
```

## � Development Workflow & Best Practices

### Recommended Development Flow

1. **Local Development & Testing**:
   ```bash
   # Terminal 1: Start local blockchain
   npx hardhat node
   
   # Terminal 2: Deploy to localhost
   npm run deploy:local
   
   # Test your contracts locally
   npx hardhat test
   ```

2. **Deploy to Amoy Testnet**:
   ```bash
   # Deploy to testnet
   npm run deploy:amoy
   
   # Verify deployment was successful
   npm run check:nonce:amoy
   ```

3. **Update Frontend Configuration**:
   ```bash
   # Regenerate config if needed
   npm run regenerate:config
   ```

### Data Seeding (Development Only)

After deploying to localhost, you can seed test data:

```bash
# Seed test challenges
npm run seed:challenge:local

# Seed pending challenges
npm run seed:pending:challenge:local

# Seed moderator reviews
npm run seed:moderator:review:local

# Seed test jobs
npm run seed:jobs

# Grant roles to test accounts
npm run grant:role

# Adjust reputation scores
npm run adjust:reputation
```

### File Structure After Deployment

```
backend/
├── .env                      # Environment variables (keep secret!)
├── hardhat.config.ts         # Network configurations
├── package.json              # Scripts and dependencies
├── contracts/                # Solidity smart contracts
├── ignition/
│   ├── modules/              # Deployment modules
│   └── deployments/
│       ├── chain-31337/      # Localhost deployment artifacts
│       │   ├── deployed_addresses.json
│       │   └── journal.jsonl
│       └── chain-80002/      # Amoy deployment artifacts
│           ├── deployed_addresses.json
│           └── journal.jsonl
├── scripts/                  # Deployment and utility scripts
└── artifacts/                # Compiled contract artifacts

frontend/src/constants/
├── contracts-config.ts       # Auto-generated dual-network config
└── contract-artifacts/       # Contract ABIs for frontend
    ├── RoleManager.json
    ├── UserDataManager.json
    ├── ReputationManager.json
    └── ... (all contract ABIs)
```

## 🌐 Dual-Network Configuration

The deployment script automatically generates a **smart contract configuration** that works with both networks:

- **Development**: Uses localhost Hardhat addresses
- **Production**: Uses Polygon Amoy addresses  
- **Automatic Switching**: Frontend detects environment and uses correct addresses

### How Network Detection Works

The frontend automatically detects which network to use based on:

1. **NODE_ENV environment variable**:
   - `NODE_ENV=production` → Uses Amoy testnet
   - `NODE_ENV=development` → Uses localhost

2. **Manual override**:
   - `NEXT_PUBLIC_USE_AMOY=true` → Forces Amoy testnet usage

3. **Fallback logic**:
   - If contracts aren't deployed to detected network, shows warning
   - Provides clear error messages for missing deployments

### Configuration File Structure

The auto-generated `contracts-config.ts` includes:

```typescript
// Network detection
const isProduction = process.env.NODE_ENV === 'production';
const useAmoyNetwork = isProduction || process.env.NEXT_PUBLIC_USE_AMOY === 'true';

// Contract addresses for both networks
const LOCALHOST_ADDRESSES = { /* ... */ };
const AMOY_ADDRESSES = { /* ... */ };

// Smart contract configurations
export const ContractConfig_RoleManager = {
  get address() {
    return getContractAddress('RoleManager');
  },
  abi: RoleManagerArtifact.abi,
};

// Network information
export const NETWORK_INFO = {
  useAmoyNetwork,
  isProduction,
  currentNetwork: useAmoyNetwork ? 'Polygon Amoy (Chain ID: 80002)' : 'Localhost Hardhat (Chain ID: 31337)',
  // ...
};
```

## 📚 Additional Resources

### Useful Links

- **Polygon Amoy Testnet**:
  - [Block Explorer](https://amoy.polygonscan.com/)
  - [Faucet](https://faucet.polygon.technology/)
  - [RPC Endpoints](https://wiki.polygon.technology/docs/pos/reference/rpc-endpoints/)

- **Development Tools**:
  - [Hardhat Documentation](https://hardhat.org/docs)
  - [Hardhat Ignition](https://hardhat.org/ignition/docs/getting-started)
  - [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)

### Smart Contract Architecture

The SkillChain contracts follow a modular architecture:

- **Role-based access control** using OpenZeppelin's AccessControl
- **Upgradeable contracts** for future improvements
- **Event-driven design** for frontend integration
- **Gas optimization** through efficient data structures
- **Security patterns** including checks-effects-interactions

### Security Considerations

1. **Private Key Management**:
   - Never hardcode private keys in source code
   - Use environment variables for sensitive data
   - Consider using hardware wallets for production

2. **Contract Verification**:
   - Verify contracts on Polygonscan after deployment
   - Use consistent compiler settings
   - Document all contract interactions

3. **Gas Optimization**:
   - Monitor gas usage during deployment
   - Use events for data that doesn't need on-chain storage
   - Implement proper access controls
