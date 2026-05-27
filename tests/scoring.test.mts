import assert from "node:assert/strict";
import test from "node:test";
import { computeAuditScore } from "../lib/scoring.ts";
import type { Check } from "../lib/audit.ts";

let id = 0;
function check(status: Check["status"], weight: number): Check {
  return {
    id: `${status}-${weight}-${id++}`,
    label: "test",
    status,
    weight,
    detail: "test",
  };
}

test("caps an otherwise high score when browser evidence is missing", () => {
  const checks: Check[] = [
    check("pass", 12),
    check("pass", 8),
    check("pass", 6),
    check("pass", 10),
    check("pass", 10),
    check("pass", 6),
    check("pass", 6),
    check("pass", 5),
    check("warn", 4),
    check("warn", 3),
    check("warn", 3),
    check("fail", 4),
  ];

  const result = computeAuditScore(checks, {
    hasScreenshots: false,
    hasLighthouse: false,
  });

  assert.equal(result.score, 64);
  assert.equal(result.grade, "C");
});

test("does not cap a high score when browser evidence is present", () => {
  const checks: Check[] = [
    check("pass", 25),
    check("pass", 25),
    check("pass", 20),
    check("pass", 20),
    check("warn", 4),
  ];

  const result = computeAuditScore(checks, {
    hasScreenshots: true,
    hasLighthouse: true,
  });

  assert.equal(result.score, 99);
  assert.equal(result.grade, "A");
});

test("prevents an A when Lighthouse evidence is missing", () => {
  const checks: Check[] = [
    check("pass", 25),
    check("pass", 25),
    check("pass", 20),
    check("pass", 20),
    check("pass", 10),
  ];

  const result = computeAuditScore(checks, {
    hasScreenshots: true,
    hasLighthouse: false,
  });

  assert.equal(result.score, 79);
  assert.equal(result.grade, "B");
});
