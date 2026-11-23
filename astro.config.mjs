// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readFileSync, readdirSync } from 'node:fs';

const SITE = 'https://www.allmetalbrake.com';
/** Date of the last site-wide content refresh (product data, compares, brand pages). */
const CONTENT_UPDATED = '2026-11-19';

// ---- Content read at build time, for sitemap dates, priorities and image entries ----
const readJson = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const products = readdirSync(new URL('./src/content/products/', import.meta.url)).flatMap((f) => readJson(`./src/content/products/${f}`));
const articles = readdirSync(new URL('./src/content/articles/', import.meta.url)).map((f) => readJson(`./src/content/articles/${f}`));
const images = readJson('./src/data/product-images.json');
const imageId = (url) => url?.match(/\/images\/I\/([^._/]+)\./)?.[1];
const productImage = (slug) => (imageId(images[slug]) ? { url: `https://m.media-amazon.com/images/I/${imageId(images[slug])}._SL500_.jpg` } : null);
const slugify = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const articleBySlug = new Map(articles.map((a) => [a.slug, a]));
const productBySlug = new Map(products.map((p) => [p.slug, p]));

// Highest-volume roundups (Bing data, docs/bing-playbook.md): crawl these first.
const pillars = new Set([
  'best-home-generator-for-power-outages', 'best-portable-power-station', 'best-inverter-generator',
  'best-dual-fuel-generator', 'best-home-battery-backup', 'generac-generator-cost',
]);
const hubs = new Set(['best-of', 'gear', 'brands', 'compare', 'reviews', 'guides', 'glossary']);
const legal = new Set(['privacy-policy', 'affiliate-disclosure', 'contact', 'editorial-policy']);

/** Image entries for a URL path, so Google Images can index the product photos. */
function imagesFor(path) {
  const parts = path.split('/').filter(Boolean);
  if (parts[0] === 'gear' && parts[1]) return [productImage(parts[1])].filter(Boolean);
  if (parts[0] === 'compare' && parts[1]) {
    return products.filter((p) => parts[1].startsWith(p.slug + '-vs-') || parts[1].endsWith('-vs-' + p.slug)).map((p) => productImage(p.slug)).filter(Boolean);
  }
  if (parts[0] === 'brands' && parts[1]) return products.filter((p) => slugify(p.brand) === parts[1]).map((p) => productImage(p.slug)).filter(Boolean);
  const a = parts.length === 1 ? articleBySlug.get(parts[0]) : undefined;
  if (a?.picks) return a.picks.map((pk) => productImage(pk.product)).filter(Boolean);
  return [];
}

/** One sitemap per template, so Search Console reports indexing per page type. */
const chunkFor = (prefix) => (item) => (new URL(item.url).pathname.startsWith(prefix) ? item : undefined);

export default defineConfig({
  site: SITE,
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'always' },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
      chunks: {
        gear: chunkFor('/gear/'),
        compare: chunkFor('/compare/'),
        brands: chunkFor('/brands/'),
        glossary: chunkFor('/glossary/'),
      },
      serialize(item) {
        const path = new URL(item.url).pathname;
        const slug = path.replace(/^\/|\/$/g, '');
        const top = slug.split('/')[0];
        const article = articleBySlug.get(slug);

        item.lastmod = new Date((article?.updated ?? CONTENT_UPDATED) + 'T12:00:00Z').toISOString();
        if (slug === '') { item.priority = 1.0; item.changefreq = 'daily'; }
        else if (pillars.has(slug)) { item.priority = 0.9; item.changefreq = 'weekly'; }
        else if (article) { item.priority = 0.8; item.changefreq = 'weekly'; }
        else if (hubs.has(slug)) { item.priority = 0.8; item.changefreq = 'weekly'; }
        else if (top === 'tools') { item.priority = 0.7; item.changefreq = 'monthly'; }
        else if (top === 'gear' && productBySlug.has(slug.split('/')[1])) { item.priority = 0.6; item.changefreq = 'monthly'; }
        else if (top === 'brands') { item.priority = 0.6; item.changefreq = 'monthly'; }
        else if (top === 'compare' || top === 'glossary') { item.priority = 0.5; item.changefreq = 'monthly'; }
        else if (legal.has(slug)) { item.priority = 0.3; item.changefreq = 'yearly'; }
        else { item.priority = 0.5; item.changefreq = 'monthly'; }

        const img = imagesFor(path);
        // sitemap.js writes `img` as <image:image> entries.
        if (img.length) /** @type {any} */ (item).img = img;
        return item;
      },
    }),
  ],
});
