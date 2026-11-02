#!/usr/bin/env node
// Builds src/data/top-picks.json: for every buyer's guide, its #1 product, and for
// every supporting article, the guide it belongs to. TopPick.astro and the mobile
// sticky bar use it so a reader on a question or how-to page can reach the guide's
// top pick on Amazon without first loading the guide.
//
//   node scripts/build-top-picks.mjs
//
// Runs as part of `npm run build`, so the picks always follow the guides. The #1
// pick is the first entry of the guide's PRODUCTS array (or PICKS, on the
// hand-written guides), which is also what QuickPicks puts first.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildClusters, loadPages } from './cluster-report.mjs';

const ROOT = join(import.meta.dirname, '..');
const PAGES_DIR = join(ROOT, 'src', 'pages');
const OUT = join(ROOT, 'src', 'data', 'top-picks.json');
const readJson = (f) => JSON.parse(readFileSync(join(ROOT, 'src', 'data', f), 'utf8'));
const ASINS = readJson('product-asins.json');
const QUARANTINE = readJson('asin-quarantine.json');
const SIMILAR = readJson('product-similar-asins.json');

// Guides whose #1 entry is a service or installed system rather than something a
// reader can buy, so there is no honest product link to offer.
const NOT_A_PRODUCT = new Set(['best-basement-waterproofing-systems']);

// Words too generic to show that an article and a guide share a topic.
const STOP = new Set(['best', 'reviews', 'review', 'vs', 'how', 'to', 'a', 'an', 'the', 'of', 'for',
  'and', 'or', 'in', 'on', 'can', 'you', 'do', 'does', 'is', 'are', 'what', 'when', 'why', 'which',
  'should', 'much', 'many', 'long', 'it', 'my', 'your', 'i', 'need', 'cost', 'size', 'guide', 'with']);
const tokens = (slug) => new Set(slug.split('-').filter((w) => !STOP.has(w)));
// Material words shared by too many unrelated guides to prove a match on their own
// (sealing-old-concrete is not about ice melt for concrete).
const BROAD = new Set(['concrete', 'floor', 'garage', 'sealer', 'sealers', 'wood', 'water', 'based',
  'paint', 'stain', 'oil', 'home', 'house', 'outdoor', 'exterior', 'interior']);

// The first {...} object after `const PRODUCTS = [` or `const PICKS = [`, found by
// brace depth so nested arrays (pros, cons) and braces inside strings are skipped.
function firstProductBlock(src) {
  const start = src.search(/const (PRODUCTS|PICKS)\s*(:[^=]*)?=\s*\[/);
  if (start === -1) return null;
  let i = src.indexOf('[', start) + 1;
  let depth = 0;
  let open = -1;
  let inStr = null;
  for (; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (c === '\\') i++;
      else if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') inStr = c;
    else if (c === '{') {
      if (depth === 0) open = i;
      depth++;
    } else if (c === '}') {
      depth--;
      if (depth === 0) return src.slice(open, i + 1);
    } else if (c === ']' && depth === 0) return null;
  }
  return null;
}

// Top-level string field from an object literal, with bare or quoted keys.
function field(block, key) {
  const m = block.match(new RegExp(`(?:^|[\\s{,])"?${key}"?\\s*:\\s*("(?:[^"\\\\]|\\\\.)*")`, 'm'));
  return m ? JSON.parse(m[1]) : undefined;
}

function guideTitle(src) {
  const m = src.match(/const title =\s*\n?\s*"((?:[^"\\]|\\.)*)"/);
  if (!m) return undefined;
  // "7 Best Deck Sealants in 2026: Tested & Ranked" -> "7 Best Deck Sealants"
  return JSON.parse(`"${m[1]}"`)
    .split(':')[0]
    .replace(/\s*\(?(in )?20\d\d\)?/g, '')
    .trim();
}

const { ranked } = buildClusters();
const pillars = {};
const spokes = {};

for (const { pillar, spokes: list } of ranked) {
  const src = readFileSync(join(PAGES_DIR, `${pillar}.astro`), 'utf8');
  const block = firstProductBlock(src);
  if (!block) continue;
  const id = field(block, 'id');
  const name = field(block, 'name');
  if (!id || !name || NOT_A_PRODUCT.has(pillar)) continue;
  const amazonUrl = field(block, 'amazonUrl');
  // Only offer a pick that resolves to a real Amazon listing, never the tagged
  // search fallback: a search for a product name is a weak thing to put in front
  // of someone who has not seen the guide.
  const listed = (amazonUrl && amazonUrl.startsWith('http')) || (ASINS[id] && !QUARANTINE[id]) || SIMILAR[id];
  if (!listed) continue;
  pillars[pillar] = {
    id,
    name,
    badge: field(block, 'badge'),
    amazonUrl: amazonUrl && amazonUrl.startsWith('http') ? amazonUrl : undefined,
    guide: guideTitle(src),
  };
  for (const spoke of list) spokes[spoke] = pillar;
}

// Keep a spoke only when its guide has a pick and we are confident it belongs to
// that guide: either it names the guide in its sticky CTA (every scaffolded article
// does), or its slug shares a topic word with the guide's. The cluster report's
// fallback (the guide it links to most) is fine for counting spokes but too loose
// to put a product in front of a reader: it maps milwaukee-vs-dewalt to hookaroons.
const sources = new Map(loadPages().map((p) => [p.slug, p.source]));
for (const [spoke, pillar] of Object.entries(spokes)) {
  const cta = sources.get(spoke)?.match(/stickyCta=\{\{[\s\S]*?link:\s*"\/([a-z0-9-]+)\/"/);
  const explicit = cta && cta[1] === pillar;
  const g = tokens(pillar);
  const related = [...tokens(spoke)].some((w) => g.has(w) && !BROAD.has(w));
  // A single-product review should not carry a box selling a different product.
  const isReview = /-reviews?$/.test(spoke);
  if (!pillars[pillar] || isReview || !(explicit || related)) delete spokes[spoke];
}

writeFileSync(OUT, JSON.stringify({ pillars, spokes }, null, 2) + '\n');

// ---------------------------------------------------------------------------
// src/data/guide-links.json, for PlanTheJob.astro on every guide:
//   titles: every guide's short title (for "Also needed for this job" links)
//   questions: per guide, its supporting articles (same confidence rule as above,
//   single-product reviews included), sizing and cost questions first.
// ---------------------------------------------------------------------------
const LINKS_OUT = join(ROOT, 'src', 'data', 'guide-links.json');
const pageTitle = (src) => {
  const m = src?.match(/const title =\s*\n?\s*"((?:[^"\\]|\\.)*)"/);
  if (!m) return undefined;
  const t = JSON.parse(`"${m[1]}"`);
  // Keep the question or claim, drop the subtitle: "Is X Worth It? Who Should..." -> "Is X Worth It?"
  const q = t.indexOf('?');
  const head = q > 0 ? t.slice(0, q + 1) : t.split(':')[0];
  return head.replace(/\s*\((?:20\d\d[^)]*)\)/g, '').trim();
};
const priority = (slug) =>
  /^what-size|^how-much|-cost$|^how-many|calculator/.test(slug) ? 0
  : /^how-long|^how-often|^when-|^what-temperature/.test(slug) ? 1
  : /-vs-/.test(slug) ? 2
  : /^(can|do|does|is|are|should|will)-/.test(slug) ? 3
  : 4;
const titles = {};
const questions = {};
for (const { pillar, spokes: list } of ranked) {
  titles[pillar] = guideTitle(sources.get(pillar) ?? readFileSync(join(PAGES_DIR, `${pillar}.astro`), 'utf8'));
  const g = tokens(pillar);
  const keep = list.filter((spoke) => {
    const cta = sources.get(spoke)?.match(/stickyCta=\{\{[\s\S]*?link:\s*"\/([a-z0-9-]+)\/"/);
    return (cta && cta[1] === pillar) || [...tokens(spoke)].some((w) => g.has(w) && !BROAD.has(w));
  });
  const items = keep
    .map((slug) => ({ slug, title: pageTitle(sources.get(slug)) }))
    .filter((x) => x.title)
    .sort((a, b) => priority(a.slug) - priority(b.slug) || a.slug.localeCompare(b.slug));
  if (items.length) questions[pillar] = items;
}
writeFileSync(LINKS_OUT, JSON.stringify({ titles, questions }, null, 2) + '\n');
console.log(`[guide-links] ${Object.keys(questions).length} guides with supporting questions`);
console.log(`[top-picks] ${Object.keys(pillars).length} guides with a #1 pick, ${Object.keys(spokes).length} supporting pages mapped`);
