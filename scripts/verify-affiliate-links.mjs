#!/usr/bin/env node
// Verifies that every stored ASIN actually points at the product we named.
//
//   node --env-file-if-exists=.env scripts/verify-affiliate-links.mjs
//   node --env-file-if-exists=.env scripts/verify-affiliate-links.mjs 0.6   # custom threshold
//
// The fetcher records a matchedTitle only for products it matched in that run;
// anything already cached is skipped with no evidence stored, so most links
// cannot be checked from disk. This resolves each stored ASIN through GetItems
// and compares the real Amazon title with our product name, which is the only
// way to confirm a link points where the page says it does.
//
// Read-only: it never edits product-asins.json or product-images.json. It writes
// scripts/affiliate-verify-report.json so the result can be reviewed and acted on.
import { ApiClient, TypedDefaultApi, GetItemsRequestContent } from 'amazon-creators-api';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// Credentials pasted from a "<your-id-here>" template keep the angle brackets, and
// Amazon then rejects them with a 401. Strip brackets and stray whitespace up front.
for (const name of Object.keys(process.env).filter((k) => k.startsWith('AMAZON_CREATORS_'))) {
  process.env[name] = process.env[name].trim().replace(/^<(.*)>$/, '$1').trim();
}

for (const name of ['AMAZON_CREATORS_CLIENT_ID', 'AMAZON_CREATORS_CLIENT_SECRET', 'AMAZON_CREATORS_PARTNER_TAG']) {
  if (!process.env[name]) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
}

const client = new ApiClient();
client.credentialId = process.env.AMAZON_CREATORS_CLIENT_ID;
client.credentialSecret = process.env.AMAZON_CREATORS_CLIENT_SECRET;
client.version = process.env.AMAZON_CREATORS_VERSION || '3.1';
client.marketplace = process.env.AMAZON_CREATORS_MARKETPLACE || 'www.amazon.com';
const api = new TypedDefaultApi(client);

const root = join(import.meta.dirname, '..');
const products = JSON.parse(readFileSync(join(root, 'scripts', 'all-products.json'), 'utf8'));
const asinPath = join(root, 'src', 'data', 'product-asins.json');
const asins = existsSync(asinPath) ? JSON.parse(readFileSync(asinPath, 'utf8')) : {};
const REPORT = join(root, 'scripts', 'affiliate-verify-report.json');
const THRESHOLD = Number(process.argv[2] ?? 0.5);

// Same scoring as review-matches.mjs, so thresholds mean the same thing in both.
const STOP = new Set(['the', 'a', 'an', 'for', 'and', 'with', 'of', 'in', 'to', 'by', 'pack', 'new']);
const tokens = (s) =>
  new Set(
    String(s || '')
      .toLowerCase()
      .replace(/[^a-z0-9 ]+/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 1 && !STOP.has(t)),
  );
function coverage(name, title) {
  const a = tokens(name);
  const b = tokens(title);
  if (a.size === 0) return 0;
  let hit = 0;
  for (const t of a) if (b.has(t)) hit++;
  return hit / a.size;
}

const targets = products.filter((p) => asins[p.id]);
console.log(`Verifying ${targets.length} stored ASINs through GetItems...\n`);

const BATCH = 10; // GetItems accepts up to 10 ItemIds per request.
// The Creators API allows about one request per second; going faster gets ThrottleException.
const DELAY_MS = 1100;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];

// Resolves a set of ASINs to titles. Returns null if the whole request failed,
// which lets the caller fall back to one-at-a-time so a single bad ASIN in a
// batch cannot take the other nine down with it.
async function lookup(ids) {
  const req = new GetItemsRequestContent();
  req.partnerTag = process.env.AMAZON_CREATORS_PARTNER_TAG;
  req.itemIds = ids;
  req.resources = ['itemInfo.title'];
  const res = await api.getItems(client.marketplace, req);
  const items = res?.itemsResult?.items || [];
  return new Map(items.map((it) => [it.asin, it?.itemInfo?.title?.displayValue]));
}

for (let i = 0; i < targets.length; i += BATCH) {
  const slice = targets.slice(i, i + BATCH);
  const ids = slice.map((p) => asins[p.id]);
  if (i > 0) await sleep(DELAY_MS);
  try {
    let byAsin;
    try {
      byAsin = await lookup(ids);
    } catch {
      // A batch fails entirely if any ASIN in it is malformed or withdrawn, so
      // retry singly to salvage the rest and isolate the genuinely bad one.
      byAsin = new Map();
      for (const id of ids) {
        try {
          const one = await lookup([id]);
          for (const [k, v] of one) byAsin.set(k, v);
        } catch {
          /* leave unresolved */
        }
        await sleep(DELAY_MS);
      }
    }

    for (const p of slice) {
      const asin = asins[p.id];
      const title = byAsin.get(asin) || null;
      results.push({
        id: p.id,
        name: p.name,
        file: p.file,
        asin,
        amazonTitle: title,
        score: title ? coverage(p.name, title) : null,
        status: title ? 'resolved' : 'unresolved',
      });
    }
  } catch (err) {
    // The SDK throws response objects as well as Errors, and String(obj) on those
    // yields "[object Object]", which hides the actual cause. Dig out something useful.
    const detail =
      err?.message ||
      err?.body?.errors?.[0]?.message ||
      err?.response?.body ||
      (() => {
        try {
          return JSON.stringify(err).slice(0, 300);
        } catch {
          return String(err);
        }
      })();
    for (const p of slice) {
      results.push({
        id: p.id,
        name: p.name,
        file: p.file,
        asin: asins[p.id],
        amazonTitle: null,
        score: null,
        status: 'error',
        error: detail,
      });
    }
  }
  if (i % 100 === 0) console.log(`  ${Math.min(i + BATCH, targets.length)}/${targets.length}...`);
  await new Promise((r) => setTimeout(r, 300));
}

writeFileSync(REPORT, JSON.stringify(results, null, 2) + '\n');

const resolved = results.filter((r) => r.status === 'resolved');
const unresolved = results.filter((r) => r.status === 'unresolved');
const errored = results.filter((r) => r.status === 'error');
const suspect = resolved.filter((r) => r.score < THRESHOLD).sort((a, b) => a.score - b.score);

console.log(`\n${resolved.length} resolved | ${unresolved.length} unresolved | ${errored.length} errors`);
console.log(`\n${suspect.length} below ${Math.round(THRESHOLD * 100)}% name coverage — review these:\n`);
for (const r of suspect) {
  console.log(`  ${Math.round(r.score * 100).toString().padStart(3)}%  ${r.id}`);
  console.log(`        ours: ${r.name}`);
  console.log(`      amazon: ${String(r.amazonTitle).slice(0, 100)}`);
  console.log(`        asin: ${r.asin}   page: ${r.file}\n`);
}

if (unresolved.length) {
  console.log(`${unresolved.length} ASINs did not resolve — the product may be delisted. These are dead links:\n`);
  for (const r of unresolved.slice(0, 40)) {
    console.log(`  ${r.id}  (${r.asin})  ${r.file}`);
  }
  console.log();
}

console.log(`Full report: scripts/affiliate-verify-report.json`);
console.log(`To drop a bad match, delete its id from src/data/product-asins.json`);
console.log(`and src/data/product-images.json — it then falls back to a tagged search.\n`);
