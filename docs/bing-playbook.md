# Bing Playbook

The site is a Bing site: 98.5% of search visitors (Nov 13, 2026 baseline, 30 days)
came through Bing-powered engines (Bing, DuckDuckGo, Yahoo, Ecosia, Qwant, Copilot).
Judge every change by **Bing Webmaster Tools** data, not Google.

## What the data proved

| Works | Evidence | Rule |
| --- | --- | --- |
| "Best X" buying-guide queries | 8.6% CTR vs 1.5% for other query types | Build around "best X" pages; how-tos feed them |
| The year in query and title | "best … 2026" clicks at 15.6% vs 6.2% without | Every buying-guide title carries "in 2026" |
| Position 1 on a "best" query | 19-77% CTR at #1 | Push pages from #2-5 to #1 before writing new ones |
| Depth around a winning pillar | Generator cluster: pillar became the #1 page | Add supporting pages to clusters that already win |
| Numbered question H2s with H3s | Converted pages +93% to +265% visitors | Every page uses the format (format gate) |
| "What actually works" how-tos | oil-on-concrete is the #2 page | A how-to beside each guide |

| Fails | Evidence | Rule |
| --- | --- | --- |
| Off-topic pages | "buzz cut" 1,958 impressions, 1 click | Home improvement and outdoor power only |
| Bare head terms | "basement waterproofing" 0.42% CTR at #2.6 | Win the "best" and how-to versions |
| Brand-name queries | "jackery" 247 impr., 0 clicks | No pages for a bare brand name |
| Fighting the season | Driveway sealer clicks halve in autumn | Refresh seasonal pages 4 weeks before the season |
| Automatic Amazon matching | 228 of 228 matches wrong | Exact-model check on every link |

## On-page rules (enforced by `npm run validate:seo` in the build)

- **Title, 50-65 chars, leading with the query.**
  Buying guide: `<N> Best <Product> in 2026: <deciding factor>`.
  How-to: `How to <task>: <the promise>`.
  Head term with no "best": `Basement Waterproofing: Best Systems, DIY Fixes and Costs (2026)`.
  Never "Tested" unless the test happened.
- **One H1** that repeats the title's query words.
- **Meta description, 110-160 chars**, written as ad copy: the answer or deciding
  factor plus who it is for. Bing shows it as written.
- **Answer first.** Guides render `QuickAnswer.astro` under the H1: the #1 pick and
  its bottom line, from the page's own `PRODUCTS`. One fact per sentence.
- **Format:** picks + comparison table near the top, numbered question H2s with H3s,
  FAQ (7), Mistakes (5), Everything Else, Related, Bottom Line. 2,500+ words.
- **Internal links:** pillar + two siblings out; pillar and top-traffic neighbour in.

## Owner override: mattresses (Nov 13, 2026)

The owner chose to publish a mattress cluster (indexed) despite the off-topic rule,
based on a Bing keyword export ("top rated mattresses", "best mattress for back pain",
"best mattress topper"...). Do not noindex or remove it. Judge it like any cluster in
Bing Webmaster Tools after 2-3 weeks; if it draws impressions without clicks, raise it
with the owner before changing anything. Pages: best-mattress (pillar),
best-mattress-for-side-sleepers, best-mattress-for-seniors, best-mattress-topper.

## Trust rules

- Never invent a test, measurement, price, spec or result. Most guides are built
  from spec sheets, labels and owner reports and must say so. Attribute claims:
  "rated for", "the label specifies", "owners commonly report".
- Off-topic pages are noindexed via `scripts/noindex.mjs` (dropped from the sitemap,
  nav, best-of, llms.txt and generated links). Delete + 301 once they get no traffic.
- Dates are real: `scripts/unshallow-for-dates.mjs` + `scripts/git-dates.mjs` feed
  article dates and sitemap `<lastmod>`. Never touch a page only to move its date.

## Technical setup

| Item | Status |
| --- | --- |
| Page dates / sitemap lastmod | From git history; shallow-clone safe |
| IndexNow | `postbuild` submits the sitemap on every production deploy |
| Sitemap | `/sitemap-index.xml`; `priorityGuides` in `astro.config.mjs` |
| Bing verification | Set `PUBLIC_BING_SITE_VERIFICATION` in Vercel (msvalidate.01), or verify by DNS |
| robots.txt, llms.txt | Open to search and AI crawlers |
| Redirects | 301 every retired slug in `vercel.json`; never leave a 404 |

## Routine

**Weekly (30 min):** export Bing Webmaster Tools keyword + page reports into
`content/bing/`; fix titles/descriptions for high-impression, low-CTR queries first;
check pages that dropped 3+ positions (seasonal before changing anything).

**Monthly (1 h):** Site Scan, Backlinks, refresh pages whose season starts within
four weeks (`SEASONAL` list in `src/pages/index.astro`), re-run the site audit.

## Being tested (check in 2-3 weeks against the Nov 13 baseline)

- Query-first titles on basement waterproofing, portable power station, driveway
  sealer, polymeric sand, gutter guards.
- "in 2026" on every buying-guide title; Short answer line under every guide H1.
- Real page dates and sitemap lastmod (previously every URL said "today").

| Metric | Nov 13 baseline |
| --- | --- |
| Search visitors (30 days) | 17,542 |
| Share from Bing-powered engines | 98.5% |
| CTR on "basement waterproofing" | 0.42% |
