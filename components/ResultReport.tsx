"use client";
import { useCallback, useEffect, useState } from "react";
import type { AuditResult, Check } from "@/lib/audit";
import {
  Check as CheckIcon,
  AlertTriangle,
  X,
  Sparkles,
  RotateCcw,
  Monitor,
  Smartphone,
  Eye,
  Download,
  Loader2,
  Clock,
  Shield,
  Cpu,
  Gauge,
  Maximize2,
  CalendarDays,
  Zap,
  FileText,
  Swords,
  ArrowRight,
  Link2,
  Copy,
} from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { AffiliateCTAs } from "./AffiliateCTAs";
import { SocialPreviewSection } from "./SocialPreview";
import { PagesSection } from "./PagesSection";
import { BadgeSection } from "./BadgeSection";
import { ExtrasSection } from "./ExtrasSection";
import { OnlinePresenceSection } from "./OnlinePresenceSection";
import { HistoryTrend } from "./HistoryTrend";
import { SITE_TYPE_LABEL } from "@/lib/site-type";
import { bumpDailyCounter, recordScan } from "@/lib/local-history";

function roasterSourceLabel(source: string, fallbackTone: string): string {
  switch (source) {
    case "groq":
      return "Hot take · fresh roast";
    case "gemini":
      return "Hot take · fresh roast";
    case "local-gemma":
      return "Slow-roasted at home · local mode";
    case "template-fallback":
      if (fallbackTone === "missing-provider-config") {
        return "Data-only roast · provider not configured";
      }
      if (fallbackTone === "provider-failed") {
        return "Data-only roast · provider unavailable";
      }
      return "Roaster's drained — data view only";
    default:
      return "Roasting…";
  }
}

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function ResultReport({
  result,
  onReset,
}: {
  result: AuditResult;
  onReset: () => void;
}) {
  const [roastText, setRoastText] = useState("");
  const [roastDone, setRoastDone] = useState(false);

  // Record this scan to localStorage once we have a result — for the user's
  // browser-local history. No server-side persistence; clear cookies = clean slate.
  useEffect(() => {
    let hostname = result.url;
    try {
      hostname = new URL(result.url).hostname.replace(/^www\./, "");
    } catch {
      // fall through
    }
    recordScan({
      url: result.url,
      hostname,
      score: result.score,
      grade: result.grade,
    });
  }, [result.url, result.score, result.grade]);

  return (
    <div className="pt-10 md:pt-12 space-y-12 max-w-5xl mx-auto">
      <Header
        result={result}
        onReset={onReset}
        roastText={roastText}
        roastReady={roastDone}
      />
      <Section delay={0.05}>
        <ScoreSection result={result} />
      </Section>
      <Section delay={0.07}>
        <HistoryTrend url={result.url} currentScore={result.score} />
      </Section>
      {result.lighthouse && (
        <Section delay={0.1}>
          <LighthouseSection result={result} />
        </Section>
      )}
      <Section delay={0.15}>
        <ScreenshotSection result={result} />
      </Section>
      <Section delay={0.2}>
        <RoastSection
          result={result}
          setParentText={setRoastText}
          setParentDone={setRoastDone}
        />
      </Section>
      <Section delay={0.25}>
        <FactsRow result={result} />
      </Section>
      {result.pages && result.pages.length > 0 && (
        <Section delay={0.27}>
          <PagesSection result={result} />
        </Section>
      )}
      {result.onlinePresence && (
        <Section delay={0.275}>
          <OnlinePresenceSection result={result} />
        </Section>
      )}
      {result.social && (
        <Section delay={0.28}>
          <SocialPreviewSection result={result} />
        </Section>
      )}
      <Section delay={0.29}>
        <ExtrasSection result={result} />
      </Section>
      <Section delay={0.3}>
        <ChecksSection checks={result.checks} />
      </Section>
      <Section delay={0.35}>
        <MetaSection result={result} />
      </Section>
      <Section delay={0.37}>
        <CompareCTA result={result} />
      </Section>
      <Section delay={0.38}>
        <BadgeSection result={result} />
      </Section>
      <Section delay={0.4}>
        <AffiliateCTAs result={result} />
      </Section>
    </div>
  );
}

function Section({ delay, children }: { delay: number; children: React.ReactNode }) {
  return (
    <motion.div
      variants={sectionVariants}
      initial="hidden"
      animate="show"
      custom={delay}
    >
      {children}
    </motion.div>
  );
}

function Header({
  result,
  onReset,
  roastText,
  roastReady,
}: {
  result: AuditResult;
  onReset: () => void;
  roastText: string;
  roastReady: boolean;
}) {
  const [generating, setGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const hostname = new URL(result.url).hostname;

  const generatePdf = useCallback(async (): Promise<string | null> => {
    if (pdfUrl) return pdfUrl;
    setGenerating(true);
    try {
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audit: result, roast: roastText }),
      });
      if (!res.ok) throw new Error("PDF failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      return url;
    } catch (e) {
      alert("PDF generation failed. Try again.");
      return null;
    } finally {
      setGenerating(false);
    }
  }, [pdfUrl, result, roastText]);

  const handlePreview = useCallback(async () => {
    const url = await generatePdf();
    if (url) setPreviewOpen(true);
  }, [generatePdf]);

  const handleDownload = useCallback(async () => {
    const url = await generatePdf();
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `roastmysite-${hostname}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [generatePdf, hostname]);

  // Invalidate cached PDF when the roast text grows (don't preview a partial doc)
  useEffect(() => {
    if (pdfUrl && !roastReady) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roastReady]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <div className="text-xs uppercase tracking-widest text-ember-400 mb-2 flex items-center gap-2">
            <span>Audit complete · {new Date(result.fetchedAt).toLocaleString()}</span>
            {result.siteType && result.siteType.type !== "unknown" && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-400 normal-case tracking-normal"
                title={result.siteType.signals.join(" · ")}
              >
                {SITE_TYPE_LABEL[result.siteType.type]}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight break-all">
            {hostname}
          </h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <motion.button
            onClick={handlePreview}
            disabled={!roastReady || generating}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass hover:border-ember-500/40 text-sm cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-zinc-200"
            title={!roastReady ? "Waiting for the roast to finish…" : "Preview the PDF before downloading"}
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            {generating ? "Building…" : "Preview PDF"}
          </motion.button>
          <motion.button
            onClick={handleDownload}
            disabled={!roastReady || generating}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-br from-ember-500 to-red-600 hover:from-ember-400 hover:to-red-500 text-black text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-ember-900/30 cursor-pointer"
            title={!roastReady ? "Waiting for the roast to finish…" : "Download a PDF report"}
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {generating ? "Building…" : "Download PDF"}
          </motion.button>
          <ShareScanButton url={result.url} hostname={hostname} score={result.score} grade={result.grade} />
          <RescanButton url={result.url} />
          <motion.button
            onClick={onReset}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass hover:border-ember-500/40 text-sm cursor-pointer transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Audit another
          </motion.button>
        </div>
      </motion.div>

      {previewOpen && pdfUrl && (
        <PdfPreviewModal
          url={pdfUrl}
          hostname={hostname}
          onClose={() => setPreviewOpen(false)}
          onDownload={handleDownload}
        />
      )}
    </>
  );
}

function RescanButton({ url }: { url: string }) {
  return (
    <motion.a
      href={`/?url=${encodeURIComponent(url)}&rescan=1`}
      whileTap={{ scale: 0.97 }}
      title="Did you just fix something? Run the audit again."
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass hover:border-ember-500/40 text-sm cursor-pointer transition-colors text-zinc-200"
    >
      <Zap className="w-4 h-4" />
      Re-scan
    </motion.a>
  );
}

function ShareScanButton({
  url,
  hostname,
  score,
  grade,
}: {
  url: string;
  hostname: string;
  score: number;
  grade: string;
}) {
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/?url=${encodeURIComponent(url)}&score=${score}&grade=${grade}`
      : "";

  const copy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  const nativeShare = async () => {
    if (!shareUrl) return;
    const text = `${hostname} scored ${score}/100 (${grade}) on RoastMySite.`;
    if (typeof navigator !== "undefined" && (navigator as Navigator & { share?: (data: ShareData) => Promise<void> }).share) {
      try {
        await (navigator as Navigator & { share: (data: ShareData) => Promise<void> }).share({
          title: "RoastMySite audit",
          text,
          url: shareUrl,
        });
        return;
      } catch {
        // fall through to copy
      }
    }
    copy();
  };

  return (
    <motion.button
      onClick={nativeShare}
      whileTap={{ scale: 0.97 }}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass hover:border-ember-500/40 text-sm cursor-pointer transition-colors text-zinc-200"
      title={copied ? "Copied" : "Share — link re-scans on open"}
    >
      {copied ? (
        <>
          <Copy className="w-4 h-4 text-emerald-400" />
          Copied
        </>
      ) : (
        <>
          <Link2 className="w-4 h-4" />
          Share
        </>
      )}
    </motion.button>
  );
}

function PdfPreviewModal({
  url,
  hostname,
  onClose,
  onDownload,
}: {
  url: string;
  hostname: string;
  onClose: () => void;
  onDownload: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, y: 12, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl h-[90vh] flex flex-col rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-2xl"
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 bg-zinc-900/50">
          <div>
            <div className="text-xs uppercase tracking-widest text-ember-400">
              PDF preview
            </div>
            <div className="text-sm text-zinc-200 font-medium">
              roastmysite-{hostname}.pdf
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              onClick={onDownload}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-br from-ember-500 to-red-600 text-black text-sm font-semibold cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download
            </motion.button>
            <motion.button
              onClick={onClose}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-800 hover:border-zinc-700 text-sm text-zinc-300 cursor-pointer"
            >
              <X className="w-4 h-4" />
              Close
            </motion.button>
          </div>
        </div>
        <div className="flex-1 bg-zinc-900">
          <iframe
            src={url}
            title="PDF preview"
            className="w-full h-full"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

function AnimatedNumber({ value, color }: { value: number; color: string }) {
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { duration: 1200, bounce: 0.1 });
  const display = useTransform(spring, (latest) => Math.round(latest).toString());

  useEffect(() => {
    motionVal.set(value);
  }, [value, motionVal]);

  return (
    <motion.span className="text-6xl font-black tabular-nums" style={{ color }}>
      {display}
    </motion.span>
  );
}

function ScoreSection({ result }: { result: AuditResult }) {
  const ringColor =
    result.score >= 90
      ? "#22c55e"
      : result.score >= 75
      ? "#84cc16"
      : result.score >= 60
      ? "#eab308"
      : result.score >= 45
      ? "#f97316"
      : "#ef4444";

  return (
    <div className="glass rounded-3xl p-8 md:p-10 grid md:grid-cols-[auto_1fr] gap-8 items-center">
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0, rotate: -45 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="relative w-44 h-44 rounded-full flex items-center justify-center"
          style={
            {
              background: `conic-gradient(${ringColor} 0%, rgba(255,255,255,0.08) 0%)`,
              animation: "ringFill 1.4s ease-out forwards",
              "--final-angle": `${result.score}%`,
            } as React.CSSProperties
          }
        >
          <RingFill score={result.score} color={ringColor} />
          <div className="absolute inset-3 rounded-full bg-zinc-950 flex flex-col items-center justify-center">
            <AnimatedNumber value={result.score} color={ringColor} />
            <div className="text-xs uppercase tracking-widest text-zinc-500">
              out of 100
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-3 px-3 py-1 rounded-full text-xs uppercase tracking-widest font-semibold"
          style={{
            background: ringColor + "22",
            color: ringColor,
            border: `1px solid ${ringColor}44`,
          }}
        >
          Grade {result.grade}
        </motion.div>
      </div>
      <div>
        <div className="text-zinc-400 text-sm uppercase tracking-widest mb-2">
          The verdict
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-2xl md:text-3xl font-bold leading-snug mb-6 text-zinc-100"
        >
          {result.vibe}
        </motion.p>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <Stat label="Load time" value={`${result.loadMs}ms`} delay={0.55} />
          <Stat
            label="HTML size"
            value={`${(result.bytes / 1024).toFixed(0)} KB`}
            delay={0.65}
          />
          <Stat
            label="Words"
            value={result.meta.wordCount.toLocaleString()}
            delay={0.75}
          />
        </div>
      </div>
    </div>
  );
}

function RingFill({ score, color }: { score: number; color: string }) {
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { duration: 1400, bounce: 0 });

  useEffect(() => {
    motionVal.set(score);
  }, [score, motionVal]);

  const background = useTransform(
    spring,
    (latest) => `conic-gradient(${color} ${latest}%, rgba(255,255,255,0.08) 0)`
  );

  return (
    <motion.div
      className="absolute inset-0 rounded-full"
      style={{ background }}
    />
  );
}

function Stat({
  label,
  value,
  delay,
}: {
  label: string;
  value: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <div className="text-xs uppercase tracking-widest text-zinc-500 mb-1">
        {label}
      </div>
      <div className="text-xl font-semibold tabular-nums text-zinc-100">
        {value}
      </div>
    </motion.div>
  );
}

function LighthouseSection({ result }: { result: AuditResult }) {
  const lh = result.lighthouse!;
  // stability: "stable" = deterministic / DOM-based, won't change run-to-run
  //            "variable" = network/timing-based, can wiggle ±5-10 points per run
  const cells: Array<{
    label: string;
    value: number | null;
    key: string;
    stability: "stable" | "variable";
  }> = [
    { label: "Performance", value: lh.scores.performance, key: "perf", stability: "variable" },
    { label: "Accessibility", value: lh.scores.accessibility, key: "a11y", stability: "stable" },
    { label: "Best Practices", value: lh.scores.bestPractices, key: "bp", stability: "stable" },
    { label: "SEO", value: lh.scores.seo, key: "seo", stability: "stable" },
  ];

  return (
    <div>
      <div className="flex items-baseline justify-between flex-wrap gap-3 mb-2">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-zinc-100">
          <Gauge className="w-5 h-5 text-ember-400" />
          Lighthouse — Google&apos;s own audit
        </h2>
        <span className="text-xs text-zinc-500">
          Ran locally · {Math.round(lh.durationMs / 1000)}s · {lh.strategy}
        </span>
      </div>
      <p className="text-xs text-zinc-500 mb-6 flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          stable signal
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          wiggles ±5-10 pts per run (network + timing dependent)
        </span>
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cells.map((c, i) => (
          <LighthouseCell
            key={c.key}
            label={c.label}
            value={c.value}
            delay={i * 0.08}
            stability={c.stability}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3 mt-3">
        <VitalCell
          label="LCP"
          value={lh.vitals.lcp !== null ? `${(lh.vitals.lcp / 1000).toFixed(2)}s` : "—"}
          good={(lh.vitals.lcp ?? 9999) < 2500}
          warn={(lh.vitals.lcp ?? 9999) < 4000}
          tip="Largest Contentful Paint"
          stability="variable"
        />
        <VitalCell
          label="CLS"
          value={
            lh.vitals.cls !== null ? lh.vitals.cls.toFixed(3) : "—"
          }
          good={(lh.vitals.cls ?? 1) < 0.1}
          warn={(lh.vitals.cls ?? 1) < 0.25}
          tip="Cumulative Layout Shift"
          stability="stable"
        />
        <VitalCell
          label="TBT"
          value={lh.vitals.tbt !== null ? `${lh.vitals.tbt}ms` : "—"}
          good={(lh.vitals.tbt ?? 9999) < 200}
          warn={(lh.vitals.tbt ?? 9999) < 600}
          tip="Total Blocking Time"
          stability="variable"
        />
      </div>
      {lh.opportunities.length > 0 && (
        <div className="glass rounded-2xl p-5 mt-4">
          <div className="flex items-center gap-2 mb-3 text-zinc-400">
            <Zap className="w-4 h-4 text-ember-400" />
            <span className="text-xs uppercase tracking-widest">
              Top opportunities Lighthouse flagged
            </span>
          </div>
          <ul className="space-y-2">
            {lh.opportunities.slice(0, 4).map((o, i) => (
              <motion.li
                key={o.id || i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className="flex items-start gap-3 text-sm"
              >
                <span className="text-ember-400 font-mono tabular-nums shrink-0 mt-0.5">
                  -{((o.savingsMs ?? 0) / 1000).toFixed(1)}s
                </span>
                <div>
                  <div className="text-zinc-200 font-medium">{o.title}</div>
                  <div className="text-zinc-500 text-xs">{o.description}</div>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-[11px] text-zinc-600 mt-4 leading-relaxed max-w-3xl">
        <span className="text-zinc-400 font-semibold">Why scores wiggle:</span>{" "}
        Performance / LCP / TBT measure network + timing, which Google&apos;s own
        PSI admits varies ±5-10 points per run. SEO, Best Practices,
        Accessibility, and CLS are DOM-deterministic — re-scanning won&apos;t
        change them. To verify a fix, focus on the stable signals and the
        opportunities list above.
      </p>
    </div>
  );
}

function LighthouseCell({
  label,
  value,
  delay,
  stability,
}: {
  label: string;
  value: number | null;
  delay: number;
  stability: "stable" | "variable";
}) {
  const color =
    value === null
      ? "#71717a"
      : value >= 90
      ? "#22c55e"
      : value >= 50
      ? "#eab308"
      : "#ef4444";

  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { duration: 1200, bounce: 0.1 });
  const display = useTransform(spring, (v) => (value === null ? "—" : Math.round(v).toString()));
  const arc = useTransform(spring, (v) => `conic-gradient(${color} ${v}%, rgba(255,255,255,0.06) 0)`);

  useEffect(() => {
    if (value !== null) motionVal.set(value);
  }, [value, motionVal]);

  const stabilityDot = stability === "stable" ? "#22c55e" : "#fbbf24";
  const stabilityTitle =
    stability === "stable"
      ? "Stable signal — won't change between runs"
      : "Variable signal — can wiggle ±5-10 pts per run";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -3 }}
      className="glass rounded-2xl p-5 flex flex-col items-center text-center cursor-default relative"
    >
      <div
        className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full"
        style={{ background: stabilityDot }}
        title={stabilityTitle}
      />
      <div className="relative w-20 h-20 rounded-full flex items-center justify-center">
        <motion.div className="absolute inset-0 rounded-full" style={{ background: arc }} />
        <div className="absolute inset-1.5 rounded-full bg-zinc-950 flex items-center justify-center">
          <motion.span
            className="text-2xl font-black tabular-nums"
            style={{ color }}
          >
            {display}
          </motion.span>
        </div>
      </div>
      <div className="mt-3 text-xs uppercase tracking-widest text-zinc-500">
        {label}
      </div>
    </motion.div>
  );
}

function VitalCell({
  label,
  value,
  good,
  warn,
  tip,
  stability,
}: {
  label: string;
  value: string;
  good: boolean;
  warn: boolean;
  tip: string;
  stability: "stable" | "variable";
}) {
  const color = good ? "#22c55e" : warn ? "#eab308" : "#ef4444";
  const stabilityDot = stability === "stable" ? "#22c55e" : "#fbbf24";
  const stabilityTitle =
    stability === "stable"
      ? "Stable signal — won't change between runs"
      : "Variable signal — can wiggle ±5-10 pts per run";
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="glass rounded-2xl p-4 flex items-center justify-between relative"
    >
      <span
        className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full"
        style={{ background: stabilityDot }}
        title={stabilityTitle}
      />
      <div>
        <div className="text-[10px] uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
          <span>{tip}</span>
          <span className="text-zinc-700 normal-case tracking-normal font-mono">
            {label}
          </span>
        </div>
        <div className="text-xl font-bold tabular-nums" style={{ color }}>
          {value}
        </div>
      </div>
      <div
        className="w-2 h-12 rounded-full"
        style={{ background: color, opacity: 0.6 }}
      />
    </motion.div>
  );
}

function ScreenshotSection({ result }: { result: AuditResult }) {
  const [view, setView] = useState<"desktop" | "mobile">("desktop");
  const [fullPage, setFullPage] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const shots = result.screenshots;
  const axe = shots?.axe;
  const hasOverlayData =
    !!axe &&
    !fullPage &&
    view === "desktop" &&
    axe.violations.some((v) => v.boundingBoxes.length > 0);

  if (!shots) {
    return (
      <div className="glass rounded-3xl p-8 text-center">
        <Eye className="w-6 h-6 mx-auto mb-3 text-zinc-500" />
        <div className="text-zinc-400 text-sm">
          Couldn&apos;t render this site in a headless browser (it may block bots).
          The audit data above is still from a real fetch.
        </div>
      </div>
    );
  }

  const src = fullPage
    ? view === "desktop"
      ? `data:image/jpeg;base64,${shots.desktopFull}`
      : `data:image/jpeg;base64,${shots.mobileFull}`
    : view === "desktop"
    ? `data:image/jpeg;base64,${shots.desktop}`
    : `data:image/jpeg;base64,${shots.mobile}`;

  const renderWidth =
    view === "desktop" ? shots.desktopWidth : shots.mobileWidth;
  const renderHeight = fullPage
    ? view === "desktop"
      ? shots.desktopFullHeight
      : shots.mobileFullHeight
    : view === "desktop"
    ? shots.desktopHeight
    : shots.mobileHeight;

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-zinc-100">
          <Eye className="w-5 h-5 text-ember-400" />
          What we actually saw
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-zinc-900/60 rounded-lg border border-zinc-800 relative">
            <ViewTab
              active={view === "desktop"}
              onClick={() => setView("desktop")}
              icon={<Monitor className="w-3.5 h-3.5" />}
              label="Desktop"
              id="desktop"
            />
            <ViewTab
              active={view === "mobile"}
              onClick={() => setView("mobile")}
              icon={<Smartphone className="w-3.5 h-3.5" />}
              label="Mobile"
              id="mobile"
            />
          </div>
          <motion.button
            onClick={() => setFullPage((p) => !p)}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${
              fullPage
                ? "bg-ember-500/10 border-ember-500/40 text-ember-300"
                : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            {fullPage ? "Full page" : "Above fold"}
          </motion.button>
          {hasOverlayData && (
            <motion.button
              onClick={() => setShowOverlay((p) => !p)}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${
                showOverlay
                  ? "bg-red-500/10 border-red-500/40 text-red-300"
                  : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
              title="Highlight WCAG violations on the screenshot"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              {showOverlay ? "Hide issues" : "Show issues"}
            </motion.button>
          )}
        </div>
      </div>
      <div className="glass rounded-3xl p-3 md:p-5">
        <motion.div
          key={`${view}-${fullPage}`}
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className={`relative mx-auto rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 ${
            view === "mobile" ? "max-w-[340px]" : "w-full"
          } ${fullPage ? "max-h-[640px] overflow-y-auto" : ""}`}
          style={
            fullPage
              ? {}
              : {
                  aspectRatio: `${renderWidth} / ${renderHeight}`,
                }
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={`${view} ${fullPage ? "full-page" : "above-fold"} screenshot of ${result.url}`}
            className={`w-full ${fullPage ? "h-auto" : "h-full object-cover object-top"}`}
          />
          {showOverlay && hasOverlayData && axe && (
            <ViolationOverlay axe={axe} renderWidth={renderWidth} renderHeight={renderHeight} />
          )}
          <div className="sticky top-3 ml-auto mr-3 inline-block px-2 py-1 rounded bg-black/70 backdrop-blur text-[10px] uppercase tracking-widest text-zinc-300 border border-zinc-800 float-right">
            {renderWidth} × {renderHeight}
          </div>
        </motion.div>
        <div className="mt-3 text-xs text-zinc-500 text-center">
          Captured at {new Date(shots.capturedAt).toLocaleTimeString()} ·{" "}
          {fullPage ? "Full scroll length" : "Above-the-fold viewport"}
        </div>
      </div>
    </div>
  );
}

function ViolationOverlay({
  axe,
  renderWidth,
  renderHeight,
}: {
  axe: NonNullable<AuditResult["screenshots"]>["axe"];
  renderWidth: number;
  renderHeight: number;
}) {
  if (!axe) return null;
  const violations = axe.violations.filter((v) => v.boundingBoxes.length > 0);
  if (violations.length === 0) return null;

  const impactColor = (impact: string | null) => {
    if (impact === "critical") return "#ef4444";
    if (impact === "serious") return "#f97316";
    if (impact === "moderate") return "#eab308";
    return "#a3a3a3";
  };

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox={`0 0 ${renderWidth} ${renderHeight}`}
      preserveAspectRatio="none"
    >
      {violations.flatMap((v, vi) =>
        v.boundingBoxes.map((box, bi) => {
          const color = impactColor(v.impact);
          return (
            <g key={`${vi}-${bi}`}>
              <rect
                x={box.x}
                y={box.y}
                width={box.width}
                height={box.height}
                fill={color}
                fillOpacity={0.18}
                stroke={color}
                strokeWidth={2}
                strokeDasharray="4 3"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  values="0;14"
                  dur="1.2s"
                  repeatCount="indefinite"
                />
              </rect>
              {bi === 0 && (
                <g>
                  <rect
                    x={box.x}
                    y={Math.max(0, box.y - 22)}
                    width={Math.min(280, v.help.length * 6 + 16)}
                    height={20}
                    fill={color}
                    rx={3}
                  />
                  <text
                    x={box.x + 8}
                    y={Math.max(0, box.y - 22) + 14}
                    fill="#0a0908"
                    fontSize={11}
                    fontWeight={700}
                  >
                    {v.help.slice(0, 40)}
                  </text>
                </g>
              )}
            </g>
          );
        })
      )}
    </svg>
  );
}

function ViewTab({
  active,
  onClick,
  icon,
  label,
  id,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  id: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors cursor-pointer ${
        active ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
      }`}
    >
      {active && (
        <motion.div
          layoutId="view-tab-pill"
          className="absolute inset-0 bg-zinc-800 rounded-md"
          transition={{ type: "spring", duration: 0.4, bounce: 0.18 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">
        {icon}
        {label}
      </span>
    </button>
  );
}

function RoastSection({
  result,
  setParentText,
  setParentDone,
}: {
  result: AuditResult;
  setParentText: React.Dispatch<React.SetStateAction<string>>;
  setParentDone: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const [source, setSource] = useState<string>("");
  const [fallbackTone, setFallbackTone] = useState<string>("");

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        // Daily count for the personality engine ("47th site today")
        const countToday = bumpDailyCounter();
        const userTimeZone =
          Intl.DateTimeFormat().resolvedOptions().timeZone;
        const res = await fetch("/api/roast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ audit: result, countToday, userTimeZone }),
          signal: ctrl.signal,
        });
        if (ctrl.signal.aborted) return;
        setSource(res.headers.get("X-Source") || "unknown");
        setFallbackTone(res.headers.get("X-Fallback-Tone") || "");
        if (!res.ok) {
          const msg = "The Roaster ghosted. Try refreshing.";
          setText(msg);
          setDone(true);
          setParentText(msg);
          setParentDone(true);
          return;
        }
        const body = await res.text();
        if (ctrl.signal.aborted) return;
        setText(body);
        setParentText(body);
        setDone(true);
        setParentDone(true);
      } catch {
        if (ctrl.signal.aborted) return;
        setText("The Roaster ghosted. Try refreshing.");
        setDone(true);
        setParentDone(true);
      }
    })();

    return () => ctrl.abort();
    // setParentText/setParentDone are stable React setters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  const paragraphs = text.split(/\n\n+/);
  const loadingLabel = result.screenshots
    ? "The Roaster is studying the screenshot..."
    : "The Roaster is reading the HTML audit data...";

  return (
    <div className="glass rounded-3xl p-8 md:p-10 relative overflow-hidden">
      <motion.div
        className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl bg-ember-500 pointer-events-none"
        animate={{ opacity: done ? 0.2 : [0.15, 0.3, 0.15] }}
        transition={done ? { duration: 0.5 } : { duration: 3, repeat: Infinity }}
      />
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <motion.div
          animate={done ? { rotate: 0 } : { rotate: [0, 5, -5, 0] }}
          transition={
            done ? { duration: 0.3 } : { duration: 2, repeat: Infinity }
          }
          className="w-9 h-9 rounded-lg bg-gradient-to-br from-ember-500 to-red-600 flex items-center justify-center"
        >
          <Sparkles className="w-4 h-4 text-black" />
        </motion.div>
        <div>
          <div className="font-semibold text-zinc-100">The Roaster</div>
          <div className="text-xs text-zinc-500">
            {roasterSourceLabel(source, fallbackTone)}
          </div>
        </div>
      </div>
      <div className="relative z-10 prose prose-invert max-w-none">
        {paragraphs.map((para, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-lg leading-relaxed text-zinc-200 mb-4 last:mb-0"
          >
            {para}
            {!done && i === paragraphs.length - 1 && para.length > 0 && (
              <span className="inline-block w-2 h-5 bg-ember-400 ml-1 animate-pulse align-middle" />
            )}
          </motion.p>
        ))}
        {!text && (
          <div className="flex items-center gap-3 text-zinc-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="italic">{loadingLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function FactsRow({ result }: { result: AuditResult }) {
  const cards: React.ReactNode[] = [];

  if (result.techStack) {
    cards.push(<TechStackCard key="tech" stack={result.techStack} />);
  }
  if (result.domain?.ageYears !== null && result.domain?.ageYears !== undefined) {
    cards.push(<DomainCard key="domain" domain={result.domain} />);
  }
  if (result.security?.grade) {
    cards.push(<SecurityCard key="security" security={result.security} />);
  }
  if (result.wayback?.firstSnapshot) {
    cards.push(<WaybackCard key="wayback" wayback={result.wayback} />);
  }

  if (cards.length === 0) return null;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-zinc-100">Forensics</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">{cards}</div>
    </div>
  );
}

function DomainCard({ domain }: { domain: NonNullable<AuditResult["domain"]> }) {
  const years = domain.ageYears ?? 0;
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 mb-3 text-zinc-500">
        <CalendarDays className="w-4 h-4" />
        <span className="text-xs uppercase tracking-widest">Domain age</span>
      </div>
      <div className="text-3xl font-black tabular-nums text-zinc-100 mb-1">
        {years} <span className="text-base font-normal text-zinc-500">{years === 1 ? "year" : "years"}</span>
      </div>
      <div className="text-xs text-zinc-500 mb-3">
        Registered {domain.registered?.slice(0, 10) || "—"}
      </div>
      {domain.registrar && (
        <div className="text-xs text-zinc-400">
          via <span className="text-zinc-200">{domain.registrar}</span>
        </div>
      )}
    </motion.div>
  );
}

function TechStackCard({ stack }: { stack: NonNullable<AuditResult["techStack"]> }) {
  const primary =
    stack.builder ||
    stack.cms ||
    stack.ecommerce ||
    stack.platform ||
    "Custom / unknown";

  const tags = [
    stack.cms,
    stack.builder,
    stack.ecommerce,
    stack.platform,
    ...stack.analytics,
  ].filter(Boolean) as string[];

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 mb-3 text-zinc-500">
        <Cpu className="w-4 h-4" />
        <span className="text-xs uppercase tracking-widest">Tech stack</span>
      </div>
      <div className="text-2xl font-bold text-zinc-100 mb-3">{primary}</div>
      <div className="flex flex-wrap gap-1.5">
        {tags.slice(0, 6).map((t) => (
          <span
            key={t}
            className="px-2 py-0.5 rounded text-[11px] bg-zinc-900/80 border border-zinc-800 text-zinc-400"
          >
            {t}
          </span>
        ))}
        {tags.length === 0 && (
          <span className="text-xs text-zinc-600">No signatures detected</span>
        )}
      </div>
      {stack.fonts.length > 0 && (
        <div className="mt-4 pt-3 border-t border-zinc-900 text-xs text-zinc-500">
          Fonts: <span className="text-zinc-300">{stack.fonts.join(", ")}</span>
        </div>
      )}
    </motion.div>
  );
}

function WaybackCard({ wayback }: { wayback: NonNullable<AuditResult["wayback"]> }) {
  const days = wayback.daysSinceLastSnapshot ?? 0;
  const status =
    days < 90
      ? { color: "#22c55e", label: "Fresh", vibe: "Maintained recently" }
      : days < 365
      ? { color: "#eab308", label: "Stale", vibe: "Could be staler than competitors" }
      : { color: "#ef4444", label: "Abandoned", vibe: "Looks frozen in time" };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 mb-3 text-zinc-500">
        <Clock className="w-4 h-4" />
        <span className="text-xs uppercase tracking-widest">Wayback Machine</span>
      </div>
      <div
        className="text-2xl font-bold mb-1"
        style={{ color: status.color }}
      >
        {status.label}
      </div>
      <div className="text-sm text-zinc-400 mb-4">{status.vibe}</div>
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between text-zinc-500">
          <span>First seen</span>
          <span className="text-zinc-300 tabular-nums">
            {wayback.firstSnapshot?.slice(0, 10) || "—"}
          </span>
        </div>
        <div className="flex justify-between text-zinc-500">
          <span>Last archived</span>
          <span className="text-zinc-300 tabular-nums">
            {wayback.lastSnapshot?.slice(0, 10) || "—"} ({days}d ago)
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function SecurityCard({ security }: { security: NonNullable<AuditResult["security"]> }) {
  const grade = (security.grade || "F").toUpperCase();
  const color =
    /^A/.test(grade) ? "#22c55e" :
    /^B/.test(grade) ? "#84cc16" :
    /^C/.test(grade) ? "#eab308" :
    /^D/.test(grade) ? "#f97316" : "#ef4444";

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 mb-3 text-zinc-500">
        <Shield className="w-4 h-4" />
        <span className="text-xs uppercase tracking-widest">Security headers</span>
      </div>
      <div
        className="text-3xl font-black tabular-nums mb-1"
        style={{ color }}
      >
        Grade {grade}
      </div>
      <div className="text-sm text-zinc-400 mb-4">
        {security.score !== null ? `${security.score} / 100` : "Scored by Mozilla Observatory"}
      </div>
      <a
        href={security.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-ember-400 hover:text-ember-300 underline"
      >
        View on Mozilla Observatory →
      </a>
    </motion.div>
  );
}

function CompareCTA({ result }: { result: AuditResult }) {
  const [competitor, setCompetitor] = useState("");
  const hostname = (() => {
    try {
      return new URL(result.url).hostname.replace(/^www\./, "");
    } catch {
      return result.url;
    }
  })();
  const youParam = encodeURIComponent(result.url);
  const themParam = competitor.trim() ? `&them=${encodeURIComponent(competitor.trim())}` : "";
  const href = competitor.trim()
    ? `/compare?you=${youParam}${themParam}`
    : `/compare?you=${youParam}`;

  return (
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-violet-600/40 via-indigo-600/30 to-blue-600/40 p-[1px]">
      <div className="rounded-3xl bg-zinc-950 p-7 md:p-9">
        <div className="flex flex-col md:flex-row md:items-end gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Swords className="w-4 h-4 text-violet-300" />
              <span className="text-xs uppercase tracking-widest text-violet-300 font-semibold">
                Head to head
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-2 text-zinc-100">
              How does {hostname} stack up vs. your competitor?
            </h3>
            <p className="text-zinc-400 leading-relaxed mb-4 max-w-2xl">
              Drop their URL and we&apos;ll run the same audit on them. See
              who&apos;s actually winning the customer first impression — real
              Lighthouse, side-by-side screenshots, category-by-category.
            </p>
            <input
              type="text"
              value={competitor}
              onChange={(e) => setCompetitor(e.target.value)}
              placeholder="competitor.com"
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
              className="w-full md:w-96 bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-violet-500/40 transition-colors text-zinc-100 placeholder:text-zinc-600"
            />
          </div>
          <motion.a
            href={href}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className={`inline-flex items-center gap-2 px-6 py-4 rounded-xl text-sm font-semibold whitespace-nowrap cursor-pointer transition-all ${
              competitor.trim()
                ? "bg-gradient-to-br from-violet-500 to-indigo-600 hover:from-violet-400 hover:to-indigo-500 text-white shadow-lg shadow-violet-900/30"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            {competitor.trim() ? "Compare now" : "Pick a competitor"}
            <ArrowRight className="w-4 h-4" />
          </motion.a>
        </div>
      </div>
    </div>
  );
}

function ChecksSection({ checks }: { checks: Check[] }) {
  const failed = checks.filter((c) => c.status === "fail");
  const warned = checks.filter((c) => c.status === "warn");
  const passed = checks.filter((c) => c.status === "pass");

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
        The breakdown
        <span className="text-xs font-normal text-zinc-500 normal-case">
          {failed.length} failed · {warned.length} warned · {passed.length}{" "}
          passed
        </span>
      </h2>
      <div className="space-y-3">
        {[...failed, ...warned, ...passed].map((c, i) => (
          <CheckRow key={c.id} check={c} index={i} />
        ))}
      </div>
    </div>
  );
}

function CheckRow({ check, index }: { check: Check; index: number }) {
  const config = {
    pass: {
      icon: CheckIcon,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      label: "Pass",
    },
    warn: {
      icon: AlertTriangle,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      label: "Warn",
    },
    fail: {
      icon: X,
      color: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      label: "Fail",
    },
  }[check.status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.5) }}
      whileHover={{ x: 4 }}
      className={`rounded-2xl border ${config.border} ${config.bg} p-5 grid grid-cols-[auto_1fr_auto] gap-4 items-start cursor-default`}
    >
      <div
        className={`w-9 h-9 rounded-lg ${config.bg} ${config.color} border ${config.border} flex items-center justify-center shrink-0`}
      >
        <Icon className="w-4 h-4" strokeWidth={2.5} />
      </div>
      <div>
        <div className="flex items-baseline gap-2 mb-1">
          <div className="font-semibold text-zinc-100">{check.label}</div>
          <div className={`text-xs uppercase tracking-widest ${config.color}`}>
            {config.label}
          </div>
        </div>
        <div className="text-sm text-zinc-400 leading-relaxed">
          {check.detail}
        </div>
        {check.fixHint && (
          <div className="mt-2 text-sm text-zinc-300 bg-zinc-950/40 border border-zinc-800 rounded-lg px-3 py-2">
            <span className="text-ember-400 font-semibold">Fix:</span>{" "}
            {check.fixHint}
          </div>
        )}
      </div>
      <div className="text-xs text-zinc-600 font-mono tabular-nums">
        {check.weight}pt
      </div>
    </motion.div>
  );
}

function MetaSection({ result }: { result: AuditResult }) {
  const rows: Array<[string, string]> = [
    ["Final URL", result.finalUrl],
    ["Page title", result.meta.title || "—"],
    ["Meta description", result.meta.description || "—"],
    ["H1", result.meta.h1 || "—"],
    ["Canonical", result.meta.canonical || "—"],
    ["Phone on page", result.meta.phone || "—"],
    ["Email on page", result.meta.email || "—"],
    ["Forms", String(result.meta.forms)],
    [
      "Images / missing alt",
      `${result.meta.imageCount} / ${result.meta.imagesMissingAlt}`,
    ],
    ["External links", String(result.meta.externalLinks)],
    ["Tech fingerprint", result.meta.poweredBy || "—"],
    ["Analytics", result.meta.hasGoogleAnalytics ? "Detected" : "—"],
    ["Schema markup", result.meta.hasSchemaMarkup ? "Detected" : "—"],
  ];

  return (
    <details className="glass rounded-3xl overflow-hidden group">
      <summary className="cursor-pointer p-6 list-none flex items-center justify-between hover:bg-zinc-900/30 transition-colors">
        <span className="font-semibold text-zinc-100">
          Raw findings · click to expand
        </span>
        <span className="text-zinc-500 text-sm group-open:rotate-180 transition-transform">
          ▼
        </span>
      </summary>
      <div className="px-6 pb-6">
        <div className="rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {rows.map(([k, v], i) => (
                <tr
                  key={k}
                  className={
                    i % 2 === 0 ? "bg-zinc-950/40" : "bg-zinc-900/20"
                  }
                >
                  <td className="py-2.5 px-4 text-zinc-500 font-medium w-1/3">
                    {k}
                  </td>
                  <td className="py-2.5 px-4 text-zinc-200 break-all">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </details>
  );
}
