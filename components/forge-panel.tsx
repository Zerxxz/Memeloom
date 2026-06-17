"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useForgeStore, type GeneratedVariant, type Meme } from "@/lib/store";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { MEMELOOM_ABI, MEMELOOM_ADDRESS, OG_EXPLORER } from "@/lib/contract";
import { useToast } from "@/components/ui/toaster";
import { Sparkles, Loader2, CheckCircle2, Send, RefreshCw, ImageIcon, X } from "lucide-react";
import { cn, truncateAddress } from "@/lib/utils";

const PROMPT_SUGGESTIONS = [
  "doge wearing a 0G logo cape, laser eyes, hyper-realistic",
  "Confused mathematician when he sees gas fees on 0G, vintage style",
  "Distracted boyfriend but the other girl is a permanent storage deal",
  "Gigachad sigma grindset, but he's actually reading the 0G whitepaper",
  "This is fine meme but the room is full of centralized servers on fire",
  "Pepe standing in front of a massive 0G decentralized AI supercomputer",
  "Surprised Pikachu but the receipt is from a Layer 1 that costs $0.0001",
  "Wojak at computer discovering permanent on-chain memes exist",
];

const STYLES = [
  { id: "meme", label: "Meme" },
  { id: "vintage", label: "Vintage" },
  { id: "realistic", label: "Realistic" },
  { id: "anime", label: "Anime" },
  { id: "pixel", label: "Pixel" },
  { id: "cyberpunk", label: "Cyberpunk" },
];

export function ForgePanel() {
  const {
    prompt,
    variants,
    selectedVariantId,
    isGenerating,
    isUploading,
    isMinting,
    setPrompt,
    setVariants,
    selectVariant,
    updateVariant,
    setGenerating,
    setUploading,
    setMinting,
    addRecentMeme,
    reset,
  } = useForgeStore();

  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { toast } = useToast();
  const [style, setStyle] = React.useState("meme");
  const [txHash, setTxHash] = React.useState<`0x${string}` | null>(null);
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash ?? undefined });

  const selected = variants.find((v) => v.id === selectedVariantId);

  // ---------- Generate ----------
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ title: "Add a prompt first", variant: "destructive" });
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: `${prompt}, ${style} style`, count: 4 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      const newVariants: GeneratedVariant[] = data.images.map(
        (url: string, i: number) => ({
          id: `${Date.now()}-${i}`,
          url,
          caption: i === 0 ? `When ${prompt.slice(0, 32)}...` : `Variant ${i + 1}`,
          prompt: data.prompt,
        })
      );
      setVariants(newVariants);
      toast({
        title: "Memes forged ✨",
        description: `${newVariants.length} variants ready to curate`,
        variant: "success",
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast({
        title: "Generation failed",
        description: msg.slice(0, 200),
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  // ---------- Mint ----------
  const handleMint = async () => {
    if (!selected) return;
    if (!isConnected || !address) {
      toast({ title: "Connect wallet first", variant: "destructive" });
      return;
    }
    if (MEMELOOM_ADDRESS === "0x0000000000000000000000000000000000000000") {
      toast({
        title: "Contract not deployed yet",
        description:
          "Add NEXT_PUBLIC_MEMELOOM_ADDRESS to .env.local after deploying",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // 1) Upload to 0G Storage
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: selected.url,
          caption: selected.caption,
          prompt: selected.prompt,
          creator: address,
        }),
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed");

      updateVariant(selected.id, {
        storageRoot: uploadData.rootHash,
        storageTxHash: uploadData.txHash,
      });

      // 2) Mint NFT on 0G Chain
      setUploading(false);
      setMinting(true);
      const hash = await writeContractAsync({
        address: MEMELOOM_ADDRESS,
        abi: MEMELOOM_ABI,
        functionName: "mintMeme",
        args: [
          selected.prompt,
          selected.caption,
          uploadData.imageURI,
          uploadData.rootHash,
        ],
        value: 0n,
      });
      setTxHash(hash);
      toast({
        title: "Meme minted! 🎨",
        description: "Confirming on 0G Chain…",
        variant: "success",
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast({
        title: "Mint failed",
        description: msg.slice(0, 200),
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setMinting(false);
    }
  };

  React.useEffect(() => {
    if (isConfirmed && txHash && selected && address) {
      const newMeme: Meme = {
        tokenId: "pending", // would be parsed from logs in production
        creator: address,
        prompt: selected.prompt,
        caption: selected.caption,
        imageURI: selected.url,
        storageRoot: (selected.storageRoot ??
          ("0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`)) as `0x${string}`,
        upvotes: 0,
        createdAt: Math.floor(Date.now() / 1000),
        txHash,
      };
      addRecentMeme(newMeme);
      toast({
        title: "On-chain! 🚀",
        description: "Your meme is permanently stored on 0G",
        variant: "success",
      });
    }
  }, [isConfirmed, txHash, selected, address, addRecentMeme, toast]);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* LEFT: prompt + variants */}
      <Card className="p-6 space-y-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            Step 1 · Dream the meme
          </div>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your meme in vivid detail..."
            className="min-h-[100px] text-base"
            maxLength={500}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{prompt.length}/500</span>
            {prompt && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPrompt("");
                  setVariants([]);
                }}
                className="h-6 text-xs"
              >
                <X className="h-3 w-3" /> Clear
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Style
          </div>
          <div className="flex flex-wrap gap-2">
            {STYLES.map((s) => (
              <Button
                key={s.id}
                variant={style === s.id ? "gradient" : "glass"}
                size="sm"
                onClick={() => setStyle(s.id)}
                type="button"
              >
                {s.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Need inspiration?
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PROMPT_SUGGESTIONS.slice(0, 4).map((p) => (
              <button
                key={p}
                onClick={() => setPrompt(p)}
                className="text-[10px] px-2 py-1 rounded-md bg-muted/30 hover:bg-muted/60 border border-white/5 text-muted-foreground hover:text-foreground transition-colors"
              >
                {p.slice(0, 36)}…
              </button>
            ))}
          </div>
        </div>

        <Button
          variant="gradient"
          size="xl"
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Forging memes on 0G Compute…
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Generate Memes
            </>
          )}
        </Button>

        {variants.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-white/5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-accent" />
                Variants
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                <RefreshCw className="h-3 w-3" /> Re-roll
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => selectVariant(v.id)}
                  className={cn(
                    "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                    selectedVariantId === v.id
                      ? "border-primary shadow-lg shadow-primary/30 scale-[0.98]"
                      : "border-transparent hover:border-white/20"
                  )}
                >
                  {v.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={v.url}
                      alt={v.caption}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Skeleton className="w-full h-full" />
                  )}
                  {selectedVariantId === v.id && (
                    <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                      <CheckCircle2 className="h-3 w-3" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* RIGHT: curate + mint */}
      <Card className="p-6 space-y-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Send className="h-4 w-4 text-accent" />
            Step 2 · Curate &amp; mint
          </div>
          {selected ? (
            <div className="space-y-3">
              <div className="relative aspect-square rounded-lg overflow-hidden border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selected.url}
                  alt={selected.caption}
                  className="w-full h-full object-cover"
                />
              </div>
              <Textarea
                value={selected.caption}
                onChange={(e) =>
                  updateVariant(selected.id, { caption: e.target.value })
                }
                placeholder="Add a caption…"
                className="min-h-[60px]"
                maxLength={200}
              />
              <div className="text-xs text-muted-foreground">
                {selected.caption.length}/200
              </div>
            </div>
          ) : (
            <div className="aspect-square rounded-lg border-2 border-dashed border-white/10 grid place-items-center text-muted-foreground text-sm">
              <div className="text-center space-y-2">
                <ImageIcon className="h-10 w-10 mx-auto opacity-40" />
                <p>Generate memes to start curating</p>
              </div>
            </div>
          )}
        </div>

        {selected && (
          <div className="space-y-3 pt-3 border-t border-white/5">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-card/60">
                <div className="text-muted-foreground">Chain</div>
                <div className="font-mono font-semibold text-primary">
                  0G NFT
                </div>
              </div>
              <div className="p-2 rounded-lg bg-card/60">
                <div className="text-muted-foreground">Storage</div>
                <div className="font-mono font-semibold text-accent">
                  0G Perm
                </div>
              </div>
              <div className="p-2 rounded-lg bg-card/60">
                <div className="text-muted-foreground">Compute</div>
                <div className="font-mono font-semibold text-secondary">
                  0G z-img
                </div>
              </div>
            </div>

            <Button
              variant="gradient"
              size="xl"
              onClick={handleMint}
              disabled={
                isUploading ||
                isMinting ||
                isConfirming ||
                !isConnected ||
                !selected.caption.trim()
              }
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Uploading to 0G Storage…
                </>
              ) : isMinting || isConfirming ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Minting on 0G Chain…
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Mint to Permanent Web
                </>
              )}
            </Button>

            {!isConnected && (
              <p className="text-xs text-muted-foreground text-center">
                Connect your wallet to mint
              </p>
            )}

            {selected.storageRoot && (
              <div className="text-xs space-y-1 p-3 rounded-lg bg-success/5 border border-success/20">
                <div className="flex items-center gap-1.5 text-primary">
                  <CheckCircle2 className="h-3 w-3" />
                  <span className="font-semibold">Stored on 0G</span>
                </div>
                <a
                  href={`${OG_EXPLORER}/tx/${selected.storageRoot}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-accent/80 hover:text-accent block truncate"
                >
                  {truncateAddress(selected.storageRoot, 6)}
                </a>
              </div>
            )}

            {txHash && (
              <div className="text-xs p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="text-primary font-semibold mb-1">Mint tx</div>
                <a
                  href={`${OG_EXPLORER}/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-accent/80 hover:text-accent break-all"
                >
                  {truncateAddress(txHash, 6)}
                </a>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
