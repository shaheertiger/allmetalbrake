# Contributing

## The 2700-word rule

**Every article page must contain at least 2,700 words of body copy. The build
fails otherwise — this is a hard gate, not a warning.**

```bash
npm run build          # astro build, then the content gate; exits 1 on failure
npm run words          # word count for every built article
npm run check:content  # gate only, against an existing dist/
```

Because `npm run build` is what both CI and Vercel run, a thin page cannot
reach production: it fails the pull request and it fails the deploy.

### What counts as a word

`tools/check-word-count.js` runs against `dist/`, not `src/`, so it measures
what a reader actually receives with the layout applied. For each built page it
takes the innerHTML of the `<div class="article-content">` block — walking
`div` nesting so callouts, comparison tables and FAQ blocks are included rather
than truncating at the first `</div>` — strips scripts, styles, comments and
tags, decodes HTML entities, and counts whitespace-delimited tokens containing
at least one letter or digit. The header, hero, sidebar and footer are **not**
counted. Neither is stray punctuation.

### What is exempt

Two things are skipped:

- **Routes listed in `nonArticles`** in `build.config.json` — the homepage, hub
  pages, legal pages, search and thank-you. Keep this list short and
  deliberate; it is the only way to bypass the gate.
- **Redirect stubs.** `astro.config.mjs` maps every legacy `/slug.html` URL to
  `/slug/`, and Astro emits a meta-refresh page for each. The gate skips any
  page carrying `<meta http-equiv="refresh">`, so those are excluded by shape
  rather than by listing dozens of routes.

### Changing the threshold

`minWords` lives in `build.config.json`. Lowering it is a content decision, not
a build fix. If an article is short, write more of it.

## Adding an article

1. `src/bodies/<slug>.html` — the body markup. No `<head>`, no `<link>`, no
   `<script>`, no `<style>`: `BaseLayout.astro` supplies all of those,
   including `/js/main.js`, which drives the FAQ accordion.
2. `src/pages/<slug>.astro` — a thin wrapper:

   ```astro
   ---
   import BaseLayout from '../layouts/BaseLayout.astro';
   import body from '../bodies/<slug>.html?raw';

   const title = "… | Home Fix Reviews";
   const description = "…";
   ---

   <BaseLayout title={title} description={description} articleCss={true} articleBody={body}>
     <Fragment set:html={body} />
   </BaseLayout>
   ```

   Pass `articleBody={body}` — the layout parses it to emit FAQ structured data
   from the `faq-item` blocks.
3. `astro.config.mjs` — add the route to `SITEMAP_META` for changefreq and
   priority, and add the slug to `REDIRECT_SLUGS` so the legacy `.html` URL
   redirects to it.
4. `public/search-index.json` — add a title/url/description entry so the page
   appears in on-site search.
5. Link it from `src/bodies/best-lists.html`, `guides.html` or `compare.html`
   so it is not orphaned.

### Conventions

Internal links are trailing-slash directory URLs (`/best-marble-sealer/`, not
`best-marble-sealer.html`). Articles follow the shared structure: topbar,
header, breadcrumb, `article-hero`, `article-wrap` (`article-main` +
`article-sidebar`), `article-cta`, footer, with the body inside
`<div class="article-content">`, a `toc` whose anchors match the `<h2>` ids, an
`faq-section`, and a `related-guides` block.

## Submitting to IndexNow

After a deploy, `npm run indexnow` submits every URL in the built sitemap, or
pass specific URLs as arguments. The key file lives at `public/<key>.txt` and
must match the `KEY` constant in `scripts/submit-indexnow.js`.
