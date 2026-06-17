import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * POST /api/vote
 * Body: { tokenId: string, voter: string }
 *
 * NOTE: For hackathon demo, upvotes are handled on-chain directly via the
 * Memeloom contract's `upvote(tokenId)` function (called from the client).
 * This endpoint exists for future server-side rate-limiting / sybil detection
 * but currently returns a 200 to satisfy any external integrations.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (typeof body.tokenId !== "string" || typeof body.voter !== "string") {
      return NextResponse.json({ error: "Bad input" }, { status: 400 });
    }
    return NextResponse.json({
      ok: true,
      message: "Use Memeloom.upvote() on chain instead",
    });
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}
