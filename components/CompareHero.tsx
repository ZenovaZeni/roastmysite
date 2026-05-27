"use client";
import { useEffect, useState } from "react";
import type { AuditResult } from "@/lib/audit";
import { CompareInput } from "./CompareInput";
import { CompareScanProgress } from "./CompareScanProgress";
import { CompareReport } from "./CompareReport";
import { Footer } from "./Footer";
import { LogoMark } from "./Logo";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Swords } from "lucide-react";

type Stage = "idle" | "scanning" | "result";

export function CompareHero() {
  const [stage, setStage] = useState<Stage>("idle");
  const [urls, setUrls] = useState({ you: "", them: "" });
  const [you, setYou] = useState<AuditResult | null>(null);
  const [them, setThem] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prefill, setPrefill] = useState({ you: "", them: "" });

  // Auto-fill from URL params (?you=...&them=...) — from the Compare CTA on result page
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const yParam = params.get("you") || "";
    const tParam = params.get("them") || "";
    if (yParam || tParam) {
      setPrefill({ you: yParam, them: tParam });
      // If BOTH are present, kick off the compare immediately
      if (yParam && tParam) {
        handleCompare(yParam, tParam);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCompare(youUrl: string, themUrl: string) {
    setError(null);
    setUrls({ you: youUrl, them: themUrl });
    setStage("scanning");
    setYou(null);
    setThem(null);

    try {
      const minDelay = new Promise<void>((r) => setTimeout(r, 3200));
      const [yRes, tRes] = await Promise.all([
        fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: youUrl, multipage: false }),
        }),
        fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: themUrl, multipage: false }),
        }),
        minDelay,
      ]);
      if (!yRes.ok) throw new Error("Failed to scan your site");
      if (!tRes.ok) throw new Error("Failed to scan competitor");
      const [yData, tData] = await Promise.all([
        yRes.json() as Promise<AuditResult>,
        tRes.json() as Promise<AuditResult>,
      ]);
      setYou(yData);
      setThem(tData);
      setStage("result");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Compare failed");
      setStage("idle");
    }
  }

  function reset() {
    setStage("idle");
    setYou(null);
    setThem(null);
    setError(null);
    setUrls({ you: "", them: "" });
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden noise">
      <BackgroundGlow />
      <Nav onReset={reset} />

      <main className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        {stage === "idle" && (
          <IdleHero onCompare={handleCompare} error={error} prefill={prefill} />
        )}
        {stage === "scanning" && (
          <CompareScanProgress youUrl={urls.you} themUrl={urls.them} />
        )}
        {stage === "result" && you && them && (
          <CompareReport you={you} them={them} onReset={reset} />
        )}
      </main>

      <Footer />
    </div>
  );
}

function Nav({ onReset }: { onReset: () => void }) {
  return (
    <nav className="relative z-20 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
      <Link href="/" className="group flex items-center gap-2 cursor-pointer">
        <LogoMark size={36} withGlow />
        <span className="text-lg font-semibold tracking-tight">
          Roast<span className="text-ember-400">My</span>Site
        </span>
      </Link>
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="hidden md:inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Single audit
        </Link>
        <button
          onClick={onReset}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Reset
        </button>
      </div>
    </nav>
  );
}

function BackgroundGlow() {
  return (
    <>
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(249,115,22,0.6) 0%, rgba(220,38,38,0.3) 40%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-[400px] right-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)",
        }}
      />
    </>
  );
}

function IdleHero({
  onCompare,
  error,
  prefill,
}: {
  onCompare: (you: string, them: string) => void;
  error: string | null;
  prefill: { you: string; them: string };
}) {
  return (
    <div className="pt-12 md:pt-20">
      <div className="text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300 mb-8"
        >
          <Swords className="w-3 h-3 text-ember-400" />
          Head to head · Free · Done in 60 seconds
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05] mb-6"
        >
          You vs.
          <br />
          <span className="bg-gradient-to-br from-ember-300 via-ember-500 to-red-600 bg-clip-text text-transparent">
            your competitor.
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Drop two URLs. Real Lighthouse, real screenshots, real verdict on
          who&apos;s winning the customer first impression.
        </motion.p>

        <CompareInput onSubmit={onCompare} error={error} prefill={prefill} />
      </div>
    </div>
  );
}
