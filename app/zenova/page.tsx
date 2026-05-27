import type { Metadata } from "next";
import { ZenovaPortfolio } from "@/components/ZenovaPortfolio";

export const metadata: Metadata = {
  title: "Zenova AI · Free tools and lead-gen systems by Josh Douglas",
  description:
    "RoastMySite, JobBlitz, Lead Flow, ForkFirst, RealFrame — the Zenova AI product line. Free tools that surface real problems, plus the systems that fix them.",
  openGraph: {
    title: "Zenova AI",
    description:
      "Free tools and lead-gen systems by Josh Douglas. Brevard County, FL.",
    type: "website",
  },
};

export default function Page() {
  return <ZenovaPortfolio />;
}
