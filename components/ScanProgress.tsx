"use client";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const STEPS = [
  "Resolving DNS and contacting server…",
  "Fetching homepage HTML…",
  "Launching headless browser to render the page…",
  "Capturing desktop screenshot at 1280×800…",
  "Capturing mobile screenshot at 390×844…",
  "Parsing markup, meta tags, contact paths…",
  "Checking SSL, mobile, SEO, schema, analytics…",
  "Weighing the damage…",
];

export function ScanProgress({ url }: { url: string }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, 320);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="pt-20 max-w-2xl mx-auto">
      <div className="relative glass rounded-3xl p-10 overflow-hidden">
        <div className="absolute inset-x-0 h-32 scanline animate-scan pointer-events-none" />

        <div className="flex items-center gap-3 mb-8 relative z-10">
          <Loader2 className="w-5 h-5 text-ember-400 animate-spin" />
          <span className="text-sm uppercase tracking-widest text-zinc-400 flicker">
            Auditing in progress
          </span>
        </div>

        <div className="text-xl md:text-2xl font-semibold mb-2 relative z-10 break-all">
          {url}
        </div>
        <div className="text-zinc-500 text-sm mb-10 relative z-10">
          Reading the site like a stranger would.
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
