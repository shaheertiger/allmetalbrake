#!/usr/bin/env node
/**
 * Product blocks for review pages, driven by data/products.json.
 *
 * For every <div class="product-card"> this fills two generated regions:
 *   product-media — the product photo (only when an image URL is set)
 *   product-cta   — the "See It" button to the retailer
 * and on each roundup it rebuilds:
 *   top-picks     — the numbered "Our Top Picks" list inside the article
 *   picks-band    — the row of pick cards under the headline
 *
 * data/products.json is keyed by "page.html#card-id". Running this script
 * adds an entry for any new card, so after adding a review just fill in:
 *   asin   Amazon product ID (builds an amazon.com/dp/ link)
 *   url    any retailer link (overrides asin)
 *   image  product photo URL (https). For Amazon products this must be the
 *          image URL Amazon gives you (Product Advertising API or SiteStripe);
 *          Associates rules do not allow downloading and re-hosting it.
 * With neither asin nor url the button links to an Amazon search for the
 * product name. build.config.json -> affiliate.amazonTag is appended to every
 * Amazon link once it is set.
 *
 * Usage: node tools/products.js   (idempotent)
 */

const fs = require('fs');
const path = require('path');
const { textOf, divsByClass } = require('./html-utils');

const ROOT = path.resolve(__dirname, '..');
const CONFIG = JSON.parse(fs.readFileSync(path.join(ROOT, 'build.config.json'), 'utf8'));
const TAG = ((CONFIG.affiliate || {}).amazonTag || '').trim();
const DATA_PATH = path.join(ROOT, 'data', 'products.json');
const data = fs.existsSync(DATA_PATH) ? JSON.parse(fs.readFileSync(DATA_PATH, 'utf8')) : {};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function withTag(url) {
  if (!TAG || !/^https:\/\/(www\.)?amazon\.com\//.test(url)) return url;
  const u = new URL(url);
  u.searchParams.set('tag', TAG);
  return u.toString();
}

function linkFor(entry, name) {
  if (entry.url) return withTag(entry.url);
  if (entry.asin) return withTag(`https://www.amazon.com/dp/${encodeURIComponent(entry.asin)}`);
  return withTag(`https://www.amazon.com/s?k=${encodeURIComponent(name)}`);
}

const retailer = (url) => (/amazon\.com/.test(url) ? 'Amazon' : new URL(url).hostname.replace(/^www\./, ''));
const photoCredit = (img) => (/amazon\.com/.test(new URL(img).hostname) ? 'amazon.com' : new URL(img).hostname.replace(/^www\./, ''));

function region(html, name, content) {
  const start = `<!-- ${name}:start -->`;
  const end = `<!-- ${name}:end -->`;
  const a = html.indexOf(start);
  const b = html.indexOf(end, a);
  if (a < 0 || b < 0) return html;
  return html.slice(0, a + start.length) + content + html.slice(b);
}

function cards(html) {
  const out = [];
  const re = /<div class="product-card" id="([^"]+)">/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const chunk = html.slice(m.index, m.index + 4000);
    const label = (/class="product-label">([\s\S]*?)<\/div>/.exec(chunk) || [])[1];
    const name = (/class="product-name">([\s\S]*?)<\/h3>/.exec(chunk) || [])[1];
    out.push({ id: m[1], label: label ? textOf(label) : '', name: textOf(name || '') });
  }
  return out;
}

const pages = fs.readdirSync(ROOT).filter((n) => n.endsWith('.html'))
  .concat(fs.readdirSync(path.join(ROOT, 'reviews')).filter((n) => n.endsWith('.html')).map((n) => `reviews/${n}`))
  .sort();

let changed = 0;
const seen = new Set();

for (const rel of pages) {
  const file = path.join(ROOT, rel);
  let html = fs.readFileSync(file, 'utf8');
  const list = cards(html);
  if (!list.length) continue;
  const before = html;

  for (const c of list) {
    const key = `${rel}#${c.id}`;
    seen.add(key);
    const entry = (data[key] = Object.assign({ name: c.name, asin: '', url: '', image: '' }, data[key] || {}));
    entry.name = c.name;
    const href = linkFor(entry, c.name);
    const cardStart = html.indexOf(`<div class="product-card" id="${c.id}">`);
    const cardHtml = html.slice(cardStart);
    let local = cardHtml;

    const media = entry.image
      ? `\n          <figure class="product-media"><img src="${esc(entry.image)}" alt="${esc(c.name)}" loading="lazy" decoding="async" />` +
        `<figcaption>Photo: ${esc(photoCredit(entry.image))}</figcaption></figure>\n          `
      : '';
    local = region(local, 'product-media', media);
    local = region(local, 'product-cta',
      `\n          <a class="see-it" href="${esc(href)}" target="_blank" rel="sponsored nofollow noopener">See It at ${retailer(href)}</a>\n          `);
    html = html.slice(0, cardStart) + local;
  }

  const picks = list.filter((c) => c.label);
  const linkOf = (c) => esc(linkFor(data[`${rel}#${c.id}`], c.name));

  html = region(html, 'top-picks', picks.length < 2 ? '' : `
      <div class="top-picks">
        <h2 class="top-picks-title" id="top-picks">Our Top Picks</h2>
        <ol>
${picks.map((c) => `          <li><strong>${esc(c.label.toUpperCase())}:</strong> <a href="${linkOf(c)}" target="_blank" rel="sponsored nofollow noopener">${esc(c.name)}</a><br /><a class="jump" href="#${c.id}">&darr; Jump to Review</a></li>`).join('\n')}
        </ol>
      </div>
      `);

  html = region(html, 'picks-band', picks.length < 2 ? '' : `
<section class="picks-band" aria-label="Our top picks">
  <div class="picks-band-inner">
${picks.map((c) => {
    const e = data[`${rel}#${c.id}`];
    const img = e.image ? `<img src="${esc(e.image)}" alt="${esc(c.name)}" loading="lazy" decoding="async" />` : '';
    return `    <div class="pick-card">
      <div class="product-label">${esc(c.label)}</div>
      <a class="pick-card-body" href="#${c.id}">${img}<span class="pick-card-name">${esc(c.name)}</span></a>
      <a class="see-it" href="${linkOf(c)}" target="_blank" rel="sponsored nofollow noopener">See It</a>
    </div>`;
  }).join('\n')}
  </div>
</section>
`);

  if (html !== before) {
    fs.writeFileSync(file, html);
    changed++;
  }
}

for (const key of Object.keys(data)) if (!seen.has(key)) delete data[key];
const sorted = Object.fromEntries(Object.keys(data).sort().map((k) => [k, data[k]]));
fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
fs.writeFileSync(DATA_PATH, JSON.stringify(sorted, null, 2) + '\n');

const withImages = Object.values(sorted).filter((e) => e.image).length;
console.log(`products: ${Object.keys(sorted).length} products, ${withImages} with images, ${changed} page(s) updated` +
  (TAG ? '' : ' (no affiliate.amazonTag set yet)'));
