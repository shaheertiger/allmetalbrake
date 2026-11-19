/**
 * Match every product to its Amazon listing through the Amazon Creators API (same setup
 * as best-proteinpowder.com) and write:
 *   src/data/product-images.json  slug → Amazon image URL (m.media-amazon.com)
 *   src/data/product-asins.json   slug → ASIN (turns tagged search links into /dp/ links)
 *   scripts/product-match-report.json  what matched, what was rejected and why
 *
 * Usage:  cp .env.example .env   (or copy the protein site's .env; same credentials)
 *         npm run images:fetch          # only products missing an image or ASIN
 *         npm run images:fetch -- --all # re-match everything
 *         npm run images:review         # list matches to eyeball before publishing
 *
 * A match is accepted only when Amazon's title contains the brand AND every model token
 * from docs/product-catalog.txt (e.g. "120sw"), so a Klipsch R-121SW can't stand in for
 * an R-120SW. Wrong matches go in src/data/asin-quarantine.json and are never re-matched.
 */
import { ApiClient, TypedDefaultApi, SearchItemsRequestContent } from 'amazon-creators-api';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

for (const name of ['AMAZON_CREATORS_CLIENT_ID', 'AMAZON_CREATORS_CLIENT_SECRET', 'AMAZON_CREATORS_PARTNER_TAG']) {
  if (!process.env[name]) { console.error(`Missing required environment variable: ${name} (see .env.example)`); process.exit(1); }
  if (/^<.*>$/s.test(process.env[name].trim())) { console.error(`${name} is wrapped in <angle brackets>. Remove them and run again.`); process.exit(1); }
}

const client = new ApiClient();
client.credentialId = process.env.AMAZON_CREATORS_CLIENT_ID;
client.credentialSecret = process.env.AMAZON_CREATORS_CLIENT_SECRET;
client.version = process.env.AMAZON_CREATORS_VERSION || '3.1';
client.marketplace = process.env.AMAZON_CREATORS_MARKETPLACE || 'www.amazon.com';
const api = new TypedDefaultApi(client);

const ROOT = join(import.meta.dirname, '..');
const IMAGES_PATH = join(ROOT, 'src/data/product-images.json');
const ASIN_PATH = join(ROOT, 'src/data/product-asins.json');
const QUARANTINE_PATH = join(ROOT, 'src/data/asin-quarantine.json');
const REPORT_PATH = join(ROOT, 'scripts/product-match-report.json');
const readJson = (p, d) => (existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : d);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const all = process.argv.includes('--all');

const products = readdirSync(join(ROOT, 'src/content/products')).flatMap((f) => readJson(join(ROOT, 'src/content/products', f), []));
// Model tokens per slug from the catalog: slug|name|brand|category|must tokens|query
const mustTokens = new Map(
  readFileSync(join(ROOT, 'docs/product-catalog.txt'), 'utf8').split('\n').filter((l) => l.trim() && !l.startsWith('#'))
    .map((l) => l.split('|')).map((c) => [c[0].trim(), (c[4] || '').split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)]),
);
const overrides = readJson(join(ROOT, 'src/data/amazon-search-overrides.json'), {});
const images = readJson(IMAGES_PATH, {});
const asins = readJson(ASIN_PATH, {});
const quarantined = new Set(Object.keys(readJson(QUARANTINE_PATH, {})));
const previous = new Map(readJson(REPORT_PATH, []).filter((r) => r.status === 'accepted').map((r) => [r.slug, r]));

const squash = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
function isConfidentMatch(p, title) {
  if (!title) return false;
  const t = squash(title);
  const o = overrides[p.slug] ?? {};
  const brand = squash(o.brand ?? p.brand.split(' ')[0]);
  if (brand.length >= 2 && !t.includes(brand)) return false;
  // Accessories sold "for" a product carry its name in the title: never accept them.
  const accessory = /\b(replacement|adapter|compatible (?:with|for)|charger|remote control|power cord|wall mount for|cover for)\b/i;
  if (accessory.test(title) && p.category !== 'remote') return false;
  if ((o.exclude ?? []).some((x) => ` ${title.toLowerCase()} `.includes(x.toLowerCase()) || (x.trim().length > 4 && t.includes(squash(x))))) return false;
  const must = o.must ?? mustTokens.get(p.slug) ?? [];
  // Single-word model tokens must sit inside one word of the title ("120sw" in "R-120SW"),
  // so "g5" can't match across "LG 55". Multi-word tokens match the squashed phrase.
  const words = title.toLowerCase().split(/[^a-z0-9+\-/.]+/).map(squash).filter(Boolean);
  return must.every((tok) => (tok.includes(' ') ? t.includes(squash(tok)) : words.some((w) => w.includes(squash(tok)))));
}

function describeError(err) {
  if (err instanceof Error) return err.message;
  const detail = err?.body?.message || err?.body?.errors?.[0]?.message || err?.statusText || '';
  return err?.status ? `HTTP ${err.status}${detail ? ` ${detail}` : ''}` : JSON.stringify(err);
}
async function searchWithRetry(req, attempts = 4) {
  for (let n = 1; ; n++) {
    try { return await api.searchItems(client.marketplace, req); }
    catch (err) { if (err?.status !== 429 || n >= attempts) throw err; await sleep(2000 * 2 ** (n - 1)); }
  }
}

const report = [];
for (let i = 0; i < products.length; i++) {
  const p = products[i];
  if (quarantined.has(p.slug) && !overrides[p.slug]) { report.push({ slug: p.slug, name: p.name, status: 'quarantined' }); continue; }
  if (!all && images[p.slug] && asins[p.slug]) {
    report.push(previous.get(p.slug) ? { ...previous.get(p.slug), cached: true } : { slug: p.slug, name: p.name, status: 'already-cached' });
    continue;
  }
  try {
    const req = new SearchItemsRequestContent();
    req.partnerTag = process.env.AMAZON_CREATORS_PARTNER_TAG;
    req.keywords = overrides[p.slug]?.query || p.amazonQuery || p.name;
    req.itemCount = 5;
    req.searchIndex = 'All';
    req.resources = ['itemInfo.title', 'images.primary.large'];
    const result = await searchWithRetry(req);
    const items = result?.searchResult?.items || [];
    const match = items.find((it) => isConfidentMatch(p, it?.itemInfo?.title?.displayValue));
    if (match && match.images?.primary?.large?.url) {
      images[p.slug] = match.images.primary.large.url;
      if (match.asin) asins[p.slug] = match.asin;
      report.push({ slug: p.slug, name: p.name, status: 'accepted', asin: match.asin, matchedTitle: match.itemInfo.title.displayValue });
    } else {
      report.push({ slug: p.slug, name: p.name, status: 'rejected', topResultTitle: items[0]?.itemInfo?.title?.displayValue || null });
    }
  } catch (err) {
    report.push({ slug: p.slug, name: p.name, status: 'error', error: describeError(err) });
  }
  if (i % 10 === 0) console.log(`${i + 1}/${products.length}...`);
  await sleep(300);
}

writeFileSync(IMAGES_PATH, JSON.stringify(images, null, 2) + '\n');
writeFileSync(ASIN_PATH, JSON.stringify(asins, null, 2) + '\n');
writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + '\n');
const count = (s) => report.filter((r) => r.status === s && !r.cached).length;
console.log(`Done. accepted=${count('accepted')} rejected=${count('rejected')} errors=${count('error')} images=${Object.keys(images).length}/${products.length} asins=${Object.keys(asins).length}`);
if (count('rejected')) console.log('Rejected products keep their tagged search link. Add them by hand in src/data/amazon-links.json.');
