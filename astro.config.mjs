// @ts-check
import { defineConfig } from 'astro/config';

// The XML sitemap is src/pages/sitemap.xml.ts (one file with image entries and real git dates,
// the enthusiastreview.com format), not @astrojs/sitemap.
export default defineConfig({
  site: 'https://www.allmetalbrake.com',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'always' },
});
