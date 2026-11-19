#!/usr/bin/env node
// Picks today's clusters for the daily run: the categories with the fewest articles,
// and the proven-format intents each one is still missing.
//
//   npm run topics -- --json            # thinnest cluster
//   npm run topics -- --json --skip 1   # second thinnest
//
// A cluster is a CATEGORY_LABELS key. Its pillar is the roundup with that hub; its
// articles are every article whose hub or topic is that key.
import { readFileSync, readdirSync } from 'node:fs';

const root = new URL('../', import.meta.url).pathname;
const arts = readdirSync(root + 'src/content/articles').map((f) => JSON.parse(readFileSync(root + 'src/content/articles/' + f, 'utf8')));
const site = readFileSync(root + 'src/data/site.ts', 'utf8');
const labels = Object.fromEntries([...site.matchAll(/^\s*'?([a-z-]+)'?: '([^']+)',$/gm)].filter(([, k]) => !['name', 'shortName', 'url', 'tagline', 'locale', 'author', 'email', 'ogImage', 'amazonTag', 'amazonDomain', 'adsenseId', 'googleSiteVerification'].includes(k)).map(([, k, v]) => [k, v]));

const arg = (flag, fallback) => { const i = process.argv.indexOf(flag); return i === -1 ? fallback : Number(process.argv[i + 1]); };
const skip = arg('--skip', 0);

// Query types ranked by measured Bing CTR across five sites (docs/bing-playbook.md).
const INTENTS = [
  { intent: 'question', test: /^(is|does|can|do|should|will|are)-|\?/, brief: 'A yes/no or "can it run X" question buyers type, answered in the first sentence with a number' },
  { intent: 'lifespan', test: /how-long|lifespan|last/, brief: '"How long does X last" in years and cycles/hours, what shortens it, when to replace' },
  { intent: 'cost', test: /cost|price|how-much/, brief: 'What it really costs: unit, install, running cost, five-year ownership' },
  { intent: 'how-to', test: /^how-to|hook-up|connect|install|size/, brief: 'How to do the job (connect, size, maintain, store), step by step with the safety rules' },
  { intent: 'vs', test: /-vs-/, brief: 'X vs Y head-to-head buyers search before choosing (two named products or two product types)' },
  { intent: 'sizing', test: /what-size|how-many|watts|runtime/, brief: 'What size / how many watts or Wh you need, with a worked example' },
  { intent: 'timing', test: /best-time|when-/, brief: 'When to buy or do it (season, sales, storm prep) without inventing prices' },
  { intent: 'problem', test: /won-t|not-|problem|fix|troubleshoot/, brief: 'The common failure and its fix (won\'t start, surging, not charging)' },
];

const clusters = Object.keys(labels).map((key) => {
  const members = arts.filter((a) => a.hub === key || a.topic === key);
  const pillar = arts.find((a) => a.hub === key && a.kind === 'roundup') ?? members[0];
  const covered = new Set(INTENTS.filter((i) => members.some((a) => i.test.test(a.slug))).map((i) => i.intent));
  return { key, label: labels[key], pillar, members, missing: INTENTS.filter((i) => !covered.has(i.intent)) };
}).filter((c) => c.pillar).sort((a, b) => a.members.length - b.members.length || a.key.localeCompare(b.key));

const target = clusters[skip];
if (!target) { console.error('No cluster at that --skip.'); process.exit(1); }
const plan = Array.from({ length: 5 }, (_, i) => target.missing.length ? target.missing[i % target.missing.length] : INTENTS[i % INTENTS.length]);
const out = {
  generatedAt: new Date().toISOString().slice(0, 10),
  cluster: target.key,
  label: target.label,
  pillar: { slug: target.pillar.slug, url: `/${target.pillar.slug}/`, title: target.pillar.title },
  existing: target.members.map((a) => a.slug),
  products: readdirSync(root + 'src/content/products').flatMap((f) => JSON.parse(readFileSync(root + 'src/content/products/' + f, 'utf8'))).filter((p) => p.category === target.key).map((p) => p.slug),
  articles: plan.map((p, i) => ({ n: i + 1, intent: p.intent, brief: p.brief })),
};
if (process.argv.includes('--json')) console.log(JSON.stringify(out, null, 2));
else {
  console.log(`Cluster: ${out.label} (${out.cluster}), pillar ${out.pillar.url}, ${out.existing.length} article(s)`);
  out.articles.forEach((a) => console.log(`  ${a.n}. [${a.intent}] ${a.brief}`));
}
