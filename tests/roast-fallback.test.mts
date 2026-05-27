import assert from "node:assert/strict";
import test from "node:test";
import { buildFallbackRoast } from "../lib/roaster-personality.ts";
import type { AuditResult } from "../lib/audit.ts";

const audit: AuditResult = {
  url: "https://example.com",
  finalUrl: "https://example.com/",
  fetchedAt: new Date("2026-05-27T00:00:00Z").toISOString(),
  loadMs: 120,
  bytes: 75_000,
  score: 64,
  grade: "C",
  vibe: "Functional but forgettable.",
  checks: [
    {
      id: "browser_evidence",
      label: "Browser evidence captured",
      status: "fail",
      weight: 0,
      detail: "Browser evidence missing.",
    },
  ],
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
    title: "Example",
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
    wordCount: 200,
    imageCount: 0,
    imagesMissingAlt: 0,
    linkCount: 0,
    externalLinks: 0,
    poweredBy: null,
    hasGoogleAnalytics: false,
    hasSchemaMarkup: false,
  },
};

test("missing provider config uses honest data-only fallback copy", () => {
  const text = buildFallbackRoast(audit, 1, "missing-provider-config");
  assert.doesNotMatch(
    text,
    /quota|midnight|cooked|pipes|free tier|brain = soup/i
  );
  assert.match(text, /provider|fallback|data/i);
});
