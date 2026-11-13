#!/usr/bin/env node
// Proposes Amazon listings for products with no usable direct link (no ASIN, or a
// quarantined one), under an exact-model rule. Read-only: writes a review file,
// never product-asins.json. Apply accepted rows with scripts/apply-exact-asins.mjs.
//
//   node --env-file-if-exists=.env scripts/find-exact-asins.mjs
//
// Why it exists: the old fetcher accepted any result whose title contained the
// brand, and on Nov 13, 2026 all 228 of its new matches were the wrong product or
// an accessory. A candidate is proposed here only when:
//   - the brand (first word of our name) is in the Amazon title,
//   - every model-like token in our name (letters+digits, e.g. "XDT16", "25322")
//     is in the title, and at least one such token exists unless the name is a
//     distinctive named product (then every name word must match),
//   - the title is not an accessory (blade, replacement, cartridge, "fit for",
//     add-on, cookbook, ...) unless our name says it is one.
// Every proposal is still read by a person before scripts/apply-exact-asins.mjs
// writes it: on the first run 21 of 29 proposals were accessories or variants.
import { ApiClient, TypedDefaultApi, SearchItemsRequestContent } from 'amazon-creators-api';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

for (const name of Object.keys(process.env).filter((k) => k.startsWith('AMAZON_CREATORS_'))) {
  process.env[name] = process.env[name].trim().replace(/^<(.*)>$/, '$1').trim();
}
const client = new ApiClient();
client.credentialId = process.env.AMAZON_CREATORS_CLIENT_ID;
client.credentialSecret = process.env.AMAZON_CREATORS_CLIENT_SECRET;
client.version = process.env.AMAZON_CREATORS_VERSION || '3.1';
client.marketplace = process.env.AMAZON_CREATORS_MARKETPLACE || 'www.amazon.com';
const api = new TypedDefaultApi(client);

const root = join(import.meta.dirname, '..');
const read = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));
const products = read('scripts/all-products.json');
const asins = read('src/data/product-asins.json');
const quarantine = read('src/data/asin-quarantine.json');
const similar = read('src/data/product-similar-asins.json');
const OUT = join(root, 'scripts', 'exact-asin-candidates.json');

const flat = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const UNIT = /^\d+(\.\d+)?-?(v|w|wh|ah|in|inch|ft|gal|gallon|pint|pt|oz|lb|lbs|mah|psi|gpm|cc|mm|cu|amp|a|btu|qt|l|x|k|kw|hp|sq|pc|pack|piece|cfm|db|mph|gpd|pk|ct|ml|g|wire|prong|stage|speed|mode|ton|car|layer)s?$/;
export function modelTokens(name) {
  return (String(name).toLowerCase().match(/[a-z0-9][a-z0-9.\-\/]*[a-z0-9]/g) || [])
    .filter((t) => (/\d/.test(t) && /[a-z]/.test(t)) || /^\d{4,}$/.test(t))
    .filter((t) => !UNIT.test(t) && !/^\d+(-|x)\d+/.test(t) && !/^(v2|v3|gen\d|2nd|3rd|4th|\d+th)$/.test(t));
}
const ACCESSORY = /\b(replacement|replaces?|blade|blades|cartridges?|covers?|case|bags?|kit for|compatible with|adapter for|parts?|filter for|filter fit|element|cable for|charger for|mount for|stand for|fits?|fit for|replace for|attachment|spindle|carburetor|chains?|foot pad|insert|wheels?|add-on|cookbook|recipes|valve kit|starter assembly|tools?\b.*\binstallation)\b/i;

export function judge(name, title) {
  if (!title) return { ok: false, why: 'no title' };
  const t = flat(title);
  const brand = flat(String(name).split(/\s+/)[0]);
  if (brand.length >= 2 && !t.includes(brand)) return { ok: false, why: `brand "${brand}" missing` };
  const models = modelTokens(name);
  const miss = models.filter((m) => !t.includes(flat(m)));
  if (miss.length) return { ok: false, why: `model ${miss.join(',')} missing` };
  if (ACCESSORY.test(title) && !ACCESSORY.test(name)) return { ok: false, why: 'accessory' };
  if (!models.length) {
    const words = String(name).toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2);
    const missW = words.filter((w) => !t.includes(w));
    if (missW.length) return { ok: false, why: `no model number; words ${missW.join(',')} missing` };
  }
  return { ok: true, why: models.length ? `brand + model ${models.join(',')}` : 'brand + every name word' };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function search(keywords, attempts = 4) {
  const req = new SearchItemsRequestContent();
  req.partnerTag = process.env.AMAZON_CREATORS_PARTNER_TAG;
  req.keywords = keywords;
  req.itemCount = 10;
  req.searchIndex = 'All';
  req.resources = ['itemInfo.title', 'images.primary.medium'];
  for (let n = 1; ; n++) {
    try {
      return (await api.searchItems(client.marketplace, req))?.searchResult?.items || [];
    } catch (err) {
      const throttled = err?.type === 'ThrottleException' || err?.body?.type === 'ThrottleException';
      if (!throttled || n >= attempts) throw err;
      await sleep(1100 * 2 ** n);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const seen = new Set();
  const targets = products.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return (!asins[p.id] || quarantine[p.id]) && !similar[p.id];
  });
  console.log(`[asins] ${targets.length} products without a usable direct link`);
  const rows = [];
  for (const [i, p] of targets.entries()) {
    let items = [];
    try {
      items = await search(p.name);
    } catch (err) {
      rows.push({ id: p.id, name: p.name, file: p.file, status: 'error', error: String(err?.message || JSON.stringify(err?.body || err)).slice(0, 200) });
      await sleep(1100);
      continue;
    }
    const cands = items.map((it) => ({ asin: it.asin, title: it?.itemInfo?.title?.displayValue, image: it?.images?.primary?.medium?.url, ...judge(p.name, it?.itemInfo?.title?.displayValue) }));
    const best = cands.find((c) => c.ok && c.asin !== quarantine[p.id]?.asin);
    rows.push({ id: p.id, name: p.name, file: p.file, status: best ? 'proposed' : 'none', proposal: best || null, top: cands.slice(0, 3).map(({ asin, title, why }) => ({ asin, title, why })) });
    if (i % 10 === 0) console.log(`${i + 1}/${targets.length}...`);
    await sleep(1100);
  }
  writeFileSync(OUT, JSON.stringify(rows, null, 2) + '\n');
  const proposed = rows.filter((r) => r.status === 'proposed').length;
  console.log(`[asins] proposed ${proposed}, none ${rows.filter((r) => r.status === 'none').length}, errors ${rows.filter((r) => r.status === 'error').length}. Review scripts/exact-asin-candidates.json`);
}
