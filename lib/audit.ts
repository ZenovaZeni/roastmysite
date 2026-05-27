import * as cheerio from "cheerio";
import {
  detectTechStack,
  fetchDomainInfo,
  fetchObservatory,
  fetchWayback,
  type DomainInfo,
  type SecurityHeaders,
  type TechStack,
  type WaybackInfo,
} from "./extras";
import { runLocalLighthouse, type LighthouseResult } from "./lighthouse";
import type { AxeSummary } from "./screenshot";
import { extractSocialPreview, type SocialPreview } from "./social";
import type { PageAudit } from "./page-audit";
import { detectSiteType, type SiteTypeResult } from "./site-type";
import { detectOnlinePresence, type OnlinePresence } from "./online-presence";

export type CheckStatus = "pass" | "warn" | "fail";

export type Check = {
  id: string;
  label: string;
  status: CheckStatus;
  weight: number;
  detail: string;
  fixHint?: string;
};

export type AuditScreenshots = {
  desktop: string;
  desktopFull: string;
  mobile: string;
  mobileFull: string;
  desktopWidth: number;
  desktopHeight: number;
  desktopFullHeight: number;
  mobileWidth: number;
  mobileHeight: number;
  mobileFullHeight: number;
  capturedAt: string;
  axe: AxeSummary | null;
};

export type AuditResult = {
  url: string;
  finalUrl: string;
  fetchedAt: string;
  loadMs: number;
  bytes: number;
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  vibe: string;
  checks: Check[];
  screenshots: AuditScreenshots | null;
  wayback: WaybackInfo | null;
  techStack: TechStack | null;
  security: SecurityHeaders | null;
  lighthouse: LighthouseResult | null;
  domain: DomainInfo | null;
  social: SocialPreview | null;
  pages: PageAudit[] | null; // multi-page audit (homepage already covered above; this is additional pages)
  siteType: SiteTypeResult | null;
  onlinePresence: OnlinePresence | null;
  meta: {
    title: string;
    description: string;
    h1: string;
    favicon: boolean;
    ogImage: string | null;
    canonical: string | null;
    viewport: boolean;
    httpsCanonical: boolean;
    phone: string | null;
    email: string | null;
    forms: number;
    wordCount: number;
    imageCount: number;
    imagesMissingAlt: number;
    linkCount: number;
    externalLinks: number;
    poweredBy: string | null;
    hasGoogleAnalytics: boolean;
    hasSchemaMarkup: boolean;
  };
};

const PHONE_REGEX = /(?:\+?1[-.\s]?)?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})/;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

function normalizeUrl(input: string): string {
  let raw = input.trim();
  if (!/^https?:\/\//i.test(raw)) raw = "https://" + raw;
  const u = new URL(raw);
  return u.toString();
}

function grade(score: number): AuditResult["grade"] {
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  if (score >= 50) return "C";
  if (score >= 35) return "D";
  return "F";
}

function vibeFor(score: number): string {
  if (score >= 80) return "Top-tier. This is what good looks like.";
  if (score >= 65) return "Solid foundation, a few polish jobs from premium.";
  if (score >= 50) return "Functional but forgettable. Leaking revenue daily.";
  if (score >= 35) return "Hemorrhaging customers. Visible from space.";
  if (score >= 20) return "Yikes. This is actively driving people to your competitors.";
  return "Burn it down. Start over. Today.";
}

export async function audit(rawUrl: string): Promise<AuditResult> {
  const url = normalizeUrl(rawUrl);
  const started = Date.now();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  let res: Response;
  let html = "";
  let bytes = 0;
  let finalUrl = url;
  try {
    res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; RoastMySiteBot/1.0; +https://roastmysite.local)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    finalUrl = res.url || url;
    html = await res.text();
    bytes = new TextEncoder().encode(html).length;
  } catch (e) {
    clearTimeout(timeoutId);
    const err = e instanceof Error ? e.message : "unknown error";
    return buildErrorResult(url, err);
  }
  clearTimeout(timeoutId);
  const loadMs = Date.now() - started;
  const responseHeaders = res!.headers;
  const host = new URL(finalUrl).host;

  const lastModifiedHeader = responseHeaders.get("last-modified");

  // Kick off external lookups in parallel with parsing.
  // Local Lighthouse is the slowest (~30-45s) but it's the authoritative data source.
  const externalPromise = Promise.all([
    fetchWayback(finalUrl, lastModifiedHeader),
    fetchObservatory(host),
    runLocalLighthouse(finalUrl, "desktop"),
    fetchDomainInfo(host),
  ]);

  const $ = cheerio.load(html);

  const title = ($("title").first().text() || "").trim();
  const description =
    ($('meta[name="description"]').attr("content") || "").trim();
  const h1 = ($("h1").first().text() || "").trim();
  const favicon =
    $('link[rel*="icon"]').length > 0 || $('link[rel="shortcut icon"]').length > 0;
  const ogImage = $('meta[property="og:image"]').attr("content") || null;
  const canonical = $('link[rel="canonical"]').attr("href") || null;
  const viewport = $('meta[name="viewport"]').length > 0;
  const httpsCanonical = finalUrl.startsWith("https://");

  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  const wordCount = bodyText.split(/\s+/).filter(Boolean).length;
  const phoneMatch = bodyText.match(PHONE_REGEX);
  const emailMatch = bodyText.match(EMAIL_REGEX);
  const forms = $("form").length;
  const imageCount = $("img").length;
  const imagesMissingAlt = $("img").filter((_, el) => !$(el).attr("alt")).length;
  const linkCount = $("a[href]").length;
  const externalLinks = $("a[href]").filter((_, el) => {
    const href = $(el).attr("href") || "";
    return /^https?:\/\//i.test(href) && !href.includes(new URL(finalUrl).host);
  }).length;

  const poweredBy = res!.headers.get("x-powered-by");
  const generator = $('meta[name="generator"]').attr("content") || null;
  const techFingerprint = poweredBy || generator;

  const scripts = $("script").map((_, el) => $(el).attr("src") || "").get().join(" ");
  const hasGoogleAnalytics =
    /google-analytics|gtag\/js|googletagmanager/i.test(scripts) ||
    /gtag\(/.test(html);
  const hasSchemaMarkup =
    $('script[type="application/ld+json"]').length > 0 ||
    /itemscope/i.test(html);

  const checks: Check[] = [
    {
      id: "https",
      label: "Served over HTTPS",
      status: httpsCanonical ? "pass" : "fail",
      weight: 12,
      detail: httpsCanonical
        ? "Encrypted connection. Browsers and customers won't flinch."
        : "No SSL. Every modern browser shows a 'Not Secure' warning right next to your name.",
      fixHint: httpsCanonical ? undefined : "Most hosts hand out free SSL via Let's Encrypt. Should be a 5-minute fix.",
    },
    {
      id: "title",
      label: "Page title set",
      status: title.length >= 10 && title.length <= 65 ? "pass" : title ? "warn" : "fail",
      weight: 8,
      detail: title
        ? `Found "${title.slice(0, 80)}" (${title.length} chars).`
        : "No <title> tag. Google literally cannot index this properly.",
      fixHint:
        title.length > 65
          ? "Trim it under 65 chars or Google will chop it mid-word in search results."
          : !title
          ? "Add a <title> tag with your business + city + service."
          : undefined,
    },
    {
      id: "description",
      label: "Meta description",
      status: description.length >= 50 && description.length <= 165 ? "pass" : description ? "warn" : "fail",
      weight: 6,
      detail: description
        ? `${description.length} chars: "${description.slice(0, 80)}..."`
        : "No meta description. Google writes one for you, badly.",
      fixHint: !description
        ? "Write a 120-160 char description that includes your main keyword and a hook."
        : description.length > 165
        ? "Cut to under 160 chars — anything longer gets truncated."
        : undefined,
    },
    {
      id: "h1",
      label: "H1 heading present",
      status: h1 ? "pass" : "fail",
      weight: 5,
      detail: h1 ? `"${h1.slice(0, 80)}"` : "No H1 on the page. SEO basics gone.",
      fixHint: !h1 ? "Every page needs one clear H1 stating what the page is about." : undefined,
    },
    {
      id: "viewport",
      label: "Mobile viewport meta",
      status: viewport ? "pass" : "fail",
      weight: 10,
      detail: viewport
        ? "Mobile devices get a properly-scaled view."
        : "No viewport tag. On phones this looks like a desktop site zoomed out to fit a postage stamp.",
      fixHint: !viewport ? 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> in the <head>.' : undefined,
    },
    {
      id: "favicon",
      label: "Favicon present",
      status: favicon ? "pass" : "warn",
      weight: 2,
      detail: favicon ? "Tabs will show your site's icon." : "No favicon. Looks unfinished.",
      fixHint: !favicon ? "Upload a 32x32 PNG and reference it with <link rel='icon'>." : undefined,
    },
    {
      id: "og",
      label: "Open Graph image",
      status: ogImage ? "pass" : "warn",
      weight: 4,
      detail: ogImage
        ? "Shared links will preview with a proper image."
        : "Sharing your link in iMessage, Slack, Facebook = a blank rectangle.",
      fixHint: !ogImage ? "Add <meta property='og:image' content='...'> with a 1200x630 image." : undefined,
    },
    {
      id: "loadtime",
      label: "Initial load time",
      status: loadMs < 1500 ? "pass" : loadMs < 4000 ? "warn" : "fail",
      weight: 10,
      detail: `Server responded with full HTML in ${loadMs}ms.`,
      fixHint:
        loadMs >= 4000
          ? "Anything over 3 seconds and 40% of mobile visitors bounce. Cache, compress, or switch hosts."
          : loadMs >= 1500
          ? "Under 1.5s feels instant. You're not there yet."
          : undefined,
    },
    {
      id: "pagesize",
      label: "HTML payload size",
      status: bytes < 200_000 ? "pass" : bytes < 500_000 ? "warn" : "fail",
      weight: 4,
      detail: `${(bytes / 1024).toFixed(1)} KB of raw HTML.`,
      fixHint: bytes > 500_000 ? "That's a massive HTML file. Strip inline scripts, lazy-load below-the-fold." : undefined,
    },
    {
      id: "content",
      label: "Substantial content",
      status: wordCount >= 250 ? "pass" : wordCount >= 80 ? "warn" : "fail",
      weight: 6,
      detail: `${wordCount} words of body text.`,
      fixHint: wordCount < 250 ? "Thin content. Google sees this as low-value and ranks it lower. Aim for 400+ words." : undefined,
    },
    {
      id: "contact",
      label: "Contact info visible",
      status: phoneMatch || emailMatch ? "pass" : "fail",
      weight: 10,
      detail:
        phoneMatch && emailMatch
          ? `Phone and email both findable in the body.`
          : phoneMatch
          ? `Phone found: ${phoneMatch[0]}`
          : emailMatch
          ? `Email found: ${emailMatch[0]}`
          : "No phone number or email anywhere in the body. How do you expect to get hired?",
      fixHint:
        !phoneMatch && !emailMatch
          ? "Put your phone number in the header AND footer. Make 'tap to call' obvious."
          : undefined,
    },
    {
      id: "form",
      label: "Contact / lead form",
      status: forms > 0 ? "pass" : "warn",
      weight: 6,
      detail: forms > 0 ? `${forms} form(s) detected.` : "No <form> elements. Every visitor who isn't ready to call leaves with no way to convert.",
      fixHint: forms === 0 ? "Add a 3-field contact form: name, phone, message. That's it." : undefined,
    },
    {
      id: "alts",
      label: "Image alt text",
      status: imageCount === 0 ? "warn" : imagesMissingAlt === 0 ? "pass" : imagesMissingAlt / imageCount < 0.3 ? "warn" : "fail",
      weight: 3,
      detail:
        imageCount === 0
          ? "No images on the page."
          : `${imagesMissingAlt} of ${imageCount} images missing alt text.`,
      fixHint: imagesMissingAlt > 0 ? "Alt text is accessibility + SEO. Describe each image in 5-10 words." : undefined,
    },
    {
      id: "schema",
      label: "Schema markup",
      status: hasSchemaMarkup ? "pass" : "warn",
      weight: 4,
      detail: hasSchemaMarkup
        ? "Structured data detected — Google can render rich snippets."
        : "No schema markup. You're invisible to Google's rich results.",
      fixHint: !hasSchemaMarkup ? "Add LocalBusiness JSON-LD schema. 30 minutes of work, lifetime payoff." : undefined,
    },
    {
      id: "analytics",
      label: "Analytics installed",
      status: hasGoogleAnalytics ? "pass" : "warn",
      weight: 3,
      detail: hasGoogleAnalytics
        ? "Google Analytics or GTM detected."
        : "No analytics. You're flying blind. No idea who visits, what they click, where they leave.",
      fixHint: !hasGoogleAnalytics ? "Install GA4 (free, 5 min). At minimum see traffic + bounce rate." : undefined,
    },
    {
      id: "canonical",
      label: "Canonical URL",
      status: canonical ? "pass" : "warn",
      weight: 2,
      detail: canonical ? `Canonical: ${canonical}` : "No canonical link. Duplicate URLs may split your SEO juice.",
      fixHint: !canonical ? "Add <link rel='canonical' href='...'> to every page." : undefined,
    },
    {
      id: "tech",
      label: "Tech fingerprint",
      status: techFingerprint ? "warn" : "pass",
      weight: 1,
      detail: techFingerprint
        ? `Exposes "${techFingerprint}" header — gives attackers free info.`
        : "No tech fingerprint exposed. Good hygiene.",
      fixHint: techFingerprint ? "Remove X-Powered-By header in your server config." : undefined,
    },
  ];

  // Detect tech stack from HTML + headers
  const techStack = detectTechStack($, html, responseHeaders);

  // Extract social preview metadata
  const social = extractSocialPreview($, finalUrl, title, description);

  // Detect site type (utility/marketing/ecom/etc) — informs scoring + Gemma's roast
  const siteType = detectSiteType($, html, finalUrl);

  // Detect online presence — social profile links + contact signals
  const onlinePresence = detectOnlinePresence($, html, host);

  // Wait for external lookups — with a hard timeout (PSI is the slowest, ~10-15s)
  let wayback: WaybackInfo | null = null;
  let security: SecurityHeaders | null = null;
  let lighthouse: LighthouseResult | null = null;
  let domain: DomainInfo | null = null;
  try {
    const result = (await Promise.race([
      externalPromise,
      new Promise<[null, null, null, null]>((r) =>
        setTimeout(() => r([null, null, null, null]), 75000)
      ),
    ])) as [
      WaybackInfo | null,
      SecurityHeaders | null,
      LighthouseResult | null,
      DomainInfo | null
    ];
    [wayback, security, lighthouse, domain] = result;
  } catch {
    // ignore — external data is bonus, not required
  }

  // ===== REAL LIGHTHOUSE DATA (Google's authoritative scoring) =====
  // When Lighthouse runs, it DOMINATES the score (~62% of total weight).
  // Heuristic checks that overlap with Lighthouse are dropped or demoted.
  if (lighthouse) {
    // When real Lighthouse data is available, DROP all heuristics that are either:
    //  (a) covered by Lighthouse's authoritative scoring, or
    //  (b) marketing-site biases that unfairly penalize platforms like Google/YouTube/Wikipedia.
    // The remaining heuristics are non-overlapping signals (security headers, freshness, etc.)
    const dropIds = new Set([
      "loadtime", "alts", "h1", "title", "description", "canonical",
      "analytics", "schema", "https", "pagesize", "content",
      "contact", "form", "favicon", "og", "tech", "viewport",
    ]);
    for (let i = checks.length - 1; i >= 0; i--) {
      if (dropIds.has(checks[i].id)) checks.splice(i, 1);
    }

    // Performance score — heavy weight
    if (lighthouse.scores.performance !== null) {
      const p = lighthouse.scores.performance;
      checks.push({
        id: "lh_performance",
        label: "Lighthouse Performance",
        status: p >= 90 ? "pass" : p >= 50 ? "warn" : "fail",
        weight: 25,
        detail: `Google Lighthouse rates mobile performance ${p}/100. Throttled to a real 4G connection on a mid-range phone.`,
        fixHint:
          p < 90
            ? "Tackle the top 3 opportunities Lighthouse flagged below — usually image weight, render-blocking JS, and unused CSS."
            : undefined,
      });
    }

    // Accessibility score — heavy weight (legal + ethical)
    if (lighthouse.scores.accessibility !== null) {
      const a = lighthouse.scores.accessibility;
      checks.push({
        id: "lh_accessibility",
        label: "Lighthouse Accessibility",
        status: a >= 90 ? "pass" : a >= 70 ? "warn" : "fail",
        weight: 25,
        detail: `Lighthouse a11y score: ${a}/100. Over 4,000 ADA web lawsuits were filed in 2024.`,
        fixHint:
          a < 90
            ? "Fix color contrast on key text, add aria-labels to icon buttons, ensure focus states are visible."
            : undefined,
      });
    }

    // SEO score — heavy weight
    if (lighthouse.scores.seo !== null) {
      const s = lighthouse.scores.seo;
      checks.push({
        id: "lh_seo",
        label: "Lighthouse SEO",
        status: s >= 90 ? "pass" : s >= 70 ? "warn" : "fail",
        weight: 20,
        detail: `Lighthouse SEO score: ${s}/100. Google's own definition of 'discoverable'.`,
        fixHint:
          s < 90
            ? "Fix missing meta descriptions, ensure descriptive link text, add structured data."
            : undefined,
      });
    }

    // Best Practices score — heavy weight
    if (lighthouse.scores.bestPractices !== null) {
      const b = lighthouse.scores.bestPractices;
      checks.push({
        id: "lh_best_practices",
        label: "Lighthouse Best Practices",
        status: b >= 90 ? "pass" : b >= 70 ? "warn" : "fail",
        weight: 20,
        detail: `Lighthouse tech hygiene: ${b}/100. Covers HTTPS, console errors, deprecated APIs, image aspect ratios.`,
      });
    }

    // Core Web Vitals — detail layer, smaller weight
    if (lighthouse.vitals.lcp !== null) {
      const ms = lighthouse.vitals.lcp;
      checks.push({
        id: "lcp",
        label: "Largest Contentful Paint",
        status: ms < 2500 ? "pass" : ms < 4000 ? "warn" : "fail",
        weight: 5,
        detail:
          ms < 2500
            ? `${ms}ms — Google's 'good' threshold is 2,500ms. Feels fast.`
            : `${ms}ms — over Google's 2,500ms threshold. Half of mobile visitors abandon before this paints.`,
        fixHint:
          ms >= 2500
            ? "Optimize your hero image (compress, preload), defer below-the-fold scripts, switch to a CDN."
            : undefined,
      });
    }
    if (lighthouse.vitals.cls !== null) {
      const cls = lighthouse.vitals.cls;
      checks.push({
        id: "cls",
        label: "Cumulative Layout Shift",
        status: cls < 0.1 ? "pass" : cls < 0.25 ? "warn" : "fail",
        weight: 5,
        detail:
          cls < 0.1
            ? `${cls.toFixed(3)} — page stays still while loading.`
            : `${cls.toFixed(3)} — content jumps around. Goal is <0.1.`,
        fixHint:
          cls >= 0.1
            ? "Set explicit width/height on images and embeds. Reserve space for ads."
            : undefined,
      });
    }
    if (lighthouse.vitals.tbt !== null) {
      const tbt = lighthouse.vitals.tbt;
      checks.push({
        id: "tbt",
        label: "Total Blocking Time",
        status: tbt < 200 ? "pass" : tbt < 600 ? "warn" : "fail",
        weight: 5,
        detail:
          tbt < 200
            ? `${tbt}ms — interactions feel instant.`
            : `${tbt}ms of main-thread blocking. Buttons feel laggy on phones.`,
        fixHint:
          tbt >= 200
            ? "Break up long JS tasks, defer third-party scripts."
            : undefined,
      });
    }

  }

  // Domain age check (whois) — strong kill shot for sites that have been around for years and never modernized
  if (domain?.ageYears !== null && domain?.ageYears !== undefined) {
    const age = domain.ageYears;
    const httpsOk = httpsCanonical;
    checks.push({
      id: "domain_age",
      label: "Domain maturity",
      status: "pass",
      weight: 0,
      detail:
        age === 0
          ? `Registered within the last year. New business, fresh domain.`
          : `Registered ${age} year${age !== 1 ? "s" : ""} ago${
              domain.registrar ? ` via ${domain.registrar}` : ""
            }.`,
      fixHint:
        age >= 10 && !httpsOk
          ? "You've owned this domain for over a decade and still don't have SSL. That's not a hack — that's neglect."
          : undefined,
    });
  }

  // Add a "freshness" check based on Wayback's last snapshot
  if (wayback && wayback.daysSinceLastSnapshot !== null) {
    const days = wayback.daysSinceLastSnapshot;
    checks.push({
      id: "freshness",
      label: "Site freshness",
      status: days < 90 ? "pass" : days < 365 ? "warn" : "fail",
      weight: 5,
      detail:
        days < 30
          ? `Wayback archived this site ${days} days ago — clearly being maintained.`
          : days < 365
          ? `Last Wayback snapshot was ${days} days ago. Could be staler than your competitors.`
          : `Last meaningful Wayback snapshot was ${Math.floor(days / 365)} year${
              Math.floor(days / 365) > 1 ? "s" : ""
            } ago. Looks abandoned.`,
      fixHint:
        days > 365
          ? "Update something this week — a blog post, a new testimonial, an updated phone number. Search engines reward signs of life."
          : undefined,
    });
  }

  // Add a security headers grade if Observatory returned one
  if (security && security.grade) {
    const grade = security.grade.toUpperCase();
    const isPass = /^A/.test(grade);
    const isFail = /^[DF]/.test(grade);
    checks.push({
      id: "security_headers",
      label: "Security headers grade",
      status: isPass ? "pass" : isFail ? "fail" : "warn",
      weight: 4,
      detail: `Mozilla Observatory rates your security headers ${grade}${
        security.score !== null ? ` (${security.score}/100)` : ""
      }.`,
      fixHint: isFail
        ? "You're missing basic headers like Content-Security-Policy and Strict-Transport-Security. Hosts can add these in 5 minutes."
        : !isPass
        ? "Add HSTS and a basic CSP. Quick win."
        : undefined,
    });
  }

  const totalWeight = checks.reduce((s, c) => s + c.weight, 0);
  const earned = checks.reduce((s, c) => {
    if (c.status === "pass") return s + c.weight;
    if (c.status === "warn") return s + c.weight * 0.65;
    return s;
  }, 0);
  const score = Math.round((earned / totalWeight) * 100);

  return {
    url,
    finalUrl,
    fetchedAt: new Date().toISOString(),
    loadMs,
    bytes,
    score,
    grade: grade(score),
    vibe: vibeFor(score),
    checks,
    screenshots: null,
    wayback,
    techStack,
    security,
    lighthouse,
    domain,
    social,
    pages: null,
    siteType,
    onlinePresence,
    meta: {
      title,
      description,
      h1,
      favicon,
      ogImage,
      canonical,
      viewport,
      httpsCanonical,
      phone: phoneMatch ? phoneMatch[0] : null,
      email: emailMatch ? emailMatch[0] : null,
      forms,
      wordCount,
      imageCount,
      imagesMissingAlt,
      linkCount,
      externalLinks,
      poweredBy: techFingerprint,
      hasGoogleAnalytics,
      hasSchemaMarkup,
    },
  };
}

function buildErrorResult(url: string, err: string): AuditResult {
  const checks: Check[] = [
    {
      id: "reachable",
      label: "Site reachable",
      status: "fail",
      weight: 100,
      detail: `Could not fetch the site: ${err}`,
      fixHint: "Check the URL, make sure the server is up, and confirm it's not blocking bots.",
    },
  ];
  return {
    url,
    finalUrl: url,
    fetchedAt: new Date().toISOString(),
    loadMs: 0,
    bytes: 0,
    score: 0,
    grade: "F",
    vibe: "Your site refused to even let me look at it. That's a fail in itself.",
    checks,
    screenshots: null,
    wayback: null,
    techStack: null,
    security: null,
    lighthouse: null,
    domain: null,
    social: null,
    pages: null,
    siteType: null,
    onlinePresence: null,
    meta: {
      title: "",
      description: "",
      h1: "",
      favicon: false,
      ogImage: null,
      canonical: null,
      viewport: false,
      httpsCanonical: false,
      phone: null,
      email: null,
      forms: 0,
      wordCount: 0,
      imageCount: 0,
      imagesMissingAlt: 0,
      linkCount: 0,
      externalLinks: 0,
      poweredBy: null,
      hasGoogleAnalytics: false,
      hasSchemaMarkup: false,
    },
  };
}
