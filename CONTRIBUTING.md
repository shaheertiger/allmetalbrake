# Contributing

## The 2700-word rule

**Every article page must contain at least 2,700 words of body copy. The build
fails otherwise — this is a hard gate, not a warning.**

Run it locally before you push:

```bash
npm run build     # validate; exits 1 on any error
npm run words     # same, plus a word count for every article
```

The same check runs in CI on every push and pull request
(`.github/workflows/build.yml`), so a thin page cannot reach `main`.

### What counts as a word

`tools/build.js` reads the innerHTML of each page's
`<div class="article-content">` block — including nested callouts, comparison
tables, and FAQ blocks — strips scripts, styles, comments, and tags, decodes
HTML entities, and counts whitespace-delimited tokens that contain at least one
letter or digit. Navigation, the hero, the sidebar, and the footer are **not**
counted; only the article body is. Stray punctuation and bullet glyphs are not
counted either, so the number reflects what a reader actually reads.

### What gets checked

| Check | Rule |
| --- | --- |
| Word count | `article-content` body ≥ 2,700 words |
| Structure | Page has a `<div class="article-content">` block and an `<h1>` |
| Title | Non-empty `<title>` |
| Description | `<meta name="description">` of 50+ characters |
| Sitemap | Article is listed in `sitemap.xml` |
| Links | Every relative `href`/`src` resolves to a file on disk |

### Adding a page that is not an article

Hub pages, legal pages, and the homepage are exempt. Add the filename to
`nonArticles` in `build.config.json`. Keep that list short and deliberate — it
is the only way to bypass the word gate, so anything added to it should
genuinely not be an article.

### Changing the threshold

`minWords` lives in `build.config.json`. Lowering it is a content-policy
decision, not a build fix. If an article is short, write more of it.

## Writing articles

New pages follow the structure of the existing articles (see
`best-marble-sealer.html` as the reference):

- `topbar` → `header` → `breadcrumb` → `article-hero` → `article-wrap`
  (`article-main` + `article-sidebar`) → `article-cta` → `footer`
- A `toc` block whose anchors match the `id` attributes on the `<h2>` headings
- Body copy inside `<div class="article-content">`
- An `faq-section` with `faq-item` / `faq-question` / `faq-answer` blocks
- A `related-guides` block linking to three genuinely related articles
- `css/style.css`, `css/article.css`, and `js/main.js` on every page

Add the new URL to `sitemap.xml` in the same commit — the build checks for it.
