---
name: daily-publish
description: The daily article run. Publishes ten backup-power articles as JSON (five into each of the two thinnest clusters), links them in, runs every gate, and pushes to main. Use when the daily publishing Routine fires, or when asked to run the daily batch manually.
---

# Daily publish run

The site runs on the besthometheatre template: every article is a JSON file in
`src/content/articles/`, rendered by `src/pages/[slug].astro`. Read
`docs/CONTENT_GUIDE.md` (field-by-field format) and `docs/bing-playbook.md` (why) first.
Backup power only: generators, power stations, home batteries, solar for backup,
transfer switches, surge protection and outage essentials.

Ten articles a day (owner, Nov 19, 2026): **five into the thinnest cluster and five into
the second thinnest.**

## 0. The proven format (Bing data from this site and four sister sites)

Question pages ("is/does/can/should…") clicked at 16-40%, "how long does X last" 22-36%,
how-to 19-21%, "X vs Y" 8-31%, "best … 2026" 11-17%, cost pages at the top 11.7%. Bare
"best X" head terms at #5-9 clicked at 1-4%. So the ten are mostly **guides**
(`kind: "guide"`): question, lifespan, cost, how-to, X vs Y, sizing, timing, problem/fix.
Add a roundup only for a real "best X for Y" gap, with real products.

Every article (the `qa` gate enforces most of it):
- `keyword` = the exact query. It leads the `title` (50-62 chars, then the answer in brief;
  year only on roundups, reviews and cost pages), is the `h1`, opens `intro`, and the first
  section is headed `<Query>: The Short Answer` / `<Query>? The Short Answer` with a table.
- `metaDescription` 140-158 chars, answer with a number first.
- 7-10 `sections` headed by the follow-up questions people type, `###` subheads inside,
  no numbers in headings (the template numbers them).
- Exactly 5 `mistakes`, 7 `faqs` in searchers' words, `related` (3 slugs), `bottomLine`.
- 2,500+ words of prose. Aim for 2,800-3,200 so the first draft clears the gate.
- **Google as well as Bing:** honest method (never "we tested"), sources named for every
  figure, no invented specs, prices, tests or studies, one page per intent, 3+ in-body links
  in and out. That is what Google's helpful-content / E-E-A-T guidance rewards too.

## 1. Get the brief

```bash
npm run topics -- --json            # cluster 1
npm run topics -- --json --skip 1   # cluster 2
```

Each returns the cluster, its pillar, existing articles, its products and five intents
it is still missing. If one is a bad fit, use `--skip 2` (and so on) and say so in the report.

If `content/bing/` has a newer keyword export, read it first: fix titles/descriptions for
high-impression, low-CTR queries, and turn queries with no page into today's topics.

## 2. Turn each intent into a real article

- Decide the exact query, slug (the query's words) and angle. Check the slug does not exist
  in `src/content/articles/` and is not a redirect source in `vercel.json`.
- No two articles may share a `keyword` (the gate checks every page).
- `hub: "guides"` and `topic: "<cluster key>"` for guides; `hub: "<cluster key>"` for roundups.
- `published` and `updated` = today.
- Link to the pillar, to product pages `/gear/<slug>/` from the brief's product list, to the
  tools (`/tools/generator-wattage-calculator/`, `/tools/power-station-runtime-calculator/`)
  and glossary terms (`src/data/glossary.ts`).

Write with parallel subagents, two or three articles each. Give each subagent this skill's
section 0, `docs/CONTENT_GUIDE.md`, one existing article as a model
(`src/content/articles/how-long-does-a-generator-last.json` for guides,
`best-inverter-generator.json` for roundups), its intents and the cluster brief. Subagents
only write the JSON files.

## 3. Link them in

1. Add each new slug to the `related` list or an in-body link of at least 3 older articles in
   the same cluster, including the pillar.
2. Add the strongest one or two to `src/data/nav.ts` if the cluster has a nav group.
3. New head-to-head product pairs go in `src/data/compares.ts`; new terms in `glossary.ts`.

## 4. Run every gate

```bash
npm run build
```

That runs `qa` (format, words, links, duplicate keywords), the Astro build and the post-build
audit (broken links, JSON-LD, titles, H1s). Fix until it passes. Never weaken a gate. If an
article cannot honestly reach 2,500 words, replace the topic.

## 5. Publish

```bash
git add -A
git commit -m "Add ten articles: <cluster 1> and <cluster 2>"   # + the standard trailers
git fetch origin main && git merge --no-edit origin/main
git push origin main
```

Straight to `main`; Vercel deploys and `postbuild` submits the sitemap to IndexNow. Never
force-push.

## 6. Report

The two clusters, the ten URLs with titles, page types and target queries, gate results,
the merge commit, and anything skipped and why. If a gate failed, push nothing and say which.

## Guardrails

- Ten articles, two clusters (five each). Never more.
- Never touch an existing article's content except to add links to the new ones.
- Never edit a gate to make a page pass.
- Never invent a product, price, specification, test or source.
