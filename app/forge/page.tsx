"use client";

import { ForgePanel } from "@/components/forge-panel";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Hammer, Zap, Database, Cpu, Shield } from "lucide-react";

export default function ForgePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 space-y-3">
          <Badge variant="gradient" className="font-mono">
            <Hammer className="h-3 w-3 mr-1" /> The Forge
          </Badge>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            <span className="text-gradient-fire">Create your meme</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Three steps: dream it, curate it, mint it. Powered by 0G's full
            modular stack.
          </p>
        </div>

        <ForgePanel />

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <PrimitiveCard
            icon={<Cpu className="h-4 w-4" />}
            label="0G Compute"
            value="z-image-turbo"
            detail="AI generation"
            color="secondary"
          />
          <PrimitiveCard
            icon={<Database className="h-4 w-4" />}
            label="0G Storage"
            value="Permanent"
            detail="Merkle root on-chain"
            color="accent"
          />
          <PrimitiveCard
            icon={<Zap className="h-4 w-4" />}
            label="0G Chain"
            value="ERC-721"
            detail="Provenance NFT"
            color="primary"
          />
          <PrimitiveCard
            icon={<Shield className="h-4 w-4" />}
            label="Open source"
            value="MIT"
            detail="Audit & verify"
            color="muted"
          />
        </div>
      </div>
    </div>
  );
}

function PrimitiveCard({
  icon,
  label,
  value,
  detail,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
  color: "primary" | "accent" | "secondary" | "muted";
}) {
  const colorClass = {
    primary: "text-primary border-primary/20",
    accent: "text-accent border-accent/20",
    secondary: "text-secondary border-secondary/20",
    muted: "text-muted-foreground border-white/10",
  }[color];
  return (
    <Card className={`p-4 ${colorClass}`}>
      <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider opacity-80">
        {icon}
        {label}
      </div>
      <div className="mt-2 font-display text-lg font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{detail}</div>
    </Card>
  );
}
