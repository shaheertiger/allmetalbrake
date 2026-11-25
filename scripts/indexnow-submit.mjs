// Submits every URL in the sitemap to IndexNow (Bing, Yandex, Seznam, Naver…) so new and
// updated pages are crawled within hours. Bing powers nearly all of this site's search
// traffic (DuckDuckGo, Yahoo, Ecosia and Copilot draw on its index), and IndexNow is how
// Bing asks sites to tell it about changes.
//
//   npm run indexnow                 submit the URLs in the LIVE sitemap (run after a deploy)
//   node scripts/indexnow-submit.mjs --postbuild
//                                    the last step of `npm run build`: on a Vercel production
//                                    build, submit the URLs in the freshly built dist/sitemap.xml;
//                                    anywhere else (previews, local builds) do nothing. Never
//                                    fails the build.
//   INDEXNOW_KEY=<key> SITE_URL=<site url> npm run indexnow
//
// IndexNow verifies ownership by fetching https://<host>/<key>.txt, which lives in /public.
import fs from 'node:fs';
import path from 'node:path';

const CONFIG = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, '../site.config.json'), 'utf8'));
const SITE_URL = (process.env.SITE_URL || CONFIG.url).replace(/\/$/, '');
const KEY = process.env.INDEXNOW_KEY || CONFIG.indexnowKey;
const host = new URL(SITE_URL).host;
const postbuild = process.argv.includes('--postbuild');

if (postbuild && process.env.VERCEL_ENV !== 'production') {
  console.log(`IndexNow: skipped (not a Vercel production build; VERCEL_ENV=${process.env.VERCEL_ENV ?? 'unset'})`);
  process.exit(0);
}

const fail = (msg) => {
  console.error(msg);
  // A failed ping must never block a deploy; Bing still recrawls from the sitemap.
  process.exit(postbuild ? 0 : 1);
};

let xml;
try {
  xml = postbuild
    ? fs.readFileSync(path.resolve(import.meta.dirname, '..', 'dist', 'sitemap.xml'), 'utf8')
    : await (await fetch(`${SITE_URL}/sitemap.xml`)).text();
} catch (e) {
  fail(`IndexNow: could not read the sitemap (${e.message})`);
}
const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (!urlList.length) fail('IndexNow: no URLs found in sitemap.xml — is the site built/deployed?');

try {
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host, key: KEY, keyLocation: `${SITE_URL}/${KEY}.txt`, urlList }),
  });
  console.log(`IndexNow: ${res.status} ${res.statusText} — submitted ${urlList.length} URLs`);
  if (!res.ok) fail(await res.text().catch(() => ''));
} catch (e) {
  fail(`IndexNow: request failed (${e.message})`);
}
