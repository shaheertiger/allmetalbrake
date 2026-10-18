#!/usr/bin/env node
/**
 * Search-engine metadata for allmetalbrake.com.
 *
 * Writes a generated block into the <head> of every page, between
 * `<!-- seo:start -->` and `<!-- seo:end -->`: canonical URL, robots
 * directives, favicons, Open Graph / Twitter cards, and JSON-LD structured
 * data (Organization, WebSite, Article, BreadcrumbList, FAQPage). It also keeps
 * the sitemap's <lastmod> values in step with each page's dateModified.
 *
 * Tuned for Bing, which supplies most of DuckDuckGo's web results.
 *
 * Usage:
 *   node tools/seo.js                 # regenerate every page (idempotent)
 *   node tools/seo.js --touch a.html  # also mark a.html as modified today
 *
 * Titles and meta descriptions are written by hand in each page. Keep titles
 * at 60 characters or fewer and descriptions at 110-160 so Bing shows them in
 * full; build.js warns when they drift.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { decodeEntities, textOf, divsByClass } = require('./html-utils');

const ROOT = path.resolve(__dirname, '..');
const CONFIG = JSON.parse(fs.readFileSync(path.join(ROOT, 'build.config.json'), 'utf8'));
const ORIGIN = CONFIG.siteOrigin;
const SITE_NAME = 'Home Fix Reviews';
const OG_IMAGE = `${ORIGIN}/img/og-default.png`;
const LOGO = `${ORIGIN}/img/icon-512.png`;
const NOINDEX = new Set(CONFIG.noindex || []);
const HUBS = new Set(['best-lists.html', 'guides.html', 'compare.html']);

const START = '<!-- seo:start -->';
const END = '<!-- seo:end -->';

const touchIdx = process.argv.indexOf('--touch');
const touched = new Set(touchIdx > -1 ? process.argv.slice(touchIdx + 1) : []);
const today = new Date().toISOString().slice(0, 10);

const pages = fs.readdirSync(ROOT).filter((n) => n.endsWith('.html'))
  .concat(fs.existsSync(path.join(ROOT, 'reviews'))
    ? fs.readdirSync(path.join(ROOT, 'reviews')).filter((n) => n.endsWith('.html')).map((n) => `reviews/${n}`)
    : [])
  .sort();

const urlFor = (rel) => (rel === 'index.html' ? `${ORIGIN}/` : `${ORIGIN}/${rel}`);
const attr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function gitDate(rel, first) {
  try {
    const args = ['log', '--format=%cs', '--', rel];
    if (!first) args.splice(1, 0, '-1');
    const out = execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
    return first ? out[out.length - 1] : out[0];
  } catch {
    return undefined;
  }
}

/** Keep dates from a previous run so regenerating never fakes a freshness bump. */
function previousDates(html) {
  const block = html.slice(html.indexOf(START), html.indexOf(END));
  const pub = /"datePublished":\s*"([^"]+)"/.exec(block);
  const mod = /"dateModified":\s*"([^"]+)"/.exec(block);
  return { published: pub && pub[1], modified: mod && mod[1] };
}

function faqs(html) {
  const items = [];
  for (const item of divsByClass(html, 'faq-item')) {
    const q = divsByClass(item, 'faq-question')[0];
    const a = divsByClass(item, 'faq-answer')[0];
    if (q && a) items.push({ q: textOf(q), a: textOf(a) });
  }
  return items.filter((f) => f.q && f.a);
}

function build(rel, html) {
  const url = urlFor(rel);
  const prefix = rel.includes('/') ? '../' : '';
  const title = decodeEntities((/<title>([\s\S]*?)<\/title>/i.exec(html) || [])[1] || '').trim();
  const desc = decodeEntities((/<meta\s+name=["']description["']\s+content="([^"]*)"/i.exec(html) || [])[1] || '').trim();
  const h1 = textOf((/<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html) || [])[1] || title);
  const author = textOf((/class="author-name">([^<]*)</.exec(html) || [])[1] || '');
  const isArticle = /class=["'][^"']*\barticle-content\b/.test(html) && !CONFIG.nonArticles.includes(rel);
  const isHome = rel === 'index.html';
  const noindex = NOINDEX.has(rel);

  const prev = previousDates(html);
  const published = prev.published || gitDate(rel, true) || today;
  const modified = touched.has(rel) ? today : (prev.modified || gitDate(rel, false) || today);

  const org = {
    '@type': 'Organization',
    '@id': `${ORIGIN}/#organization`,
    name: SITE_NAME,
    url: `${ORIGIN}/`,
    logo: { '@type': 'ImageObject', url: LOGO, width: 512, height: 512 },
  };
  const website = {
    '@type': 'WebSite',
    '@id': `${ORIGIN}/#website`,
    url: `${ORIGIN}/`,
    name: SITE_NAME,
    inLanguage: 'en-US',
    publisher: { '@id': `${ORIGIN}/#organization` },
  };
  const graph = [org, website];

  const webpage = {
    '@type': HUBS.has(rel) ? 'CollectionPage' : rel === 'about.html' ? 'AboutPage' : rel === 'contact.html' ? 'ContactPage' : 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: title,
    description: desc,
    inLanguage: 'en-US',
    isPartOf: { '@id': `${ORIGIN}/#website` },
    primaryImageOfPage: { '@type': 'ImageObject', url: OG_IMAGE },
    datePublished: published,
    dateModified: modified,
  };
  if (!isHome) webpage.breadcrumb = { '@id': `${url}#breadcrumb` };
  graph.push(webpage);

  if (!isHome) {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/` },
        { '@type': 'ListItem', position: 2, name: h1, item: url },
      ],
    });
  }

  if (isArticle) {
    graph.push({
      '@type': 'Article',
      '@id': `${url}#article`,
      headline: h1.length > 110 ? title : h1,
      description: desc,
      image: [OG_IMAGE],
      datePublished: published,
      dateModified: modified,
      author: author ? { '@type': 'Person', name: author } : { '@id': `${ORIGIN}/#organization` },
      publisher: { '@id': `${ORIGIN}/#organization` },
      mainEntityOfPage: { '@id': `${url}#webpage` },
      isPartOf: { '@id': `${ORIGIN}/#website` },
      inLanguage: 'en-US',
    });
  }

  const faq = isArticle ? faqs(html) : [];
  if (faq.length) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      isPartOf: { '@id': `${url}#webpage` },
      mainEntity: faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
  }

  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2)
    .replace(/</g, '\\u003c')
    .split('\n').map((l) => `  ${l}`).join('\n');

  const robots = noindex
    ? 'noindex, follow'
    : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';

  const lines = [
    START,
    `<link rel="canonical" href="${url}" />`,
    `<meta name="robots" content="${robots}" />`,
    `<meta name="author" content="${attr(author || SITE_NAME)}" />`,
    `<meta name="theme-color" content="#e94f1b" />`,
    `<link rel="icon" href="${prefix}favicon.ico" sizes="any" />`,
    `<link rel="icon" href="${prefix}favicon.svg" type="image/svg+xml" />`,
    `<link rel="apple-touch-icon" href="${prefix}apple-touch-icon.png" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta property="og:type" content="${isArticle ? 'article' : 'website'}" />`,
    `<meta property="og:title" content="${attr(title)}" />`,
    `<meta property="og:description" content="${attr(desc)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${OG_IMAGE}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${SITE_NAME}" />`,
  ];
  if (isArticle) {
    lines.push(
      `<meta property="article:published_time" content="${published}" />`,
      `<meta property="article:modified_time" content="${modified}" />`
    );
  }
  lines.push(
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${attr(title)}" />`,
    `<meta name="twitter:description" content="${attr(desc)}" />`,
    `<meta name="twitter:image" content="${OG_IMAGE}" />`,
    `<script type="application/ld+json">\n${json}\n  </script>`,
    END
  );
  return { block: lines.map((l, i) => (i === 0 ? l : `  ${l}`)).join('\n'), modified, noindex };
}

const lastmods = new Map();
let changed = 0;

for (const rel of pages) {
  const file = path.join(ROOT, rel);
  let html = fs.readFileSync(file, 'utf8');
  if (!/<head[\s>]/i.test(html)) continue;

  const { block, modified, noindex } = build(rel, html);
  if (!noindex) lastmods.set(urlFor(rel), modified);

  let next;
  if (html.includes(START) && html.includes(END)) {
    next = html.slice(0, html.indexOf(START)) + block + html.slice(html.indexOf(END) + END.length);
  } else {
    // Directly after the meta description, so title + description + block sit together.
    const desc = /<meta\s+name=["']description["'][^>]*>/i.exec(html);
    const at = desc ? desc.index + desc[0].length : html.search(/<\/head>/i);
    next = `${html.slice(0, at)}\n  ${block}${html.slice(at)}`;
  }
  next = next.replace(/<html lang="en">/i, '<html lang="en-US">');

  if (next !== html) {
    fs.writeFileSync(file, next);
    changed++;
  }
}

/* Sitemap: lastmod follows each page's dateModified. */
const sitemapPath = path.join(ROOT, CONFIG.sitemap);
if (fs.existsSync(sitemapPath)) {
  const xml = fs.readFileSync(sitemapPath, 'utf8');
  const next = xml.replace(
    /(<loc>\s*([^<\s]+)\s*<\/loc>\s*<lastmod>)[^<]*(<\/lastmod>)/g,
    (m, a, loc, b) => (lastmods.has(loc) ? `${a}${lastmods.get(loc)}${b}` : m)
  );
  if (next !== xml) fs.writeFileSync(sitemapPath, next);
}

console.log(`seo: ${pages.length} page(s) scanned, ${changed} updated.`);
