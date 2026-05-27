/**
 * The Roaster — the personality voice that wraps every roast.
 *
 * No name, no avatar (yet). Just a snarky, tired, opinionated critic
 * with rotating moods, time awareness, day-of-week energy, and a
 * library of openings, reactions, and closings. The middle "actual
 * roast" can come from Groq/Gemini OR a template-driven data summary.
 * Either way, the voice stays consistent.
 *
 * Rule: NEVER say "AI" in user-facing strings. The character has feelings.
 */

import type { AuditResult } from "./audit";

export type Mood = "tired" | "energized" | "bored" | "snarky";
export type TimeBlock =
  | "morning" // 5-11
  | "afternoon" // 12-17
  | "evening" // 18-21
  | "late" // 22-23
  | "weeHours"; // 0-4

export type RoasterContext = {
  now: Date;
  timeBlock: TimeBlock;
  timeStr: string; // "3:14pm" / "11am" / "midnight"
  dayName: string; // "Tuesday"
  mood: Mood;
  countToday: number; // how many roasts globally today (best-effort)
  audit: AuditResult;
  exhausted: boolean; // true when LLM providers are tapped out
  unreachable: boolean; // true when the scan itself failed (no audit data)
};

export type FallbackTone = "provider-failed" | "missing-provider-config";

// ============================================================================
// LIBRARIES — every entry can use {time}, {day}, {host}, {score}, {grade},
// {N} (daily counter), {topFail}, {tech}, {age}. Substitution is mechanical.
// ============================================================================

const OPENINGS: Record<TimeBlock, string[]> = {
  morning: [
    "It's {time}. Coffee's not even cold yet.",
    "Pre-noon roast #{N} of the day. Bring it.",
    "{time} on a {day}. I'm warming up. Yours is the warm-up.",
    "{day} morning. {time}. Show me what you got.",
    "{time}. First sip of the day. Let's look.",
    "Yeah it's {time}. I'm here. Reluctantly.",
  ],
  afternoon: [
    "Yeah it's {time}. And?",
    "{time}. {N}th site today. Don't expect mercy.",
    "Afternoon slump. {time}. Make it interesting.",
    "Lunch was {N} sites ago. {time}. Keep coming.",
    "{day} afternoon. {time}. {host} it is.",
    "Mid-{day}. {time}. The honesty hour.",
  ],
  evening: [
    "{time}. Was about to clock out. Fine, one more.",
    "Evening. {N}th of the day. Let me look.",
    "{day} {time}. Bro, the workday's over.",
    "Dinner can wait. {host} it is.",
    "{time}. The 'why are we still doing this' hour.",
    "{day} evening. {time}. I'll allow it.",
  ],
  late: [
    "{time} and you're roasting sites. Respect. Or concern.",
    "Approaching bedtime. {time}. Make it snappy.",
    "{day} night, {time}. Quick one before I crash.",
    "{time}. Last call. Yours.",
  ],
  weeHours: [
    "It's {time}. You alright, bro?",
    "{time}. The hour of regret. Yours, probably.",
    "Look, it's {time}. We're both up too late.",
    "{time}. AM. AM. I'm tired but here.",
    "Bro it's {time}. Some of us sleep. Quick.",
  ],
};

const EXHAUSTED_OPENINGS: string[] = [
  "Yeah, I'm done. Daily quota = vaporized. Come back at midnight when it resets.",
  "Free tier got nuked today. The data view still works. See you tomorrow.",
  "Bro, every URL on the internet hit me at once today. I'm cooked. Try after midnight.",
  "Going to bed. The pipes are dry until reset. {time} now, come back at midnight.",
  "Ya'll trippin today. Drained me. Tomorrow we ride.",
  "I'm out. {time}. The roast pipes refill at midnight UTC. Patience.",
  "Look, I roasted {N} sites today. I'm done. Brain = soup.",
  "Quota: zero. Vibes: zero. Tomorrow: maybe.",
];

const DATA_ONLY_OPENINGS: string[] = [
  "Data-only roast this time. I can read the audit, but the live roast provider is not configured yet.",
  "The audit data loaded. The roast engine did not. So you get the receipts, minus the theatrics.",
  "No fresh roast provider is wired up on this deployment yet. I can still call out the numbers.",
  "This is the fallback lane: audit data, direct verdict, no pretend provider status.",
];

/** Used when the scan itself couldn't reach the URL — NOT a rate-limit thing. */
const UNREACHABLE_OPENINGS: string[] = [
  "Your URL is hiding from me. Either it's down, blocking bots, or you fat-fingered the spelling. {time}, your move.",
  "Couldn't pull anything from that URL. Try again with the full address — yourbusiness.com, not just yourbusiness.",
  "I'd roast it if I could see it. Site refused to load. Double-check the URL and try again.",
  "Nothing came back from that URL. Could be a typo, could be a firewall. Take another swing.",
  "That URL didn't respond. Either it's broken, behind login, or your spelling needs help.",
];

const UNREACHABLE_MIDDLES: string[] = [
  "I tried to reach {host} and got nothing back. Common reasons: missing .com / .io / .dev at the end, the site is genuinely down, or it's blocking automated requests like Cloudflare's strictest setting. Try the URL in your own browser first — if it loads there, send me the full address with the scheme.",
  "Zero bytes. Zero data. Zero opinions to share. The fetch to {host} failed before I got anywhere. Verify the URL works in your browser, then paste the full address (including the extension) back into the box above.",
];

const UNREACHABLE_CLOSINGS: string[] = [
  "Try a real URL. I'm right here.",
  "Re-paste with the correct extension. We'll go again.",
  "URL fix, then back to me. I'll be ready.",
];

const SCORE_REACTIONS: Record<string, string[]> = {
  excellent: [
    // 85+
    "Honestly? Solid. Most sites I see would kill for {score}.",
    "{score}. Not bad. Don't get cocky.",
    "OK fine, {host} is genuinely well-built. {score}/100. Rare.",
    "You scored {score}. That's an actual A. You can leave.",
  ],
  good: [
    // 65-84
    "{score}. Above average. Below great.",
    "{host} pulled a {score}. Respectable.",
    "Solid foundation. {score}. A few polish jobs from premium.",
    "{score}/100. You're in the 'fix three things and move up a tier' zone.",
  ],
  meh: [
    // 50-64
    "{score}. The swampy middle. Fixable. Just do it.",
    "Meh. {score}. Could be a lot worse. Could be a lot better.",
    "{host} scored {score}. Drowning in average.",
    "{score}/100. The 'forgettable' band. Climb out.",
  ],
  bad: [
    // 35-49
    "{score}. I've got opinions, mostly disappointment.",
    "{host} pulled a {score}. Visible from space.",
    "{score}/100. The PDF has the receipts. Get to work.",
    "You're hemorrhaging customers. {score}. Get moving.",
  ],
  terrible: [
    // <35
    "Honestly, call someone. {score}/100.",
    "{score}. The kind of site that makes me want to retire.",
    "{host} scored {score}. I'd recommend a candle and a fresh start.",
    "{score}. Burn it. Or use the tools below. Either works.",
  ],
};

const MIDDLE_DATA_TEMPLATES: string[] = [
  "Looked at it. {topFail} is the kicker. Plus {secondFail}. {recommendedTool} fixes most of it.",
  "Yeah — {topFail} is your big leak. Mobile Lighthouse came in at {lcp}ms LCP, which {lcpVibe}. Fix that first.",
  "Top of the failure list: {topFail}. After that, {secondFail}. Both fixable in a weekend if you actually try.",
  "Three things matter here: {topFail}, {secondFail}, and the fact you've owned this domain for {age} years and never bothered. {recommendedTool} would fix the first one in a day.",
  "Real talk: {topFail} is costing you customers. The Lighthouse number ({lhPerf}) says Google agrees. Fix the LCP, fix the perception.",
];

const CLOSINGS_BY_TIME: Record<TimeBlock, string[]> = {
  morning: [
    "Come back after lunch and I'll be sharper.",
    "Off to roast someone else. Good luck.",
    "Fix it. Or don't. Free country.",
  ],
  afternoon: [
    "Try again tonight. Or just fix it now.",
    "Next.",
    "Make it better. Or close the tab. Either way I'm moving on.",
  ],
  evening: [
    "I'm clocking out. You should too. After you fix this.",
    "See you tomorrow. Maybe.",
    "Go fix something. I'm done.",
  ],
  late: [
    "Sleep. Both of us.",
    "Bedtime. Yours. Mine. Maybe your site's.",
    "Tomorrow's another roast.",
  ],
  weeHours: [
    "Go to bed. Seriously.",
    "Both of us. Bed. Now.",
    "I'm done. You should be too.",
  ],
};

const CLOSINGS_BY_SCORE: Record<string, string[]> = {
  excellent: [
    "You're not why I'm tired. The bad ones are.",
    "Don't ruin it. Ship a regression and we'll talk.",
  ],
  good: [
    "Three fixes from an A. Pick one.",
    "You're close. Stop procrastinating.",
  ],
  meh: [
    "Pick one thing. Do it this week.",
    "Move. The PDF has the order.",
  ],
  bad: [
    "Hire a pro. Or fix it. Status quo isn't an option.",
    "The Lead Flow CTA is there for a reason.",
  ],
  terrible: [
    "Genuinely concerning. Get help.",
    "The tools below exist for sites like yours.",
  ],
};

// ============================================================================
// BUILDER FUNCTIONS
// ============================================================================

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatClockTime(d: Date): string {
  const h = d.getHours();
  const m = d.getMinutes();
  if (h === 0 && m === 0) return "midnight";
  if (h === 12 && m === 0) return "noon";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const period = h < 12 ? "am" : "pm";
  if (m === 0) return `${h12}${period}`;
  return `${h12}:${m.toString().padStart(2, "0")}${period}`;
}

function getTimeBlock(d: Date): TimeBlock {
  const h = d.getHours();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 18) return "afternoon";
  if (h >= 18 && h < 22) return "evening";
  if (h >= 22) return "late";
  return "weeHours";
}

function scoreBand(score: number): keyof typeof SCORE_REACTIONS {
  if (score >= 85) return "excellent";
  if (score >= 65) return "good";
  if (score >= 50) return "meh";
  if (score >= 35) return "bad";
  return "terrible";
}

function lcpVibe(lcp: number | null | undefined): string {
  if (lcp === null || lcp === undefined) return "we couldn't measure";
  if (lcp < 2500) return "Google calls 'good'";
  if (lcp < 4000) return "Google calls 'needs work'";
  return "Google calls 'poor' — and half your mobile visitors agree";
}

function tplVars(ctx: RoasterContext) {
  const a = ctx.audit;
  const failed = a.checks.filter((c) => c.status === "fail");
  const host = (() => {
    try {
      return new URL(a.url).hostname.replace(/^www\./, "");
    } catch {
      return a.url;
    }
  })();
  return {
    "{time}": ctx.timeStr,
    "{day}": ctx.dayName,
    "{N}": String(Math.max(1, ctx.countToday)),
    "{host}": host,
    "{score}": String(a.score),
    "{grade}": a.grade,
    "{topFail}": (failed[0]?.label || "the obvious stuff").toLowerCase(),
    "{secondFail}": (failed[1]?.label || "the rest").toLowerCase(),
    "{lcp}": String(a.lighthouse?.vitals.lcp ?? "?"),
    "{lhPerf}": String(a.lighthouse?.scores.performance ?? "?"),
    "{lcpVibe}": lcpVibe(a.lighthouse?.vitals.lcp),
    "{age}": String(a.domain?.ageYears ?? "?"),
    "{tech}":
      a.techStack?.cms ||
      a.techStack?.builder ||
      a.techStack?.platform ||
      "your stack",
    "{recommendedTool}": pickRecommendedTool(a),
  };
}

function pickRecommendedTool(a: AuditResult): string {
  const failed = new Set(a.checks.filter((c) => c.status === "fail").map((c) => c.id));
  if (failed.has("lcp") || failed.has("lh_performance")) return "NitroPack or WP Rocket";
  if (failed.has("https")) return "Hostinger";
  if (failed.has("contact") || failed.has("form")) return "Tally";
  if (failed.has("lh_seo")) return "Semrush";
  if (failed.has("lh_accessibility")) return "axe-core fixes";
  return "the tools listed below";
}

function applyTemplate(str: string, vars: Record<string, string>): string {
  let out = str;
  for (const [k, v] of Object.entries(vars)) {
    out = out.split(k).join(v);
  }
  return out;
}

// ============================================================================
// PUBLIC API
// ============================================================================

function isUnreachable(audit: AuditResult): boolean {
  // The audit failed to fetch the URL at all — buildErrorResult returns
  // a single check with id "reachable" and zero bytes/load.
  if (audit.bytes === 0 && audit.loadMs === 0) return true;
  if (audit.checks.length === 1 && audit.checks[0].id === "reachable") return true;
  return false;
}

export function buildContext(audit: AuditResult, countToday = 1, now = new Date()): RoasterContext {
  return {
    now,
    timeBlock: getTimeBlock(now),
    timeStr: formatClockTime(now),
    dayName: DAY_NAMES[now.getDay()],
    mood: pick<Mood>(["tired", "energized", "bored", "snarky"]),
    countToday,
    audit,
    exhausted: false,
    unreachable: isUnreachable(audit),
  };
}

/** Just the opening line — wraps the LLM roast. */
export function buildOpening(ctx: RoasterContext): string {
  const vars = tplVars(ctx);
  let pool: string[];
  if (ctx.unreachable) pool = UNREACHABLE_OPENINGS;
  else if (ctx.exhausted) pool = EXHAUSTED_OPENINGS;
  else pool = OPENINGS[ctx.timeBlock];
  return applyTemplate(pick(pool), vars);
}

/** Just the closing line — wraps the LLM roast. */
export function buildClosing(ctx: RoasterContext): string {
  const vars = tplVars(ctx);
  if (ctx.unreachable) {
    return applyTemplate(pick(UNREACHABLE_CLOSINGS), vars);
  }
  const band = scoreBand(ctx.audit.score);
  // 50/50 between time-based and score-based closings
  const pool =
    Math.random() < 0.5
      ? CLOSINGS_BY_TIME[ctx.timeBlock]
      : CLOSINGS_BY_SCORE[band];
  return applyTemplate(pick(pool), vars);
}

/** The middle paragraph — data-driven, used as fallback when LLM is down. */
export function buildMiddle(ctx: RoasterContext): string {
  const vars = tplVars(ctx);
  if (ctx.unreachable) {
    return applyTemplate(pick(UNREACHABLE_MIDDLES), vars);
  }
  const band = scoreBand(ctx.audit.score);
  const reaction = applyTemplate(pick(SCORE_REACTIONS[band]), vars);
  const data = applyTemplate(pick(MIDDLE_DATA_TEMPLATES), vars);
  return `${reaction} ${data}`;
}

/** Full template-only roast (when providers are unavailable, unconfigured, or scan unreachable). */
export function buildFallbackRoast(
  audit: AuditResult,
  countToday = 1,
  tone: FallbackTone = "provider-failed"
): string {
  const ctx = buildContext(audit, countToday);
  // unreachable was set in buildContext via isUnreachable detector
  if (!ctx.unreachable && tone === "provider-failed") ctx.exhausted = true;
  const opening =
    !ctx.unreachable && tone === "missing-provider-config"
      ? applyTemplate(pick(DATA_ONLY_OPENINGS), tplVars(ctx))
      : buildOpening(ctx);
  return [opening, buildMiddle(ctx), buildClosing(ctx)].join("\n\n");
}

/** Wraps an LLM-generated middle with personality opening + closing. */
export function wrapWithPersonality(
  audit: AuditResult,
  llmRoast: string,
  countToday = 1
): string {
  const ctx = buildContext(audit, countToday);
  return [buildOpening(ctx), llmRoast.trim(), buildClosing(ctx)].join("\n\n");
}
