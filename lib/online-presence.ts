/**
 * Online presence audit — what does the business look like OFF its own website?
 *
 * Path A (free, no external APIs): scan the HTML for links to known social
 * platforms + business directories. For platforms NOT found, surface a
 * "go check this yourself" quick-link to a search engine.
 *
 * Path B (future): wire Google Places API for real GMB data — claim status,
 * review count, last post, etc. Requires Maps Platform API key.
 */

import type { CheerioAPI } from "cheerio";

export type Platform =
  | "facebook"
  | "instagram"
  | "linkedin"
  | "twitter"
  | "youtube"
  | "tiktok"
  | "pinterest"
  | "yelp";

export type FoundProfile = {
  platform: Platform;
  label: string;
  url: string; // the resolved URL on their site
};

export type QuickLink = {
  key: "gmb" | "yelp" | "bbb" | "facebook" | "instagram" | "linkedin";
  label: string;
  description: string;
  url: string; // pre-filled search URL
};

export type OnlinePresence = {
  profilesFound: FoundProfile[]; // sorted by importance
  platformsChecked: Platform[]; // all platforms we looked for
  missingPlatforms: Platform[]; // didn't find a link to these
  quickLinks: QuickLink[]; // "go check yourself" buttons (no API needed)
  hasTapToCall: boolean; // <a href="tel:..."> present
  hasMapEmbed: boolean; // google maps iframe present
  hasMailtoLink: boolean; // <a href="mailto:..."> present
  presenceScore: number; // 0-100, informational only — doesn't affect audit score
};

const PATTERNS: Array<{ platform: Platform; label: string; regex: RegExp }> = [
  {
    platform: "facebook",
    label: "Facebook",
    regex: /https?:\/\/(?:[a-z0-9-]+\.)?(?:facebook|fb)\.com\/(?!sharer|share|tr|plugins|dialog)[a-zA-Z0-9._%-]+/i,
  },
  {
    platform: "instagram",
    label: "Instagram",
    regex: /https?:\/\/(?:www\.)?instagram\.com\/(?!explore|reels?|p\/|tv\/)[a-zA-Z0-9._%-]+/i,
  },
  {
    platform: "linkedin",
    label: "LinkedIn",
    regex: /https?:\/\/(?:[a-z]{2,3}\.)?linkedin\.com\/(in|company|school)\/[a-zA-Z0-9._%-]+/i,
  },
  {
    platform: "twitter",
    label: "X / Twitter",
    regex: /https?:\/\/(?:www\.)?(?:twitter|x)\.com\/(?!intent|share|home|search|i\/)[a-zA-Z0-9._%-]+/i,
  },
  {
    platform: "youtube",
    label: "YouTube",
    regex: /https?:\/\/(?:www\.)?youtube\.com\/(?:c\/|channel\/|@|user\/)[a-zA-Z0-9._%-]+/i,
  },
  {
    platform: "tiktok",
    label: "TikTok",
    regex: /https?:\/\/(?:www\.)?tiktok\.com\/@[a-zA-Z0-9._%-]+/i,
  },
  {
    platform: "pinterest",
    label: "Pinterest",
    regex: /https?:\/\/(?:[a-z]{2,3}\.)?pinterest\.com\/[a-zA-Z0-9._%-]+/i,
  },
  {
    platform: "yelp",
    label: "Yelp",
    regex: /https?:\/\/(?:www\.)?yelp\.com\/biz\/[a-zA-Z0-9._%-]+/i,
  },
];

export function detectOnlinePresence(
  $: CheerioAPI,
  html: string,
  hostname: string
): OnlinePresence {
  // Gather every <a href> + the raw HTML so we catch links in inline JS too
  const hrefs = $("a[href]")
    .map((_, el) => $(el).attr("href") || "")
    .get();
  const haystack = [...hrefs, html].join("\n");

  const found = new Map<Platform, FoundProfile>();
  for (const p of PATTERNS) {
    const match = haystack.match(p.regex);
    if (match && !found.has(p.platform)) {
      // Don't match the business's own social-share links to its OWN site
      const url = match[0];
      if (!isSelfShare(url, hostname)) {
        found.set(p.platform, {
          platform: p.platform,
          label: p.label,
          url,
        });
      }
    }
  }

  const profilesFound = Array.from(found.values());
  const platformsChecked = PATTERNS.map((p) => p.platform);
  const missingPlatforms = platformsChecked.filter((p) => !found.has(p));

  // Contact signals — service-business essentials
  const hasTapToCall = $('a[href^="tel:"]').length > 0;
  const hasMailtoLink = $('a[href^="mailto:"]').length > 0;
  const hasMapEmbed =
    $(
      'iframe[src*="google.com/maps"], iframe[src*="maps.google"]'
    ).length > 0;

  // Quick-link generator — pre-filled searches on directories we can't programmatically check
  const cleanHost = hostname.replace(/^www\./, "");
  const quickLinks: QuickLink[] = [
    {
      key: "gmb",
      label: "Google Business Profile",
      description:
        "Is your GMB claimed? Reviewed? Posting? This is the #1 source of trust + local SEO.",
      url: `https://www.google.com/search?q=${encodeURIComponent(
        `${cleanHost} site:google.com OR "google business profile"`
      )}`,
    },
    {
      key: "bbb",
      label: "Better Business Bureau",
      description: "Search your business on BBB. Accredited = trust signal for local services.",
      url: `https://www.bbb.org/search?find_text=${encodeURIComponent(cleanHost)}`,
    },
  ];
  if (!found.has("yelp")) {
    quickLinks.push({
      key: "yelp",
      label: "Yelp",
      description:
        "Service businesses get found on Yelp. If you're not on it, your competitor is.",
      url: `https://www.yelp.com/search?find_desc=${encodeURIComponent(cleanHost)}`,
    });
  }
  if (!found.has("facebook")) {
    quickLinks.push({
      key: "facebook",
      label: "Facebook Page",
      description:
        "Most local businesses still get discovered via Facebook. A claimed Page is table stakes.",
      url: `https://www.facebook.com/search/top?q=${encodeURIComponent(cleanHost)}`,
    });
  }
  if (!found.has("instagram")) {
    quickLinks.push({
      key: "instagram",
      label: "Instagram",
      description:
        "Photo-heavy businesses (food, design, trades with portfolios) live on IG.",
      url: `https://www.instagram.com/explore/tags/${encodeURIComponent(
        cleanHost.split(".")[0]
      )}`,
    });
  }

  // Presence score — informational only.
  // 50% from social link presence, 30% from contact signals, 20% from map embed
  const socialPct = profilesFound.length / 5; // expect 5 of the 8 platforms as a benchmark
  const contactPct =
    (hasTapToCall ? 1 : 0) * 0.5 +
    (hasMailtoLink ? 1 : 0) * 0.3 +
    (hasMapEmbed ? 1 : 0) * 0.2;
  const presenceScore = Math.min(
    100,
    Math.round(Math.min(1, socialPct) * 50 + contactPct * 50)
  );

  return {
    profilesFound,
    platformsChecked,
    missingPlatforms,
    quickLinks,
    hasTapToCall,
    hasMapEmbed,
    hasMailtoLink,
    presenceScore,
  };
}

function isSelfShare(url: string, hostname: string): boolean {
  // Skip social share buttons (facebook.com/sharer?u=https://thissite.com)
  try {
    const u = new URL(url);
    const cleanHost = hostname.replace(/^www\./, "");
    if (u.searchParams.get("u")?.includes(cleanHost)) return true;
    if (u.searchParams.get("url")?.includes(cleanHost)) return true;
    if (decodeURIComponent(u.search).includes(cleanHost)) return true;
  } catch {
    // ignore
  }
  return false;
}

export const PLATFORM_LABEL: Record<Platform, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  twitter: "X / Twitter",
  youtube: "YouTube",
  tiktok: "TikTok",
  pinterest: "Pinterest",
  yelp: "Yelp",
};
