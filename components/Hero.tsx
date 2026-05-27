"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { AuditResult } from "@/lib/audit";
import { validateUrlInput } from "@/lib/url-validation";
import { UrlInput } from "./UrlInput";
import { ScanProgress } from "./ScanProgress";
import { ResultReport } from "./ResultReport";
import { Footer } from "./Footer";
import { HistorySection } from "./HistorySection";
import { BookmarkletSection } from "./ExtrasSection";
import { LogoMark } from "./Logo";
import {
  Eye,
  Gauge,
  Sparkles,
  FileText,
  Swords,
  Lock,
  Zap,
  Award,
  ArrowRight,
  PlusCircle,
} from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;
const VIEWPORT = { once: true, amount: 0.3 };

type Stage = "idle" | "scanning" | "result";

export function Hero() {
  const [stage, setStage] = useState<Stage>("idle");
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-scan when arriving with ?url= in the address bar (shared links)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get("url");
    if (urlParam && urlParam.trim()) {
      handleScan(urlParam.trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleScan(input: string) {
    setError(null);
    setUrl(input);
    setStage("scanning");
    setResult(null);

    try {
      const minDelay = new Promise<void>((r) => setTimeout(r, 3200));
      const fetchPromise = fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: input }),
      });
      const [res] = await Promise.all([fetchPromise, minDelay]);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Scan failed" }));
        throw new Error(err.error || "Scan failed");
      }
      const data = (await res.json()) as AuditResult;
      setResult(data);
      setStage("result");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setStage("idle");
    }
  }

  function reset() {
    setStage("idle");
    setResult(null);
    setError(null);
    setUrl("");
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden noise">
      <BackgroundGlow />
      <Nav onReset={reset} />

      <main className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        {stage === "idle" && (
          <IdleHero onScan={handleScan} error={error} />
        )}
        {stage === "scanning" && <ScanProgress url={url} />}
        {stage === "result" && result && (
          <ResultReport result={result} onReset={reset} />
        )}
      </main>

      <Footer />
    </div>
  );
}

function Nav({ onReset }: { onReset: () => void }) {
  return (
    <nav className="relative z-20 max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
      <button
        onClick={onReset}
        className="group flex items-center gap-2 cursor-pointer"
      >
        <LogoMark size={36} withGlow />
        <span className="text-lg font-semibold tracking-tight">
          Roast<span className="text-ember-400">My</span>Site
        </span>
      </button>
      <div className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
        <a
          href="/compare"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-ember-500/40 text-zinc-300 hover:text-ember-300 transition-colors text-xs"
        >
          ⚔ Compare two sites
        </a>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Roaster online · no login
        </span>
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
        className="absolute top-[400px] -left-32 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(168,85,247,0.5) 0%, transparent 70%)",
        }}
      />
    </>
  );
}

function IdleHero({
  onScan,
  error,
}: {
  onScan: (u: string) => void;
  error: string | null;
}) {
  return (
    <div className="pt-12 md:pt-20">
      {/* HERO */}
      <div className="text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300 mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-ember-400 animate-pulse" />
          Free · No login · No tracking · Done in 30 seconds
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.05 }}
          className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05] mb-6"
        >
          Your website is
          <br />
          <span className="bg-gradient-to-br from-ember-300 via-ember-500 to-red-600 bg-clip-text text-transparent">
            costing you customers.
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Drop any URL. Get a brutally honest 0-100 score, real Lighthouse
          numbers, screenshots, the exact things scaring buyers away, and a
          roast from an AI that actually looked at the page.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5, ease: EASE }}
        >
          <UrlInput onSubmit={onScan} error={error} />
        </motion.div>

        <SocialProof />
        <ExamplesRow onScan={onScan} />
      </div>

      <HistorySection onPick={onScan} />
      <Features />
      <StatsBand />
      <WhatYouGet />
      <HowItWorks />
      <CompareTeaser />
      <BookmarkletSection />
      <Faq />
      <ClosingCta onScan={onScan} />
    </div>
  );
}

function ExamplesRow({ onScan }: { onScan: (u: string) => void }) {
  const examples = ["stripe.com", "apple.com", "shopify.com", "google.com"];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.5 }}
      className="mt-6 flex flex-wrap items-center justify-center gap-2"
    >
      <span className="text-xs text-zinc-600 mr-1">Try a famous site:</span>
      {examples.map((url) => (
        <button
          key={url}
          onClick={() => onScan(url)}
          className="px-3 py-1.5 rounded-full bg-zinc-900/60 border border-zinc-800 hover:border-ember-500/40 text-xs text-zinc-400 hover:text-ember-300 transition-colors cursor-pointer"
        >
          {url}
        </button>
      ))}
    </motion.div>
  );
}

function SocialProof() {
  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-zinc-500">
      <span>17 checks</span>
      <span className="text-zinc-700">•</span>
      <span>SEO, mobile, security, conversion</span>
      <span className="text-zinc-700">•</span>
      <span>Nothing stored on our servers</span>
      <span className="text-zinc-700">•</span>
      <span>Your history stays in your browser</span>
    </div>
  );
}

function Features() {
  const features = [
    {
      icon: Eye,
      title: "Honest, not nice.",
      body: "Most audit tools tell you everything is 'okay' so they can upsell. This one tells you where you're bleeding revenue, in plain English.",
    },
    {
      icon: Gauge,
      title: "Specific, not generic.",
      body: "No 'consider improving your meta tags.' You see the exact title that's too long, the exact phone nobody can find, the exact image too heavy to load.",
    },
    {
      icon: Lock,
      title: "No accounts. No tracking.",
      body: "No login, no email gate, no retargeting pixels. Your scan history stays in your browser — clear cookies and it's gone. We don't store anything about you on our servers.",
    },
  ];

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.08 } },
      }}
      className="mt-32 grid md:grid-cols-3 gap-4"
    >
      {features.map((f) => (
        <motion.div
          key={f.title}
          variants={{
            hidden: { opacity: 0, y: 16 },
            show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
          }}
          whileHover={{ y: -2 }}
          className="glass rounded-2xl p-6 hover:border-ember-500/30 transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-ember-500/10 border border-ember-500/30 flex items-center justify-center mb-4">
            <f.icon className="w-5 h-5 text-ember-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-zinc-100">{f.title}</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">{f.body}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}

function StatsBand() {
  const stats = [
    { v: "25+", l: "Audit checks" },
    { v: "4", l: "Data sources" },
    { v: "5", l: "Pages per scan" },
    { v: "$0", l: "Forever free" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.6, ease: EASE }}
      className="mt-24 glass rounded-3xl p-8 md:p-10"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <motion.div
            key={s.l}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.5, ease: EASE, delay: i * 0.08 }}
            className="text-center"
          >
            <div className="text-4xl md:text-5xl font-black tabular-nums bg-gradient-to-br from-ember-300 via-ember-500 to-red-600 bg-clip-text text-transparent">
              {s.v}
            </div>
            <div className="text-xs uppercase tracking-widest text-zinc-500 mt-1">
              {s.l}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function WhatYouGet() {
  const rows = [
    {
      icon: Gauge,
      eyebrow: "Real Lighthouse",
      title: "Google's own scoring tool, running live.",
      body:
        "Performance, Accessibility, Best Practices, SEO — measured the moment you submit. Plus Core Web Vitals (LCP, CLS, TBT) and the top opportunities Lighthouse flagged.",
    },
    {
      icon: Eye,
      eyebrow: "Visual evidence",
      title: "Desktop + mobile, full-page, side by side.",
      body:
        "We render your site in a real headless Chromium and capture every pixel a visitor would see. Toggle viewport. Toggle full-page. Overlay axe-core WCAG violations as red boxes on the elements that fail.",
    },
    {
      icon: Sparkles,
      eyebrow: "AI vision roast",
      title: "A second opinion from an AI that looked at the screenshot.",
      body:
        "The Roaster sees the rendered page and writes three sharp paragraphs about what's working, what's losing you customers, and the one fix that would move the needle this week. Powered by free-tier LLMs with a tasteful templated fallback when they're maxed out.",
    },
    {
      icon: FileText,
      eyebrow: "Premium PDF",
      title: "A report you can hand to a client.",
      body:
        "Score card, screenshots, Lighthouse panel, per-page thumbnails for every URL we discovered, full check breakdown — exported as a clean selectable-text PDF.",
    },
  ];

  return (
    <div className="mt-32">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VIEWPORT}
        transition={{ duration: 0.6, ease: EASE }}
        className="text-center mb-12"
      >
        <div className="text-xs uppercase tracking-widest text-ember-400 mb-3">
          What you get
        </div>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
          Four layers of evidence,
          <br />
          <span className="text-zinc-500">delivered in 30 seconds.</span>
        </h2>
      </motion.div>
      <div className="space-y-4">
        {rows.map((r, i) => (
          <motion.div
            key={r.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.6, ease: EASE, delay: i * 0.06 }}
            className="glass rounded-3xl p-6 md:p-8 grid md:grid-cols-[auto_1fr] gap-5 items-start"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-ember-500/20 to-red-600/20 border border-ember-500/30 flex items-center justify-center shrink-0">
              <r.icon className="w-6 h-6 text-ember-400" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-ember-400 mb-1.5">
                {r.eyebrow}
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-zinc-100 mb-2">
                {r.title}
              </h3>
              <p className="text-zinc-400 leading-relaxed max-w-3xl">{r.body}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Drop a URL",
      body: "Yours or your competitor's. No login. No credit card. No setup.",
    },
    {
      n: "02",
      title: "We audit, capture, score",
      body: "Lighthouse runs. Headless browser captures the page. axe-core scans WCAG. Five pages on average.",
    },
    {
      n: "03",
      title: "You get the verdict",
      body: "Score, screenshots, AI roast, full PDF — all in one place. Share, embed the badge, or fix what we found.",
    },
  ];
  return (
    <div className="mt-32">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VIEWPORT}
        transition={{ duration: 0.6, ease: EASE }}
        className="text-center mb-12"
      >
        <div className="text-xs uppercase tracking-widest text-ember-400 mb-3">
          How it works
        </div>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
          Three steps. Zero friction.
        </h2>
      </motion.div>
      <div className="grid md:grid-cols-3 gap-4">
        {steps.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.5, ease: EASE, delay: i * 0.08 }}
            className="glass rounded-3xl p-6 relative overflow-hidden"
          >
            <div className="absolute -top-2 -right-2 text-7xl font-black text-zinc-900 select-none">
              {s.n}
            </div>
            <div className="relative">
              <div className="text-xs uppercase tracking-widest text-ember-400 mb-3">
                Step {s.n}
              </div>
              <h3 className="text-xl font-bold text-zinc-100 mb-2">{s.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{s.body}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function CompareTeaser() {
  return (
    <motion.a
      href="/compare"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.6, ease: EASE }}
      whileHover={{ y: -2 }}
      className="mt-24 relative block rounded-3xl overflow-hidden bg-gradient-to-br from-violet-600/40 via-indigo-600/30 to-blue-600/40 p-[1px] cursor-pointer"
    >
      <div className="rounded-3xl bg-zinc-950 p-8 md:p-10 grid md:grid-cols-[1fr_auto] gap-6 items-center">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Swords className="w-4 h-4 text-violet-300" />
            <span className="text-xs uppercase tracking-widest text-violet-300 font-semibold">
              Head to head
            </span>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold mb-2 text-zinc-100">
            You vs. your top competitor.
          </h3>
          <p className="text-zinc-400 leading-relaxed">
            Pit two sites against each other. Real Lighthouse on both,
            side-by-side screenshots, category-by-category winner, and a
            ready-to-tweet bragging line.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-violet-500/20 border border-violet-500/40 text-violet-200 font-semibold text-sm whitespace-nowrap">
          Try compare mode
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </motion.a>
  );
}

function Faq() {
  const items = [
    {
      q: "Is it really free?",
      a: "Yes. No paywall, no email gate, no rate limit you'll hit on a normal day. Affiliate links to tools that fix the issues we find are how this stays free.",
    },
    {
      q: "What does the audit actually do with my URL?",
      a: "Your URL gets sent to Google's PageSpeed Insights API (same API powers pagespeed.web.dev), our headless browser to capture screenshots, and a free-tier AI provider (Groq or Gemini) for the roast text. Nothing is stored on our servers. Your scan history lives only in your browser's localStorage — clear cookies and it's gone.",
    },
    {
      q: "How is this different from PageSpeed Insights?",
      a: "PSI gives you Lighthouse numbers. We give you Lighthouse plus full-page screenshots (desktop + mobile), AI vision commentary on the rendered page, axe-core WCAG violations with element overlays, multi-page discovery (up to 10 pages), social-card preview, security headers grade, domain age, online presence audit — and a downloadable PDF report.",
    },
    {
      q: "Can I scan more than the homepage?",
      a: "Yes. The scanner discovers up to four additional pages from your sitemap.xml and homepage links — typically /pricing, /about, /contact, /services. Each gets its own audit and screenshot.",
    },
    {
      q: "Can I embed my score on my site?",
      a: "Yes, if you score a B or higher. There's an SVG badge generator + copyable HTML/Markdown embed. The badge links back to your full audit.",
    },
    {
      q: "What if my site scores badly?",
      a: "You get the exact failures, the fix hints for each, and recommended tools to fix them. If you'd rather pay a pro, there's a 'Hire someone' CTA that goes straight to Josh's Lead Flow team.",
    },
  ];
  return (
    <div className="mt-32">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VIEWPORT}
        transition={{ duration: 0.6, ease: EASE }}
        className="text-center mb-12"
      >
        <div className="text-xs uppercase tracking-widest text-ember-400 mb-3">
          Common questions
        </div>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
          The answers you&apos;re about to ask.
        </h2>
      </motion.div>
      <div className="max-w-3xl mx-auto space-y-3">
        {items.map((item, i) => (
          <FaqItem key={item.q} q={item.q} a={item.a} index={i} />
        ))}
      </div>
    </div>
  );
}

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.5, ease: EASE, delay: index * 0.04 }}
      className="glass rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-zinc-900/30 transition-colors cursor-pointer"
      >
        <span className="text-base md:text-lg font-semibold text-zinc-100">
          {q}
        </span>
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="shrink-0 text-ember-400"
        >
          <PlusCircle className="w-5 h-5" />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{
          height: open ? "auto" : 0,
          opacity: open ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: EASE }}
        className="overflow-hidden"
      >
        <div className="px-5 pb-5 text-zinc-400 leading-relaxed text-[15px]">
          {a}
        </div>
      </motion.div>
    </motion.div>
  );
}

function ClosingCta({ onScan }: { onScan: (u: string) => void }) {
  const [url, setUrl] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [sug, setSug] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const result = validateUrlInput(url);
    if (!result.ok) {
      setErr(result.error);
      setSug(result.suggestion || null);
      return;
    }
    setErr(null);
    setSug(null);
    onScan(result.url);
  }

  function useSuggestion() {
    if (!sug) return;
    setUrl(sug);
    setErr(null);
    setSug(null);
    onScan(sug);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.7, ease: EASE }}
      className="mt-32 relative rounded-3xl overflow-hidden text-center py-20 px-6"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-ember-600/15 via-red-600/10 to-transparent" />
      <div
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 mx-auto w-[800px] h-[400px] rounded-full blur-3xl opacity-40 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(249,115,22,0.5) 0%, transparent 70%)",
        }}
      />
      <div className="relative">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ember-500/10 border border-ember-500/30 text-xs text-ember-300 mb-6">
          <Award className="w-3 h-3" />
          Built for honest answers
        </div>
        <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-5 leading-tight">
          Find out what
          <br />
          <span className="bg-gradient-to-br from-ember-300 via-ember-500 to-red-600 bg-clip-text text-transparent">
            your visitors really see.
          </span>
        </h2>
        <p className="text-lg text-zinc-400 mb-10 max-w-xl mx-auto">
          One URL. 30 seconds. No login. No email. Just the truth, and the
          tools to fix it.
        </p>
        <form
          onSubmit={submit}
          className="max-w-xl mx-auto flex flex-col sm:flex-row gap-2"
        >
          <input
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (err) { setErr(null); setSug(null); }
            }}
            placeholder="yourbusiness.com"
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            className="flex-1 bg-zinc-950/80 border border-zinc-800 focus:border-ember-500/40 rounded-xl px-4 py-3.5 outline-none transition-colors text-zinc-100 placeholder:text-zinc-600"
          />
          <motion.button
            type="submit"
            disabled={!url.trim()}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-br from-ember-500 to-red-600 hover:from-ember-400 hover:to-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold cursor-pointer shadow-lg shadow-ember-900/30 transition-all"
          >
            Roast it
            <Zap className="w-4 h-4" />
          </motion.button>
        </form>
        {err && (
          <div className="mt-3 flex items-center justify-center gap-2 text-sm">
            <span className="text-zinc-300">{err}</span>
            {sug && (
              <button
                type="button"
                onClick={useSuggestion}
                className="ml-2 px-2.5 py-1 rounded-md bg-ember-500/15 border border-ember-500/40 text-ember-300 hover:bg-ember-500/25 text-xs font-semibold cursor-pointer"
              >
                Use {sug}
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
