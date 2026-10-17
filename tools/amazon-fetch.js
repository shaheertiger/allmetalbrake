#!/usr/bin/env node
/**
 * Looks up each product in data/amazon-products.json on the Amazon Creators
 * API and records its ASIN, so buttons link to the exact product page instead
 * of a search.
 *
 * Needs these environment variables (from Amazon Associates -> Creators API):
 *   AMAZON_CREATORS_CLIENT_ID, AMAZON_CREATORS_CLIENT_SECRET
 *   AMAZON_CREATORS_PARTNER_TAG (optional, defaults to build.config.json amazon.tag)
 *
 * The top search hit is accepted only when its title shares enough words with
 * the product name. Weaker hits are saved as `candidate` for a person to check
 * and the product keeps its search link. Products that already have an ASIN,
 * or set "keepSearch": true, are skipped. Pass --refresh to look them all up again.
 *
 * Usage:
 *   node tools/amazon-fetch.js && node tools/affiliate.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data/amazon-products.json');
const CONFIG = JSON.parse(fs.readFileSync(path.join(ROOT, 'build.config.json'), 'utf8'));
const MARKETPLACE = CONFIG.amazon.domain;
const PARTNER_TAG = process.env.AMAZON_CREATORS_PARTNER_TAG || CONFIG.amazon.tag;
const REFRESH = process.argv.includes('--refresh');
const MIN_MATCH = 0.6;

const { AMAZON_CREATORS_CLIENT_ID: CLIENT_ID, AMAZON_CREATORS_CLIENT_SECRET: CLIENT_SECRET } = process.env;
if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Set AMAZON_CREATORS_CLIENT_ID and AMAZON_CREATORS_CLIENT_SECRET first.');
  process.exit(1);
}

let token = null;
let tokenExpires = 0;

async function getToken() {
  if (token && Date.now() < tokenExpires) return token;
  const res = await fetch('https://api.amazon.com/auth/o2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      scope: 'creatorsapi::default',
    }),
  });
  const json = await res.json();
  if (!json.access_token) throw new Error(`Token request failed (${res.status}): ${json.error || 'no token'}`);
  token = json.access_token;
  tokenExpires = Date.now() + (json.expires_in - 120) * 1000;
  return token;
}

async function searchItems(keywords) {
  const res = await fetch('https://creatorsapi.amazon/catalog/v1/searchItems', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${await getToken()}`,
      'Content-Type': 'application/json',
      'x-marketplace': MARKETPLACE,
    },
    body: JSON.stringify({
      keywords,
      itemCount: 5,
      marketplace: MARKETPLACE,
      partnerTag: PARTNER_TAG,
      resources: ['itemInfo.title', 'itemInfo.byLineInfo'],
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`searchItems ${res.status}: ${JSON.stringify(json).slice(0, 300)}`);
  return (json.searchResult && json.searchResult.items) || [];
}

const STOP = new Set(['the', 'and', 'for', 'with', 'of', 'a', 'an', 'or', 'in', 'to', 'gal', 'oz']);
const words = (s) => new Set(s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(' ').filter((w) => w.length > 1 && !STOP.has(w)));

/** Share of the product name's words that appear in the Amazon title. */
function matchScore(name, title) {
  const want = words(name);
  const have = words(title);
  if (!want.size) return 0;
  let hit = 0;
  for (const w of want) if (have.has(w)) hit++;
  return hit / want.size;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const data = JSON.parse(fs.readFileSync(DATA, 'utf8'));
  let matched = 0;
  let review = 0;
  let failed = 0;

  for (const [name, product] of Object.entries(data.products)) {
    if (product.keepSearch || (product.asin && !REFRESH)) continue;
    try {
      const items = await searchItems(product.query);
      const scored = items
        .map((it) => ({ asin: it.asin, title: it.itemInfo?.title?.displayValue || '', score: matchScore(product.query, it.itemInfo?.title?.displayValue || '') }))
        .sort((a, b) => b.score - a.score);
      const best = scored[0];
      if (best && best.score >= MIN_MATCH) {
        product.asin = best.asin;
        product.amazonTitle = best.title;
        delete product.candidate;
        matched++;
        console.log(`OK     ${name} -> ${best.asin} (${best.title.slice(0, 70)})`);
      } else if (best) {
        product.candidate = { asin: best.asin, title: best.title, score: Number(best.score.toFixed(2)) };
        review++;
        console.log(`CHECK  ${name} -> ${best.asin}? (${best.title.slice(0, 70)})`);
      } else {
        console.log(`NONE   ${name}`);
      }
    } catch (err) {
      failed++;
      console.log(`ERROR  ${name}: ${err.message}`);
      if (/40[13]/.test(err.message)) break;
    }
    fs.writeFileSync(DATA, JSON.stringify(data, null, 2) + '\n');
    await sleep(1100); // stay under the API's 1 request/second limit
  }

  console.log(`\nMatched ${matched}, needs review ${review}, errors ${failed}. Now run: npm run affiliate`);
})();
