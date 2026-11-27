# What works and what doesn't (read before writing any new page)

Built 27 Nov 2026 from the Bing Webmaster API (`apikey`, site `https://allmetalbrake.com/`, page and keyword
stats 29 May to 20 Nov, daily totals to 25 Nov) and Vercel Analytics (project `allmetalbrake`, search referrers
DuckDuckGo, Bing, Yahoo, Ecosia, Brave, 28 Oct to 27 Nov). Google is ignored on purpose. Update this file when
new data changes a verdict.

## The state of the site

- Bing clicks are **falling**: 7-8 a week in October, 2-4 a week in November. Impressions ~200-340 a week.
- 165 pages are live; about 20 got a search visitor in the last 30 days. The site is a sealer site that also
  carries mowers, flooring, water heaters and back shavers, and those pages earn nothing.

## What brings the clicks (Bing clicks since May / Vercel search visitors, 30 days)

| Page | Bing clicks | Impr | Vercel visitors (30 d) |
|---|---:|---:|---:|
| `/latex-ite-driveway-sealer-review/` | 20 | 566 | 3 |
| `/how-long-for-driveway-sealer-to-dry/` | 14 | 474 | 15 |
| `/best-asphalt-driveway-sealer-reviews/` | 8 | 316 | 4 |
| `/best-redwood-sealer/` | 7 | 186 | 1 |
| `/tekton-tools-review/` | 5 | 251 | 0 |
| `/ryobi-tools-review/` | 5 | 217 | 2 |
| `/best-polymeric-sand-for-pavers/` | 4 | 108 | 4 |
| `/best-marble-sealer/` | 3 | 142 | 10 |
| `/how-to-remove-moss-from-asphalt-driveway/` | 3 | 56 | 3 |
| `/best-basement-wall-sealer/` | 3 | 28 | 3 |

## Double down

1. **Driveway sealer cluster** (half of all clicks): sealer brand reviews like Latex-ite (DriveMaxx, Jetcoat,
   Gardner, Henry, Black Jack, SealMaster, Rust-Oleum EPOXYShield driveway), sealer how-long / when / what-
   temperature / rain questions, "<brand A> vs <brand B> driveway sealer" when Bing shows the pair (e.g.
   "drivemaxx vs latexite", "latexite ultrashield vs airport grade" both earned clicks).
2. **Stone and wood sealers by material** (marble, granite, redwood, teak, basement wall): next are quartzite,
   travertine, slate, limestone, cedar, ipe, concrete countertop follow-ups ("how often to seal granite").
3. **Tool brand "any good" reviews** (Tekton, Ryobi): Kobalt, Hart, Harbor Freight Icon, Craftsman, Hercules,
   Bauer, Gearwrench. Answer "are <brand> tools any good" in the first sentence.
4. **Paver / polymeric sand questions** (polymeric sand brands, how long to dry, haze removal).

## Stop (do not repeat)

- **A1. Nothing off-topic.** No mowers, flooring, water heaters, generators, shavers, lawn care, doors. The site
  ranks for sealers, coatings and tools; off-topic pages get 0 clicks and dilute the topic.
- **A2. No new "best <coating>" roundup without a Bing query.** `/best-garage-floor-epoxy/` has 117 impressions
  and 0 clicks; most of the 70+ "best" pages earn nothing.
- **A3. CTR before volume.** Rewrite title and description (exact query first, answer with a number) for pages with
  100+ impressions and CTR under 2%: `/best-garage-floor-epoxy/` (0%), `/best-granite-sealer/` (1.3%),
  `/ryobi-tools-review/` (2.3%), `/tekton-tools-review/` (2.0%). Latex-ite has 566 impressions but only 3 Vercel
  visitors in 30 days: check its title still matches "latex-ite driveway sealer reviews".
- **A4. Old metal-brake URLs** (`/products/...`, `/news/...` on the bare domain) still get Bing impressions. Make sure
  they 301 to the closest live page or 410; never rebuild them.
- **A5. A format is proven only after 14 days and 5+ live pages**; don't clone a type off one click.
