#!/usr/bin/env node
// Builds src/data/interlinks.json, the site's internal-link plan:
//
//   pillarOf  every supporting article -> the buyer's guide it feeds. Taken from the
//             article's sticky CTA when it names a guide (the scaffolder always sets
//             one), otherwise the most topically similar guide.
//   more      every article -> the six links its "More in …" block shows: its guide
//             first, then the closest pages by topic, keeping the hand-picked links
//             that still fit and dropping the ones that do not (a Ryobi review used
//             to send readers to back shavers).
//   cluster   every guide -> its supporting articles that no other block on the
//             guide already links to, so a guide reaches every page in its cluster.
//   planQuestions  guides whose PlanTheJob box lists their questions.
//
// MoreInCategory.astro renders `more` and `cluster`; cluster-report.mjs uses
// `pillarOf` when an article has no sticky CTA. Runs as part of `npm run build`.
//
//   node scripts/build-interlinks.mjs           # write the file
//   node scripts/build-interlinks.mjs --report  # also print what changed and why
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadPages, isPillar } from './cluster-report.mjs';
import { buildModel } from './topic-model.mjs';

const ROOT = join(import.meta.dirname, '..');
const OUT = join(ROOT, 'src', 'data', 'interlinks.json');
const REPORT = process.argv.includes('--report');

const MORE_SIZE = 6; // two rows of three cards
const MAX_MORE = 9;
// "best-" pages that answer a timing question rather than recommend products.
const NOT_A_GUIDE = new Set(['best-time-of-year-to-stain-a-deck', 'best-time-to-seal-driveway']);
// Articles with no sticky CTA whose closest guide by wording is the wrong one.
const PILLAR_OVERRIDES = {
  'how-to-winterize-outdoor-faucets': 'best-garden-hose',
  'oil-based-vs-water-based-driveway-sealer': 'best-driveway-sealer',
  'rust-converter-vs-rust-remover': null,
  'braun-type-5544-vs-series-7': 'best-mens-back-shavers',
  'rockwell-tools-review': 'best-cordless-tool-brand',
};
// Pages too unlike the rest of the site in wording for the model to place, linked
// from the pages a reader would actually come from (host -> targets).
const MANUAL_LINKS = {
  'best-sauna': ['best-cold-plunge'],
  'best-hot-tub': ['best-cold-plunge', 'best-sauna'],
  'best-home-gym-equipment-on-a-budget': ['best-cold-plunge', 'best-sauna', 'best-weight-bench'],
  'best-cold-plunge': ['best-sauna'],
  'best-walking-pad': ['best-weight-bench'],
  'best-garage-floor-mat': ['best-weight-bench'],
  'best-riding-lawn-mower': ['best-compact-tractor'],
  'best-zero-turn-mower': ['best-compact-tractor'],
  'best-lawn-mower-for-large-yard': ['best-compact-tractor'],
  'best-fertilizer-for-grass': ['best-crabgrass-preventer'],
  'best-grass-seed': ['best-crabgrass-preventer'],
  'when-to-fertilize-lawn': ['best-crabgrass-preventer'],
  'best-electric-scooter': ['best-electric-bike-for-seniors'],
  'best-electric-bike-for-seniors': ['best-electric-scooter'],
  'best-christmas-gifts-for-men': ['best-electric-scooter', 'best-electric-bike-for-seniors', 'christmas-gifts-for-men-under-50'],
  'christmas-gifts-for-men-who-have-everything': ['christmas-gifts-for-men-under-50'],
  'best-mens-back-shavers': ['christmas-gifts-for-men-under-50'],
  'best-miter-saw': ['best-framing-nailer'],
  'best-cordless-circular-saw': ['best-framing-nailer'],
  'best-table-saw': ['best-framing-nailer'],
  'best-garage-door-opener': ['best-home-security-cameras'],
  'best-whole-house-surge-protector': ['best-home-security-cameras'],
  'best-home-battery-backup-system': ['best-home-security-cameras'],
  'best-under-sink-water-filter': ['best-kitchen-faucet', 'best-shower-head-filter'],
  'best-dishwasher': ['best-kitchen-faucet'],
  'best-water-softener-system': ['best-kitchen-faucet', 'best-shower-head-filter'],
  'best-water-filtration-system-for-home': ['best-shower-head-filter'],
  'best-welder-for-beginners': ['best-plasma-cutter'],
  'best-angle-grinder': ['best-plasma-cutter'],
  'best-bench-vise': ['best-plasma-cutter'],
  'best-fishing-kayak': ['best-trolling-motor'],
  'best-canoes-for-river-paddling': ['best-trolling-motor'],
  'lifepo4-vs-lithium-ion-power-stations': ['best-trolling-motor', 'bluetti-vs-ecoflow'],
  'best-chainsaw': ['best-wood-chipper', 'how-tight-should-a-chainsaw-chain-be'],
  'best-pole-saw': ['best-wood-chipper'],
  'best-leaf-vacuum': ['best-wood-chipper'],
  'best-portable-power-station': ['bluetti-vs-ecoflow', 'jackery-vs-ecoflow'],
  'best-solar-generator': ['bluetti-vs-ecoflow', 'jackery-vs-ecoflow'],
  'what-size-portable-power-station-do-i-need': ['jackery-vs-ecoflow'],
  'best-brick-sealer-reviews': ['masonry-defender-review'],
  'how-to-seal-fireplace-brick': ['masonry-defender-review'],
  'best-penetrating-concrete-sealer': ['masonry-defender-review'],
  'concrete-leveling-cost': ['mudjacking-vs-polyjacking'],
  'foundation-crack-repair-cost': ['mudjacking-vs-polyjacking'],
  'best-concrete-crack-filler': ['mudjacking-vs-polyjacking'],
  'best-kitchen-faucet': ['best-drain-snake'],
  'best-under-sink-water-filter': ['best-drain-snake'],
  'best-sump-pump': ['best-drain-snake'],
  'best-chainsaw-sharpener': ['how-tight-should-a-chainsaw-chain-be'],
  'best-wood-chipper': ['hookaroon-vs-pickaroon'],
  'best-log-splitter': ['hookaroon-vs-pickaroon'],
  'best-cordless-tool-brand': ['rockwell-tools-review'],
  'milwaukee-vs-ryobi': ['rockwell-tools-review'],
  'ryobi-tools-review': ['rockwell-tools-review'],
  'best-electric-kettle': ['best-espresso-machine', 'best-countertop-ice-maker'],
  'best-induction-cookware': ['best-food-dehydrator'],
  'best-dishwasher': ['best-countertop-ice-maker', 'best-food-dehydrator'],
  'best-robot-vacuum': ['best-carpet-cleaner'],
  'best-plasma-cutter': ['best-welder-for-beginners'],
  'best-tekton-hand-tools': ['how-to-prevent-rust-on-hand-tools'],
  'rust-converter-vs-rust-remover': ['how-to-prevent-rust-on-hand-tools'],
  'christmas-gifts-for-men-under-50': ['christmas-gifts-for-men-who-have-everything'],
  'best-drain-snake': ['best-kitchen-faucet', 'best-sump-pump', 'best-under-sink-water-filter'],
  'best-drill-press': ['best-cordless-drills', 'best-bench-vise', 'best-band-saw'],
  'best-harness-for-zipline-riding': ['best-crash-pad-for-bouldering-outdoors'],
  'best-ski-gloves': ['best-crash-pad-for-bouldering-outdoors'],
  'best-home-security-cameras': ['best-garage-door-opener', 'best-whole-house-surge-protector'],
  'best-stud-finder': ['best-laser-level'],
  'best-wire-stripper': ['best-circuit-breaker-finder', 'best-stud-finder'],
  'braun-type-5544-vs-series-7': ['buzz-cut-guide', 'how-to-shave-back-hair'],
  'buzz-cut-guide': ['braun-type-5544-vs-series-7', 'how-to-shave-back-hair'],
  'hookaroon-vs-pickaroon': ['best-chainsaw', 'best-log-splitter', 'best-wood-chipper'],
};
// Below this similarity a guide is not a confident home for an article.
const MIN_PILLAR_SIM = 0.2;

const pages = loadPages();
const source = new Map(pages.map((p) => [p.slug, p.source]));
const model = buildModel(pages);
const { sim, shared, meta } = model;
// Links an editor or a review judged off-topic (from -> [to]). They are left out of
// every generated block, and dropped from hand-picked "More in" lists.
const BLOCKLIST = JSON.parse(readFileSync(join(import.meta.dirname, 'link-blocklist.json'), 'utf8'));
const slugs = [...meta.keys()];
const guides = new Set(slugs.filter((s) => isPillar(s) && !NOT_A_GUIDE.has(s)));

// ---------------------------------------------------------------------------
// Reading the pages
// ---------------------------------------------------------------------------

// The `const moreInCategory = [...]` array: its span in the source and its links.
function handMore(src) {
  const start = src.search(/const moreInCategory\s*(:[^=]*)?=\s*\[/);
  if (start === -1) return { span: null, links: [] };
  let i = src.indexOf('[', start);
  let depth = 0;
  let inStr = null;
  for (; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (c === '\\') i++;
      else if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') inStr = c;
    else if (c === '[') depth++;
    else if (c === ']' && --depth === 0) break;
  }
  const body = src.slice(start, i + 1);
  const links = [...body.matchAll(/\{[^{}]*\}/g)].map((m) => {
    const get = (k) => (m[0].match(new RegExp(`["']?${k}["']?\\s*:\\s*(["'])((?:\\\\.|(?!\\1).)*)\\1`)) || [])[2];
    const url = get('url') || '';
    return { title: (get('title') || '').replace(/\\(.)/g, '$1'), slug: url.replace(/^\/|\/$/g, '') };
  }).filter((l) => l.title && meta.has(l.slug));
  return { span: [start, i + 1], links };
}

const LINK_RE = /(?:href|url|link)\s*[:=]\s*["'`]\/([a-z0-9-]+)\/["'`]/g;
// Pages a page links to anywhere outside its moreInCategory array.
function linkedElsewhere(slug) {
  const src = source.get(slug);
  const { span } = handMore(src);
  const rest = span ? src.slice(0, span[0]) + src.slice(span[1]) : src;
  return new Set([...rest.matchAll(LINK_RE)].map((m) => m[1]).filter((t) => t !== slug && meta.has(t)));
}

// "7 Best Deck Stains (2026): Tested" -> "7 Best Deck Stains"; keeps a question whole.
function shortTitle(slug) {
  const t = meta.get(slug).title.replace(/\s*\(?\b(in )?20\d\d\)?/g, '').trim();
  const q = t.indexOf('?');
  return (q > 0 ? t.slice(0, q + 1) : t.split(/:\s| — | \| /)[0]).trim();
}

// ---------------------------------------------------------------------------
// 1. Which guide does each article feed?
// ---------------------------------------------------------------------------
const pillarOf = {};
const ctaOf = (src) => (src.match(/stickyCta=\{\{[\s\S]*?link:\s*"\/([a-z0-9-]+)\/"/) || [])[1];
for (const slug of slugs) {
  if (guides.has(slug)) continue;
  if (slug in PILLAR_OVERRIDES) {
    if (PILLAR_OVERRIDES[slug]) pillarOf[slug] = PILLAR_OVERRIDES[slug];
    continue;
  }
  const cta = ctaOf(source.get(slug));
  if (cta && guides.has(cta)) {
    pillarOf[slug] = cta;
    continue;
  }
  // A guide the article already links to is a better home than an equally close
  // stranger, so give those a nudge before picking the closest.
  const linked = linkedElsewhere(slug);
  const [best] = [...guides]
    .filter((g) => !BLOCKLIST[slug]?.includes(g))
    .map((g) => [g, sim(slug, g) * (linked.has(g) ? 1.3 : 1)])
    .sort((a, b) => b[1] - a[1]);
  if (best && best[1] >= MIN_PILLAR_SIM) pillarOf[slug] = best[0];
}

const spokesOf = new Map([...guides].map((g) => [g, []]));
for (const [spoke, guide] of Object.entries(pillarOf)) spokesOf.get(guide)?.push(spoke);

// ---------------------------------------------------------------------------
// 2. The "More in …" block for every page
// ---------------------------------------------------------------------------
const family = (slug) => (guides.has(slug) ? slug : pillarOf[slug]);
const elsewhere = new Map(slugs.map((s) => [s, linkedElsewhere(s)]));
const blocked = (from, to) => BLOCKLIST[from]?.includes(to);

function score(from, to) {
  let s = sim(from, to);
  const f = family(from);
  if (f && family(to) === f) s *= 1.4; // same cluster: siblings, or guide <-> spoke
  if (elsewhere.get(from).has(to)) s *= 0.7; // already linked on the page
  return s;
}
// A computed link has to share real topic words, not one accident of wording.
const related = (a, b, s) => s >= 0.4 || (s >= 0.1 && shared(a, b) >= 2);

const more = {};
const changes = [];
for (const slug of slugs) {
  const hand = handMore(source.get(slug)).links.filter((l) => !blocked(slug, l.slug));
  const titles = new Map(hand.map((l) => [l.slug, l.title]));
  // Room for the guide, two close matches and every hand-picked link that still
  // fits, between two and three rows of cards.
  const size = Math.min(MAX_MORE, Math.max(MORE_SIZE, hand.length + 3));
  const picked = [];
  const take = (t) => {
    if (t && t !== slug && meta.has(t) && !blocked(slug, t) && !picked.includes(t) && picked.length < size) picked.push(t);
  };
  const ranked = slugs
    .filter((t) => t !== slug)
    .map((t) => [t, score(slug, t)])
    .filter(([t, s]) => related(slug, t, s))
    .sort((a, b) => b[1] - a[1]);

  take(pillarOf[slug]); // a supporting article always offers its guide
  for (const [t, s] of ranked.slice(0, 2)) if (s >= 0.25) take(t);
  for (const l of hand) take(l.slug);
  // Thin topics get a shorter block rather than a weak match.
  for (const [t, s] of ranked) if (s >= 0.2) take(t);

  more[slug] = picked.map((t) => ({ title: titles.get(t) || shortTitle(t), url: `/${t}/` }));

  if (REPORT) {
    const all = handMore(source.get(slug)).links.map((l) => l.slug);
    const dropped = all.filter((t) => !picked.includes(t));
    const added = picked.filter((t) => !all.includes(t));
    if (dropped.length) changes.push(`${slug}: dropped ${dropped.join(', ')}`);
    if (added.length) changes.push(`${slug}: added ${added.join(', ')}`);
  }
}

// ---------------------------------------------------------------------------
// 3. Make sure every page is reachable from a few close neighbours
// ---------------------------------------------------------------------------
const inbound = new Map(slugs.map((s) => [s, new Set()]));
const recount = () => {
  for (const set of inbound.values()) set.clear();
  for (const s of slugs) {
    for (const t of elsewhere.get(s)) inbound.get(t)?.add(s);
    for (const l of more[s]) inbound.get(l.url.slice(1, -1))?.add(s);
  }
};
recount();
const MIN_INBOUND = 3;
for (const slug of slugs) {
  if (inbound.get(slug).size >= MIN_INBOUND) continue;
  const hosts = slugs
    .filter((h) => h !== slug && !inbound.get(slug).has(h) && !blocked(h, slug))
    .map((h) => [h, sim(h, slug)])
    .filter(([h, s]) => s >= 0.2 && related(h, slug, s))
    .sort((a, b) => b[1] - a[1]);
  for (const [host] of hosts) {
    if (inbound.get(slug).size >= MIN_INBOUND) break;
    const list = more[host];
    const entry = { title: shortTitle(slug), url: `/${slug}/` };
    if (list.length >= MAX_MORE) {
      // Replace the host's weakest link, never its guide (always first), and only
      // one the target can spare without dropping under the minimum itself.
      const weakest = list.slice(1).reduce((w, l) => (score(host, l.url.slice(1, -1)) < score(host, w.url.slice(1, -1)) ? l : w));
      if (inbound.get(weakest.url.slice(1, -1)).size <= MIN_INBOUND) continue;
      inbound.get(weakest.url.slice(1, -1)).delete(host);
      list[list.indexOf(weakest)] = entry;
    } else list.push(entry);
    inbound.get(slug).add(host);
    if (REPORT) changes.push(`${host}: now links /${slug}/ (had ${inbound.get(slug).size - 1} inbound)`);
  }
}
for (const [host, targets] of Object.entries(MANUAL_LINKS)) {
  // The map covers topics this site may not carry; skip any page that is not built.
  if (!more[host]) continue;
  const list = more[host];
  for (const t of targets.filter((t) => more[t])) {
    if (list.some((l) => l.url === `/${t}/`)) continue;
    const entry = { title: shortTitle(t), url: `/${t}/` };
    if (list.length < MAX_MORE) list.push(entry);
    else list[list.length - 1] = entry;
  }
}
recount();

// ---------------------------------------------------------------------------
// 4. Every guide links to every article in its cluster
// ---------------------------------------------------------------------------
const cluster = {};
for (const [guide, spokes] of spokesOf) {
  const shown = new Set([...elsewhere.get(guide), ...more[guide].map((l) => l.url.slice(1, -1))]);
  const missing = spokes
    .filter((s) => !shown.has(s) && !BLOCKLIST[guide]?.includes(s))
    .sort((a, b) => sim(guide, b) - sim(guide, a));
  if (missing.length) cluster[guide] = missing.map((s) => ({ title: shortTitle(s), url: `/${s}/` }));
}

// Guides whose "Before You Buy" box lists their questions; MoreInCategory skips
// those links there rather than show them twice.
const planQuestions = slugs.filter((s) => /<PlanTheJob\s*\/>/.test(source.get(s))).sort();

const sortKeys = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(OUT, JSON.stringify({ pillarOf: sortKeys(pillarOf), more: sortKeys(more), cluster: sortKeys(cluster), planQuestions }, null, 2) + '\n');

const weak = slugs.filter((s) => inbound.get(s).size < MIN_INBOUND);
const unhomed = slugs.filter((s) => !guides.has(s) && !pillarOf[s]);
console.log(
  `[interlinks] ${slugs.length} pages, ${Object.keys(pillarOf).length} assigned to ${guides.size} guides, ` +
  `${Object.values(cluster).flat().length} cluster links added to ${Object.keys(cluster).length} guides, ` +
  `${weak.length} page(s) under ${MIN_INBOUND} inbound links${unhomed.length ? `, ${unhomed.length} with no guide` : ''}.`
);
if (REPORT) {
  console.log(`\nWith no confident guide: ${unhomed.join(', ') || 'none'}`);
  console.log(`Still under ${MIN_INBOUND} inbound links: ${weak.map((s) => `${s} (${inbound.get(s).size})`).join(', ') || 'none'}`);
  console.log(`\n${changes.length} change(s):`);
  for (const c of changes) console.log(`  ${c}`);
}
