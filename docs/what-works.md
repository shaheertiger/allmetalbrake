# What works and what doesn't (read before picking or writing any page)

The daily-publish skill reads this file before it picks pages. **The STOP rules (A1-A5) override the
picking order in `.claude/skills/daily-publish/SKILL.md`.** Update this file when new data changes a verdict;
never delete a page because of it.

Built 27 Nov 2026 from the Bing Webmaster API (`apikey`, site `https://allmetalbrake.com/`, page and keyword
stats 29 May to 20 Nov, daily totals to 25 Nov) and Vercel Analytics (project `allmetalbrake`, search referrers
DuckDuckGo, Bing, Yahoo, Ecosia, Brave, 28 Oct to 27 Nov). Google is ignored on purpose. Ported to `main` the
same day from the old `.astro` codebase's `docs/WHAT-WORKS.md`; the numbers are unchanged.

## Site positioning vs. what the data shows

`README.md` and `docs/bing-playbook.md` describe this site as a backup power site (owner decision, 19 Nov 2026),
with driveway, sealer, tool and other home-and-yard pages revived on 23 Nov because they still earn Bing clicks.
The data below says plainly where clicks come from: **driveway and sealer pages and tool-brand reviews.** No
backup-power page appears among the pages that earned Bing clicks between 29 May and 20 Nov. Most of that window
predates the backup-power pages, so this is not a verdict on them yet; judge them by rule A5. Changing the site's
positioning is the owner's call, not the daily run's.

## The state of the site

- Bing clicks are **falling**: 7-8 a week in October, 2-4 a week in November. Impressions about 200-340 a week.
- About 20 pages got a search visitor in the last 30 days. Pages on mowers, flooring, water heaters and back
  shavers earned nothing in that window.

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

1. **Driveway sealer cluster** (half of all clicks): sealer brand reviews like Latex-ite (Drive-Maxx, Jetcoat,
   Gardner, Henry, Black Jack, SealMaster, Rust-Oleum EPOXYShield driveway), sealer how-long / when / what-
   temperature / rain questions, and "<brand A> vs <brand B> driveway sealer" when Bing shows the pair
   ("drivemaxx vs latexite" and "latexite ultrashield vs airport grade" both earned clicks).
   Live on main: `latex-ite-driveway-sealer-review`, `black-jack-vs-latex-ite-driveway-sealer`,
   `latex-ite-ultra-shield-vs-airport-grade`, `black-jack-drive-maxx-review`,
   `how-long-does-driveway-crack-filler-take-to-dry`.
2. **Stone and wood sealers by material** (marble, granite, redwood, teak, basement wall): next are quartzite,
   travertine, slate, limestone, cedar, ipe, concrete countertop follow-ups ("how often to seal granite").
3. **Tool brand "any good" reviews** (Tekton, Ryobi): Kobalt, Hart, Harbor Freight Icon, Craftsman, Hercules,
   Bauer, Gearwrench. Answer "are <brand> tools any good" in the first sentence.
4. **Paver / polymeric sand questions** (polymeric sand brands, how long to dry, haze removal). Live on main:
   `sika-fastfix-vs-gator-maxx-vs-techniseal`.

## Stop (do not repeat)

- **A1. Nothing off-topic.** No mowers, flooring, water heaters, shavers, lawn care or doors. The site earns
  clicks for sealers, coatings and tools; off-topic pages got 0 clicks and dilute the topic. (The old-codebase
  version of this rule also listed generators. On main, backup power is the owner's chosen focus, so this file
  does not ban it; apply A2 and A5 to backup-power pages like any other cluster.)
- **A2. No new "best <coating>" roundup without a Bing query.** `/best-garage-floor-epoxy/` had 117 impressions
  and 0 clicks; most of the 70+ "best" pages earn nothing.
- **A3. CTR before volume.** Rewrite the title and description (exact query first, answer with a number) for
  pages with 100+ impressions and CTR under 2%: `/best-garage-floor-epoxy/` (0%), `/best-granite-sealer/` (1.3%),
  `/ryobi-tools-review/` (2.3%), `/tekton-tools-review/` (2.0%). Latex-ite had 566 impressions but only 3 Vercel
  visitors in 30 days: keep its title matched to "latex-ite driveway sealer reviews".
  Done 27 Nov on main where the main version did not already lead with the query: garage floor epoxy, cinder
  block, Ryobi, Latex-ite. Tekton and granite already led with the query and an answer; left as they were.
  Re-check CTR after 14 days.
- **A4. Old metal-brake URLs** (`/products/...`, `/news/...`) still get Bing impressions. They answer 410 Gone
  from `legacy-routes.js` (added 27 Nov; they were 404 before). Never rebuild them.
- **A5. A format is proven only after 14 days and 5+ live pages**; don't clone a type off one click.
