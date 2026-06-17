"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { injected, metaMask } from "wagmi/connectors";
import { ToastProvider, Toaster } from "@/components/ui/toaster";
import { useState } from "react";

const ogChain = {
  id: Number(process.env.NEXT_PUBLIC_0G_CHAIN_ID ?? 16602),
  name: "0G Galileo Testnet",
  nativeCurrency: { name: "0G", symbol: "0G", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_0G_RPC ?? "https://evmrpc-testnet.0g.ai"] },
  },
  blockExplorers: {
    default: {
      name: "0G Galileo Explorer",
      url: process.env.NEXT_PUBLIC_0G_EXPLORER ?? "https://chainscan-galileo.0g.ai",
    },
  },
  testnet: true,
} as const;

const config = createConfig({
  chains: [ogChain],
  connectors: [injected(), metaMask()],
  transports: {
    [ogChain.id]: http(
      process.env.NEXT_PUBLIC_0G_RPC ?? "https://evmrpc-testnet.0g.ai"
    ),
  },
  ssr: true,
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, refetchOnWindowFocus: false },
        },
      })
  );

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          {children}
          <Toaster />
        </ToastProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
