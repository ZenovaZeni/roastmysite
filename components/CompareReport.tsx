"use client";
import { useCallback, useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { AuditResult } from "@/lib/audit";
import {
  Trophy,
  Swords,
  RotateCcw,
  Share2,
  Twitter,
  Copy,
  Check,
  ArrowRight,
  Crown,
  Equal,
} from "lucide-react";

type Side = "you" | "them";

export function CompareReport({
  you,
  them,
  onReset,
}: {
  you: AuditResult;
  them: AuditResult;
  onReset: () => void;
}) {
  const wins = countWins(you, them);

  return (
    <div className="pt-8 md:pt-12 space-y-10 max-w-7xl mx-auto">
      <VerdictHeader you={you} them={them} wins={wins} onReset={onReset} />
      <ScoreShowdown you={you} them={them} />
      <LighthouseShowdown you={you} them={them} />
      <ScreenshotShowdown you={you} them={them} />
      <CategoryGrid you={you} them={them} />
      <ShareCompare you={you} them={them} wins={wins} />
    </div>
  );
}

// ============================================================================
// VERDICT HEADER
// ============================================================================

function VerdictHeader({
  you,
  them,
  wins,
  onReset,
}: {
  you: AuditResult;
  them: AuditResult;
  wins: { you: number; them: number; tied: number };
  onReset: () => void;
}) {
  const winner = you.score > them.score ? "you" : you.score < them.score ? "them" : "tie";
  const youHost = hostname(you.url);
  const themHost = hostname(them.url);
  const verdict =
    winner === "tie"
      ? "Dead heat. Both sites need work."
      : winner === "you"
      ? wins.you - wins.them >= 3
        ? `You're crushing ${themHost}.`
        : wins.you > wins.them
        ? `You edged out ${themHost}.`
        : `You won on score, but lost on categories.`
      : wins.them - wins.you >= 3
      ? `${themHost} is destroying you.`
      : wins.them > wins.you
      ? `${themHost} edged you out.`
      : `${themHost} won on score, but lost on categories.`;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="text-center"
    >
      <div className="text-xs uppercase tracking-widest text-ember-400 mb-3 flex items-center justify-center gap-2">
        <Swords className="w-3 h-3" />
        Head-to-head verdict
      </div>
      <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4 leading-[1.1]">
        {verdict}
      </h1>
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass hover:border-ember-500/40 text-sm cursor-pointer transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Try a new match-up
        </button>
      </div>
    </motion.div>
  );
}

// ============================================================================
// THE BIG SCORE SHOWDOWN
// ============================================================================

function ScoreShowdown({ you, them }: { you: AuditResult; them: AuditResult }) {
  const winner = you.score > them.score ? "you" : you.score < them.score ? "them" : "tie";
  return (
    <div className="relative grid md:grid-cols-[1fr_auto_1fr] gap-6 items-stretch">
      <SideCard
        side="you"
        url={you.url}
        score={you.score}
        grade={you.grade}
        vibe={you.vibe}
        isWinner={winner === "you"}
      />
      <div className="hidden md:flex items-center justify-center">
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 16 }}
          className="w-14 h-14 rounded-full bg-zinc-950 border border-ember-500/40 flex items-center justify-center shadow-lg shadow-ember-900/30"
        >
          {winner === "tie" ? (
            <Equal className="w-6 h-6 text-ember-400" />
          ) : (
            <Swords className="w-6 h-6 text-ember-400" />
          )}
        </motion.div>
      </div>
      <SideCard
        side="them"
        url={them.url}
        score={them.score}
        grade={them.grade}
        vibe={them.vibe}
        isWinner={winner === "them"}
      />
    </div>
  );
}

function SideCard({
  side,
  url,
  score,
  grade,
  vibe,
  isWinner,
}: {
  side: Side;
  url: string;
  score: number;
  grade: string;
  vibe: string;
  isWinner: boolean;
}) {
  const ringColor = scoreColor(score);
  const accent = side === "you" ? "ember" : "zinc";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: side === "you" ? 0.1 : 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`relative glass rounded-3xl p-7 md:p-8 transition-all ${
        isWinner ? "ring-1 ring-ember-500/50 shadow-lg shadow-ember-900/20" : ""
      }`}
    >
      {isWinner && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 18 }}
          className="absolute -top-3 left-7 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-br from-ember-500 to-red-600 text-black text-xs font-bold uppercase tracking-widest shadow-lg shadow-ember-900/40"
        >
          <Crown className="w-3 h-3" />
          Winner
        </motion.div>
      )}
      <div
        className={`text-xs uppercase tracking-widest mb-2 ${
          accent === "ember" ? "text-ember-400" : "text-zinc-500"
        }`}
      >
        {side === "you" ? "Your site" : "Competitor"}
      </div>
      <div className="text-xl font-bold text-zinc-100 mb-6 break-all">
        {hostname(url)}
      </div>
      <div className="flex items-center gap-6">
        <div className="relative w-32 h-32 rounded-full flex items-center justify-center shrink-0">
          <AnimatedRing score={score} color={ringColor} />
          <div className="absolute inset-2 rounded-full bg-zinc-950 flex flex-col items-center justify-center">
            <CountUp value={score} color={ringColor} />
            <div className="text-[10px] uppercase tracking-widest text-zinc-500">
              of 100
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-bold mb-2"
            style={{
              background: ringColor + "22",
              color: ringColor,
              border: `1px solid ${ringColor}44`,
            }}
          >
            Grade {grade}
          </div>
          <div className="text-sm text-zinc-300 leading-snug">{vibe}</div>
        </div>
      </div>
    </motion.div>
  );
}

function CountUp({ value, color }: { value: number; color: string }) {
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { duration: 1200, bounce: 0.1 });
  const display = useTransform(spring, (latest) => Math.round(latest).toString());

  useEffect(() => {
    motionVal.set(value);
  }, [value, motionVal]);

  return (
    <motion.span className="text-5xl font-black tabular-nums" style={{ color }}>
      {display}
    </motion.span>
  );
}

function AnimatedRing({ score, color }: { score: number; color: string }) {
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { duration: 1400, bounce: 0 });

  useEffect(() => {
    motionVal.set(score);
  }, [score, motionVal]);

  const background = useTransform(
    spring,
    (latest) => `conic-gradient(${color} ${latest}%, rgba(255,255,255,0.08) 0)`
  );

  return <motion.div className="absolute inset-0 rounded-full" style={{ background }} />;
}

// ============================================================================
// LIGHTHOUSE SHOWDOWN
// ============================================================================

function LighthouseShowdown({ you, them }: { you: AuditResult; them: AuditResult }) {
  if (!you.lighthouse && !them.lighthouse) return null;
  // If only one side has Lighthouse data, show a partial panel + note
  if (!you.lighthouse || !them.lighthouse) {
    const missing = !you.lighthouse ? "your site" : "the competitor";
    return (
      <div className="glass rounded-3xl p-6 text-center">
        <Trophy className="w-5 h-5 text-zinc-500 mx-auto mb-3" />
        <p className="text-sm text-zinc-400">
          Lighthouse data couldn&apos;t be captured for {missing} this run (it&apos;s a
          known limitation when running two scans in parallel locally). The
          overall scores and screenshots below are still accurate.
        </p>
      </div>
    );
  }
  const cats: Array<{ key: keyof NonNullable<AuditResult["lighthouse"]>["scores"]; label: string }> = [
    { key: "performance", label: "Performance" },
    { key: "accessibility", label: "Accessibility" },
    { key: "bestPractices", label: "Best Practices" },
    { key: "seo", label: "SEO" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-zinc-100 mb-6 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-ember-400" />
        Lighthouse, category by category
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cats.map((c, i) => {
          const yScore = you.lighthouse!.scores[c.key];
          const tScore = them.lighthouse!.scores[c.key];
          return (
            <CategoryRow
              key={c.key}
              label={c.label}
              youScore={yScore}
              themScore={tScore}
              delay={0.05 + i * 0.07}
            />
          );
        })}
      </div>
    </div>
  );
}

function CategoryRow({
  label,
  youScore,
  themScore,
  delay,
}: {
  label: string;
  youScore: number | null;
  themScore: number | null;
  delay: number;
}) {
  const winner =
    youScore === null || themScore === null
      ? "tie"
      : youScore > themScore
      ? "you"
      : youScore < themScore
      ? "them"
      : "tie";
  const diff =
    youScore !== null && themScore !== null ? Math.abs(youScore - themScore) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="glass rounded-2xl p-4"
    >
      <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3 text-center">
        {label}
      </div>
      <div className="flex items-end justify-center gap-3 mb-2">
        <ScoreNum value={youScore} isWinner={winner === "you"} side="you" />
        <div className="text-zinc-700 text-sm pb-1">vs</div>
        <ScoreNum value={themScore} isWinner={winner === "them"} side="them" />
      </div>
      <div className="text-[10px] uppercase tracking-widest text-center text-zinc-600">
        {winner === "tie"
          ? "Tied"
          : winner === "you"
          ? `You +${diff}`
          : `Them +${diff}`}
      </div>
    </motion.div>
  );
}

function ScoreNum({
  value,
  isWinner,
  side,
}: {
  value: number | null;
  isWinner: boolean;
  side: Side;
}) {
  if (value === null) {
    return <span className="text-2xl font-bold text-zinc-700 tabular-nums">—</span>;
  }
  const color = scoreColor(value);
  return (
    <div className="relative">
      <span
        className="text-3xl font-black tabular-nums leading-none"
        style={{ color }}
      >
        {value}
      </span>
      {isWinner && (
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 280, damping: 18 }}
          className="absolute -top-1.5 -right-3 w-4 h-4 rounded-full bg-ember-500 flex items-center justify-center"
          title={`Winner: ${side}`}
        >
          <Crown className="w-2.5 h-2.5 text-black" />
        </motion.div>
      )}
    </div>
  );
}

// ============================================================================
// SCREENSHOT SHOWDOWN
// ============================================================================

function ScreenshotShowdown({ you, them }: { you: AuditResult; them: AuditResult }) {
  const youShot = you.screenshots?.desktop;
  const themShot = them.screenshots?.desktop;
  if (!youShot && !themShot) return null;

  return (
    <div>
      <h2 className="text-2xl font-bold text-zinc-100 mb-6">
        First impression, side by side
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        <SideShot label="You" url={you.url} screenshot={youShot} side="you" />
        <SideShot label="Competitor" url={them.url} screenshot={themShot} side="them" />
      </div>
    </div>
  );
}

function SideShot({
  label,
  url,
  screenshot,
  side,
}: {
  label: string;
  url: string;
  screenshot: string | undefined;
  side: Side;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: side === "you" ? 0.1 : 0.2, duration: 0.45 }}
      className="glass rounded-2xl p-3"
    >
      <div className="flex items-center justify-between mb-2 px-1">
        <span
          className={`text-[10px] uppercase tracking-widest font-semibold ${
            side === "you" ? "text-ember-400" : "text-zinc-500"
          }`}
        >
          {label}
        </span>
        <span className="text-[10px] text-zinc-600 font-mono">{hostname(url)}</span>
      </div>
      {screenshot ? (
        <div className="rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 aspect-[16/10]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`data:image/jpeg;base64,${screenshot}`}
            alt={`${label} screenshot`}
            className="w-full h-full object-cover object-top"
          />
        </div>
      ) : (
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 aspect-[16/10] flex items-center justify-center text-zinc-600 text-sm">
          (no screenshot)
        </div>
      )}
    </motion.div>
  );
}

// ============================================================================
// CATEGORY GRID — broader head to head with non-Lighthouse fields
// ============================================================================

function CategoryGrid({ you, them }: { you: AuditResult; them: AuditResult }) {
  const rows: Array<{ label: string; you: string; them: string; winner: Side | "tie" }> = [
    {
      label: "Load time",
      you: `${you.loadMs}ms`,
      them: `${them.loadMs}ms`,
      winner: you.loadMs < them.loadMs ? "you" : you.loadMs > them.loadMs ? "them" : "tie",
    },
    {
      label: "Page weight",
      you: `${(you.bytes / 1024).toFixed(0)} KB`,
      them: `${(them.bytes / 1024).toFixed(0)} KB`,
      winner: you.bytes < them.bytes ? "you" : you.bytes > them.bytes ? "them" : "tie",
    },
    {
      label: "Words on page",
      you: you.meta.wordCount.toLocaleString(),
      them: them.meta.wordCount.toLocaleString(),
      winner:
        you.meta.wordCount > them.meta.wordCount
          ? "you"
          : you.meta.wordCount < them.meta.wordCount
          ? "them"
          : "tie",
    },
    {
      label: "Domain age",
      you: you.domain?.ageYears !== null && you.domain?.ageYears !== undefined ? `${you.domain.ageYears}y` : "—",
      them:
        them.domain?.ageYears !== null && them.domain?.ageYears !== undefined ? `${them.domain.ageYears}y` : "—",
      winner: pickAgeWinner(you, them),
    },
    {
      label: "Security headers",
      you: you.security?.grade || "—",
      them: them.security?.grade || "—",
      winner: pickGradeWinner(you.security?.grade, them.security?.grade),
    },
    {
      label: "WCAG violations",
      you: String(you.screenshots?.axe?.violations.length ?? "—"),
      them: String(them.screenshots?.axe?.violations.length ?? "—"),
      winner: pickLowerWinner(
        you.screenshots?.axe?.violations.length,
        them.screenshots?.axe?.violations.length
      ),
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-zinc-100 mb-6">
        Everything else, head to head
      </h2>
      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
                Metric
              </th>
              <th className="text-right px-5 py-3 text-[10px] uppercase tracking-widest text-ember-400 font-medium">
                You
              </th>
              <th className="text-right px-5 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
                Competitor
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <motion.tr
                key={r.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.05 + i * 0.04 }}
                className={i % 2 === 0 ? "bg-zinc-950/40" : ""}
              >
                <td className="px-5 py-3 text-zinc-400">{r.label}</td>
                <td
                  className={`px-5 py-3 text-right tabular-nums font-medium ${
                    r.winner === "you" ? "text-emerald-400" : "text-zinc-200"
                  }`}
                >
                  {r.winner === "you" && <Crown className="w-3 h-3 inline mr-1.5 text-ember-400" />}
                  {r.you}
                </td>
                <td
                  className={`px-5 py-3 text-right tabular-nums font-medium ${
                    r.winner === "them" ? "text-emerald-400" : "text-zinc-200"
                  }`}
                >
                  {r.winner === "them" && <Crown className="w-3 h-3 inline mr-1.5 text-ember-400" />}
                  {r.them}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// SHARE COMPARE
// ============================================================================

function ShareCompare({
  you,
  them,
  wins,
}: {
  you: AuditResult;
  them: AuditResult;
  wins: { you: number; them: number; tied: number };
}) {
  const [copied, setCopied] = useState(false);
  const youHost = hostname(you.url);
  const themHost = hostname(them.url);
  const winnerSays =
    you.score > them.score
      ? `I beat ${themHost} on RoastMySite: ${you.score} vs ${them.score}.`
      : you.score < them.score
      ? `${themHost} just beat me on RoastMySite: ${them.score} vs ${you.score}. Time to fix some things.`
      : `${youHost} vs ${themHost} — dead heat on RoastMySite (${you.score} all).`;

  const tweet = `${winnerSays} Try yours →`;
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`;

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(
        `${winnerSays} ${typeof window !== "undefined" ? window.location.origin + "/compare" : ""}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }, [winnerSays]);

  return (
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-ember-600 via-red-600 to-rose-700 p-[1px]">
      <div className="rounded-3xl bg-zinc-950 p-6 md:p-8">
        <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Share2 className="w-4 h-4 text-ember-400" />
              <span className="text-xs uppercase tracking-widest text-ember-400 font-semibold">
                Brag (or fix)
              </span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-zinc-100 mb-1.5">
              {winnerSays}
            </h3>
            <p className="text-sm text-zinc-500">
              Lighthouse categories won: <span className="text-emerald-400 font-semibold">{wins.you}</span> for you ·{" "}
              <span className="text-zinc-300 font-semibold">{wins.them}</span> for {themHost} ·{" "}
              <span className="text-zinc-500">{wins.tied} tied</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-ember-500/40 text-sm text-zinc-200 cursor-pointer transition-colors"
            >
              <Twitter className="w-4 h-4" />
              Post on X
            </a>
            <button
              onClick={copy}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white text-black font-semibold text-sm cursor-pointer hover:bg-zinc-100 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// helpers
// ============================================================================

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function scoreColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 65) return "#84cc16";
  if (score >= 50) return "#eab308";
  if (score >= 35) return "#f97316";
  return "#ef4444";
}

function countWins(you: AuditResult, them: AuditResult) {
  let yWins = 0;
  let tWins = 0;
  let tied = 0;
  const cats: Array<keyof NonNullable<AuditResult["lighthouse"]>["scores"]> = [
    "performance",
    "accessibility",
    "bestPractices",
    "seo",
  ];
  if (you.lighthouse && them.lighthouse) {
    for (const k of cats) {
      const y = you.lighthouse.scores[k];
      const t = them.lighthouse.scores[k];
      if (y === null || t === null) continue;
      if (y > t) yWins++;
      else if (y < t) tWins++;
      else tied++;
    }
  }
  return { you: yWins, them: tWins, tied };
}

function pickAgeWinner(you: AuditResult, them: AuditResult): Side | "tie" {
  const a = you.domain?.ageYears;
  const b = them.domain?.ageYears;
  if (a === null || a === undefined || b === null || b === undefined) return "tie";
  // Older domain is generally a "win" for trust/SEO
  return a > b ? "you" : a < b ? "them" : "tie";
}

function pickGradeWinner(a: string | null | undefined, b: string | null | undefined): Side | "tie" {
  if (!a || !b) return "tie";
  const rank = (g: string) => {
    const m = g.toUpperCase().match(/^([A-F])([+-]?)/);
    if (!m) return -1;
    const base = "FEDCBA".indexOf(m[1]); // F=0, A=5
    const mod = m[2] === "+" ? 0.3 : m[2] === "-" ? -0.3 : 0;
    return base + mod;
  };
  const ra = rank(a);
  const rb = rank(b);
  if (ra === rb) return "tie";
  return ra > rb ? "you" : "them";
}

function pickLowerWinner(
  a: number | undefined,
  b: number | undefined
): Side | "tie" {
  if (a === undefined || b === undefined) return "tie";
  if (a === b) return "tie";
  return a < b ? "you" : "them";
}
