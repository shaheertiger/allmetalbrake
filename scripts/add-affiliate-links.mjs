#!/usr/bin/env node
/**
 * Fills the Amazon parts of every review page in src/bodies/.
 *
 * Each `<div class="product-card">` has two generated regions inside its
 * `.product-box`, which this script owns:
 *
 *   <!-- product-media:start -->…<!-- product-media:end -->
 *       the product photo, when src/data/amazon-asins.json has a verified
 *       ASIN for the card's `.product-name`. The image is Amazon's own
 *       SiteStripe image link (served by Amazon, tagged with our ID), which
 *       is how the Associates program lets sites show product photos without
 *       re-hosting them. If Amazon doesn't serve it, the figure removes itself.
 *   <!-- product-cta:start -->…<!-- product-cta:end -->
 *       the "See It on Amazon" button: a direct /dp/<ASIN> link when the
 *       ASIN is known, otherwise a tagged Amazon search for the name.
 *
 * On roundups it also rebuilds two page-level regions from the cards that
 * carry a `.product-label` ("Best Overall", "Best Value", …):
 *
 *   <!-- top-picks:start -->…   the numbered "Our Top Picks" list
 *   <!-- picks-band:start -->…  the row of pick cards under the headline
 *
 * Re-runnable: every region is regenerated from scratch, so adding an ASIN
 * to the map and re-running upgrades that product everywhere it appears.
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
const escText = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const stripTags = (s) => decode(s.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

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

export const asinFor = (name) => ASINS[decode(name)];

/** Direct product link when the name has a verified ASIN, else a tagged search. */
export function amazonUrl(name) {
  const asin = asinFor(name);
  return asin
    ? `https://www.amazon.com/dp/${asin}?tag=${AMAZON_TAG}&linkCode=ll1`
    : amazonSearchUrl(searchQuery(name));
}

/** Amazon's SiteStripe product image for an ASIN. */
export function amazonImageUrl(asin) {
  return (
    'https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8' +
    `&ASIN=${asin}&Format=_SL250_&ID=AsinImage&MarketPlace=US&ServiceVersion=20070822&WS=1` +
    `&tag=${AMAZON_TAG}&language=en_US`
  );
}

const LINK_ATTRS = 'target="_blank" rel="sponsored nofollow noopener"';

function region(html, name, content) {
  const start = `<!-- ${name}:start -->`;
  const end = `<!-- ${name}:end -->`;
  const a = html.indexOf(start);
  const b = a < 0 ? -1 : html.indexOf(end, a);
  if (a < 0 || b < 0) return html;
  return html.slice(0, a + start.length) + content + html.slice(b);
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

function media(name, asin) {
  if (!asin) return '';
  const alt = escAttr(stripTags(name));
  return (
    `\n          <figure class="product-media"><a href="${escAttr(amazonUrl(name))}" ${LINK_ATTRS}>` +
    `<img src="${escAttr(amazonImageUrl(asin))}" alt="${alt}" width="250" height="250" loading="lazy" decoding="async" onerror="this.closest('figure').remove()" />` +
    `</a><figcaption>Photo: amazon.com</figcaption></figure>\n          `
  );
}

function cta(name) {
  return `\n          <a class="see-it amazon-cta" href="${escAttr(amazonUrl(name))}" ${LINK_ATTRS}>See It on Amazon</a>\n          `;
}

function processFile(file) {
  let html = fs.readFileSync(file, 'utf8');
  const before = html;
  const cards = [];
  let missing = 0;
  let pos = 0;

  for (;;) {
    const start = html.indexOf('<div class="product-card"', pos);
    if (start < 0) break;
    const end = closingDiv(html, start);
    if (end < 0) break;
    let card = html.slice(start, end);
    const id = card.match(/^<div class="product-card" id="([^"]+)"/)?.[1];
    const name = card.match(/class="product-name">([^<]+)</)?.[1]?.trim();
    const label = card.match(/class="product-label">([^<]+)</)?.[1]?.trim();
    if (name) {
      if (CHECK && !/class="see-it amazon-cta" href="https:\/\/www\.amazon\.com\//.test(card)) missing++;
      if (id) cards.push({ id, name, label });
      card = region(card, 'product-media', media(name, asinFor(name)));
      card = region(card, 'product-cta', cta(name));
    }
    html = html.slice(0, start) + card + html.slice(end);
    pos = start + card.length;
  }

  const picks = cards.filter((c) => c.label);
  const list = picks.length < 2 ? '' : `
      <div class="top-picks">
        <h2 class="top-picks-title" id="top-picks">Our Top Picks</h2>
        <ol>
${picks.map((c) => `          <li><strong>${escText(decode(c.label).toUpperCase())}:</strong> <a href="${escAttr(amazonUrl(c.name))}" ${LINK_ATTRS}>${c.name}</a><br /><a class="jump" href="#${c.id}">&darr; Jump to Review</a></li>`).join('\n')}
        </ol>
      </div>
      `;
  const band = picks.length < 2 ? '' : `
<section class="picks-band" aria-label="Our top picks">
  <div class="picks-band-inner">
${picks.map((c) => {
    const asin = asinFor(c.name);
    const img = asin
      ? `<img src="${escAttr(amazonImageUrl(asin))}" alt="${escAttr(stripTags(c.name))}" width="250" height="250" loading="lazy" decoding="async" onerror="this.remove()" />`
      : '';
    return `    <div class="pick-card">
      <div class="product-label">${c.label}</div>
      <a class="pick-card-body" href="#${c.id}">${img}<span class="pick-card-name">${c.name}</span></a>
      <a class="see-it amazon-cta" href="${escAttr(amazonUrl(c.name))}" ${LINK_ATTRS}>See It</a>
    </div>`;
  }).join('\n')}
  </div>
</section>
`;

  if (!CHECK) {
    html = region(html, 'top-picks', list);
    html = region(html, 'picks-band', band);
    if (html !== before) fs.writeFileSync(file, html);
  }
  const withAsin = cards.filter((c) => asinFor(c.name)).length;
  return { cards: cards.length, withAsin, missing, changed: html !== before };
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? walk(path.join(dir, d.name)) : d.name.endsWith('.html') ? [path.join(dir, d.name)] : [],
  );
}

let totalCards = 0;
let totalAsin = 0;
let totalMissing = 0;
let changedFiles = 0;
for (const file of walk(BODIES)) {
  const { cards, withAsin, missing, changed } = processFile(file);
  totalCards += cards;
  totalAsin += withAsin;
  totalMissing += missing;
  if (changed) changedFiles++;
  if (missing) console.log(`missing ${missing}  ${path.relative(ROOT, file)}`);
}

if (CHECK) {
  if (totalMissing) {
    console.error(`\n${totalMissing} product card(s) have no Amazon link. Run: node scripts/add-affiliate-links.mjs`);
    process.exit(1);
  }
  console.log('Every product card has an Amazon link.');
} else {
  console.log(
    `${totalCards} product cards: ${totalAsin} with an exact Amazon listing and photo, ` +
      `${totalCards - totalAsin} linked to a tagged search. ${changedFiles} file(s) updated.`,
  );
}
