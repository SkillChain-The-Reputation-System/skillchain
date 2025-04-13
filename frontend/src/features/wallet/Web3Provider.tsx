"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { polygon, hardhat } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";


// Centralized configuration
const NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
const NEXT_PUBLIC_ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY

// Validate environment variables
if (!NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
  throw new Error(`${NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID} environment variable is not defined.`);
}

if (!NEXT_PUBLIC_ALCHEMY_API_KEY) {
  throw new Error(`${NEXT_PUBLIC_ALCHEMY_API_KEY} environment variable is not defined.`);
}

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}

const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [hardhat],
    transports: {
      // RPC URL for each chain
      // [polygon.id]: http(
      //   `https://polygon-mainnet.g.alchemy.com/v2/${NEXT_PUBLIC_ALCHEMY_API_KEY}`
      // ),
      [hardhat.id]: http('http://127.0.0.1:8545/'),
    },
    ssr: true,  // Enable SSR for wagmi  -> https://wagmi.sh/react/guides/ssr#ssr 
                // When set this, Wagmi adjusts its behavior to play nicely with SSR frameworks. Specifically, it delays accessing or relying on data from client-only stores (like localStorage) until after the initial mount happens on the client side. -> Prevent the mismatch error between server and client rendering.

    // Required API Keys
    walletConnectProjectId: NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,

    // Required App Info
    appName: "SkillChain",

    // Optional App Info
    appDescription: "A Reputation System For Skill Assessment",
    appUrl: "https://family.co", // app's url
    appIcon: "https://family.co/logo.png", // app's icon, no bigger than 1024x1024px (max. 1MB)
  })
);

const queryClient = new QueryClient();

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