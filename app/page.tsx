import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Hammer,
  Users,
  Zap,
  Database,
  Cpu,
  ArrowRight,
  Github,
  Wand2,
  ImageIcon,
  Shield,
  Flame,
  Infinity as InfinityIcon,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4">
      {/* HERO */}
      <section className="relative pt-16 pb-24 text-center overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/20 blur-[120px] animate-pulse" />
          <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-secondary/20 blur-[100px]" />
          <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-accent/20 blur-[100px]" />
        </div>

        <Badge variant="gradient" className="mb-6 font-mono">
          <Flame className="h-3 w-3 mr-1" /> Built for 0G Zero Cup 2026
        </Badge>

        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-balance">
          <span className="text-gradient-fire">Weave memes</span>
          <br />
          into the{" "}
          <span className="text-gradient">permanent web</span>
        </h1>

        <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground text-balance">
          AI-native meme forge on{" "}
          <span className="text-primary font-semibold">0G</span>. Generate,
          curate, and mint memes with on-chain provenance &amp; permanent
          storage. The first social graph where every meme is cryptographically
          yours.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="gradient" size="xl" asChild>
            <Link href="/forge">
              <Hammer className="h-5 w-5" />
              Start forging
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="glass" size="xl" asChild>
            <Link href="/feed">
              <Users className="h-5 w-5" />
              Explore the feed
            </Link>
          </Button>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-3 text-xs">
          <Badge variant="glass">
            <Zap className="h-3 w-3 mr-1 text-primary" /> 0G Chain
          </Badge>
          <Badge variant="glass">
            <Database className="h-3 w-3 mr-1 text-accent" /> 0G Storage
          </Badge>
          <Badge variant="glass">
            <Cpu className="h-3 w-3 mr-1 text-secondary" /> 0G Compute
          </Badge>
          <Badge variant="glass">
            <Shield className="h-3 w-3 mr-1 text-primary" /> On-chain provenance
          </Badge>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 border-t border-white/5">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            <Wand2 className="h-3 w-3 mr-1" /> The 3-step loop
          </Badge>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            <span className="text-gradient">From spark to permanence</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            A complete creative loop powered by 0G's modular AI stack.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Step
            number={1}
            icon={<Sparkles className="h-6 w-6" />}
            title="Dream"
            description="Describe the meme. Our prompt enhancer + style engine sends your vision to 0G Compute (z-image model) and returns 4 variations."
            color="primary"
          />
          <Step
            number={2}
            icon={<ImageIcon className="h-6 w-6" />}
            title="Curate"
            description="Pick your favorite, tweak the caption. Edit freely — your final image is uploaded to 0G Storage for permanent availability."
            color="accent"
          />
          <Step
            number={3}
            icon={<Hammer className="h-6 w-6" />}
            title="Mint"
            description="One click → your meme becomes an NFT on 0G Chain. The contract stores prompt, caption, creator, and the storage root hash."
            color="secondary"
          />
        </div>
      </section>

      {/* WHY MEMELOOM */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4">
                Why it wins
              </Badge>
              <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
                <span className="text-gradient-fire">A meme, but</span>
                <br />
                <span className="text-gradient">actually yours</span>
              </h2>
              <p className="mt-4 text-muted-foreground text-lg">
                Every meme you forge carries cryptographic proof: who made it,
                what the prompt was, and where the bytes live. Forever.
                No more "I made this, it went viral, then it got stolen."
              </p>

              <div className="mt-8 space-y-3">
                <Feature
                  icon={<InfinityIcon className="h-4 w-4" />}
                  text="Permanent storage on 0G's data-availability layer"
                />
                <Feature
                  icon={<Shield className="h-4 w-4" />}
                  text="On-chain provenance (prompt + caption + creator)"
                />
                <Feature
                  icon={<Zap className="h-4 w-4" />}
                  text="1-click mint, no IPFS, no off-chain metadata"
                />
                <Feature
                  icon={<Users className="h-4 w-4" />}
                  text="Community feed with on-chain upvotes"
                />
              </div>
            </div>

            <div className="relative aspect-square max-w-md mx-auto w-full">
              <div className="absolute inset-0 grid grid-cols-2 gap-3 rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="rounded-2xl bg-gradient-fire shadow-2xl shadow-primary/30 aspect-square flex items-center justify-center text-6xl">
                  🐸
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-accent to-secondary shadow-2xl shadow-accent/30 aspect-square flex items-center justify-center text-6xl">
                  🚀
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-secondary to-primary shadow-2xl shadow-secondary/30 aspect-square flex items-center justify-center text-6xl">
                  💎
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-meme-yellow to-meme-pink shadow-2xl shadow-meme-pink/30 aspect-square flex items-center justify-center text-6xl">
                  🔥
                </div>
              </div>
              <div className="absolute -top-6 -right-6 glass-strong rounded-xl p-3 shadow-2xl">
                <Badge variant="success" className="font-mono text-[10px]">
                  <Shield className="h-2 w-2 mr-1" /> Provenance: ✓
                </Badge>
              </div>
              <div className="absolute -bottom-6 -left-6 glass-strong rounded-xl p-3 shadow-2xl">
                <Badge variant="success" className="font-mono text-[10px]">
                  <Database className="h-2 w-2 mr-1" /> 0G: permanent
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center">
        <div className="max-w-2xl mx-auto glass-strong rounded-3xl p-12">
          <Sparkles className="h-12 w-12 mx-auto text-primary mb-4" />
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
            <span className="text-gradient-fire">Ready to weave?</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Connect your wallet, get testnet 0G from the faucet, and forge
            your first permanent meme in under 60 seconds.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button variant="gradient" size="lg" asChild>
              <Link href="/forge">
                Open the forge <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="lg" asChild>
              <Link
                href="https://github.com/Zerxxz/Memeloom"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4" /> Source code
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Step({
  number,
  icon,
  title,
  description,
  color,
}: {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "primary" | "accent" | "secondary";
}) {
  const colorMap = {
    primary: "from-primary to-loom-600 text-primary",
    accent: "from-accent to-cyan-600 text-accent",
    secondary: "from-secondary to-purple-600 text-secondary",
  } as const;
  return (
    <div className="relative group">
      <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-card border border-white/10 grid place-items-center font-display text-2xl font-bold text-gradient-fire z-10">
        {number}
      </div>
      <Card className="p-6 pt-10 h-full hover:border-white/20 transition-colors">
        <div
          className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${colorMap[color].split(" ").slice(0, 2).join(" ")} bg-opacity-10 ${colorMap[color].split(" ")[2]}`}
        >
          {icon}
        </div>
        <h3 className="mt-4 font-display text-2xl font-bold">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </Card>
    </div>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 p-1.5 rounded-md bg-primary/10 text-primary shrink-0">
        {icon}
      </div>
      <span className="text-sm">{text}</span>
    </div>
  );
}

function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/5 bg-card/40 backdrop-blur-md shadow-sm ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
