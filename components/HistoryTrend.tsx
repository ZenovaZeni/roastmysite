"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getHistoryForUrl, type LocalScanEntry } from "@/lib/local-history";
import { TrendingUp, TrendingDown, Minus, Clock } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Shows a sparkline of past scores for THIS URL — only renders when there
 * are 2+ prior scans (so first-time scans see nothing). Pure localStorage,
 * no server.
 */
export function HistoryTrend({ url, currentScore }: { url: string; currentScore: number }) {
  const [history, setHistory] = useState<LocalScanEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Run AFTER recordScan() so the current scan is already in the list.
    // Tiny delay to allow the parent's recordScan effect to write first.
    const t = setTimeout(() => {
      setHistory(getHistoryForUrl(url));
      setHydrated(true);
    }, 100);
    return () => clearTimeout(t);
  }, [url]);

  if (!hydrated) return null;
  // Need at least 2 entries to show a trend
  if (history.length < 2) return null;

  // Newest first → oldest first for the chart
  const chronological = [...history].reverse();
  const scores = chronological.map((e) => e.score);
  const previous = history[1]; // second-newest = the previous scan
  const delta = currentScore - previous.score;
  const deltaAbs = Math.abs(delta);
  const deltaSign = delta > 0 ? "+" : delta < 0 ? "−" : "";

  const timeSince = (() => {
    const ms = Date.now() - new Date(previous.scannedAt).getTime();
    const minutes = Math.floor(ms / 60_000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "yesterday";
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  })();

  const deltaColor =
    delta > 0 ? "#22c55e" : delta < 0 ? "#ef4444" : "#a1a1aa";
  const deltaIcon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const DeltaIcon = deltaIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE, delay: 0.2 }}
      className="glass rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-center gap-4 mb-4"
    >
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-ember-500/10 border border-ember-500/30 flex items-center justify-center">
          <Clock className="w-5 h-5 text-ember-400" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-zinc-500">
            Your trend
          </div>
          <div className="text-sm text-zinc-300">
            {history.length} scan{history.length !== 1 ? "s" : ""} of this URL
          </div>
        </div>
      </div>

      {/* Sparkline */}
      <div className="flex-1 w-full min-w-0">
        <Sparkline scores={scores} />
      </div>

      {/* Delta */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5">
          <DeltaIcon className="w-4 h-4" style={{ color: deltaColor }} />
          <div
            className="text-2xl font-black tabular-nums leading-none"
            style={{ color: deltaColor }}
          >
            {deltaSign}
            {deltaAbs}
          </div>
        </div>
        <div className="text-[10px] text-zinc-500 leading-tight">
          vs<br />
          {timeSince}
        </div>
      </div>
    </motion.div>
  );
}

function Sparkline({ scores }: { scores: number[] }) {
  const width = 280;
  const height = 50;
  const padding = 6;
  const w = width - padding * 2;
  const h = height - padding * 2;

  if (scores.length < 2) return null;

  // Always anchor 0–100 so the visual makes sense across runs
  const min = 0;
  const max = 100;
  const range = max - min;

  const points = scores.map((s, i) => {
    const x = padding + (i / (scores.length - 1)) * w;
    const y = padding + h - ((s - min) / range) * h;
    return { x, y };
  });

  const pathD = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding + h} L ${
    points[0].x
  } ${padding + h} Z`;

  const lastY = points[points.length - 1].y;
  const lastScore = scores[scores.length - 1];
  const lastColor =
    lastScore >= 80
      ? "#22c55e"
      : lastScore >= 65
      ? "#84cc16"
      : lastScore >= 50
      ? "#eab308"
      : lastScore >= 35
      ? "#f97316"
      : "#ef4444";

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="overflow-visible"
    >
      <defs>
        <linearGradient id="spark-area" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={lastColor} stopOpacity="0.35" />
          <stop offset="100%" stopColor={lastColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Area under the curve */}
      <path d={areaD} fill="url(#spark-area)" />
      {/* The line */}
      <path
        d={pathD}
        fill="none"
        stroke={lastColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Dots */}
      {points.map((p, i) => {
        const isLast = i === points.length - 1;
        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={isLast ? 4 : 2.5}
            fill={isLast ? lastColor : "#3F3F46"}
            stroke={isLast ? "#0A0908" : "none"}
            strokeWidth={isLast ? 2 : 0}
          />
        );
      })}
      {/* Latest score label */}
      <text
        x={points[points.length - 1].x}
        y={lastY - 10}
        fill={lastColor}
        fontSize="11"
        fontWeight="700"
        textAnchor="end"
        fontFamily="ui-monospace, monospace"
      >
        {lastScore}
      </text>
    </svg>
  );
}
