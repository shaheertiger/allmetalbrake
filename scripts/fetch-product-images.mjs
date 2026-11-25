// Finds the Amazon listing (ASIN + official product photo) for every product in
// src/data/products/*.json through the Amazon Creators API, using Amazon's OFFICIAL Node.js
// SDK (@amzn/creatorsapi-nodejs-sdk, vendored in vendor/creatorsapi-nodejs-sdk), and writes
// the results to src/data/catalog.json. A product with a catalog entry gets a direct
// /dp/ASIN affiliate link and a real photo; one without keeps a tagged Amazon search link
// and the category icon.
//
//   npm run images:fetch                 # look up every product without an entry
//   npm run images:fetch -- --refresh    # look up every product again
//   npm run images:fetch -- --verify     # re-check every stored ASIN still passes its rule
//   npm run images:fetch -- --dry-run    # report only, write nothing
//   npm run images:fetch -- --only rtx-5070
//
// Credentials come from the environment (or .env): AMAZON_CREATORS_CREDENTIAL_ID / _SECRET
// (or _CLIENT_ID / _SECRET), AMAZON_CREATORS_PARTNER_TAG, optional AMAZON_CREATORS_VERSION.
//
// Matching is strict, per product (scripts/lib/match.mjs): a wrong match sends readers to
// the wrong part. Unmatched products are listed in scripts/image-match-report.json with
// Amazon's top titles, so a rule can be fixed or an "asin" set on the product by hand.
//
// Docs: https://affiliate-program.amazon.com/creatorsapi/docs/en-us/introduction
// Limits: new credentials get 1 request/second and 8,640 requests/day.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { RULES, passes, pick, searchWords } from './lib/match.mjs';

const require = createRequire(import.meta.url);
const { ApiClient, DefaultApi, SearchItemsRequestContent, GetItemsRequestContent } = require('@amzn/creatorsapi-nodejs-sdk');

const ROOT = path.resolve(import.meta.dirname, '..');
const PRODUCTS_DIR = path.join(ROOT, 'src/data/products');
const CATALOG_PATH = path.join(ROOT, 'src/data/catalog.json');
const REPORT_PATH = path.join(ROOT, 'scripts/image-match-report.json');
const args = process.argv.slice(2);
const DRY = args.includes('--dry-run');
const VERIFY = args.includes('--verify');
const REFRESH = args.includes('--refresh');
const ONLY = args.includes('--only') ? args[args.indexOf('--only') + 1] : undefined;

for (const k of Object.keys(process.env).filter((k) => k.startsWith('AMAZON_CREATORS_')))
  process.env[k] = process.env[k].trim().replace(/^<(.*)>$/, '$1').trim();
process.env.AMAZON_CREATORS_CREDENTIAL_ID ||= process.env.AMAZON_CREATORS_CLIENT_ID;
process.env.AMAZON_CREATORS_CREDENTIAL_SECRET ||= process.env.AMAZON_CREATORS_CLIENT_SECRET;
for (const k of ['AMAZON_CREATORS_CREDENTIAL_ID', 'AMAZON_CREATORS_CREDENTIAL_SECRET', 'AMAZON_CREATORS_PARTNER_TAG'])
  if (!process.env[k]) {
    console.error(`Missing ${k}. Copy .env.example to .env and fill it in.`);
    process.exit(1);
  }

// Credential version: 2.1 / 2.2 / 2.3 = NA / EU / FE (Cognito); 3.1 / 3.2 / 3.3 = NA / EU / FE (LWA).
const apiClient = new ApiClient();
apiClient.credentialId = process.env.AMAZON_CREATORS_CREDENTIAL_ID;
apiClient.credentialSecret = process.env.AMAZON_CREATORS_CREDENTIAL_SECRET;
apiClient.version = process.env.AMAZON_CREATORS_VERSION || '3.1';
const api = new DefaultApi(apiClient);
const MARKETPLACE = process.env.AMAZON_CREATORS_MARKETPLACE || 'www.amazon.com';
const TAG = process.env.AMAZON_CREATORS_PARTNER_TAG;
const RESOURCES = ['itemInfo.title', 'images.primary.large', 'images.primary.medium'];

const DELAY = 1100;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const status = (e) => e?.status ?? e?.response?.status;
async function retry(fn, n = 5) {
  for (let i = 1; ; i++) {
    try {
      return await fn();
    } catch (e) {
      const throttled = status(e) === 429 || /throttl|toomanyrequests/i.test(JSON.stringify(e?.response?.body ?? e?.body ?? ''));
      if (!throttled || i >= n) throw e;
      await sleep(DELAY * 2 ** i);
    }
  }
}
const detail = (e) => {
  const body = e?.response?.body ?? e?.body;
  return `${status(e) ?? ''} ${body ? JSON.stringify(body) : e?.message ?? String(e)}`.trim();
};
const item = (it) => ({ asin: it.asin, title: it?.itemInfo?.title?.displayValue ?? '', image: it?.images?.primary?.large?.url ?? it?.images?.primary?.medium?.url ?? '' });
const today = new Date().toISOString().slice(0, 10);

const products = fs
  .readdirSync(PRODUCTS_DIR)
  .filter((f) => f.endsWith('.json'))
  .flatMap((f) => JSON.parse(fs.readFileSync(path.join(PRODUCTS_DIR, f), 'utf8')));
const catalog = fs.existsSync(CATALOG_PATH) ? JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8')) : {};
const save = () => {
  if (DRY) return;
  const sorted = Object.fromEntries(Object.entries(catalog).sort(([a], [b]) => a.localeCompare(b)));
  fs.writeFileSync(CATALOG_PATH, JSON.stringify(sorted, null, 2) + '\n');
};
const report = [];

/* ---------- 1. verify stored ASINs (optional) ---------- */
if (VERIFY) {
  const ids = Object.keys(catalog).filter((id) => catalog[id].asin && (!ONLY || id === ONLY));
  for (let i = 0; i < ids.length; i += 10) {
    const batch = ids.slice(i, i + 10);
    try {
      const req = new GetItemsRequestContent();
      req.partnerTag = TAG;
      req.itemIds = [...new Set(batch.map((id) => catalog[id].asin))];
      req.resources = RESOURCES;
      const res = await retry(() => api.getItems(MARKETPLACE, req));
      const items = new Map((res?.itemsResult?.items ?? []).map((it) => [it.asin, item(it)]));
      for (const id of batch) {
        const it = items.get(catalog[id].asin);
        if (it && passes(id, it.title)) {
          catalog[id] = { ...catalog[id], title: it.title, image: it.image || catalog[id].image, checked: today };
          report.push({ id, status: 'verified', asin: it.asin });
        } else {
          report.push({ id, status: it ? 'title-mismatch' : 'asin-dead', asin: catalog[id].asin, title: it?.title });
          delete catalog[id]; // looked up again below
        }
      }
    } catch (e) {
      batch.forEach((id) => report.push({ id, status: 'error', error: detail(e) }));
    }
    await sleep(DELAY);
  }
}

/* ---------- 2. search ---------- */
const todo = products.filter((p) => (!ONLY || p.id === ONLY) && !p.asin && !p.url && (REFRESH || ONLY || !catalog[p.id]));
console.log(`${products.length} products; looking up ${todo.length}.`);
let n = 0;
for (const p of todo) {
  n++;
  if (!RULES[p.id]) {
    report.push({ id: p.id, status: 'no-rule' });
    continue;
  }
  const keywords = searchWords(p);
  try {
    const req = new SearchItemsRequestContent();
    req.partnerTag = TAG;
    req.keywords = keywords;
    req.itemCount = 10;
    req.searchIndex = 'All';
    req.resources = RESOURCES;
    const res = await retry(() => api.searchItems(MARKETPLACE, req));
    const items = (res?.searchResult?.items ?? []).map(item);
    const hit = pick(p.id, items);
    if (hit) {
      catalog[p.id] = { asin: hit.asin, image: hit.image, title: hit.title, checked: today };
      report.push({ id: p.id, status: 'matched', asin: hit.asin, title: hit.title });
    } else {
      report.push({ id: p.id, status: 'no-confident-match', keywords, topTitles: items.slice(0, 5).map((it) => it.title) });
    }
  } catch (e) {
    report.push({ id: p.id, status: 'error', error: detail(e) });
    if ([401, 403].includes(status(e))) {
      console.error(`Authentication failed: ${detail(e)}\nCheck the AMAZON_CREATORS_* credentials.`);
      break;
    }
  }
  if (n % 10 === 0) {
    console.log(`${n}/${todo.length}…`);
    save(); // checkpoint
  }
  await sleep(DELAY);
}

save();
fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + '\n');
const count = (s) => report.filter((r) => r.status === s).length;
console.log(
  `Done${DRY ? ' (dry run, catalog not written)' : ''}. matched=${count('matched')} unmatched=${count('no-confident-match')} no-rule=${count('no-rule')} errors=${count('error')}` +
    (VERIFY ? ` verified=${count('verified')} mismatched=${count('title-mismatch')} dead=${count('asin-dead')}` : '') +
    `\nCatalog: ${Object.keys(catalog).length} of ${products.length} products. Unmatched: ${path.relative(ROOT, REPORT_PATH)}`,
);
