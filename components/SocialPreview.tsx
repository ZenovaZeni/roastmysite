"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import type { AuditResult } from "@/lib/audit";
import { AlertTriangle, Share2, Apple, Twitter, Facebook } from "lucide-react";

type Platform = "imessage" | "twitter" | "facebook";

export function SocialPreviewSection({ result }: { result: AuditResult }) {
  const social = result.social;
  const [platform, setPlatform] = useState<Platform>("imessage");

  if (!social) return null;

  const hostname = (() => {
    try {
      return new URL(result.url).hostname.replace(/^www\./, "");
    } catch {
      return result.url;
    }
  })();

  const title = social.fallbackTitle || hostname;
  const description = social.fallbackDescription;
  const image = social.ogImage || social.twitterImage;
  const siteName = social.ogSiteName || hostname;

  return (
    <div>
      <div className="flex items-baseline justify-between flex-wrap gap-3 mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-zinc-100">
          <Share2 className="w-5 h-5 text-ember-400" />
          Your link, when someone shares it
        </h2>
        <div className="flex items-center gap-1 p-1 bg-zinc-900/60 rounded-lg border border-zinc-800 relative">
          <PlatformTab active={platform === "imessage"} onClick={() => setPlatform("imessage")} icon={<Apple className="w-3.5 h-3.5" />} label="iMessage / Slack" />
          <PlatformTab active={platform === "twitter"} onClick={() => setPlatform("twitter")} icon={<Twitter className="w-3.5 h-3.5" />} label="X / Twitter" />
          <PlatformTab active={platform === "facebook"} onClick={() => setPlatform("facebook")} icon={<Facebook className="w-3.5 h-3.5" />} label="Facebook" />
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_auto] gap-6 items-start">
        <motion.div
          key={platform}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {platform === "imessage" && (
            <IMessagePreview
              title={title}
              hostname={hostname}
              image={image}
              favicon={social.faviconUrl}
            />
          )}
          {platform === "twitter" && (
            <TwitterPreview
              title={title}
              description={description}
              hostname={hostname}
              image={image}
              cardType={social.twitterCard}
            />
          )}
          {platform === "facebook" && (
            <FacebookPreview
              title={title}
              description={description}
              hostname={hostname}
              image={image}
              siteName={siteName}
            />
          )}
        </motion.div>

        <div className="md:max-w-sm space-y-3">
          {social.warnings.length > 0 ? (
            social.warnings.map((w, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
                className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-sm"
              >
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="text-zinc-300 leading-relaxed">{w}</span>
              </motion.div>
            ))
          ) : (
            <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-sm text-zinc-300">
              Your share preview is clean. og:title, og:description, and og:image are all set correctly.
            </div>
          )}
          <SocialMetaTable social={social} />
        </div>
      </div>
    </div>
  );
}

function PlatformTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
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
          layoutId="social-tab-pill"
          className="absolute inset-0 bg-zinc-800 rounded-md"
          transition={{ type: "spring", duration: 0.4, bounce: 0.18 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2 whitespace-nowrap">
        {icon}
        {label}
      </span>
    </button>
  );
}

// --- iMessage / Slack preview ---
function IMessagePreview({
  title,
  hostname,
  image,
  favicon,
}: {
  title: string;
  hostname: string;
  image: string | null;
  favicon: string | null;
}) {
  return (
    <div className="max-w-md ml-auto md:mr-0 md:ml-0">
      <div className="text-xs text-zinc-500 mb-2 uppercase tracking-widest">
        How it looks in iMessage
      </div>
      <div className="rounded-3xl rounded-br-md overflow-hidden bg-[#262628] border border-zinc-800 shadow-2xl">
        {image ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={image}
            alt={title}
            referrerPolicy="no-referrer"
            className="w-full aspect-[1.91/1] object-cover bg-zinc-950"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full aspect-[1.91/1] bg-zinc-900 flex items-center justify-center text-zinc-600 text-sm">
            (no og:image set — empty rectangle)
          </div>
        )}
        <div className="p-3 flex items-center gap-2">
          {favicon && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={favicon}
              alt=""
              referrerPolicy="no-referrer"
              className="w-4 h-4 rounded-sm shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="text-[13px] text-white font-medium truncate">
              {title}
            </div>
            <div className="text-[11px] text-zinc-400 truncate uppercase">
              {hostname}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- X / Twitter preview ---
function TwitterPreview({
  title,
  description,
  hostname,
  image,
  cardType,
}: {
  title: string;
  description: string;
  hostname: string;
  image: string | null;
  cardType: string | null;
}) {
  const isLargeCard = cardType === "summary_large_image" || (!cardType && !!image);
  const cardLayout = isLargeCard ? "large" : "summary";

  return (
    <div className="max-w-lg">
      <div className="text-xs text-zinc-500 mb-2 uppercase tracking-widest">
        How it looks on X / Twitter ({cardLayout})
      </div>
      <div className="rounded-2xl overflow-hidden bg-black border border-zinc-700 shadow-2xl">
        {isLargeCard ? (
          <>
            {image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={image}
                alt={title}
                referrerPolicy="no-referrer"
                className="w-full aspect-[1.91/1] object-cover bg-zinc-950"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="w-full aspect-[1.91/1] bg-zinc-900 flex items-center justify-center text-zinc-600 text-sm">
                (no image)
              </div>
            )}
            <div className="p-3 border-t border-zinc-800">
              <div className="text-[13px] text-zinc-500 lowercase">{hostname}</div>
              <div className="text-[15px] text-white font-normal line-clamp-1 mt-0.5">
                {title}
              </div>
              {description && (
                <div className="text-[13px] text-zinc-400 line-clamp-1 mt-0.5">
                  {description}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex">
            {image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={image}
                alt={title}
                referrerPolicy="no-referrer"
                className="w-32 h-32 object-cover shrink-0 bg-zinc-950"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="w-32 h-32 bg-zinc-900 shrink-0" />
            )}
            <div className="p-3 flex-1 min-w-0">
              <div className="text-[13px] text-zinc-500 lowercase">{hostname}</div>
              <div className="text-[15px] text-white font-normal line-clamp-1 mt-0.5">
                {title}
              </div>
              {description && (
                <div className="text-[13px] text-zinc-400 line-clamp-2 mt-1">
                  {description}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Facebook preview ---
function FacebookPreview({
  title,
  description,
  hostname,
  image,
  siteName,
}: {
  title: string;
  description: string;
  hostname: string;
  image: string | null;
  siteName: string;
}) {
  return (
    <div className="max-w-lg">
      <div className="text-xs text-zinc-500 mb-2 uppercase tracking-widest">
        How it looks on Facebook / LinkedIn
      </div>
      <div className="rounded-md overflow-hidden bg-[#242526] border border-zinc-700 shadow-2xl">
        {image ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={image}
            alt={title}
            referrerPolicy="no-referrer"
            className="w-full aspect-[1.91/1] object-cover bg-zinc-950"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full aspect-[1.91/1] bg-zinc-900 flex items-center justify-center text-zinc-600 text-sm">
            (no og:image — Facebook shows just a text link)
          </div>
        )}
        <div className="p-3 bg-[#3A3B3C]">
          <div className="text-[11px] text-zinc-400 uppercase tracking-wide">
            {hostname}
          </div>
          <div className="text-[16px] text-white font-semibold line-clamp-2 mt-1">
            {title}
          </div>
          {description && (
            <div className="text-[14px] text-zinc-300 line-clamp-2 mt-1">
              {description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SocialMetaTable({ social }: { social: NonNullable<AuditResult["social"]> }) {
  const rows: Array<[string, string | null]> = [
    ["og:title", social.ogTitle],
    ["og:description", social.ogDescription],
    ["og:image", social.ogImage],
    ["og:site_name", social.ogSiteName],
    ["twitter:card", social.twitterCard],
    ["twitter:image", social.twitterImage],
  ];
  return (
    <div className="glass rounded-xl p-3">
      <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
        Detected meta tags
      </div>
      <div className="space-y-1.5 text-xs">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-start gap-2">
            <span className="font-mono text-zinc-500 shrink-0 w-28">{k}</span>
            <span
              className={`break-all ${v ? "text-zinc-300" : "text-zinc-700"}`}
              title={v ?? "missing"}
            >
              {v ? (v.length > 40 ? v.slice(0, 40) + "…" : v) : "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
