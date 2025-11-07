"use client";

import type { ReactNode } from "react";

import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "@/config/wagmi";
import { InMemoryStorageProvider } from "@/hooks/useInMemoryStorage";
import { WagmiEthersSignerProvider } from "@/hooks/wagmi/useWagmiEthersSigner";

import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

type Props = {
  children: ReactNode;
};

export function Providers({ children }: Props) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <WagmiEthersSignerProvider initialMockChains={{ 31337: "http://localhost:8545" }}>
            <InMemoryStorageProvider>{children}</InMemoryStorageProvider>
          </WagmiEthersSignerProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
