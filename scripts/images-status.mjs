#!/usr/bin/env node
// Reports affiliate link coverage and whether this environment can fetch more.
// The daily publishing run calls this to decide whether to attempt a fetch.
//
//   node scripts/images-status.mjs            # human-readable
//   node scripts/images-status.mjs --json     # for the daily job
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const root = join(import.meta.dirname, '..');
const read = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : {});

// Refresh the product list so newly published articles are counted.
execSync('node scripts/extract-all-products.mjs', { cwd: root, stdio: 'ignore' });

const products = read(join(root, 'scripts', 'all-products.json'));
const asins = read(join(root, 'src', 'data', 'product-asins.json'));
const images = read(join(root, 'src', 'data', 'product-images.json'));

const ids = products.map((p) => p.id);
const linked = ids.filter((id) => asins[id] && images[id]);
const missing = ids.filter((id) => !(asins[id] && images[id]));

// Credentials may arrive as real environment variables or via a .env file; either works.
const envFile = existsSync(join(root, '.env')) ? readFileSync(join(root, '.env'), 'utf8') : '';
const has = (name) => Boolean(process.env[name]) || new RegExp(`^${name}=.+`, 'm').test(envFile);
const canFetch = has('AMAZON_CREATORS_CLIENT_ID') && has('AMAZON_CREATORS_CLIENT_SECRET');

const status = {
  products: ids.length,
  linked: linked.length,
  missing: missing.length,
  coverage: Number(((linked.length / Math.max(ids.length, 1)) * 100).toFixed(1)),
  canFetch,
  missingIds: missing.slice(0, 50),
};

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(status, null, 2));
} else {
  console.log(`Affiliate links: ${status.linked}/${status.products} direct product links (${status.coverage}%)`);
  console.log(`Missing: ${status.missing} products fall back to a tagged Amazon search`);
  console.log(canFetch
    ? `\nCredentials present — run "npm run images:fetch:all" to fetch the missing ones.`
    : `\nNo Amazon Creators credentials in this environment, so the fetch cannot run.`
      + `\nSet AMAZON_CREATORS_CLIENT_ID and AMAZON_CREATORS_CLIENT_SECRET as environment`
      + `\nvariables (or in a local .env) to enable it. Links still work without them —`
      + `\nthey fall back to a tagged search, which is worth less but still pays.`);
}
