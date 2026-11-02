#!/usr/bin/env node
// Reviews the Creators API match report and prints only the matches worth a
// human look: the ones where the product name and the matched Amazon title
// share little vocabulary. A wrong ASIN sends readers to the wrong product,
// so these are checked before the map is committed.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const REPORT = join(import.meta.dirname, 'all-products-match-report.json');
if (!existsSync(REPORT)) {
  console.error('No match report found. Run `npm run images:fetch:all` first.');
  process.exit(1);
}

const report = JSON.parse(readFileSync(REPORT, 'utf-8'));
const THRESHOLD = Number(process.argv[2] ?? 0.5);

const STOP = new Set(['the', 'a', 'an', 'for', 'and', 'with', 'of', 'in', 'to', 'by', 'pack', 'new']);
const tokens = (s) =>
  new Set(
    String(s || '')
      .toLowerCase()
      .replace(/[^a-z0-9 ]+/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 1 && !STOP.has(t)),
  );

// What share of the product's own words appear in the matched title.
function coverage(name, title) {
  const a = tokens(name);
  const b = tokens(title);
  if (a.size === 0) return 0;
  let hit = 0;
  for (const t of a) if (b.has(t)) hit++;
  return hit / a.size;
}

const accepted = report.filter((r) => r.status === 'accepted');
const scored = accepted
  .map((r) => ({ ...r, score: coverage(r.name, r.matchedTitle) }))
  .sort((x, y) => x.score - y.score);

const suspect = scored.filter((r) => r.score < THRESHOLD);

console.log(
  `\n${accepted.length} accepted | ${report.filter((r) => r.status === 'rejected').length} rejected | ` +
    `${report.filter((r) => r.status === 'error').length} errors\n`,
);
console.log(`${suspect.length} matches below ${Math.round(THRESHOLD * 100)}% name coverage — check these:\n`);

for (const r of suspect) {
  console.log(`  ${Math.round(r.score * 100).toString().padStart(3)}%  ${r.id}`);
  console.log(`        ours: ${r.name}`);
  console.log(`      amazon: ${r.matchedTitle}`);
  console.log(`        asin: ${r.asin ?? '(none)'}   page: ${r.file}\n`);
}

if (suspect.length) {
  console.log('To drop a bad one, delete its id from src/data/product-asins.json');
  console.log('and src/data/product-images.json, then re-run this check.\n');
} else {
  console.log('Nothing below the threshold. Run with a higher one to widen the net,');
  console.log('e.g. `node scripts/review-matches.mjs 0.7`\n');
}
