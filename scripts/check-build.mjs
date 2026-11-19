// Post-build SEO/link audit: broken internal links, JSON-LD validity, titles, descriptions, H1s.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
const files = [];
(function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') && files.push(p); } })(DIST);

const broken = new Map(); const titles = new Map(); const descs = new Map(); const problems = [];
const exists = (path) => {
  const clean = decodeURIComponent(path.split('#')[0].split('?')[0]);
  if (!clean || clean === '/') return true;
  const p = join(DIST, clean);
  return existsSync(p) && (statSync(p).isFile() || existsSync(join(p, 'index.html')));
};

for (const f of files) {
  const html = readFileSync(f, 'utf8');
  const page = '/' + relative(DIST, f).replace(/index\.html$/, '');
  if (page.startsWith('/404')) continue;
  for (const m of html.matchAll(/href="(\/[^"]*)"/g)) {
    const href = m[1].replace(/&amp;/g, '&');
    if (href.startsWith('//')) continue;
    if (!exists(href)) { if (!broken.has(href)) broken.set(href, new Set()); broken.get(href).add(page); }
  }
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch (e) { problems.push(`Invalid JSON-LD on ${page}: ${e.message}`); }
  }
  const title = (html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '').replace(/&amp;/g, '&').replace(/&#39;/g, "'");
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
  const h1s = (html.match(/<h1[\s>]/g) || []).length;
  if (!title) problems.push(`Missing <title> on ${page}`);
  if (!desc) problems.push(`Missing meta description on ${page}`);
  if (h1s !== 1) problems.push(`${h1s} H1 tags on ${page}`);
  if (title.length > 70) problems.push(`Long title (${title.length}) on ${page}: ${title}`);
  titles.set(title, [...(titles.get(title) ?? []), page]);
  descs.set(desc, [...(descs.get(desc) ?? []), page]);
}
for (const [t, pages] of titles) if (pages.length > 1) problems.push(`Duplicate title "${t}" on ${pages.join(', ')}`);
for (const [d, pages] of descs) if (pages.length > 1) problems.push(`Duplicate description on ${pages.join(', ')}`);

console.log(`\nAudited ${files.length} HTML pages.`);
if (problems.length) { console.log(`\n${problems.length} warnings:`); problems.slice(0, 80).forEach((p) => console.log('  - ' + p)); }
if (broken.size) {
  console.log(`\n${broken.size} broken internal link targets:`);
  for (const [href, pages] of broken) console.log(`  ✗ ${href}  ← ${[...pages].slice(0, 4).join(', ')}${pages.size > 4 ? ` (+${pages.size - 4})` : ''}`);
  process.exit(1);
}
console.log('No broken internal links.');
