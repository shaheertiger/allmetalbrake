#!/usr/bin/env node
// Fails the build when an article page drifts from the canonical layout, which is
// the one used by best-self-propelled-lawn-mower.astro: a dark hero, a byline
// strip, a table of contents, an #faq section, closing sections, and JSON-LD
// carrying BreadcrumbList, FAQPage and Article.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const PAGES_DIR = join(import.meta.dirname, '..', 'src', 'pages');
// Pages that are not articles and deliberately use a different layout.
const NON_ARTICLE = new Set([
  'index',
  'best-of',
  'sand-calculator',
  '404',
  'about',
  'contact',
  'how-we-test',
  'privacy-policy',
  'terms',
]);

const CHECKS = [
  // A full-width dark hero band. Most pages use bg-gray-900; a couple reach the
  // same look with a gradient or a slate hex.
  ['hero', (s) => /bg-gray-900[^"]*\bpy-16\b|from-gray-900|bg-\[#0F172A\]/.test(s)],
  ['trustBadge', (s) => /TrustBadge/.test(s)],
  ['authorBox', (s) => /Author & Meta/.test(s) && /AuthorAvatar/.test(s)],
  ['socialProof', (s) => /SocialProof/.test(s)],
  ['toc', (s) => /In This Guide/.test(s)],
  ['breadcrumbSchema', (s) => /BreadcrumbList/.test(s)],
  ['faqSchema', (s) => /FAQPage/.test(s)],
  ['articleSchema', (s) => /"@type":\s*"Article"/.test(s)],
  ['jsonLd', (s) => /jsonLd=/.test(s)],
  ['faqSection', (s) => /id="faq"/.test(s)],
  ['commonMistakes', (s) => /Common Mistakes/i.test(s)],
  ['relatedGuides', (s) => /Related [\w &]*Guides/i.test(s)],
  ['closing', (s) => /The Bottom Line/i.test(s)],
  ['authorBio', (s) => /AuthorBio/.test(s)],
];

const slugs = readdirSync(PAGES_DIR)
  .filter((file) => file.endsWith('.astro'))
  .map((file) => file.replace(/\.astro$/, ''))
  .filter((slug) => !NON_ARTICLE.has(slug))
  .sort();

const offFormat = slugs
  .map((slug) => {
    const source = readFileSync(join(PAGES_DIR, `${slug}.astro`), 'utf-8');
    return { slug, missing: CHECKS.filter(([, test]) => !test(source)).map(([name]) => name) };
  })
  .filter((page) => page.missing.length);

if (!offFormat.length) {
  console.log(`All ${slugs.length} article pages match the canonical format.`);
  process.exit(0);
}

for (const { slug, missing } of offFormat) {
  console.log(`${slug.padEnd(48)} ${missing.join(' ')}`);
}

const tally = {};
for (const { missing } of offFormat) for (const name of missing) tally[name] = (tally[name] || 0) + 1;

console.log(`\n${offFormat.length} of ${slugs.length} article pages are off-format`);
for (const [name, count] of Object.entries(tally).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(count).padStart(3)}  ${name}`);
}
process.exitCode = 1;
