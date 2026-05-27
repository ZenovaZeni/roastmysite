import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: [
    "cheerio",
    "playwright",
    "@axe-core/playwright",
    "axe-core",
    "whois-json",
    "@react-pdf/renderer",
    "lighthouse",
    "chrome-launcher",
  ],
};

export default config;
