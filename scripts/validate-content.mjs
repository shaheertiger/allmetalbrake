// Pre-build content checks (runs in `npm run build` before astro build; also `npm run validate`).
// Errors fail the build; warnings are printed. Schema: docs/content-schema.md.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const exists = (p) => fs.existsSync(path.join(ROOT, p));
const errors = [];
const warnings = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

const CONFIG = read('site.config.json');
// Category keys, read from src/data/categories.ts so the two lists can never disagree.
const CATS = [...fs.readFileSync(path.join(ROOT, 'src/data/categories.ts'), 'utf8').matchAll(/\{ key: '([a-z0-9-]+)'/g)].map((m) => m[1]);

// ---- load ---------------------------------------------------------------------------------
const products = [];
for (const f of fs.readdirSync(path.join(ROOT, 'src/data/products')).filter((f) => f.endsWith('.json'))) {
  try {
    for (const p of read(`src/data/products/${f}`)) products.push({ ...p, _file: f });
  } catch (e) {
    err(`products/${f}`, `invalid JSON (${e.message})`);
  }
}
const guides = [];
for (const f of fs.readdirSync(path.join(ROOT, 'src/data/guides')).filter((f) => f.endsWith('.json'))) {
  try {
    guides.push({ ...read(`src/data/guides/${f}`), _file: f });
  } catch (e) {
    err(`guides/${f}`, `invalid JSON (${e.message})`);
  }
}
const load = (p, fallback) => {
  if (!exists(p)) return fallback;
  try {
    return read(p);
  } catch (e) {
    err(p, `invalid JSON (${e.message})`);
    return fallback;
  }
};
const compares = load('src/data/compares.json', []);
const terms = load('src/data/glossary.json', []);
const brands = load('src/data/brands.json', {});

const byId = new Map();
for (const p of products) {
  if (byId.has(p.id)) err(`product ${p.id}`, 'duplicate id');
  byId.set(p.id, p);
}
const guideSlugs = new Set(guides.map((g) => g.slug));
const termIds = new Set(terms.map((t) => t.id));

// Every internal path the site will build.
const ROUTES = new Set([
  '/', '/best-of/', '/gear/', '/compare/', '/glossary/', '/brands/', '/tools/', ...fs.readdirSync(path.join(ROOT, 'src/pages/tools')).filter((f) => f.endsWith('.astro') && f !== 'index.astro').map((f) => `/tools/${f.replace(/\.astro$/, '')}/`),
  '/about/', '/how-we-review/', '/disclosure/', '/privacy/', '/contact/',
  ...products.map((p) => `/gear/${p.id}/`),
  ...guides.map((g) => `/${g.slug}/`),
  ...compares.map((c) => `/compare/${c.a}-vs-${c.b}/`),
  ...terms.map((t) => `/glossary/${t.id}/`),
  ...Object.keys(brands).map((b) => `/brands/${b}/`),
]);

// ---- text checks --------------------------------------------------------------------------
const TESTING = /\b(we tested|we've tested|we have tested|in our tests?|in our testing|our testing|our benchmarks?|we benchmarked|we measured|our measurements|hands-on testing|tested in our lab|our lab|lab-tested|after testing (them|each|all|every|these|both))\b/i;
function checkText(where, value) {
  if (typeof value === 'string') {
    // "not from hands-on testing" is the disclaimer, not the claim.
    if (TESTING.test(value.replace(/\b(not|rather than|never|no)\s+([a-z]+\s+){0,4}?(hands-on testing|lab-tested|our lab)\b/gi, ''))) err(where, `testing claim: "${value.match(TESTING)[0]}" (we have not bench-tested these parts)`);
    for (const m of value.matchAll(/\[[^\]]+\]\(([^)\s]+)\)/g)) {
      const href = m[1];
      if (/^https?:/.test(href)) continue;
      const clean = href.split('#')[0];
      if (!ROUTES.has(clean)) err(where, `link to missing page ${href}`);
    }
    if (/<[a-z][^>]*>/i.test(value)) warn(where, 'contains HTML; use plain text');
  } else if (Array.isArray(value)) value.forEach((v, i) => checkText(`${where}[${i}]`, v));
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) if (!k.startsWith('_')) checkText(`${where}.${k}`, v);
}
const len = (where, field, s, lo, hi) => {
  if (typeof s !== 'string' || !s) return err(where, `missing ${field}`);
  if (s.length < lo || s.length > hi) warn(where, `${field} is ${s.length} chars (target ${lo}-${hi})`);
};
const need = (where, obj, fields) => fields.forEach((f) => (obj[f] === undefined || obj[f] === '' || (Array.isArray(obj[f]) && !obj[f].length)) && err(where, `missing ${f}`));

// ---- products -----------------------------------------------------------------------------
for (const p of products) {
  const w = `product ${p.id}`;
  need(w, p, ['id', 'name', 'short', 'brand', 'category', p.tier ? 'tier' : 'price', 'description', 'quick', 'bestFor', 'skipIf', 'specs', 'score', 'verdict', 'pros', 'cons', 'faqs']);
  if (!CATS.includes(p.category)) err(w, `unknown category ${p.category}`);
  if (`${p.category}.json` !== p._file) err(w, `category ${p.category} but lives in ${p._file}`);
  if (!/^[a-z0-9-]+$/.test(p.id ?? '')) err(w, 'id must be kebab-case');
  if (!p.tier && (!Array.isArray(p.price) || p.price.length !== 2 || p.price[0] > p.price[1])) err(w, 'price must be [low, high]');
  if (!(p.score?.overall >= 0 && p.score?.overall <= 100)) err(w, 'score.overall must be 0-100');
  if ((p.score?.parts ?? []).length !== 4) warn(w, 'score should have 4 parts');
  if ((p.specs ?? []).some((s) => !Array.isArray(s) || s.length !== 2)) err(w, 'specs must be [label, value] pairs');
  if (Object.keys(brands).length && !brands[p.brand]) err(w, `brand "${p.brand}" missing from src/data/brands.json`);
  len(w, 'description', p.description, 140, 158);
  if ((p.short ?? '').length > 26) warn(w, `short name "${p.short}" is long`);
  checkText(w, p);
}

// ---- guides -------------------------------------------------------------------------------
const targets = new Map();
for (const g of guides) {
  const w = `guide ${g.slug ?? g._file}`;
  const isArticle = g.type === 'article';
  need(w, g, ['slug', 'type', 'category', 'title', 'h1', 'description', 'dek', 'intro', 'quickAnswer', 'sections', 'bottomLine', 'faqs', ...(isArticle ? ['kind'] : ['picks', 'tableSpecs', 'ranking', 'mistakes'])]);
  if (`${g.slug}.json` !== g._file) err(w, `slug must match file name ${g._file}`);
  if (!['roundup', 'brand', 'article'].includes(g.type)) err(w, `type must be roundup, brand or article`);
  if (isArticle && !['howto', 'fix', 'explainer', 'versus'].includes(g.kind)) err(w, 'kind must be howto, fix, explainer or versus');
  for (const id of g.products ?? []) if (!byId.has(id)) err(w, `products: "${id}" is not a product`);
  if (!CATS.includes(g.category)) err(w, `unknown category ${g.category}`);
  if (g.type === 'brand' && !brands[g.brand]) err(w, `brand page needs a known "brand"`);
  if (ROUTES.has(`/${g.slug}/`) && ['best-of', 'gear', 'compare', 'glossary', 'brands', 'tools', 'about', 'contact', 'privacy', 'disclosure', 'how-we-review'].includes(g.slug)) err(w, 'slug collides with a site route');
  len(w, 'title', g.title, 45, 62);
  len(w, 'description', g.description, 140, 158);
  const labels = new Set();
  for (const pk of g.picks ?? []) {
    if (!byId.has(pk.id)) err(w, `pick "${pk.id}" is not a product`);
    if (labels.has(pk.label)) err(w, `duplicate pick label "${pk.label}"`);
    labels.add(pk.label);
    if (!pk.writeup?.length) err(w, `pick ${pk.id} has no writeup`);
  }
  if (!g.sources?.length) warn(w, 'no sources listed');
  const ids = (g.picks ?? []).map((p) => p.id);
  if (new Set(ids).size !== ids.length) err(w, 'the same product is picked twice');
  const nums = [...(g.title ?? '').matchAll(new RegExp(String.raw`\b(\d+)\s+(?:[A-Z][\w-]*\s+){0,3}?(?:${CONFIG.pickNouns})\b`, 'g'))].map((m) => +m[1]).filter((x) => x < 30);
  const n = nums.length ? nums.reduce((a, b) => a + b, 0) : 0;
  if (n && n !== ids.length) warn(w, `title says ${n} but the page has ${ids.length} picks`);
  for (const s of g.tableSpecs ?? []) if (!ids.some((id) => byId.get(id)?.specs?.some(([k]) => k.toLowerCase() === s.toLowerCase()))) warn(w, `tableSpecs "${s}" matches no pick's spec label`);
  for (const r of g.related ?? []) if (!guideSlugs.has(r)) err(w, `related "${r}" is not a guide`);
  for (const m of g.mentions ?? []) if (m.id && !byId.has(m.id)) err(w, `mention "${m.id}" is not a product`);
  if ((g.faqs ?? []).length < 6) warn(w, `${(g.faqs ?? []).length} FAQs (target 6-8)`);
  const words = JSON.stringify(g).split(/\s+/).length;
  if (words < (isArticle ? 1500 : 2200)) warn(w, `about ${words} words (target ${isArticle ? '1,800' : '2,800'}+)`);
  if (!g.noindex) {
    const t = (g.query ?? g.title.split(/\s*[(:?]/)[0]).toLowerCase().trim();
    if (targets.has(t)) err(w, `targets the same search as ${targets.get(t)} ("${t}"): merge one into the other`);
    targets.set(t, g.slug);
  }
  checkText(w, g);
}

// ---- compares, glossary, brands -----------------------------------------------------------
const pairs = new Set();
for (const c of compares) {
  const w = `compare ${c.a}-vs-${c.b}`;
  need(w, c, ['a', 'b', 'title', 'description', 'quick', 'differ', 'buyA', 'buyB']);
  for (const id of [c.a, c.b]) if (!byId.has(id)) err(w, `"${id}" is not a product`);
  const key = [c.a, c.b].sort().join('|');
  if (pairs.has(key)) err(w, 'duplicate pair');
  pairs.add(key);
  if (byId.get(c.a) && byId.get(c.b) && byId.get(c.a).category !== byId.get(c.b).category) warn(w, 'compares two categories');
  len(w, 'title', c.title, 40, 62);
  len(w, 'description', c.description, 140, 158);
  checkText(w, c);
}
for (const t of terms) {
  const w = `glossary ${t.id}`;
  need(w, t, ['id', 'term', 'title', 'short', 'body']);
  len(w, 'short', t.short, 140, 158);
  len(w, 'title', t.title, 30, 62);
  for (const r of t.related ?? []) if (!termIds.has(r)) err(w, `related "${r}" is not a term`);
  for (const r of t.guides ?? []) if (!guideSlugs.has(r)) err(w, `guide "${r}" does not exist`);
  checkText(w, t);
}
for (const [k, b] of Object.entries(brands)) {
  if (!b.name) err(`brand ${k}`, 'missing name');
  if (b.review && !guideSlugs.has(b.review)) err(`brand ${k}`, `review "${b.review}" is not a guide`);
}

// ---- Amazon catalog (scripts/fetch-product-images.mjs) --------------------------------------
const catalog = load('src/data/catalog.json', {});
for (const [id, e] of Object.entries(catalog)) {
  if (!byId.has(id)) warn(`catalog ${id}`, 'not a product id (stale entry)');
  if (!/^[A-Z0-9]{10}$/.test(e.asin ?? '')) err(`catalog ${id}`, 'bad asin');
  if (!/^https:\/\/m\.media-amazon\.com\//.test(e.image ?? '')) err(`catalog ${id}`, 'image must be an official m.media-amazon.com URL');
}
console.log(`validate: ${Object.keys(catalog).filter((id) => byId.has(id)).length} of ${products.length} products have a verified Amazon listing and photo`);

// ---- report -------------------------------------------------------------------------------
// A product counts as featured when a guide picks it or links it as a notable mention.
const featured = new Set(guides.flatMap((g) => [...(g.picks ?? []).map((p) => p.id), ...(g.mentions ?? []).map((m) => m.id).filter(Boolean)]));
const orphans = products.filter((p) => !featured.has(p.id));
console.log(`validate: ${products.length} products, ${guides.length} guides, ${compares.length} comparisons, ${terms.length} glossary terms, ${Object.keys(brands).length} brands`);
if (orphans.length) console.log(`validate: ${orphans.length} products are not picked or mentioned by any guide: ${orphans.map((p) => p.id).join(', ')}`);
if (warnings.length) console.log(`\n${warnings.length} warning(s):\n  ${warnings.join('\n  ')}`);
if (errors.length) {
  console.error(`\n${errors.length} error(s):\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
console.log('validate: OK');
