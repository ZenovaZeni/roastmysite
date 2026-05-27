/**
 * Roast provider rotation.
 *
 * Order of attempt:
 *  1. Groq Llama 4 Scout (vision, 1k/day free) — primary
 *  2. Google Gemini 2.5 Flash-Lite (vision, 1k/day free) — fallback
 *  3. Local Ollama Gemma 4 (dev only — never on prod) — local-dev fallback
 *  4. Template fallback (data-driven, always works) — emergency
 *
 * Each provider call is wrapped in a 30s timeout. On 429 / 5xx / timeout,
 * we move down the chain. The wrapper in /api/roast adds the time-aware
 * opening + closing lines from roaster-personality so the voice stays
 * consistent regardless of which engine generated the middle.
 */

import type { AuditResult } from "./audit";
import { buildFallbackRoast, buildMiddle, buildContext } from "./roaster-personality";

const SYSTEM_PROMPT_BASE = `You are "The Roaster" — a snarky, tired, opinionated website critic who's been roasting sites all day. You speak directly to the site owner like a friend who has had too much coffee and zero patience for excuses. Your tone: confident, specific, slightly mean, ultimately useful.

Rules:
- NEVER say the word "AI", "language model", or anything like that. You're a character.
- Address the owner as "you".
- Be specific — quote real data from the audit (load times, scores, missing forms, etc).
- Three paragraphs, ~150-180 words total.
- No bullet points. Flowing prose.
- No emojis.
- End with a one-line piece of advice — the ONE thing to fix this week.`;

function buildUserPrompt(audit: AuditResult, hasVision: boolean): string {
  const failed = audit.checks.filter((c) => c.status === "fail");
  const warned = audit.checks.filter((c) => c.status === "warn");
  const passed = audit.checks.filter((c) => c.status === "pass");

  const bullet = (label: string, list: typeof audit.checks, limit = 999) =>
    list.length
      ? `${label}:\n` +
        list.slice(0, limit).map((c) => `- ${c.label}: ${c.detail}`).join("\n")
      : "";

  const visionLine = hasVision
    ? `\nYou're also seeing the desktop screenshot. Reference one specific visual observation in the first paragraph (colors, layout, hero copy, professionalism).\n`
    : "";

  const lhLine = audit.lighthouse
    ? `\nLighthouse desktop: Performance ${audit.lighthouse.scores.performance}/100, A11y ${audit.lighthouse.scores.accessibility}, SEO ${audit.lighthouse.scores.seo}, Best Practices ${audit.lighthouse.scores.bestPractices}. LCP ${audit.lighthouse.vitals.lcp}ms, CLS ${audit.lighthouse.vitals.cls}, TBT ${audit.lighthouse.vitals.tbt}ms.`
    : "";

  const techLine = audit.techStack
    ? `\nStack: ${[audit.techStack.cms, audit.techStack.builder, audit.techStack.platform].filter(Boolean).join(", ") || "custom/unknown"}.`
    : "";

  const domainLine =
    audit.domain?.ageYears !== null && audit.domain?.ageYears !== undefined
      ? `\nDomain registered ${audit.domain.ageYears} years ago.`
      : "";

  const siteTypeLine =
    audit.siteType && audit.siteType.type !== "unknown"
      ? `\nSite type: ${audit.siteType.type}. Calibrate accordingly — a search engine shouldn't be roasted for "no contact form".`
      : "";

  const presenceLine = audit.onlinePresence
    ? `\nOnline presence: ${audit.onlinePresence.profilesFound.length} of ${audit.onlinePresence.platformsChecked.length} social platforms linked${
        audit.onlinePresence.profilesFound.length === 0
          ? " (zero — nothing)"
          : ` (${audit.onlinePresence.profilesFound.map((p) => p.label).join(", ")})`
      }. Tap-to-call: ${audit.onlinePresence.hasTapToCall ? "yes" : "NO"}. Maps embed: ${audit.onlinePresence.hasMapEmbed ? "yes" : "no"}. Presence score: ${audit.onlinePresence.presenceScore}/100.`
    : "";

  return `Site: ${audit.url}
Score: ${audit.score}/100 (${audit.grade})
Loaded in ${audit.loadMs}ms, ${(audit.bytes / 1024).toFixed(0)}KB HTML, ${audit.meta.wordCount} words.${lhLine}${techLine}${domainLine}${siteTypeLine}${presenceLine}${visionLine}

${bullet("FAILED", failed)}

${bullet("WARNINGS", warned, 5)}

Write the roast.`;
}

// ============================================================================
// PROVIDER 1 — GROQ (Llama 4 Scout multimodal)
// ============================================================================

async function callGroq(audit: AuditResult, imageB64?: string): Promise<string | null> {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;

  const content: Array<Record<string, unknown>> = [
    { type: "text", text: buildUserPrompt(audit, !!imageB64) },
  ];
  if (imageB64) {
    content.push({
      type: "image_url",
      image_url: { url: `data:image/jpeg;base64,${imageB64}` },
    });
  }

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          { role: "system", content: SYSTEM_PROMPT_BASE },
          { role: "user", content },
        ],
        temperature: 0.85,
        top_p: 0.9,
        max_tokens: 500,
      }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error("[groq] failed:", res.status, txt.slice(0, 200));
      return null;
    }
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    return typeof text === "string" && text.length > 50 ? text.trim() : null;
  } catch (e) {
    console.error("[groq] error:", e instanceof Error ? e.message : e);
    return null;
  }
}

// ============================================================================
// PROVIDER 2 — GEMINI 2.5 Flash-Lite (multimodal)
// ============================================================================

async function callGemini(audit: AuditResult, imageB64?: string): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  const parts: Array<Record<string, unknown>> = [
    { text: SYSTEM_PROMPT_BASE + "\n\n" + buildUserPrompt(audit, !!imageB64) },
  ];
  if (imageB64) {
    parts.push({
      inline_data: {
        mime_type: "image/jpeg",
        data: imageB64,
      },
    });
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts }],
          generationConfig: {
            temperature: 0.85,
            topP: 0.9,
            maxOutputTokens: 500,
          },
        }),
        signal: AbortSignal.timeout(30_000),
      }
    );
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error("[gemini] failed:", res.status, txt.slice(0, 200));
      return null;
    }
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return typeof text === "string" && text.length > 50 ? text.trim() : null;
  } catch (e) {
    console.error("[gemini] error:", e instanceof Error ? e.message : e);
    return null;
  }
}

// ============================================================================
// PROVIDER 3 — LOCAL OLLAMA GEMMA (dev-only)
// ============================================================================

async function callLocalGemma(audit: AuditResult, imageB64?: string): Promise<string | null> {
  // Only attempt if explicitly enabled (avoids long timeouts on serverless prod)
  if (process.env.DISABLE_LOCAL_GEMMA === "1") return null;
  const url = process.env.OLLAMA_URL || "http://localhost:11434";
  const model = process.env.LOCAL_MODEL || "gemma4:latest";

  const message: Record<string, unknown> = {
    role: "user",
    content:
      SYSTEM_PROMPT_BASE + "\n\n" + buildUserPrompt(audit, !!imageB64),
  };
  if (imageB64) {
    message.images = [imageB64];
  }

  try {
    const res = await fetch(`${url}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [message],
        stream: false,
        think: false,
        options: { temperature: 0.85, top_p: 0.9, num_predict: 500 },
      }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.message?.content;
    return typeof text === "string" && text.length > 50 ? text.trim() : null;
  } catch {
    return null;
  }
}

// ============================================================================
// THE ROUTER
// ============================================================================

export type RoastSource =
  | "groq"
  | "gemini"
  | "local-gemma"
  | "template-fallback";

export type RoastResult = {
  text: string; // just the middle — caller wraps with personality opening/closing
  source: RoastSource;
  hasVision: boolean;
};

function scanWasUnreachable(audit: AuditResult): boolean {
  if (audit.bytes === 0 && audit.loadMs === 0) return true;
  if (audit.checks.length === 1 && audit.checks[0].id === "reachable") return true;
  return false;
}

export async function generateRoast(
  audit: AuditResult,
  imageB64?: string,
  countToday = 1
): Promise<RoastResult> {
  // If the scan itself failed (URL unreachable), don't burn API quota on
  // empty audit data — go straight to the unreachable template.
  if (scanWasUnreachable(audit)) {
    const ctx = buildContext(audit, countToday);
    // unreachable flag set automatically inside buildContext
    return {
      text: buildMiddle(ctx),
      source: "template-fallback",
      hasVision: false,
    };
  }

  // Provider order: try Groq → Gemini → local Gemma → template
  const providers: Array<{
    source: RoastSource;
    fn: () => Promise<string | null>;
  }> = [
    { source: "groq", fn: () => callGroq(audit, imageB64) },
    { source: "gemini", fn: () => callGemini(audit, imageB64) },
    { source: "local-gemma", fn: () => callLocalGemma(audit, imageB64) },
  ];

  for (const p of providers) {
    const text = await p.fn();
    if (text) {
      return { text, source: p.source, hasVision: !!imageB64 };
    }
  }

  // All real providers failed — use the personality template middle
  const ctx = buildContext(audit, countToday);
  ctx.exhausted = true;
  return {
    text: buildMiddle(ctx),
    source: "template-fallback",
    hasVision: false,
  };
}

/** Returns the full personality-wrapped roast (opening + middle + closing). */
export async function generateFullRoast(
  audit: AuditResult,
  imageB64?: string,
  countToday = 1
): Promise<{ text: string; source: RoastSource }> {
  const result = await generateRoast(audit, imageB64, countToday);

  // If template fallback fired, buildFallbackRoast already wraps with opening + closing
  if (result.source === "template-fallback") {
    return {
      text: buildFallbackRoast(audit, countToday),
      source: result.source,
    };
  }

  // Otherwise, wrap the LLM middle with personality opening + closing
  const ctx = buildContext(audit, countToday);
  const opening = (await import("./roaster-personality")).buildOpening(ctx);
  const closing = (await import("./roaster-personality")).buildClosing(ctx);

  return {
    text: [opening, result.text, closing].join("\n\n"),
    source: result.source,
  };
}
