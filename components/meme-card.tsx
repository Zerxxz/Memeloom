"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber, timeAgo, truncateAddress } from "@/lib/utils";
import { Heart, ExternalLink, Share2, CheckCircle2 } from "lucide-react";
import { OG_EXPLORER } from "@/lib/contract";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { MEMELOOM_ABI, MEMELOOM_ADDRESS } from "@/lib/contract";
import { useToast } from "@/components/ui/toaster";

export type MemeCardData = {
  tokenId: string;
  creator: `0x${string}`;
  prompt: string;
  caption: string;
  imageURI: string;
  storageRoot: `0x${string}`;
  upvotes: number;
  createdAt: number;
};

export function MemeCard({
  meme,
  onUpvoted,
}: {
  meme: MemeCardData;
  onUpvoted?: (tokenId: string, newCount: number) => void;
}) {
  const { isConnected } = useAccount();
  const { toast } = useToast();
  const [optimisticCount, setOptimisticCount] = React.useState(meme.upvotes);
  const [hasVoted, setHasVoted] = React.useState(false);

  const { writeContractAsync, isPending: isWriting } = useWriteContract();
  const [txHash, setTxHash] = React.useState<`0x${string}` | null>(null);
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash ?? undefined });

  React.useEffect(() => {
    if (isConfirmed && txHash) {
      toast({
        title: "Upvoted! 🎉",
        description: `Boosted meme #${meme.tokenId}`,
        variant: "success",
      });
      setHasVoted(true);
      onUpvoted?.(meme.tokenId, optimisticCount);
    }
  }, [isConfirmed, txHash, meme.tokenId, optimisticCount, onUpvoted, toast]);

  const handleUpvote = async () => {
    if (!isConnected) {
      toast({
        title: "Connect wallet first",
        variant: "destructive",
      });
      return;
    }
    if (hasVoted) {
      toast({ title: "Already upvoted today", description: "Come back tomorrow" });
      return;
    }
    try {
      const hash = await writeContractAsync({
        address: MEMELOOM_ADDRESS,
        abi: MEMELOOM_ABI,
        functionName: "upvote",
        args: [BigInt(meme.tokenId)],
      });
      setTxHash(hash);
      setOptimisticCount((c) => c + 1);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast({
        title: "Upvote failed",
        description: msg.slice(0, 120),
        variant: "destructive",
      });
      setOptimisticCount((c) => c - 1);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/meme/${meme.tokenId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied", description: url });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  return (
    <Card className="group overflow-hidden hover:border-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/10">
      <div className="relative aspect-square overflow-hidden bg-muted/20">
        {meme.imageURI ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={meme.imageURI}
            alt={meme.caption}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <Skeleton className="w-full h-full" />
        )}
        <div className="absolute top-2 right-2 flex gap-1.5">
          <Badge variant="glass" className="backdrop-blur-md font-mono text-[10px]">
            #{meme.tokenId}
          </Badge>
        </div>
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4">
          <p className="font-display text-white text-lg leading-tight line-clamp-2 text-balance">
            {meme.caption}
          </p>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <p className="text-xs text-muted-foreground line-clamp-2 italic">
          {meme.prompt}
        </p>

        <div className="flex items-center justify-between gap-2 text-xs">
          <a
            href={`${OG_EXPLORER}/address/${meme.creator}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors font-mono"
          >
            by {truncateAddress(meme.creator, 3)}
            <ExternalLink className="h-3 w-3" />
          </a>
          <span className="text-muted-foreground">
            {timeAgo(meme.createdAt * 1000)}
          </span>
        </div>

        {meme.storageRoot && (
          <a
            href={`${OG_EXPLORER}/tx/${meme.storageRoot}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] text-accent/80 hover:text-accent font-mono truncate"
            title={meme.storageRoot}
          >
            <CheckCircle2 className="h-3 w-3 shrink-0" />
            <span className="truncate">0G · {truncateAddress(meme.storageRoot, 4)}</span>
          </a>
        )}

        <div className="flex items-center gap-2 pt-1">
          <Button
            variant={hasVoted ? "glass" : "gradient"}
            size="sm"
            onClick={handleUpvote}
            disabled={isWriting || isConfirming || hasVoted}
            className="flex-1"
          >
            <Heart
              className={`h-4 w-4 ${hasVoted ? "fill-primary text-primary" : ""}`}
            />
            {formatNumber(optimisticCount)}
          </Button>
          <Button variant="glass" size="icon" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
          {txHash && (
            <Button
              variant="ghost"
              size="icon"
              asChild
              title="View upvote tx"
            >
              <a
                href={`${OG_EXPLORER}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
