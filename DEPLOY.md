# RoastMySite — 45-Minute Deploy Guide

Cost: **~$13/yr** (`.dev` domain) ≈ **$1.10/mo recurring**. Everything else is free tier.

---

## Pre-flight: what you'll have at the end

- Live URL: **https://roastmysite.dev**
- Real Lighthouse audits via Google's PSI API (free, 25k req/day)
- AI roast via Groq Llama 4 Scout (free, 1k req/day) with Gemini fallback (free, another 1k/day)
- Personality-templated fallback when both LLMs are rate-limited ("Going to bed, see you tomorrow")
- localStorage history — visitors see their past audits, no accounts
- Affiliate links wired (you'll add real IDs)
- Embed badges so other sites link back to you

---

## Step 1 — Buy the domain (5 min, $0.98)

1. Go to [Namecheap](https://www.namecheap.com)
2. Search for `roastmysite.dev`
3. Buy it ($0.98 first year, $2.88/yr renewal)
4. Skip every upsell (no WhoisGuard upsell — Namecheap includes it free now)
5. **Important**: in the Namecheap dashboard for the domain, go to "Nameservers" and set to **Vercel** (we'll grab the exact nameserver values from Vercel later)

---

## Step 2 — Sign up for the free APIs (15 min total)

### Groq (primary AI roast)

1. Go to [console.groq.com](https://console.groq.com)
2. Sign in with Google (free)
3. Go to "API Keys" → **"Create API Key"**
4. Copy the key (starts with `gsk_...`). **Save it.**

### Google Gemini (fallback AI roast)

1. Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Click "Create API key" → "Create API key in new project"
3. Copy the key. **Save it.**

### Google PageSpeed Insights (real Lighthouse)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. If no project exists: create one (free)
3. Search the top bar for "PageSpeed Insights API" → click → **"Enable"**
4. Left sidebar → "Credentials" → "Create Credentials" → "API key"
5. Copy the key. **Save it.**

You now have three keys. Keep them somewhere safe (a notes file, password manager).

---

## Step 3 — Push the code to GitHub (5 min)

```bash
cd "c:/Josh/Projects/RoastMySite"
git init
git add .
git commit -m "initial commit"
gh repo create RoastMySite --private --source=. --push
```

If you don't have the `gh` CLI: create a new private repo at github.com/new manually, then:

```bash
git remote add origin git@github.com:joshdouglas/RoastMySite.git
git branch -M main
git push -u origin main
```

---

## Step 4 — Deploy to Vercel (10 min)

1. Go to [vercel.com](https://vercel.com), sign in with GitHub
2. Click **"Add New" → "Project"**
3. Pick the `RoastMySite` repo → **Import**
4. Framework: should auto-detect Next.js ✓
5. Before clicking Deploy, expand **"Environment Variables"** and paste:

| Name | Value |
|---|---|
| `GROQ_API_KEY` | (your Groq key) |
| `GEMINI_API_KEY` | (your Gemini key) |
| `PSI_API_KEY` | (your PSI key) |

6. Click **Deploy**
7. Wait ~3 minutes for the first build to finish

You should now have a `roastmysite-xxx.vercel.app` URL that works. Try scanning `example.com` — if you get a score + roast, **the API keys are wired correctly**.

---

## Step 5 — Connect your domain (10 min)

1. In Vercel: Project → **Settings → Domains**
2. Add **`roastmysite.dev`** and **`www.roastmysite.dev`**
3. Vercel will give you nameservers (something like `ns1.vercel-dns.com` and `ns2.vercel-dns.com`)
4. Go back to Namecheap → Domain List → Manage → Nameservers
5. Switch to **"Custom DNS"** and paste Vercel's two nameservers
6. Save

DNS propagation takes **5 minutes to 2 hours**. While you wait, do Step 6.

---

## Step 6 — Apply for affiliate programs (15 min)

Once approved (1-3 days), you'll replace the `REPLACE_AFFILIATE_ID` placeholders in [lib/affiliates.ts](lib/affiliates.ts) with your real IDs. Until then, the tool works fine — clicks just don't pay you.

Top 5 to apply for, in order of commission value:

1. **Hostinger** — apply at [hostinger.com/affiliates](https://www.hostinger.com/affiliates) — ~$100-150/sale
2. **Semrush** — apply at [semrush.com/affiliates](https://www.semrush.com/lp/affiliate-program/en/) — ~$200/sale
3. **Squarespace** — apply at [squarespace.com/affiliates](https://www.squarespace.com/affiliates) — ~$100/sale
4. **Webflow** — apply at [webflow.com/affiliates](https://webflow.com/affiliates) — ~$50-200 + recurring
5. **BrightLocal** — apply at [brightlocal.com/affiliate](https://www.brightlocal.com/affiliate) — ~$40/sale, perfect for local-business audits

Optional / lower priority: Cloudways, ConvertKit, Beehiiv, NitroPack, Tally, Calendly.

---

## Step 7 — Quick post-deploy checks

Once `https://roastmysite.dev` resolves:

- [ ] Visit the home page — should look like the landing page
- [ ] Scan `example.com` — should return a score + screenshots + roast
- [ ] Check the roast — should NOT contain the word "AI" or "language model" anywhere
- [ ] Try `/compare?you=stripe.com&them=square.com` — should run both
- [ ] Try the share button — should copy a URL like `roastmysite.dev/?url=...`
- [ ] Open that URL in a private window — should auto-rescan
- [ ] Scan a few more sites — your "Recent audits" should populate on the home page
- [ ] Check Vercel function logs for any errors

---

## Step 8 — Set up analytics (5 min)

Use **Cloudflare Web Analytics** (free, cookieless, no consent banner needed):

1. Go to [cloudflare.com](https://www.cloudflare.com) → sign up free
2. Dashboard → **Web Analytics** → "Add a site"
3. Enter `roastmysite.dev` → choose "Free"
4. Cloudflare gives you a `<script>` tag — copy it
5. Paste into `app/layout.tsx` inside the `<body>` (or in the `<head>` via `next/script`)
6. Redeploy

Now you have privacy-friendly traffic data with zero cookie banners.

---

## What it costs you per month

| Item | Cost |
|---|---|
| Domain renewal (year 2+) | **$0.24/mo** ($2.88/yr for `.online`) |
| Vercel Hobby plan | $0 |
| Groq API (1k roasts/day free) | $0 |
| Gemini API (1k roasts/day free) | $0 |
| PSI API (25k Lighthouse/day free) | $0 |
| Cloudflare Web Analytics | $0 |
| **TOTAL** | **~$0.24/mo** |

The cheapest viable monetized SaaS-style web product setup in 2026.

---

## What to do if something breaks

| Problem | Fix |
|---|---|
| Function times out on scans | Vercel Hobby is 60s default → 300s with Fluid Compute (free, enable in Project Settings → Functions) |
| Roast keeps showing "Roaster's drained" | Check that both `GROQ_API_KEY` and `GEMINI_API_KEY` env vars are set in Vercel. Redeploy after adding env vars. |
| Lighthouse scores are missing | Verify `PSI_API_KEY` is set and the PageSpeed Insights API is **enabled** in your Google Cloud project. |
| Screenshots fail | The serverless build needs `@sparticuz/chromium` — should be auto-included via `playwright` import. Check Vercel build logs for "libnspr4.so" errors and follow the [official fix guide](https://github.com/Sparticuz/chromium). |
| Compare mode shows "Lighthouse missing for second site" | Known: two PSI calls in parallel can rate-limit. Try in a few seconds, or add `PSI_API_KEY` if not set (raises rate limit). |
| Domain not resolving after 2 hours | Re-verify the nameservers in Namecheap match what Vercel shows. DNS can take up to 48hr in rare cases. |

---

## Optional — set up the daily auto-roast Twitter bot

Once everything's live, this is the viral-distribution engine I'd build next as a separate Claude Code skill:

- Cron-fires at 8am EST daily
- Picks a famous site
- Runs the audit
- Posts to X with the share URL
- 365 tweets/year, $0 cost, 365 chances for virality

Ping me when you want it. For now — ship this, get the affiliate IDs in, walk away.
