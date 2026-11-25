# Content schema (PC hardware)

Every page on the site is built from JSON. There are five content types. All prose is plain
text (no HTML, no Markdown). In prose fields you may link to another page on the site with
`[anchor text](/path/)` — only internal paths that exist (`/gear/<id>/`, `/<guide-slug>/`,
`/compare/<a>-vs-<b>/`, `/glossary/<id>/`, `/tools/<id>/`, `/brands/<brand>/`). Links are optional:
the template already auto-links the first mention of every product and glossary term.

House rules for every text field:

- **US English**, plain and direct. Short sentences. No hype words ("beast", "insane", "game-changer").
- **Answer first.** The first sentence of any summary answers the question with a number.
- **No testing claims.** We have not bench-tested these parts. Never write "we tested", "in our
  testing", "our benchmarks", "we measured", "hands-on", "lab". Write "rated", "AMD lists",
  "NVIDIA rates", "independent reviews show", "owners report". The ER Score is a research score.
- **Only facts you are sure of.** If you are not certain of a spec (a fan count, a phase count, a
  warranty length), leave it out. Never invent a benchmark number or FPS figure. Relative claims
  ("about 15–20% faster at 1440p in independent reviews") are fine only when widely reported.
- **Prices are street-price bands in USD**, never a single exact price. DRAM and SSD prices have
  swung hard since late 2025; say so where it matters.
- No em-dash spam. Use commas, colons and periods.

---

## 1. Products — `src/data/products/<category>.json`

An array. One object per product. Page: `/gear/<id>/`.

```jsonc
{
  "id": "rtx-5070",                       // slug; never change once published
  "name": "NVIDIA GeForce RTX 5070",      // full product name
  "short": "RTX 5070",                    // short name for tables, compare titles (≤ 22 chars)
  "brand": "nvidia",                      // brand key from src/data/brands.json
  "category": "graphics-cards",           // one of the category keys below
  "released": "2025",
  "price": [550, 650],                    // street-price band, USD
  "amazon": "RTX 5070 12GB graphics card", // optional: Amazon search words (defaults to name)
  "description": "140–158 chars. Opens with the verdict and a number: 'The RTX 5070 is a 12 GB, 250 W card for high-refresh 1440p...'",
  "quick": "Two sentences: what it is and the headline numbers.",
  "bestFor": "Who should buy it (one clause, no period).",
  "skipIf": "Who should not (one clause, no period).",
  "specs": [["VRAM", "12 GB GDDR7"], ["Board power", "250 W"], ["...", "..."]],
                                          // 6–10 rows; the FIRST FOUR show in the page hero.
                                          // Use the category's standard labels (below) so compare tables line up.
  "score": {
    "overall": 86,                        // ER Score, 0–100. Spread them: 70–93 is the useful range.
    "parts": [["1440p gaming", 88], ["Value", 84], ["Efficiency", 85], ["Features", 86]]
  },
  "verdict": ["paragraph", "paragraph", "paragraph"],   // 200–320 words total. Specific, with numbers,
                                          // the main trade-off, the step-up and the closest rival by name.
  "pros": ["4–5 short items"],
  "cons": ["2–4 short items"],
  "extra": {                              // optional, one practical section
    "heading": "Drivers and Updates",     // GPUs: "Drivers and Updates"; motherboards: "BIOS Updates";
                                          // coolers: "Fit and Compatibility"; cases: "What Fits Inside";
                                          // PSUs: "Cables and Connectors"; RAM: "Setting Up EXPO or XMP";
                                          // CPUs: "Platform and Upgrade Path"; SSDs: "Install and Heatsink"
    "body": ["paragraph", "paragraph"],
    "steps": [["Label", "text"]]          // optional numbered steps
  },
  "faqs": [{ "q": "Question?", "a": "Answer, first sentence answers it." }]  // 3–4, product-specific
}
```

Standard spec labels per category (use these exact labels, in this order where they apply):

| Category key | Labels |
|---|---|
| `graphics-cards` | VRAM, Board power, Boost clock, Shader cores, Memory bus, PCIe interface, Power connector, Recommended PSU, Upscaling |
| `processors` | Cores / threads, Boost clock, L3 cache, TDP, Socket, Memory support, Integrated graphics, Cooler included |
| `cpu-coolers` | Type, Fans, Heat pipes, Height, Socket support, RAM clearance, Warranty |
| `power-supplies` | Wattage, Efficiency, ATX version, Modularity, GPU connector, Fan, Warranty |
| `pc-cases` | Form factor, Motherboard support, Fans included, Max GPU length, Max CPU cooler height, Radiator support, Front I/O |
| `memory` | Capacity, Speed, CAS latency, Voltage, Profile, Height, Type |
| `motherboards` | Socket, Chipset, Form factor, Memory, PCIe x16 slot, M.2 slots, Networking, Rear USB, BIOS flashback |
| `storage` | Interface, Capacity, Sequential read, Sequential write, NAND, DRAM cache, Endurance, Warranty |

Score parts per category (4 each):

| Category | Parts |
|---|---|
| graphics-cards | Gaming performance, Value, Efficiency, Features |
| processors | Gaming performance, Multi-thread, Efficiency, Value |
| cpu-coolers | Cooling, Noise, Compatibility, Value |
| power-supplies | Electrical quality, Noise, Features, Value |
| pc-cases | Airflow, Build ease, Features, Value |
| memory | Speed, Compatibility, Value, Build |
| motherboards | Power delivery, Features, Connectivity, Value |
| storage | Speed, Endurance, Value, Warranty |

---

## 2. Guides — `src/data/guides/<slug>.json`

Buyer's guides and brand reviews. Page: `/<slug>/` (root level, like `/best-pc-cases-under-50/`).

```jsonc
{
  "slug": "best-graphics-card",           // must equal the file name
  "type": "roundup",                      // "roundup" or "brand"
  "category": "graphics-cards",
  "brand": "corsair",                     // brand pages only
  "title": "Best Graphics Card (2026): 8 GPUs Ranked by Budget",  // <title>, 50–62 chars, search first, "(2026)"
  "h1": "Best Graphics Card",             // the search, plain
  "query": "best graphics card",          // optional: the exact search if it differs from h1 (lowercase)
  "description": "140–158 chars, the answer with a number first: 'The RTX 5070 is the best graphics card for most people: 12 GB, 250 W and ...'",
  "dek": "One sentence under the H1.",
  "intro": ["40–70 words. Sentence 1 names the top pick and why, with a number.", "Second paragraph: who the page is for, how picks are matched."],
  "quickAnswer": "40–70 words. The pick, the step-up, the budget pick, by name, with numbers.",
  "picks": [
    {
      "id": "rtx-5070",                   // product id
      "label": "Best Overall",            // 2–5 words, unique on the page
      "bestFor": "one clause",            // page-specific (overrides the product's)
      "skipIf": "one clause",
      "writeup": ["p", "p", "p"],         // 150–260 words, written for THIS page's search
      "pros": ["optional page-specific pros"],
      "cons": ["optional"]
    }
  ],                                      // 5–9 picks; the number in the title must match
  "tableSpecs": ["VRAM", "Board power", "Boost clock", "PCIe interface"],  // 3–5 spec labels for the side-by-side table
  "ranking": {
    "intro": "One paragraph: what these rankings are based on (spec sheets, independent reviews, owner reports). Say plainly none were bench-tested by us.",
    "criteria": [["Criterion", "One or two sentences."]],   // 4–6
    "why": "One sentence: why the #1 pick won."
  },
  "mentions": [{ "id": "product-id-or-omit", "name": "Name if no id", "text": "40–70 words: why it's close but not on the list." }],  // 2–3
  "sections": [
    {
      "h": "Heading, mostly questions people search",  // 5–8 sections
      "body": ["paragraphs"],
      "list": ["optional bullets"],
      "table": { "caption": "optional", "head": ["col", "col"], "rows": [["", ""]] }  // optional
    }
  ],
  "mistakes": [["Short title", "40–60 words."]],  // 4–5, specific to this page
  "bottomLine": "60–100 words.",
  "faqs": [{ "q": "Question people search?", "a": "First sentence answers. 40–90 words." }],  // 6–8
  "sources": ["What the page is based on: 'NVIDIA GeForce RTX 50 series spec pages', 'AMD Radeon RX 9070 product page', ..."],  // 4–8
  "related": ["other-guide-slug", "..."],  // 3 guide slugs
  // brand pages only:
  "about": ["Who the brand is: 2 paragraphs (founded, where, what it is known for)."]
}
```

Guide total length: 2,800–4,500 words. Brand pages also need sections like
"What <Brand> Does Well", "Where <Brand> Falls Short", "<Brand> vs <Rival> and <Rival>", "Who Should Skip <Brand>".

---

## 3. Comparisons — `src/data/compares.json`

An array. Page: `/compare/<a>-vs-<b>/`. The spec table, scores and links are generated.

```jsonc
{
  "a": "rtx-5070", "b": "rx-9070",
  "title": "RTX 5070 vs RX 9070 (2026): Which 1440p Card to Buy?",  // 50–62 chars
  "description": "140–158 chars, the verdict first.",
  "quick": "50–80 words: pick A if..., pick B if...",
  "differ": [["Question heading?", "paragraph"]],   // 3–4 differences, each heading a question
  "buyA": ["3 bullets"], "buyB": ["3 bullets"],
  "faqs": [{ "q": "", "a": "" }]                     // 2–3 extra, pair-specific
}
```

## 4. Glossary — `src/data/glossary.json`

```jsonc
{ "id": "tdp", "term": "TDP", "title": "What Is TDP? CPU and GPU Power Ratings Explained",  // title 40–62 chars
  "short": "140–158 chars, the definition first.",
  "body": ["2–4 paragraphs, 180–320 words, with a worked number example"],
  "aliases": ["thermal design power"],   // other phrases to auto-link
  "related": ["glossary ids"], "guides": ["guide slugs"] }
```

## 5. Brands — `src/data/brands.json`

```jsonc
{ "corsair": { "name": "Corsair", "founded": "1994", "hq": "Fremont, California",
  "blurb": "One or two sentences.", "review": "corsair-review" } }   // review: optional guide slug
```

## Categories

`graphics-cards`, `processors`, `cpu-coolers`, `power-supplies`, `pc-cases`, `memory`,
`motherboards`, `storage` (see `src/data/categories.ts`).

---

## 6. Articles (how-tos, fixes, explainers, X vs Y) — `src/data/guides/<slug>.json` with `"type": "article"`

Same folder and root URL as guides (`/how-to-update-nvidia-drivers/`), but no picks. For searches that
want an answer, not a shopping list.

```jsonc
{
  "slug": "how-to-update-nvidia-drivers",
  "type": "article",
  "kind": "howto",                      // "howto" | "fix" | "explainer" | "versus"
  "category": "graphics-cards",
  "title": "How to Update NVIDIA Drivers: 3 Ways, Step by Step",  // 50–62 chars, the search first; no year on how-tos/fixes
  "h1": "How to Update NVIDIA Drivers",
  "query": "how to update nvidia drivers",
  "description": "140–158 chars, the answer first (with a number where natural).",
  "dek": "One sentence.",
  "quickAnswer": "40–80 words: the answer itself (for a how-to: the fastest method in one or two sentences).",
  "intro": ["40–80 words: who this is for, what the page covers."],
  "steps": [                            // optional; howto/fix pages: the main procedure
    { "h": "Open the NVIDIA App", "body": ["what to click, what you should see"] }
  ],
  "stepsHeading": "How to Update NVIDIA Drivers, Step by Step",  // optional H2 above the steps
  "sections": [ { "h": "Question heading?", "body": [], "list": [], "table": {} } ],  // 5–9, mostly questions
  "mistakes": [["Short title", "40–60 words."]],   // optional, 3–5
  "bottomLine": "60–100 words.",
  "faqs": [{ "q": "", "a": "" }],       // 6–8
  "sources": ["NVIDIA support article: ...", "..."],
  "products": ["rtx-5070"],             // optional product ids to show under "Parts mentioned"
  "related": ["guide-or-article-slug"]  // 3
}
```

Length 1,800–3,500 words. Fix pages: causes in order of likelihood, each as an H2 phrased as the symptom,
a "when to RMA or replace" section, and a safety note where hardware is opened. Step text must match the
current software's real menu names; if unsure of an exact label, describe it plainly instead of inventing one.
