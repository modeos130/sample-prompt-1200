import type { MetadataRoute } from "next";
import { isPrivateBeta, publicSitemapPaths, siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  if (isPrivateBeta) {
    return [];
  }

  return publicSitemapPaths.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: path === "/" || path === "/vibe-to-prompt.html" ? 1 : 0.5,
  }));
}
