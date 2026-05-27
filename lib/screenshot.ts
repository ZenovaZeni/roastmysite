import axeCore from "axe-core";
import { getCaptureBrowser, type CapturePage } from "./capture-browser";

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

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function captureFullHeight(page: CapturePage): Promise<number> {
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

async function autoScroll(page: CapturePage) {
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

async function runAxe(page: CapturePage): Promise<AxeSummary | null> {
  try {
    await page.evaluate(axeCore.source);
    const results = await page.evaluate(async () => {
      const axe = (window as unknown as {
        axe: {
          run: (
            context: Document,
            options: Record<string, unknown>
          ) => Promise<{
            violations: Array<{
              id: string;
              impact: "critical" | "serious" | "moderate" | "minor" | null;
              description: string;
              help: string;
              helpUrl: string;
              nodes: Array<{ target?: string[] }>;
            }>;
          }>;
        };
      }).axe;
      return axe.run(document, {
        runOnly: {
          type: "tag",
          values: ["wcag2a", "wcag2aa", "best-practice"],
        },
      });
    });

    // Capture bounding boxes for the FIRST node of each violation (in viewport coords)
    const violations: AxeViolation[] = [];
    for (const v of results.violations) {
      const boundingBoxes: AxeViolation["boundingBoxes"] = [];
      // Only first 3 nodes per violation to keep payload sane
      for (const node of v.nodes.slice(0, 3)) {
        const selector = node.target?.[0];
        if (typeof selector !== "string") continue;
        try {
          const handle = await page.$(selector);
          const box = handle ? await handle.boundingBox() : null;
          await handle?.dispose();
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
  let desktopPage: CapturePage | null = null;
  let mobilePage: CapturePage | null = null;
  try {
    const browser = await getCaptureBrowser();

    // DESKTOP
    desktopPage = await browser.newPage();
    await desktopPage.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36"
    );
    await desktopPage.setViewport({
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
    });

    try {
      await desktopPage.goto(url, { waitUntil: "load", timeout: 15000 });
      await wait(800);
      await autoScroll(desktopPage);
      await wait(500);
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
    mobilePage = await browser.newPage();
    await mobilePage.setUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
    );
    await mobilePage.setViewport({
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    try {
      await mobilePage.goto(url, { waitUntil: "load", timeout: 15000 });
      await wait(800);
      await autoScroll(mobilePage);
      await wait(500);
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

    await desktopPage.close();
    await mobilePage.close();

    return {
      desktop: Buffer.from(desktopBuf).toString("base64"),
      desktopFull: Buffer.from(desktopFullBuf).toString("base64"),
      mobile: Buffer.from(mobileBuf).toString("base64"),
      mobileFull: Buffer.from(mobileFullBuf).toString("base64"),
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
    if (desktopPage) {
      try {
        await desktopPage.close();
      } catch {}
    }
    if (mobilePage) {
      try {
        await mobilePage.close();
      } catch {}
    }
    console.error("[screenshot] failed:", e instanceof Error ? e.message : e);
    return null;
  }
}
