#!/usr/bin/env node
/**
 * Build gate for allmetalbrake.com.
 *
 * The site is plain static HTML, so "building" it means validating it. The
 * headline rule: an article page must carry at least `minWords` words of real
 * body copy (build.config.json -> minWords, currently 2700). Anything thinner
 * is a fail, not a warning — the process exits non-zero and CI goes red.
 *
 * Usage:
 *   node tools/build.js            # validate, exit 1 on any error
 *   node tools/build.js --report   # print the word count of every article
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CONFIG = JSON.parse(fs.readFileSync(path.join(ROOT, 'build.config.json'), 'utf8'));

const errors = [];
const warnings = [];

/* ------------------------------------------------------------------ *
 * Word counting
 * ------------------------------------------------------------------ */

const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  mdash: '—', ndash: '–', hellip: '…', rsquo: '’', lsquo: '‘',
  ldquo: '“', rdquo: '”', deg: '°', times: '×', frac12: '½',
};

function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-z][a-z0-9]*);/gi, (m, name) => ENTITIES[name] !== undefined ? ENTITIES[name] : m);
}

/**
 * Pull the innerHTML of `<div class="article-content">` by walking div tags so
 * nested divs (callouts, FAQ blocks, comparison tables) are counted too. A
 * regex to the first `</div>` would stop at the first nested close and
 * undercount by thousands of words.
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
  return html.slice(start); // unbalanced markup; count what we have
}

/**
 * Words a reader actually reads. Scripts, styles, comments and all tags are
 * stripped; a "word" is a whitespace-delimited token containing at least one
 * letter or digit, so stray punctuation and bullet glyphs don't pad the count.
 */
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

/* ------------------------------------------------------------------ *
 * File discovery
 * ------------------------------------------------------------------ */

function expandGlob(pattern) {
  const [dir, file] = pattern.includes('/')
    ? [pattern.slice(0, pattern.lastIndexOf('/')), pattern.slice(pattern.lastIndexOf('/') + 1)]
    : ['.', pattern];
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  const re = new RegExp('^' + file.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
  return fs.readdirSync(abs)
    .filter((n) => re.test(n) && fs.statSync(path.join(abs, n)).isFile())
    .map((n) => (dir === '.' ? n : `${dir}/${n}`))
    .sort();
}

const allPages = [...new Set(CONFIG.articleGlobs.flatMap(expandGlob))];
const exempt = new Set(CONFIG.nonArticles);
const articles = allPages.filter((p) => !exempt.has(p));

/* ------------------------------------------------------------------ *
 * Checks
 * ------------------------------------------------------------------ */

const sitemapPath = path.join(ROOT, CONFIG.sitemap);
const sitemapUrls = fs.existsSync(sitemapPath)
  ? new Set([...fs.readFileSync(sitemapPath, 'utf8').matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)]
      .map((m) => m[1].replace(CONFIG.siteOrigin, '').replace(/^\//, '') || 'index.html'))
  : new Set();

const results = [];

for (const rel of articles) {
  const html = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const body = extractArticleBody(html);

  if (body === null) {
    errors.push(
      `${rel}: no <div class="article-content"> block found. Every article needs one so the ` +
      `${CONFIG.minWords}-word gate can measure it. If this page is not an article, add it to ` +
      `"nonArticles" in build.config.json.`
    );
    results.push({ rel, words: 0, ok: false });
    continue;
  }

  const words = countWords(body);
  const ok = words >= CONFIG.minWords;
  results.push({ rel, words, ok });

  if (!ok) {
    errors.push(
      `${rel}: ${words} words — below the ${CONFIG.minWords}-word minimum ` +
      `(${CONFIG.minWords - words} short).`
    );
  }

  const title = /<title>([\s\S]*?)<\/title>/i.exec(html);
  if (!title || !title[1].trim()) errors.push(`${rel}: missing <title>.`);

  const desc = /<meta\s+name=["']description["']\s+content=(["'])([\s\S]*?)\1/i.exec(html);
  if (!desc || desc[2].trim().length < 50) {
    errors.push(`${rel}: missing or too-short <meta name="description"> (needs 50+ characters).`);
  }

  if (!/<h1[\s>]/i.test(html)) errors.push(`${rel}: no <h1> heading.`);

  if (CONFIG.requireInSitemap && !sitemapUrls.has(rel)) {
    errors.push(`${rel}: not listed in ${CONFIG.sitemap}.`);
  }
}

/* Internal links must resolve — a 404 in the nav costs more than a typo. */
const onDisk = new Set(
  fs.readdirSync(ROOT).filter((n) => fs.statSync(path.join(ROOT, n)).isFile())
);
for (const sub of ['reviews', 'css', 'js']) {
  if (fs.existsSync(path.join(ROOT, sub))) {
    for (const n of fs.readdirSync(path.join(ROOT, sub))) onDisk.add(`${sub}/${n}`);
  }
}
for (const rel of allPages) {
  const html = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const base = rel.includes('/') ? rel.slice(0, rel.lastIndexOf('/')) : '';
  for (const m of html.matchAll(/(?:href|src)\s*=\s*["']([^"'#?]+)(?:[#?][^"']*)?["']/g)) {
    const href = decodeEntities(m[1]);
    if (/^(https?:|mailto:|tel:|data:|\/\/)/i.test(href) || href === '') continue;
    const target = path.posix.normalize(base ? `${base}/${href}` : href);
    if (!onDisk.has(target)) errors.push(`${rel}: broken internal link -> ${href}`);
  }
}

/* ------------------------------------------------------------------ *
 * Report
 * ------------------------------------------------------------------ */

results.sort((a, b) => a.words - b.words);

if (process.argv.includes('--report')) {
  console.log(`\nWord counts (minimum ${CONFIG.minWords})\n`);
  for (const r of results) {
    console.log(`  ${r.ok ? 'PASS' : 'FAIL'}  ${String(r.words).padStart(6)}  ${r.rel}`);
  }
}

const failed = results.filter((r) => !r.ok).length;
console.log(
  `\n${articles.length} article(s) checked · ${articles.length - failed} at or above ` +
  `${CONFIG.minWords} words · ${exempt.size} non-article page(s) exempt`
);

for (const w of warnings) console.warn(`  warning: ${w}`);

if (errors.length) {
  console.error(`\nBuild failed with ${errors.length} error(s):\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error('');
  process.exit(1);
}

console.log('Build passed.\n');
