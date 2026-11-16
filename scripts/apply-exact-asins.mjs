#!/usr/bin/env node
// Applies reviewed rows from scripts/exact-asin-candidates.json.
//
//   node scripts/apply-exact-asins.mjs id1 id2 ...      # apply these proposals
//   node scripts/apply-exact-asins.mjs --all-proposed   # apply every proposal
//
// Writes the ASIN to src/data/product-asins.json and the photo to
// src/data/product-images.json. Then re-run `npm run affiliate:verify` and
// `npm run affiliate:quarantine` so the quarantine reflects the new listings.
//
// Also drops the photo of every product whose listing is quarantined as a
// mismatch: that photo shows the wrong product, and a card with no photo is
// better than a card with someone else's.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const path = (p) => join(root, p);
const read = (p) => JSON.parse(readFileSync(path(p), 'utf8'));
const write = (p, v) => writeFileSync(path(p), JSON.stringify(v, null, 2) + '\n');

const rows = read('scripts/exact-asin-candidates.json');
const asins = read('src/data/product-asins.json');
const images = read('src/data/product-images.json');
const quarantine = read('src/data/asin-quarantine.json');

const all = process.argv.includes('--all-proposed');
const ids = new Set(process.argv.slice(2).filter((a) => !a.startsWith('--')));
let applied = 0;
for (const r of rows) {
  if (r.status !== 'proposed' || !(all || ids.has(r.id))) continue;
  asins[r.id] = r.proposal.asin;
  if (r.proposal.image) images[r.id] = r.proposal.image;
  delete quarantine[r.id];
  applied++;
}
let dropped = 0;
for (const [id, q] of Object.entries(quarantine)) {
  if (q.reason === 'mismatch' && images[id]) {
    delete images[id];
    dropped++;
  }
}
write('src/data/product-asins.json', asins);
write('src/data/product-images.json', images);
console.log(`[asins] applied ${applied} exact-model listings; dropped ${dropped} wrong-product photos`);
