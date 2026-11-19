import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import { readGitDates, pageFileFor } from './scripts/git-dates.mjs';
import { NOINDEX_SLUGS } from './scripts/noindex.mjs';

const GIT_DATES = readGitDates();

// Buyer's guides that target high-volume search terms. They get a higher
// sitemap priority than the 0.5 default so crawlers reach them sooner.
const priorityGuides = new Set([
  // November 2026: the site is backup power only (generators, power stations,
  // home batteries, outage gear). Every remaining guide gets priority.
  'best-home-generator-for-power-outages',
  'best-dual-fuel-generator',
  'best-inverter-generator',
  'best-dual-fuel-inverter-generator',
  'best-portable-power-station',
  'best-portable-power-station-for-home-backup',
  'best-portable-power-station-for-camping',
  'best-solar-power-bank',
  'best-hand-crank-radio',
  'best-small-generator-for-home',
  'best-gas-generator',
  'generac-generator-cost',
  'best-whole-house-surge-protector',
  'best-home-battery-backup',
  'best-solar-generator',
  'best-portable-solar-panel',
  'best-generator-transfer-switch',
  'best-generator-for-well-pump',
  'best-generator-for-camping',
  'best-rv-generator',
  'best-indoor-heater-for-power-outage',
  'best-portable-chargers-for-power-outages',
  'best-battery-backup-for-cpap',
  'best-ups-battery-backup',
  'best-battery-pack-with-ac-outlet',
  'best-emergency-lantern',
  'best-battery-powered-fan',
  'best-fuel-transfer-pump',
  'best-power-inverter',
  'best-ecoflow-power-station',
  'best-jackery-power-station',
  'best-anker-solix-power-station',
  'ecoflow-vs-jackery',
  'ecoflow-vs-bluetti',
  'how-long-does-a-generator-last',
  'best-time-to-buy-a-generator',
]);

export default defineConfig({
  site: 'https://www.allmetalbrake.com',
  // Canonical URLs, sitemap entries and internal links all use a trailing slash;
  // Vercel 308-redirects the slash-less form (see trailingSlash in vercel.json).
  trailingSlash: 'always',
  integrations: [
    react(),
    tailwind(),
    sitemap({
      // Noindexed pages (off-topic, kept live for old links) stay out of the sitemap.
      filter: (page) => !NOINDEX_SLUGS.has(page.replace(/^https?:\/\/[^/]+\//, '').replace(/\/$/, '')),
      serialize(item) {
        const slug = item.url.replace(/^https?:\/\/[^/]+\//, '').replace(/\/$/, '');
        // Real dates from git, never the build time: a lastmod that always says
        // "today" teaches Bing to ignore it. Pages with no git date get none.
        const git = GIT_DATES[pageFileFor(slug)];
        if (git?.modified) item.lastmod = `${git.modified}T12:00:00.000Z`;
        else delete item.lastmod;

        if (slug === '') {
          item.changefreq = 'weekly';
          item.priority = 1.0;
        } else if (slug === 'best-of') {
          item.changefreq = 'weekly';
          item.priority = 0.9;
        } else if (priorityGuides.has(slug)) {
          item.changefreq = 'monthly';
          item.priority = 0.8;
        } else {
          item.changefreq = 'monthly';
          item.priority = 0.5;
        }
        return item;
      },
    }),
  ],
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
});
