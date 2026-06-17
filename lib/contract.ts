// 0G chain + contract config (singleton accessors)
export const OG_CHAIN_ID: number = Number(
  process.env.NEXT_PUBLIC_0G_CHAIN_ID ?? 16602
);

export const OG_RPC =
  process.env.NEXT_PUBLIC_0G_RPC ?? "https://evmrpc-testnet.0g.ai";

export const OG_INDEXER =
  process.env.NEXT_PUBLIC_0G_INDEXER ?? "https://indexer-storage-testnet-turbo.0g.ai";

export const OG_EXPLORER =
  process.env.NEXT_PUBLIC_0G_EXPLORER ?? "https://chainscan-galileo.0g.ai";

export const OG_FAUCET =
  process.env.NEXT_PUBLIC_0G_FAUCET ?? "https://faucet.0g.ai";

export const MEMELOOM_ADDRESS = (process.env.NEXT_PUBLIC_MEMELOOM_ADDRESS ??
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

// ABI for Memeloom.sol — matches the deployed contract exactly.
// Keep this in sync with contracts/Memeloom.sol.
export const MEMELOOM_ABI = [
  // ─── Custom read functions ──────────────────────────────
  "function nextTokenId() view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function getMeme(uint256 tokenId) view returns (tuple(address creator, string prompt, string caption, string imageURI, bytes32 storageRoot, uint64 createdAt, uint128 upvotes))",
  "function tokensOfCreator(address creator) view returns (uint256[])",
  "function canUpvote(uint256 tokenId, address user) view returns (bool)",
  "function lastUpvotedAt(uint256 tokenId, address user) view returns (uint256)",
  "function UPVOTE_COOLDOWN() view returns (uint256)",

  // ─── Custom write functions ──────────────────────────────
  "function mintMeme(string prompt, string caption, string imageURI, bytes32 storageRoot) returns (uint256)",
  "function upvote(uint256 tokenId)",

  // ─── Standard ERC-721 read functions (for tokenURI display) ──
  // Memeloom implements ERC-721 via interface so wallets can render NFTs.
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",

  // ─── Events ──────────────────────────────────────────────
  "event MemeMinted(uint256 indexed tokenId, address indexed creator, string prompt, string caption, string imageURI, bytes32 indexed storageRoot, uint64 createdAt)",
  "event MemeUpvoted(uint256 indexed tokenId, address indexed voter, uint128 newUpvoteCount, uint256 timestamp)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
] as const;