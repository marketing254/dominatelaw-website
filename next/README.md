# Dominate Law — Next.js Site

Next.js 15 (App Router) rebuild of dominatelaw.com. Lives in `/next` alongside the
legacy static site, which keeps serving production until DNS cutover.

## Run locally
```bash
cd next
npm install
npm run dev        # http://localhost:3000
npm run build      # verify all pages prerender
```

## Architecture
- **Data**: `lib/sheets.js` fetches the Google Sheet (podcasts, webinar-replays, events, reviews)
  **server-side** with ISR (`revalidate: 3600`). New sheet rows appear within an hour —
  no redeploy, no manual slug/sitemap/llms.txt edits ever.
- **Episodes**: `/podcast-episode/[slug]` — SSG, real HTML for Google/Bing/AI crawlers.
  Legacy `?ep=slug` URLs 301-redirect (next.config.mjs).
- **Webinar replays**: separate section `/webinar-replays` (+ `[slug]`), in the navbar
  under "Events & Webinars" dropdown. Legacy `/webinar-replay/?replay=` URLs 301.
- **SEO/AI**: auto-generated `sitemap.xml`, `robots.txt` (10 AI crawlers allowed), `llms.txt`;
  Organization/PodcastEpisode/VideoObject/Event/Person JSON-LD; security headers (HSTS etc.);
  Metadata API canonicals on every page; IndexNow key in `/public`.
- **Forms**: all post to the same Apps Script (Sheet + team emails) + Kit forms in parallel.
  Gate unlocks stored in localStorage (same keys as legacy site).
- **MSM CTA**: `components/MsmCta.js` on every episode/replay page + navbar button → `/msm`.

## Deploy to Vercel
1. Push this repo to GitHub (the `/next` folder can stay in the same repo).
2. Vercel → New Project → import repo → **Root Directory: `next`** → Deploy.
3. Test everything on the `*.vercel.app` preview URL (it is auto-noindexed).
4. DNS cutover (zero downtime):
   - Lower TTL on `www` + apex to 300s, 3 days ahead.
   - Vercel → Project → Domains → add `www.dominatelaw.com` + `dominatelaw.com`.
   - Flip records: `www` CNAME → `cname.vercel-dns.com`; apex A → `76.76.21.21`.
   - **Leave GitHub Pages running for 7 days** after the flip, then decommission.
5. Post-cutover: GSC needs no change (Domain property). Re-run IndexNow, request
   indexing on top episode URLs.

## Not yet ported
- Blog pages (deferred by owner decision — old `/blog/*` still on legacy site).
- Newsletter popup (decide whether to re-add after launch).
