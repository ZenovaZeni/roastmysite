import assert from "node:assert/strict";
import test from "node:test";
import { buildContext } from "../lib/roaster-personality.ts";
import type { AuditResult } from "../lib/audit.ts";

const audit = {
  url: "https://example.com",
  finalUrl: "https://example.com/",
  fetchedAt: "2026-05-28T04:59:00.000Z",
  loadMs: 100,
  bytes: 1000,
  score: 80,
  grade: "A",
  vibe: "Top-tier.",
  checks: [],
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
    viewport: true,
    httpsCanonical: true,
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
} satisfies AuditResult;

test("roaster context formats time in the user's timezone", () => {
  const ctx = buildContext(
    audit,
    1,
    new Date("2026-05-28T04:59:00.000Z"),
    "America/New_York"
  );

  assert.equal(ctx.timeStr, "12:59am");
  assert.equal(ctx.timeBlock, "weeHours");
  assert.equal(ctx.dayName, "Thursday");
  assert.equal(ctx.timeZone, "America/New_York");
});
