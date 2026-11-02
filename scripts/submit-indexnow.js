#!/usr/bin/env node
import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const HOST = 'www.allmetalbrake.com';
const SITE = `https://${HOST}`;
const KEY = process.env.INDEXNOW_KEY || '89d4e5cb30474b899db12e9e3fcbb29a';
const KEY_LOCATION = `${SITE}/${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/IndexNow';
const DIST = join(process.cwd(), 'dist');

// Set by the `postbuild` hook so this runs unattended after every `npm run build`.
// In that mode we only submit on real Vercel production deploys (never local/CI builds
// or preview deploys), and we never fail the build.
// The flag is how postbuild passes this, because `VAR=1 node ...` is not valid on
// Windows shells; the env var is still honoured for anything already using it.
const AUTO = process.argv.includes('--auto') || process.env.INDEXNOW_AUTO === '1';
const IS_VERCEL_PRODUCTION = process.env.VERCEL === '1' && process.env.VERCEL_ENV === 'production';

// `npm run indexnow -- --live` reads the sitemap already published on
// www.allmetalbrake.com instead of the local `dist/`, so a manual run only
// ever submits URLs that are really live. Use it to catch the site up after a
// deploy that ran before the postbuild hook existed (or that never happened).
const LIVE = !AUTO && process.argv.includes('--live');

if (AUTO && !IS_VERCEL_PRODUCTION) {
  console.log(`[indexnow] Skipping auto-submit (VERCEL=${process.env.VERCEL}, VERCEL_ENV=${process.env.VERCEL_ENV})`);
  process.exit(0);
}

function collectLocs(xml, urls) {
  for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const url = m[1].trim();
    if (url.startsWith(SITE) && !url.endsWith('.xml')) urls.add(url);
  }
}

async function extractUrlsFromSitemaps() {
  if (!existsSync(DIST)) return [];
  const files = (await readdir(DIST)).filter((f) => f.startsWith('sitemap-') && f.endsWith('.xml'));
  const urls = new Set();
  for (const file of files) {
    collectLocs(await readFile(join(DIST, file), 'utf8'), urls);
  }
  return [...urls];
}

async function fetchXml(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} returned ${res.status}`);
  return res.text();
}

async function extractUrlsFromLiveSitemaps() {
  const index = await fetchXml(`${SITE}/sitemap-index.xml`);
  const sitemaps = [...index.matchAll(/<loc>([^<]+\.xml)<\/loc>/g)].map((m) => m[1].trim());
  const urls = new Set();
  for (const sitemap of sitemaps) {
    collectLocs(await fetchXml(sitemap), urls);
  }
  return [...urls];
}

async function submit(urlList) {
  const body = JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList,
  });
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body,
  });
  return { status: res.status, text: await res.text().catch(() => '') };
}

try {
  const urls = LIVE ? await extractUrlsFromLiveSitemaps() : await extractUrlsFromSitemaps();
  if (urls.length === 0) {
    throw new Error(
      LIVE ? `No URLs found in ${SITE}/sitemap-index.xml.` : 'No URLs found. Run `astro build` first.'
    );
  }

  console.log(`[indexnow] Submitting ${urls.length} URLs from the ${LIVE ? 'live' : 'built'} sitemap to ${ENDPOINT}`);
  const { status, text } = await submit(urls);
  console.log(`[indexnow] Response ${status}${text ? `: ${text}` : ''}`);
  if (status >= 400) throw new Error(`IndexNow returned ${status}`);
} catch (err) {
  console.error(`[indexnow] ${err.message}`);
  // Never fail the deploy over an IndexNow hiccup; manual runs should still report failure.
  process.exit(AUTO ? 0 : 1);
}
