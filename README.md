# All Metal Brake — allmetalbrake.com

Backup power buying guides (home generators, portable power stations, home batteries,
transfer switches and outage gear), built with [Astro](https://astro.build/) and deployed on Vercel.

On Nov 19, 2026 the site was cut to this one topic: every off-topic page (driveways,
concrete, garage floors, basements, water, yard, tools, mattresses and more) was deleted and
301-redirected in `vercel.json`, to the closest backup-power guide where one exists and to
the home page otherwise.

The site uses the same structure as [besthometheatre](https://github.com/shaheertiger/besthometheatre):
best lists, brand reviews and guides rendered from JSON, plus a product database (`/gear/`),
head-to-head comparisons (`/compare/`), brand pages, a glossary and calculators. Writing rules
are in [`docs/CONTENT_GUIDE.md`](docs/CONTENT_GUIDE.md); search strategy in
[`docs/bing-playbook.md`](docs/bing-playbook.md).

## Commands

| Command | Action |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Dev server |
| `npm run qa` | Content gates: format, 2,500 words, 5 mistakes, 7 FAQs, links, duplicate keywords |
| `npm run build` | `qa` + `astro build` + post-build audit (broken links, JSON-LD, titles, H1s) |
| `npm run topics` | The two thinnest clusters and the intents they are missing (daily run) |
| `npm run images:fetch` | Amazon Creators API product photos and ASINs (strict matching) |
| `npm run indexnow` | Submit sitemap URLs to IndexNow |

## Where things live

- `src/content/articles/*.json` — every article (`kind`: roundup, review, guide)
- `src/content/products/<category>.json` — the product database
- `src/data/site.ts` — site name, Amazon tag, AdSense ID, category labels
- `src/data/nav.ts` — header, mobile menu and footer
- `src/data/compares.ts`, `src/data/glossary.ts` — comparison pairs and glossary terms
- `src/pages/` — one template per page type
- `scripts/` — content QA, build audit, topic picker, Amazon image fetch, IndexNow
- `.claude/skills/daily-publish/` — the ten-articles-a-day run
