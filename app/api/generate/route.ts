import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 60; // 0G Compute gen can take 20-40s

const ZG_COMPUTE_URL =
  process.env.ZG_COMPUTE_BASE_URL ??
  "https://router-api-testnet.integratenetwork.work/v1";
const ZG_COMPUTE_KEY = process.env.ZG_COMPUTE_API_KEY ?? "empty";
const ZG_IMAGE_MODEL = process.env.ZG_IMAGE_MODEL ?? "z-image-turbo";

const client = new OpenAI({
  apiKey: ZG_COMPUTE_KEY,
  baseURL: ZG_COMPUTE_URL,
  defaultHeaders: { "Content-Type": "application/json" },
});

type GenBody = {
  prompt: string;
  count?: number;
};

export async function POST(req: NextRequest) {
  let body: GenBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const prompt = (body.prompt ?? "").trim();
  const count = Math.min(Math.max(body.count ?? 4, 1), 4);

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }
  if (prompt.length > 500) {
    return NextResponse.json(
      { error: "Prompt too long (max 500 chars)" },
      { status: 400 }
    );
  }

  try {
    const t0 = Date.now();
    const res = await client.images.generate({
      model: ZG_IMAGE_MODEL,
      prompt,
      n: count,
      size: "1024x1024",
      response_format: "b64_json",
    });
    const elapsedMs = Date.now() - t0;

    const images = (res.data ?? [])
      .map((d) => d.b64_json)
      .filter((b64): b64 is string => Boolean(b64))
      .map((b64) => `data:image/png;base64,${b64}`);

    if (images.length === 0) {
      throw new Error("0G Compute returned no images");
    }

    return NextResponse.json({
      images,
      prompt,
      model: ZG_IMAGE_MODEL,
      elapsedMs,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      {
        error: "0G Compute image generation failed",
        detail: msg.slice(0, 500),
      },
      { status: 502 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    model: ZG_IMAGE_MODEL,
    endpoint: ZG_COMPUTE_URL,
    status: "ready",
  });
}
