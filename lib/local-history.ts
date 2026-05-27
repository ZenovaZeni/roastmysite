/**
 * Browser-only local history + daily counter.
 *
 * No accounts. No server. Everything lives in the user's localStorage and
 * they can wipe it any time by clearing site data.
 *
 * Stores up to HISTORY_LIMIT scans total — each URL can appear MULTIPLE
 * times so we can show score-over-time trends per URL.
 */

const DAILY_KEY = "rms.daily";
const HISTORY_KEY = "rms.history";
const HISTORY_LIMIT = 200; // total entries (across all URLs)
const PER_URL_LIMIT = 12; // keep at most 12 scans per URL

export type LocalScanEntry = {
  url: string;
  hostname: string;
  score: number;
  grade: string;
  scannedAt: string;
};

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d
    .getDate()
    .toString()
    .padStart(2, "0")}`;
}

/** Increment the daily counter for "47th site today" line. Returns the new count. */
export function bumpDailyCounter(): number {
  if (typeof window === "undefined") return 1;
  try {
    const raw = window.localStorage.getItem(DAILY_KEY);
    const parsed = raw ? (JSON.parse(raw) as { day: string; count: number }) : null;
    const today = todayKey();
    if (!parsed || parsed.day !== today) {
      window.localStorage.setItem(
        DAILY_KEY,
        JSON.stringify({ day: today, count: 1 })
      );
      return 1;
    }
    const next = parsed.count + 1;
    window.localStorage.setItem(
      DAILY_KEY,
      JSON.stringify({ day: today, count: next })
    );
    return next;
  } catch {
    return 1;
  }
}

export function getDailyCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(DAILY_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as { day: string; count: number };
    return parsed.day === todayKey() ? parsed.count : 0;
  } catch {
    return 0;
  }
}

/**
 * Append a scan to history. Allows multiple entries per URL (for trend
 * tracking). Caps total at HISTORY_LIMIT entries and PER_URL_LIMIT entries
 * per URL — when over the per-URL cap, the oldest entry for that URL drops.
 */
export function recordScan(entry: Omit<LocalScanEntry, "scannedAt">): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    const list = raw ? (JSON.parse(raw) as LocalScanEntry[]) : [];
    const newEntry: LocalScanEntry = {
      ...entry,
      scannedAt: new Date().toISOString(),
    };

    // De-dupe identical-second scans (e.g. React StrictMode double-fire)
    const last = list[0];
    if (
      last &&
      last.url === newEntry.url &&
      Math.abs(
        new Date(last.scannedAt).getTime() -
          new Date(newEntry.scannedAt).getTime()
      ) < 5000
    ) {
      return;
    }

    // Prepend the new entry
    list.unshift(newEntry);

    // Enforce per-URL cap (drop oldest extra entries for this URL)
    const sameUrlIndices = list
      .map((e, i) => (e.url === newEntry.url ? i : -1))
      .filter((i) => i !== -1);
    if (sameUrlIndices.length > PER_URL_LIMIT) {
      const toRemove = sameUrlIndices.slice(PER_URL_LIMIT);
      for (let i = toRemove.length - 1; i >= 0; i--) {
        list.splice(toRemove[i], 1);
      }
    }

    // Enforce global cap
    const capped = list.slice(0, HISTORY_LIMIT);
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(capped));
  } catch {
    // ignore quota errors
  }
}

/** Returns ALL scans, newest first, including duplicates of the same URL. */
export function getHistory(): LocalScanEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LocalScanEntry[];
  } catch {
    return [];
  }
}

/** Returns the latest scan PER URL — for the recent audits sidebar. */
export function getUniqueHistory(): LocalScanEntry[] {
  const all = getHistory();
  const seen = new Set<string>();
  const unique: LocalScanEntry[] = [];
  for (const entry of all) {
    if (seen.has(entry.url)) continue;
    seen.add(entry.url);
    unique.push(entry);
  }
  return unique;
}

/** Returns all scans for one URL, newest first. */
export function getHistoryForUrl(url: string): LocalScanEntry[] {
  return getHistory().filter((e) => e.url === url);
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(HISTORY_KEY);
  } catch {
    // ignore
  }
}

export function removeFromHistory(url: string): void {
  if (typeof window === "undefined") return;
  try {
    const list = getHistory().filter((e) => e.url !== url);
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}
