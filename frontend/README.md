# SkillChain Frontend

A decentralized skills assessment and job matching platform built on blockchain technology. This Next.js application provides a modern, secure interface for connecting job seekers with employers through blockchain-based reputation systems.

## 🌟 Features

- **Wallet-Based Authentication**: Secure login with MetaMask and other Web3 wallets
- **Decentralized Identity**: Blockchain-based user profiles and reputation management
- **Skills Assessment Platform**: Interactive challenges and peer reviews
- **Job Matching System**: AI-powered job recommendations based on blockchain reputation
- **Video Conferencing**: Integrated Jitsi Meet for remote interviews
- **Real-time Notifications**: Toast notifications for blockchain transactions
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Rich Text Editor**: TipTap-based editor for job descriptions and challenges


## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v4 with custom animations
- **UI Components**: Radix UI primitives with shadcn/ui
- **Blockchain**: Wagmi + Viem for Ethereum interactions
- **Wallet Connection**: ConnectKit for seamless wallet integration
- **State Management**: TanStack Query for server state
- **Forms**: React Hook Form with Zod validation
- **Rich Text**: TipTap editor with extensions
- **Video Calls**: Jitsi Meet React SDK
- **Testing**: Jest with React Testing Library
- **TypeScript**: Full type safety throughout

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn package manager
- MetaMask or compatible Web3 wallet

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd skillchain/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the root directory and add:
   ```env
   # Wallet Connect
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

   # Blockchain RPC
   NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
   NEXT_PUBLIC_POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology/

   # Jitsi Meet (Optional)
   NEXT_PUBLIC_JAAS_API_KEY=your_jitsi_api_key

   # Smart Contract Deployment
   SKILLCHAIN_WALLET_PRIVATE_KEY=your_private_key
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run dev:turbo` - Start development server with Turbo mode
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run Jest tests
- `npm run deploy` - Deploy to Vercel production
- `npm run deploy:preview` - Deploy to Vercel preview

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Main application dashboard
│   ├── signin/           # Wallet connection page
│   └── layout.tsx        # Root layout
├── components/            # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   └── custom/          # Project-specific components
├── features/             # Feature-based modules
│   ├── auth/            # Authentication logic
│   ├── jobs/            # Job management
│   ├── challenges/      # Skills assessment
│   └── reputation/      # Reputation system
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── contexts/            # React contexts
└── constants/           # Application constants
```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID | Yes |
| `NEXT_PUBLIC_ALCHEMY_API_KEY` | Alchemy API key for RPC | Yes |
| `NEXT_PUBLIC_POLYGON_AMOY_RPC_URL` | Polygon Amoy testnet RPC URL | Yes |
| `NEXT_PUBLIC_JAAS_API_KEY` | Jitsi as a Service API key | No |
| `SKILLCHAIN_WALLET_PRIVATE_KEY` | Contract owner private key | Yes |

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Using Vercel CLI**:
   ```bash
   npm install -g vercel
   vercel --prod
   ```

2. **Using Vercel Dashboard**:
   - Connect your GitHub repository
   - Set environment variables in the Vercel dashboard
   - Deploy automatically on push to main branch

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Deploy to Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- DigitalOcean App Platform
- Railway

## 🧪 Testing

Run the test suite:

```bash
npm run test
```

The project includes:
- Unit tests for components and utilities
- Integration tests for Web3 interactions
- Mock setup for blockchain operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires Web3 wallet extension (MetaMask, WalletConnect, etc.)

## 🔗 Related Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Wagmi Documentation](https://wagmi.sh/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Vercel Platform](https://vercel.com/)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [troubleshooting guide](./DEPLOYMENT.md#troubleshooting)
2. Review existing GitHub issues
3. Create a new issue with detailed reproduction steps

---

**Built with ❤️ for the decentralized future of work**

