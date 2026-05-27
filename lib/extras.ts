import type { CheerioAPI } from "cheerio";

export type WaybackInfo = {
  firstSnapshot: string | null;
  lastSnapshot: string | null;
  yearsTracked: number | null;
  daysSinceLastSnapshot: number | null;
};

export type TechStack = {
  platform: string | null;
  cms: string | null;
  builder: string | null;
  ecommerce: string | null;
  analytics: string[];
  fonts: string[];
  hints: string[];
};

export type SecurityHeaders = {
  grade: string | null;
  score: number | null;
  url: string;
  testedAt: string | null;
};

export type PSIResult = {
  strategy: "mobile" | "desktop";
  scores: {
    performance: number | null;
    accessibility: number | null;
    bestPractices: number | null;
    seo: number | null;
    pwa: number | null;
  };
  vitals: {
    lcp: number | null; // ms
    fcp: number | null; // ms
    cls: number | null;
    tbt: number | null; // ms
    si: number | null; // speed index, ms
    inp: number | null; // ms
  };
  opportunities: Array<{
    id: string;
    title: string;
    savingsMs: number | null;
    description: string;
  }>;
};

export type DomainInfo = {
  registered: string | null;
  registrar: string | null;
  ageYears: number | null;
  expires: string | null;
};

const FETCH_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; RoastMySite/1.0)",
};

const ABORT_MS = 6000;

export async function fetchWayback(
  url: string,
  lastModifiedHeader: string | null
): Promise<WaybackInfo> {
  const empty: WaybackInfo = {
    firstSnapshot: null,
    lastSnapshot: null,
    yearsTracked: null,
    daysSinceLastSnapshot: null,
  };

  const host = (() => {
    try {
      return new URL(url).host;
    } catch {
      return null;
    }
  })();

  let firstSnapshot: string | null = null;
  let lastSnapshot: string | null = null;
  const now = new Date();

  // Try Wayback CDX for the FIRST snapshot ever (durable, ~1s)
  if (host) {
    try {
      const ctrl = AbortSignal.timeout(ABORT_MS);
      const res = await fetch(
        `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(
          host
        )}&output=json&limit=1&fl=timestamp&matchType=exact`,
        { signal: ctrl, headers: FETCH_HEADERS }
      );
      if (res.ok) {
        const data: string[][] = await res.json();
        const ts = data?.[1]?.[0];
        if (ts && ts.length >= 8) {
          const y = Number(ts.slice(0, 4));
          const mo = Number(ts.slice(4, 6)) - 1;
          const d = Number(ts.slice(6, 8));
          firstSnapshot = new Date(Date.UTC(y, mo, d)).toISOString();
        }
      }
    } catch {
      // ignore
    }
  }

  // Use Last-Modified header from the live site as the "last update" signal
  if (lastModifiedHeader) {
    const lm = new Date(lastModifiedHeader);
    if (!isNaN(lm.getTime())) {
      lastSnapshot = lm.toISOString();
    }
  }

  // If both available, compute years tracked + days since last
  let yearsTracked: number | null = null;
  let daysSinceLastSnapshot: number | null = null;
  if (firstSnapshot && lastSnapshot) {
    const first = new Date(firstSnapshot);
    const last = new Date(lastSnapshot);
    yearsTracked = Math.floor(
      (last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
    );
  }
  if (lastSnapshot) {
    daysSinceLastSnapshot = Math.floor(
      (now.getTime() - new Date(lastSnapshot).getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  if (!firstSnapshot && !lastSnapshot) return empty;

  return {
    firstSnapshot,
    lastSnapshot,
    yearsTracked,
    daysSinceLastSnapshot,
  };
}

export function detectTechStack(
  $: CheerioAPI,
  html: string,
  headers: Headers
): TechStack {
  const stack: TechStack = {
    platform: null,
    cms: null,
    builder: null,
    ecommerce: null,
    analytics: [],
    fonts: [],
    hints: [],
  };

  const poweredBy = headers.get("x-powered-by") || "";
  const server = headers.get("server") || "";
  const generator = $('meta[name="generator"]').attr("content") || "";

  // Strong signatures only — must appear in HEAD, generator tag, or as exact path
  // Use the actual link/script src attributes, not random text

  // WordPress — needs actual /wp-content/ or /wp-includes/ path OR explicit generator
  if (
    /\/wp-content\/|\/wp-includes\//.test(html) ||
    /wordpress\s*\d/i.test(generator)
  ) {
    stack.cms = "WordPress";
  }
  // Wix — wixstatic CDN or wix-specific data attributes
  if (/static\.wixstatic\.com|data-wix-/i.test(html) || /^wix\.com$/i.test(generator)) {
    stack.builder = "Wix";
  }
  // Squarespace — static\d.squarespace.com CDN
  if (/static\d?\.squarespace\.com/i.test(html)) {
    stack.builder = "Squarespace";
  }
  // Shopify — cdn.shopify.com OR Shopify.theme JS global
  if (/cdn\.shopify\.com|Shopify\.theme|window\.Shopify/i.test(html)) {
    stack.ecommerce = "Shopify";
  }
  // Webflow — generator tag OR webflow.com CDN
  if (/^Webflow/i.test(generator) || /assets\.website-files\.com|webflow\.io/i.test(html)) {
    stack.builder = "Webflow";
  }
  // Framer — framerusercontent CDN
  if (/framerusercontent\.com/i.test(html)) {
    stack.builder = "Framer";
  }
  // GoDaddy Builder — specific CDN
  if (/dpbnri2zg3lc8\.cloudfront\.net|websitebuilder\.godaddy\.com/i.test(html)) {
    stack.builder = "GoDaddy Builder";
  }
  // Duda — specific CDN
  if (/static\.cdn-website\.com|irp\.cdn-website\.com/i.test(html)) {
    stack.builder = "Duda";
  }
  // Next.js — _next/static folder
  if (/\/_next\/static/.test(html)) {
    stack.platform = "Next.js";
  }
  // Nuxt — needs explicit __NUXT__ global, not just any /_nuxt/ folder reference
  else if (/window\.__NUXT__\s*=/.test(html)) {
    stack.platform = "Nuxt";
  }
  // Astro
  else if (/data-astro-/.test(html) || /^Astro/i.test(generator)) {
    stack.platform = "Astro";
  }
  // SvelteKit
  else if (/__sveltekit_/.test(html)) {
    stack.platform = "SvelteKit";
  }
  // Gatsby
  else if (/window\.___gatsby/.test(html) || /^Gatsby/i.test(generator)) {
    stack.platform = "Gatsby";
  }

  // E-commerce add-ons
  if (/woocommerce|wc-block/i.test(html) && stack.cms === "WordPress") {
    stack.ecommerce = stack.ecommerce || "WooCommerce";
  }
  if (/cdn\.bigcommerce\.com/i.test(html)) {
    stack.ecommerce = "BigCommerce";
  }

  // Analytics — require specific URL signatures, not text mentions
  if (/googletagmanager\.com\/gtag\/js|googletagmanager\.com\/gtm\.js|google-analytics\.com\/analytics\.js/i.test(html))
    stack.analytics.push("Google Analytics");
  if (/connect\.facebook\.net\/[^/]+\/fbevents\.js/i.test(html))
    stack.analytics.push("Facebook Pixel");
  if (/clarity\.ms\/tag/i.test(html)) stack.analytics.push("Microsoft Clarity");
  if (/static\.hotjar\.com|script\.hotjar\.com/i.test(html))
    stack.analytics.push("Hotjar");
  if (/plausible\.io\/js/i.test(html)) stack.analytics.push("Plausible");
  if (/app\.posthog\.com|us\.i\.posthog\.com/i.test(html)) stack.analytics.push("PostHog");
  if (/static\.cloudflareinsights\.com/i.test(html))
    stack.analytics.push("Cloudflare Web Analytics");
  stack.analytics = Array.from(new Set(stack.analytics));

  // Fonts — only Google Fonts loaded via stylesheet, capped at 4
  $('link[rel="stylesheet"][href*="fonts.googleapis.com"]').each((_, el) => {
    const href = $(el).attr("href") || "";
    const families = href.match(/family=([^&]+)/g) || [];
    for (const f of families) {
      const fam = decodeURIComponent(f.replace(/^family=/, "").split(":")[0].replace(/\+/g, " "));
      if (fam) stack.fonts.push(fam);
    }
  });
  $('link[rel="stylesheet"][href*="use.typekit.net"]').each(() => {
    stack.fonts.push("Adobe Fonts (Typekit)");
  });
  stack.fonts = Array.from(new Set(stack.fonts)).slice(0, 4);

  // Server hints
  if (server) stack.hints.push(`Server: ${server}`);
  if (poweredBy) stack.hints.push(`X-Powered-By: ${poweredBy}`);
  if (generator) stack.hints.push(`Generator: ${generator}`);

  return stack;
}

export async function fetchPageSpeedInsights(
  url: string,
  strategy: "mobile" | "desktop" = "mobile"
): Promise<PSIResult | null> {
  try {
    const ctrl = AbortSignal.timeout(20000);
    const apiKey = process.env.PSI_API_KEY;
    const qs = new URLSearchParams({
      url,
      strategy,
      category: "performance",
    });
    qs.append("category", "accessibility");
    qs.append("category", "best-practices");
    qs.append("category", "seo");
    if (apiKey) qs.set("key", apiKey);

    const res = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${qs.toString()}`,
      { signal: ctrl, headers: FETCH_HEADERS }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const cats = data?.lighthouseResult?.categories || {};
    const audits = data?.lighthouseResult?.audits || {};

    const opportunities = Object.values(audits as Record<string, any>)
      .filter(
        (a: any) =>
          a?.details?.type === "opportunity" &&
          typeof a?.details?.overallSavingsMs === "number" &&
          a.details.overallSavingsMs > 0
      )
      .map((a: any) => ({
        id: a.id,
        title: a.title,
        savingsMs: a.details?.overallSavingsMs ?? null,
        description: (a.description || "").replace(/\[Learn.*?\)/g, "").trim(),
      }))
      .sort((a, b) => (b.savingsMs || 0) - (a.savingsMs || 0))
      .slice(0, 5);

    const toScore = (k: string): number | null => {
      const s = cats[k]?.score;
      return typeof s === "number" ? Math.round(s * 100) : null;
    };
    const toMs = (k: string): number | null => {
      const v = audits[k]?.numericValue;
      return typeof v === "number" ? Math.round(v) : null;
    };
    const toNum = (k: string): number | null => {
      const v = audits[k]?.numericValue;
      return typeof v === "number" ? Number(v.toFixed(3)) : null;
    };

    return {
      strategy,
      scores: {
        performance: toScore("performance"),
        accessibility: toScore("accessibility"),
        bestPractices: toScore("best-practices"),
        seo: toScore("seo"),
        pwa: toScore("pwa"),
      },
      vitals: {
        lcp: toMs("largest-contentful-paint"),
        fcp: toMs("first-contentful-paint"),
        cls: toNum("cumulative-layout-shift"),
        tbt: toMs("total-blocking-time"),
        si: toMs("speed-index"),
        inp: toMs("interaction-to-next-paint"),
      },
      opportunities,
    };
  } catch {
    return null;
  }
}

export async function fetchDomainInfo(host: string): Promise<DomainInfo | null> {
  try {
    // Strip subdomain for whois — use the registrable domain
    const parts = host.split(".");
    const registrable =
      parts.length >= 2 ? parts.slice(-2).join(".") : host;

    // Use dynamic import for the CJS-only whois-json module
    const whois = (await import("whois-json")).default as (
      domain: string,
      opts?: Record<string, unknown>
    ) => Promise<Record<string, string>>;

    const data = await Promise.race([
      whois(registrable, { follow: 2, timeout: 6000 }),
      new Promise<Record<string, string>>((_, rej) =>
        setTimeout(() => rej(new Error("whois timeout")), 6000)
      ),
    ]);

    const created =
      data.creationDate ||
      data.createdDate ||
      data.created ||
      data.registered ||
      data.registeredOn ||
      data.domainRegistrationDate ||
      null;
    const registrar = data.registrar || data.sponsoringRegistrar || null;
    const expires =
      data.registryExpiryDate ||
      data.expirationDate ||
      data.expiresOn ||
      data.registrarRegistrationExpirationDate ||
      null;

    let ageYears: number | null = null;
    if (created) {
      const d = new Date(created);
      if (!isNaN(d.getTime())) {
        ageYears = Math.floor(
          (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
        );
      }
    }

    if (!created && !registrar) return null;

    return {
      registered: created ? new Date(created).toISOString() : null,
      registrar,
      ageYears,
      expires: expires ? new Date(expires).toISOString() : null,
    };
  } catch {
    return null;
  }
}

export async function fetchObservatory(host: string): Promise<SecurityHeaders | null> {
  try {
    const ctrl = AbortSignal.timeout(ABORT_MS);
    const res = await fetch(
      `https://observatory-api.mdn.mozilla.net/api/v2/analyze?host=${encodeURIComponent(host)}`,
      { method: "POST", signal: ctrl, headers: FETCH_HEADERS }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const grade: string | null = data?.scan?.grade ?? data?.grade ?? null;
    const score: number | null =
      typeof data?.scan?.score === "number"
        ? data.scan.score
        : typeof data?.score === "number"
        ? data.score
        : null;
    if (!grade && score === null) return null;
    return {
      grade,
      score,
      url: `https://developer.mozilla.org/en-US/observatory/analyze?host=${encodeURIComponent(host)}`,
      testedAt: data?.scan?.scanned_at ?? null,
    };
  } catch {
    return null;
  }
}
