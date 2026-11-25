import { defineConfig } from 'astro/config';
import config from './site.config.json' with { type: 'json' };

export default defineConfig({
  site: config.url,
  trailingSlash: 'always',
  build: { format: 'directory' },
  compressHTML: true,
});
