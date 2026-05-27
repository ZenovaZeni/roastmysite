import { CompareHero } from "@/components/CompareHero";

export const metadata = {
  title: "Compare two websites · RoastMySite",
  description:
    "Pit your site against a competitor. Real Lighthouse scores, real screenshots, real verdict. Free.",
};

export default function Page() {
  return <CompareHero />;
}
