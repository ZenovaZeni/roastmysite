"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import type { AuditResult } from "@/lib/audit";
import {
  FileText,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

const PAGE_TYPE_LABEL: Record<string, string> = {
  homepage: "Home",
  pricing: "Pricing",
  about: "About",
  contact: "Contact",
  services: "Services",
  features: "Features",
  blog: "Blog",
  product: "Product",
  other: "Page",
};

export function PagesSection({ result }: { result: AuditResult }) {
  const pages = result.pages;
  const [selected, setSelected] = useState<string | null>(
    pages && pages.length > 0 ? pages[0].url : null
  );

  if (!pages || pages.length === 0) return null;

  const okPages = pages.filter((p) => p.ok);
  if (okPages.length === 0) return null;

  const selectedPage = okPages.find((p) => p.url === selected) || okPages[0];

  return (
    <div>
      <div className="flex items-baseline justify-between flex-wrap gap-3 mb-6">
        <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
          <FileText className="w-5 h-5 text-ember-400" />
          We scanned {okPages.length + 1} pages on your site
        </h2>
        <span className="text-xs text-zinc-500">
          Discovered via sitemap.xml + homepage links
        </span>
      </div>

      <div className="grid md:grid-cols-[280px_1fr] gap-4">
        {/* Page list */}
        <div className="space-y-2">
          <PageListItem
            label="Home"
            score={result.score}
            url={result.url}
            isHomepage
            active={false}
            onClick={() => {}}
          />
          {okPages.map((p, i) => (
            <motion.div
              key={p.url}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 + i * 0.06 }}
            >
              <PageListItem
                label={PAGE_TYPE_LABEL[p.pageType] || "Page"}
                score={p.score}
                url={p.url}
                active={selectedPage.url === p.url}
                onClick={() => setSelected(p.url)}
              />
            </motion.div>
          ))}
        </div>

        {/* Selected page detail */}
        <motion.div
          key={selectedPage.url}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="glass rounded-2xl p-5"
        >
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase tracking-widest text-ember-400">
                  {PAGE_TYPE_LABEL[selectedPage.pageType] || "Page"}
                </span>
                <span
                  className={`text-xs uppercase tracking-widest font-semibold ${gradeColorClass(selectedPage.score)}`}
                >
                  Score {selectedPage.score}
                </span>
              </div>
              <a
                href={selectedPage.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-zinc-300 hover:text-ember-300 break-all inline-flex items-center gap-1"
              >
                {selectedPage.url}
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
          </div>

          {selectedPage.screenshot && (
            <div className="rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 mb-4 max-h-[280px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`data:image/jpeg;base64,${selectedPage.screenshot}`}
                alt={`Screenshot of ${PAGE_TYPE_LABEL[selectedPage.pageType]}`}
                className="w-full h-full object-cover object-top"
              />
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 mb-4">
            <PageStat label="Load" value={`${selectedPage.loadMs}ms`} />
            <PageStat label="Words" value={selectedPage.wordCount.toLocaleString()} />
            <PageStat label="Forms" value={String(selectedPage.forms)} />
          </div>

          {selectedPage.topIssues.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-widest text-zinc-500 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Top issues
              </div>
              <ul className="space-y-1.5">
                {selectedPage.topIssues.map((issue, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-zinc-300"
                  >
                    <span className="text-amber-400 mt-0.5 shrink-0">•</span>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {selectedPage.title && (
            <div className="mt-4 pt-4 border-t border-zinc-900 text-xs space-y-1.5">
              <Row k="Title" v={selectedPage.title} />
              <Row k="H1" v={selectedPage.h1 || "—"} />
              <Row k="Description" v={selectedPage.description || "—"} />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function PageListItem({
  label,
  score,
  url,
  active,
  onClick,
  isHomepage,
}: {
  label: string;
  score: number;
  url: string;
  active: boolean;
  onClick: () => void;
  isHomepage?: boolean;
}) {
  const pathname = (() => {
    try {
      return new URL(url).pathname || "/";
    } catch {
      return url;
    }
  })();

  return (
    <button
      onClick={onClick}
      disabled={isHomepage}
      className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors ${
        isHomepage
          ? "border-ember-500/30 bg-ember-500/5 cursor-default"
          : active
          ? "border-ember-500/40 bg-zinc-900/80 cursor-pointer"
          : "border-zinc-800 hover:border-zinc-700 cursor-pointer"
      }`}
    >
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold tabular-nums text-sm shrink-0 ${scoreBgClass(score)}`}
      >
        {score}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-zinc-200 flex items-center gap-2">
          {label}
          {isHomepage && (
            <span className="text-[9px] uppercase tracking-widest text-ember-400">
              Fully audited
            </span>
          )}
        </div>
        <div className="text-xs text-zinc-500 truncate font-mono">
          {pathname}
        </div>
      </div>
      {!isHomepage && (
        <ChevronRight
          className={`w-4 h-4 text-zinc-600 shrink-0 transition-transform ${
            active ? "rotate-90 text-ember-400" : ""
          }`}
        />
      )}
    </button>
  );
}

function PageStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-zinc-950/50 border border-zinc-900 rounded-lg p-2.5">
      <div className="text-[10px] uppercase tracking-widest text-zinc-500">
        {label}
      </div>
      <div className="text-base font-semibold tabular-nums text-zinc-100 mt-0.5">
        {value}
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-zinc-500 w-24 shrink-0">{k}</span>
      <span className="text-zinc-300 break-all line-clamp-2">{v}</span>
    </div>
  );
}

function scoreBgClass(s: number) {
  if (s >= 80) return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30";
  if (s >= 65) return "bg-lime-500/15 text-lime-300 border border-lime-500/30";
  if (s >= 50) return "bg-amber-500/15 text-amber-300 border border-amber-500/30";
  if (s >= 35) return "bg-orange-500/15 text-orange-300 border border-orange-500/30";
  return "bg-red-500/15 text-red-300 border border-red-500/30";
}

function gradeColorClass(s: number) {
  if (s >= 80) return "text-emerald-400";
  if (s >= 65) return "text-lime-400";
  if (s >= 50) return "text-amber-400";
  if (s >= 35) return "text-orange-400";
  return "text-red-400";
}
