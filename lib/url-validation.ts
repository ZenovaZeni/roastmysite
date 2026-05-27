/**
 * Friendly client-side URL validation.
 *
 * Catches the most common ways people fumble URL inputs and returns
 * actionable error messages with optional one-click suggestions —
 * better than silent fetch failures.
 */

export type UrlValidation =
  | { ok: true; url: string }
  | { ok: false; error: string; suggestion?: string };

export function validateUrlInput(input: string): UrlValidation {
  const raw = input.trim();
  if (!raw) return { ok: false, error: "Type a URL to start." };

  // Strip scheme + www, then strip path/query/fragment so we validate
  // ONLY the hostname portion.
  const bare = raw
    .replace(/^https?:\/\//i, "")
    .replace(/^\/\//, "")
    .replace(/^www\./i, "")
    .split(/[/?#]/)[0]; // hostname only — drop path, query, hash

  // Likely a search query (multiple words with spaces)
  if (/\s/.test(bare)) {
    return {
      ok: false,
      error: "That looks like a search query — try just the website URL, like example.com",
    };
  }

  // Invalid characters
  if (/[<>(){}[\]'"`!@#$%^&*=|\\?,;]/.test(bare)) {
    return {
      ok: false,
      error: "Hmm, that doesn't look like a URL. Try something like yourbusiness.com",
    };
  }

  // Empty / whitespace-only after stripping
  if (!bare) {
    return { ok: false, error: "Type a URL to start." };
  }

  // No dot at all → almost certainly missing the .com / .io / etc
  if (!bare.includes(".")) {
    const suggestion = `${bare}.com`;
    return {
      ok: false,
      error: `Missing an extension — did you mean ${suggestion}?`,
      suggestion,
    };
  }

  // Trailing dot (typo)
  if (bare.endsWith(".")) {
    const fixed = bare.slice(0, -1);
    return {
      ok: false,
      error: `Your URL ends with a "." — did you mean ${fixed}.com?`,
      suggestion: `${fixed}.com`,
    };
  }

  // TLD too short / weird (single char after final dot)
  const parts = bare.split(".");
  const tld = parts[parts.length - 1];
  if (tld.length < 2) {
    return {
      ok: false,
      error: `That doesn't look like a valid extension. Try .com, .io, .dev, .co, etc.`,
    };
  }

  // Leading dot (typo)
  if (bare.startsWith(".")) {
    return {
      ok: false,
      error: `Your URL starts with a "." — try ${bare.slice(1)} instead.`,
      suggestion: bare.slice(1),
    };
  }

  // Double dots (typo like "example..com")
  if (bare.includes("..")) {
    const fixed = bare.replace(/\.{2,}/g, ".");
    return {
      ok: false,
      error: `Looks like a double dot — did you mean ${fixed}?`,
      suggestion: fixed,
    };
  }

  // Catches "yourname@gmail.com" — that's an email, not a URL
  if (raw.includes("@")) {
    return {
      ok: false,
      error: "That looks like an email — try the website URL of your business instead.",
    };
  }

  return { ok: true, url: raw };
}
