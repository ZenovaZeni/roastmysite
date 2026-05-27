export type LighthouseResult = {
  source: "local-lighthouse";
  strategy: "mobile" | "desktop";
  scores: {
    performance: number | null;
    accessibility: number | null;
    bestPractices: number | null;
    seo: number | null;
  };
  vitals: {
    lcp: number | null; // ms
    fcp: number | null; // ms
    cls: number | null;
    tbt: number | null; // ms
    si: number | null; // ms
    tti: number | null; // ms
  };
  opportunities: Array<{
    id: string;
    title: string;
    savingsMs: number | null;
    description: string;
  }>;
  diagnostics: Array<{
    id: string;
    title: string;
  }>;
  finalUrl: string;
  durationMs: number;
};

// Process-level mutex — chrome-launcher / Lighthouse don't play well in parallel.
// Multiple simultaneous runs collide on perf marks and temp dirs. We serialize.
let lighthouseQueue: Promise<unknown> = Promise.resolve();

export async function runLocalLighthouse(
  url: string,
  strategy: "mobile" | "desktop" = "mobile"
): Promise<LighthouseResult | null> {
  const run = async (): Promise<LighthouseResult | null> => {
    const localResult = await tryLocalLighthouse(url, strategy);
    if (localResult) return localResult;
    return await tryPsiFallback(url, strategy);
  };

  // Chain onto the queue: this run waits until the previous one is done.
  // Catch on the predecessor so one failure doesn't poison the chain.
  const result = lighthouseQueue.then(() => run(), () => run());
  lighthouseQueue = result.catch(() => null);
  return result;
}

async function tryLocalLighthouse(
  url: string,
  strategy: "mobile" | "desktop"
): Promise<LighthouseResult | null> {
  // On Vercel, launch the packaged serverless Chromium binary.
  if (
    process.env.DISABLE_LOCAL_LIGHTHOUSE === "1" ||
    (process.env.VERCEL === "1" && process.env.ENABLE_SERVERLESS_LIGHTHOUSE !== "1")
  ) {
    return null;
  }
  const started = Date.now();
  let chrome: { kill: () => Promise<void> | void; port: number } | null = null;
  try {
    const chromeLauncher = await import("chrome-launcher");
    const path = await import("node:path");
    const fs = await import("node:fs");
    const os = await import("node:os");
    const isServerless =
      process.env.VERCEL === "1" || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
    let chromePath: string | undefined;
    let serverlessFlags: string[] = [];
    if (isServerless) {
      const { getServerlessChromium } = await import("./capture-browser");
      const chromium = await getServerlessChromium();
      chromePath = chromium.executablePath;
      serverlessFlags = chromium.args;
    }

    // Keep Chrome's runtime profile outside the project so deploy uploads stay small.
    const userDataDir = path.join(
      os.tmpdir(),
      "roastmysite-lighthouse",
      `chrome-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    );
    fs.mkdirSync(userDataDir, { recursive: true });

    chrome = await chromeLauncher.launch({
      chromePath,
      chromeFlags: [
        ...serverlessFlags,
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disable-blink-features=AutomationControlled",
        `--user-data-dir=${userDataDir}`,
      ],
      userDataDir: false,
    });

    const lighthouseMod = await import("lighthouse");
    const lighthouse = (lighthouseMod as { default?: unknown }).default ??
      lighthouseMod;

    const runner = await (lighthouse as unknown as (
      url: string,
      flags: Record<string, unknown>,
      config?: Record<string, unknown>
    ) => Promise<{ lhr?: Record<string, unknown>; report?: string }>)(
      url,
      {
        port: chrome!.port,
        output: "json",
        logLevel: "error",
        maxWaitForLoad: 30000,
        onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
        formFactor: strategy,
        screenEmulation:
          strategy === "mobile"
            ? {
                mobile: true,
                width: 412,
                height: 823,
                deviceScaleFactor: 1.75,
                disabled: false,
              }
            : { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false },
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          cpuSlowdownMultiplier: 4,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0,
        },
      }
    );

    await chrome!.kill();
    chrome = null;

    const lhr = (runner?.lhr ?? null) as
      | (Record<string, unknown> & {
          categories: Record<string, { score: number | null }>;
          audits: Record<
            string,
            { numericValue?: number; details?: { type?: string; overallSavingsMs?: number }; title?: string; description?: string }
          >;
          finalUrl?: string;
          finalDisplayedUrl?: string;
        })
      | null;
    if (!lhr) return null;

    const toScore = (k: string): number | null => {
      const s = lhr.categories?.[k]?.score;
      return typeof s === "number" ? Math.round(s * 100) : null;
    };
    const toMs = (k: string): number | null => {
      const v = lhr.audits?.[k]?.numericValue;
      return typeof v === "number" ? Math.round(v) : null;
    };
    const toNum = (k: string): number | null => {
      const v = lhr.audits?.[k]?.numericValue;
      return typeof v === "number" ? Number(v.toFixed(3)) : null;
    };

    const opportunities = Object.values(lhr.audits || {})
      .filter(
        (a) =>
          a?.details?.type === "opportunity" &&
          typeof a?.details?.overallSavingsMs === "number" &&
          (a.details.overallSavingsMs as number) > 100
      )
      .map((a) => ({
        id: (a as { id?: string }).id || "",
        title: a.title || "",
        savingsMs: a.details?.overallSavingsMs ?? null,
        description: (a.description || "").replace(/\[Learn.*?\)/g, "").trim().slice(0, 200),
      }))
      .sort((a, b) => (b.savingsMs || 0) - (a.savingsMs || 0))
      .slice(0, 5);

    // Augment with audit IDs (lighthouse uses the audit ID as key, not in the value)
    Object.entries(lhr.audits || {}).forEach(([id, a]) => {
      const opp = opportunities.find((o) => o.title === a.title);
      if (opp) opp.id = id;
    });

    const diagnostics: Array<{ id: string; title: string }> = [];
    return {
      source: "local-lighthouse",
      strategy,
      scores: {
        performance: toScore("performance"),
        accessibility: toScore("accessibility"),
        bestPractices: toScore("best-practices"),
        seo: toScore("seo"),
      },
      vitals: {
        lcp: toMs("largest-contentful-paint"),
        fcp: toMs("first-contentful-paint"),
        cls: toNum("cumulative-layout-shift"),
        tbt: toMs("total-blocking-time"),
        si: toMs("speed-index"),
        tti: toMs("interactive"),
      },
      opportunities,
      diagnostics,
      finalUrl: (lhr.finalUrl as string) || (lhr.finalDisplayedUrl as string) || url,
      durationMs: Date.now() - started,
    };
  } catch (e) {
    if (chrome) {
      try {
        await chrome.kill();
      } catch {}
    }
    console.error("[lighthouse] local failed:", e instanceof Error ? e.message : e);
    return null;
  }
}

async function tryPsiFallback(
  url: string,
  strategy: "mobile" | "desktop"
): Promise<LighthouseResult | null> {
  const started = Date.now();
  try {
    const { fetchPageSpeedInsights } = await import("./extras");
    const psi = await fetchPageSpeedInsights(url, strategy);
    if (!psi) return null;
    console.log("[lighthouse] fell back to PSI API");
    return {
      source: "local-lighthouse",
      strategy,
      scores: {
        performance: psi.scores.performance,
        accessibility: psi.scores.accessibility,
        bestPractices: psi.scores.bestPractices,
        seo: psi.scores.seo,
      },
      vitals: {
        lcp: psi.vitals.lcp,
        fcp: psi.vitals.fcp,
        cls: psi.vitals.cls,
        tbt: psi.vitals.tbt,
        si: psi.vitals.si,
        tti: psi.vitals.inp ?? null,
      },
      opportunities: psi.opportunities.map((o) => ({
        id: o.id,
        title: o.title,
        savingsMs: o.savingsMs,
        description: o.description,
      })),
      diagnostics: [],
      finalUrl: url,
      durationMs: Date.now() - started,
    };
  } catch (e) {
    console.error("[lighthouse] PSI fallback failed:", e instanceof Error ? e.message : e);
    return null;
  }
}
