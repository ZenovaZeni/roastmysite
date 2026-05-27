import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/compare", "/zenova", "/about"],
        disallow: ["/api/"],
      },
    ],
    sitemap: `${BRAND.prodOrigin}/sitemap.xml`,
    host: BRAND.prodOrigin,
  };
}
