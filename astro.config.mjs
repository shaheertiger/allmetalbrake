// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const SITE = 'https://www.allmetalbrake.com';
const LASTMOD = '2026-06-04';

// Per-page sitemap priorities / change frequencies, keyed by URL pathname
// (trailing-slash directory URLs).
const SITEMAP_META = {
  '/': { changefreq: 'weekly', priority: 1.0 },
  '/best-lists/': { changefreq: 'weekly', priority: 0.9 },
  '/guides/': { changefreq: 'weekly', priority: 0.9 },
  '/compare/': { changefreq: 'monthly', priority: 0.8 },
  '/about/': { changefreq: 'monthly', priority: 0.5 },
  '/contact/': { changefreq: 'yearly', priority: 0.4 },
  '/affiliate-disclosure/': { changefreq: 'yearly', priority: 0.3 },
  '/privacy/': { changefreq: 'yearly', priority: 0.3 },
  '/terms/': { changefreq: 'yearly', priority: 0.3 },
  '/best-asphalt-driveway-sealer-reviews/': { changefreq: 'monthly', priority: 0.9 },
  '/best-driveway-sealer/': { changefreq: 'monthly', priority: 0.9 },
  '/when-should-you-seal-a-new-asphalt-driveway/': { changefreq: 'monthly', priority: 0.8 },
  '/how-much-does-it-cost-to-seal-a-driveway/': { changefreq: 'monthly', priority: 0.8 },
  '/how-to-remove-moss-from-asphalt-driveway/': { changefreq: 'monthly', priority: 0.7 },
  '/how-to-seal-a-concrete-driveway/': { changefreq: 'monthly', priority: 0.8 },
  '/how-to-remove-oil-stains-from-driveway/': { changefreq: 'monthly', priority: 0.7 },
  '/how-long-for-driveway-sealer-to-dry/': { changefreq: 'monthly', priority: 0.7 },
  '/latex-ite-driveway-sealer-review/': { changefreq: 'monthly', priority: 0.8 },
  '/best-stamped-concrete-sealer/': { changefreq: 'monthly', priority: 0.8 },
  '/how-to-stain-concrete-patio-to-look-like-stone/': { changefreq: 'monthly', priority: 0.7 },
  '/best-deck-stain-reviews/': { changefreq: 'monthly', priority: 0.9 },
  '/best-deck-stain-for-pressure-treated-wood/': { changefreq: 'monthly', priority: 0.8 },
  '/best-redwood-sealer/': { changefreq: 'monthly', priority: 0.8 },
  '/best-garage-floor-epoxy/': { changefreq: 'monthly', priority: 0.9 },
  '/best-garage-floor-coating/': { changefreq: 'monthly', priority: 0.8 },
  '/best-basement-wall-sealer/': { changefreq: 'monthly', priority: 0.8 },
  '/best-cinder-block-sealer-reviews/': { changefreq: 'monthly', priority: 0.8 },
  '/best-granite-sealer/': { changefreq: 'monthly', priority: 0.8 },
  '/best-marble-sealer/': { changefreq: 'monthly', priority: 0.8 },
  '/best-polymeric-sand-for-pavers/': { changefreq: 'monthly', priority: 0.8 },
  '/best-water-based-paver-sealer-reviews/': { changefreq: 'monthly', priority: 0.8 },
  '/how-to-use-polymeric-sand/': { changefreq: 'monthly', priority: 0.7 },
  '/ryobi-tools-review/': { changefreq: 'monthly', priority: 0.8 },
  '/tekton-tools-review/': { changefreq: 'monthly', priority: 0.8 },
  '/milwaukee-vs-dewalt/': { changefreq: 'monthly', priority: 0.8 },
  '/reviews/grizzly-g0542-review/': { changefreq: 'monthly', priority: 0.8 },
};

// Redirects from the legacy `*.html` URLs to the new trailing-slash URLs,
// preserving link equity for already-indexed pages.
const REDIRECT_SLUGS = [
  'about', 'affiliate-disclosure', 'best-asphalt-driveway-sealer-reviews',
  'best-basement-wall-sealer', 'best-cinder-block-sealer-reviews',
  'best-deck-stain-for-pressure-treated-wood', 'best-deck-stain-reviews',
  'best-driveway-sealer', 'best-garage-floor-coating', 'best-garage-floor-epoxy',
  'best-granite-sealer', 'best-lists', 'best-marble-sealer', 'best-mens-back-shavers',
  'best-polymeric-sand-for-pavers', 'best-redwood-sealer', 'best-stamped-concrete-sealer',
  'best-water-based-paver-sealer-reviews', 'compare', 'contact', 'guides',
  'how-long-for-driveway-sealer-to-dry', 'how-much-does-it-cost-to-seal-a-driveway',
  'how-to-remove-moss-from-asphalt-driveway', 'how-to-remove-oil-stains-from-driveway',
  'how-to-seal-a-concrete-driveway', 'how-to-stain-concrete-patio-to-look-like-stone',
  'how-to-use-polymeric-sand', 'latex-ite-driveway-sealer-review', 'milwaukee-vs-dewalt',
  'privacy', 'reviews/grizzly-g0542-review', 'ryobi-tools-review', 'terms',
  'when-should-you-seal-a-new-asphalt-driveway',
];

// Note: legacy `/index.html` already maps to the generated homepage file, so
// it needs no redirect.
const redirects = {};
for (const slug of REDIRECT_SLUGS) {
  redirects[`/${slug}.html`] = `/${slug}/`;
}

export default defineConfig({
  site: SITE,
  trailingSlash: 'always',
  build: {
    // Emit `about/index.html` so canonical URLs are trailing-slash directories.
    format: 'directory',
  },
  redirects,
  server: {
    port: 3000,
    host: true,
  },
  integrations: [
    sitemap({
      filter: (page) => !/\/(search|thank-you)\/?$/.test(new URL(page).pathname),
      serialize(item) {
        const url = new URL(item.url);
        const meta = SITEMAP_META[url.pathname];
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
