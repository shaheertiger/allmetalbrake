// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const SITE = 'https://www.allmetalbrake.com';
const LASTMOD = '2026-05-26';

// Per-page sitemap priorities / change frequencies, keyed by URL pathname.
// Mirrors the hand-maintained sitemap that shipped with the static site.
const SITEMAP_META = {
  '/': { changefreq: 'weekly', priority: 1.0 },
  '/best-lists.html': { changefreq: 'weekly', priority: 0.9 },
  '/guides.html': { changefreq: 'weekly', priority: 0.9 },
  '/compare.html': { changefreq: 'monthly', priority: 0.8 },
  '/about.html': { changefreq: 'monthly', priority: 0.5 },
  '/contact.html': { changefreq: 'yearly', priority: 0.4 },
  '/affiliate-disclosure.html': { changefreq: 'yearly', priority: 0.3 },
  '/privacy.html': { changefreq: 'yearly', priority: 0.3 },
  '/terms.html': { changefreq: 'yearly', priority: 0.3 },
  '/best-asphalt-driveway-sealer-reviews.html': { changefreq: 'monthly', priority: 0.9 },
  '/best-driveway-sealer.html': { changefreq: 'monthly', priority: 0.9 },
  '/when-should-you-seal-a-new-asphalt-driveway.html': { changefreq: 'monthly', priority: 0.8 },
  '/how-much-does-it-cost-to-seal-a-driveway.html': { changefreq: 'monthly', priority: 0.8 },
  '/how-to-remove-moss-from-asphalt-driveway.html': { changefreq: 'monthly', priority: 0.7 },
  '/how-to-seal-a-concrete-driveway.html': { changefreq: 'monthly', priority: 0.8 },
  '/how-to-remove-oil-stains-from-driveway.html': { changefreq: 'monthly', priority: 0.7 },
  '/how-long-for-driveway-sealer-to-dry.html': { changefreq: 'monthly', priority: 0.7 },
  '/latex-ite-driveway-sealer-review.html': { changefreq: 'monthly', priority: 0.8 },
  '/best-stamped-concrete-sealer.html': { changefreq: 'monthly', priority: 0.8 },
  '/how-to-stain-concrete-patio-to-look-like-stone.html': { changefreq: 'monthly', priority: 0.7 },
  '/best-deck-stain-reviews.html': { changefreq: 'monthly', priority: 0.9 },
  '/best-deck-stain-for-pressure-treated-wood.html': { changefreq: 'monthly', priority: 0.8 },
  '/best-redwood-sealer.html': { changefreq: 'monthly', priority: 0.8 },
  '/best-garage-floor-epoxy.html': { changefreq: 'monthly', priority: 0.9 },
  '/best-garage-floor-coating.html': { changefreq: 'monthly', priority: 0.8 },
  '/best-basement-wall-sealer.html': { changefreq: 'monthly', priority: 0.8 },
  '/best-cinder-block-sealer-reviews.html': { changefreq: 'monthly', priority: 0.8 },
  '/best-granite-sealer.html': { changefreq: 'monthly', priority: 0.8 },
  '/best-marble-sealer.html': { changefreq: 'monthly', priority: 0.8 },
  '/best-polymeric-sand-for-pavers.html': { changefreq: 'monthly', priority: 0.8 },
  '/best-water-based-paver-sealer-reviews.html': { changefreq: 'monthly', priority: 0.8 },
  '/how-to-use-polymeric-sand.html': { changefreq: 'monthly', priority: 0.7 },
  '/ryobi-tools-review.html': { changefreq: 'monthly', priority: 0.8 },
  '/milwaukee-vs-dewalt.html': { changefreq: 'monthly', priority: 0.8 },
};

export default defineConfig({
  site: SITE,
  build: {
    // Emit `about.html` instead of `about/index.html` so the original
    // `*.html` internal links continue to resolve.
    format: 'file',
  },
  server: {
    port: 3000,
    host: true,
  },
  integrations: [
    sitemap({
      serialize(item) {
        const url = new URL(item.url);
        // The static build emits `*.html` files, so normalize the canonical
        // sitemap URLs to match (the homepage stays `/`).
        let pathname = url.pathname.replace(/\/$/, '') || '/';
        if (pathname !== '/' && !pathname.endsWith('.html')) {
          pathname += '.html';
          url.pathname = pathname;
          item.url = url.toString();
        }
        const meta = SITEMAP_META[pathname];
        if (meta) {
          item.changefreq = meta.changefreq;
          item.priority = meta.priority;
        }
        item.lastmod = LASTMOD;
        return item;
      },
    }),
  ],
});
