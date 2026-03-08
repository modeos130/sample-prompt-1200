import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sample Prompt 1200 · 130 MODE",
  description:
    "AI-powered sample analysis for hip-hop producers. Drop any audio — get genre-tailored prompts for Suno, Udio & Sampla.",
  openGraph: {
    title: "Sample Prompt 1200 · 130 MODE",
    description:
      "Era-locked AI genre analysis. Drop a sample, get a prompt — no drums, no artist names, pure sonic DNA.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#c9a84c" />
        <meta name="color-scheme" content="dark" />
      </head>
      <body className="min-h-screen bg-[#080a0c] text-[#eef2f7] antialiased">{children}</body>
    </html>
  );
}
