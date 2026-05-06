import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BOOMAN LAB — AI Music Production Studio",
  description:
    "Private AI music production tools for sample-minded producers: sound generation, prompt design, sample analysis, and crate-inspired creative workflows.",
  openGraph: {
    title: "BOOMAN LAB — AI Music Production Studio",
    description:
      "Private AI music production tools for sample-minded producers: sound generation, prompt design, sample analysis, and crate-inspired creative workflows.",
    type: "website",
  },
  robots: {
    index: false,
    follow: false,
  },
};

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
