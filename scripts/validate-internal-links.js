#!/usr/bin/env node
// Fails the build on internal links that would 404 or that skip the site's
// canonical trailing slash. Both cost crawl budget and make Bing/Google report
// pages that are "missing from your sitemaps" (the sitemap only lists the
// canonical trailing-slash form of pages that actually exist).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SRC_DIR = join(import.meta.dirname, '..', 'src');
const PAGES_DIR = join(SRC_DIR, 'pages');
const SITE = 'https://www.allmetalbrake.com';

// Every .astro route, including nested ones such as authors/alex-rivers.
// (Defined before walk() is declared below, so walk the tree inline.)
const listPages = (dir, prefix = '') =>
  readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return listPages(path, `${prefix}${entry}/`);
    return entry.endsWith('.astro') && !entry.startsWith('[') ? [`${prefix}${entry.replace(/\.astro$/, '')}`] : [];
  });
const pages = new Set(listPages(PAGES_DIR));
pages.delete('index'); // the home page is referenced as "/"

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const problems = [];

for (const file of walk(SRC_DIR)) {
  if (!/\.(astro|tsx|ts)$/.test(file)) continue;
  const source = readFileSync(file, 'utf-8');
  const relative = file.slice(SRC_DIR.length - 3);

  const refs = [
    // href="/some-page/" — the site's own routes, ignoring assets and anchors
    ...[...source.matchAll(/href="\/([^"]*)"/g)].map((m) => ({ raw: `/${m[1]}`, target: m[1] })),
    // Absolute URLs in canonical tags, JSON-LD breadcrumbs and Open Graph tags
    ...[...source.matchAll(new RegExp(`${SITE}/([^"'\\s]*)`, 'g'))].map((m) => ({
      raw: `${SITE}/${m[1]}`,
      target: m[1],
    })),
    // Route strings in data objects that later become an href, e.g. best-of.astro's
    // `{ title: '…', url: '/best-driveway-sealer/' }` guide cards
    ...[...source.matchAll(/\b(?:url|link|href): *['"](\/[^'"]*)['"]/g)].map((m) => ({
      raw: m[1],
      target: m[1].slice(1),
    })),
  ];

  for (const { raw, target } of refs) {
    const [path] = target.split(/[#?]/);
    if (path === '' || path.includes('.')) continue; // home page, assets, sitemap
    const slug = path.replace(/\/$/, '');
    if (!pages.has(slug)) {
      problems.push(`${relative}: ${raw} — no page src/pages/${slug}.astro`);
    } else if (!path.endsWith('/')) {
      problems.push(`${relative}: ${raw} — missing canonical trailing slash`);
    }
  }
}

if (problems.length > 0) {
  console.error('Internal link validation failed:\n');
  for (const problem of problems) console.error(`  ${problem}`);
  console.error(`\n${problems.length} bad internal link(s).`);
  process.exit(1);
}

console.log('All internal links resolve to a real page and use a trailing slash.');
