import type { Metadata } from "next";
import { AboutPage } from "@/components/AboutPage";

export const metadata: Metadata = {
  title: "About · RoastMySite",
  description:
    "Why RoastMySite exists, who built it, and the (very honest) business model behind a free tool.",
  openGraph: {
    title: "About RoastMySite",
    description: "Why this tool exists, who built it, how it stays free.",
    type: "article",
  },
};

export default function Page() {
  return <AboutPage />;
}
