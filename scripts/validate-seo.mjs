#!/usr/bin/env node
// Bing on-page gate (docs/bing-playbook.md). Fails the build when a page breaks
// the rules that the site's own Bing data proved:
//
//   - <title> 50-65 characters, so the year and the deciding factor survive
//     truncation in the results page
//   - every buying guide ("best-" page with a PRODUCTS list) carries the year:
//     "best ... 2026" queries click at 15.6% vs 6.2% without it
//   - no "Tested" in a title (the site only claims tests that happened)
//   - meta description 110-160 characters: Bing shows it as written, so it is ad copy
//   - exactly one H1
//
// Noindexed pages (scripts/noindex.mjs) and utility pages are skipped.
//   node scripts/validate-seo.mjs           # fail on violations
//   node scripts/validate-seo.mjs --report  # list violations, never fail
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { NOINDEX_SLUGS } from './noindex.mjs';

const PAGES = join(import.meta.dirname, '..', 'src', 'pages');
const YEAR = String(new Date().getUTCFullYear());
const stale = [];
const SKIP = new Set(['404', 'index', 'best-of', 'about', 'contact', 'terms', 'privacy-policy', 'how-we-test']);
const REPORT = process.argv.includes('--report');

const problems = [];
for (const file of readdirSync(PAGES).filter((f) => f.endsWith('.astro'))) {
  const slug = file.replace(/\.astro$/, '');
  if (SKIP.has(slug) || NOINDEX_SLUGS.has(slug)) continue;
  const src = readFileSync(join(PAGES, file), 'utf8');
  const title = src.match(/const title\s*=\s*\n?\s*(["'`])([\s\S]*?)\1;/)?.[2];
  const desc = src.match(/const description\s*=\s*\n?\s*(["'`])([\s\S]*?)\1;/)?.[2];
  const fail = (msg) => problems.push(`${slug}: ${msg}`);

  if (!title) fail('no `const title`');
  else {
    if (title.length < 50 || title.length > 65) fail(`title is ${title.length} chars (50-65): "${title}"`);
    if (/\btested\b/i.test(title)) fail(`title claims "Tested": "${title}"`);
    const isGuide = slug.startsWith('best-') && /const (PRODUCTS|PICKS)\b/.test(src);
    if (isGuide && !/\b20\d\d\b/.test(title)) fail(`buying guide title has no year: "${title}"`);
    else if (isGuide && !title.includes(YEAR)) stale.push(slug);
  }
  if (!desc) fail('no `const description`');
  else if (desc.length < 110 || desc.length > 160) fail(`description is ${desc.length} chars (110-160)`);
  const h1s = (src.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) fail(`${h1s} H1 tags (need exactly 1)`);
}

// A stale year is a warning, not a failure: refresh titles in January when the
// pages themselves are updated, never by bumping the year alone.
if (stale.length) console.log(`[seo] ${stale.length} buying guide title(s) still show an old year: ${stale.join(', ')}`);

if (problems.length) {
  console.log(`[seo] ${problems.length} problem(s):\n  ${problems.join('\n  ')}`);
  if (!REPORT) process.exit(1);
} else {
  console.log('[seo] Titles, descriptions and H1s pass the Bing rules.');
}
