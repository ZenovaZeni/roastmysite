import type { Browser, Page } from "playwright";

export type AxeViolation = {
  id: string;
  impact: "critical" | "serious" | "moderate" | "minor" | null;
  description: string;
  help: string;
  helpUrl: string;
  nodeCount: number;
  sampleSelector: string | null;
  boundingBoxes: Array<{ x: number; y: number; width: number; height: number }>;
};

export type AxeSummary = {
  violations: AxeViolation[];
  totalNodes: number;
  criticalCount: number;
  seriousCount: number;
  moderateCount: number;
  minorCount: number;
};

export type Screenshots = {
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

async function captureFullHeight(page: Page): Promise<number> {
  return await page.evaluate(() => {
    return Math.min(
      Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        document.documentElement.offsetHeight,
        document.body.offsetHeight
      ),
      8000
    );
  });
}

async function autoScroll(page: Page) {
  // Trigger lazy-loaded content by scrolling to the bottom
  try {
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let total = 0;
        const step = 400;
        const id = setInterval(() => {
          window.scrollBy(0, step);
          total += step;
          if (
            total >= document.body.scrollHeight ||
            window.scrollY + window.innerHeight >= document.body.scrollHeight
          ) {
            clearInterval(id);
            resolve();
          }
        }, 80);
      });
      window.scrollTo(0, 0);
    });
  } catch {
    // ignore
  }
}

async function runAxe(page: Page): Promise<AxeSummary | null> {
  try {
    const { AxeBuilder } = await import("@axe-core/playwright");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "best-practice"])
      .analyze();

    // Capture bounding boxes for the FIRST node of each violation (in viewport coords)
    const violations: AxeViolation[] = [];
    for (const v of results.violations) {
      const boundingBoxes: AxeViolation["boundingBoxes"] = [];
      // Only first 3 nodes per violation to keep payload sane
      for (const node of v.nodes.slice(0, 3)) {
        const selector = node.target?.[0];
        if (typeof selector !== "string") continue;
        try {
          const locator = page.locator(selector).first();
          const box = await locator.boundingBox({ timeout: 1000 });
          if (
            box &&
            box.x >= 0 &&
            box.y >= 0 &&
            box.width > 0 &&
            box.height > 0 &&
            box.y < 800 // only viewport-visible (above the fold)
          ) {
            boundingBoxes.push({
              x: Math.round(box.x),
              y: Math.round(box.y),
              width: Math.round(box.width),
              height: Math.round(box.height),
            });
          }
        } catch {
          // selector didn't resolve or was off-screen — fine
        }
      }

      violations.push({
        id: v.id,
        impact: (v.impact as AxeViolation["impact"]) ?? null,
        description: v.description,
        help: v.help,
        helpUrl: v.helpUrl,
        nodeCount: v.nodes.length,
        sampleSelector:
          v.nodes[0]?.target?.join(" > ").slice(0, 200) || null,
        boundingBoxes,
      });
    }

    const totalNodes = violations.reduce((s, v) => s + v.nodeCount, 0);
    return {
      violations,
      totalNodes,
      criticalCount: violations.filter((v) => v.impact === "critical").length,
      seriousCount: violations.filter((v) => v.impact === "serious").length,
      moderateCount: violations.filter((v) => v.impact === "moderate").length,
      minorCount: violations.filter((v) => v.impact === "minor").length,
    };
  } catch (e) {
    console.error("[axe] failed:", e instanceof Error ? e.message : e);
    return null;
  }
}

export async function captureScreenshots(url: string): Promise<Screenshots | null> {
  let desktopCtx, mobileCtx;
  try {
    const browser = await getBrowser();

    // DESKTOP
    desktopCtx = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 1,
    });

    const desktopPage = await desktopCtx.newPage();
    try {
      await desktopPage.goto(url, { waitUntil: "load", timeout: 15000 });
      await desktopPage.waitForTimeout(800);
      await autoScroll(desktopPage);
      await desktopPage.waitForTimeout(500);
    } catch {
      // continue
    }

    const desktopFullHeight = await captureFullHeight(desktopPage);

    // Above-the-fold (sent to Gemma)
    const desktopBuf = await desktopPage.screenshot({
      fullPage: false,
      type: "jpeg",
      quality: 80,
    });
    // Full-page
    const desktopFullBuf = await desktopPage.screenshot({
      fullPage: true,
      type: "jpeg",
      quality: 70,
    });

    // Run axe on the desktop page while it's loaded
    const axe = await runAxe(desktopPage);

    // MOBILE
    mobileCtx = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileCtx.newPage();
    try {
      await mobilePage.goto(url, { waitUntil: "load", timeout: 15000 });
      await mobilePage.waitForTimeout(800);
      await autoScroll(mobilePage);
      await mobilePage.waitForTimeout(500);
    } catch {
      // continue
    }

    const mobileFullHeight = await captureFullHeight(mobilePage);

    const mobileBuf = await mobilePage.screenshot({
      fullPage: false,
      type: "jpeg",
      quality: 80,
    });
    const mobileFullBuf = await mobilePage.screenshot({
      fullPage: true,
      type: "jpeg",
      quality: 70,
    });

    await desktopCtx.close();
    await mobileCtx.close();

    return {
      desktop: desktopBuf.toString("base64"),
      desktopFull: desktopFullBuf.toString("base64"),
      mobile: mobileBuf.toString("base64"),
      mobileFull: mobileFullBuf.toString("base64"),
      desktopWidth: 1280,
      desktopHeight: 800,
      desktopFullHeight,
      mobileWidth: 390,
      mobileHeight: 844,
      mobileFullHeight,
      capturedAt: new Date().toISOString(),
      axe,
    };
  } catch (e) {
    if (desktopCtx) {
      try {
        await desktopCtx.close();
      } catch {}
    }
    if (mobileCtx) {
      try {
        await mobileCtx.close();
      } catch {}
    }
    console.error("[screenshot] failed:", e instanceof Error ? e.message : e);
    return null;
  }
}
