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

// Minimal ABI for Memeloom.sol
export const MEMELOOM_ABI = [
  // ERC-721 standard
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function safeTransferFrom(address from, address to, uint256 tokenId)",
  // Memeloom custom
  "function mintMeme(string prompt, string caption, string imageURI, string storageRoot) payable returns (uint256)",
  "function upvote(uint256 tokenId)",
  "function getMeme(uint256 tokenId) view returns (tuple(uint256 tokenId, address creator, string prompt, string caption, string imageURI, string storageRoot, uint256 upvotes, uint256 createdAt))",
  "function getMemesByCreator(address creator) view returns (uint256[])",
  "function getRecentMemes(uint256 offset, uint256 limit) view returns (uint256[])",
  "function getTopMemes(uint256 limit) view returns (uint256[])",
  "function upvoteCount(uint256 tokenId) view returns (uint256)",
  "function mintFee() view returns (uint256)",
  "function treasury() view returns (address)",
  "event MemeMinted(uint256 indexed tokenId, address indexed creator, string prompt, string caption, string imageURI, string storageRoot)",
  "event MemeUpvoted(uint256 indexed tokenId, address indexed voter, uint256 newCount)",
] as const;
