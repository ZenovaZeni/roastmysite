"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Footer } from "./Footer";
import { LogoMark } from "./Logo";
import { BRAND } from "@/lib/brand";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Briefcase,
  Wrench,
  GitBranch,
  Camera,
  Mic,
  Flame,
  ExternalLink,
  Mail,
  Calendar,
  type LucideIcon,
} from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;
const VIEWPORT = { once: true, amount: 0.3 };

type Project = {
  name: string;
  tagline: string;
  status: "live" | "beta" | "building" | "parked";
  description: string;
  icon: LucideIcon;
  accent: string;
  url?: string;
  internal?: boolean;
};

const PROJECTS: Project[] = [
  {
    name: "RoastMySite",
    tagline: "Brutally honest website audits, free.",
    status: "live",
    description:
      "Real Lighthouse + multi-page audit + AI vision roast + premium PDF report. Free forever. Built for small business owners who heard their site is bad but don't know why.",
    icon: Flame,
    accent: "#F97316",
    url: "/",
    internal: true,
  },
  {
    name: "JobBlitz",
    tagline: "AI packet factory for job seekers.",
    status: "building",
    description:
      "Drop a job description, get a tailored resume + cover letter + STAR interview prep in one pass. The flagship Zenova product. Pre-launch — birthday-deadline September 2026.",
    icon: Briefcase,
    accent: "#3B82F6",
  },
  {
    name: "Lead Flow",
    tagline: "Lead-gen systems for service businesses.",
    status: "live",
    description:
      "Built for Brevard County, FL trades, contractors, and service businesses. Custom audits, walk-in evidence packs, automated outreach. The sister product to RoastMySite — when free isn't enough, this is what fixes it.",
    icon: Wrench,
    accent: "#EAB308",
  },
  {
    name: "ForkFirst",
    tagline: "Chat-first GitHub repo discovery.",
    status: "live",
    description:
      "Find and fork the right repo for your AI-building workflow (Claude Code, Cursor, Lovable). Generates a handoff packet so your AI builder knows what they're working with. Free forever, BYOK.",
    icon: GitBranch,
    accent: "#10B981",
    url: "https://forkfirst.vercel.app",
  },
  {
    name: "RealFrame",
    tagline: "AI listing studio for realtors + investors.",
    status: "building",
    description:
      "Turn raw property photos into MLS-ready listings with AI staging, captioning, and walkthrough copy. v2 vision: 3D walkthroughs from phone video via Gaussian Splatting.",
    icon: Camera,
    accent: "#8B5CF6",
  },
  {
    name: "YellFlow",
    tagline: "Local-first dictation that knows your vocabulary.",
    status: "beta",
    description:
      "Whisper-based dictation app that learns your proper nouns from your second-brain notes — so your business names, products, and jargon get transcribed correctly the first time.",
    icon: Mic,
    accent: "#EC4899",
  },
];

const STATUS_LABEL: Record<Project["status"], string> = {
  live: "Live",
  beta: "Beta",
  building: "Building",
  parked: "Parked",
};

const STATUS_COLOR: Record<Project["status"], string> = {
  live: "#22c55e",
  beta: "#84cc16",
  building: "#eab308",
  parked: "#71717a",
};

export function ZenovaPortfolio() {
  return (
    <div className="min-h-screen relative overflow-x-hidden noise">
      <BackgroundGlow />
      <Nav />

      <main className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <Hero />
        <Projects />
        <Service />
        <Cta />
      </main>

      <Footer />
    </div>
  );
}

// ============================================================================

function Nav() {
  return (
    <nav className="relative z-20 max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
      <Link href="/" className="group flex items-center gap-2 cursor-pointer">
        <LogoMark size={36} withGlow />
        <span className="text-lg font-semibold tracking-tight">
          Roast<span className="text-ember-400">My</span>Site
        </span>
      </Link>
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-ember-300 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to the audit
      </Link>
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
            "radial-gradient(circle, rgba(249,115,22,0.5) 0%, rgba(220,38,38,0.25) 40%, transparent 70%)",
        }}
      />
    </>
  );
}

// ============================================================================

function Hero() {
  return (
    <div className="pt-12 md:pt-20 text-center max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300 mb-8"
      >
        <Sparkles className="w-3 h-3 text-ember-400" />
        Zenova AI · Brevard County, FL
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.05 }}
        className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05] mb-6"
      >
        Free tools and
        <br />
        <span className="bg-gradient-to-br from-ember-300 via-ember-500 to-red-600 bg-clip-text text-transparent">
          systems that actually fix things.
        </span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed"
      >
        I&apos;m Josh Douglas. I build AI products and lead-gen systems for
        service businesses. Some are free tools that surface real problems
        ({BRAND.name}, ForkFirst). Some are paid systems that solve them
        (Lead Flow). All run under Zenova AI.
      </motion.p>
    </div>
  );
}

// ============================================================================

function Projects() {
  return (
    <div className="mt-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VIEWPORT}
        transition={{ duration: 0.6, ease: EASE }}
        className="flex items-baseline justify-between mb-8"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-zinc-100">
          The product line
        </h2>
        <span className="text-xs uppercase tracking-widest text-zinc-500">
          {PROJECTS.length} active
        </span>
      </motion.div>
      <div className="grid md:grid-cols-2 gap-4">
        {PROJECTS.map((p, i) => (
          <ProjectCard key={p.name} project={p} index={i} />
        ))}
      </div>
    </div>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const Icon = project.icon;
  const isClickable = !!project.url;
  const Wrapper = isClickable
    ? ({ children }: { children: React.ReactNode }) =>
        project.internal ? (
          <Link href={project.url!} className="block cursor-pointer">
            {children}
          </Link>
        ) : (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block cursor-pointer"
          >
            {children}
          </a>
        )
    : ({ children }: { children: React.ReactNode }) => <div>{children}</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.5, ease: EASE, delay: index * 0.06 }}
      whileHover={isClickable ? { y: -3 } : undefined}
    >
      <Wrapper>
        <div
          className={`glass rounded-3xl p-6 md:p-7 h-full transition-colors ${
            isClickable ? "hover:border-ember-500/30" : ""
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: project.accent + "22",
                border: `1px solid ${project.accent}55`,
              }}
            >
              <Icon className="w-6 h-6" style={{ color: project.accent }} />
            </div>
            <span
              className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full font-semibold"
              style={{
                background: STATUS_COLOR[project.status] + "22",
                color: STATUS_COLOR[project.status],
                border: `1px solid ${STATUS_COLOR[project.status]}55`,
              }}
            >
              {STATUS_LABEL[project.status]}
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-zinc-100 mb-2 flex items-center gap-2">
            {project.name}
            {isClickable && !project.internal && (
              <ExternalLink className="w-4 h-4 text-zinc-500" />
            )}
          </h3>
          <div className="text-sm font-semibold text-zinc-300 mb-3">
            {project.tagline}
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {project.description}
          </p>
        </div>
      </Wrapper>
    </motion.div>
  );
}

// ============================================================================

function Service() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.6, ease: EASE }}
      className="mt-24 relative rounded-3xl overflow-hidden bg-gradient-to-br from-ember-600/40 via-red-600/30 to-rose-700/40 p-[1px]"
    >
      <div className="rounded-3xl bg-zinc-950 p-8 md:p-12">
        <div className="grid md:grid-cols-[1fr_auto] gap-6 items-end">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Wrench className="w-4 h-4 text-ember-400" />
              <span className="text-xs uppercase tracking-widest text-ember-400 font-semibold">
                What you can hire me for
              </span>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold mb-3 text-zinc-100 leading-tight">
              Lead Flow audits + automation
              <br />
              <span className="text-zinc-500">for local service businesses.</span>
            </h3>
            <p className="text-zinc-400 leading-relaxed max-w-2xl">
              Most service businesses (HVAC, plumbers, contractors,
              consultants) leak customers in three places: a slow website, an
              unclaimed Google Business Profile, and zero follow-up after a
              quote. I build the systems that plug all three. Flat rate. No
              contracts. Done in 7 days or refund.
            </p>
          </div>
          <motion.a
            href={BRAND.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15, ease: EASE }}
            className="inline-flex items-center gap-2 px-6 py-4 rounded-xl bg-white text-black font-semibold hover:bg-zinc-200 whitespace-nowrap cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            Book a free 15-min
            <ArrowRight className="w-4 h-4" />
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================

function Cta() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.7, ease: EASE }}
      className="mt-24 text-center py-16 px-6"
    >
      <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
        Want to work together?
      </h2>
      <p className="text-lg text-zinc-400 mb-8 max-w-xl mx-auto">
        Or just want to nerd out about AI, automation, or how to actually win
        on Google? Either works.
      </p>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <a
          href={BRAND.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-br from-ember-500 to-red-600 hover:from-ember-400 hover:to-red-500 text-black font-semibold text-sm shadow-lg shadow-ember-900/30 cursor-pointer"
        >
          <Calendar className="w-4 h-4" />
          Book a call
        </a>
        <a
          href="https://youtube.com/@joshdouglasbuilds"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-zinc-800 hover:border-ember-500/40 text-zinc-300 hover:text-ember-300 text-sm cursor-pointer"
        >
          Watch what I&apos;m building
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
      <div className="mt-8 text-xs text-zinc-600">
        Zenova AI · {BRAND.authorHandle}
      </div>
    </motion.div>
  );
}
