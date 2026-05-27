import type { Browser, Page } from "puppeteer-core";

let browserPromise: Promise<Browser> | null = null;

function isServerlessRuntime() {
  return process.env.VERCEL === "1" || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
}

async function findLocalChrome(): Promise<string | undefined> {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  try {
    const chromeLauncher = await import("chrome-launcher");
    const launcher = chromeLauncher as typeof chromeLauncher & {
      Launcher?: { getInstallations?: () => string[] };
    };
    const installs = launcher.Launcher?.getInstallations?.() || [];
    if (installs[0]) return installs[0];
  } catch {
    // Fall through to Playwright's local browser path when available.
  }

  try {
    const { chromium } = await import("playwright");
    return chromium.executablePath();
  } catch {
    return undefined;
  }
}

export async function getServerlessChromium() {
  const chromiumMod = await import("@sparticuz/chromium");
  const chromium = chromiumMod.default;
  return {
    args: chromium.args,
    executablePath: await chromium.executablePath(),
  };
}

export async function getCaptureBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = (async () => {
      const puppeteer = await import("puppeteer-core");
      const serverless = isServerlessRuntime();
      const serverlessChromium = serverless
        ? await getServerlessChromium()
        : null;
      const executablePath =
        serverlessChromium?.executablePath || (await findLocalChrome());

      if (!executablePath) {
        throw new Error(
          "No Chromium executable available. Set CHROME_PATH/PUPPETEER_EXECUTABLE_PATH or run in Vercel with @sparticuz/chromium."
        );
      }

      return puppeteer.launch({
        executablePath,
        headless: true,
        args: [
          ...(serverlessChromium?.args || []),
          "--disable-blink-features=AutomationControlled",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--no-sandbox",
          "--disable-setuid-sandbox",
        ],
      });
    })();
    browserPromise.catch(() => {
      browserPromise = null;
    });
  }
  return browserPromise;
}

export type CapturePage = Page;
