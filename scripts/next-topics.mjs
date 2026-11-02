#!/usr/bin/env node
// Picks the day's work: the thinnest cluster on the site, plus the search intents
// it is still missing. One pillar per day gets a batch of supporting articles, so
// every run finishes a coherent mini-cluster instead of scattering pages around.
//
//   node scripts/next-topics.mjs              # human-readable brief
//   node scripts/next-topics.mjs --json       # brief for the daily publishing job
//   node scripts/next-topics.mjs --count 5    # how many articles to plan (default 5)
//   node scripts/next-topics.mjs --skip 2     # skip the N thinnest (if one is a dead end)
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { buildClusters, loadPages } from './cluster-report.mjs';

const PAGES_DIR = join(import.meta.dirname, '..', 'src', 'pages');

// The intents a complete cluster covers. Each one is a distinct search need, not a
// rephrasing of the pillar — that is what keeps them from cannibalising each other.
// `covered` decides whether the cluster already answers it.
const INTENTS = [
  { id: 'comparison',     brief: 'X vs the obvious alternative — the head-to-head buyers search before choosing',
                          covered: /-vs-/ },
  { id: 'sizing',         brief: 'What size / how much do I need — the spec that decides the purchase',
                          covered: /^(what-size|how-many|how-much-.*-do-i-need|what-psi)/ },
  { id: 'specs',          brief: 'The spec sheet decoded — which numbers predict performance and which are marketing',
                          covered: /(explained|-vs-horsepower|what-is-)/ },
  { id: 'cost',           brief: 'What it really costs — purchase, installation, consumables, five-year ownership',
                          covered: /(cost|price|worth-it)/ },
  { id: 'howto',          brief: 'How to use or install it properly — the job people get wrong',
                          covered: /^how-to-/ },
  { id: 'troubleshoot',   brief: 'The common failure — why it stopped working and how to fix it',
                          covered: /(not-|why-is|why-does|losing|keeps-|problem|peeling|clog)/ },
  { id: 'maintenance',    brief: 'Maintenance and lifespan — what wears out, when, and what it costs to renew',
                          covered: /(how-long|maintenance|clean|filter|winteriz|storage)/ },
  { id: 'worth-it',       brief: 'Is it worth it / do I even need one — the pre-purchase objection',
                          covered: /(worth-it|do-i-need|can-you|do-they|is-it-)/ },
];

function meta(slug) {
  const src = readFileSync(join(PAGES_DIR, `${slug}.astro`), 'utf8');
  return {
    title: (src.match(/^const title =\s*\n?\s*"(.+?)";/m) || src.match(/const title = "(.+?)"/) || [])[1] || slug,
    section: (src.match(/section:\s*"(.+?)"/) || [])[1] || 'Home Improvement',
  };
}

const arg = (flag, fallback) => {
  const i = process.argv.indexOf(flag);
  return i === -1 ? fallback : Number(process.argv[i + 1]);
};

const count = arg('--count', 5);
const skip = arg('--skip', 0);

// Search Console demand, when a recent export has been processed with
// `npm run gsc -- --save`. It never changes WHICH clusters are thin — it breaks the
// tie between equally thin ones, so the job works the gaps people actually search.
const DEMAND_FILE = join(import.meta.dirname, '..', 'content', 'search-console', 'demand.json');
let demand = new Map();
let demandDate = null;
if (existsSync(DEMAND_FILE)) {
  const parsed = JSON.parse(readFileSync(DEMAND_FILE, 'utf8'));
  demandDate = parsed.generatedAt;
  demand = new Map(parsed.clusterDemand.map((c) => [c.pillar, c.impressions]));
}

const { ranked: byCoverage } = buildClusters();
const ranked = [...byCoverage].sort((a, b) =>
  a.spokeCount - b.spokeCount ||
  (demand.get(b.pillar) || 0) - (demand.get(a.pillar) || 0) ||
  a.pillar.localeCompare(b.pillar));

const target = ranked[skip];
if (!target) {
  console.error('No pillar found to work on.');
  process.exit(1);
}

const { title, section } = meta(target.pillar);
const spokeSlugs = target.spokes;
const uncovered = INTENTS.filter((intent) => !spokeSlugs.some((s) => intent.covered.test(s)));

// Rotate through uncovered intents; if a cluster is already complete, the run falls
// back to the next intents in order so a batch is never empty.
const plan = Array.from({ length: count }, (_, i) => (uncovered.length ? uncovered[i % uncovered.length] : INTENTS[i % INTENTS.length]));

// Sibling pillars in the same section give the new articles somewhere to link out to.
const siblings = ranked
  .filter((c) => c.pillar !== target.pillar)
  .map((c) => c.pillar)
  .filter((slug) => meta(slug).section === section)
  .slice(0, 6);

const brief = {
  generatedAt: new Date().toISOString().slice(0, 10),
  pillar: { slug: target.pillar, url: `/${target.pillar}/`, title, section },
  clusterSize: target.spokeCount,
  searchDemand: demand.size
    ? { impressions: demand.get(target.pillar) ?? 0, dataFrom: demandDate }
    : null,
  existingSpokes: spokeSlugs.map((s) => `/${s}/`),
  linkTargets: [`/${target.pillar}/`, ...siblings.map((s) => `/${s}/`)],
  articles: plan.map((intent, i) => ({ n: i + 1, intent: intent.id, brief: intent.brief })),
};

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(brief, null, 2));
} else {
  console.log(`Today's cluster: /${target.pillar}/  (${target.spokeCount} existing spokes, section: ${section})`);
  console.log(`Pillar title: ${title}`);
  if (demand.size) {
    const imp = demand.get(target.pillar);
    console.log(imp
      ? `Search demand: ${imp.toLocaleString()} impressions (Search Console, ${demandDate})`
      : `Search demand: none recorded in the ${demandDate} export — worth sanity-checking before writing`);
  }
  console.log('');
  if (spokeSlugs.length) console.log(`Already covered: ${spokeSlugs.map((s) => '/' + s + '/').join(', ')}\n`);
  console.log(`Write ${count} articles covering these intents:`);
  for (const a of brief.articles) console.log(`  ${a.n}. [${a.intent}] ${a.brief}`);
  console.log(`\nLink out to: ${brief.linkTargets.slice(0, 4).join(', ')}`);
}
