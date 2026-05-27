import type { CheerioAPI } from "cheerio";

export type SiteType =
  | "search-engine"
  | "marketing"
  | "ecommerce"
  | "blog"
  | "service-business"
  | "documentation"
  | "portfolio"
  | "unknown";

export type SiteTypeResult = {
  type: SiteType;
  confidence: number; // 0-1
  signals: string[];
};

export function detectSiteType(
  $: CheerioAPI,
  html: string,
  url: string
): SiteTypeResult {
  const signals: Array<{ type: SiteType; weight: number; signal: string }> = [];

  const lowerHtml = html.toLowerCase();
  const bodyText = $("body").text().trim();
  const wordCount = bodyText.split(/\s+/).filter(Boolean).length;
  const forms = $("form").length;
  const searchInputs = $('input[type="search"], input[name*="search" i], input[name="q"]').length;
  const carts = $(
    '[class*="cart" i], [id*="cart" i], a[href*="/cart"], a[href*="/checkout"]'
  ).length;
  const productLinks = $('a[href*="/product"], a[href*="/products/"], a[href*="/shop"]').length;
  const articleEls = $("article").length;
  const blogLinks = $('a[href*="/blog/"], a[href*="/posts/"], a[href*="/articles/"]').length;
  const codeBlocks = $("pre, code").length;
  const phoneHref = $('a[href^="tel:"]').length;
  const mapEmbeds = $(
    'iframe[src*="maps.google"], iframe[src*="google.com/maps"]'
  ).length;

  // Search engine signals
  if (searchInputs > 0 && wordCount < 200 && forms <= 2) {
    signals.push({
      type: "search-engine",
      weight: 4,
      signal: `Search input present, ${wordCount} words of body — looks like a utility/search homepage`,
    });
  }
  if (/google|bing|duckduckgo|searx|kagi/i.test(url) && wordCount < 150) {
    signals.push({ type: "search-engine", weight: 3, signal: "URL matches known search engine" });
  }

  // E-commerce signals
  if (carts > 0) {
    signals.push({ type: "ecommerce", weight: 3, signal: `${carts} cart/checkout elements` });
  }
  if (productLinks >= 3) {
    signals.push({
      type: "ecommerce",
      weight: 2,
      signal: `${productLinks} product/shop links`,
    });
  }
  if (/shopify|woocommerce|bigcommerce|stripe checkout/i.test(lowerHtml)) {
    signals.push({ type: "ecommerce", weight: 2, signal: "E-commerce platform detected in HTML" });
  }

  // Service business signals (Brevard County trade pattern)
  if (phoneHref >= 2) {
    signals.push({
      type: "service-business",
      weight: 3,
      signal: `${phoneHref} tel: links — service business pattern`,
    });
  }
  if (mapEmbeds > 0) {
    signals.push({
      type: "service-business",
      weight: 2,
      signal: "Google Maps embed (local business)",
    });
  }
  if (
    /\b(quote|estimate|free quote|book now|schedule|service area|emergency|24\/?7|licensed|insured)\b/i.test(
      bodyText
    ) &&
    phoneHref > 0
  ) {
    signals.push({
      type: "service-business",
      weight: 2,
      signal: "Service-business language + phone link",
    });
  }

  // Blog signals
  if (articleEls >= 3 && blogLinks >= 3) {
    signals.push({ type: "blog", weight: 3, signal: "Multiple <article> + blog links" });
  } else if (articleEls >= 5) {
    signals.push({ type: "blog", weight: 2, signal: `${articleEls} article elements` });
  }

  // Documentation signals
  if (codeBlocks >= 10) {
    signals.push({ type: "documentation", weight: 3, signal: `${codeBlocks} code blocks` });
  }
  if (
    /\b(api reference|getting started|installation|sdk|usage|examples)\b/i.test(bodyText) &&
    codeBlocks >= 3
  ) {
    signals.push({
      type: "documentation",
      weight: 2,
      signal: "Documentation language + code samples",
    });
  }

  // Marketing site — default for SaaS / B2B (broad signals)
  const hasFeatureBlocks =
    /\b(features?|pricing|customers?|case studies?|enterprise)\b/i.test(bodyText);
  const hasCtas = $('a[href*="signup"], a[href*="get-started"], button:contains("Start"), button:contains("Get started")').length;
  if (hasFeatureBlocks && hasCtas > 0 && wordCount > 200) {
    signals.push({
      type: "marketing",
      weight: 2,
      signal: "Has features/pricing language + signup CTAs",
    });
  }
  if (
    /trusted by|backed by|loved by|case study|customer story/i.test(bodyText) &&
    wordCount > 300
  ) {
    signals.push({ type: "marketing", weight: 1, signal: "Social proof language present" });
  }

  // Portfolio signals
  if (
    /\b(portfolio|selected work|recent projects|case studies)\b/i.test(bodyText) &&
    wordCount < 500
  ) {
    signals.push({ type: "portfolio", weight: 2, signal: "Portfolio language" });
  }

  // Aggregate scores
  const scores = new Map<SiteType, number>();
  const types = new Map<SiteType, string[]>();
  for (const s of signals) {
    scores.set(s.type, (scores.get(s.type) || 0) + s.weight);
    const list = types.get(s.type) || [];
    list.push(s.signal);
    types.set(s.type, list);
  }

  if (scores.size === 0) {
    return { type: "unknown", confidence: 0, signals: [] };
  }

  // Pick highest-scored type
  let bestType: SiteType = "unknown";
  let bestScore = 0;
  for (const [t, score] of scores) {
    if (score > bestScore) {
      bestScore = score;
      bestType = t;
    }
  }

  // Total signal weight as confidence proxy
  const totalSignal = Array.from(scores.values()).reduce((a, b) => a + b, 0);
  const confidence = Math.min(1, bestScore / Math.max(4, totalSignal));

  return {
    type: bestType,
    confidence,
    signals: types.get(bestType) || [],
  };
}

export const SITE_TYPE_LABEL: Record<SiteType, string> = {
  "search-engine": "Search engine / utility",
  marketing: "Marketing site",
  ecommerce: "E-commerce store",
  blog: "Blog or publication",
  "service-business": "Local service business",
  documentation: "Documentation",
  portfolio: "Portfolio",
  unknown: "Uncategorized",
};
