import { defaultMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#ff4d6d" />
        <meta name="color-scheme" content="dark" />
      </head>
      <body className="min-h-screen bg-[#0a0a0f] text-[#f0f0f8] antialiased">{children}</body>
    </html>
  );
}
