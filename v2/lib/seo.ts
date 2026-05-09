import type { Metadata } from "next";

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://boomanlab.com";

function normalizeSiteUrl(value: string) {
  try {
    return new URL(value).origin;
  } catch {
    return "https://boomanlab.com";
  }
}

export const siteUrl = normalizeSiteUrl(rawSiteUrl);
export const isPrivateBeta = process.env.BOOMAN_SITE_VISIBILITY !== "public";

export const publicSitemapPaths = [
  "/",
  "/vibe-to-prompt.html",
  "/terms",
  "/privacy",
  "/acceptable-use",
  "/copyright",
];

export const privateAppPaths = [
  "/home",
  "/studio.html",
  "/prompts",
  "/analyze",
  "/create.html",
  "/account",
  "/admin/",
];

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "BOOMAN LAB - AI Music Production Studio",
  description:
    "Private AI music production tools for sample-minded producers: sound generation, prompt design, sample analysis, and crate-inspired creative workflows.",
  openGraph: {
    title: "BOOMAN LAB - AI Music Production Studio",
    description:
      "Private AI music production tools for sample-minded producers: sound generation, prompt design, sample analysis, and crate-inspired creative workflows.",
    siteName: "BOOMAN LAB",
    url: siteUrl,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BOOMAN LAB - AI Music Production Studio",
    description:
      "Private AI music production tools for sample-minded producers: sound generation, prompt design, sample analysis, and crate-inspired creative workflows.",
  },
  robots: {
    index: !isPrivateBeta,
    follow: !isPrivateBeta,
  },
};
