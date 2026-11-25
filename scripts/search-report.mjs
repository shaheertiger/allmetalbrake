#!/usr/bin/env node
/**
 * Daily search report from the Bing Webmaster API (Bing + DuckDuckGo + Yahoo + Ecosia all use Bing's index,
 * so this is ~90% of the site's search traffic). Used by the daily-publish skill before writing pages.
 *
 *   BING_WEBMASTER_API_KEY=... node scripts/search-report.mjs [--days 30] [--json out.json]
 *
 * The key is also read from `apikey` (the name it has in the cloud environment).
 * Prints: daily totals, on-topic queries (site.config.json report.offTopic filtered out), pages Bing shows
 * with their live HTTP status on production, and OPPORTUNITIES: URLs Bing still shows that do not return 200
 * (redirected or gone), and query clusters with impressions but no matching page.
 */
import fs from 'node:fs';
import path from 'node:path';

const KEY = process.env.BING_WEBMASTER_API_KEY || process.env.apikey;
const CONFIG = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, '../site.config.json'), 'utf8'));
const LIVE = CONFIG.url;
// Bing Webmaster verifies the bare domain: https://example.com/
const SITE = `${LIVE.replace('://www.', '://')}/`;
const R = CONFIG.report;
const args = process.argv.slice(2);
const opt = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const DAYS = Number(opt('--days', 30));
const JSON_OUT = opt('--json', null);

if (!KEY) {
  console.error('No Bing Webmaster API key: set BING_WEBMASTER_API_KEY (or apikey).');
  process.exit(1);
}

const OFF_TOPIC = R.offTopic ? new RegExp(R.offTopic, 'i') : /(?!)/;

async function bing(method) {
  const url = `https://ssl.bing.com/webmaster/api.svc/json/${method}?apikey=${KEY}&siteUrl=${encodeURIComponent(SITE)}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${method}: HTTP ${r.status} ${(await r.text()).slice(0, 200)}`);
  return (await r.json()).d || [];
}
const day = (d) => new Date(Number(/\d+/.exec(d)[0])).toISOString().slice(0, 10);
const since = new Date(Date.now() - DAYS * 864e5).toISOString().slice(0, 10);

function aggregate(rows) {
  const m = new Map();
  for (const r of rows) {
    if (day(r.Date) < since) continue;
    const a = m.get(r.Query) || { key: r.Query, impressions: 0, clicks: 0, posSum: 0 };
    a.impressions += r.Impressions;
    a.clicks += r.Clicks;
    a.posSum += r.AvgImpressionPosition * r.Impressions;
    m.set(r.Query, a);
  }
  return [...m.values()]
    .map((a) => ({ ...a, position: +(a.posSum / Math.max(a.impressions, 1)).toFixed(1) }))
    .sort((x, y) => y.clicks - x.clicks || y.impressions - x.impressions);
}

async function status(url) {
  try {
    const u = new URL(url);
    const r = await fetch(LIVE + u.pathname, { method: 'GET', redirect: 'manual', headers: { 'user-agent': 'search-report' } });
    return { code: r.status, to: r.headers.get('location') || '' };
  } catch (e) {
    return { code: 0, to: String(e.message) };
  }
}

const [queryRows, pageRows, traffic] = await Promise.all([bing('GetQueryStats'), bing('GetPageStats'), bing('GetRankAndTrafficStats')]);
const queries = aggregate(queryRows).filter((q) => !OFF_TOPIC.test(q.key));
const pages = aggregate(pageRows).filter((p) => !/\/(best|guides)\//.test(p.key) && !OFF_TOPIC.test(p.key));

console.log(`# Bing search report, last ${DAYS} days (since ${since})\n`);
console.log('## Daily totals (last 14 days)');
for (const t of traffic.slice(-14)) console.log(`${day(t.Date)}  impressions ${String(t.Impressions).padStart(5)}  clicks ${t.Clicks}`);

console.log(`\n## On-topic queries (${queries.length})  impr clicks pos`);
for (const q of queries.slice(0, 120)) console.log(`${String(q.impressions).padStart(4)} ${String(q.clicks).padStart(3)} ${String(q.position).padStart(5)}  ${q.key}`);

console.log(`\n## Pages Bing shows (${pages.length}) with live status`);
const guidesDir = path.resolve('src/data/guides');
const slugs = new Set(fs.existsSync(guidesDir) ? fs.readdirSync(guidesDir).map((f) => f.replace(/\.json$/, '')) : []);
const withStatus = [];
for (const p of pages.slice(0, 80)) {
  const s = await status(p.key);
  withStatus.push({ ...p, status: s.code, redirect: s.to });
  console.log(`${String(p.impressions).padStart(4)} ${String(p.clicks).padStart(3)} ${String(p.position).padStart(5)}  ${s.code}${s.to ? ' -> ' + s.to : ''}  ${p.key}`);
}

const lost = withStatus.filter((p) => p.status !== 200);
console.log('\n## OPPORTUNITIES 1: URLs Bing still shows that are not a live page (rebuild these first)');
for (const p of lost.sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions)) {
  const slug = new URL(p.key).pathname.replace(/^\/|\/$/g, '');
  console.log(`${String(p.impressions).padStart(4)} impr ${p.clicks} clk pos ${p.position}  ${p.status}  /${slug}/${slugs.has(slug) ? '  (JSON exists: check routing)' : ''}`);
}

// Query clusters: "gpu for <cpu>" style queries grouped by the CPU named.
const SUBJECT = new RegExp(R.cluster.subject, 'i');
const clusters = new Map();
for (const q of queries) {
  if (!new RegExp(R.cluster.query, 'i').test(q.key)) continue;
  const m = SUBJECT.exec(R.cluster.prep ? q.key.replace(new RegExp(R.cluster.prep, 'i'), (x) => x + ' ') : q.key);
  if (!m) continue;
  const k = m[1].toLowerCase();
  const c = clusters.get(k) || { cpu: k, impressions: 0, clicks: 0, queries: [] };
  c.impressions += q.impressions;
  c.clicks += q.clicks;
  c.queries.push(q.key);
  clusters.set(k, c);
}
console.log(`\n## OPPORTUNITIES 2: ${R.cluster.label} query clusters (check a /${R.cluster.pagePrefix}<subject>/ page exists for each)`);
for (const c of [...clusters.values()].sort((a, b) => b.impressions - a.impressions).slice(0, 25)) {
  const has = [...slugs].filter((s) => s.startsWith(R.cluster.pagePrefix) && s.includes(c.cpu));
  console.log(`${String(c.impressions).padStart(3)} impr  ${c.cpu.padEnd(8)} ${has.length ? 'page: ' + has.join(', ') : 'NO PAGE'}  e.g. ${c.queries.slice(0, 3).join(' | ')}`);
}

if (JSON_OUT) {
  fs.writeFileSync(JSON_OUT, JSON.stringify({ since, traffic, queries, pages: withStatus, clusters: [...clusters.values()] }, null, 2));
  console.log(`\nWrote ${JSON_OUT}`);
}
