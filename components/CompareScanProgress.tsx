"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Swords } from "lucide-react";

const STEPS = [
  "Resolving both DNS records…",
  "Fetching both homepages in parallel…",
  "Launching headless browsers…",
  "Capturing screenshots side-by-side…",
  "Running Lighthouse on both…",
  "Scoring axe-core WCAG…",
  "Calculating the head-to-head…",
];

export function CompareScanProgress({
  youUrl,
  themUrl,
}: {
  youUrl: string;
  themUrl: string;
}) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, 4200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="pt-20 max-w-3xl mx-auto">
      <div className="relative glass rounded-3xl p-10 overflow-hidden">
        <div className="absolute inset-x-0 h-32 scanline animate-scan pointer-events-none" />

        <div className="flex items-center gap-3 mb-8 relative z-10">
          <Loader2 className="w-5 h-5 text-ember-400 animate-spin" />
          <span className="text-sm uppercase tracking-widest text-zinc-400 flicker">
            Comparing in progress
          </span>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center mb-8 relative z-10">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest text-ember-400 mb-1">
              You
            </div>
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-base md:text-lg font-semibold break-all"
            >
              {prettyHost(youUrl)}
            </motion.div>
          </div>
          <motion.div
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-ember-500/20 to-red-600/20 border border-ember-500/40 flex items-center justify-center"
          >
            <Swords className="w-5 h-5 text-ember-400" />
          </motion.div>
          <div className="text-left">
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
              Competitor
            </div>
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              className="text-base md:text-lg font-semibold break-all"
            >
              {prettyHost(themUrl)}
            </motion.div>
          </div>
        </div>

        <ul className="space-y-3 relative z-10">
          {STEPS.map((s, i) => (
            <li
              key={i}
              className={`flex items-center gap-3 transition-all duration-300 ${
                i < step
                  ? "text-zinc-500"
                  : i === step
                  ? "text-ember-300"
                  : "text-zinc-700"
              }`}
            >
              <span className="font-mono text-xs w-6 shrink-0">
                {i < step ? "✓" : i === step ? "›" : "·"}
              </span>
              <span className="text-sm">{s}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function prettyHost(url: string): string {
  try {
    const u = url.startsWith("http") ? url : "https://" + url;
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
