// @ts-ignore: plain ESM helper shared with astro.config.mjs (sitemap lastmod)
import { readGitDates, pageFileFor } from '../../scripts/git-dates.mjs';

/**
 * Publication and modification dates taken from git history at build time, so
 * `dateModified` is always true and never has to be maintained by hand.
 *
 * The build runs scripts/unshallow-for-dates.mjs first, so a shallow CI clone
 * still has full history. If it could not, git-dates.mjs skips the shallow
 * boundary commit and callers fall back to the date declared on the page.
 *
 * Never touch a page just to move its date: the modified date should only
 * change when something on the page really changed.
 */
interface Entry {
  published: string;
  modified: string;
}

const GIT_DATES: Record<string, Entry> = readGitDates();

export interface PageDates {
  published: string;
  modified: string;
  display: string;
}

export function pageDates(pathname: string, fallback: Partial<Entry> = {}): PageDates {
  const git = GIT_DATES[pageFileFor(pathname)];
  const published = git?.published ?? fallback.published ?? fallback.modified ?? '';
  const modified = git?.modified ?? fallback.modified ?? fallback.published ?? '';
  const display = modified
    ? new Date(`${modified}T12:00:00Z`).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
      })
    : '';
  return { published, modified, display };
}
