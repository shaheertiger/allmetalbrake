#!/usr/bin/env node
// Ranks every pillar page by how many supporting ("semantic") articles link to it,
// weakest first. The daily publishing job uses this to decide what to write next:
// always top up the thinnest cluster rather than starting a new one.
//
//   node scripts/cluster-report.mjs            # ranked table, weakest first
//   node scripts/cluster-report.mjs --json     # machine-readable, for the daily job
//   node scripts/cluster-report.mjs --top 5    # just the five thinnest clusters
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const PAGES_DIR = join(import.meta.dirname, '..', 'src', 'pages');

// Pages that are not articles, and the index page, never count either way.
const NON_ARTICLE = new Set([
  'index', 'best-of', '404', 'about', 'contact', 'how-we-test',
  'privacy-policy', 'terms', 'sand-calculator',
]);

export function loadPages() {
  return readdirSync(PAGES_DIR)
    .filter((f) => f.endsWith('.astro'))
    .map((f) => f.replace(/\.astro$/, ''))
    .filter((slug) => !NON_ARTICLE.has(slug))
    .map((slug) => ({ slug, source: readFileSync(join(PAGES_DIR, `${slug}.astro`), 'utf8') }));
}

// A pillar is a buyer's guide: the page a cluster is built to support.
export const isPillar = (slug) => slug.startsWith('best-');

// The topical assignment from scripts/build-interlinks.mjs, when it has been built.
const PLAN_FILE = join(import.meta.dirname, '..', 'src', 'data', 'interlinks.json');
const PLANNED = existsSync(PLAN_FILE) ? JSON.parse(readFileSync(PLAN_FILE, 'utf8')).pillarOf : {};

// Which pillar does this supporting article belong to? In order of confidence:
//   1. the sticky CTA, which is an explicit "this page exists to feed that one"
//   2. the guide build-interlinks matched it to by topic
//   3. the pillar it links to most often in the body
function assignPillar(source, pillars, slug) {
  const cta = source.match(/stickyCta=\{\{[\s\S]*?link:\s*"\/([a-z0-9-]+)\/"/);
  if (cta && pillars.has(cta[1])) return cta[1];
  if (pillars.has(PLANNED[slug])) return PLANNED[slug];

  const counts = new Map();
  for (const m of source.matchAll(/href="\/([a-z0-9-]+)\/"/g)) {
    if (pillars.has(m[1])) counts.set(m[1], (counts.get(m[1]) || 0) + 1);
  }
  if (counts.size === 0) return null;
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

export function buildClusters() {
  const pages = loadPages();
  const pillars = new Set(pages.map((p) => p.slug).filter(isPillar));

  const clusters = new Map([...pillars].map((slug) => [slug, []]));
  const orphans = [];

  for (const { slug, source } of pages) {
    if (isPillar(slug)) continue;
    const pillar = assignPillar(source, pillars, slug);
    if (pillar) clusters.get(pillar).push(slug);
    else orphans.push(slug);
  }

  // Inbound links tell us whether the pillar is actually wired into the site.
  const inbound = new Map([...pillars].map((slug) => [slug, 0]));
  for (const { slug, source } of pages) {
    for (const m of new Set([...source.matchAll(/href="\/([a-z0-9-]+)\/"/g)].map((x) => x[1]))) {
      if (m !== slug && inbound.has(m)) inbound.set(m, inbound.get(m) + 1);
    }
  }

  const ranked = [...clusters.entries()]
    .map(([pillar, spokes]) => ({
      pillar,
      spokeCount: spokes.length,
      inboundLinks: inbound.get(pillar) ?? 0,
      spokes: spokes.sort(),
    }))
    .sort((a, b) => a.spokeCount - b.spokeCount || a.pillar.localeCompare(b.pillar));

  return { ranked, orphans: orphans.sort(), pillarCount: pillars.size, pageCount: pages.length };
}

if (import.meta.filename === process.argv[1]) {
  const { ranked, orphans, pillarCount, pageCount } = buildClusters();
  const topFlag = process.argv.indexOf('--top');
  const limit = topFlag !== -1 ? Number(process.argv[topFlag + 1]) : ranked.length;
  const slice = ranked.slice(0, limit);

  if (process.argv.includes('--json')) {
    console.log(JSON.stringify({ ranked: slice, orphans, pillarCount, pageCount }, null, 2));
  } else {
    console.log(`${pageCount} article pages, ${pillarCount} pillars, ${orphans.length} unassigned\n`);
    console.log('SPOKES  IN  PILLAR');
    for (const c of slice) {
      console.log(`${String(c.spokeCount).padStart(6)}  ${String(c.inboundLinks).padStart(2)}  /${c.pillar}/`);
    }
    if (orphans.length && limit === ranked.length) {
      console.log(`\nUnassigned (link to no pillar): ${orphans.length}`);
      for (const slug of orphans.slice(0, 20)) console.log(`  /${slug}/`);
      if (orphans.length > 20) console.log(`  ...and ${orphans.length - 20} more`);
    }
  }
}
