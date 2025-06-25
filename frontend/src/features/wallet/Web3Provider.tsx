"use client";

// WalletConnect's provider relies on the IndexedDB API which doesn't exist in a
// Node.js environment. When this file is imported during server-side rendering,
// we polyfill IndexedDB using `fake-indexeddb` so that the provider can
// initialize without throwing `indexedDB is not defined` errors.
if (typeof indexedDB === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("fake-indexeddb/auto");
}

import { WagmiProvider, createConfig, http } from "wagmi";
import { polygon, hardhat } from "wagmi/chains";
import type { Chain } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

// Define Polygon Amoy testnet (since it might not be in wagmi/chains)
const polygonAmoy: Chain = {
  id: 80002,
  name: 'Polygon Amoy',
  nativeCurrency: {
    decimals: 18,
    name: 'MATIC',
    symbol: 'MATIC',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-amoy.polygon.technology'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Polygon Scan',
      url: 'https://amoy.polygonscan.com',
    },
  },
  testnet: true,
};

// Centralized configuration
const NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
const NEXT_PUBLIC_ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
const POLYGON_AMOY_RPC_URL = process.env.POLYGON_AMOY_RPC_URL
const NODE_ENV = process.env.NODE_ENV

// Validate environment variables
if (!NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
  throw new Error(`NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID environment variable is not defined.`);
}

if (!NEXT_PUBLIC_ALCHEMY_API_KEY) {
  throw new Error(`NEXT_PUBLIC_ALCHEMY_API_KEY environment variable is not defined.`);
}

// Determine which network to use based on environment
// - In production (NODE_ENV=production): Always use Amoy
// - In development: Use localhost by default, unless NEXT_PUBLIC_USE_AMOY=true
// - You can force Amoy in development by setting NEXT_PUBLIC_USE_AMOY=true
const isProduction = NODE_ENV === 'production';
const useAmoyNetwork = isProduction || process.env.NEXT_PUBLIC_USE_AMOY === 'true';

console.log(`🌐 Network Selection:`, {
  NODE_ENV,
  isProduction,
  useAmoyNetwork: useAmoyNetwork,
  selectedNetwork: useAmoyNetwork ? 'Polygon Amoy (Chain ID: 80002)' : 'Localhost Hardhat (Chain ID: 31337)'
});

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}

const getConfig = () => {
  if (useAmoyNetwork) {
    // Production/Amoy configuration
    return createConfig(
      getDefaultConfig({
        chains: [polygonAmoy],
        transports: {
          [polygonAmoy.id]: http(POLYGON_AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology'),
        },
        ssr: true,
        walletConnectProjectId: NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
        appName: "SkillChain",
        appDescription: "A Reputation System For Skill Assessment",
        appUrl: "https://family.co",
        appIcon: "https://family.co/logo.png",
      })
    );
  } else {
    // Development/localhost configuration
    return createConfig(
      getDefaultConfig({
        chains: [hardhat],
        transports: {
          [hardhat.id]: http('http://127.0.0.1:8545/'),        },
        ssr: true,
        walletConnectProjectId: NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
        appName: "SkillChain",
        appDescription: "A Reputation System For Skill Assessment",
        appUrl: "https://family.co",
        appIcon: "https://family.co/logo.png",
      })
    );
  }
};

// Avoid recreating config and queryClient on every hot reload
const config: ReturnType<typeof getConfig> =
  (globalThis as any).wagmiConfig || ((globalThis as any).wagmiConfig = getConfig());

const queryClient: QueryClient =
  (globalThis as any).wagmiQueryClient ||
  ((globalThis as any).wagmiQueryClient = new QueryClient());

export const Web3Provider = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export const wagmiConfig = config;