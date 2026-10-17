#!/usr/bin/env node
/**
 * Adds a "Check Price on Amazon" button to every product card.
 *
 * Product data comes from data/amazon-products.json, keyed by the product name
 * shown in the card. A product with an `asin` links straight to its Amazon
 * page; one without falls back to a tagged Amazon search for its `query`.
 * The tracking ID lives in build.config.json -> amazon.tag.
 *
 * Safe to re-run: each button sits between amazon-cta marker comments and is
 * replaced in place, so changing the tag or an ASIN just means running this
 * again.
 *
 * Usage:
 *   node tools/affiliate.js           # update all pages
 *   node tools/affiliate.js --check   # exit 1 if any page is out of date
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CONFIG = JSON.parse(fs.readFileSync(path.join(ROOT, 'build.config.json'), 'utf8'));
const { tag, domain } = CONFIG.amazon;
const PRODUCTS = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/amazon-products.json'), 'utf8')).products;

const CHECK = process.argv.includes('--check');
const START = '<!-- amazon-cta:start -->';
const END = '<!-- amazon-cta:end -->';
const AMAZON_LINE = 'As an Amazon Associate we earn from qualifying purchases.';

function decode(s) {
  return s.replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').trim();
}

function escapeAttr(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function amazonUrl(product) {
  if (product.asin) return `https://${domain}/dp/${product.asin}?tag=${tag}`;
  return `https://${domain}/s?k=${encodeURIComponent(product.query).replace(/%20/g, '+')}&tag=${tag}`;
}

function button(name, product) {
  const label = escapeAttr(`Check price of ${name} on Amazon`);
  return `${START}<div class="amazon-cta"><a class="btn-amazon" href="${escapeAttr(amazonUrl(product))}" ` +
    `target="_blank" rel="nofollow sponsored noopener" aria-label="${label}">Check Price on Amazon</a></div>${END}`;
}

/** Index just past the `</div>` that closes the div opening at `openIdx`. */
function endOfDiv(html, openIdx) {
  const tagRe = /<(\/?)div\b[^>]*>/gi;
  tagRe.lastIndex = openIdx;
  let depth = 0;
  let m;
  while ((m = tagRe.exec(html)) !== null) {
    depth += m[1] === '/' ? -1 : 1;
    if (depth === 0) return m.index + m[0].length;
  }
  return -1;
}

const files = [
  ...fs.readdirSync(ROOT).filter((f) => f.endsWith('.html')),
  ...fs.readdirSync(path.join(ROOT, 'reviews')).filter((f) => f.endsWith('.html')).map((f) => `reviews/${f}`),
];

const missing = new Set();
const stale = [];
let total = 0;

for (const file of files) {
  const abs = path.join(ROOT, file);
  const before = fs.readFileSync(abs, 'utf8');
  if (!before.includes('class="product-card"')) continue;

  // Drop old buttons so they are rebuilt from current data.
  let html = before.replace(new RegExp(`\\n[ \\t]*${START}[\\s\\S]*?${END}`, 'g'), '');

  const cardRe = /<div class="product-card"[^>]*>/g;
  const inserts = [];
  let m;
  while ((m = cardRe.exec(html)) !== null) {
    const cardEnd = endOfDiv(html, m.index);
    const card = html.slice(m.index, cardEnd);
    const nameMatch = /class="product-name">([^<]*)</.exec(card);
    if (!nameMatch) continue;
    const name = decode(nameMatch[1]);
    const product = PRODUCTS[name];
    if (!product) { missing.add(`${file}: ${name}`); continue; }

    // Put the button right after the card's bottom line, or at the end of the body.
    const bl = card.indexOf('<div class="bottom-line"');
    const body = card.indexOf('<div class="product-card-body"');
    let at;
    if (bl !== -1) at = m.index + endOfDiv(card, bl);
    else if (body !== -1) at = m.index + endOfDiv(card, body) - '</div>'.length;
    else continue;

    const indent = (/\n([ \t]*)[^\n]*$/.exec(html.slice(0, at)) || [, ''])[1];
    inserts.push({ at, text: `\n${indent}${button(name, product)}` });
    total++;
  }

  for (const ins of inserts.reverse()) html = html.slice(0, ins.at) + ins.text + html.slice(ins.at);

  // Amazon requires this exact disclosure on pages that carry its links.
  if (inserts.length && !html.includes(AMAZON_LINE)) {
    html = html.replace(/(<div class="disclosure"><strong>Affiliate Disclosure:<\/strong>[^<]*?)(\s*<a )/, `$1 ${AMAZON_LINE}$2`);
  }

  if (html !== before) {
    if (CHECK) stale.push(file);
    else fs.writeFileSync(abs, html);
  }
}

if (missing.size) {
  console.error('Products with no entry in data/amazon-products.json:');
  for (const x of missing) console.error(`  ${x}`);
}
if (CHECK && stale.length) {
  console.error(`Out of date (run npm run affiliate): ${stale.join(', ')}`);
}
const withAsin = Object.values(PRODUCTS).filter((p) => p.asin).length;
console.log(`${total} Amazon buttons, tag ${tag}. ${withAsin}/${Object.keys(PRODUCTS).length} products link to an exact ASIN; the rest use a search link.`);
process.exit(missing.size || stale.length ? 1 : 0);
