import { Button } from "@/components/ui/button";
import { WalletConnect } from "@/components/wallet-connect";
import Link from "next/link";
import { Sparkles, Hammer, Users, Github } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 glass border-b border-white/5">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 group"
          aria-label="Memeloom home"
        >
          <div className="relative h-9 w-9 rounded-lg bg-gradient-fire grid place-items-center font-display font-bold text-white shadow-lg shadow-loom-500/30 group-hover:shadow-loom-500/50 transition-shadow">
            <span className="text-lg">🧵</span>
            <span className="absolute inset-0 rounded-lg shimmer opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-lg font-bold tracking-tight text-gradient-fire">
              Memeloom
            </span>
            <span className="text-[10px] text-muted-foreground tracking-widest uppercase">
              Weave · Mint · Share
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/forge" className="flex items-center gap-2">
              <Hammer className="h-4 w-4" />
              Forge
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/feed" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Feed
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link
              href="https://github.com/Zerxxz/Memeloom"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Github className="h-4 w-4" />
              Repo
            </Link>
          </Button>
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            0G Testnet
          </span>
          <WalletConnect />
        </div>
      </div>
    </header>
  );
}
