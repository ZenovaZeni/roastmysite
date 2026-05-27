"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { AuditResult } from "@/lib/audit";
import { Award, Copy, Check, X, Sun, Moon, Download, Loader2 } from "lucide-react";

export function BadgeSection({ result }: { result: AuditResult }) {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const isAGrade = result.score >= 80 && result.grade === "A";

  // Only worth promoting if score is decent
  if (result.score < 65) return null;

  const downloadCertificate = async () => {
    setDownloading(true);
    try {
      const res = await fetch("/api/certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audit: result }),
      });
      if (!res.ok) {
        alert("Certificate download failed.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const host = new URL(result.url).hostname.replace(/[^a-z0-9.-]/gi, "_");
      a.download = `rms-certificate-${host}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
      <div>
        <div className="font-semibold text-zinc-100 mb-1 flex items-center gap-2">
          <Award className="w-4 h-4 text-ember-400" />
          You scored a {result.grade}. Show it off.
        </div>
        <p className="text-sm text-zinc-500 max-w-xl">
          {isAGrade
            ? "Grab a free embed badge AND a Web Excellence Certificate (PDF, suitable for framing or pinning to your portfolio)."
            : "Grab a free embed badge. Visitors who click it land on your audit — proof your site is faster / more accessible / better-built than your competitors."}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        {isAGrade && (
          <motion.button
            onClick={downloadCertificate}
            whileTap={{ scale: 0.97 }}
            disabled={downloading}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-black font-semibold text-sm cursor-pointer shadow-lg shadow-amber-900/30 whitespace-nowrap disabled:opacity-50"
          >
            {downloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {downloading ? "Generating…" : "Get certificate"}
          </motion.button>
        )}
        <motion.button
          onClick={() => setOpen(true)}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-br from-ember-500 to-red-600 hover:from-ember-400 hover:to-red-500 text-black font-semibold text-sm cursor-pointer shadow-lg shadow-ember-900/30 whitespace-nowrap"
        >
          <Award className="w-4 h-4" />
          Get my badge
        </motion.button>
      </div>

      {open && (
        <BadgeModal
          result={result}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

function BadgeModal({
  result,
  onClose,
}: {
  result: AuditResult;
  onClose: () => void;
}) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [copied, setCopied] = useState<"html" | "md" | null>(null);

  // Build the badge URL. Origin assumed same as the visitor.
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://roastmysite.dev";
  const badgeUrl = `${origin}/api/badge?score=${result.score}&grade=${result.grade}&theme=${theme}`;
  // Audit URL re-scans the same site (no persistence — visitors hit the audit fresh)
  const auditUrl = `${origin}/?url=${encodeURIComponent(result.url)}`;

  const htmlEmbed = `<a href="${auditUrl}" target="_blank" rel="noopener">
  <img src="${badgeUrl}" alt="RoastMySite Score ${result.score}/100" width="240" height="72" />
</a>`;

  const mdEmbed = `[![RoastMySite Score ${result.score}/100](${badgeUrl})](${auditUrl})`;

  const copy = async (text: string, which: "html" | "md") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // ignore
    }
  };

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
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, y: 12, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-2xl"
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 bg-zinc-900/50">
          <div>
            <div className="text-xs uppercase tracking-widest text-ember-400">
              Embed badge
            </div>
            <div className="text-sm text-zinc-200 font-medium">
              Free backlink to your audit
            </div>
          </div>
          <motion.button
            onClick={onClose}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-800 hover:border-zinc-700 text-sm text-zinc-300 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>

        <div className="p-6 space-y-5">
          {/* Preview */}
          <div
            className={`rounded-xl border p-8 flex items-center justify-center ${
              theme === "dark"
                ? "bg-[#0A0908] border-zinc-800"
                : "bg-white border-zinc-300"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={badgeUrl}
              alt="Your RoastMySite badge"
              width={240}
              height={72}
            />
          </div>

          {/* Theme toggle */}
          <div className="flex items-center gap-1 p-1 bg-zinc-900/60 rounded-lg border border-zinc-800 w-fit">
            <button
              onClick={() => setTheme("dark")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors cursor-pointer ${
                theme === "dark"
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Moon className="w-3.5 h-3.5" /> Dark
            </button>
            <button
              onClick={() => setTheme("light")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors cursor-pointer ${
                theme === "light"
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Sun className="w-3.5 h-3.5" /> Light
            </button>
          </div>

          {/* HTML embed */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-widest text-zinc-500">
                HTML embed
              </span>
              <button
                onClick={() => copy(htmlEmbed, "html")}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-zinc-800 hover:border-ember-500/40 text-xs text-zinc-300 cursor-pointer"
              >
                {copied === "html" ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <pre className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-300 overflow-x-auto font-mono leading-relaxed">
              <code>{htmlEmbed}</code>
            </pre>
          </div>

          {/* Markdown */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-widest text-zinc-500">
                Markdown (for GitHub README, blog)
              </span>
              <button
                onClick={() => copy(mdEmbed, "md")}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-zinc-800 hover:border-ember-500/40 text-xs text-zinc-300 cursor-pointer"
              >
                {copied === "md" ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <pre className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-300 overflow-x-auto font-mono leading-relaxed">
              <code>{mdEmbed}</code>
            </pre>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
