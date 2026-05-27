"use client";
import { useState } from "react";
import { ArrowRight, Globe, AlertCircle } from "lucide-react";
import { validateUrlInput } from "@/lib/url-validation";

export function UrlInput({
  onSubmit,
  error,
}: {
  onSubmit: (url: string) => void;
  error: string | null;
}) {
  const [val, setVal] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = validateUrlInput(val);
    if (!result.ok) {
      setLocalError(result.error);
      setSuggestion(result.suggestion || null);
      return;
    }
    setLocalError(null);
    setSuggestion(null);
    onSubmit(result.url);
  }

  function applySuggestion() {
    if (!suggestion) return;
    setVal(suggestion);
    setLocalError(null);
    setSuggestion(null);
    onSubmit(suggestion);
  }

  const displayError = localError || error;

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-ember-500/40 via-red-500/40 to-amber-500/40 rounded-2xl blur-xl opacity-50 group-focus-within:opacity-80 transition-opacity" />
        <div className="relative flex items-center bg-zinc-950/80 border border-zinc-800 group-focus-within:border-ember-500/50 rounded-2xl p-2 backdrop-blur">
          <Globe className="w-5 h-5 text-zinc-500 ml-3 mr-2 shrink-0" />
          <input
            type="text"
            value={val}
            onChange={(e) => {
              setVal(e.target.value);
              if (localError) {
                setLocalError(null);
                setSuggestion(null);
              }
            }}
            placeholder="yourcompetitor.com"
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            className="flex-1 bg-transparent outline-none px-2 py-3 text-base md:text-lg placeholder:text-zinc-600 text-zinc-100"
          />
          <button
            type="submit"
            disabled={!val.trim()}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-br from-ember-500 to-red-600 hover:from-ember-400 hover:to-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold text-sm md:text-base transition-all shadow-lg shadow-ember-900/30 cursor-pointer"
          >
            Roast it
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      {displayError && (
        <div className="mt-3 flex items-center justify-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-zinc-300">{displayError}</span>
          {suggestion && (
            <button
              type="button"
              onClick={applySuggestion}
              className="ml-2 px-2.5 py-1 rounded-md bg-ember-500/15 border border-ember-500/40 text-ember-300 hover:bg-ember-500/25 text-xs font-semibold cursor-pointer"
            >
              Use {suggestion}
            </button>
          )}
        </div>
      )}
      <p className="mt-3 text-xs text-zinc-600 text-center">
        Tip: roast your own site first. Then your top 3 competitors.
      </p>
    </form>
  );
}
