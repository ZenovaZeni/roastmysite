import { NextRequest, NextResponse } from "next/server";
import { audit, type Check } from "@/lib/audit";
import { captureScreenshots } from "@/lib/screenshot";
import { discoverPages } from "@/lib/discover";
import { auditPage } from "@/lib/page-audit";
import { computeAuditScore } from "@/lib/scoring";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const MULTIPAGE_DEFAULT = true;
const MAX_EXTRA_PAGES = 9; // homepage + 9 others = 10 total

export async function POST(req: NextRequest) {
  let url: string;
  let multipage = MULTIPAGE_DEFAULT;
  try {
    const body = await req.json();
    url = body?.url;
    if (typeof body?.multipage === "boolean") multipage = body.multipage;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const normalizedUrl = normalizeUrlForShot(url);

    // 1. Run the full homepage audit, then screenshots.
    // Serverless Chromium is a compressed binary and can throw ETXTBSY if
    // Lighthouse and screenshot capture try to spawn it at the same time.
    const result = await audit(url);
    const screenshots = await captureScreenshots(normalizedUrl);
    result.screenshots = screenshots;
    const homepageAuditSucceeded =
      !(result.checks.length === 1 && result.checks[0]?.id === "reachable");

    if (homepageAuditSucceeded && !screenshots) {
      result.checks.push({
        id: "browser_evidence",
        label: "Browser evidence captured",
        status: "fail",
        weight: 0,
        detail:
          "Partial scan only: HTML fetched successfully, but the browser renderer could not capture screenshots, axe accessibility data, or visual evidence.",
        fixHint:
          "Treat this as an HTML-only audit. Re-run after browser rendering is available before trusting the score as final.",
      });
    }
    if (homepageAuditSucceeded && !result.lighthouse) {
      result.checks.push({
        id: "lighthouse_evidence",
        label: "Lighthouse evidence captured",
        status: "fail",
        weight: 0,
        detail:
          "Partial scan only: Lighthouse/Core Web Vitals data was unavailable, so performance, accessibility, SEO, and best-practices scores were not measured by Lighthouse.",
        fixHint:
          "Treat this as a preliminary HTML audit until Lighthouse or PageSpeed Insights data is available.",
      });
    }

    // 2. Discover additional pages and audit them lightly (if enabled and homepage scan succeeded)
    if (multipage && homepageAuditSucceeded) {
      try {
        // Fetch the homepage HTML once to extract links
        const ctrl = AbortSignal.timeout(8000);
        const homepageRes = await fetch(result.finalUrl, {
          signal: ctrl,
          headers: { "User-Agent": "RoastMySite/1.0" },
        });
        const homepageHtml = homepageRes.ok ? await homepageRes.text() : "";

        const discovered = await discoverPages(
          result.finalUrl,
          homepageHtml,
          MAX_EXTRA_PAGES + 1 // include homepage in discovery, we'll skip it below
        );

        // Skip the homepage entry (it's already fully audited above)
        const extraPages = discovered.filter(
          (p) => p.guessType !== "homepage"
        );

        if (extraPages.length > 0) {
          // Audit pages sequentially (Playwright browser is shared, so parallel just queues)
          const pageResults = [];
          for (const page of extraPages) {
            const r = await auditPage(page.url, page.guessType, page.source);
            pageResults.push(r);
          }
          result.pages = pageResults;
        }
      } catch (e) {
        console.error("[multipage] failed:", e);
        // Multi-page is best-effort; don't fail the whole audit
      }
    }

    // 3. Merge axe-core accessibility data into checks
    if (screenshots?.axe) {
      const axe = screenshots.axe;
      const criticalAndSerious = axe.criticalCount + axe.seriousCount;
      const topViolations = axe.violations
        .filter((v) => v.impact === "critical" || v.impact === "serious")
        .slice(0, 3)
        .map((v) => v.help)
        .join("; ");

      const altIdx = result.checks.findIndex((c) => c.id === "alts");
      if (altIdx >= 0 && axe.violations.length > 0) {
        result.checks.splice(altIdx, 1);
      }

      const axeCheck: Check = {
        id: "axe_violations",
        label: "Real WCAG violations (axe-core)",
        status:
          criticalAndSerious === 0
            ? "pass"
            : criticalAndSerious <= 3
            ? "warn"
            : "fail",
        weight: 6,
        detail:
          axe.violations.length === 0
            ? "Zero WCAG 2.0 AA violations found. Genuinely accessible."
            : `${axe.violations.length} violation type${
                axe.violations.length !== 1 ? "s" : ""
              } affecting ${axe.totalNodes} element${
                axe.totalNodes !== 1 ? "s" : ""
              }. ${axe.criticalCount} critical, ${axe.seriousCount} serious.${
                topViolations ? ` Top issues: ${topViolations}.` : ""
              }`,
        fixHint:
          criticalAndSerious > 0
            ? "axe identified exact element selectors. A developer can fix these in 1-2 hours. Failing accessibility is a real legal exposure — over 4,000 ADA lawsuits in 2024 targeted websites."
            : undefined,
      };
      result.checks.push(axeCheck);
    }

    // 4. Recompute score after axe data is merged
    const scoreSummary = computeAuditScore(result.checks, {
      hasScreenshots: !!screenshots,
      hasLighthouse: !!result.lighthouse,
    });
    result.score = scoreSummary.score;
    result.grade = scoreSummary.grade;
    result.vibe = scoreSummary.vibe;

    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Audit failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function normalizeUrlForShot(input: string): string {
  let raw = input.trim();
  if (!/^https?:\/\//i.test(raw)) raw = "https://" + raw;
  return raw;
}
