"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import type { AuditResult } from "@/lib/audit";
import {
  estimateCarbon,
  buildActionChecklist,
  type ActionItem,
} from "@/lib/extras-derived";
import {
  Leaf,
  ListChecks,
  Smartphone,
  Copy,
  Check,
  Bookmark,
  ArrowRight,
  Weight,
} from "lucide-react";
import { BRAND } from "@/lib/brand";

const EASE = [0.22, 1, 0.36, 1] as const;

export function ExtrasSection({ result }: { result: AuditResult }) {
  return (
    <div className="space-y-10">
      <ActionChecklistCard result={result} />
      <div className="grid md:grid-cols-2 gap-4">
        <CarbonCard result={result} />
        <MobileQrCard result={result} />
      </div>
    </div>
  );
}

// ============================================================================
// ACTION CHECKLIST — the "do these 5 things this week" takeaway
// ============================================================================

function ActionChecklistCard({ result }: { result: AuditResult }) {
  const items = buildActionChecklist(result, 5);
  if (items.length === 0) return null;

  return (
    <div>
      <div className="flex items-baseline justify-between flex-wrap gap-3 mb-6">
        <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
          <ListChecks className="w-5 h-5 text-ember-400" />
          Your action plan — top 5 this week
        </h2>
        <span className="text-xs text-zinc-500">
          Ranked by impact-to-effort. Do them in order.
        </span>
      </div>

      <div className="space-y-3">
        {items.map((item, i) => (
          <ActionRow key={item.id} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}

function ActionRow({ item, index }: { item: ActionItem; index: number }) {
  const impactColor =
    item.impact === "high"
      ? "text-red-400 border-red-500/30 bg-red-500/10"
      : item.impact === "medium"
      ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
      : "text-zinc-400 border-zinc-700 bg-zinc-800/40";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4, ease: EASE, delay: index * 0.06 }}
      whileHover={{ x: 4 }}
      className="glass rounded-2xl p-5 grid grid-cols-[auto_1fr_auto] gap-4 items-start"
    >
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ember-500 to-red-600 text-black font-black text-lg flex items-center justify-center shrink-0">
        {item.rank}
      </div>
      <div className="min-w-0">
        <div className="font-semibold text-zinc-100 mb-1">{item.title}</div>
        <div className="text-sm text-zinc-400 leading-relaxed mb-2">
          {item.why}
        </div>
        {item.tool && (
          <div className="text-xs text-zinc-500">
            <span className="text-ember-400">Tool:</span> {item.tool}
          </div>
        )}
      </div>
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <span
          className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border ${impactColor} whitespace-nowrap`}
        >
          {item.impact} impact
        </span>
        <span className="text-[10px] text-zinc-500 whitespace-nowrap">
          ~{item.effort}
        </span>
      </div>
    </motion.div>
  );
}

// ============================================================================
// CARBON ESTIMATE
// ============================================================================

function CarbonCard({ result }: { result: AuditResult }) {
  const carbon = estimateCarbon(result);
  // Total estimated page weight in MB (derived from the same htmlBytes * 8 heuristic)
  const totalMB = +((result.bytes * 8) / (1024 * 1024)).toFixed(2);
  const rankingColor =
    carbon.ranking === "exceptional"
      ? "#22c55e"
      : carbon.ranking === "good"
      ? "#84cc16"
      : carbon.ranking === "average"
      ? "#eab308"
      : carbon.ranking === "poor"
      ? "#f97316"
      : "#ef4444";

  const weightVerdict =
    carbon.ranking === "exceptional" || carbon.ranking === "good"
      ? "Light. Mobile users won't notice."
      : carbon.ranking === "average"
      ? "Middle of the pack. Cleanup gets you a faster LCP."
      : carbon.ranking === "poor"
      ? "Heavy. Hurting mobile conversion."
      : "Bloated. Compressing images + lazy-loading scripts usually halves this.";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: EASE }}
      whileHover={{ y: -3 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 mb-3 text-zinc-500">
        <Weight className="w-4 h-4" />
        <span className="text-xs uppercase tracking-widest">Page weight</span>
      </div>
      <div className="text-3xl font-black tabular-nums" style={{ color: rankingColor }}>
        {totalMB}
        <span className="text-sm text-zinc-500 font-normal ml-2">MB per load</span>
      </div>
      <div
        className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] uppercase tracking-widest font-semibold"
        style={{
          background: rankingColor + "22",
          color: rankingColor,
          border: `1px solid ${rankingColor}55`,
        }}
      >
        {carbon.ranking}
      </div>
      <p className="text-sm text-zinc-400 mt-3 leading-relaxed">
        {weightVerdict}
      </p>
      <p className="text-xs text-zinc-600 mt-3 flex items-center gap-1.5">
        <Leaf className="w-3 h-3" />
        <span>~{carbon.gramsPerVisit}g CO₂ per visit · {carbon.annualKgAt10kVisits} kg/yr at 10k visits/mo</span>
      </p>
    </motion.div>
  );
}

// ============================================================================
// MOBILE QR CODE
// ============================================================================

function MobileQrCard({ result }: { result: AuditResult }) {
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/?url=${encodeURIComponent(result.url)}`
      : `${BRAND.prodOrigin}/?url=${encodeURIComponent(result.url)}`;

  const qrUrl = `/api/qr?data=${encodeURIComponent(shareUrl)}&size=180&dark=1`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: EASE, delay: 0.05 }}
      whileHover={{ y: -3 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 mb-3 text-zinc-500">
        <Smartphone className="w-4 h-4" />
        <span className="text-xs uppercase tracking-widest">
          View this audit on your phone
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-32 h-32 rounded-lg bg-white p-2 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrUrl} alt="QR code linking to this audit" className="w-full h-full" />
        </div>
        <div className="text-sm text-zinc-400 leading-relaxed min-w-0">
          Scan with your phone camera. Re-runs the audit on mobile so you can
          see what your visitors see on their device.
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// BOOKMARKLET — landing-page section (separate component, exported)
// ============================================================================

export function BookmarkletSection({ origin }: { origin?: string }) {
  const o = origin || BRAND.prodOrigin;
  const bookmarklet = `javascript:window.location.href='${o}/?url='+encodeURIComponent(window.location.href);void 0;`;
  const [copied, setCopied] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="mt-24 relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-600/30 via-orange-600/20 to-ember-600/30 p-[1px]"
    >
      <div className="rounded-3xl bg-zinc-950 p-8 md:p-10">
        <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Bookmark className="w-4 h-4 text-ember-400" />
              <span className="text-xs uppercase tracking-widest text-ember-400 font-semibold">
                Pro tip
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-2 text-zinc-100">
              Drag this to your bookmarks bar.
            </h3>
            <p className="text-zinc-400 leading-relaxed max-w-xl">
              Click it on ANY site you visit and it runs the audit instantly.
              Agencies, designers, and competitive analysis nerds use this
              daily. No login required.
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-2">
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages, jsx-a11y/anchor-is-valid */}
            <a
              href={bookmarklet}
              draggable
              onClick={(e) => {
                e.preventDefault();
                alert(
                  "Drag this button into your bookmarks bar — don't click it. Then click the bookmark from any site."
                );
              }}
              className="inline-flex items-center gap-2 px-5 py-4 rounded-xl bg-gradient-to-br from-ember-500 to-red-600 hover:from-ember-400 hover:to-red-500 text-black font-bold whitespace-nowrap cursor-grab active:cursor-grabbing select-none shadow-lg shadow-ember-900/40"
            >
              <Bookmark className="w-4 h-4" />
              Roast This Site
              <ArrowRight className="w-4 h-4" />
            </a>
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(bookmarklet);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1800);
                } catch {
                  // ignore
                }
              }}
              className="text-xs text-zinc-500 hover:text-ember-300 transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  JavaScript copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  Or copy the JavaScript
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
