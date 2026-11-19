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

## Cross-site evidence (Nov 19, 2026 keyword exports)

Bing keyword reports from four sister review sites (thehonestreviewers.com,
treadmillreviewsusa.com, hairgrowthreviews.com, best-proteinpowder.com; 5,600 queries)
point the same way as this site's own data. CTR by query type:

| Query type | Honest Reviewers | Treadmill | Hair | Protein | Rule |
| --- | --- | --- | --- | --- | --- |
| Question ("is/does/can/should …") | 40.5% | 15.9% | 20.3% | 3.3% | Answer the question in the H1 and first sentence |
| "How long does X last / take" | 36.0% | 22.0% | 22.2% | — | A lifespan page beside each big pillar |
| How-to | 19.4% | 21.1% | — | — | Keep pairing a how-to with each guide |
| "X vs Y" | 8.2% | 21.1% | 12.5% | 30.8% | Write the head-to-heads buyers search |
| "best … 2026" | 11.4% | 17.4% | 8.0% | — | Year stays in every guide title |
| Cost / price (top 3) | — | 11.7% | — | — | "How much does a treadmill cost" is that site's #1 page (45 of 351 clicks) |
| Black Friday / deals | — | 13.3% | — | — | Timing pages get clicks in November; never invent prices |
| Bare "best X" head terms at #5-9 | 1.1% | 4.2% | — | — | 48k impressions on "best portable power stations" at #5 = 1 click: push to #1-2 |

Applied Nov 19: `how-long-does-a-generator-last` and `best-time-to-buy-a-generator`
(Black Friday is Nov 27); "whole house generator cost" (878 impr. at #9) moved into the
Generac cost title. Check these in 2-3 weeks.

## One topic: backup power (owner decision, Nov 19, 2026)

The owner chose to focus the whole site on its biggest winner, backup power
("home generators for power outages" 128 clicks, "best portable power stations" 48k
impressions). 154 off-topic pages were deleted and 301-redirected (`vercel.json`): driveway
and concrete sealing, garage floors, basements and mold, water, deck and exterior, yard and
lawn, tools, appliances, mattresses and gadget pages. This replaces the earlier
"home improvement and outdoor power" scope and the mattress override below.

- New pages must be about backup power: generators, power stations, home batteries,
  solar for backup, transfer switches, surge protection, and outage essentials.
- Grow depth around the pillars (`best-home-generator-for-power-outages`,
  `best-portable-power-station`) with question, cost, lifespan and "X vs Y" pages;
  those query types click at 15-40% across all five sites.
- Do not recreate a deleted slug; its 301 is live.

## On-page rules (enforced by `npm run qa` in the build; field format in `docs/CONTENT_GUIDE.md`)

- **Title, 50-65 chars, leading with the query.**
  Buying guide: `<N> Best <Product> in 2026: <deciding factor>`.
  How-to: `How to <task>: <the promise>`.
  Head term with no "best": `Basement Waterproofing: Best Systems, DIY Fixes and Costs (2026)`.
  Never "Tested" unless the test happened.
- **One H1** that repeats the title's query words. Buying guides use the sister
  site's winning form: `The <N> Best <Product> in 2026` (a "reviews" query keeps its
  word: `Laser Level Reviews: The 7 Best Laser Levels in 2026`).
- **Guide order (owner decision, Nov 18, 2026, copied from The Honest Reviewers):**
  H1 → Short Answer box (`QuickAnswer`) → picks row → **H2 1 = the product cards**
  (`The <N> Best <Product> in 2026, Ranked`) → H2 2 = `<Search>: The Short Answer`
  → the numbered question H2s. New roundups: `picksAfter: 0` in the scaffold spec.
- **Not copied from the sister site:** "Tested & Ranked" headings and test
  measurements (nothing was tested), and star ratings/review counts. The Amazon
  Creators API returns `customerReviews` as empty for this account (checked Nov 18,
  2026), so there are no real figures to show; cards stay without stars.
- **Meta description, 110-160 chars**, written as ad copy: the answer or deciding
  factor plus who it is for. Bing shows it as written.
- **Answer first.** Guides render `QuickAnswer.astro` under the H1: the #1 pick and
  its bottom line, from the page's own `PRODUCTS`. One fact per sentence.
- **Format:** picks + comparison table near the top, numbered question H2s with H3s,
  FAQ (7), Mistakes (5), Everything Else, Related, Bottom Line. 2,500+ words.
- **Internal links:** pillar + two siblings out; pillar and top-traffic neighbour in.

## Owner override: mattresses (Nov 13, 2026) — superseded Nov 19: pages deleted

The owner chose to publish a mattress cluster (indexed) despite the off-topic rule,
based on a Bing keyword export ("top rated mattresses", "best mattress for back pain",
"best mattress topper"...). Do not noindex or remove it. Judge it like any cluster in
Bing Webmaster Tools after 2-3 weeks; if it draws impressions without clicks, raise it
with the owner before changing anything. Pages: best-mattress (pillar),
best-mattress-for-side-sleepers, best-mattress-for-seniors, best-mattress-topper.

## Sister-site keyword map (Nov 18, 2026) — only the backup-power rows still apply after the Nov 19 refocus

Source: `content/bing/thehonestreviewers-keywords-2026-11-18.csv` (the site these
guides came from) against `content/bing/allmetalbrake-keywords-2026-11-18.csv` (ours).
Rule: **copy what earns clicks there, not what earns impressions.** Every query below
clicked on the sister site; each now has an owner page here that carries its wording.

| Winning query there (clicks, CTR, position) | Owner page here | Done |
| --- | --- | --- |
| home generators for power outages (21, 7.3%, #1.7) + 8 variants | `best-home-generator-for-power-outages` | Already matched |
| best solar power bank (9, 12.9%, #1.4), solar charger power bank | `best-solar-power-bank` | H1 adds "Solar Charger" |
| best gas water heaters 2026 (7, 41%, #1.4), water heaters gas | `best-gas-water-heater` | Already matched |
| most reliable refrigerator brand(s) 2026 (6 across 3 variants, 20-37%) | `most-reliable-refrigerator-brands` | **New page** |
| best zero turn mowers 2026 (4, 20%, #1) | `best-zero-turn-mower` | Already matched |
| cost to install generac whole house generator, cost of generac generator installed | `generac-generator-cost` | Title/H1/description add "Installed" and "Whole House" |
| moss killer for driveways (2, 40%, #1.2) | `how-to-remove-moss-from-asphalt-driveway` | Description adds "moss killer for driveways" |
| is ryobi a good brand, ryobi tools vs milwaukee | `ryobi-tools-review` | H1 asks "Is Ryobi a Good Brand?" (we sit at #9 for "are ryobi tools good") |
| laser level reviews (1, #2.4) | `best-laser-level` | Title and H1 lead with "Laser Level Reviews" |
| best mould remover, mold remover for walls, best mold removal | `best-mold-remover` | H1 adds "for Walls, Wood and Grout" |
| water filtration system for home, best water filter pitcher, best ceiling paint, best shop vac, garage floor epoxy/tiles, basement floor paint, floor paint for concrete, oil remover for concrete, best wall stud finder 2026, best self propelled lawn mowers 2026, best weed killer spray, best indoor heater without electricity, silane vs siloxane, latex-ite vs black jack, best drain snake, log splitter comparison, best circuit breaker finder | existing guides of the same name | Already matched |

**Not copied, on purpose** (impressions without clicks there, or off-topic):
"water filtration and storage" (1,243 impr. at #1.1, 0 clicks), "whole house generator
cost" (448, #8.9, 0 clicks; covered by `generac-generator-cost` wording anyway),
"buzz cut", "basement waterproofing" (bare head term, 0 clicks at #2.8), "most reliable
radiator heaters" (516, #5.2, 0 clicks), "ceiling fan direction", "diy garden
landscaping ideas".

**Next candidates if they keep clicking there:** how long should a dishwasher last
(1 click), cordless snow blowers/shovels (EGO and Greenworks comparisons, 2 clicks; in
season now), best jigsaw, best drill press (1 click each).

## Trust rules

- Never invent a test, measurement, price, spec or result. Most guides are built
  from spec sheets, labels and owner reports and must say so. Attribute claims:
  "rated for", "the label specifies", "owners commonly report".
- Off-topic pages are noindexed via `scripts/noindex.mjs` (dropped from the sitemap,
  nav, best-of, llms.txt and generated links). Delete + 301 once they get no traffic.
- Dates are real: `scripts/unshallow-for-dates.mjs` + `scripts/git-dates.mjs` feed
  article dates and sitemap `<lastmod>`. Never touch a page only to move its date.

## Technical setup (besthometheatre template since Nov 19, 2026)

| Item | Status |
| --- | --- |
| Content | JSON in `src/content/articles/` and `src/content/products/`, one template per page type |
| Page types | Best lists, brand reviews, guides, `/gear/` product pages, `/compare/`, `/brands/`, `/glossary/`, `/tools/` |
| Page dates / sitemap lastmod | `published` / `updated` in each article JSON |
| Sitemaps | `/sitemap-index.xml`, split per template (pages, gear, compare, brands, glossary), with product images |
| IndexNow | `postbuild` submits the sitemap on every production deploy |
| Bing verification | Set `PUBLIC_BING_SITE_VERIFICATION` in Vercel (msvalidate.01), or verify by DNS |
| robots.txt, llms.txt, `/<slug>.md` | Generated by the template; open to search and AI crawlers |
| Redirects | 301 every retired slug in `vercel.json`; never leave a 404. Author pages → `/about/` |
| Ads and analytics | AdSense Auto ads (`adsenseId` in `src/data/site.ts`), Vercel Web Analytics |

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
