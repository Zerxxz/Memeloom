/**
 * 0G Storage + Compute helpers.
 *
 * NOTE: 0G Storage SDK is server-side only (uses Node fs/crypto).
 * Always call these from API routes or server components.
 */

import type { EventLog } from "ethers";

const STORAGE_SDK = "@0gfoundation/0g-storage-ts-sdk";
const OG_RPC = process.env.NEXT_PUBLIC_0G_RPC ?? "https://evmrpc-testnet.0g.ai";
const OG_STORAGE_RPC = process.env.OG_STORAGE_RPC ?? "https://rpc-storage-testnet.0g.ai";
const OG_STORAGE_INDEXER =
  process.env.OG_STORAGE_INDEXER ?? "https://indexer-storage-testnet-turbo.0g.ai";
const OG_STORAGE_PRIVATE_KEY = process.env.OG_STORAGE_PRIVATE_KEY;

export function isStorageConfigured(): boolean {
  return Boolean(OG_STORAGE_PRIVATE_KEY);
}

type UploadInput = {
  imageBytes: Buffer;
  imageMimeType: string; // "image/png", "image/jpeg"
  metadata: Record<string, unknown>;
};

type UploadResult = {
  imageRoot: `0x${string}`;
  metadataRoot: `0x${string}`;
  txHash: `0x${string}`;
  imageURI: string;
  metadataURI: string;
};

let sdkCache: typeof import("@0gfoundation/0g-storage-ts-sdk") | null = null;
async function getSdk() {
  if (sdkCache) return sdkCache;
  try {
    sdkCache = await import(/* webpackIgnore: true */ STORAGE_SDK);
    return sdkCache;
  } catch (e) {
    throw new Error(
      `@0gfoundation/0g-storage-ts-sdk not installed. ` +
        `Run: npm install @0gfoundation/0g-storage-ts-sdk. ` +
        `Underlying error: ${e instanceof Error ? e.message : String(e)}`
    );
  }
}

const GATEWAY_TEMPLATE = "https://storagescan-testnet.0g.ai/file/{root}";

function gatewayUrl(root: string): string {
  return GATEWAY_TEMPLATE.replace("{root}", root);
}

/**
 * Upload an image (and matching metadata JSON) to 0G Storage.
 * Returns the Merkle root hashes and a 0G Storage tx receipt.
 */
export async function uploadToZeroG(input: UploadInput): Promise<UploadResult> {
  if (!OG_STORAGE_PRIVATE_KEY) {
    throw new Error("OG_STORAGE_PRIVATE_KEY not set");
  }

  const sdk = await getSdk();
  // The 0G TS SDK exports: ZgFile, Indexer, Wallet, FlowContract (naming varies by version)
  // We work against the most stable surface used in the docs.
  const { ZgFile, Indexer } = sdk as unknown as {
    ZgFile: new (args: {
      content?: Buffer | Uint8Array;
      filePath?: string;
      fileName?: string;
    }) => {
      getRootHash(): Promise<string>;
      toBuffer(): Promise<Buffer>;
    };
    Indexer: new (url: string) => {
      upload: (
        file: unknown,
        evmRpc: string,
        signer: unknown,
        options?: { tags?: string; overwrite?: boolean }
      ) => Promise<{ tx?: { hash?: string } }>;
    };
  };

  // Build a wallet (ethers v6 style)
  const { ethers } = await import("ethers");
  const provider = new ethers.JsonRpcProvider(OG_STORAGE_RPC);
  const wallet = new ethers.Wallet(OG_STORAGE_PRIVATE_KEY, provider);

  // Create file objects in-memory
  const imageFile = new ZgFile({
    content: input.imageBytes,
    fileName: `meme-${Date.now()}.${input.imageMimeType.split("/")[1] ?? "png"}`,
  });
  const [imageRoot] = await imageFile.getRootHash();
  // getRootHash returns an array in some versions; normalize to string
  const imageRootStr = Array.isArray(imageRoot) ? imageRoot[0] : imageRoot;

  const metadataBytes = Buffer.from(JSON.stringify(input.metadata), "utf-8");
  const metadataFile = new ZgFile({
    content: metadataBytes,
    fileName: `meme-${Date.now()}.json`,
  });
  const [metadataRoot] = await metadataFile.getRootHash();
  const metadataRootStr = Array.isArray(metadataRoot)
    ? metadataRoot[0]
    : metadataRoot;

  const indexer = new Indexer(OG_STORAGE_INDEXER);

  // Upload image
  const imgRes = await indexer.upload(imageFile, OG_STORAGE_RPC, wallet, {
    tags: "memeloom,meme",
    overwrite: true,
  });
  // Upload metadata
  const metaRes = await indexer.upload(metadataFile, OG_STORAGE_RPC, wallet, {
    tags: "memeloom,metadata",
    overwrite: true,
  });

  // SDK signatures vary; pull tx hash defensively
  const imgTxHash = (imgRes as { tx?: { hash?: string }; hash?: string })?.tx
    ?.hash ??
    (imgRes as { hash?: string })?.hash ??
    "0x";
  const metaTxHash = (metaRes as { tx?: { hash?: string }; hash?: string })?.tx
    ?.hash ??
    (metaRes as { hash?: string })?.hash ??
    "0x";

  // Normalize to bytes32 string
  const normRoot = (r: string): `0x${string}` => {
    const hex = r.startsWith("0x") ? r : `0x${r}`;
    return hex.padEnd(66, "0").slice(0, 66) as `0x${string}`;
  };

  return {
    imageRoot: normRoot(imageRootStr),
    metadataRoot: normRoot(metadataRootStr),
    txHash: (imgTxHash.startsWith("0x") ? imgTxHash : `0x${imgTxHash}`) as `0x${string}`,
    imageURI: gatewayUrl(normRoot(imageRootStr)),
    metadataURI: gatewayUrl(normRoot(metadataRootStr)),
  };
}

// ---------- Feed (read-side) ----------

export type FeedItem = {
  tokenId: string;
  creator: `0x${string}`;
  prompt: string;
  caption: string;
  imageURI: string;
  storageRoot: `0x${string}`;
  upvotes: number;
  createdAt: number;
};

type SortMode = "trending" | "recent" | "top";

const MEMELOOM_ABI = [
  "function totalSupply() view returns (uint256)",
  "function getMeme(uint256 tokenId) view returns ((address creator, string prompt, string caption, string imageURI, bytes32 storageRoot, uint64 createdAt, uint128 upvotes))",
  "function tokensOfCreator(address creator) view returns (uint256[])",
  "event MemeMinted(uint256 indexed tokenId, address indexed creator, string prompt, string caption, string imageURI, bytes32 indexed storageRoot, uint64 createdAt)",
  "event MemeUpvoted(uint256 indexed tokenId, address indexed voter, uint128 newUpvoteCount, uint256 timestamp)",
] as const;

/**
 * Fetches the on-chain feed from Memeloom contract.
 * If MEMELOOM_ADDRESS isn't set, returns an empty array (and the UI shows
 * an "empty feed" state). For dev convenience we can also return demo data.
 */
export async function fetchFeed(sort: SortMode): Promise<FeedItem[]> {
  const addr = process.env.NEXT_PUBLIC_MEMELOOM_ADDRESS;
  if (!addr) {
    // Dev mode: return empty so the UI renders the "empty feed" state.
    return [];
  }

  const { ethers } = await import("ethers");
  const provider = new ethers.JsonRpcProvider(OG_RPC);
  const contract = new ethers.Contract(addr, MEMELOOM_ABI, provider);

  // Cheap path: read totalSupply, then page through MemeMinted logs for events.
  // For a real product, you'd subscribe to logs. For the hackathon demo, a
  // single getLogs() covers everything in the block range.
  const filter = contract.filters.MemeMinted();
  const currentBlock = await provider.getBlockNumber();
  const fromBlock = Math.max(currentBlock - 50000, 0);
  const events: EventLog[] = (await contract.queryFilter(
    filter,
    fromBlock,
    currentBlock
  )) as EventLog[];

  const memes: FeedItem[] = [];
  for (const e of events) {
    const args = e.args as unknown as {
      tokenId: bigint;
      creator: string;
      prompt: string;
      caption: string;
      imageURI: string;
      storageRoot: string;
      createdAt: bigint;
    };
    // Read current upvotes (logs are immutable but upvotes change)
    const m = (await contract.getMeme(args.tokenId)) as {
      creator: string;
      prompt: string;
      caption: string;
      imageURI: string;
      storageRoot: string;
      createdAt: bigint;
      upvotes: bigint;
    };
    memes.push({
      tokenId: args.tokenId.toString(),
      creator: m.creator as `0x${string}`,
      prompt: m.prompt,
      caption: m.caption,
      imageURI: m.imageURI,
      storageRoot: m.storageRoot as `0x${string}`,
      upvotes: Number(m.upvotes),
      createdAt: Number(m.createdAt),
    });
  }

  // Sort
  if (sort === "recent") {
    memes.sort((a, b) => b.createdAt - a.createdAt);
  } else if (sort === "top") {
    memes.sort((a, b) => b.upvotes - a.upvotes);
  } else {
    // trending = recent * log(upvotes+1)
    memes.sort((a, b) => {
      const score = (m: FeedItem) =>
        m.upvotes === 0
          ? m.createdAt / 1e9
          : (m.createdAt / 1e9) * Math.log10(m.upvotes + 1) * 2;
      return score(b) - score(a);
    });
  }

  return memes;
}
