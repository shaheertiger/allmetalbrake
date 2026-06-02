/**
 * Submit the site's URLs to IndexNow.
 *
 * Usage:
 *   node scripts/submit-indexnow.js                 # submit every URL in the sitemap
 *   node scripts/submit-indexnow.js https://...     # submit specific URLs
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HOST = 'www.allmetalbrake.com';
const KEY = '189ca4591f684071860aa602c09ab321';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/IndexNow';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function urlsFromSitemap() {
  const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  const xml = await fs.readFile(sitemapPath, 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

async function main() {
  const cliUrls = process.argv.slice(2);
  const urlList = cliUrls.length ? cliUrls : await urlsFromSitemap();

  if (!urlList.length) {
    console.error('No URLs to submit.');
    process.exit(1);
  }

  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList,
  };

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Host: 'api.indexnow.org',
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  console.log(`Submitted ${urlList.length} URL(s).`);
  console.log(`HTTP ${res.status}`);
  if (text) console.log(text);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
