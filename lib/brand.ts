/**
 * Brand constants — change these in one place, the whole app updates.
 */

export const BRAND = {
  name: "RoastMySite",
  domain: "roastmysite.dev",
  prodOrigin: "https://roastmysite.dev",
  tagline: "Brutally honest website audits, free.",
  parent: "Zenova AI",
  parentUrl: "https://zenovaai.com",
  bookingUrl: "https://cal.com/josh-douglas-automation-consultant/roast-breakdown",
  bookingProfileUrl: "https://cal.com/josh-douglas-automation-consultant",
  bookingShortLabel: "Book a free roast breakdown",
  authorHandle: "@joshdouglasbuilds",
} as const;

/** Email-encoded mailto fallback in case Cal.com is down */
export const BACKUP_EMAIL = "officialzenovaai@gmail.com";

/** Direct deep-links to specific event types */
export const CAL_EVENTS = {
  roastBreakdown: BRAND.bookingUrl,
  profile: BRAND.bookingProfileUrl,
} as const;
