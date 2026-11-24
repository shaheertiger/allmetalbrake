// Real last-modified dates for every page, from git history (copied from enthusiastreview.com).
//
//   node scripts/page-dates.mjs        (runs first in `npm run build`)
//
// Writes src/data/git-dates.json: { "<key>": "YYYY-MM-DD" }, the author date of the last commit
// that changed each content file. Keys: "articles/<slug>" (src/content/articles/<slug>.json),
// "products/<category>" (src/content/products/<category>.json), "compares" (src/data/compares.ts),
// "glossary" (src/data/glossary.ts).
// src/lib/data.ts uses it as the page's `updated` date, so the date on the page,
// in the Article JSON-LD and in the sitemap <lastmod> moves when the content really changes
// and never otherwise. Bing uses dateModified/lastmod as a freshness signal and learns to
// ignore it when it is wrong; a hand-typed `updated` field drifts (pages edited on Nov 6
// still said Nov 5).
//
// Commits whose message carries the trailer `Page-Dates: skip` are ignored: use it for
// site-wide mechanical edits (heading rewording, template migrations, link rewrites, meta
// titles) so they don't stamp every page as updated. Reader-facing content changes must not
// carry it.
//
// Vercel builds from a shallow clone, where every file's "last commit" is the clone's
// boundary commit, which would date every page to the deploy. So this first fetches the
// full history, and if that fails it ignores any file whose last commit is a shallow
// boundary and keeps the `updated` value from the page's JSON instead.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const PATHS = ['src/content/articles', 'src/content/products', 'src/data/compares.ts', 'src/data/glossary.ts'];
const keyOf = (file) =>
  file.match(/^src\/content\/(articles\/.+)\.json$/)?.[1] ??
  file.match(/^src\/content\/(products\/.+)\.json$/)?.[1] ??
  file.match(/^src\/data\/(compares|glossary)\.ts$/)?.[1];
const OUT = path.join(ROOT, 'src/data/git-dates.json');

const git = (...args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

let dates = {};
try {
  if (git('rev-parse', '--is-shallow-repository') === 'true') {
    try {
      git('fetch', '--unshallow', '--quiet');
      console.log('page-dates: fetched full git history');
    } catch (e) {
      console.warn(`page-dates: could not unshallow (${String(e.stderr || e.message).trim().split('\n')[0]}); boundary commits will be ignored`);
    }
  }

  const shallowFile = path.resolve(ROOT, git('rev-parse', '--git-path', 'shallow'));
  const boundary = new Set(fs.existsSync(shallowFile) ? fs.readFileSync(shallowFile, 'utf8').split('\n').filter(Boolean) : []);

  // One pass over history, newest first: the first time a file appears is its last change.
  const skip = new Set(git('log', '--format=%H', '--grep=^Page-Dates: skip$', '--', ...PATHS).split('\n').filter(Boolean));
  const log = git('log', '--format=@%H %as', '--name-only', '--', ...PATHS);
  let commit = null;
  let date = null;
  for (const line of log.split('\n')) {
    if (line.startsWith('@')) {
      [commit, date] = line.slice(1).split(' ');
      continue;
    }
    const key = keyOf(line);
    if (!key || key in dates || skip.has(commit)) continue;
    dates[key] = boundary.has(commit) ? null : date;
  }
  dates = Object.fromEntries(Object.entries(dates).filter(([, d]) => d));
} catch (e) {
  console.warn(`page-dates: git unavailable (${String(e.message).split('\n')[0]}); using the dates in the content files`);
  dates = {};
}

fs.writeFileSync(OUT, JSON.stringify(dates, null, 2) + '\n');
console.log(`page-dates: ${Object.keys(dates).length} page dates from git → src/data/git-dates.json`);
