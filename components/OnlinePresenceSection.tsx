"use client";
import { motion } from "framer-motion";
import type { AuditResult } from "@/lib/audit";
import { PLATFORM_LABEL, type Platform } from "@/lib/online-presence";
import {
  Globe2,
  Check,
  X as XIcon,
  ExternalLink,
  Phone,
  MapPin,
  Mail,
  AlertTriangle,
} from "lucide-react";
import { BRAND_ICON, BRAND_COLOR } from "./BrandIcons";

const EASE = [0.22, 1, 0.36, 1] as const;

// Brand-accurate icons + colors are imported from ./BrandIcons (sourced from Simple Icons)

export function OnlinePresenceSection({ result }: { result: AuditResult }) {
  const op = result.onlinePresence;
  if (!op) return null;

  const isServiceBusiness = result.siteType?.type === "service-business";
  const isPresenceScoreApplicable = isServiceBusiness;
  const presenceColor =
    op.presenceScore >= 75
      ? "#22c55e"
      : op.presenceScore >= 50
      ? "#eab308"
      : op.presenceScore >= 25
      ? "#f97316"
      : "#ef4444";

  return (
    <div>
      <div className="flex items-baseline justify-between flex-wrap gap-3 mb-6">
        <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
          <Globe2 className="w-5 h-5 text-ember-400" />
          {isPresenceScoreApplicable
            ? "Your online presence beyond the website"
            : "Linked profiles found on this page"}
        </h2>
        {isPresenceScoreApplicable ? (
          <div
            className="text-xs uppercase tracking-widest px-2 py-1 rounded-full font-semibold"
            style={{
              background: presenceColor + "22",
              color: presenceColor,
              border: `1px solid ${presenceColor}55`,
            }}
          >
            Presence {op.presenceScore}/100
          </div>
        ) : (
          <div className="text-xs uppercase tracking-widest px-2 py-1 rounded-full font-semibold bg-zinc-900/70 text-zinc-400 border border-zinc-800">
            Linked {op.profilesFound.length}/{op.platformsChecked.length}
          </div>
        )}
      </div>

      <p className="text-sm text-zinc-500 mb-6 max-w-3xl">
        {isPresenceScoreApplicable
          ? "Your website is one piece. Customers also check your social profiles, Google listing, and reviews. Here's what we found linked from the page."
          : "This only checks social/profile links exposed in the page HTML. For marketplaces, platforms, docs, blogs, and large e-commerce sites, missing footer links are not a web-presence failure."}
      </p>

      {/* Social platforms grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {op.platformsChecked.map((p, i) => {
          const found = op.profilesFound.find((f) => f.platform === p);
          return (
            <PlatformTile
              key={p}
              platform={p}
              found={!!found}
              url={found?.url}
              index={i}
              critical={isServiceBusiness && (p === "facebook" || p === "yelp")}
            />
          );
        })}
      </div>

      {/* Contact signals row */}
      <div className="glass rounded-2xl p-5 mb-6">
        <div className="text-xs uppercase tracking-widest text-zinc-500 mb-4">
          {isServiceBusiness
            ? "Contact signals on the page"
            : "Contact signals exposed on the page"}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <SignalRow
            icon={Phone}
            label="Tap-to-call link"
            found={op.hasTapToCall}
            criticalIfMissing={isServiceBusiness}
          />
          <SignalRow
            icon={Mail}
            label="Email link"
            found={op.hasMailtoLink}
            criticalIfMissing={false}
          />
          <SignalRow
            icon={MapPin}
            label="Google Maps embed"
            found={op.hasMapEmbed}
            criticalIfMissing={isServiceBusiness}
          />
        </div>
      </div>

      {/* Quick-link audits (no API needed — opens search) */}
      {isServiceBusiness && (
      <div>
        <div className="text-xs uppercase tracking-widest text-zinc-500 mb-3">
          Check these yourself (we can&apos;t see them from the website alone)
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {op.quickLinks.map((link, i) => (
            <motion.a
              key={link.key}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.05, duration: 0.35, ease: EASE }}
              whileHover={{ y: -2 }}
              className="group glass rounded-2xl p-4 flex items-start gap-3 hover:border-ember-500/30 transition-colors cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-ember-500/10 border border-ember-500/30 flex items-center justify-center shrink-0">
                <ExternalLink className="w-4 h-4 text-ember-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-zinc-100 mb-0.5">
                  {link.label}
                </div>
                <div className="text-xs text-zinc-400 leading-relaxed">
                  {link.description}
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
      )}
    </div>
  );
}

function PlatformTile({
  platform,
  found,
  url,
  index,
  critical,
}: {
  platform: Platform;
  found: boolean;
  url?: string;
  index: number;
  critical: boolean;
}) {
  const Icon = BRAND_ICON[platform];
  const accent = BRAND_COLOR[platform];

  if (found) {
    return (
      <motion.a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ delay: index * 0.04, duration: 0.35, ease: EASE }}
        whileHover={{ y: -2 }}
        className="group glass rounded-2xl p-4 hover:border-ember-500/30 transition-colors cursor-pointer"
      >
        <div className="flex items-center justify-between mb-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: accent + "22", border: `1px solid ${accent}55` }}
          >
            <Icon size={18} />
          </div>
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <Check className="w-3 h-3 text-emerald-400" strokeWidth={3} />
          </div>
        </div>
        <div className="text-sm font-semibold text-zinc-100">
          {PLATFORM_LABEL[platform]}
        </div>
        <div className="text-[10px] text-zinc-500 truncate mt-0.5">Linked ✓</div>
      </motion.a>
    );
  }

  // Missing
  const borderClass = critical
    ? "border-red-500/20 hover:border-red-500/40"
    : "border-zinc-800 hover:border-zinc-700";
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: EASE }}
      className={`glass rounded-2xl p-4 border ${borderClass} transition-colors`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center opacity-40">
          <Icon size={18} monoColor="#52525B" />
        </div>
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center ${
            critical
              ? "bg-red-500/20 border border-red-500/40"
              : "bg-zinc-800 border border-zinc-700"
          }`}
        >
          <XIcon className={`w-3 h-3 ${critical ? "text-red-400" : "text-zinc-500"}`} strokeWidth={3} />
        </div>
      </div>
      <div className="text-sm font-semibold text-zinc-300">
        {PLATFORM_LABEL[platform]}
      </div>
      <div
        className={`text-[10px] mt-0.5 flex items-center gap-1 ${
          critical ? "text-red-400" : "text-zinc-500"
        }`}
      >
        {critical && <AlertTriangle className="w-2.5 h-2.5" />}
        {critical ? "Missing — add one" : "Not linked"}
      </div>
    </motion.div>
  );
}

function SignalRow({
  icon: Icon,
  label,
  found,
  criticalIfMissing,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  found: boolean;
  criticalIfMissing: boolean;
}) {
  const color = found
    ? "text-emerald-400"
    : criticalIfMissing
    ? "text-red-400"
    : "text-zinc-500";
  return (
    <div className="flex items-center gap-2">
      <Icon className={`w-4 h-4 ${color}`} />
      <span className="text-sm text-zinc-300">{label}</span>
      {found ? (
        <Check className="w-3.5 h-3.5 text-emerald-400 ml-auto" strokeWidth={3} />
      ) : (
        <XIcon
          className={`w-3.5 h-3.5 ml-auto ${
            criticalIfMissing ? "text-red-400" : "text-zinc-600"
          }`}
          strokeWidth={3}
        />
      )}
    </div>
  );
}
