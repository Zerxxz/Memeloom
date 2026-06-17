import { NextRequest, NextResponse } from "next/server";
import { fetchFeed } from "@/lib/0g";

export const runtime = "nodejs";
export const maxDuration = 30;

type SortMode = "trending" | "recent" | "top";

/**
 * GET /api/feed?sort=trending|recent|top
 * GET /api/feed?tokenId=42
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sort = (searchParams.get("sort") ?? "trending") as SortMode;
  const tokenId = searchParams.get("tokenId");

  try {
    if (tokenId) {
      const feed = await fetchFeed("recent");
      const meme = feed.find((m) => m.tokenId === tokenId);
      if (!meme) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json({ meme });
    }

    const memes = await fetchFeed(sort);
    return NextResponse.json({ memes, sort, count: memes.length });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: "Feed fetch failed", detail: msg.slice(0, 500) },
      { status: 502 }
    );
  }
}
