#!/usr/bin/env node
/**
 * Writes dist/llms.txt and dist/llms-full.txt after `astro build`.
 *
 *   dist/llms-full.txt = src/data/llms-full-intro.md (hand-written)
 *                        + a Complete URL Index generated from the sitemap
 *   dist/llms.txt      = src/data/llms.md (hand-written, llmstxt.org format),
 *                        with bare-URL list lines expanded to [title](url)
 *
 * The built sitemap is the source of truth for which URLs exist; page titles
 * come from each page's built <title>, minus the " | Home Fix Reviews" /
 * " — Home Fix Reviews" suffix.
 *
 * Validation gate: every site URL in either hand-written file must be in the
 * sitemap, in canonical form (https://www. host, trailing slash), or the build
 * fails with a message naming the bad URL. This keeps curated links from
 * rotting when a page is renamed or removed.
 *
 * Usage: node scripts/generate-llms.mjs   (runs as part of `npm run build`)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const ORIGIN = 'https://www.allmetalbrake.com';
const HOST_NAME = 'allmetalbrake.com';
const SITE_NAME = 'Home Fix Reviews';
const FULL_INTRO = path.join(ROOT, 'src/data/llms-full-intro.md');
const LLMS_SOURCE = path.join(ROOT, 'src/data/llms.md');

// Non-page files the hand-written sources may link to besides sitemap URLs.
const EXTRA_ALLOWED = new Set([
  `${ORIGIN}/llms.txt`,
  `${ORIGIN}/llms-full.txt`,
  `${ORIGIN}/sitemap-index.xml`,
]);

// Index categories, in output order. The first matching rule wins; `test`
// receives the URL pathname and the cleaned page title.
const CATEGORIES = [
  {
    name: 'Hubs',
    test: (p) => ['/', '/best-lists/', '/guides/', '/compare/'].includes(p),
  },
  {
    name: 'About & Policies',
    test: (p) => ['/about/', '/contact/', '/affiliate-disclosure/', '/privacy/', '/terms/'].includes(p),
  },
  { name: 'Brand & Product Reviews', test: (p) => /^\/reviews\/|-review\/$/.test(p) },
  { name: 'Comparisons', test: (p) => /-vs-/.test(p) },
  { name: 'Buying Guides & Best Lists', test: (p, t) => /^\/best-/.test(p) && !/^Wrong Page/i.test(t) },
  { name: 'Cost Guides', test: (p, t) => /[/-]cost[-/]/.test(p) || /\bCosts? \(|\bPrices\)/.test(t) },
  { name: 'How-To Guides', test: (p) => /^\/how-to-/.test(p) },
  {
    name: 'Answers & Troubleshooting',
    test: (p) =>
      /^\/(how-|what-|when-|which-|why-|can-|do-|rain-|types-)/.test(p) ||
      /(peeling|drying-time|pros-and-cons|alternatives|efflorescence|hydrostatic|disadvantages|flake)/.test(p),
  },
  { name: 'Other Pages', test: () => true },
];

function fail(msg) {
  console.error(`\n✖ generate-llms: ${msg}\n`);
  process.exit(1);
}

function read(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    fail(`cannot read ${path.relative(ROOT, file)} — run \`astro build\` first?`);
  }
}

function decodeEntities(s) {
  const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', mdash: '—', ndash: '–', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', hellip: '…' };
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-z]+);/gi, (m, n) => named[n.toLowerCase()] ?? m);
}

function stripComments(md) {
  return md.replace(/<!--[\s\S]*?-->\n?/g, '').replace(/^\s+/, '');
}

// --- Sitemap ----------------------------------------------------------------
function sitemapUrls() {
  const index = read(path.join(DIST, 'sitemap-index.xml'));
  const children = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  if (!children.length) fail('sitemap-index.xml lists no child sitemaps');
  const urls = [];
  for (const child of children) {
    const xml = read(path.join(DIST, path.basename(new URL(child).pathname)));
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) urls.push(decodeEntities(m[1].trim()));
  }
  const unique = [...new Set(urls)];
  if (unique.length !== urls.length) fail('the sitemap lists a URL more than once');
  if (!unique.length) fail('the sitemap lists no URLs');
  return unique;
}

// --- Titles -----------------------------------------------------------------
function htmlFileFor(url) {
  const p = decodeURIComponent(new URL(url).pathname);
  return p.endsWith('/') ? path.join(DIST, p, 'index.html') : path.join(DIST, `${p}.html`);
}

function cleanTitle(raw) {
  const t = decodeEntities(raw.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
  const suffix = new RegExp(`\\s+[|—–-]\\s+${SITE_NAME}$`, 'i');
  return t.replace(suffix, '').trim();
}

function titleFor(url) {
  let html;
  try {
    html = fs.readFileSync(htmlFileFor(url), 'utf8');
  } catch {
    return '';
  }
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return m ? cleanTitle(m[1]) : '';
}

const mdText = (s) => s.replace(/([\\[\]])/g, '\\$1');

// --- Validation gate --------------------------------------------------------
function validateLinks(text, file, known) {
  const re = new RegExp(`https?://(?:[a-z0-9-]+\\.)*${HOST_NAME.replace('.', '\\.')}[^\\s\`)\\]>"'*,]*`, 'gi');
  const bad = [];
  for (const m of text.matchAll(re)) {
    const raw = m[0].replace(/[.:;]+$/, '');
    const url = raw.replace(/#.*$/, '');
    if (known.has(url) || EXTRA_ALLOWED.has(url)) continue;
    let hint = 'not in the built sitemap';
    let alt = `${ORIGIN}${new URL(url).pathname}`;
    if (!alt.endsWith('/') && !/\.[a-z0-9]+$/i.test(alt)) alt += '/';
    if (alt !== url && known.has(alt)) hint = `not canonical — use ${alt}`;
    bad.push(`  ${raw}  (${hint})`);
  }
  if (bad.length) {
    fail(`${path.relative(ROOT, file)} links to URLs that don't exist on the built site:\n${bad.join('\n')}`);
  }
}

// --- Build ------------------------------------------------------------------
const urls = sitemapUrls();
const known = new Set(urls);
const domain = new URL(ORIGIN).hostname.replace(/^www\./, '');

const pages = urls.map((url) => ({ url, path: new URL(url).pathname, title: titleFor(url) }));
const titles = new Map(pages.map((p) => [p.url, p.title]));

const groups = CATEGORIES.map((c) => ({ name: c.name, items: [] }));
for (const page of pages) {
  const i = CATEGORIES.findIndex((c) => c.test(page.path, page.title));
  groups[i].items.push(page);
}

const sortKey = (p) => (p.title || p.url).toLowerCase();
let indexBlock = '<!-- GENERATED:URL-INDEX — do not edit by hand, see scripts/generate-llms.mjs -->\n\n';
indexBlock += '## Complete URL Index\n\n';
indexBlock += `Every indexable page on ${domain} (${urls.length} URLs), generated from the sitemap.\n`;
for (const g of groups) {
  if (!g.items.length) continue;
  g.items.sort((a, b) => sortKey(a).localeCompare(sortKey(b), 'en'));
  indexBlock += `\n### ${g.name} (${g.items.length})\n\n`;
  for (const p of g.items) indexBlock += p.title ? `- [${mdText(p.title)}](${p.url})\n` : `- ${p.url}\n`;
}
indexBlock += '\n<!-- /GENERATED:URL-INDEX -->\n';

const listed = groups.reduce((n, g) => n + g.items.length, 0);
if (listed !== urls.length) fail(`index lists ${listed} URLs but the sitemap has ${urls.length}`);

// llms-full.txt
const fullSource = read(FULL_INTRO);
if (fullSource.includes('GENERATED:URL-INDEX')) {
  fail(`${path.relative(ROOT, FULL_INTRO)} must not contain the generated URL index; it is appended at build time`);
}
const intro = stripComments(fullSource).trimEnd();
validateLinks(intro, FULL_INTRO, known);
const full = `${intro}\n\n${indexBlock}`;
fs.writeFileSync(path.join(DIST, 'llms-full.txt'), full, 'utf8');

// llms.txt
const llmsSource = stripComments(read(LLMS_SOURCE));
validateLinks(llmsSource, LLMS_SOURCE, known);
const llms = llmsSource
  .replace(/\{\{PAGE_COUNT\}\}/g, String(urls.length))
  .replace(/^- (https:\/\/\S+?)(?::\s+(.*))?$/gm, (line, url, note) => {
    const title = titles.get(url);
    if (!title) return line;
    return `- [${mdText(title)}](${url})${note ? `: ${note}` : ''}`;
  })
  .trimEnd() + '\n';
fs.writeFileSync(path.join(DIST, 'llms.txt'), llms, 'utf8');

console.log(`generate-llms: wrote llms-full.txt (${urls.length} URLs in ${groups.filter((g) => g.items.length).length} groups) and llms.txt`);
for (const g of groups) if (g.items.length) console.log(`  ${g.name}: ${g.items.length}`);
