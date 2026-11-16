// Real publish and modify dates for every page, read from git history.
//
// Shared by src/data/dates.ts (article dates, Article schema) and
// astro.config.mjs (sitemap <lastmod>), so the two can never disagree.
//
// A shallow clone makes its oldest commit look like it added every file, which
// would date the whole site to that commit. scripts/unshallow-for-dates.mjs
// fetches full history before the build; as a fallback, commits on the shallow
// boundary are skipped here, so a page only seen there gets no git date and its
// caller falls back to the date declared on the page.
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8', maxBuffer: 128 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
}

function shallowBoundary() {
  try {
    const gitDir = sh('git rev-parse --git-dir').trim();
    const file = join(gitDir, 'shallow');
    if (!existsSync(file)) return new Set();
    return new Set(readFileSync(file, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean));
  } catch {
    return new Set();
  }
}

let cache;

/** @returns {Record<string, { published: string, modified: string }>} keyed by repo path, e.g. src/pages/foo.astro */
export function readGitDates() {
  if (cache) return cache;
  const out = {};
  try {
    const boundary = shallowBoundary();
    const raw = sh('git log "--pretty=format:%x01%H %cI" --name-only --diff-filter=AMR -- src/pages');
    for (const block of raw.split('\x01')) {
      const lines = block.split('\n').filter(Boolean);
      if (lines.length === 0) continue;
      const [hash, iso = ''] = lines[0].trim().split(' ');
      if (boundary.has(hash)) continue;
      const date = iso.slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
      for (const file of lines.slice(1)) {
        if (!file.startsWith('src/pages/')) continue;
        // git log walks newest first: the first sighting is the last change,
        // the final sighting is when the file was added.
        if (!out[file]) out[file] = { published: date, modified: date };
        out[file].published = date;
      }
    }
  } catch {
    // no history available: callers fall back to their declared dates
  }
  cache = out;
  return out;
}

/** Repo path of the page source for a URL path or slug. */
export function pageFileFor(pathname) {
  const slug = String(pathname).replace(/^https?:\/\/[^/]+/, '').replace(/^\/+|\/+$/g, '');
  return slug === '' ? 'src/pages/index.astro' : `src/pages/${slug}.astro`;
}
