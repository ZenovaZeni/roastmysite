"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Globe, Swords, AlertCircle } from "lucide-react";
import { validateUrlInput } from "@/lib/url-validation";

export function CompareInput({
  onSubmit,
  error,
  prefill,
}: {
  onSubmit: (you: string, them: string) => void;
  error: string | null;
  prefill?: { you: string; them: string };
}) {
  const [you, setYou] = useState("");
  const [them, setThem] = useState("");

  useEffect(() => {
    if (prefill?.you) setYou(prefill.you);
    if (prefill?.them) setThem(prefill.them);
  }, [prefill?.you, prefill?.them]);

  const [validationError, setValidationError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const a = validateUrlInput(you);
    const b = validateUrlInput(them);
    if (!a.ok) {
      setValidationError(`Your site: ${a.error}`);
      return;
    }
    if (!b.ok) {
      setValidationError(`Competitor: ${b.error}`);
      return;
    }
    setValidationError(null);
    onSubmit(a.url, b.url);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-ember-500/40 via-red-500/40 to-amber-500/40 rounded-2xl blur-xl opacity-50" />
        <div className="relative bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 backdrop-blur space-y-3">
          <Field
            label="YOUR SITE"
            color="ember"
            value={you}
            onChange={setYou}
            placeholder="yourbusiness.com"
            autoFocus
          />
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-zinc-800" />
            <Swords className="w-4 h-4 text-ember-400" />
            <div className="flex-1 h-px bg-zinc-800" />
          </div>
          <Field
            label="COMPETITOR"
            color="zinc"
            value={them}
            onChange={setThem}
            placeholder="competitor.com"
          />
          <motion.button
            type="submit"
            disabled={!you.trim() || !them.trim()}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-br from-ember-500 to-red-600 hover:from-ember-400 hover:to-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold text-base transition-all shadow-lg shadow-ember-900/30 cursor-pointer mt-2"
          >
            Fight
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
      {(validationError || error) && (
        <div className="mt-3 flex items-center justify-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-zinc-300">{validationError || error}</span>
        </div>
      )}
      <p className="mt-3 text-xs text-zinc-600 text-center">
        Tip: pick a competitor you actually want to beat. The numbers don&apos;t lie.
      </p>
    </form>
  );
}

function Field({
  label,
  color,
  value,
  onChange,
  placeholder,
  autoFocus,
}: {
  label: string;
  color: "ember" | "zinc";
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoFocus?: boolean;
}) {
  const labelColor = color === "ember" ? "text-ember-400" : "text-zinc-500";
  return (
    <div>
      <label
        className={`block text-[10px] font-semibold uppercase tracking-widest ${labelColor} mb-1.5`}
      >
        {label}
      </label>
      <div className="flex items-center bg-zinc-900/50 border border-zinc-800 rounded-xl px-3 py-1 focus-within:border-ember-500/40 transition-colors">
        <Globe className="w-4 h-4 text-zinc-600 shrink-0 mr-2" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          className="flex-1 bg-transparent outline-none py-2.5 text-base placeholder:text-zinc-700 text-zinc-100"
        />
      </div>
    </div>
  );
}
