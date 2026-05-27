"use client";
import { motion } from "framer-motion";
import { BRAND } from "@/lib/brand";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-zinc-900/80 mt-20">
      <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-6 items-center text-sm">
        {/* Left — credit */}
        <div className="text-zinc-500">
          Built locally. No tracking. No funnel retargeting. Yours.
        </div>

        {/* Center — Zenova umbrella credit */}
        <div className="flex justify-center">
          <motion.a
            href="/zenova"
            whileHover={{ y: -1 }}
            className="group inline-flex items-center gap-3 px-4 py-2 rounded-full glass hover:border-ember-500/30 transition-colors cursor-pointer"
          >
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-ember-500 to-red-600 flex items-center justify-center text-black font-black text-[11px]">
              Z
            </div>
            <span className="text-xs text-zinc-400 group-hover:text-zinc-200">
              A <span className="text-ember-400 font-semibold">{BRAND.parent}</span> product
            </span>
            <span className="text-[10px] text-zinc-600 group-hover:text-ember-300">
              → see what else I built
            </span>
          </motion.a>
        </div>

        {/* Right — small nav */}
        <div className="flex items-center justify-end gap-5 text-zinc-500">
          <a
            className="hover:text-ember-300 transition-colors"
            href={BRAND.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Hire Josh
          </a>
          <a className="hover:text-ember-300 transition-colors" href="/compare">
            Compare
          </a>
          <a className="hover:text-ember-300 transition-colors" href="#faq">
            FAQ
          </a>
        </div>
      </div>
    </footer>
  );
}
