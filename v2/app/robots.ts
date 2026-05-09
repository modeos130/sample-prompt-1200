import type { MetadataRoute } from "next";
import { isPrivateBeta, privateAppPaths, siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  if (isPrivateBeta) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: privateAppPaths,
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
