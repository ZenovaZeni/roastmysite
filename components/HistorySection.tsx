"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  getUniqueHistory,
  clearHistory,
  removeFromHistory,
  type LocalScanEntry,
} from "@/lib/local-history";
import { Clock, X, Trash2, RotateCcw } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

export function HistorySection({
  onPick,
}: {
  onPick: (url: string) => void;
}) {
  const [history, setHistory] = useState<LocalScanEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHistory(getUniqueHistory());
    setHydrated(true);
  }, []);

  if (!hydrated || history.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="mt-24"
    >
      <div className="flex items-baseline justify-between mb-5">
        <div>
          <div className="text-xs uppercase tracking-widest text-ember-400 mb-1 flex items-center gap-2">
            <Clock className="w-3 h-3" />
            Your recent audits
          </div>
          <h2 className="text-xl font-bold text-zinc-100">
            {history.length} site{history.length !== 1 ? "s" : ""} you&apos;ve roasted
          </h2>
        </div>
        <button
          onClick={() => {
            if (confirm("Clear all local history?")) {
              clearHistory();
              setHistory([]);
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-red-500/40 text-xs text-zinc-500 hover:text-red-300 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3 h-3" />
          Clear
        </button>
      </div>
      <p className="text-xs text-zinc-600 mb-4">
        Saved only in your browser. Clear cookies = clean slate. No server.
      </p>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
        {history.slice(0, 9).map((entry, i) => (
          <HistoryCard
            key={entry.url + entry.scannedAt}
            entry={entry}
            index={i}
            onPick={() => onPick(entry.url)}
            onRemove={() => {
              removeFromHistory(entry.url);
              setHistory(getUniqueHistory());
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

function HistoryCard({
  entry,
  index,
  onPick,
  onRemove,
}: {
  entry: LocalScanEntry;
  index: number;
  onPick: () => void;
  onRemove: () => void;
}) {
  const color =
    entry.score >= 80
      ? "#22c55e"
      : entry.score >= 65
      ? "#84cc16"
      : entry.score >= 50
      ? "#eab308"
      : entry.score >= 35
      ? "#f97316"
      : "#ef4444";

  const when = (() => {
    const ms = Date.now() - new Date(entry.scannedAt).getTime();
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4, ease: EASE }}
      whileHover={{ y: -2 }}
      className="glass rounded-2xl p-4 flex items-center gap-3 group relative"
    >
      <button
        onClick={onPick}
        className="flex-1 flex items-center gap-3 min-w-0 text-left cursor-pointer"
        title="Re-scan this site"
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center font-black tabular-nums text-base shrink-0 border"
          style={{
            background: color + "22",
            color,
            borderColor: color + "55",
          }}
        >
          {entry.score}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-zinc-100 truncate">
            {entry.hostname}
          </div>
          <div className="text-xs text-zinc-500 flex items-center gap-2">
            <span>Grade {entry.grade}</span>
            <span className="text-zinc-700">·</span>
            <span>{when}</span>
          </div>
        </div>
        <RotateCcw className="w-3.5 h-3.5 text-zinc-600 group-hover:text-ember-400 transition-colors shrink-0" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-zinc-900/0 group-hover:bg-zinc-800/80 text-zinc-600 hover:text-red-400 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
        title="Remove from history"
      >
        <X className="w-3 h-3" />
      </button>
    </motion.div>
  );
}
