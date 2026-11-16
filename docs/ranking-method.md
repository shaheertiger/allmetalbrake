# allmetalbrake.com: the method to rank on Google and Bing

Adapted from the method built for treadmillreviewsusa.com (same publisher, same
template family) and applied to this site on 2026-11-16.

**Built from:**
- the source of all 193 pages in `src/pages/` (184 articles before this pass)
- the 330 redirects in `vercel.json`, which show which topics the site used to have
  pages for (96 retired URLs)
- the treadmill site's findings from Bing Webmaster and Semrush data (what wins on
  this template)

**Not built from (yet):** keyword volumes and Search Console data for this domain. The
Semrush account had no API units on 2026-11-16, and `content/search-console/` is empty.
Before the next monthly pass:
1. Drop a 3-month Search Console export (Pages.csv + Queries.csv) into
   `content/search-console/` and run `npm run gsc`.
2. Pull a Semrush keyword export for the head terms in section 7. Add volume and KD to
   that table, and re-sort it.

---

## 0. The diagnosis in one paragraph

The site doesn't need more pages. It has a page for most of its winnable searches. What
holds it back on Google, in order:

1. **Pages compete for the same search.** 3 merges were needed (section 1a), plus 9
   pairs to watch.
2. **Every page read the same.** The method sentence under the byline was identical
   on all 184 articles, and every page had the same numbered "N. Common Mistakes to
   Avoid / N. Frequently Asked Questions" skeleton.
3. **Snippets weren't built to win the click.**
   - 51 of 184 titles were outside 50–62 characters, and 33 didn't lead with the
     search they target.
   - Only 21 descriptions put a number in the first clause, which was the single
     biggest CTR lever on the treadmill site.
4. **Honesty signals contradicted each other.** The articles say "described from
   specifications, not hands-on testing", but `/how-we-test/`, both author bios and
   `/best-of/` claimed in-house testing ("tested in-house for a minimum of 30 days").
   That is the strongest negative E-E-A-T signal a review site can send.
5. **Off-topic pages diluted the focus.** Back shavers, buzz cuts, blenders, heated
   lunch boxes, phone chargers and car batteries all sat on a home-improvement site.

Sections 1–3 were applied in the 2026-11-16 pass. Sections 4–5 apply to every page
from now on, starting with the keyword map in section 7.

---

## 1. Site-level fixes

### 1a. One URL per search (done)

`scripts/merge-pages.py` holds the merges. It folds the dropped page's best section
into the kept page, deletes the dropped page, adds 301s (slash, no-slash, `.html`),
repoints old redirects that targeted it, and rewrites every internal link so nothing
hops through a redirect.

| Search | Dropped (301) | Kept | Folded in |
|---|---|---|---|
| best asphalt sealer / blacktop driveway sealer / asphalt driveway sealer | `best-asphalt-sealer`, `blacktop-driveway-sealer` | `best-asphalt-driveway-sealer-reviews` | "The Coal Tar Question", "When Gray Blacktop Is Worth Sealing" |
| best polymeric sand (for pavers) | `best-polymeric-sand-for-pavers` | `best-polymeric-sand` | "Re-Sanding an Existing Paver Patio" |

`best-driveway-sealer` stays as the **hub**. It covers asphalt and concrete, links to
both surface guides, and targets "best driveway sealer".

The old redirect `/how-to-seal-an-asphalt-driveway/` now points to `/how-to-seal-a-driveway/`
(how-to intent) instead of the asphalt roundup.

**Split cleanly instead of merging:**
- `how-to-get-oil-out-of-concrete` covers set-in stains on slabs and garage floors
  (poultice, enzyme).
- `how-to-remove-oil-stains-from-driveway` covers fresh spills and asphalt.

Their titles no longer overlap. Both get traffic (122 and 49 visits in the traffic
report supplied on 2026-11-16).

`best-concrete-floor-coating` was briefly merged into `best-garage-floor-coating`,
then restored: the traffic report shows the concrete page earning visits (57) and the
garage page earning none. The rule this sets is to **keep the URL that already earns
traffic**, never the one that merely sounds broader. They're now split by space:
basements, shops and patios vs hot tires and road salt.

**Watch list.** These pairs share a lot of intent. Leave both up, but once Search
Console data arrives, check whether Google swaps them for the same query (impressions
alternating between the two URLs). If it does, merge the weaker into the stronger with
`merge-pages.py`.

| Pair | Keep distinct by |
|---|---|
| `best-time-to-seal-driveway` / `what-temperature-to-seal-driveway` | season and hour vs the three temperature numbers |
| `asphalt-sealcoating` / `sealing-asphalt-driveway-pros-and-cons` | what sealcoating is vs is it worth it |
| `how-to-seal-a-driveway` / `how-to-seal-a-concrete-driveway` | asphalt (the default) vs concrete |
| `polymeric-sand-pros-and-cons` / `polymeric-sand-vs-regular-sand-for-pavers` | poly on its own vs the head-to-head |
| `best-home-battery-backup` / `best-portable-power-station-for-home-backup` | installed whole-house vs plug-in |
| `best-home-generator-for-power-outages` / `best-gas-generator` / `best-small-generator-for-home` | need-based hub vs fuel type vs size |
| `best-concrete-sealer` / `best-penetrating-concrete-sealer` / `best-concrete-driveway-sealer-reviews` | all slabs vs one chemistry vs driveways |
| `best-basement-wall-sealer` / `best-cinder-block-sealer-reviews` / `best-paint-for-cinder-block` | leak type vs block chemistry vs paint finish |
| `best-concrete-floor-coating` / `best-garage-floor-coating` | basements, shops, patios vs hot tires and salt; if they swap, merge garage into concrete |

### 1b. Topical focus (done)

These pages stay online but are **noindexed** through `src/data/noindex-pages.json`:

`best-mens-back-shavers`, `buzz-cut-guide`, `best-portable-blender`,
`best-heated-lunch-box`, `best-small-microwave`, `best-magsafe-power-bank`,
`best-usb-c-charger`, `best-charging-station`, `best-laptop-power-bank`,
`best-car-battery`

What that list controls:
- `Layout.astro` adds `noindex, follow` to those pages.
- The sitemap drops them.
- The nav, `/best-of/` and the interlink and top-pick generators skip them.

To restore a page, delete its slug from the JSON.

**Kept on purpose:**
- The backup-power cluster, the second pillar (outages are a home problem).
- Camping and RV power pages that link naturally into it.
- Water filtration, mowers and tools.

**Next to review with data:** the camping, RV and vehicle pages
(`best-12v-fridge-for-camping`, `best-portable-air-conditioner-for-camping`,
`best-rv-power-adapter`, `best-lithium-rv-battery`, `best-portable-ev-charger`). If
they get impressions but no clicks, noindex them too.

### 1c. Remove the template fingerprint (done for the mechanical parts)

- The byline method line is page-specific. It says what that page was built from
  (data sheets, EPA labels, NEC, owner reports), and "Not hands-on tested" where true.
- H2s are no longer numbered (the contents box still numbers them).
- "Common Mistakes to Avoid" is now "Common Mistakes With <the page's topic>".

**Still to do per page** (as each page is touched in section 7):
- write a unique lede that answers in sentence one;
- write page-specific mistakes and FAQs;
- turn the remaining label-style H2s ("Prep That Decides Whether It Lasts") into searched
  questions ("How Do You Prep a Driveway for Sealer?").

### 1d. Honesty signals (done)

- `/how-we-test/` is now "How We Pick Products", and says plainly that most products
  are not physically tested.
- The author bios, `/best-of/`, `/about/`, the 404 page, the default meta description
  and every `/best-of/` card no longer claim testing. The cards now carry each page's
  own description.
- Article bodies were already honest ("described from manufacturers' published
  specifications, not from hands-on testing"). Keep it that way.

**Never use "Tested", "Hands-on", "Lab" or "we measured" in a title, description, H1 or
heading unless it happened.** `npm run validate:snippets` fails the build on it.

If anyone gets hands-on time with a product (a pail of sealer on a test patch, a
generator under load, a moisture-meter reading on a slab), that page becomes the site's
flagship. Mark it "Measured by <author> on <date>" (section 5B).

---

## 2. Pick the page type

Every page is exactly one of these. If a topic doesn't fit, don't write it.

| Type | For | Examples on the site |
|---|---|---|
| **A. Question / number answer** | how much, how long, what temperature, does X work, cost | `how-much-does-it-cost-to-seal-a-driveway`, `deck-stain-drying-time`, `what-temperature-to-seal-driveway`, `does-vinegar-kill-mold` |
| **B. Product review** | one named product | `latex-ite-driveway-sealer-review`, `rmr-141-review`, `rust-oleum-epoxyshield-review` |
| **C. Brand guide** | one brand's range | `best-ecoflow-power-station`, `best-jackery-power-station`, `ryobi-tools-review`, `tekton-tools-review` |
| **D. Roundup** | one use, surface, size or budget | `best-asphalt-driveway-sealer-reviews`, `best-deck-stain-for-cedar`, `best-generator-for-well-pump` |
| **E. Problem / fix or how-to** | something failing, or a job to do | `rain-after-driveway-sealing`, `how-to-fix-a-damp-basement`, `how-to-seal-a-driveway` |
| **F. X vs Y** | two products, brands, chemistries or materials | `oil-based-vs-water-based-driveway-sealer`, `silane-vs-siloxane-sealers`, `ecoflow-vs-jackery` |
| **G. Store page** | buying at one retailer | `driveway-sealer-home-depot`, `driveway-sealer-menards` |

---

## 3. The snippet: title, description, URL

### Title: the exact search first, 50–62 characters

| Type | Formula |
|---|---|
| A | `<Exact question>? <the answer in brief>` |
| B | `<Product> Review (2026): <the deciding fact or question>` |
| C | `<Brand> <search> (2026): <verdict hook>` |
| D | `<N> Best <exact search> (2026): <how ranked>` |
| E | `<Problem>? <the fix promise>` or `How to <job>: <the promise>` |
| F | `<X> vs <Y>: <which to buy, in brief>` |
| G | `<Store> <search> (2026): <what's worth buying>` |

Rules:
- Use the highest-volume wording of the search once volumes are pulled (section 7).
  Put the second wording in the H1 or the first H2.
- "(2026)" goes only on B, C, D and G. Update it on 1 January.
- N in a D title equals the real number of products on the page. Vary it; don't make
  every list 7.
- Never "Tested" unless the product was physically tested.

### Meta description: 140–158 characters, answer first

The first clause is the answer, with a number, taken from the page:
- **A:** "Sealing an asphalt driveway costs about $0.15–$0.25 per sq ft DIY…"
- **D:** "<Top pick> is the best <X> for most <use>; 6 picks sorted by…"
- **E:** the most likely cause and its fix.
- **F:** "Pick X if…, Y if…"

### URL

Short, lowercase, the query, trailing slash. Don't change existing URLs to match a new
title; retitle instead. Change a URL only when merging, with `merge-pages.py`.

`npm run validate:snippets` enforces the following on every indexed article (it runs in
`npm run build` and `npm run validate:all`):
- title and description lengths;
- no testing language;
- "(2026)" placement;
- no shared method line;
- no numbered H2s;
- the topic-named mistakes heading.

---

## 4. The page skeleton (all types)

```
H1          The exact search, plain ("How Long Does Driveway Sealer Take to Dry?")
Byline      Author · "Updated <date>" · 1-line method note, true for this page
            ("Based on label cure times and manufacturer data sheets.")

LEDE        40–70 words. Sentence 1 = the answer, with a number or verdict.
            Sentence 2 = what changes the answer. Sentence 3 = what the page covers.

H2 1        "<Search>: The Short Answer"
            50–90 words + ONE scannable block: a table, a stats row, numbered steps
            (type E) or the top-pick cards (types B, D, G).

H2 2–8      Each H2 = a question people search (keyword export, "People also ask",
            Bing keyword report). Never "Overview" or "Background", never numbered.
            Answer in sentence 1, then 3–4 paragraphs of reasons, numbers, caveats.

H2          Common Mistakes With <Topic> (5, page-specific, 40–60 words each)
H2          Frequently Asked Questions (6–8, 40–70 words each, FAQPage schema)
H2          Related <Cluster> Guides (the hub + 2–4 siblings)
H2          The Bottom Line (2 short paragraphs, restate the verdict)
```

**Length:** 2,500 words of body prose at minimum (the build gate); 2,500–4,000 for A, E
and F; 3,500–6,000 for B and D. Add answered questions, not padding.

**Media:** at least one original visual per page (a chart, a diagram or a labelled
photo) with descriptive alt text. Chart pages (coverage per pail, cure times by
temperature, generator sizing, cost per square foot) need the chart as an image too,
not only as an HTML table.

---

## 5. Required blocks by page type

### A. Question / number answer
- The number in the description, the lede and the Short Answer block.
- One original table or calculator: cost per sq ft by method, cure time by temperature,
  pails per driveway size, watts by appliance. The site already has
  `DrivewaySealerCalculator`, `GeneratorWattageCalculator` and `SandCalculator`; use
  them on every page where they answer the question.
- A link to the roundup someone with this question needs next.

### B. Product review
- Short Answer: verdict + "Buy it if… / Skip it if…" + price band.
- A spec table sourced from the manufacturer's data sheet, naming the source and the
  date checked:
  - **coatings:** coverage per gallon or pail, solids, cure and recoat times,
    application temperature window, VOC;
  - **machines:** rated and starting watts, run time, noise rating, warranty by
    component.
- Required H2s:
  - "How Long Does <Product> Last?"
  - "How Much <Product> Do You Need?" (coverage math)
  - "What Do Owners Complain About?" (aggregated and attributed)
  - "<Product> vs <closest rival>"
  - "Who Should Buy It, and Who Should Skip It?"
- **The Google upgrade that moves rankings:** any first-hand evidence. Your own photos,
  a test patch at 1 week, 1 month and 1 year, a moisture-meter reading, a measured
  noise level. Mark it "Measured by <author> on <date>".

### C. Brand guide
- A lineup table (model, price band, the deciding spec, warranty).
- "Is <Brand> Any Good?" verdict H2, plus "<Brand> Warranty and Support" and
  "Best <Brand> for…".
- Links to every review of that brand.

### D. Roundup
- A quick comparison table first: product, price band, and the spec that matters for
  this guide (crack width for crack fillers, coverage for sealers, wattage for
  generators, pints/day for dehumidifiers).
- Product cards: best for, 4–6 maker specs, pros and cons, check-price link.
- A "How We Chose" section that says exactly what was and wasn't done.
- The niche questions as H2s ("How Many Coats of Driveway Sealer Do You Need?").

### E. Problem / fix or how-to
- Short Answer = the most likely cause and its fix, in 2 sentences.
- Numbered steps with tools, time and temperature window. For problem pages, causes
  in order of likelihood, each an H2 phrased as the symptom ("Sealer Turning White a
  Day Later?").
- A safety box (ventilation, PPE, coal-tar handling, generator carbon monoxide,
  breaker off) and a "when to call a pro" section with typical costs.

### F. X vs Y
- A side-by-side table in the first screen.
- Short Answer = "Pick X if…, pick Y if…".
- Each difference as a question H2 ("Which Lasts Longer on a Driveway?").

### G. Store page
- What the store stocks (brands, price bands), its return window and price-match
  policy, sourced from the store's pages with the date checked.
- "Best <product> to buy at <store>": 3–5 picks, each linked to its review or roundup.

---

## 6. Google vs Bing: what each needs on top

**Both:**
- sections 3–5;
- valid schema: Article + FAQPage + BreadcrumbList everywhere; ItemList + Product on
  B, D and G (the template already emits these);
- self-canonicals and trailing-slash internal links (the link gate checks).

**Google adds:**
1. One URL per search (1a). This is the biggest single blocker.
2. Evidence of experience on reviews (5B), and an accurate method line.
3. Topical focus (1b).
4. Unique writing per page (1c).
5. Real freshness: re-check prices, stock and discontinued models monthly on B, D and G
   pages. Change the "Updated" date only when something changed.
6. Internal links from pages that already get impressions to the pages in section 7.
7. Specific over broad. "best driveway sealer" and "best generator" take months; win the
   long-tail rows first, because they pass authority up to the hubs.

**Bing adds:**
1. The answer in the description, which Bing shows verbatim more often.
2. The exact query in the title, H1 and one H2.
3. IndexNow on every publish (the `postbuild` hook already does this) and the sitemap
   submitted in Bing Webmaster Tools.

---

## 7. Keyword → page map

Volumes and KD are missing (see the top of this doc). Fill them in from Semrush, keep
KD ≤ 40, and re-sort by volume. Until then, rows are ordered by cluster strength: the
driveway, concrete and deck clusters are the site's deepest, so they convert authority
fastest.

### 7a. Existing pages: retitled in this pass; rewrite them to the full skeleton next

| # | Search | Owner page | Next action |
|---|---|---|---|
| 1 | best asphalt driveway sealer | `best-asphalt-driveway-sealer-reviews` | Merge hub done; turn its H2s into questions; quick comparison table first |
| 2 | how much does it cost to seal a driveway | `how-much-does-it-cost-to-seal-a-driveway` | Cost-by-size table and calculator in the Short Answer |
| 3 | how to seal a driveway | `how-to-seal-a-driveway` | Numbered steps + time and temperature window first; link the calculator |
| 4 | how long for driveway sealer to dry | `how-long-for-driveway-sealer-to-dry` | Cure-time-by-temperature chart as an image |
| 5 | best concrete sealer | `best-concrete-sealer` | Separate from the penetrating and driveway pages (watch list) |
| 6 | best deck stain | `best-deck-stain-reviews` | Hub for the 8 deck-finish pages; comparison by wood |
| 7 | best garage floor epoxy | `best-garage-floor-epoxy` | Link from the merged coating page; kit-coverage table |
| 8 | best polymeric sand | `best-polymeric-sand` | Joint-width table first (merge done) |
| 9 | best paver sealer | `best-paver-sealer` | Finish-by-paver table; link the water-based page |
| 10 | best dehumidifier for basement | `best-dehumidifier-for-basement` | Pints-per-day by room size chart |
| 11 | best generator for well pump | `best-generator-for-well-pump` | Horsepower → watts table + calculator |
| 12 | best home generator for power outages | `best-home-generator-for-power-outages` | Power hub; link every generator page |
| 13 | ecoflow vs jackery | `ecoflow-vs-jackery` | Side-by-side table in the first screen |
| 14 | latex-ite driveway sealer review | `latex-ite-driveway-sealer-review` | Type B blocks; first candidate for a hands-on test patch |
| 15 | driveway sealer home depot / menards | store pages | Type G: return window and price-match policy, with the date checked |

### 7b. Candidate new pages: retired URLs with no owner page today

These topics had pages before, so they may still have links and impressions. Each one
is a **new page at its old URL**: delete that URL's redirect in `vercel.json` in the
same commit. First confirm with the keyword export that it has demand and no existing
owner.

| Search | Type | Old URL (now redirects) | Hub to link from |
|---|---|---|---|
| driveway sealer peeling | E | `driveway-sealer-peeling` | `best-asphalt-driveway-sealer-reviews` |
| how long does driveway sealer last | A | `how-long-does-driveway-sealer-last` | `how-often-should-you-seal-your-driveway` |
| how many coats of driveway sealer | A | `how-many-coats-of-driveway-sealer` | `how-to-seal-a-driveway` |
| coal tar vs asphalt emulsion sealer | F | `coal-tar-vs-asphalt-emulsion-sealer` | `best-asphalt-driveway-sealer-reviews` |
| why is my concrete sealer turning white | E | `why-is-my-concrete-sealer-turning-white` | `best-concrete-sealer` |
| cost to seal a concrete driveway | A | `cost-to-seal-a-concrete-driveway` | `how-to-seal-a-concrete-driveway` |
| how to seal pavers | E | `how-to-seal-pavers` | `best-paver-sealer` |
| how often to seal pavers | A | `how-often-to-seal-pavers` | `best-paver-sealer` |
| deck stain peeling | E | `deck-stain-peeling` | `best-deck-stain-reviews` |
| solid vs semi-transparent deck stain | F | `solid-vs-semi-transparent-deck-stain` | `deck-stain-colors-guide` |
| epoxy vs polyaspartic garage floor | F | `epoxy-vs-polyaspartic-garage-floor` | `best-garage-floor-coating` |
| garage floor coating cost | A | `garage-floor-coating-cost` | `epoxy-garage-floor-cost` (check overlap first) |
| efflorescence on basement walls | E | `efflorescence-on-basement-walls` | `best-basement-wall-sealer` |
| best sump pump | D | `best-sump-pump` | `best-basement-waterproofing-systems` |
| best deck cleaner | D | `best-deck-cleaner` | `best-deck-stain-reviews` |

Re-run this match every month: a fresh keyword export, KD ≤ 40, and a check of
`src/pages/` and `scripts/merge-pages.py` for an existing owner before creating anything.

---

## 8. The workflow for every page

1. **Pick the search** from section 7. Confirm no other page targets it; if one does,
   improve that page instead.
2. **Collect the questions** (keyword export, "People also ask", Bing keyword report).
   They become the H2s and FAQs.
3. **Collect the facts:**
   - the manufacturer's data sheet, SDS, label and manual;
   - the store pages;
   - recall notices;
   - owner reviews, summarised and attributed, never invented.

   Note each source and the date checked.
4. **Write the snippet first** (section 3). If you can't write the description with the
   answer in it, you don't know the answer yet.
5. **Write to the skeleton** (section 4) and the type blocks (section 5). New pages go
   through `scripts/scaffold-article.mjs` or `scaffold-roundup.mjs`; both require
   `method` and `topic`.
6. **Add the original visual** and any first-hand evidence.
7. **Link it:**
   - from its hub;
   - from 2+ pages that already get impressions;
   - out to 2–4 siblings.

   Use the exact search as anchor text at least once.
8. **Publish:** `npm run validate:all`, `npm run build`, push. IndexNow runs on
   postbuild. Then Request Indexing in Search Console.
9. **Review at 4 weeks:**
   - Position 5–20 with impressions: strengthen the page (more questions answered,
     more internal links).
   - Page 1 with CTR under 2%: rewrite the title and description.

## 9. Pre-publish checklist

- [ ] One page type (A–G); no other page targets this search
- [ ] Title 50–62 chars, exact search first, "(2026)" only on B/C/D/G
- [ ] Description 140–158 chars, first clause = the answer with a number
- [ ] H1 = the search; the lede answers it in sentence one
- [ ] "<Search>: The Short Answer" first, with one table, stats row or steps block
- [ ] Every other H2 is a searched question, unnumbered
- [ ] No testing language unless testing happened; the method line is true for this page
- [ ] Sourced spec table (B, C, D, F) with the date checked
- [ ] One original visual with alt text
- [ ] Unique lede, mistakes, FAQs and bottom line
- [ ] 5 mistakes, 6–8 FAQs; a safety caveat where relevant (coal tar, CO, electrical, mold)
- [ ] Internal links: hub, 2+ ranking pages in, 2–4 siblings out, trailing slashes
- [ ] `npm run validate:all` and `npm run build` pass
- [ ] Rich Results Test passes; Request Indexing sent

## 10. Order of work

| Week | Do |
|---|---|
| Done (2026-11-16) | Merges and 301s (1a); noindex off-topic pages (1b); method line, H2 numbering and mistakes headings (1c); honesty fixes (1d); every indexed title, description and H1 rewritten to section 3; snippet gate added |
| 1 | Search Console export + Semrush volumes into section 7; first watch-list check |
| 2–3 | 7a rows 1–8: full rewrite to the skeleton (question H2s, Short Answer block, original chart) |
| 4–5 | 7a rows 9–15; the first two 7b pages with the strongest demand |
| 6 | First hands-on evidence page (a sealer test patch photographed at day 1 and day 30 is cheap and unique) |
| Then | Monthly: fresh keyword export → section 7; 4-week review loop (section 8, step 9) |
