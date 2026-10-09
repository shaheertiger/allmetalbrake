#!/usr/bin/env node
/**
 * Adds an Amazon affiliate button to every product card in src/bodies/.
 *
 * For each `<div class="product-card">` it reads the `.product-name` and
 * inserts a "Check Price on Amazon" button at the end of the card body:
 *
 *   1. a direct /dp/<ASIN> product link when src/data/amazon-asins.json maps
 *      the name to a verified ASIN, otherwise
 *   2. a tagged Amazon search for the name, so a product without a verified
 *      ASIN still lands on the right item and credits the click.
 *
 * Re-runnable: a card that already has a button gets its href recomputed, so
 * adding an ASIN to the map and re-running upgrades that card in place.
 *
 * Usage:
 *   node scripts/add-affiliate-links.mjs           # rewrite src/bodies/**.html
 *   node scripts/add-affiliate-links.mjs --check   # exit 1 if any card lacks a link
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Amazon Associates tracking ID. Public by design: it appears in every link.
export const AMAZON_TAG = 'sktiger-20';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BODIES = path.join(ROOT, 'src', 'bodies');
const CHECK = process.argv.includes('--check');
const ASINS = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', 'amazon-asins.json'), 'utf8'));

const decode = (s) =>
  s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&rsquo;/g, "'").replace(/&nbsp;/g, ' ');
const escAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

/**
 * Turns a display name into a search query. Parentheses hold either a model
 * code ("(TSS103)"), which narrows the search and is kept, or an editorial
 * aside ("(511 / StoneTech class)", "(2 to 3 in.)"), which would only confuse
 * it and is dropped.
 */
export function searchQuery(name) {
  return decode(name)
    .replace(/\(([^)]*)\)/g, (_, inner) => (/^[A-Z0-9-]+$/.test(inner) ? inner : ''))
    .replace(/\s+/g, ' ')
    .trim();
}

export function amazonSearchUrl(query) {
  return `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${AMAZON_TAG}`;
}

/** Direct product link when the name has a verified ASIN, else a tagged search. */
export function amazonUrl(name) {
  const asin = ASINS[decode(name)];
  return asin
    ? `https://www.amazon.com/dp/${asin}?tag=${AMAZON_TAG}&linkCode=ll1`
    : amazonSearchUrl(searchQuery(name));
}

/** Index of the `</div>` that closes the div opening at `start`. */
function closingDiv(html, start) {
  const re = /<(\/?)div\b[^>]*>/gi;
  re.lastIndex = start;
  let depth = 0;
  let m;
  while ((m = re.exec(html))) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) return m.index;
  }
  return -1;
}

function processFile(file) {
  let html = fs.readFileSync(file, 'utf8');
  let added = 0;
  let updated = 0;
  let missing = 0;
  let pos = 0;
  for (;;) {
    const start = html.indexOf('<div class="product-card"', pos);
    if (start < 0) break;
    const end = closingDiv(html, start);
    if (end < 0) break;
    const card = html.slice(start, end);
    pos = end;
    const name = card.match(/class="product-name">([^<]+)</)?.[1];
    if (card.includes('amazon-cta')) {
      if (CHECK || !name) continue;
      const href = escAttr(amazonUrl(name));
      const fixed = card.replace(/(class="btn amazon-cta" href=")[^"]*"/, `$1${href}"`);
      if (fixed !== card) {
        html = html.slice(0, start) + fixed + html.slice(end);
        pos = start + fixed.length;
        updated++;
      }
      continue;
    }
    const bodyRel = card.indexOf('<div class="product-card-body"');
    if (!name || bodyRel < 0) continue;
    if (CHECK) { missing++; continue; }
    const bodyEnd = closingDiv(html, start + bodyRel);
    const button =
      `\n          <a class="btn amazon-cta" href="${escAttr(amazonUrl(name))}" target="_blank" rel="sponsored nofollow noopener">Check Price on Amazon →</a>\n        `;
    // Trim trailing whitespace before the closing tag so the button sits on its own line.
    const before = html.slice(0, bodyEnd).replace(/\s*$/, '');
    html = before + button + html.slice(bodyEnd);
    pos = before.length + button.length;
    added++;
  }
  if (added || updated) fs.writeFileSync(file, html);
  return { added, updated, missing };
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? walk(path.join(dir, d.name)) : d.name.endsWith('.html') ? [path.join(dir, d.name)] : [],
  );
}

let totalAdded = 0;
let totalUpdated = 0;
let totalMissing = 0;
for (const file of walk(BODIES)) {
  const { added, updated, missing } = processFile(file);
  if (added) console.log(`+${added}  ${path.relative(ROOT, file)}`);
  if (updated) console.log(`~${updated}  ${path.relative(ROOT, file)}`);
  totalUpdated += updated;
  if (missing) console.log(`missing ${missing}  ${path.relative(ROOT, file)}`);
  totalAdded += added;
  totalMissing += missing;
}

if (CHECK) {
  if (totalMissing) {
    console.error(`\n${totalMissing} product card(s) have no Amazon link. Run: node scripts/add-affiliate-links.mjs`);
    process.exit(1);
  }
  console.log('Every product card has an Amazon link.');
} else {
  console.log(`\nAdded ${totalAdded} Amazon link(s), updated ${totalUpdated}.`);
}
