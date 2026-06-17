"use client";

import * as React from "react";
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { Button } from "@/components/ui/button";
import { truncateAddress } from "@/lib/utils";
import { Wallet, LogOut, Loader2, AlertCircle } from "lucide-react";
import { OG_CHAIN_ID, OG_EXPLORER, OG_FAUCET } from "@/lib/contract";

export function WalletConnect() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain, isPending: switching } = useSwitchChain();
  const [open, setOpen] = React.useState(false);

  const onWrongChain = isConnected && chainId !== OG_CHAIN_ID;

  if (isConnected && !onWrongChain) {
    return (
      <div className="flex items-center gap-2">
        <a
          href={`${OG_EXPLORER}/address/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-mono hover:bg-primary/20 transition-colors"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          {truncateAddress(address ?? "")}
        </a>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => disconnect()}
          title="Disconnect"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  if (onWrongChain) {
    return (
      <Button
        variant="gradient"
        size="sm"
        onClick={() => switchChain({ chainId: OG_CHAIN_ID })}
        disabled={switching}
      >
        {switching ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <AlertCircle className="h-4 w-4" />
        )}
        Switch to 0G
      </Button>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="gradient"
        size="sm"
        disabled={isConnecting || isPending}
        onClick={() => {
          const mm = connectors.find((c) => c.id === "metaMask") ?? connectors[0];
          if (mm) connect({ connector: mm });
        }}
      >
        {isConnecting || isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Wallet className="h-4 w-4" />
        )}
        Connect
      </Button>
      {error && (
        <div className="absolute right-0 top-full mt-2 w-64 glass-strong rounded-lg p-3 text-xs text-destructive">
          {error.message}
          {error.message.toLowerCase().includes("chain") && (
            <a
              href={OG_FAUCET}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-2 text-accent underline"
            >
              Get testnet 0G →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
