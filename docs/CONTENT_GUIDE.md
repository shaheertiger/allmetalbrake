# Content guide: allmetalbrake.com

The site uses the same page structure as besthometheatre (itself built on best-proteinpowder.com):
every page is static Astro rendered from JSON in `src/content/`, types in `src/lib/types.ts`.
The topic is **backup power only**: generators, power stations, home batteries, solar for backup,
transfer switches, surge protection and outage essentials (see `docs/bing-playbook.md`).

| Page type | URL | Template | Data |
|---|---|---|---|
| Best lists | `/best-…/` | `src/pages/[slug].astro` | `src/content/articles/*.json` (`kind: "roundup"`) |
| Brand reviews | `/best-<brand>-power-station/` etc. | same | `kind: "review"` + `brand` |
| Guides (question, cost, lifespan, timing, X vs Y, how-to) | `/<query-slug>/` | same | `kind: "guide"` |
| Product database | `/gear/<product>/` | `src/pages/gear/[slug].astro` | `src/content/products/<category>.json` |
| Head-to-head | `/compare/<a>-vs-<b>/` | `src/pages/compare/[slug].astro` | `src/data/compares.ts` |
| Brands | `/brands/<brand>/` | `src/pages/brands/` | derived from products |
| Tools | `/tools/…/` | `src/pages/tools/` | |
| Glossary | `/glossary/<term>/` | `src/pages/glossary/` | `src/data/glossary.ts` |

## The proven format (Bing data from this site and four sister sites)

Question pages clicked at 16-40%, "how long does X last" 22-36%, how-to 19-21%, "X vs Y" 8-31%,
"best … 2026" 11-17%, cost pages at the top 11.7%. Bare "best X" head terms at #5-9: 1-4%.
So new articles are mostly **guides** (question, cost, lifespan, timing, how-to, X vs Y), with a new
roundup only for a real "best X for Y" gap.

1. **One page per search intent.** `keyword` is the exact query. It goes first in `title`, in `h1`,
   in the first sentence of `intro`, and in the first section heading. Never two pages for one query.
2. **Title** 50-62 chars, the exact query first, then the answer in brief. Year ("(2026)" or "in 2026")
   on roundups, brand reviews and cost pages only. Never "Tested".
3. **metaDescription** 140-158 chars: the answer with a number first, then who it is for.
4. **Answer first.** `intro` = 2 short paragraphs; the first sentence answers with a number or the #1
   pick. `quickAnswer` = 2-4 sentences. The first section (`position: "before"` on roundups) is headed
   `<Query>: The Short Answer` or `<Query>? The Short Answer` and holds a markdown table.
5. **Question H2s.** 7-10 `sections`, each heading a follow-up question people type ("How Much Does
   Generac Installation Cost?"). Use `###` subheads inside bodies. No numbers in headings: the template
   numbers them.
6. **Mistakes and FAQ.** Exactly 5 `mistakes` and 7 `faqs` (questions in the exact words people search,
   40-90 word answers that start with the answer). They render as FAQPage schema.
7. **Length:** at least 2,500 words of body prose (intro, sections, picks, mistakes, FAQ, bottom line).
   `npm run qa` fails anything shorter.
8. **Links.** 3+ in-body links to other articles, plus product pages (`/gear/<slug>/`), tools
   (`/tools/generator-wattage-calculator/`, `/tools/power-station-runtime-calculator/`) and glossary terms
   (`/glossary/running-watts/`, `/glossary/starting-watts/`, `/glossary/transfer-switch/`,
   `/glossary/interlock-kit/`, `/glossary/watt-hours/`, `/glossary/lifepo4/`, `/glossary/co-shutoff/` …).
   `related` = 3 article slugs. Then add the new slug to at least 3 older articles' bodies or `related`.
9. **Honesty = E-E-A-T** (it is what Google's helpful-content guidance rewards too). We have not
   bench-tested products. Never write "we tested", "in our testing", "we measured", "our lab".
   Write "rated for", "the spec sheet lists", "owners report". Never invent a spec, price, test or source.
10. **No prices.** Leave `priceBand` empty and set `priceTier` (1 budget, 2 mid-range, 3 upper mid-range,
    4 premium, relative to the category); the site shows the tier label. Cost guides may give
    typical installed ranges with attribution ("dealers commonly quote").
11. **Dates:** `published` and `updated` = today (YYYY-MM-DD).
12. **Style:** plain US English, short paragraphs, second person, specific numbers, no fluff, no emojis.

## Product JSON (`src/content/products/<category>.json`, an array)

Gear pages are the page type that wins on besthometheaterreview.com (Search Console, Nov 2026: 121 `/gear/`
pages ranking, two thirds of clicks, Product snippets in Google, for "<model> review" and bare "<model>"
queries). Every product record matches that site's record depth:

- `slug` (never change a live one), `name` = short "Brand Model" as people search it ("Westinghouse WGen7500DF"),
  `brand` (same spelling everywhere), `category` (a key of `CATEGORY_LABELS` in `src/data/site.ts`).
- `released` (year, only when certain), `priceBand` "" and `priceTier` 1-4 (see rule 10).
- `score`: AMB Score, our editorial ranking (93 for a category's #1 pick, falling by rank; never a measurement).
- `scores`: 4 sub-scores with the same 4 labels across a category, roughly averaging to `score`.
- `summary`: one sentence quick answer. `verdict`: markdown, 180-300 words, opening verdict sentence, then
  2-3 paragraphs with a **bold lead-in.** each, spec numbers and sizing math, a closing "owners report" line,
  and 3-6 internal links (glossary, sibling `/gear/` pages, the roundup, tools).
- `bestFor`, `skipIf`, `pros` (4-5), `cons` (2-3).
- `specs`: 6-9 rows from the maker's spec sheet, same keys and order across a category; omit a row rather
  than guess. Never drop a key an article's `comparisonSpecs` uses. `keySpecs`: 3-4 of them.
- `faqs`: exactly 2 product-specific questions ("Can the X run a well pump?", "X vs <sibling>?"); the template
  adds "Is X worth it?" and "cheaper alternative" automatically.
- `atAGlance` (one line, used in articles), `amazonQuery`, optional `asin`, `imageId`.

Product photos and ASINs: add the product to `docs/product-catalog.txt`, run `npm run images:fetch`
(Amazon Creators API, strict brand + model matching), then `npm run images:review`. Wrong matches go in
`src/data/asin-quarantine.json`.

## Article JSON (`src/content/articles/<slug>.json`)

`slug`, `kind`, `title`, `metaDescription`, `h1`, `keyword`, `keywords` (6-10), `hub` (category key for
roundups/reviews, `"guides"` for guides), `topic` (guides: the category key they belong to),
`published`, `updated`, `intro`, `quickAnswer`, `picksHeading`, `picks` [{`product`, `award`, `body`,
`pros`, `cons`}], `sections` [{`heading`, `body`, `position`?}], `comparisonSpecs`, `mistakes`
[{`title`, `body`}], `faqs` [{`q`, `a`}], `related`, `bottomLine`, `brand` (brand reviews only).

## Checks

- `npm run qa`: banned phrases, link targets, title/meta lengths, year on roundups, word count,
  5 mistakes, 7 FAQs, duplicate keywords.
- `npm run build`: runs `qa`, builds, then audits every page (broken links, JSON-LD, titles, H1s).
