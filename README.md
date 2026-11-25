# All Metal Brake

Independent backup power buying guides at [allmetalbrake.com](https://www.allmetalbrake.com), built with Astro.

## Same template as enthusiastreview.com

This site runs the exact template of [enthusiastreview.com](https://www.enthusiastreview.com)
(repo `shaheertiger/enthusiastreview`). Every file below is **byte-identical** in both repos:
`src/components/` (except `LogoMark.astro`), `src/layouts/`, `src/lib/`, `src/styles/`, the page
templates in `src/pages/`, `scripts/` (except `lib/match.mjs`), `middleware.js`, `astro.config.mjs`,
`tsconfig.json`. Change them in one repo, then copy them to the other.

What differs between the two sites lives only in:

| File | What it holds |
|---|---|
| `site.config.json` | name, URL, logo text, score name, AdSense ID, IndexNow key, llms.txt intro, Bing report filters |
| `src/data/niche.ts` | quick nav, hub and home page copy, compare rules, interlinking series |
| `src/data/categories.ts`, `nav.ts`, `authors.ts` | categories, the Best Lists menu, the author profile |
| `src/data/guides/`, `products/`, `brands.json`, `compares.json`, `glossary.json`, `catalog.json` | content |
| `src/pages/{about,contact,privacy,disclosure,how-we-review}.astro`, `src/pages/tools/*-calculator.astro` | prose pages and calculators |
| `legacy-routes.js`, `vercel.json`, `public/` | old-URL rules, redirects, static files |

Content format: [`docs/content-schema.md`](docs/content-schema.md). Products carry a 1-4 price `tier`
instead of a dollar band.

## Commands

| Command | Action |
|---|---|
| `npm run build` | page dates, content validation, Astro build, Markdown twins, IndexNow (production only) |
| `npm run validate` | content checks only |
| `npm run audit:seo` | on-page audit of `dist/` |
| `npm run indexnow` | submit the live sitemap to IndexNow |
| `node scripts/search-report.mjs` | Bing Webmaster API report (needs `BING_WEBMASTER_API_KEY`) |
