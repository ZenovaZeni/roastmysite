import type { AuditResult } from "./audit";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const MODEL = process.env.ROAST_MODEL || "gemma4:latest";

export function buildRoastPrompt(audit: AuditResult, hasVision: boolean): string {
  const failed = audit.checks.filter((c) => c.status === "fail");
  const warned = audit.checks.filter((c) => c.status === "warn");
  const passed = audit.checks.filter((c) => c.status === "pass");

  const bullet = (label: string, list: typeof audit.checks) =>
    list.length ? `${label}:\n` + list.map((c) => `- ${c.label}: ${c.detail}`).join("\n") : "";

  const visionLine = hasVision
    ? `\nYou are also seeing a desktop screenshot of the homepage. Use what you see — colors, layout, typography, visual hierarchy, hero imagery, professionalism — alongside the data below. Reference at least one specific visual observation in paragraph 1.\n`
    : "";

  const techLine = audit.techStack
    ? `\nTech stack detected: ${[
        audit.techStack.cms,
        audit.techStack.builder,
        audit.techStack.ecommerce,
        audit.techStack.platform,
      ]
        .filter(Boolean)
        .join(", ") || "custom / unknown"}.`
    : "";

  const freshnessLine =
    audit.wayback?.daysSinceLastSnapshot !== undefined &&
    audit.wayback?.daysSinceLastSnapshot !== null
      ? `\nWayback Machine shows the last archived snapshot was ${audit.wayback.daysSinceLastSnapshot} days ago. First ever snapshot: ${audit.wayback.firstSnapshot?.slice(0, 10) || "unknown"}.`
      : "";

  const securityLine = audit.security?.grade
    ? `\nMozilla Observatory rates the security headers ${audit.security.grade}.`
    : "";

  const lighthouseLine = audit.lighthouse
    ? `\nGoogle Lighthouse (desktop, just measured): Performance ${audit.lighthouse.scores.performance}/100, Accessibility ${audit.lighthouse.scores.accessibility}/100, SEO ${audit.lighthouse.scores.seo}/100, Best Practices ${audit.lighthouse.scores.bestPractices}/100. LCP: ${audit.lighthouse.vitals.lcp}ms, CLS: ${audit.lighthouse.vitals.cls}, TBT: ${audit.lighthouse.vitals.tbt}ms.${
        audit.lighthouse.opportunities.length > 0
          ? `\nTop performance opportunities flagged by Lighthouse: ${audit.lighthouse.opportunities
              .slice(0, 3)
              .map((o) => `${o.title} (saves ~${o.savingsMs}ms)`)
              .join("; ")}.`
          : ""
      }`
    : "";

  const domainLine =
    audit.domain?.ageYears !== null && audit.domain?.ageYears !== undefined
      ? `\nDomain registered ${audit.domain.ageYears} year${
          audit.domain.ageYears !== 1 ? "s" : ""
        } ago${audit.domain.registrar ? ` via ${audit.domain.registrar}` : ""}.`
      : "";

  const axeLine =
    audit.screenshots?.axe && audit.screenshots.axe.violations.length > 0
      ? `\naxe-core found ${audit.screenshots.axe.violations.length} WCAG violation types (${audit.screenshots.axe.criticalCount} critical, ${audit.screenshots.axe.seriousCount} serious) affecting ${audit.screenshots.axe.totalNodes} elements.`
      : "";

  const socialLine =
    audit.social && audit.social.warnings.length > 0
      ? `\nSocial preview issues: ${audit.social.warnings.join("; ")}`
      : "";

  const siteTypeLine =
    audit.siteType && audit.siteType.type !== "unknown"
      ? `\nSite type detected: ${audit.siteType.type} (confidence ${(audit.siteType.confidence * 100).toFixed(0)}%). Calibrate your roast accordingly — a search engine homepage shouldn't be roasted for "no contact form", a service business should be.`
      : "";

  return `You are RoastMySite, a brutally honest but ultimately helpful website critic. Your tone is a senior creative director from New York after their second espresso — sharp, witty, specific, never mean for the sake of mean. You speak to the BUSINESS OWNER, not their developer.
${visionLine}
Audit results for ${audit.url}
Overall score: ${audit.score}/100 (grade ${audit.grade})
Page loaded in ${audit.loadMs}ms, ${(audit.bytes / 1024).toFixed(1)}KB of HTML, ${audit.meta.wordCount} words of body content.${siteTypeLine}${lighthouseLine}${techLine}${freshnessLine}${securityLine}${domainLine}${axeLine}${socialLine}

${bullet("FAILED CHECKS", failed)}

${bullet("WARNINGS", warned)}

${bullet("PASSED", passed.slice(0, 5))}

Write a 3-paragraph roast (about 180 words total):

Paragraph 1 — The hook. One sharp observation about what this site reveals about the business${
    hasVision ? ", grounded in something visible in the screenshot" : ""
  }. Specific, not generic.

Paragraph 2 — The pile-on. Pick the 2 most embarrassing failures and explain in plain English what they're costing this business in customers, money, or credibility. Use one concrete number if you can ("loses ~30% of mobile visitors", etc.).

Paragraph 3 — The escape hatch. Tell them the ONE thing to fix this week that would move the needle most. End with a single line of encouragement so they don't feel hopeless.

Rules:
- Address the owner as "you" / "your site".
- No bullet points. Flowing prose.
- No "as an AI" disclaimers.
- No emojis.
- Don't repeat the score number.
- Each paragraph separated by a blank line.`;
}

export async function streamRoast(
  prompt: string,
  imageBase64?: string
): Promise<ReadableStream<Uint8Array>> {
  const message: Record<string, unknown> = {
    role: "user",
    content: prompt,
  };
  if (imageBase64) {
    message.images = [imageBase64];
  }

  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [message],
      stream: true,
      think: false,
      options: {
        temperature: 0.85,
        top_p: 0.9,
        num_predict: 450,
      },
    }),
  });

  if (!res.ok || !res.body) {
    throw new Error(`Ollama returned ${res.status}: ${await res.text()}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buf = "";

  return new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        controller.close();
        return;
      }
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() || "";
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const obj = JSON.parse(line);
          const chunk = obj?.message?.content;
          if (chunk) {
            controller.enqueue(encoder.encode(chunk));
          }
        } catch {
          // ignore partial chunks
        }
      }
    },
    cancel() {
      reader.cancel();
    },
  });
}

export async function isOllamaReady(): Promise<boolean> {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, {
      signal: AbortSignal.timeout(2000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
