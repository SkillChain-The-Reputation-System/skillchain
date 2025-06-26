# SkillChain - Decentralized Skills Assessment & Job Matching Platform

<div align="center">
  <img src="./frontend/public/favicon.ico" alt="SkillChain Logo" width="100" height="100">
  
  **A blockchain-based reputation system for skill assessment and job matching**
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Next.js](https://img.shields.io/badge/Next.js-15.2.3-black)](https://nextjs.org/)
  [![Hardhat](https://img.shields.io/badge/Hardhat-2.22.19-yellow)](https://hardhat.org/)
  [![Polygon](https://img.shields.io/badge/Polygon-Amoy%20Testnet-purple)](https://polygon.technology/)
</div>

## 🌟 Overview

SkillChain is a revolutionary decentralized platform that transforms how skills are assessed and jobs are matched. By leveraging blockchain technology, we create a transparent, immutable reputation system that connects job seekers with employers based on verified skills and achievements.

### Key Features

- **🔐 Decentralized Identity**: Wallet-based authentication with blockchain identity
- **🏆 Reputation System**: Immutable skill verification and reputation tracking
- **💼 Smart Job Matching**: AI-powered recommendations based on blockchain reputation
- **🎯 Skills Assessment**: Interactive challenges with peer review mechanisms
- **🤝 Video Interviews**: Integrated Jitsi Meet for seamless remote interviews
- **💰 Tokenized Economy**: Reward system for participation and quality contributions
- **🛡️ Secure Escrow**: Smart contract-based payment protection
- **📊 Analytics Dashboard**: Comprehensive insights for users and recruiters

## 🏗️ Architecture

SkillChain consists of two main components:

### Frontend (Next.js)
- **Modern Web3 Interface**: Built with Next.js 15 and TypeScript
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Wallet Integration**: ConnectKit for seamless Web3 wallet connections
- **Real-time Updates**: TanStack Query for optimized data fetching
- **Rich UI Components**: Radix UI primitives with shadcn/ui design system

### Backend (Smart Contracts)
- **Solidity Contracts**: Comprehensive smart contract system
- **Multi-Network Support**: Localhost development and Polygon Amoy testnet
- **Modular Architecture**: Separate contracts for different functionalities
- **Security Focused**: OpenZeppelin standards and comprehensive testing

## 📋 Smart Contracts

| Contract | Purpose |
|----------|---------|
| `UserDataManager` | User profile and data management |
| `ReputationManager` | Reputation scoring and tracking |
| `ChallengeManager` | Skills assessment challenges |
| `SolutionManager` | Challenge solution submissions |
| `JobManager` | Job posting and application management |
| `JobApplicationManager` | Application workflow management |
| `MeetingManager` | Interview scheduling and management |
| `RecruiterSubscription` | Subscription management for recruiters |
| `ModerationEscrow` | Payment escrow and dispute resolution |
| `RoleManager` | Access control and permissions |

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 18.17 or later
- **npm** or **yarn**: Package manager
- **Git**: Version control
- **MetaMask**: Or compatible Web3 wallet

### 1. Clone the Repository

```bash
git clone https://github.com/SkillChain-The-Reputation-System/SkillChain.git
cd SkillChain
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration
```

**Required Environment Variables:**
```env
# Polygon Amoy Testnet
AMOY_RPC_URL=https://polygon-amoy.g.alchemy.com/v2/YOUR_API_KEY
PRIVATE_KEY=your_wallet_private_key
CHAIN_ID=80002
```

**Deploy Smart Contracts:**
```bash
# Deploy to local network
npm run deploy:local

# Deploy to Polygon Amoy testnet
npm run deploy:amoy
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local with your configuration
```

**Required Environment Variables:**
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key
NEXT_PUBLIC_POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology/
```

**Start Development Server:**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🌐 Deployment

### Frontend Deployment (Vercel)

1. **Connect GitHub Repository** to Vercel
2. **Set Environment Variables** in Vercel dashboard
3. **Deploy** automatically on push to main branch

```bash
# Manual deployment
npm run deploy

# Preview deployment
npm run deploy:preview
```

### Backend Deployment (Polygon Amoy)

```bash
# Deploy contracts to Amoy testnet
npm run deploy:amoy

# Configure system after deployment
npm run configure:amoy
```

**Get Test MATIC:**
- Visit [Polygon Faucet](https://faucet.polygon.technology/)
- Select "Polygon Amoy" network
- Request test tokens for your wallet

## 🧪 Testing

### Smart Contract Tests

```bash
cd backend
npx hardhat test
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 📚 Documentation

### API Documentation
- [Smart Contract API](./backend/README.md)
- [Frontend API](./frontend/README.md)

### User Guides
- [User Manual](./docs/USER_GUIDE.md)
- [Recruiter Guide](./docs/RECRUITER_GUIDE.md)
- [Developer Guide](./docs/DEVELOPER_GUIDE.md)

## 🛠️ Development

### Project Structure

```
SkillChain/
├── backend/                 # Smart contracts and deployment
│   ├── contracts/          # Solidity smart contracts
│   ├── scripts/           # Deployment and utility scripts
│   ├── test/              # Contract tests
│   └── ignition/          # Hardhat Ignition modules
├── frontend/               # Next.js web application
│   ├── src/app/           # App Router pages
│   ├── src/components/    # Reusable UI components
│   ├── src/features/      # Feature-based modules
│   └── public/            # Static assets
└── docs/                  # Documentation
```

### Available Commands

**Backend:**
```bash
npm run deploy:local      # Deploy to localhost
npm run deploy:amoy       # Deploy to Amoy testnet
npm run configure:local   # Configure local deployment
npm run configure:amoy    # Configure Amoy deployment
npm run seed:jobs         # Seed test job data
```

**Frontend:**
```bash
npm run dev               # Development server
npm run build             # Production build
npm run test              # Run tests
npm run lint              # Code linting
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Add** tests for new functionality
5. **Ensure** all tests pass
6. **Submit** a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenZeppelin**: For secure smart contract libraries
- **Polygon**: For scalable blockchain infrastructure
- **Next.js**: For the powerful React framework
- **Vercel**: For seamless deployment platform
- **The Community**: For feedback and contributions

---

<div align="center">
  Made with ❤️ by the SkillChain Team
  
  **Authors**: Nguyen Hai Tuyen, Tran Minh Dat
</div>
