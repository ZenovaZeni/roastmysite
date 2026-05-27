import * as cheerio from "cheerio";

export type DiscoveredPage = {
  url: string;
  source: "sitemap" | "homepage-link" | "heuristic";
  importance: number; // 0-100, higher = more important
  guessType: PageType;
};

export type PageType =
  | "homepage"
  | "pricing"
  | "about"
  | "contact"
  | "services"
  | "features"
  | "blog"
  | "product"
  | "other";

const KEY_PATHS: Array<{ pattern: RegExp; type: PageType; importance: number }> = [
  { pattern: /^\/?$/, type: "homepage", importance: 100 },
  { pattern: /^\/pricing\/?$/i, type: "pricing", importance: 90 },
  { pattern: /^\/plans?\/?$/i, type: "pricing", importance: 85 },
  { pattern: /^\/about\/?$/i, type: "about", importance: 75 },
  { pattern: /^\/contact\/?$/i, type: "contact", importance: 80 },
  { pattern: /^\/services\/?$/i, type: "services", importance: 80 },
  { pattern: /^\/features\/?$/i, type: "features", importance: 70 },
  { pattern: /^\/product\/?$/i, type: "product", importance: 70 },
  { pattern: /^\/blog\/?$/i, type: "blog", importance: 50 },
];

function guessTypeFor(pathname: string): { type: PageType; importance: number } {
  for (const k of KEY_PATHS) {
    if (k.pattern.test(pathname)) return { type: k.type, importance: k.importance };
  }
  return { type: "other", importance: 30 };
}

async function fetchSitemap(baseUrl: string): Promise<string[]> {
  const candidates = ["/sitemap.xml", "/sitemap_index.xml", "/sitemap-index.xml"];
  for (const path of candidates) {
    try {
      const ctrl = AbortSignal.timeout(5000);
      const res = await fetch(new URL(path, baseUrl).toString(), {
        signal: ctrl,
        headers: { "User-Agent": "RoastMySite/1.0 (+sitemap)" },
      });
      if (!res.ok) continue;
      const xml = await res.text();
      // Naive parse — pull <loc> tags
      const matches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/gi)];
      const urls = matches.map((m) => m[1].trim()).filter(Boolean);

      // If this is a sitemap index, fetch the first child sitemap
      if (urls.some((u) => u.endsWith(".xml"))) {
        const childUrl = urls.find((u) => u.endsWith(".xml"));
        if (childUrl) {
          try {
            const childCtrl = AbortSignal.timeout(5000);
            const childRes = await fetch(childUrl, {
              signal: childCtrl,
              headers: { "User-Agent": "RoastMySite/1.0" },
            });
            if (childRes.ok) {
              const childXml = await childRes.text();
              const childMatches = [...childXml.matchAll(/<loc>([^<]+)<\/loc>/gi)];
              return childMatches.map((m) => m[1].trim()).filter(Boolean);
            }
          } catch {
            // ignore
          }
        }
      }

      return urls;
    } catch {
      // try next path
    }
  }
  return [];
}

function extractHomepageLinks(homepageHtml: string, baseUrl: string): string[] {
  try {
    const $ = cheerio.load(homepageHtml);
    const links = new Set<string>();
    const baseHost = new URL(baseUrl).host;

    $("a[href]").each((_, el) => {
      const href = $(el).attr("href");
      if (!href) return;
      try {
        const u = new URL(href, baseUrl);
        if (u.host !== baseHost) return; // skip external
        if (u.pathname === "/" || u.pathname === "") return; // skip self
        // strip query + hash for dedupe
        u.search = "";
        u.hash = "";
        links.add(u.toString());
      } catch {
        // skip malformed
      }
    });

    return Array.from(links);
  } catch {
    return [];
  }
}

export async function discoverPages(
  homepageUrl: string,
  homepageHtml: string,
  limit = 5
): Promise<DiscoveredPage[]> {
  const baseUrl = new URL(homepageUrl);
  baseUrl.pathname = "/";
  baseUrl.search = "";
  baseUrl.hash = "";

  // Always include the homepage as #1
  const pages: DiscoveredPage[] = [
    {
      url: homepageUrl,
      source: "homepage-link",
      importance: 100,
      guessType: "homepage",
    },
  ];

  const seen = new Set<string>([homepageUrl, baseUrl.toString()]);
  const baseHost = baseUrl.host;

  // 1. Try sitemap
  const sitemapUrls = await fetchSitemap(baseUrl.toString());
  const fromSitemap: DiscoveredPage[] = [];
  for (const url of sitemapUrls) {
    try {
      const u = new URL(url);
      if (u.host !== baseHost) continue;
      const path = u.pathname;
      const { type, importance } = guessTypeFor(path);
      if (type === "homepage") continue; // skip dup
      if (seen.has(u.toString())) continue;
      seen.add(u.toString());
      fromSitemap.push({
        url: u.toString(),
        source: "sitemap",
        importance,
        guessType: type,
      });
    } catch {
      // skip
    }
  }

  // 2. Also scrape homepage for key links
  const homepageLinks = extractHomepageLinks(homepageHtml, homepageUrl);
  const fromHomepage: DiscoveredPage[] = [];
  for (const url of homepageLinks) {
    try {
      const u = new URL(url);
      const path = u.pathname;
      const { type, importance } = guessTypeFor(path);
      if (type === "homepage") continue;
      if (seen.has(u.toString())) continue;
      seen.add(u.toString());
      fromHomepage.push({
        url: u.toString(),
        source: "homepage-link",
        importance,
        guessType: type,
      });
    } catch {
      // skip
    }
  }

  // 3. Combine, sort by importance, dedupe by type (only one of each type)
  const combined = [...fromSitemap, ...fromHomepage].sort(
    (a, b) => b.importance - a.importance
  );

  const typesSeen = new Set<PageType>(["homepage"]);
  for (const page of combined) {
    if (pages.length >= limit) break;
    if (typesSeen.has(page.guessType)) continue;
    typesSeen.add(page.guessType);
    pages.push(page);
  }

  // 4. If we still have slots, add the highest-importance pages even if duplicate types
  if (pages.length < limit) {
    for (const page of combined) {
      if (pages.length >= limit) break;
      if (pages.some((p) => p.url === page.url)) continue;
      pages.push(page);
    }
  }

  return pages;
}
