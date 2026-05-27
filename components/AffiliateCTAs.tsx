"use client";
import { useMemo } from "react";
import { motion } from "framer-motion";
import type { AuditResult } from "@/lib/audit";
import {
  recommendTools,
  type AffiliateTool,
  type RecommendationGroup,
} from "@/lib/affiliates";
import { BRAND } from "@/lib/brand";
import {
  ExternalLink,
  ArrowRight,
  Wrench,
  Server,
  LayoutGrid,
  ShoppingCart,
  Search,
  Zap,
  Image as ImageIcon,
  FormInput,
  Mail,
  BarChart3,
  Shield,
  Accessibility,
  Sparkles,
  Calendar,
  Star,
  Globe,
  Sparkle,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  hosting: Server,
  "site-builder": LayoutGrid,
  ecommerce: ShoppingCart,
  seo: Search,
  speed: Zap,
  images: ImageIcon,
  forms: FormInput,
  email: Mail,
  analytics: BarChart3,
  security: Shield,
  accessibility: Accessibility,
  "ai-builder": Sparkles,
  booking: Calendar,
  reviews: Star,
  domain: Globe,
  service: Wrench,
};

const BADGE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  "best-pick": {
    bg: "bg-ember-500/15 border-ember-500/40",
    text: "text-ember-300",
    label: "Best pick",
  },
  trending: {
    bg: "bg-violet-500/15 border-violet-500/40",
    text: "text-violet-300",
    label: "Trending",
  },
  free: {
    bg: "bg-emerald-500/15 border-emerald-500/40",
    text: "text-emerald-300",
    label: "Free",
  },
  premium: {
    bg: "bg-sky-500/15 border-sky-500/40",
    text: "text-sky-300",
    label: "Premium",
  },
};

const TIER_LABEL: Record<string, string> = {
  free: "Free",
  budget: "Budget",
  premium: "Premium",
};

export function AffiliateCTAs({ result }: { result: AuditResult }) {
  const groups = useMemo(() => recommendTools(result), [result]);

  return (
    <div className="space-y-12">
      <LeadFlowCTA result={result} />
      {groups.length > 0 && <RecommendationGroups groups={groups} />}
      <ShareBlock url={result.url} score={result.score} />
    </div>
  );
}

function LeadFlowCTA({ result }: { result: AuditResult }) {
  const score = result.score;
  const fullRebuild = score < 50;

  const headline = fullRebuild
    ? "This site needs more than tweaks. Want a pro to handle it?"
    : score < 75
    ? "Want these fixed for you this week?"
    : "Want to squeeze the last 20 points?";

  return (
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-ember-600 via-red-600 to-rose-700 p-[1px]">
      <div className="rounded-3xl bg-zinc-950 p-8 md:p-10">
        <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Wrench className="w-4 h-4 text-ember-400" />
              <span className="text-xs uppercase tracking-widest text-ember-400 font-semibold">
                Lead Flow · Brevard County, FL
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-3 text-zinc-100">
              {headline}
            </h3>
            <p className="text-zinc-400 leading-relaxed max-w-xl">
              I&apos;m Josh. I run a small team that fixes exactly what this
              audit just exposed — for local service businesses. Flat-rate, no
              monthly contracts, done in 7 days or your money back.
            </p>
          </div>
          <motion.a
            href={BRAND.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 px-6 py-4 rounded-xl bg-white text-black font-semibold hover:bg-zinc-200 whitespace-nowrap cursor-pointer"
          >
            Book a free walk-through
            <ArrowRight className="w-4 h-4" />
          </motion.a>
        </div>
      </div>
    </div>
  );
}

function RecommendationGroups({ groups }: { groups: RecommendationGroup[] }) {
  return (
    <div>
      <div className="flex items-baseline justify-between flex-wrap gap-3 mb-6">
        <h3 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
          <Sparkle className="w-5 h-5 text-ember-400" />
          Tools that fix exactly what we found
        </h3>
        <span className="text-xs text-zinc-600 max-w-md text-right">
          Picked from a library of {groups.reduce((s, g) => s + g.tools.length, 0) + 25}+ tools.
          Affiliate links — using them keeps RoastMySite free.
        </span>
      </div>
      <div className="space-y-10">
        {groups.map((g, i) => (
          <CategoryBlock key={g.category} group={g} index={i} />
        ))}
      </div>
    </div>
  );
}

function CategoryBlock({ group, index }: { group: RecommendationGroup; index: number }) {
  const Icon = CATEGORY_ICONS[group.category] || Wrench;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-ember-500/10 border border-ember-500/30 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-ember-400" />
        </div>
        <div>
          <h4 className="text-lg font-semibold text-zinc-100">{group.title}</h4>
          <p className="text-sm text-zinc-400 mt-0.5">{group.reason}</p>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        {group.tools.map((tool, i) => (
          <ToolCard key={tool.id} tool={tool} index={i} />
        ))}
      </div>
    </motion.div>
  );
}

function ToolCard({ tool, index }: { tool: AffiliateTool; index: number }) {
  const badge = tool.badge ? BADGE_STYLES[tool.badge] : null;
  return (
    <motion.a
      href={tool.url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.06 }}
      whileHover={{ y: -3 }}
      className="group glass rounded-2xl p-5 hover:border-ember-500/40 transition-colors flex flex-col"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="font-semibold text-zinc-100">{tool.name}</div>
        {badge && (
          <span
            className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border ${badge.bg} ${badge.text} whitespace-nowrap`}
          >
            {badge.label}
          </span>
        )}
      </div>
      <p className="text-sm text-zinc-400 leading-relaxed mb-3 flex-1">
        {tool.oneLiner}
      </p>
      <p className="text-xs text-zinc-500 italic leading-relaxed mb-4 line-clamp-3">
        {tool.pitch}
      </p>
      <div className="flex items-center justify-between text-xs text-zinc-500 pt-3 border-t border-zinc-900">
        <span className="uppercase tracking-wider">{TIER_LABEL[tool.tier]}</span>
        <span className="text-ember-400 group-hover:text-ember-300 inline-flex items-center gap-1">
          Visit
          <ExternalLink className="w-3 h-3" />
        </span>
      </div>
    </motion.a>
  );
}

function ShareBlock({ url, score }: { url: string; score: number }) {
  const text = `I just got a ${score}/100 on RoastMySite. Brutal. Try yours →`;
  return (
    <div className="glass rounded-2xl p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
      <div>
        <div className="font-semibold text-zinc-100 mb-1">Share your score</div>
        <p className="text-sm text-zinc-500">
          Bonus points if it&apos;s lower than your competitor&apos;s.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <ShareButton
          label="X / Twitter"
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
            text + " " + url
          )}`}
        />
        <ShareButton
          label="Copy"
          onClick={() => {
            if (typeof navigator !== "undefined") {
              navigator.clipboard.writeText(
                `${text} ${typeof window !== "undefined" ? window.location.origin : ""}`
              );
            }
          }}
        />
      </div>
    </div>
  );
}

function ShareButton({
  label,
  href,
  onClick,
}: {
  label: string;
  href?: string;
  onClick?: () => void;
}) {
  const cls =
    "px-4 py-2 rounded-lg border border-zinc-800 hover:border-ember-500/40 text-sm text-zinc-300 transition-colors cursor-pointer";
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {label}
    </a>
  ) : (
    <button onClick={onClick} className={cls}>
      {label}
    </button>
  );
}
