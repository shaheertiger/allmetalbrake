---
name: daily-publish
description: Daily publishing run for allmetalbrake.com (same process as enthusiastreview.com). Pull Bing Webmaster API data and Vercel Analytics, pick the 10 pages Bing and DuckDuckGo are rewarding, write them, validate, build, push and open a PR. Use when asked to "run the daily publish", "write today's pages", or by the daily scheduled task.
---

# Daily publish: data first, then 10 pages

Bing's index serves Bing, DuckDuckGo, Yahoo and Ecosia: about 90% of this site's search visits. Every run
starts from **today's** Bing and Vercel numbers. Never write a page before both data pulls succeed; if one
fails, stop and report the error instead of guessing topics.

## 1. Branch

```bash
git fetch origin main
git checkout -B claude/daily-publish-$(date -u +%F) FETCH_HEAD
npm ci
```

## 2. Bing Webmaster API (required)

```bash
node scripts/search-report.mjs --days 30 --json /tmp/bing-$(date -u +%F).json
```

Key: `BING_WEBMASTER_API_KEY` or `apikey` (cloud environment variable). The report lists on-topic queries,
pages Bing shows with their live status, and two opportunity lists:

1. **URLs Bing still shows that are not live** (301 or 410). Rebuilding these is the cheapest win: Bing already
   ranks the URL. If the slug is a redirect source in `vercel.json`, remove that redirect when the page is rebuilt.
2. **"generator for <job>" clusters with NO PAGE**, and any other query cluster with impressions and no page.

## 3. Vercel Analytics (required)

Vercel MCP, the allmetalbrake project (`list_projects` to find its id), team `team_pAoikpyeUpvHszE2JvWQKq7c`:

- `aggregate_pageviews` by `["referrerHostname"]`, last 30 days: confirms the search-engine mix.
- `aggregate_pageviews` by `["requestPath"]`, filter
  `referrerHostname in ('duckduckgo.com','bing.com','search.yahoo.com','ecosia.org','google.com','search.brave.com')`,
  limit 60, for the last 30 days and again for the last 2 days.

The winners tell you which **format** to copy: the page types and subjects search visitors land on.
The older home and yard guides (driveway sealers, deck stains, garage floors) still earn Bing clicks:
if one of those clusters is winning, its siblings count too.

## 4. Pick 10 pages

Order of priority, skipping any slug that already exists in `src/data/guides/` (or pair in `compares.json`):

1. Opportunity list 1 (URLs Bing shows that aren't live), most impressions first.
2. Opportunity list 2 (query clusters with no page).
3. Siblings of the Vercel winners in the same format: the next comparison pair people search, the same
   how-to or cost page for the next product, the next "best <product> for <job>".
4. Next items in `docs/ranking-method.md`.

Backup power first; home and yard only where Bing data shows demand. Write the 10 picks and the numbers behind each into the PR description.

## 5. Write

Follow `docs/content-schema.md` (house rules: no testing claims, no invented specs; products carry a 1-4 price `tier`, never an invented dollar band) and
copy the structure of the closest existing page of the same kind:

| Kind | Model page |
|---|---|
| Roundup | `src/data/guides/best-inverter-generator.json` |
| Generator for a job | `src/data/guides/best-generator-for-well-pump.json` |
| Explainer / lifespan / cost | `src/data/guides/how-long-does-a-generator-last.json` |
| Comparison | an entry in `src/data/compares.json` |
| Brand page | `src/data/guides/best-anker-solix-power-station.json` |

Only use product ids that exist in `src/data/products/`; only link pages that exist. Parallel subagents (one
or two pages each) are fine: give each the schema doc, the model page and the real Bing queries for its page.

## 6. Check

```bash
node scripts/validate-content.mjs
npm run build          # page dates, validate, astro build, Markdown twins
npm run audit:seo
```

Fix every error. Spot-check one built page in `dist/`.

## 7. Log, commit, PR

- Add a dated row to `docs/daily-log.md`: date, Bing impressions/clicks (last day and 30 days), top Vercel
  search landing pages, the 10 pages written.
- Push only when all 10 pages are written and validate, build and audit pass. Then commit, push the branch,
  open a PR into `main` titled
  `Daily publish YYYY-MM-DD: 10 pages from Bing + Vercel data`, and merge it: the site owner asked (22 Nov
  2026) for the daily run to merge its own PR once everything passes. If any check fails and can't be fixed,
  push nothing and report why.
