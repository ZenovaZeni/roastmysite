"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Footer } from "./Footer";
import { LogoMark } from "./Logo";
import { BRAND } from "@/lib/brand";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Lock,
  DollarSign,
  Sparkles,
  Heart,
} from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

export function AboutPage() {
  return (
    <div className="min-h-screen relative overflow-x-hidden noise">
      <BackgroundGlow />
      <Nav />

      <main className="relative z-10 max-w-3xl mx-auto px-6 pb-24">
        <Hero />
        <Why />
        <How />
        <Author />
        <Cta />
      </main>

      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <nav className="relative z-20 max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
      <Link href="/" className="group flex items-center gap-2 cursor-pointer">
        <LogoMark size={36} withGlow />
        <span className="text-lg font-semibold tracking-tight">
          Roast<span className="text-ember-400">My</span>Site
        </span>
      </Link>
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-ember-300 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to the audit
      </Link>
    </nav>
  );
}

function BackgroundGlow() {
  return (
    <div
      className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full blur-3xl opacity-20 pointer-events-none"
      style={{
        background:
          "radial-gradient(circle, rgba(249,115,22,0.4) 0%, transparent 70%)",
      }}
    />
  );
}

function Hero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="pt-12 md:pt-16 mb-16 text-center"
    >
      <div className="text-xs uppercase tracking-widest text-ember-400 mb-3">
        About
      </div>
      <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05] mb-5">
        Why this tool exists.
      </h1>
      <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
        Most website audit tools either (a) lie to you to upsell their paid
        tier, or (b) hand you a wall of acronyms you can&apos;t read. This one
        does neither.
      </p>
    </motion.div>
  );
}

function Why() {
  return (
    <Section title="Why I built it">
      <P>
        I run lead-gen for service businesses in Brevard County, FL. Every
        cold walk-in starts the same way: <em>&quot;your website is the
        first thing your customer sees, and it&apos;s probably costing you
        revenue you can&apos;t see.&quot;</em> The next question is always{" "}
        <em>&quot;okay, what&apos;s wrong with it?&quot;</em>
      </P>
      <P>
        I was running that audit manually for every prospect. Twenty
        minutes per site. Across hundreds of businesses. I needed a tool
        that did it in thirty seconds — and that I could hand to a small
        business owner without them feeling cornered into hiring me.
      </P>
      <P>
        That&apos;s {BRAND.name}. Real Lighthouse data. Real screenshots.
        Real accessibility scan. Plain-English roast. A PDF they can show
        their developer. All free. No login.
      </P>
    </Section>
  );
}

function How() {
  return (
    <Section title="How it stays free">
      <P>
        Three honest mechanics keep this thing alive without charging you
        a dollar:
      </P>
      <ul className="space-y-4 my-6">
        <Bullet icon={DollarSign} title="Affiliate links — used sparingly.">
          When your audit fails a check, we recommend a tool that solves
          it (Hostinger for hosting, Tally for forms, ConvertKit for
          email, etc.). If you click and sign up, the partner pays us a
          commission. You pay the same price either way.
        </Bullet>
        <Bullet icon={Sparkles} title="Lead Flow — for owners who don&apos;t DIY.">
          The big &quot;Want a pro to fix this?&quot; CTA sends you
          straight to my Cal.com. If you&apos;d rather hire me than do it
          yourself, that funds everything.
        </Bullet>
        <Bullet icon={Lock} title="Free-tier infrastructure all the way down.">
          The AI roast runs on free-tier{" "}
          <span className="text-ember-300">Groq Llama 4 + Gemini</span>{" "}
          (with a templated fallback when both max out for the day).
          Screenshots use headless Chromium. Lighthouse runs on
          Google&apos;s free PSI API. Nothing about your audit is stored
          on our servers. Total infrastructure cost: about a dollar a
          month for the domain.
        </Bullet>
      </ul>
      <P>
        No paywall. No email gate. No &quot;upgrade for full audit.&quot;
        Genuinely free, genuinely useful, paid for by people choosing to
        click affiliate links or hire me.
      </P>
    </Section>
  );
}

function Author() {
  return (
    <Section title="Who built it">
      <P>
        I&apos;m Josh Douglas. I build AI products and lead-gen systems
        under{" "}
        <Link
          href="/zenova"
          className="text-ember-400 hover:text-ember-300 underline underline-offset-4"
        >
          Zenova AI
        </Link>
        . {BRAND.name} is one of six active products. The flagship is{" "}
        <span className="text-zinc-200">JobBlitz</span> — an AI packet
        factory for job seekers, launching September 2026. The bread and
        butter is{" "}
        <span className="text-zinc-200">Lead Flow</span> — service-business
        lead-gen for trades and contractors.
      </P>
      <P>
        Everything I build lives at{" "}
        <Link
          href="/zenova"
          className="text-ember-400 hover:text-ember-300 underline underline-offset-4"
        >
          /zenova
        </Link>
        . Everything I&apos;m actively building lives at{" "}
        <a
          href="https://youtube.com/@joshdouglasbuilds"
          target="_blank"
          rel="noopener noreferrer"
          className="text-ember-400 hover:text-ember-300 underline underline-offset-4"
        >
          @joshdouglasbuilds on YouTube
        </a>
        .
      </P>
    </Section>
  );
}

function Cta() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="mt-20 glass rounded-3xl p-8 md:p-10 text-center"
    >
      <Heart className="w-6 h-6 text-ember-400 mx-auto mb-4" />
      <h3 className="text-2xl md:text-3xl font-bold mb-3 text-zinc-100">
        Got questions, ideas, or a site to roast?
      </h3>
      <p className="text-zinc-400 mb-6 max-w-lg mx-auto">
        Book a free 15-min walk-through. I&apos;ll review your audit live and
        tell you the fastest win. No pitch unless you want one.
      </p>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <a
          href={BRAND.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-br from-ember-500 to-red-600 hover:from-ember-400 hover:to-red-500 text-black font-semibold text-sm shadow-lg shadow-ember-900/30 cursor-pointer"
        >
          <Calendar className="w-4 h-4" />
          Book a call
          <ArrowRight className="w-4 h-4" />
        </a>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-zinc-800 hover:border-ember-500/40 text-zinc-300 hover:text-ember-300 text-sm cursor-pointer"
        >
          Run an audit
        </Link>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Reusable bits
// ============================================================================

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="mb-16"
    >
      <h2 className="text-2xl md:text-3xl font-bold text-zinc-100 mb-6 tracking-tight">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </motion.section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[17px] text-zinc-300 leading-[1.7]">{children}</p>
  );
}

function Bullet({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-4">
      <div className="w-10 h-10 rounded-xl bg-ember-500/10 border border-ember-500/30 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-ember-400" />
      </div>
      <div>
        <div className="font-semibold text-zinc-100 mb-1">{title}</div>
        <div className="text-[15px] text-zinc-400 leading-relaxed">
          {children}
        </div>
      </div>
    </li>
  );
}
