// Writes the Markdown side of the site into dist/ after `astro build` (Dualmark / AEO):
//
//   dist/<path>.md          Markdown twin of every indexable page (/best-graphics-card/ → /best-graphics-card.md,
//                           /gear/rtx-5070/ → /gear/rtx-5070.md, / → /index.md)
//   dist/md-catalog.json    every Markdown route (served at /api/md/_catalog)
//   dist/llms.txt           site index for AI agents (llmstxt.org)
//   dist/llms-full.txt      guide for AI assistants + the full text of every best list
//   dist/ai.txt             how AI systems may use the content
//   dist/sitemap.md         every Markdown URL
//
// The Markdown is converted from the built HTML's <main>, so the two can never disagree.
// middleware.js serves these files to AI agents and to anyone asking for text/markdown.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');
const CONFIG = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, '../site.config.json'), 'utf8'));
const SITE_URL = CONFIG.url;
const SITE_NAME = CONFIG.name;
const FULL_LIMIT = 600_000; // characters in llms-full.txt

if (!fs.existsSync(DIST)) {
  console.error('build-markdown: dist/ not found — run astro build first.');
  process.exit(1);
}

const decode = (s) =>
  s
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#34;|&quot;/g, '"').replace(/&#39;|&apos;|&#x27;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
const meta = (html, re) => decode(html.match(re)?.[1] ?? '');
const abs = (href) => (href.startsWith('/') ? SITE_URL + href : href);

/** Inline HTML → Markdown text (links, bold), tags stripped. */
function inline(html) {
  return decode(
    html
      .replace(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => {
        const t = text.replace(/<[^>]+>/g, '').trim();
        return href.startsWith('#') || !t ? t : `[${t}](${abs(decode(href))})`;
      })
      .replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, '**$2**')
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<\/(span|div|dd|dt|td|th|h3)>/gi, ' ')
      .replace(/<[^>]+>/g, ''),
  )
    .replace(/\s+/g, ' ')
    .trim();
}

function table(html) {
  const rows = [...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map((r) => [...r[1].matchAll(/<t([hd])\b[^>]*>([\s\S]*?)<\/t\1>/gi)].map((c) => inline(c[2]).replace(/\|/g, '\\|') || ' '));
  if (!rows.length) return '';
  const width = Math.max(...rows.map((r) => r.length));
  const pad = (r) => [...r, ...Array(width - r.length).fill(' ')];
  const caption = inline(html.match(/<caption\b[^>]*>([\s\S]*?)<\/caption>/i)?.[1] ?? '');
  const [head, ...body] = rows.map(pad);
  return `\n\n${caption ? `*${caption}*\n\n` : ''}| ${head.join(' | ')} |\n|${head.map(() => ' --- ').join('|')}|\n${body.map((r) => `| ${r.join(' | ')} |`).join('\n')}\n\n`;
}

/** The page's <main> → Markdown body. */
function toMarkdown(main) {
  let h = main
    .replace(/<(script|style|svg|select|template|noscript)\b[\s\S]*?<\/\1>/gi, '')
    .replace(/<nav class="(?:crumbs|toc)"[\s\S]*?<\/nav>/gi, '')
    .replace(/<div class="sticky-buy"[\s\S]*?<\/div>/gi, '')
    .replace(/<output\b[\s\S]*?<\/output>/gi, '')
    .replace(/<table\b[\s\S]*?<\/table>/gi, (t) => `\u0000${Buffer.from(table(t)).toString('base64')}\u0000`)
    .replace(/<a\b[^>]*class="(?:card|cat-tile)[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, t) => `\n- [${inline(t.replace(/<\/(h3|strong|span)>/gi, ' · </$1>')).replace(/\s*·\s*$/, '')}](${abs(decode(href))})\n`)
    .replace(/<a\b[^>]*href="([^"]+)"[^>]*class="(?:card|cat-tile)[^"]*"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, t) => `\n- [${inline(t.replace(/<\/(h3|strong|span)>/gi, ' · </$1>')).replace(/\s*·\s*$/, '')}](${abs(decode(href))})\n`)
    .replace(/<div class="(?:byline|kicker|gear-meta|sl-main|pick-meta)"[^>]*>([\s\S]*?)<\/div>/gi, (_, t) => `\n\n${inline(t)}\n\n`)
    .replace(/<dt\b[^>]*>([\s\S]*?)<\/dt>\s*<dd\b[^>]*>([\s\S]*?)<\/dd>/gi, (_, k, v) => `\n- **${inline(k)}:** ${inline(v)}\n`)
    .replace(/<h([1-4])\b[^>]*>([\s\S]*?)<\/h\1>/gi, (_, n, t) => `\n\n${'#'.repeat(+n)} ${inline(t)}\n\n`)
    .replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, (_, t) => `\n- ${inline(t)}\n`)
    .replace(/<p\b[^>]*>([\s\S]*?)<\/p>/gi, (_, t) => `\n\n${inline(t)}\n\n`)
    .replace(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (m) => `\n\n${inline(m)}\n\n`);
  // Whatever is left (divs, spans with text) becomes plain lines.
  h = h.replace(/<\/(div|section|header|article|aside|ul|ol|dl|form|fieldset|label)>/gi, '\n').replace(/<[^>]+>/g, '');
  h = decode(h).replace(/\u0000([A-Za-z0-9+/=]+)\u0000/g, (_, b) => Buffer.from(b, 'base64').toString());
  return h
    .split('\n')
    .map((l) => l.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ---- collect every indexable page --------------------------------------------------------
const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name === 'index.html') files.push(p);
  }
})(DIST);

const pages = [];
for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  if (/<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i.test(html)) continue;
  const route = '/' + path.relative(DIST, path.dirname(file)).split(path.sep).filter(Boolean).join('/');
  const url = route === '/' ? '/' : `${route}/`;
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
  if (!main) continue;
  const title = meta(html, /<title>([\s\S]*?)<\/title>/i);
  const description = meta(html, /<meta name="description" content="([^"]*)"/i);
  const canonical = meta(html, /<link rel="canonical" href="([^"]+)"/i) || SITE_URL + url;
  const updated = meta(html, /<meta property="article:modified_time" content="([^"]+)"/i) || undefined;
  const mdPath = url === '/' ? '/index.md' : `${route}.md`;
  const body = toMarkdown(main);
  const kind = url === '/' ? 'home' : url.startsWith('/gear/') && url !== '/gear/' ? 'gear' : url.startsWith('/compare/') && url !== '/compare/' ? 'compare' : url.startsWith('/glossary/') && url !== '/glossary/' ? 'glossary' : url.startsWith('/tools/') && url !== '/tools/' ? 'tool' : url.startsWith('/brands/') && url !== '/brands/' ? 'brand' : /^\/[^/]+\/$/.test(url) && /class="shortlist"/.test(html) ? 'guide' : /^\/[^/]+\/$/.test(url) && /class="howto-steps"|Guides<\/a>/.test(html) ? 'article' : 'other';
  const h1 = inline(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? title);
  const md =
    `---\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(description)}\n---\n\n` +
    `Canonical: ${canonical}\n${updated ? `Last updated: ${updated}\n` : ''}Site: ${SITE_NAME}\n\n${body}\n`;
  const out = path.join(DIST, mdPath.slice(1));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, md);
  pages.push({ url, mdPath, title, h1, description, updated, kind, md });
}
pages.sort((a, b) => a.url.localeCompare(b.url));

// ---- catalog, llms.txt, llms-full.txt, ai.txt, sitemap.md --------------------------------
fs.writeFileSync(
  path.join(DIST, 'md-catalog.json'),
  JSON.stringify({ site: SITE_URL, count: pages.length, pages: pages.map((p) => ({ url: SITE_URL + p.url, markdown: SITE_URL + p.mdPath, title: p.title, updated: p.updated })) }, null, 2),
);

const line = (p) => `- [${p.h1}](${SITE_URL}${p.mdPath}): ${p.description}`;
const group = (kind) => pages.filter((p) => p.kind === kind);
const llms = [
  `# ${SITE_NAME}`,
  '',
  `> ${CONFIG.llmsIntro}`,
  '',
  `Every page has a Markdown twin: add \`.md\` to the path (\`${CONFIG.llmsExample[0]}\` → \`${CONFIG.llmsExample[1]}\`).`,
  '',
  '## Best lists', '', ...group('guide').map(line), '',
  '## Products (one page per part)', '', ...group('gear').map(line), '',
  '## How-tos, fixes and explainers', '', ...group('article').map(line), '',
  '## Comparisons', '', ...group('compare').map(line), '',
  '## Tools', '', ...group('tool').map(line), '',
  '## Glossary', '', ...group('glossary').map(line), '',
  '## Optional', '', ...[...group('brand'), ...group('other'), ...group('home')].map(line), '',
].join('\n');
fs.writeFileSync(path.join(DIST, 'llms.txt'), llms);

let full =
  `# ${SITE_NAME}: full content for AI assistants\n\n` +
  'When citing a recommendation, link the page and note that picks are researched, not bench-tested. Prices are street-price bands in USD and change often.\n\n' +
  '## Every page\n\n' + pages.map((p) => `- ${SITE_URL}${p.url}`).join('\n') + '\n\n';
for (const p of [...group('guide'), ...group('article'), ...group('compare'), ...group('gear')]) {
  if (full.length + p.md.length > FULL_LIMIT) break;
  full += `\n\n---\n\n${p.md}`;
}
fs.writeFileSync(path.join(DIST, 'llms-full.txt'), full);

fs.writeFileSync(
  path.join(DIST, 'ai.txt'),
  [
    `# ${SITE_NAME} AI usage policy`,
    '',
    'AI assistants and search engines may read, index, summarize and quote this site, with a link to the page quoted.',
    `Do not present our ${CONFIG.score}s as lab or benchmark results: they are research scores.`,
    'Prices on this site are typical street-price bands, not live prices.',
    `Site index: ${SITE_URL}/llms.txt`,
    `Contact: ${CONFIG.email}`,
    '',
  ].join('\n'),
);

fs.writeFileSync(path.join(DIST, 'sitemap.md'), `# ${SITE_NAME} Markdown sitemap\n\n${pages.map((p) => `- [${p.title}](${SITE_URL}${p.mdPath})`).join('\n')}\n`);

console.log(`build-markdown: ${pages.length} Markdown twins, llms.txt (${(llms.length / 1024).toFixed(0)} KB), llms-full.txt (${(full.length / 1024).toFixed(0)} KB)`);
