import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Memeloom — AI Meme Forge on 0G",
  description:
    "Generate, curate, and mint AI-native memes with permanent provenance on 0G Storage. Built for the 0G Zero Cup Vibe Coding Tournament.",
  keywords: [
    "Memeloom",
    "0G",
    "meme",
    "AI",
    "NFT",
    "Storage",
    "Vibe Coding",
    "Zero Cup",
  ],
  openGraph: {
    title: "Memeloom — AI Meme Forge on 0G",
    description: "Weave memes into the permanent web. AI-native, on-chain provenance.",
    type: "website",
  },
  twitter: { card: "summary_large_image", creator: "@memeloom" },
};

export const viewport: Viewport = {
  themeColor: "#ff5a14",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geist.variable} ${geistMono.variable} ${spaceGrotesk.variable} font-sans min-h-screen`}
      >
        <Providers>
          <Navbar />
          <main className="relative">{children}</main>
          <footer className="border-t border-white/5 mt-32 py-12">
            <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
              <p className="font-display text-base text-gradient-fire">
                Memeloom
              </p>
              <p className="mt-2">
                Weaving memes into the permanent web · 0G Zero Cup 2026
              </p>
              <p className="mt-4 text-xs opacity-60">
                Built with 0G Chain · 0G Storage · 0G Compute
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
