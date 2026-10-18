# All Metal Brake

Expert-tested home improvement reviews and buying guides, built with [Astro](https://astro.build/).

## Tech stack

- **Astro 5** — static site generation
- **@astrojs/sitemap** — generates `sitemap-index.xml` with per-page priorities
- Plain global CSS (`public/css/style.css`, `public/css/article.css`) and a small
  vanilla-JS enhancement script (`public/js/main.js`)

## Project structure

```
public/                 Static assets served from the site root
  css/                  Global + article styles
  js/main.js            Mobile nav, smooth scroll, FAQ accordions, etc.
  sitemap.xml           Hand-maintained sitemap (kept for the footer link)
  189c…txt              IndexNow verification key
src/
  layouts/BaseLayout.astro   Shared <head> (fonts, CSS) + body shell + main.js
  pages/*.astro              One page per route (emitted as <name>.html)
  pages/reviews/*.astro      Nested review pages
  bodies/*.html              Page body markup injected via <Fragment set:html>
scripts/
  convert-to-astro.mjs       One-shot converter used to migrate the legacy site
  submit-indexnow.js         Ping IndexNow with the sitemap URLs
astro.config.mjs             site, build.format:'file', sitemap config
```

Pages are built with `build.format: 'file'`, so each route is emitted as a flat
`*.html` file (e.g. `/about.html`). This preserves the original site's URLs and
internal links.

## Commands

| Command            | Action                                         |
| ------------------ | ---------------------------------------------- |
| `npm install`      | Install dependencies                           |
| `npm run dev`      | Start the dev server at `http://localhost:3000`|
| `npm run build`    | Build the static site to `./dist/`             |
| `npm run preview`  | Preview the production build locally           |
| `npm run indexnow` | Submit sitemap URLs to IndexNow                |
