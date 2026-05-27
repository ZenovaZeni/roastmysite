import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Theme = "dark" | "light";
type Size = "sm" | "md";

const COLOR_BY_GRADE: Record<string, string> = {
  A: "#22c55e",
  B: "#84cc16",
  C: "#eab308",
  D: "#f97316",
  F: "#ef4444",
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const scoreParam = searchParams.get("score") ?? "0";
  const gradeParam = (searchParams.get("grade") || "F").toUpperCase();
  const theme = (searchParams.get("theme") || "dark") as Theme;
  const size = (searchParams.get("size") || "md") as Size;

  const score = Math.max(0, Math.min(100, Number(scoreParam) || 0));
  const grade = ["A", "B", "C", "D", "F"].includes(gradeParam) ? gradeParam : "F";
  const accent = COLOR_BY_GRADE[grade];

  const isDark = theme !== "light";
  const bg = isDark ? "#0A0908" : "#FFFFFF";
  const border = isDark ? "#27272A" : "#E5E5E5";
  const fg = isDark ? "#F5F1EC" : "#0A0908";
  const muted = isDark ? "#A1A1AA" : "#6B7280";

  const w = size === "sm" ? 200 : 240;
  const h = size === "sm" ? 56 : 72;
  const scoreFontSize = size === "sm" ? 22 : 28;
  const gradeFontSize = size === "sm" ? 12 : 13;
  const brandFontSize = size === "sm" ? 9 : 10;
  const taglineFontSize = size === "sm" ? 11 : 13;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="RoastMySite score ${score}/100, grade ${grade}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0.0"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="${w}" height="${h}" rx="10" ry="10" fill="${bg}" stroke="${border}" stroke-width="1"/>
  <rect width="${w}" height="${h}" rx="10" ry="10" fill="url(#g)"/>
  <g font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">
    <text x="14" y="20" fill="${muted}" font-size="${brandFontSize}" letter-spacing="2" font-weight="600">ROASTMYSITE</text>
    <text x="14" y="${size === "sm" ? 44 : 52}" fill="${fg}" font-size="${taglineFontSize}" font-weight="500">
      Audited
    </text>
    <g transform="translate(${w - 76}, ${size === "sm" ? 14 : 16})">
      <text x="0" y="${size === "sm" ? 24 : 30}" fill="${accent}" font-size="${scoreFontSize}" font-weight="800" text-anchor="start" font-feature-settings="'tnum'">${score}</text>
      <text x="${size === "sm" ? 36 : 46}" y="${size === "sm" ? 24 : 30}" fill="${muted}" font-size="11" font-weight="500">/100</text>
      <rect x="0" y="${size === "sm" ? 30 : 38}" width="60" height="${size === "sm" ? 16 : 18}" rx="4" ry="4" fill="${accent}" fill-opacity="0.18" stroke="${accent}" stroke-opacity="0.4"/>
      <text x="30" y="${size === "sm" ? 41 : 51}" fill="${accent}" font-size="${gradeFontSize}" font-weight="700" text-anchor="middle" letter-spacing="1">GRADE ${grade}</text>
    </g>
  </g>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400", // 24h cache — sites embed by URL
      "Access-Control-Allow-Origin": "*",
    },
  });
}
