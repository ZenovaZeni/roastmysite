import type { Check } from "./audit";

export type AuditGrade = "A" | "B" | "C" | "D" | "F";

type EvidenceState = {
  hasScreenshots?: boolean;
  hasLighthouse?: boolean;
};

export function computeGrade(score: number): AuditGrade {
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  if (score >= 50) return "C";
  if (score >= 35) return "D";
  return "F";
}

export function computeVibe(score: number): string {
  if (score >= 80) return "Top-tier. This is what good looks like.";
  if (score >= 65) return "Solid foundation, a few polish jobs from premium.";
  if (score >= 50) return "Functional but forgettable. Leaking revenue daily.";
  if (score >= 35) return "Hemorrhaging customers. Visible from space.";
  if (score >= 20) return "Yikes. This is actively driving people to your competitors.";
  return "Burn it down. Start over. Today.";
}

export function computeAuditScore(checks: Check[], evidence: EvidenceState = {}) {
  const totalWeight = checks.reduce((s, c) => s + c.weight, 0);
  const earned = checks.reduce((s, c) => {
    if (c.status === "pass") return s + c.weight;
    if (c.status === "warn") return s + c.weight * 0.65;
    return s;
  }, 0);

  const rawScore = totalWeight > 0 ? Math.round((earned / totalWeight) * 100) : 0;
  let cap = 100;
  if (evidence.hasScreenshots === false && evidence.hasLighthouse === false) {
    cap = 64;
  } else if (evidence.hasLighthouse === false) {
    cap = 79;
  } else if (evidence.hasScreenshots === false) {
    cap = 84;
  }

  const score = Math.min(rawScore, cap);

  return {
    score,
    grade: computeGrade(score),
    vibe: computeVibe(score),
  };
}
