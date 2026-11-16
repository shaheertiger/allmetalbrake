#!/usr/bin/env node
// Snippet and template gate for every indexed article page (docs/ranking-method.md,
// sections 1c, 1d and 3). Fails the build when a page:
//   - has a <title> outside 50-62 characters or a description outside 140-158,
//   - makes a testing claim in its title, description or H1,
//   - carries "(2026)" on a page that is not a review, brand, roundup or store page,
//   - still prints the method sentence that used to be identical on every page, or
//   - uses the generic "Common Mistakes to Avoid" heading instead of naming its topic.
//
//   node scripts/validate-snippets.mjs           # fail on problems
//   node scripts/validate-snippets.mjs --report  # list problems, exit 0
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { NOINDEX_SLUGS as NOINDEX } from './noindex.mjs';

const ROOT = join(import.meta.dirname, '..');
const PAGES_DIR = join(ROOT, 'src', 'pages');
const REPORT = process.argv.includes('--report');
const NON_ARTICLE = new Set([
  'index', 'best-of', 'sand-calculator', '404', 'about', 'contact', 'how-we-test', 'privacy-policy', 'terms',
]);

const TITLE = [50, 62];
const DESC = [140, 158];
const TESTING = /\b(tested|testing|hands-on|lab[- ]tested|we test)\b/i;
const SHARED_METHOD = 'We judge every product on its spec sheet, its label and what owners report over time';
// "(2026)" belongs on pages whose content goes stale with the model year: reviews,
// brand guides, roundups and store pages. Questions, how-tos and X-vs-Y pages do not.
const YEAR_OK = (slug) => /^best-|-review$|^driveway-sealer-(home-depot|menards)$/.test(slug);

const decode = (s) => s.replace(/\\"/g, '"').replace(/&amp;/g, '&');
const strip = (s) => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const problems = [];
const slugs = readdirSync(PAGES_DIR)
  .filter((f) => f.endsWith('.astro'))
  .map((f) => f.replace(/\.astro$/, ''))
  .filter((slug) => !NON_ARTICLE.has(slug) && !NOINDEX.has(slug));

for (const slug of slugs) {
  const src = readFileSync(join(PAGES_DIR, `${slug}.astro`), 'utf8');
  const fail = (msg) => problems.push(`/${slug}/: ${msg}`);
  const title = decode((src.match(/const title = "((?:[^"\\]|\\.)*)";/) || [])[1] ?? '');
  const desc = decode((src.match(/const description =\s*"((?:[^"\\]|\\.)*)";/) || [])[1] ?? '');
  const hero = src.slice(src.indexOf('<header data-hero'));
  const h1 = strip((hero.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] ?? '');

  if (!title) fail('no `const title`');
  else if (title.length < TITLE[0] || title.length > TITLE[1]) fail(`title is ${title.length} chars (${TITLE[0]}-${TITLE[1]}): "${title}"`);
  if (!desc) fail('no `const description`');
  else if (desc.length < DESC[0] || desc.length > DESC[1]) fail(`description is ${desc.length} chars (${DESC[0]}-${DESC[1]})`);
  for (const [name, text] of [['title', title], ['description', desc], ['H1', h1]]) {
    if (TESTING.test(text)) fail(`testing language in the ${name}: "${text.match(TESTING)[0]}"`);
  }
  if (/\(20\d\d\)/.test(title) && !YEAR_OK(slug)) fail('"(year)" in the title of a question, how-to or vs page');
  if (src.includes(SHARED_METHOD)) fail('still prints the shared method sentence; write a page-specific one');
  if (/<h2[^>]*>\s*(?:\d{1,2}\.\s+)?Common Mistakes to Avoid\s*</.test(src)) fail('generic "Common Mistakes to Avoid" heading; name the topic');
}

if (!problems.length) {
  console.log(`[snippets] All ${slugs.length} indexed article pages pass the snippet and template checks.`);
  process.exit(0);
}
console.log(`[snippets] ${problems.length} problem(s):\n`);
for (const p of problems) console.log(`  ${p}`);
process.exit(REPORT ? 0 : 1);
