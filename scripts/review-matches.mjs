// Print accepted matches (our name vs Amazon's title) and rejects, so a person can spot wrong products.
// To block a wrong match: add "slug": "reason" to src/data/asin-quarantine.json and delete the slug
// from product-images.json and product-asins.json.
import { readFileSync, existsSync } from 'node:fs';
const path = new URL('./product-match-report.json', import.meta.url);
if (!existsSync(path)) { console.log('No report yet. Run npm run images:fetch first.'); process.exit(0); }
const report = JSON.parse(readFileSync(path, 'utf8'));
for (const r of report.filter((x) => x.status === 'accepted')) console.log(`✓ ${r.slug.padEnd(42)} ${r.asin}  ${r.matchedTitle?.slice(0, 90)}`);
for (const r of report.filter((x) => x.status !== 'accepted' && x.status !== 'already-cached')) console.log(`✗ ${r.slug.padEnd(42)} ${r.status}  ${r.topResultTitle?.slice(0, 80) ?? r.error ?? ''}`);
