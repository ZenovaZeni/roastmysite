import * as cheerio from "cheerio";
import type { PageType } from "./discover";
import type { Browser } from "playwright";

export type PageAudit = {
  url: string;
  pageType: PageType;
  source: string;
  ok: boolean;
  error?: string;
  status: number;
  loadMs: number;
  title: string;
  description: string;
  h1: string;
  wordCount: number;
  forms: number;
  hasPhone: boolean;
  hasEmail: boolean;
  hasContactCta: boolean;
  hasOgImage: boolean;
  bytes: number;
  screenshot: string | null; // base64 jpeg of above-the-fold
  screenshotWidth: number;
  screenshotHeight: number;
  score: number; // 0-100, lightweight
  topIssues: string[];
};

const PHONE_REGEX = /(?:\+?1[-.\s]?)?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})/;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

let browserPromise: Promise<Browser> | null = null;
async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = import("playwright").then(({ chromium }) =>
      chromium.launch({
        args: ["--disable-blink-features=AutomationControlled"],
      })
    );
    browserPromise.catch(() => {
      browserPromise = null;
    });
  }
  return browserPromise;
}

export async function auditPage(
  url: string,
  pageType: PageType,
  source: string
): Promise<PageAudit> {
  const empty: PageAudit = {
    url,
    pageType,
    source,
    ok: false,
    error: undefined,
    status: 0,
    loadMs: 0,
    title: "",
    description: "",
    h1: "",
    wordCount: 0,
    forms: 0,
    hasPhone: false,
    hasEmail: false,
    hasContactCta: false,
    hasOgImage: false,
    bytes: 0,
    screenshot: null,
    screenshotWidth: 1280,
    screenshotHeight: 800,
    score: 0,
    topIssues: [],
  };

  const started = Date.now();

  // 1. Fetch HTML
  let html = "";
  let status = 0;
  try {
    const ctrl = AbortSignal.timeout(10000);
    const res = await fetch(url, {
      signal: ctrl,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; RoastMySiteBot/1.0)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    status = res.status;
    if (!res.ok) {
      return { ...empty, status, error: `HTTP ${res.status}`, loadMs: Date.now() - started };
    }
    html = await res.text();
  } catch (e) {
    return {
      ...empty,
      error: e instanceof Error ? e.message : "fetch failed",
      loadMs: Date.now() - started,
    };
  }

  const loadMs = Date.now() - started;
  const bytes = new TextEncoder().encode(html).length;

  // 2. Parse with Cheerio
  const $ = cheerio.load(html);
  const title = ($("title").first().text() || "").trim();
  const description = ($('meta[name="description"]').attr("content") || "").trim();
  const h1 = ($("h1").first().text() || "").trim();
  const ogImage = $('meta[property="og:image"]').attr("content");
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  const wordCount = bodyText.split(/\s+/).filter(Boolean).length;
  const forms = $("form").length;
  const hasPhone = PHONE_REGEX.test(bodyText);
  const hasEmail = EMAIL_REGEX.test(bodyText);

  // Heuristic for a "contact CTA"
  const contactCtaText = $("a, button").filter((_, el) => {
    const t = $(el).text().toLowerCase().trim();
    return /\b(contact|get in touch|book|schedule|call us|talk to|free quote|get started|sign up|try free)\b/.test(
      t
    );
  }).length;
  const hasContactCta = contactCtaText > 0;

  // 3. Screenshot via Playwright
  let screenshot: string | null = null;
  try {
    const browser = await getBrowser();
    const ctx = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
    });
    const page = await ctx.newPage();
    try {
      await page.goto(url, { waitUntil: "load", timeout: 12000 });
      await page.waitForTimeout(600);
    } catch {
      // ignore navigation hiccups — still try to screenshot what loaded
    }
    const buf = await page.screenshot({
      fullPage: false,
      type: "jpeg",
      quality: 75,
    });
    screenshot = buf.toString("base64");
    await ctx.close();
  } catch (e) {
    console.error(`[page-audit] screenshot failed for ${url}:`, e);
  }

  // 4. Lightweight scoring (page-level — not the same scale as the main audit)
  const issues: string[] = [];
  let score = 100;

  if (!title || title.length < 10) {
    score -= 12;
    issues.push("Missing or too-short title");
  }
  if (title.length > 65) {
    score -= 5;
    issues.push(`Title too long (${title.length} chars)`);
  }
  if (!description) {
    score -= 8;
    issues.push("No meta description");
  } else if (description.length > 165) {
    score -= 4;
    issues.push(`Description too long (${description.length} chars)`);
  }
  if (!h1) {
    score -= 8;
    issues.push("No H1 heading");
  }
  if (wordCount < 100 && pageType !== "homepage") {
    score -= 8;
    issues.push(`Thin content (${wordCount} words)`);
  }
  if (pageType === "contact" && forms === 0) {
    score -= 20;
    issues.push("Contact page has NO form");
  }
  if (pageType === "pricing" && !hasContactCta) {
    score -= 12;
    issues.push("Pricing page missing clear CTA");
  }
  if (
    (pageType === "homepage" || pageType === "services") &&
    !hasPhone &&
    !hasEmail &&
    !hasContactCta
  ) {
    score -= 15;
    issues.push("No visible contact info or CTA");
  }
  if (!ogImage) {
    score -= 5;
    issues.push("No og:image set");
  }
  if (loadMs > 3000) {
    score -= 10;
    issues.push(`Slow response (${loadMs}ms)`);
  }
  if (bytes > 500_000) {
    score -= 5;
    issues.push(`Heavy HTML (${(bytes / 1024).toFixed(0)} KB)`);
  }

  score = Math.max(0, Math.min(100, score));

  return {
    url,
    pageType,
    source,
    ok: true,
    status,
    loadMs,
    title,
    description,
    h1,
    wordCount,
    forms,
    hasPhone,
    hasEmail,
    hasContactCta,
    hasOgImage: !!ogImage,
    bytes,
    screenshot,
    screenshotWidth: 1280,
    screenshotHeight: 800,
    score,
    topIssues: issues.slice(0, 4),
  };
}
