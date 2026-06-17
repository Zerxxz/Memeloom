# Memeloom

> **Weave memes into the permanent web.**
> AI-native meme forge built on 0G's full modular stack (Chain + Storage + Compute).

Memeloom turns a text prompt into a permanently-stored, provably-owned meme NFT.
Every meme carries cryptographic provenance: who made it, what the prompt was,
and where the bytes live — forever, on 0G.

Built for the **0G Zero Cup 2026** Vibe Coding Tournament.

---

## ✨ Features

- 🎨 **AI generation** via 0G Compute (z-image model) — 4 variants per prompt
- 💾 **Permanent storage** via 0G Storage — Merkle root anchored on-chain
- ⛓️ **On-chain provenance** via custom ERC-721 on 0G Galileo Testnet
- ❤️ **Community feed** with on-chain upvotes (1-hour cooldown per user/meme)
- 🔗 **1-click share** — every meme is a permanent, verifiable link

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Next.js 15     │ →  │  0G Compute      │    │  0G Chain       │
│  React + wagmi  │    │  (z-image-turbo) │    │  (Memeloom NFT) │
│  Tailwind       │    │  Image generation│    │  Provenance     │
└────────┬────────┘    └──────────────────┘    └────────▲────────┘
         │                                              │
         │ upload                                       │ mint(rootHash)
         ▼                                              │
┌─────────────────┐    ┌──────────────────┐             │
│  0G Storage     │ →  │  Memeloom API    │ ────────────┘
│  (Permanent)    │    │  (Next.js)       │
└─────────────────┘    └──────────────────┘
```

**Data flow:**
1. User types a prompt in `/forge`
2. `/api/generate` calls 0G Compute → returns 4 base64 images
3. User curates (picks best, edits caption)
4. `/api/upload` uploads image + metadata to 0G Storage → returns Merkle root
5. Client calls `Memeloom.mintMeme(prompt, caption, imageURI, rootHash)` on 0G Chain
6. NFT is live; `/feed` queries `MemeMinted` events + reads upvotes

## 📦 Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 15 · TypeScript · Tailwind v3 · shadcn-style UI |
| Wallet | wagmi v2 + viem · MetaMask / injected |
| Smart contract | Solidity 0.8.24 · OpenZeppelin-free (minimal) |
| Storage | 0G Storage SDK |
| Compute | 0G Compute (OpenAI-compatible: `z-image-turbo`) |
| Chain | 0G Galileo Testnet (chain ID 16602) |
| Tests | Foundry |

## 🚀 Quick start

### 1. Install
```bash
npm install
```

### 2. Configure env
```bash
cp .env.example .env.local
```

Fill in:
- `NEXT_PUBLIC_MEMELOOM_ADDRESS` (after deploying the contract, see below)
- `OG_STORAGE_PRIVATE_KEY` (testnet wallet, needs ~0.5 0G for storage fees)
- `OG_STORAGE_RPC` (default: `https://rpc-storage-testnet.0g.ai`)

Get testnet 0G from the [0G Galileo Faucet](https://faucet.0g.ai).

### 3. Run the dev server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

### 4. Deploy the smart contract
```bash
cd foundry
forge install foundry-rs/forge-std --no-commit
forge test
PRIVATE_KEY=0x... forge script script/DeployMemeloom.s.sol:DeployMemeloom \
  --rpc-url https://evmrpc-testnet.0g.ai \
  --broadcast
```

Copy the deployed address into `NEXT_PUBLIC_MEMELOOM_ADDRESS`.

### 5. Verify
- Open `/forge`, connect wallet, type a prompt
- Pick a variant, add a caption, hit "Mint to Permanent Web"
- Confirm both transactions (storage upload + mint)
- Your meme appears in `/feed`

## 🧪 Tests

```bash
cd foundry
forge test -vv
```

Covers:
- Mint assigns token ID & stores all fields
- Empty-string & zero-root reverting cases
- Upvote increments + 1-hour cooldown
- `canUpvote` view reflects cooldown
- Fuzz test on `createdAt`

## 🗂️ Project layout

```
Memeloom/
├── app/
│   ├── page.tsx                # Landing
│   ├── forge/page.tsx          # Generation + mint flow
│   ├── feed/page.tsx           # Public feed
│   ├── meme/[id]/page.tsx      # Single-meme detail
│   └── api/
│       ├── generate/           # 0G Compute (image gen)
│       ├── upload/             # 0G Storage (image + metadata)
│       └── feed/               # On-chain read
├── components/
│   ├── forge-panel.tsx         # The main 3-step UX
│   ├── meme-card.tsx           # Feed card with upvote
│   ├── wallet-connect.tsx      # wagmi wallet UI
│   ├── navbar.tsx
│   ├── providers.tsx           # wagmi + react-query
│   └── ui/                     # Button, Card, Input, Toast, etc.
├── lib/
│   ├── 0g.ts                   # 0G Storage + Compute + feed helpers
│   ├── contract.ts             # ABI + address + chain config
│   ├── store.ts                # Zustand forge state
│   └── utils.ts                # cn(), timeAgo(), truncateAddress()
├── contracts/
│   └── Memeloom.sol            # Reference ABI (compiled to lib)
├── foundry/
│   ├── src/Memeloom.sol        # Solidity source
│   ├── test/Memeloom.t.sol     # Foundry tests
│   └── script/DeployMemeloom.s.sol
├── public/
└── README.md
```

## 🎯 0G primitives used

- ✅ **0G Compute** (`/api/generate` → z-image-turbo)
- ✅ **0G Storage** (`/api/upload` → Merkle root anchored on-chain)
- ✅ **0G Chain** (Memeloom.sol → ERC-721 NFT + events)
- 🟡 **0G DA** — not directly used; Storage's Merkle root serves as DA anchor

## 📜 License

MIT
