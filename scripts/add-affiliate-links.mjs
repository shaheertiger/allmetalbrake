#!/usr/bin/env node
/**
 * Adds an Amazon affiliate button to every product card in src/bodies/.
 *
 * For each `<div class="product-card">` it reads the `.product-name`, builds a
 * tagged Amazon search URL for it, and inserts a "Check Price on Amazon" button
 * at the end of the card body. Search links are used rather than /dp/<ASIN>
 * links because an unverified ASIN can point at a withdrawn or different
 * product; a tagged search always lands on the right item and still credits
 * the click.
 *
 * Idempotent: a card that already has an `amazon-cta` link is left alone, so
 * the script can be re-run after adding articles.
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
  let missing = 0;
  let pos = 0;
  for (;;) {
    const start = html.indexOf('<div class="product-card"', pos);
    if (start < 0) break;
    const end = closingDiv(html, start);
    if (end < 0) break;
    const card = html.slice(start, end);
    pos = end;
    if (card.includes('amazon-cta')) continue;
    const name = card.match(/class="product-name">([^<]+)</)?.[1];
    const bodyRel = card.indexOf('<div class="product-card-body"');
    if (!name || bodyRel < 0) continue;
    if (CHECK) { missing++; continue; }
    const bodyEnd = closingDiv(html, start + bodyRel);
    const query = searchQuery(name);
    const button =
      `\n          <a class="btn amazon-cta" href="${escAttr(amazonSearchUrl(query))}" target="_blank" rel="sponsored nofollow noopener">Check Price on Amazon →</a>\n        `;
    // Trim trailing whitespace before the closing tag so the button sits on its own line.
    const before = html.slice(0, bodyEnd).replace(/\s*$/, '');
    html = before + button + html.slice(bodyEnd);
    pos = before.length + button.length;
    added++;
  }
  if (added) fs.writeFileSync(file, html);
  return { added, missing };
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? walk(path.join(dir, d.name)) : d.name.endsWith('.html') ? [path.join(dir, d.name)] : [],
  );
}

let totalAdded = 0;
let totalMissing = 0;
for (const file of walk(BODIES)) {
  const { added, missing } = processFile(file);
  if (added) console.log(`+${added}  ${path.relative(ROOT, file)}`);
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
  console.log(`\nAdded ${totalAdded} Amazon link(s).`);
}
