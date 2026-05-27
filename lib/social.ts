import * as cheerio from "cheerio";

export type SocialPreview = {
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  ogSiteName: string | null;
  ogType: string | null;
  twitterCard: string | null; // "summary" | "summary_large_image" | "player" | "app"
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImage: string | null;
  twitterSite: string | null;
  fallbackTitle: string;
  fallbackDescription: string;
  faviconUrl: string | null;
  warnings: string[];
};

export function extractSocialPreview(
  $: cheerio.CheerioAPI,
  finalUrl: string,
  pageTitle: string,
  pageDescription: string
): SocialPreview {
  const get = (sel: string) => $(sel).attr("content")?.trim() || null;
  const getHref = (sel: string) => $(sel).attr("href")?.trim() || null;

  const ogTitle = get('meta[property="og:title"]');
  const ogDescription = get('meta[property="og:description"]');
  const ogImage = absolutize(get('meta[property="og:image"]'), finalUrl);
  const ogSiteName = get('meta[property="og:site_name"]');
  const ogType = get('meta[property="og:type"]');

  const twitterCard = get('meta[name="twitter:card"]');
  const twitterTitle = get('meta[name="twitter:title"]');
  const twitterDescription = get('meta[name="twitter:description"]');
  const twitterImage = absolutize(get('meta[name="twitter:image"]'), finalUrl);
  const twitterSite = get('meta[name="twitter:site"]');

  const faviconHref =
    getHref('link[rel="apple-touch-icon"]') ||
    getHref('link[rel="icon"][sizes="32x32"]') ||
    getHref('link[rel="icon"]') ||
    getHref('link[rel="shortcut icon"]') ||
    "/favicon.ico";
  const faviconUrl = absolutize(faviconHref, finalUrl);

  const warnings: string[] = [];

  // Trust hierarchy: og:title > twitter:title > <title>
  const finalTitle = ogTitle || twitterTitle || pageTitle;
  const finalDescription = ogDescription || twitterDescription || pageDescription;
  const finalImage = ogImage || twitterImage;

  if (!ogTitle && !twitterTitle) {
    warnings.push(
      `No og:title or twitter:title — social platforms will scrape "${pageTitle.slice(0, 40)}" from <title>.`
    );
  }
  if (!ogDescription && !twitterDescription) {
    warnings.push(
      "No og:description or twitter:description — preview may show truncated meta description or nothing."
    );
  }
  if (!finalImage) {
    warnings.push(
      "No og:image. Shared links in iMessage, Slack, Twitter, Facebook will appear as plain text — no visual preview at all."
    );
  } else if (!twitterImage) {
    // We have og:image but no twitter:image. Twitter uses og:image as fallback so this is okay.
  }

  if (!twitterCard && finalImage) {
    warnings.push(
      "No twitter:card meta — Twitter/X may show a small thumbnail instead of the full-width image. Add twitter:card='summary_large_image'."
    );
  }

  if (finalTitle && finalTitle.length > 70) {
    warnings.push(
      `Title is ${finalTitle.length} chars — most platforms truncate around 60-70.`
    );
  }
  if (finalDescription && finalDescription.length > 200) {
    warnings.push(
      `Description is ${finalDescription.length} chars — most platforms truncate around 155-200.`
    );
  }

  return {
    ogTitle,
    ogDescription,
    ogImage,
    ogSiteName,
    ogType,
    twitterCard,
    twitterTitle,
    twitterDescription,
    twitterImage,
    twitterSite,
    fallbackTitle: finalTitle || "",
    fallbackDescription: finalDescription || "",
    faviconUrl,
    warnings,
  };
}

function absolutize(url: string | null, base: string): string | null {
  if (!url) return null;
  try {
    return new URL(url, base).toString();
  } catch {
    return url;
  }
}
