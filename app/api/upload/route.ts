import { NextRequest, NextResponse } from "next/server";
import { uploadToZeroG, isStorageConfigured } from "@/lib/0g";
import { ethers } from "ethers";

export const runtime = "nodejs";
export const maxDuration = 120; // 0G Storage upload can take 30-60s

type UploadBody = {
  image: string; // data URL
  caption: string;
  prompt: string;
  creator: string;
};

/**
 * POST /api/upload
 * Uploads meme (image + metadata) to 0G Storage and returns:
 *   - rootHash  (Merkle root — anchor for on-chain NFT)
 *   - txHash    (0G Storage upload receipt transaction)
 *   - imageURI  (gateway-resolvable URL for display)
 *   - metadataURI
 */
export async function POST(req: NextRequest) {
  if (!isStorageConfigured()) {
    return NextResponse.json(
      {
        error: "0G Storage not configured",
        hint: "Set OG_STORAGE_PRIVATE_KEY + OG_STORAGE_RPC in .env.local",
      },
      { status: 503 }
    );
  }

  let body: UploadBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { image, caption, prompt, creator } = body;
  if (!image || !caption || !prompt || !creator) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }
  if (!/^0x[a-fA-F0-9]{40}$/.test(creator)) {
    return NextResponse.json(
      { error: "Invalid creator address" },
      { status: 400 }
    );
  }

  try {
    // 1) Build the metadata object
    const metadata = {
      name: `Memeloom #${Date.now()}`,
      description: caption,
      prompt,
      creator,
      createdAt: new Date().toISOString(),
      type: "memeloom-meme-v1",
    };

    // 2) Decode the base64 image
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const imageBytes = Buffer.from(base64Data, "base64");

    // 3) Upload to 0G Storage
    const t0 = Date.now();
    const result = await uploadToZeroG({
      imageBytes,
      imageMimeType: "image/png",
      metadata,
    });
    const elapsedMs = Date.now() - t0;

    return NextResponse.json({
      rootHash: result.imageRoot,
      txHash: result.txHash,
      imageURI: result.imageURI,
      metadataURI: result.metadataURI,
      metadataRoot: result.metadataRoot,
      elapsedMs,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: "0G Storage upload failed", detail: msg.slice(0, 500) },
      { status: 502 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    configured: isStorageConfigured(),
    status: isStorageConfigured() ? "ready" : "missing-env",
  });
}
