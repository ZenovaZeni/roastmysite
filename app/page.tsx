import type { Metadata } from "next";
import { Hero } from "@/components/Hero";

type SearchParams = Promise<{ url?: string; score?: string; grade?: string }>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { url, score, grade } = await searchParams;
  if (!url || !score) {
    // Default homepage metadata — set in layout.tsx
    return {};
  }

  let hostname = url;
  try {
    hostname = new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    // fall through
  }

  const title = `${hostname} scored ${score}/100 ${grade ? `(${grade})` : ""} · RoastMySite`;
  const description = `Real Lighthouse audit + AI roast for ${hostname}. Free. No login. Try yours →`;
  const ogParams = new URLSearchParams({ url, score });
  if (grade) ogParams.set("grade", grade);
  const ogImage = `/api/og?${ogParams.toString()}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default function Page() {
  return <Hero />;
}
