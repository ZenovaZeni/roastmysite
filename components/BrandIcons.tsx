/**
 * Brand-accurate social platform icons.
 *
 * Paths sourced from Simple Icons (https://simpleicons.org), MIT licensed.
 * Each icon is a single <path> rendered in its actual brand color.
 *
 * Why not just use lucide-react?
 *   Lucide icons are generic outline glyphs (a "Facebook f" but no brand color).
 *   For the OnlinePresence section we want real recognizable logos so users
 *   instantly recognize each platform at a glance.
 */

import type { CSSProperties } from "react";

type IconProps = {
  size?: number;
  className?: string;
  style?: CSSProperties;
  // When set, renders monochrome in the given color instead of brand color
  // (useful for "missing" / disabled states)
  monoColor?: string;
};

type IconDef = {
  brand: string; // brand hex color
  path: string; // SVG path from Simple Icons
  viewBox?: string; // defaults to "0 0 24 24"
};

const ICONS: Record<string, IconDef> = {
  facebook: {
    brand: "#1877F2",
    path: "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z",
  },
  instagram: {
    brand: "#E1306C",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z",
  },
  linkedin: {
    brand: "#0A66C2",
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.063 2.063 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  },
  twitter: {
    brand: "#FFFFFF", // X is white on dark / black on light
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  youtube: {
    brand: "#FF0000",
    path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
  tiktok: {
    brand: "#000000", // TikTok is black; we'll render with gradient outline elsewhere
    path: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
  },
  pinterest: {
    brand: "#BD081C",
    path: "M12.017.001C5.396.001.001 5.396.001 12.017c0 5.064 3.149 9.397 7.575 11.151-.105-.946-.199-2.398.041-3.43.219-.928 1.404-5.91 1.404-5.91s-.357-.717-.357-1.776c0-1.664.965-2.906 2.166-2.906 1.02 0 1.514.768 1.514 1.688 0 1.027-.655 2.564-.994 3.989-.283 1.193.601 2.165 1.777 2.165 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.137.893 2.739a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.99C24.007 5.39 18.641.001 12.017.001z",
  },
  yelp: {
    brand: "#FF1A1A",
    path: "M20.16 12.594l-1.911-.611c-1.524-.479-1.598-.49-1.794-.461a.93.93 0 00-.69.451.951.951 0 00-.146.514c-.001.219.06.426.144.583-.005.024-.005.05-.005.075a.96.96 0 00.288.679c.146.146.302.234.494.288 1.91.609 1.985.589 2.18.617a.93.93 0 00.69-.451.95.95 0 00.146-.514.953.953 0 00-.046-.292c.001-.022.003-.043.003-.064a.96.96 0 00-.353-.815zM12.18 8.654c.193.054.348.142.495.288a.96.96 0 01.288.679c0 .025 0 .051-.005.075a.93.93 0 01.146.583.95.95 0 01-.146.514.93.93 0 01-.69.451c-.196.029-.27.018-1.794-.461l-1.911-.611c-.193-.054-.349-.142-.495-.288A.96.96 0 017.78 9.16c0-.021.002-.042.003-.064a.95.95 0 01-.046-.292.95.95 0 01.146-.514.93.93 0 01.69-.451c.196-.029.27-.018 2.18.617.193.054.348.142.495.288.146.146.234.302.288.494v.025c.005.024.005.05.005.075h-.001zm-3.66 10.6c-.146-.146-.234-.302-.288-.494-.001-.022-.003-.043-.003-.064a.953.953 0 01-.046-.292.95.95 0 01.146-.514.93.93 0 01.69-.451c.196-.029.27-.018 1.794.461.193.054.348.142.495.288.146.146.234.302.288.494.001.022.003.043.003.064.025.084.046.181.046.292a.95.95 0 01-.146.514.93.93 0 01-.69.451c-.196.029-.27.018-1.794-.461a1.46 1.46 0 01-.495-.288zM12 0C5.373 0 0 5.372 0 12s5.373 12 12 12 12-5.372 12-12S18.627 0 12 0z",
  },
};

function renderIcon(
  key: keyof typeof ICONS,
  { size = 20, className, style, monoColor }: IconProps
) {
  const def = ICONS[key];
  const fill = monoColor ?? def.brand;
  return (
    <svg
      width={size}
      height={size}
      viewBox={def.viewBox || "0 0 24 24"}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d={def.path} fill={fill} />
    </svg>
  );
}

export const FacebookIcon = (p: IconProps) => renderIcon("facebook", p);
export const InstagramIcon = (p: IconProps) => renderIcon("instagram", p);
export const LinkedInIcon = (p: IconProps) => renderIcon("linkedin", p);
export const TwitterIcon = (p: IconProps) => renderIcon("twitter", p);
export const YouTubeIcon = (p: IconProps) => renderIcon("youtube", p);
export const TikTokIcon = (p: IconProps) => renderIcon("tiktok", p);
export const PinterestIcon = (p: IconProps) => renderIcon("pinterest", p);
export const YelpIcon = (p: IconProps) => renderIcon("yelp", p);

/** For mapping <Platform> name to its brand icon */
export const BRAND_ICON: Record<
  string,
  (p: IconProps) => React.JSX.Element
> = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  linkedin: LinkedInIcon,
  twitter: TwitterIcon,
  youtube: YouTubeIcon,
  tiktok: TikTokIcon,
  pinterest: PinterestIcon,
  yelp: YelpIcon,
};

/** Brand color lookup for backgrounds, etc. */
export const BRAND_COLOR: Record<string, string> = {
  facebook: ICONS.facebook.brand,
  instagram: ICONS.instagram.brand,
  linkedin: ICONS.linkedin.brand,
  twitter: ICONS.twitter.brand,
  youtube: ICONS.youtube.brand,
  tiktok: ICONS.tiktok.brand,
  pinterest: ICONS.pinterest.brand,
  yelp: ICONS.yelp.brand,
};
