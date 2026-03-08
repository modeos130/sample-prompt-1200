import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sample Prompt 1200 · 130 MODE",
  description:
    "AI-powered sample analysis for hip-hop producers. Drop any audio — get genre-tailored prompts for Suno, Udio & Sampla.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#080a0c] text-[#eef2f7] antialiased">{children}</body>
    </html>
  );
}
