/**
 * Derived insights computed from the existing audit data — no extra API calls.
 *   - Carbon emissions estimate (websitecarbon.com formula)
 *   - Score history trend (if we have prior localStorage scans for same URL)
 *
 * Color palette + fonts are extracted server-side by extending audit.ts —
 * see Cheerio extraction additions there.
 */

import type { AuditResult } from "./audit";

export type CarbonEstimate = {
  gramsPerVisit: number; // grams of CO2 emitted per page view
  annualKgAt10kVisits: number; // kg/year if you got 10k visits/month
  ranking: "exceptional" | "good" | "average" | "poor" | "awful";
  comparison: string; // human-readable "lower than X% of sites tested"
};

/**
 * Approximation of websitecarbon.com formula.
 *
 *   Base assumption: 0.55kWh per GB of data transferred.
 *   Grid mix (global avg 2024): 442g CO2 per kWh.
 *   ≈ 0.243g CO2 per MB transferred.
 *   First-visit cache miss ratio: 75% (most visitors aren't returning).
 *
 * Caveats: HTML-only payload understates real data transfer significantly
 * (images, JS, CSS are usually 5-20x the HTML size). We multiply HTML
 * bytes by 8 as a heuristic for "estimated total page weight" since most
 * sites in audit data have HTML in the 50-500KB range and full page
 * weight in the 1-4MB range — the multiplier roughly bridges them.
 */
export function estimateCarbon(audit: AuditResult): CarbonEstimate {
  const htmlBytes = audit.bytes || 0;
  const estimatedTotalBytes = htmlBytes * 8; // heuristic — see notes above
  const totalMB = estimatedTotalBytes / (1024 * 1024);
  const gramsPerVisit = +(totalMB * 0.243 * 0.75).toFixed(3); // 75% cache-miss factor
  const annualKgAt10kVisits = +(gramsPerVisit * 10_000 * 12 / 1000).toFixed(1);

  // Bands roughly matching websitecarbon.com
  let ranking: CarbonEstimate["ranking"];
  let comparison: string;
  if (gramsPerVisit < 0.1) {
    ranking = "exceptional";
    comparison = "Cleaner than 95% of sites tested. Genuinely minimal.";
  } else if (gramsPerVisit < 0.3) {
    ranking = "good";
    comparison = "Cleaner than 75% of sites tested.";
  } else if (gramsPerVisit < 0.8) {
    ranking = "average";
    comparison = "Around the median for the modern web.";
  } else if (gramsPerVisit < 2.0) {
    ranking = "poor";
    comparison = "Heavier than 70% of sites. Optimization would help.";
  } else {
    ranking = "awful";
    comparison = "Heavier than 90% of sites. Strip third-party scripts + compress images.";
  }

  return {
    gramsPerVisit,
    annualKgAt10kVisits,
    ranking,
    comparison,
  };
}

/**
 * Pull the top-N action items the user should actually do this week.
 * Ranked by impact-to-effort, mapped from the audit's failed checks.
 */
export type ActionItem = {
  id: string;
  rank: number;
  title: string;
  why: string;
  effort: "5 min" | "30 min" | "1 hour" | "1 day" | "1 weekend";
  impact: "high" | "medium" | "low";
  tool: string | null; // recommended tool name from affiliate library
};

export function buildActionChecklist(audit: AuditResult, max = 5): ActionItem[] {
  const failed = audit.checks.filter((c) => c.status === "fail" || c.status === "warn");

  const enriched: Array<ActionItem & { score: number }> = failed.map((c, i) => {
    let title = c.label;
    let why = c.fixHint || c.detail;
    let effort: ActionItem["effort"] = "30 min";
    let impact: ActionItem["impact"] = "medium";
    let tool: string | null = null;

    // Effort + impact + tool mapping per check id
    if (c.id === "https") {
      effort = "5 min";
      impact = "high";
      tool = "Cloudflare (free SSL)";
    } else if (c.id === "lh_performance" || c.id === "lcp") {
      effort = "1 hour";
      impact = "high";
      tool = "NitroPack or WP Rocket";
    } else if (c.id === "lh_accessibility" || c.id === "axe_violations") {
      effort = "1 day";
      impact = "high";
      tool = "Run the violations list through a developer";
    } else if (c.id === "lh_seo") {
      effort = "1 hour";
      impact = "high";
      tool = "Rank Math (free) or Yoast SEO";
    } else if (c.id === "contact" || c.id === "form") {
      effort = "30 min";
      impact = "high";
      tool = "Tally (free) or Typeform";
    } else if (c.id === "title" || c.id === "description" || c.id === "h1") {
      effort = "5 min";
      impact = "medium";
      tool = null;
    } else if (c.id === "schema") {
      effort = "30 min";
      impact = "medium";
      tool = "Rank Math (free)";
    } else if (c.id === "viewport") {
      effort = "5 min";
      impact = "high";
      tool = null;
    } else if (c.id === "analytics") {
      effort = "5 min";
      impact = "medium";
      tool = "GA4 (free) or Plausible";
    } else if (c.id === "security_headers") {
      effort = "30 min";
      impact = "medium";
      tool = "Cloudflare (free WAF)";
    } else if (c.id === "og" || c.id === "social") {
      effort = "30 min";
      impact = "medium";
      tool = null;
    } else if (c.id === "freshness") {
      effort = "1 hour";
      impact = "low";
      tool = null;
    }

    // Status weight: fails count more than warns
    const statusW = c.status === "fail" ? 2 : 1;
    const impactW = impact === "high" ? 3 : impact === "medium" ? 2 : 1;
    const effortW =
      effort === "5 min"
        ? 5
        : effort === "30 min"
        ? 4
        : effort === "1 hour"
        ? 3
        : effort === "1 day"
        ? 2
        : 1;
    const score = statusW * impactW * effortW + (c.weight || 1);

    return {
      id: c.id,
      rank: i + 1,
      title,
      why,
      effort,
      impact,
      tool,
      score,
    };
  });

  return enriched
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map((item, i) => ({ ...item, rank: i + 1 }));
}
