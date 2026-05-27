import type { AuditResult } from "./audit";

export type AffiliateCategory =
  | "hosting"
  | "site-builder"
  | "ecommerce"
  | "seo"
  | "speed"
  | "images"
  | "forms"
  | "email"
  | "analytics"
  | "security"
  | "accessibility"
  | "ai-builder"
  | "booking"
  | "reviews"
  | "domain"
  | "service"; // human service (Lead Flow, etc.)

export type AffiliateTier = "premium" | "budget" | "free";

export type AffiliateTool = {
  id: string;
  name: string;
  category: AffiliateCategory;
  tier: AffiliateTier;
  oneLiner: string;
  pitch: string; // Sentence used when this is recommended
  url: string; // Replace REPLACE_ID with your real affiliate ID
  commissionNote?: string; // For Josh's reference, not shown to users
  matchTriggers: Array<keyof FailureFlags>; // Which audit failures this tool addresses
  bonusForPlatform?: string[]; // tech stack matches that boost ranking
  badge?: "best-pick" | "trending" | "free" | "premium";
};

// The set of failure dimensions the recommendation engine watches
export type FailureFlags = {
  noHttps: boolean;
  slowLcp: boolean;
  highTbt: boolean;
  bigPage: boolean;
  badPerf: boolean;
  badSeo: boolean;
  badA11y: boolean;
  badBestPractices: boolean;
  thinContent: boolean;
  noContact: boolean;
  noForm: boolean;
  noAnalytics: boolean;
  noSchema: boolean;
  noOgImage: boolean;
  badSecurityHeaders: boolean;
  staleSite: boolean;
  isWordPress: boolean;
  isShopify: boolean;
  isWix: boolean;
  isSquarespace: boolean;
  isUnknownBuilder: boolean;
  manyAxeViolations: boolean;
};

// ============================================================================
// THE AFFILIATE LIBRARY
// Replace REPLACE_ID with real IDs once Josh signs up to each program.
// Commission notes are for Josh's planning — not shown to users.
// ============================================================================

export const AFFILIATES: AffiliateTool[] = [
  // --- HOSTING ---
  {
    id: "hostinger",
    name: "Hostinger",
    category: "hosting",
    tier: "budget",
    oneLiner: "Cheap, fast hosting with free SSL. Migration in under an hour.",
    pitch:
      "If your SSL is broken or your load time is slow, this fixes both for ~$3/mo. Hostinger's free SSL is one-click and their LiteSpeed servers crush most competitors on LCP.",
    url: "https://www.hostinger.com/?REPLACE_AFFILIATE_ID",
    commissionNote: "$100-150 per sale, one-time",
    matchTriggers: ["noHttps", "slowLcp", "badPerf"],
    badge: "best-pick",
  },
  {
    id: "cloudways",
    name: "Cloudways",
    category: "hosting",
    tier: "premium",
    oneLiner: "Managed cloud hosting on DigitalOcean/Vultr/AWS — the pro upgrade.",
    pitch:
      "If you're outgrowing shared hosting and your TBT is hurting, Cloudways manages a real cloud server for you. ~$14/mo entry, scales linearly.",
    url: "https://www.cloudways.com/en/?id=REPLACE_AFFILIATE_ID",
    commissionNote: "8% recurring lifetime OR $50-125 one-time",
    matchTriggers: ["slowLcp", "highTbt", "badPerf"],
  },
  {
    id: "kinsta",
    name: "Kinsta",
    category: "hosting",
    tier: "premium",
    oneLiner: "Premium managed WordPress hosting on Google Cloud.",
    pitch:
      "Kinsta is the gold standard for WordPress sites that need to be fast. Worth the price if your business depends on the site.",
    url: "https://kinsta.com/?kaid=REPLACE_AFFILIATE_ID",
    commissionNote: "$50-500 one-time + 10% recurring",
    matchTriggers: ["slowLcp", "badPerf", "highTbt"],
    bonusForPlatform: ["WordPress"],
  },
  {
    id: "wpengine",
    name: "WP Engine",
    category: "hosting",
    tier: "premium",
    oneLiner: "Enterprise WordPress hosting trusted by 1.5M sites.",
    pitch:
      "If you're on WordPress and serious, WP Engine handles security, caching, and CDN automatically.",
    url: "https://wpengine.com/?REPLACE_AFFILIATE_ID",
    commissionNote: "$200 per sale",
    matchTriggers: ["slowLcp", "badPerf", "badSecurityHeaders"],
    bonusForPlatform: ["WordPress"],
  },

  // --- SITE BUILDERS ---
  {
    id: "squarespace",
    name: "Squarespace",
    category: "site-builder",
    tier: "budget",
    oneLiner: "Templates worth using. Drag-and-drop with taste.",
    pitch:
      "If you can't afford a designer, this is the closest thing. Their newer templates score well on Lighthouse out of the box.",
    url: "https://www.squarespace.com/?channel=REPLACE_AFFILIATE_ID",
    commissionNote: "$100-200 per sale",
    matchTriggers: ["badSeo", "noContact", "noOgImage", "thinContent"],
    badge: "best-pick",
  },
  {
    id: "webflow",
    name: "Webflow",
    category: "site-builder",
    tier: "premium",
    oneLiner: "Designer-grade output without writing code.",
    pitch:
      "Best ROI for service businesses who want to look premium. Steeper learning curve than Squarespace, but ceiling is unlimited.",
    url: "https://webflow.com/?ref=REPLACE_AFFILIATE_ID",
    commissionNote: "$50-200 per sale + 20% recurring",
    matchTriggers: ["badSeo", "noContact", "noOgImage", "thinContent", "manyAxeViolations"],
    badge: "premium",
  },
  {
    id: "framer",
    name: "Framer",
    category: "site-builder",
    tier: "premium",
    oneLiner: "Fastest-loading templates on the planet. Looks expensive, isn't.",
    pitch:
      "Framer pages score 95+ on Lighthouse out of the box. Best choice if performance is your kill shot.",
    url: "https://framer.com/?via=REPLACE_AFFILIATE_ID",
    commissionNote: "30% recurring",
    matchTriggers: ["slowLcp", "highTbt", "badPerf", "bigPage"],
  },
  {
    id: "wix",
    name: "Wix",
    category: "site-builder",
    tier: "budget",
    oneLiner: "The most popular drag-and-drop builder.",
    pitch:
      "If you want maximum templates and AI-assisted setup, Wix has 900+ designs and an AI builder.",
    url: "https://www.wix.com/?REPLACE_AFFILIATE_ID",
    commissionNote: "$100 per Premium sale",
    matchTriggers: ["noContact", "thinContent"],
  },
  {
    id: "carrd",
    name: "Carrd",
    category: "site-builder",
    tier: "budget",
    oneLiner: "One-page sites for $19/year. Stupid simple, stupid fast.",
    pitch:
      "If you just need a working landing page TODAY, Carrd ships you one in 30 minutes for less than dinner.",
    url: "https://try.carrd.co/REPLACE_AFFILIATE_ID",
    commissionNote: "20% recurring",
    matchTriggers: ["thinContent", "noContact"],
    badge: "trending",
  },

  // --- AI WEBSITE BUILDERS ---
  {
    id: "10web",
    name: "10Web",
    category: "ai-builder",
    tier: "premium",
    oneLiner: "AI generates your whole WordPress site in 60 seconds.",
    pitch:
      "Describe your business, get a real WordPress site auto-built on Google Cloud. Perfect for service businesses.",
    url: "https://10web.io/?REPLACE_AFFILIATE_ID",
    commissionNote: "30% recurring",
    matchTriggers: ["thinContent", "noContact", "noOgImage", "badSeo"],
    badge: "trending",
  },
  {
    id: "hostinger-ai",
    name: "Hostinger AI Builder",
    category: "ai-builder",
    tier: "budget",
    oneLiner: "Hostinger's AI builder — site + hosting in one.",
    pitch:
      "Cheapest way to go from zero to a real website. Tell it what your business does, get a draft in minutes.",
    url: "https://www.hostinger.com/website-builder?REPLACE_AFFILIATE_ID",
    commissionNote: "Bundled with Hostinger commission",
    matchTriggers: ["thinContent", "noContact"],
  },

  // --- SPEED / CDN / IMAGES ---
  {
    id: "cloudflare",
    name: "Cloudflare",
    category: "speed",
    tier: "free",
    oneLiner: "Free CDN + DDoS protection + free SSL. No excuse not to.",
    pitch:
      "Free tier alone fixes most LCP problems for static sites. Add their free SSL and you've also fixed the security warning.",
    url: "https://www.cloudflare.com/",
    matchTriggers: ["slowLcp", "noHttps", "badPerf", "badSecurityHeaders"],
    badge: "free",
  },
  {
    id: "bunny-cdn",
    name: "BunnyCDN",
    category: "speed",
    tier: "budget",
    oneLiner: "Pay-as-you-go CDN — pennies per GB, faster than Cloudflare in many regions.",
    pitch:
      "If Cloudflare's free tier isn't cutting it, BunnyCDN starts at $1/mo and benchmarks faster.",
    url: "https://bunny.net/?ref=REPLACE_AFFILIATE_ID",
    commissionNote: "20% recurring",
    matchTriggers: ["slowLcp", "bigPage"],
  },
  {
    id: "shortpixel",
    name: "ShortPixel",
    category: "images",
    tier: "budget",
    oneLiner: "Compress every image on your site, automatically.",
    pitch:
      "If your images are slow, this is the fastest fix. Free tier handles 100 images/mo, paid scales to thousands.",
    url: "https://shortpixel.com/?ref=REPLACE_AFFILIATE_ID",
    commissionNote: "30% recurring",
    matchTriggers: ["slowLcp", "bigPage"],
  },
  {
    id: "nitropack",
    name: "NitroPack",
    category: "speed",
    tier: "premium",
    oneLiner: "One-click speed optimization for WordPress / Shopify / WooCommerce.",
    pitch:
      "Install NitroPack and your Lighthouse score usually jumps 30+ points overnight. Caches, compresses, lazy-loads everything.",
    url: "https://nitropack.io/?ref=REPLACE_AFFILIATE_ID",
    commissionNote: "30% recurring",
    matchTriggers: ["slowLcp", "highTbt", "badPerf", "bigPage"],
    bonusForPlatform: ["WordPress", "Shopify"],
    badge: "best-pick",
  },
  {
    id: "imagify",
    name: "Imagify",
    category: "images",
    tier: "budget",
    oneLiner: "WordPress image compression — set-and-forget.",
    pitch:
      "Made by the WP Rocket team. If you're on WordPress and images are dragging you down, install this and walk away.",
    url: "https://imagify.io/?coupon=REPLACE_AFFILIATE_ID",
    commissionNote: "30% recurring",
    matchTriggers: ["slowLcp", "bigPage"],
    bonusForPlatform: ["WordPress"],
  },
  {
    id: "wprocket",
    name: "WP Rocket",
    category: "speed",
    tier: "premium",
    oneLiner: "The premium WordPress caching plugin. One-click setup.",
    pitch:
      "If you're on WordPress, this is the single fastest perf upgrade. Cache, minify, lazy-load — all from a checklist.",
    url: "https://wp-rocket.me/?aff=REPLACE_AFFILIATE_ID",
    commissionNote: "20% recurring",
    matchTriggers: ["slowLcp", "highTbt", "badPerf"],
    bonusForPlatform: ["WordPress"],
  },

  // --- SEO ---
  {
    id: "semrush",
    name: "Semrush",
    category: "seo",
    tier: "premium",
    oneLiner: "See what your competitors rank for and steal their playbook.",
    pitch:
      "Industry standard. Free trial via my link, then $130/mo. Pays for itself in the first piece of content you rank.",
    url: "https://www.semrush.com/?ref=REPLACE_AFFILIATE_ID",
    commissionNote: "$200 per sale + recurring",
    matchTriggers: ["badSeo", "thinContent"],
    badge: "premium",
  },
  {
    id: "ahrefs",
    name: "Ahrefs",
    category: "seo",
    tier: "premium",
    oneLiner: "The most accurate backlink data in the industry.",
    pitch:
      "If you're competing in a tough local niche, Ahrefs shows you exactly which competitor links to steal.",
    url: "https://ahrefs.com/?REPLACE_AFFILIATE_ID",
    matchTriggers: ["badSeo"],
  },
  {
    id: "brightlocal",
    name: "BrightLocal",
    category: "seo",
    tier: "budget",
    oneLiner: "Local SEO automation — citation building + GBP optimization.",
    pitch:
      "For local businesses. Tracks your Google Business Profile rank, builds citations, automates review monitoring. $39/mo.",
    url: "https://www.brightlocal.com/?fpr=REPLACE_AFFILIATE_ID",
    commissionNote: "$40 per sale",
    matchTriggers: ["badSeo", "noSchema"],
    badge: "best-pick",
  },
  {
    id: "rankmath",
    name: "Rank Math (free)",
    category: "seo",
    tier: "free",
    oneLiner: "Free WordPress SEO plugin — adds schema, sitemaps, meta in clicks.",
    pitch:
      "If you're on WordPress and missing meta tags or schema, install this. Free tier is genuinely excellent.",
    url: "https://rankmath.com/",
    matchTriggers: ["badSeo", "noSchema"],
    bonusForPlatform: ["WordPress"],
    badge: "free",
  },
  {
    id: "yoast",
    name: "Yoast SEO",
    category: "seo",
    tier: "budget",
    oneLiner: "The original WordPress SEO plugin. Free + Premium tiers.",
    pitch:
      "Free version covers most needs. Premium ($99/yr) adds internal linking suggestions and bulk meta editing.",
    url: "https://yoast.com/?REPLACE_AFFILIATE_ID",
    commissionNote: "20% per sale",
    matchTriggers: ["badSeo", "noSchema"],
    bonusForPlatform: ["WordPress"],
  },

  // --- FORMS / CRM / LEAD CAPTURE ---
  {
    id: "tally",
    name: "Tally",
    category: "forms",
    tier: "free",
    oneLiner: "Beautiful forms, free forever. Notion-like editor.",
    pitch:
      "If you don't have a contact form, get one up in 5 minutes. Free tier is unusually generous.",
    url: "https://tally.so/?REPLACE_AFFILIATE_ID",
    matchTriggers: ["noForm", "noContact"],
    badge: "free",
  },
  {
    id: "typeform",
    name: "Typeform",
    category: "forms",
    tier: "premium",
    oneLiner: "Conversational forms that convert 2-3x better than standard ones.",
    pitch:
      "If you're losing leads on a boring form, switching to Typeform usually doubles completion rate. $25/mo.",
    url: "https://typeform.com/?REPLACE_AFFILIATE_ID",
    commissionNote: "20% recurring",
    matchTriggers: ["noForm", "noContact"],
  },
  {
    id: "formspree",
    name: "Formspree",
    category: "forms",
    tier: "budget",
    oneLiner: "Backend for HTML forms — no code, no signup for users.",
    pitch:
      "If you have a designer who'd rather write HTML than configure a form builder, Formspree handles the backend.",
    url: "https://formspree.io/?REPLACE_AFFILIATE_ID",
    matchTriggers: ["noForm"],
  },
  {
    id: "calendly",
    name: "Calendly",
    category: "booking",
    tier: "free",
    oneLiner: "The booking link you've probably already seen.",
    pitch:
      "If your contact path is 'call me', let people book themselves instead. Free tier is enough for most service businesses.",
    url: "https://calendly.com/?REPLACE_AFFILIATE_ID",
    matchTriggers: ["noContact", "noForm"],
    badge: "free",
  },
  {
    id: "calcom",
    name: "Cal.com",
    category: "booking",
    tier: "free",
    oneLiner: "Open-source Calendly alternative. Free + self-hostable.",
    pitch:
      "Same as Calendly but free forever for one user. Modern UI, group bookings, team rotation.",
    url: "https://cal.com/?REPLACE_AFFILIATE_ID",
    matchTriggers: ["noContact", "noForm"],
    badge: "free",
  },

  // --- EMAIL MARKETING ---
  {
    id: "convertkit",
    name: "Kit (ConvertKit)",
    category: "email",
    tier: "premium",
    oneLiner: "The creator-friendly email platform.",
    pitch:
      "If you don't have a newsletter, start one. Kit makes it easy enough that you'll actually send weekly.",
    url: "https://kit.com/?lmref=REPLACE_AFFILIATE_ID",
    commissionNote: "30% recurring for 24 months",
    matchTriggers: ["noForm", "thinContent"],
    badge: "best-pick",
  },
  {
    id: "beehiiv",
    name: "Beehiiv",
    category: "email",
    tier: "premium",
    oneLiner: "Modern newsletter platform with native monetization.",
    pitch:
      "If you want to grow AND monetize a newsletter, Beehiiv has ad network + recommendations built in. Free up to 2,500 subs.",
    url: "https://www.beehiiv.com/?via=REPLACE_AFFILIATE_ID",
    commissionNote: "$50 per paid signup + 30% recurring",
    matchTriggers: ["thinContent", "noForm"],
    badge: "trending",
  },
  {
    id: "mailerlite",
    name: "MailerLite",
    category: "email",
    tier: "free",
    oneLiner: "Free up to 1,000 subscribers. Surprisingly polished.",
    pitch:
      "The free starter pick for service businesses. Send up to 12,000 emails/month before paying a dime.",
    url: "https://www.mailerlite.com/?REPLACE_AFFILIATE_ID",
    commissionNote: "30% recurring",
    matchTriggers: ["noForm"],
    badge: "free",
  },

  // --- ANALYTICS ---
  {
    id: "ga4",
    name: "Google Analytics 4",
    category: "analytics",
    tier: "free",
    oneLiner: "Free, ubiquitous, slightly painful to learn.",
    pitch:
      "Free. Install it. At minimum see traffic + bounce rate. Bare-minimum table stakes.",
    url: "https://marketingplatform.google.com/about/analytics/",
    matchTriggers: ["noAnalytics"],
    badge: "free",
  },
  {
    id: "plausible",
    name: "Plausible",
    category: "analytics",
    tier: "budget",
    oneLiner: "Privacy-friendly analytics in 1 KB. No cookies, no consent banner.",
    pitch:
      "If GA4 feels like overkill, Plausible shows you traffic + sources in one clean page. $9/mo.",
    url: "https://plausible.io/?REPLACE_AFFILIATE_ID",
    commissionNote: "20% recurring",
    matchTriggers: ["noAnalytics"],
  },
  {
    id: "fathom",
    name: "Fathom",
    category: "analytics",
    tier: "budget",
    oneLiner: "Privacy-first analytics with EU data residency.",
    pitch:
      "Plausible's main competitor. Slightly better dashboards. $15/mo.",
    url: "https://usefathom.com/ref/REPLACE_AFFILIATE_ID",
    commissionNote: "25% recurring",
    matchTriggers: ["noAnalytics"],
  },
  {
    id: "clarity",
    name: "Microsoft Clarity",
    category: "analytics",
    tier: "free",
    oneLiner: "Free heatmaps + session recordings from Microsoft.",
    pitch:
      "Free. Forever. See exactly where people click, scroll, and rage-quit. Pair with GA4.",
    url: "https://clarity.microsoft.com/",
    matchTriggers: ["noAnalytics"],
    badge: "free",
  },

  // --- SECURITY ---
  {
    id: "sucuri",
    name: "Sucuri",
    category: "security",
    tier: "premium",
    oneLiner: "Website firewall + malware cleanup.",
    pitch:
      "If your security headers are F-grade and you've ever been hacked, Sucuri's WAF + 24/7 cleanup is worth $200/yr.",
    url: "https://sucuri.net/?REPLACE_AFFILIATE_ID",
    commissionNote: "30% recurring",
    matchTriggers: ["badSecurityHeaders", "noHttps"],
  },
  {
    id: "cloudflare-zero-trust",
    name: "Cloudflare (Security)",
    category: "security",
    tier: "free",
    oneLiner: "Free WAF + bot mitigation + DDoS protection.",
    pitch:
      "Free tier includes a WAF that fixes most security header issues automatically.",
    url: "https://www.cloudflare.com/plans/",
    matchTriggers: ["badSecurityHeaders"],
    badge: "free",
  },

  // --- ACCESSIBILITY ---
  {
    id: "userway",
    name: "UserWay",
    category: "accessibility",
    tier: "budget",
    oneLiner: "Accessibility widget + automated WCAG fixes.",
    pitch:
      "If you've got serious axe violations and don't have a dev to fix them, UserWay's overlay handles 80% in a script tag.",
    url: "https://userway.org/?ref=REPLACE_AFFILIATE_ID",
    commissionNote: "Up to $250 per sale",
    matchTriggers: ["manyAxeViolations", "badA11y"],
  },
  {
    id: "accessibe",
    name: "AccessiBe",
    category: "accessibility",
    tier: "premium",
    oneLiner: "AI-powered WCAG compliance — for businesses worried about ADA lawsuits.",
    pitch:
      "If you've gotten an ADA threat letter (4,000+ filed in 2024), this is the fastest legal-defense option.",
    url: "https://accessibe.com/?REPLACE_AFFILIATE_ID",
    commissionNote: "10% recurring",
    matchTriggers: ["manyAxeViolations", "badA11y"],
  },

  // --- E-COMMERCE ---
  {
    id: "shopify",
    name: "Shopify",
    category: "ecommerce",
    tier: "premium",
    oneLiner: "Run a store. Stop reinventing checkouts.",
    pitch:
      "If you sell anything, stop trying to bolt commerce onto your current site. Shopify handles cart, checkout, taxes, shipping out of the box.",
    url: "https://www.shopify.com/?REPLACE_AFFILIATE_ID",
    commissionNote: "$150 per sale",
    matchTriggers: ["noContact", "thinContent"],
  },

  // --- DOMAIN ---
  {
    id: "namecheap",
    name: "Namecheap",
    category: "domain",
    tier: "budget",
    oneLiner: "Cheap domains + free WhoisGuard + free SSL.",
    pitch:
      "If you need a new domain (or to escape GoDaddy's pricing), Namecheap is the default. ~$10/year for most TLDs.",
    url: "https://namecheap.pxf.io/REPLACE_AFFILIATE_ID",
    commissionNote: "20-50% per sale",
    matchTriggers: [],
  },
  {
    id: "porkbun",
    name: "Porkbun",
    category: "domain",
    tier: "budget",
    oneLiner: "Cheapest renewal prices on premium TLDs.",
    pitch:
      "Best pricing on niche TLDs (.dev, .app, .io). Free WHOIS, free SSL, free email forwarding.",
    url: "https://porkbun.com/",
    matchTriggers: [],
  },

  // --- REVIEWS / REPUTATION ---
  {
    id: "birdeye",
    name: "Birdeye",
    category: "reviews",
    tier: "premium",
    oneLiner: "Automated review collection + reputation management for local businesses.",
    pitch:
      "For service businesses. Sends review requests after every job, monitors Google/Yelp/Facebook in one dashboard.",
    url: "https://birdeye.com/?REPLACE_AFFILIATE_ID",
    commissionNote: "$100+ per sale",
    matchTriggers: ["thinContent", "badSeo"],
  },
  {
    id: "nicejob",
    name: "NiceJob",
    category: "reviews",
    tier: "budget",
    oneLiner: "Review software focused on contractors + home services.",
    pitch:
      "Cheaper than Birdeye, built for trade businesses. Auto-sends review requests via SMS after each job.",
    url: "https://www.nicejob.com/?REPLACE_AFFILIATE_ID",
    matchTriggers: ["thinContent"],
  },
];

// ============================================================================
// THE RECOMMENDATION ENGINE
// Inspect the audit result, surface the most relevant tools.
// ============================================================================

export function computeFlags(audit: AuditResult): FailureFlags {
  const lh = audit.lighthouse;
  const axe = audit.screenshots?.axe;
  const ts = audit.techStack;
  const failedIds = new Set(
    audit.checks.filter((c) => c.status === "fail").map((c) => c.id)
  );
  const warnedIds = new Set(
    audit.checks.filter((c) => c.status === "warn").map((c) => c.id)
  );

  return {
    noHttps: failedIds.has("https") || !audit.meta.httpsCanonical,
    slowLcp: (lh?.vitals.lcp ?? 0) >= 2500 || failedIds.has("lcp"),
    highTbt: (lh?.vitals.tbt ?? 0) >= 200 || failedIds.has("tbt"),
    bigPage: audit.bytes > 500_000 || failedIds.has("pagesize"),
    badPerf: (lh?.scores.performance ?? 100) < 75 || failedIds.has("lh_performance"),
    badSeo: (lh?.scores.seo ?? 100) < 85 || failedIds.has("lh_seo"),
    badA11y: (lh?.scores.accessibility ?? 100) < 85 || failedIds.has("lh_accessibility"),
    badBestPractices:
      (lh?.scores.bestPractices ?? 100) < 85 || failedIds.has("lh_best_practices"),
    thinContent: audit.meta.wordCount < 250 || failedIds.has("content"),
    noContact: failedIds.has("contact") || (!audit.meta.phone && !audit.meta.email),
    noForm: failedIds.has("form") || audit.meta.forms === 0,
    noAnalytics: warnedIds.has("analytics") || !audit.meta.hasGoogleAnalytics,
    noSchema: warnedIds.has("schema") || !audit.meta.hasSchemaMarkup,
    noOgImage: warnedIds.has("og") || !audit.meta.ogImage,
    badSecurityHeaders:
      failedIds.has("security_headers") ||
      warnedIds.has("security_headers") ||
      audit.security?.grade === "F" ||
      audit.security?.grade === "D",
    staleSite:
      failedIds.has("freshness") ||
      (audit.wayback?.daysSinceLastSnapshot ?? 0) > 365,
    isWordPress: ts?.cms === "WordPress",
    isShopify: ts?.ecommerce === "Shopify",
    isWix: ts?.builder === "Wix",
    isSquarespace: ts?.builder === "Squarespace",
    isUnknownBuilder:
      !ts?.builder && !ts?.cms && !ts?.platform,
    manyAxeViolations:
      (axe?.criticalCount ?? 0) + (axe?.seriousCount ?? 0) > 0,
  };
}

export type RecommendationGroup = {
  category: AffiliateCategory;
  title: string;
  reason: string;
  tools: AffiliateTool[];
};

export function recommendTools(audit: AuditResult): RecommendationGroup[] {
  const flags = computeFlags(audit);
  const platforms = [
    audit.techStack?.cms,
    audit.techStack?.builder,
    audit.techStack?.ecommerce,
    audit.techStack?.platform,
  ].filter(Boolean) as string[];

  // Score each tool by:
  //   1. Number of failure flags it addresses
  //   2. Bonus for matching the detected platform
  const scored = AFFILIATES.map((t) => {
    const matches = t.matchTriggers.filter((trig) => flags[trig]).length;
    const platformBonus =
      t.bonusForPlatform?.some((p) => platforms.includes(p)) ? 2 : 0;
    return { tool: t, score: matches + platformBonus };
  })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  // Group by category, take top 3 per category, then top 4 categories overall
  const grouped = new Map<AffiliateCategory, AffiliateTool[]>();
  for (const { tool } of scored) {
    const list = grouped.get(tool.category) || [];
    if (list.length < 3) list.push(tool);
    grouped.set(tool.category, list);
  }

  const categoryMeta: Record<AffiliateCategory, { title: string; reason: (f: FailureFlags) => string }> = {
    hosting: {
      title: "Move to faster hosting",
      reason: (f) =>
        f.noHttps
          ? "Your SSL is missing — switching hosts gives you free SSL in 5 minutes."
          : "Your load time is hurting conversions. Better hosting fixes that first.",
    },
    "site-builder": {
      title: "Rebuild on a real platform",
      reason: () => "Your current setup is leaking customers faster than you can fix it piecemeal.",
    },
    ecommerce: {
      title: "Use a real commerce stack",
      reason: () => "If you're selling, stop bolting carts onto a marketing site.",
    },
    seo: {
      title: "Get found on Google",
      reason: () => "Your SEO score is low — these tools find the gaps and competitor wins to copy.",
    },
    speed: {
      title: "Speed up the site you already have",
      reason: () => "Real Core Web Vitals data shows your page is slow. These fix it without a rebuild.",
    },
    images: {
      title: "Optimize your images",
      reason: () => "Images are usually 70% of page weight. Compress them and LCP drops by half.",
    },
    forms: {
      title: "Capture leads (instead of losing them)",
      reason: () => "No contact form means every undecided visitor leaves with no way back.",
    },
    email: {
      title: "Start a newsletter",
      reason: () => "Owning an audience > renting attention from social. Start collecting emails now.",
    },
    analytics: {
      title: "Stop flying blind",
      reason: () => "You can't fix what you can't see. Install free analytics this week.",
    },
    security: {
      title: "Lock down the basics",
      reason: () => "Your security headers are weak. These tools add them in minutes.",
    },
    accessibility: {
      title: "Fix accessibility (legal exposure)",
      reason: () => "axe found real WCAG violations. 4,000+ ADA lawsuits were filed in 2024.",
    },
    "ai-builder": {
      title: "Let AI rebuild it for you",
      reason: () => "If you want it done this weekend, an AI builder is the fastest path to a real site.",
    },
    booking: {
      title: "Let people book you",
      reason: () => "Phone tag kills service businesses. Add a booking link to your header.",
    },
    reviews: {
      title: "Collect more reviews",
      reason: () => "Reviews drive local SEO and trust. These automate the ask.",
    },
    domain: {
      title: "Domain + DNS",
      reason: () => "Cheap domain registration and DNS, in case you're consolidating.",
    },
    service: {
      title: "Have a pro do it",
      reason: () => "If you'd rather pay someone, here's where to find them.",
    },
  };

  // Build the groups
  const groups: RecommendationGroup[] = [];
  for (const [category, tools] of grouped) {
    const meta = categoryMeta[category];
    groups.push({
      category,
      title: meta.title,
      reason: meta.reason(flags),
      tools,
    });
  }

  // Sort groups by total score of contained tools
  groups.sort((a, b) => {
    const aScore = a.tools.reduce(
      (sum, t) => sum + (scored.find((s) => s.tool.id === t.id)?.score || 0),
      0
    );
    const bScore = b.tools.reduce(
      (sum, t) => sum + (scored.find((s) => s.tool.id === t.id)?.score || 0),
      0
    );
    return bScore - aScore;
  });

  return groups.slice(0, 4); // Top 4 problem-categories
}
