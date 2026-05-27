import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: [
    "cheerio",
    "playwright",
    "@axe-core/playwright",
    "puppeteer-core",
    "@sparticuz/chromium",
    "axe-core",
    "whois-json",
    "@react-pdf/renderer",
    "lighthouse",
    "chrome-launcher",
  ],
};

export default config;
