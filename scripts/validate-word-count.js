import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const PAGES_DIR = join(import.meta.dirname, '..', 'src', 'pages');
const MIN_WORD_COUNT = 2500;
// Utility, legal and author pages are not articles — the minimum applies to
// buyer's guides and how-tos, where thin content is the real risk.
const EXCLUDED_PAGES = [
  'index.astro',
  'best-of.astro',
  '404.astro',
  'about.astro',
  'contact.astro',
  'how-we-test.astro',
  'privacy-policy.astro',
  'terms.astro',
];

function countWords(filePath) {
  const content = readFileSync(filePath, 'utf-8');

  // Remove frontmatter (between --- delimiters)
  const withoutFrontmatter = content.replace(/^---[\s\S]*?---/, '');

  // Remove HTML/JSX tags
  const withoutTags = withoutFrontmatter.replace(/<[^>]*>/g, ' ');

  // Remove CSS class strings and inline styles
  const withoutStyles = withoutTags.replace(/class(Name)?="[^"]*"/g, ' ');

  // Remove JavaScript expressions like {variable}
  const withoutExpressions = withoutStyles.replace(/\{[^}]*\}/g, ' ');

  // Count remaining words
  const words = withoutExpressions
    .split(/\s+/)
    .filter((word) => word.length > 0 && /[a-zA-Z]/.test(word));

  return words.length;
}

const files = readdirSync(PAGES_DIR).filter(
  (f) => f.endsWith('.astro') && !EXCLUDED_PAGES.includes(f)
);

let hasFailures = false;

console.log('Validating article word counts (minimum: %d words)\n', MIN_WORD_COUNT);

for (const file of files) {
  const filePath = join(PAGES_DIR, file);
  const wordCount = countWords(filePath);
  const passed = wordCount >= MIN_WORD_COUNT;

  if (!passed) {
    hasFailures = true;
    console.log('FAIL  %s — %d words (need %d more)', file, wordCount, MIN_WORD_COUNT - wordCount);
  } else {
    console.log('PASS  %s — %d words', file, wordCount);
  }
}

console.log('');

if (hasFailures) {
  console.error('Word count validation failed. All articles must have at least %d words.', MIN_WORD_COUNT);
  process.exit(1);
} else {
  console.log('All articles meet the minimum word count requirement.');
}
