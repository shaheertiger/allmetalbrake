/**
 * One-shot conversion helper.
 *
 * Reads the legacy static `*.html` pages and emits, for each one:
 *   - src/bodies/<route>.html   — the original <body> inner markup, with the
 *                                 duplicated <script> tags stripped (the shared
 *                                 BaseLayout loads /js/main.js for everyone) and
 *                                 any page-specific <head><style> blocks prepended
 *                                 so styling is preserved.
 *   - src/pages/<route>.astro   — a thin Astro page that wraps the body partial
 *                                 in BaseLayout via <Fragment set:html>.
 *
 * Run once from the repo root: `node scripts/convert-to-astro.mjs`
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

// Legacy HTML sources -> route slug (path under src/pages, without extension).
async function collectSources() {
  const sources = [];
  const rootEntries = await fs.readdir(ROOT, { withFileTypes: true });
  for (const entry of rootEntries) {
    if (entry.isFile() && entry.name.endsWith('.html')) {
      sources.push(entry.name); // e.g. "about.html"
    }
  }
  // Nested review pages.
  try {
    const reviewEntries = await fs.readdir(path.join(ROOT, 'reviews'), { withFileTypes: true });
    for (const entry of reviewEntries) {
      if (entry.isFile() && entry.name.endsWith('.html')) {
        sources.push(path.join('reviews', entry.name));
      }
    }
  } catch { /* no reviews dir */ }
  return sources.sort();
}

function extract(html) {
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const head = headMatch ? headMatch[1] : '';
  let body = bodyMatch ? bodyMatch[1] : html;

  const titleMatch = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';

  const descMatch = head.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']\s*\/?>/i);
  const description = descMatch ? descMatch[1].trim() : '';

  const articleCss = /article\.css/i.test(head);

  // Preserve any page-specific <style> blocks that lived in <head>.
  const headStyles = (head.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || []).join('\n');

  // Remove every <script> in the body (main.js include + duplicated FAQ
  // handlers); the shared layout loads /js/main.js for all pages.
  body = body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  body = body.replace(/<script\b[^>]*\/>/gi, '');

  return { title, description, articleCss, headStyles, body: body.trim() };
}

function decodeEntities(str) {
  // The title/description go into JS string literals; just normalize the few
  // HTML entities that appear so the rendered <title>/<meta> read naturally.
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function main() {
  const sources = await collectSources();
  const results = [];

  for (const rel of sources) {
    const html = await fs.readFile(path.join(ROOT, rel), 'utf8');
    const { title, description, articleCss, headStyles, body } = extract(html);

    const slug = rel.replace(/\.html$/i, ''); // e.g. "about" or "reviews/grizzly-..."
    const depth = slug.split('/').length - 1; // 0 for root, 1 for reviews/*
    const up = depth === 0 ? '../' : '../'.repeat(depth + 1);

    // Body partial.
    const bodyPartialPath = path.join('src', 'bodies', `${slug}.html`);
    const bodyContent = (headStyles ? headStyles + '\n' : '') + body + '\n';
    await fs.mkdir(path.join(ROOT, path.dirname(bodyPartialPath)), { recursive: true });
    await fs.writeFile(path.join(ROOT, bodyPartialPath), bodyContent, 'utf8');

    // Astro page.
    const layoutImport = `${up}layouts/BaseLayout.astro`;
    const bodyImport = `${up}bodies/${slug}.html?raw`;
    const astro =
`---
import BaseLayout from '${layoutImport}';
import body from '${bodyImport}';

const title = ${JSON.stringify(decodeEntities(title))};
const description = ${JSON.stringify(decodeEntities(description))};
---

<BaseLayout title={title} description={description} articleCss={${articleCss}}>
  <Fragment set:html={body} />
</BaseLayout>
`;
    const astroPath = path.join('src', 'pages', `${slug}.astro`);
    await fs.mkdir(path.join(ROOT, path.dirname(astroPath)), { recursive: true });
    await fs.writeFile(path.join(ROOT, astroPath), astro, 'utf8');

    results.push(`${rel} -> ${astroPath}`);
  }

  console.log(`Converted ${results.length} pages:`);
  for (const r of results) console.log('  ' + r);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
