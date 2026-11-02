#!/usr/bin/env node
// Gates that apply to pages added by an automated run. They fail on NEW pages only,
// so a pre-existing quirk elsewhere on the site can never block a publish — while a
// newly written page still has to earn its place.
//
//   node scripts/validate-new-pages.mjs                 # vs origin/main
//   node scripts/validate-new-pages.mjs --since HEAD~1
//   node scripts/validate-new-pages.mjs --all           # audit the whole site (report only)
//
// Checks: no duplicate or near-duplicate titles, no cannibalised primary keyword,
// at least two outbound internal links, at least one inbound link from another page,
// and a link to the cluster pillar.
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { readdirSync } from 'node:fs';
import { loadPages } from './cluster-report.mjs';

const PAGES_DIR = join(import.meta.dirname, '..', 'src', 'pages');

const sinceFlag = process.argv.indexOf('--since');
const SINCE = sinceFlag !== -1 ? process.argv[sinceFlag + 1] : 'origin/main';
const ALL = process.argv.includes('--all');

// New pages are whatever this branch has added since SINCE, plus anything added in
// the working tree but not yet committed — a run is checked before it is committed.
function newSlugs() {
  const slugs = new Set();
  const add = (file) => {
    const m = file.match(/^src\/pages\/([a-z0-9-]+)\.astro$/);
    if (m) slugs.add(m[1]);
  };

  try {
    execSync(`git diff --name-only --diff-filter=A ${SINCE}...HEAD -- src/pages`, { encoding: 'utf8' })
      .split('\n').filter(Boolean).forEach(add);
  } catch {
    console.log(`[gate] Could not diff against ${SINCE}; checking the working tree only.`);
  }

  execSync('git status --porcelain -- src/pages', { encoding: 'utf8' })
    .split('\n').filter(Boolean)
    .filter((line) => /^(\?\?|A |AM|\sA)/.test(line))
    .map((line) => line.slice(3).trim())
    .forEach(add);

  return [...slugs];
}

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
const STOP = new Set(['the', 'a', 'an', 'in', 'for', 'and', 'or', 'of', 'to', 'is', 'do', 'best', '2026']);
const keyTokens = (s) => new Set(norm(s).filter((w) => !STOP.has(w)));
// Jaccard similarity. Short titles share their few meaningful words too easily
// ("asphalt sealer"), so only compare titles with real substance to them.
const overlap = (a, b) => {
  if (a.size < 4 || b.size < 4) return 0;
  const inter = [...a].filter((w) => b.has(w)).length;
  return inter / (a.size + b.size - inter);
};

const pages = loadPages();
const byslug = new Map(pages.map((p) => [p.slug, p.source]));

const titleOf = (src) => (src.match(/^const title =\s*\n?\s*"(.+?)";/m) || src.match(/const title = "(.+?)"/) || [])[1] || '';
const primaryTag = (src) => {
  const tags = src.match(/tags:\s*\[([\s\S]*?)\]/);
  if (!tags) return '';
  const first = tags[1].match(/"(.+?)"/);
  return first ? first[1] : '';
};
// Matches both markup links (href="/slug/") and the data-driven link lists the hub
// pages and MoreInCategory blocks use (url: '/slug/'), in either quote style.
const LINK_RE = /(?:href|url)\s*[:=]\s*["'`]\/([a-z0-9-]+)\/["'`]/g;
const outboundLinks = (src, self) =>
  [...new Set([...src.matchAll(LINK_RE)].map((m) => m[1]))].filter((s) => s !== self && byslug.has(s));

// Inbound links count from every page on the site, hubs included — /best-of/ and the
// home page link out to most of the catalogue and are how readers actually arrive.
const inboundCount = new Map();
const allFiles = readdirSync(PAGES_DIR).filter((f) => f.endsWith('.astro'));
for (const file of allFiles) {
  const slug = file.replace(/\.astro$/, '');
  const source = readFileSync(join(PAGES_DIR, file), 'utf8');
  for (const target of outboundLinks(source, slug)) {
    inboundCount.set(target, (inboundCount.get(target) || 0) + 1);
  }
}

const targets = ALL ? pages.map((p) => p.slug) : newSlugs();
if (!targets.length) {
  console.log('[gate] No new pages to check.');
  process.exit(0);
}

const problems = [];
for (const slug of targets) {
  const src = byslug.get(slug);
  if (!src) continue;
  const title = titleOf(src);
  const tokens = keyTokens(title);
  const fail = (msg) => problems.push(`${slug}: ${msg}`);

  for (const other of pages) {
    if (other.slug === slug) continue;
    const otherTitle = titleOf(other.source);
    if (otherTitle && otherTitle === title) fail(`duplicate title with /${other.slug}/`);
    else if (otherTitle && overlap(tokens, keyTokens(otherTitle)) >= 0.8) {
      fail(`near-duplicate title with /${other.slug}/ ("${otherTitle}")`);
    }
    if (!ALL && primaryTag(src) && primaryTag(src) === primaryTag(other.source)) {
      fail(`same primary keyword as /${other.slug}/ ("${primaryTag(src)}") — cannibalisation risk`);
    }
  }

  const out = outboundLinks(src, slug);
  if (out.length < 2) fail(`only ${out.length} outbound internal link(s); needs at least 2`);
  if ((inboundCount.get(slug) || 0) < 1) fail('no inbound links from any other page — it would be an orphan');
  if (!/stickyCta=\{\{[\s\S]*?link:\s*"\/best-[a-z0-9-]+\/"/.test(src) && !out.some((s) => s.startsWith('best-'))) {
    fail('does not link to a pillar (best-*) page');
  }
}

if (problems.length) {
  console.log(`[gate] ${problems.length} problem(s) in ${targets.length} page(s):\n`);
  for (const p of [...new Set(problems)]) console.log(`  ${p}`);
  process.exit(ALL ? 0 : 1);
}
console.log(`[gate] ${targets.length} new page(s) passed uniqueness, linking and cannibalisation checks.`);
