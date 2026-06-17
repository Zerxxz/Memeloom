"use client";

import * as React from "react";
import { MemeCard, type MemeCardData } from "@/components/meme-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, TrendingUp, Clock, Sparkles, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

type FilterTab = "trending" | "recent" | "top";

export default function FeedPage() {
  const [filter, setFilter] = React.useState<FilterTab>("trending");
  const [memes, setMemes] = React.useState<MemeCardData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadFeed = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/feed?sort=${filter}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load feed");
      setMemes(data.memes ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  React.useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const handleUpvoted = (tokenId: string, newCount: number) => {
    setMemes((cur) =>
      cur.map((m) =>
        m.tokenId === tokenId ? { ...m, upvotes: newCount } : m
      )
    );
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 space-y-3">
          <Badge variant="gradient" className="font-mono">
            <Users className="h-3 w-3 mr-1" /> The Feed
          </Badge>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            <span className="text-gradient">The loom, live</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Every meme below is permanently stored on 0G. Upvote what slaps,
            forge what inspires.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div className="inline-flex p-1 rounded-lg bg-card/60 border border-white/5">
            {(
              [
                { id: "trending", label: "Trending", icon: TrendingUp },
                { id: "recent", label: "Recent", icon: Clock },
                { id: "top", label: "Top", icon: Sparkles },
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={cn(
                  "px-4 py-1.5 text-sm rounded-md flex items-center gap-1.5 transition-all",
                  filter === id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
          <Button
            variant="glass"
            size="sm"
            onClick={loadFeed}
            disabled={loading}
          >
            <Filter className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>

        {error && (
          <Card className="p-8 text-center">
            <p className="text-destructive mb-2">⚠️ {error}</p>
            <p className="text-sm text-muted-foreground">
              The Memeloom contract might not be deployed yet, or the indexer
              is still catching up.
            </p>
          </Card>
        )}

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-square" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        ) : memes.length === 0 ? (
          <Card className="p-16 text-center">
            <Sparkles className="h-12 w-12 mx-auto text-primary mb-4" />
            <h3 className="font-display text-2xl font-bold">
              The loom is empty
            </h3>
            <p className="text-muted-foreground mt-2 mb-6">
              Be the first to forge a meme and set the standard.
            </p>
            <Button variant="gradient" asChild>
              <a href="/forge">Forge the first meme →</a>
            </Button>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {memes.map((m) => (
              <MemeCard
                key={m.tokenId}
                meme={m}
                onUpvoted={handleUpvoted}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
