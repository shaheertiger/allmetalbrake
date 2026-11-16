#!/usr/bin/env node
// Vercel (and most CI) builds from a shallow clone. In a shallow clone every page
// looks like it was added and modified on the day of the oldest fetched commit,
// so every page claims to be brand new: a freshness signal that is always on, and
// one Bing learns to ignore. Fetch the full history first so scripts/git-dates.mjs
// can read real dates. Never fails the build: if the fetch is not possible, the
// boundary-commit fallback in git-dates.mjs still keeps dates honest.
import { execSync } from 'node:child_process';

const run = (cmd, timeout = 120_000) =>
  execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout }).trim();

try {
  if (run('git rev-parse --is-shallow-repository') !== 'true') {
    console.log('[dates] Full git history present.');
    process.exit(0);
  }
  const remote = run('git remote').split('\n')[0];
  if (!remote) throw new Error('no git remote configured');
  // Commits and trees only; file contents are not needed for dates.
  try {
    run(`git fetch --unshallow --filter=blob:none --no-tags ${remote}`);
  } catch {
    run(`git fetch --unshallow --no-tags ${remote}`);
  }
  console.log('[dates] Fetched full git history for real page dates.');
} catch (err) {
  console.warn(`[dates] Could not unshallow (${String(err.message).split('\n')[0]}); boundary commits will be skipped instead.`);
}
