#!/usr/bin/env node
/**
 * Content gate for allmetalbrake.com, run against Astro's build output.
 *
 * The headline rule: an article page must carry at least `minWords` words of
 * real body copy (build.config.json -> minWords, currently 2700). Anything
 * thinner fails the build — the process exits non-zero, which stops both CI
 * and the Vercel deploy.
 *
 * It reads dist/ rather than src/ so it measures what a reader actually
 * receives, with layout and components already applied.
 *
 * Usage:
 *   node tools/check-word-count.js            # validate, exit 1 on any error
 *   node tools/check-word-count.js --report   # also print every article's count
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONFIG = JSON.parse(fs.readFileSync(path.join(ROOT, 'build.config.json'), 'utf8'));
const DIST = path.join(ROOT, CONFIG.distDir);

const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  mdash: '—', ndash: '–', hellip: '…', rsquo: '’', lsquo: '‘',
  ldquo: '“', rdquo: '”', deg: '°', times: '×', frac12: '½',
};

function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-z][a-z0-9]*);/gi, (m, name) => ENTITIES[name] ?? m);
}

/**
 * Pull the innerHTML of `<div class="article-content">` by walking div tags so
 * nested callouts, comparison tables and FAQ blocks are counted too. Stopping
 * at the first `</div>` would undercount by thousands of words.
 */
function extractArticleBody(html) {
  const open = /<div\b[^>]*class\s*=\s*["'][^"']*\barticle-content\b[^"']*["'][^>]*>/i.exec(html);
  if (!open) return null;

  const start = open.index + open[0].length;
  const tag = /<(\/?)div\b[^>]*>/gi;
  tag.lastIndex = start;

  let depth = 1;
  let m;
  while ((m = tag.exec(html)) !== null) {
    depth += m[1] === '/' ? -1 : 1;
    if (depth === 0) return html.slice(start, m.index);
  }
  return html.slice(start);
}

/** Words a reader actually reads: no markup, no scripts, no bare punctuation. */
function countWords(fragment) {
  const text = decodeEntities(
    fragment
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]+>/g, ' ')
  );
  return text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name === 'index.html') out.push(full);
  }
  return out;
}

if (!fs.existsSync(DIST)) {
  console.error(`\n✗ ${CONFIG.distDir}/ not found — run \`astro build\` before this check.\n`);
  process.exit(1);
}

const exempt = new Set(CONFIG.nonArticles);
const errors = [];
const results = [];

for (const file of walk(DIST).sort()) {
  const route = '/' + path.relative(DIST, path.dirname(file)).split(path.sep).filter(Boolean).join('/') + '/';
  const normalized = route === '//' ? '/' : route;
  if (exempt.has(normalized)) continue;

  const html = fs.readFileSync(file, 'utf8');

  // Astro emits a meta-refresh stub for every legacy `.html` -> `/slug/`
  // redirect. Those are navigation aids, not pages, so they are skipped by
  // shape rather than by listing each one in nonArticles.
  if (/<meta\s+http-equiv=["']refresh["']/i.test(html)) continue;

  const body = extractArticleBody(html);

  if (body === null) {
    errors.push(
      `${normalized}: no <div class="article-content"> block found. Every article needs one so the ` +
      `${CONFIG.minWords}-word gate can measure it. If this page is not an article, add its route to ` +
      `"nonArticles" in build.config.json.`
    );
    results.push({ route: normalized, words: 0, ok: false });
    continue;
  }

  const words = countWords(body);
  const ok = words >= CONFIG.minWords;
  results.push({ route: normalized, words, ok });
  if (!ok) {
    errors.push(`${normalized}: ${words} words — below the ${CONFIG.minWords}-word minimum (${CONFIG.minWords - words} short).`);
  }
}

results.sort((a, b) => a.words - b.words);

if (process.argv.includes('--report')) {
  console.log(`\nWord counts (minimum ${CONFIG.minWords})\n`);
  for (const r of results) {
    console.log(`  ${r.ok ? 'PASS' : 'FAIL'}  ${String(r.words).padStart(6)}  ${r.route}`);
  }
}

const failed = results.filter((r) => !r.ok).length;
console.log(
  `\n${results.length} article(s) checked · ${results.length - failed} at or above ` +
  `${CONFIG.minWords} words · ${exempt.size} non-article route(s) exempt`
);

if (errors.length) {
  console.error(`\nContent check failed with ${errors.length} error(s):\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error('');
  process.exit(1);
}

console.log('Content check passed.\n');
