import { MemeCard, type MemeCardData } from "@/components/meme-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { OG_EXPLORER } from "@/lib/contract";

export default async function MemeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let meme: MemeCardData | null = null;
  let error: string | null = null;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/feed?tokenId=${id}`,
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error("Meme not found");
    const data = await res.json();
    meme = data.meme ?? null;
    if (!meme) error = "Meme not found";
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  if (error || !meme) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-2xl text-center">
        <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
        <h1 className="font-display text-3xl font-bold mb-2">
          Meme not found
        </h1>
        <p className="text-muted-foreground mb-6">
          {error ?? "This meme may not exist or hasn't been indexed yet."}
        </p>
        <Button variant="glass" asChild>
          <Link href="/feed">
            <ArrowLeft className="h-4 w-4" /> Back to feed
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href="/feed">
          <ArrowLeft className="h-4 w-4" /> Back to feed
        </Link>
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={meme.imageURI}
            alt={meme.caption}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-4">
          <Badge variant="success" className="font-mono">
            On-chain provenance verified
          </Badge>
          <h1 className="font-display text-3xl font-bold text-balance">
            {meme.caption}
          </h1>
          <p className="text-muted-foreground italic text-balance">
            "{meme.prompt}"
          </p>
          <Card className="p-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Token ID</span>
              <span className="font-mono">#{meme.tokenId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Creator</span>
              <a
                href={`${OG_EXPLORER}/address/${meme.creator}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-accent hover:underline"
              >
                {meme.creator.slice(0, 8)}…{meme.creator.slice(-6)}
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Storage root</span>
              <a
                href={`${OG_EXPLORER}/tx/${meme.storageRoot}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-accent hover:underline"
              >
                {meme.storageRoot.slice(0, 8)}…
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
