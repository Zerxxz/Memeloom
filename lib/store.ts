"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type GeneratedVariant = {
  id: string;
  url: string; // base64 data URL or storage URL
  caption: string;
  prompt: string;
  storageRoot?: `0x${string}`;
  storageTxHash?: `0x${string}`;
};

export type Meme = {
  tokenId: string;
  creator: `0x${string}`;
  prompt: string;
  caption: string;
  imageURI: string;
  storageRoot: `0x${string}`;
  upvotes: number;
  createdAt: number;
  txHash?: `0x${string}`;
};

type ForgeState = {
  prompt: string;
  variants: GeneratedVariant[];
  selectedVariantId: string | null;
  isGenerating: boolean;
  isUploading: boolean;
  isMinting: boolean;
  recentMemes: Meme[];

  setPrompt: (p: string) => void;
  setVariants: (v: GeneratedVariant[]) => void;
  selectVariant: (id: string | null) => void;
  updateVariant: (id: string, patch: Partial<GeneratedVariant>) => void;
  setGenerating: (b: boolean) => void;
  setUploading: (b: boolean) => void;
  setMinting: (b: boolean) => void;
  addRecentMeme: (m: Meme) => void;
  reset: () => void;
};

export const useForgeStore = create<ForgeState>()(
  persist(
    (set) => ({
      prompt: "",
      variants: [],
      selectedVariantId: null,
      isGenerating: false,
      isUploading: false,
      isMinting: false,
      recentMemes: [],

      setPrompt: (p) => set({ prompt: p }),
      setVariants: (v) =>
        set({ variants: v, selectedVariantId: v[0]?.id ?? null }),
      selectVariant: (id) => set({ selectedVariantId: id }),
      updateVariant: (id, patch) =>
        set((s) => ({
          variants: s.variants.map((v) => (v.id === id ? { ...v, ...patch } : v)),
        })),
      setGenerating: (b) => set({ isGenerating: b }),
      setUploading: (b) => set({ isUploading: b }),
      setMinting: (b) => set({ isMinting: b }),
      addRecentMeme: (m) =>
        set((s) => ({ recentMemes: [m, ...s.recentMemes].slice(0, 50) })),
      reset: () =>
        set({
          prompt: "",
          variants: [],
          selectedVariantId: null,
          isGenerating: false,
          isUploading: false,
          isMinting: false,
        }),
    }),
    {
      name: "memeloom-forge",
      partialize: (s) => ({
        recentMemes: s.recentMemes,
      }),
    }
  )
);
