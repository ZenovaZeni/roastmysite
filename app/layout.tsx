import type { Metadata } from "next";
import "./globals.css";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.prodOrigin),
  title: "RoastMySite — Brutally honest website audits, free.",
  description:
    "Drop any URL. Real Lighthouse scores, full-page screenshots, axe-core WCAG violations, multi-page audit, and an AI vision roast. Free. No login.",
  openGraph: {
    title: "RoastMySite — Brutally honest website audits",
    description:
      "Real Lighthouse + AI roast + premium PDF. Free. No login. No cloud.",
    type: "website",
    siteName: "RoastMySite",
    images: [{ url: "/api/og", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "RoastMySite — Brutally honest website audits",
    description:
      "Real Lighthouse + AI roast + premium PDF. Free. No login. No cloud.",
    images: ["/api/og"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
