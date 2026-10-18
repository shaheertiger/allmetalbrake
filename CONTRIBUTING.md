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
| Search metadata | Canonical URL, Open Graph tags and valid JSON-LD from `npm run seo` |
| Title / description length | Warns past 65 / 160 characters (Bing cuts them off) |

### Adding a page that is not an article

Hub pages, legal pages, and the homepage are exempt. Add the filename to
`nonArticles` in `build.config.json`. Keep that list short and deliberate — it
is the only way to bypass the word gate, so anything added to it should
genuinely not be an article.

### Changing the threshold

`minWords` lives in `build.config.json`. Lowering it is a content-policy
decision, not a build fix. If an article is short, write more of it.

## Writing articles

New pages follow the review layout of the existing articles (see
`best-marble-sealer.html` as the reference). Copy the promo bar, header and
footer from it unchanged.

- `promo-bar` → `header.site-header` → `article-hero` (breadcrumb, `<h1>`,
  `subtitle`, `byline`) → `picks-band` → `article-wrap` (`article-main` +
  `article-sidebar`) → `article-cta` → `footer.site-footer`
- `article-main` opens with the `affiliate-note`, then the `toc` (anchors
  must match the `id`s on the `<h2>` headings)
- Body copy inside `<div class="article-content">`
- Each `product-card` (with an `id`) holds a `product-box` (`product-label`
  such as "Best Overall", the `product-media` and `product-cta` regions, and
  an `<h3 class="product-name">`), then `product-details` ("What We Like",
  "What We Don't Like", "Product Specs"), then `product-card-body` with the
  review text and `bottom-line`
- Roundups place `<!-- top-picks:start --><!-- top-picks:end -->` before the
  first `<h2>` and `<!-- picks-band:start --><!-- picks-band:end -->` after
  the hero
- An `faq-section` with `faq-item` / `faq-question` / `faq-answer` blocks
- A `related-guides` block linking to three genuinely related articles
- An `author-box` ("Meet the Tester") and `trust-box` straight after
  `article-content`
- `css/style.css`, `css/article.css`, and `js/main.js` on every page

## Product images and retailer links

Run `npm run products` after adding or renaming a product card. It adds the
card to `data/products.json` and fills in the generated regions: the product
photo, the "See It" button, the "Our Top Picks" list and the pick cards under
the headline.

For each product in `data/products.json` you can set:

- `asin`: the Amazon product ID; the button links to that product page
- `url`: any other retailer link (overrides `asin`)
- `image`: the product photo URL. For Amazon products use the image URL that
  Amazon provides (Product Advertising API or SiteStripe). Associates rules
  don't allow downloading the photo and hosting it ourselves.

Without `asin` or `url` the button opens an Amazon search for the product
name. Put your Associates store ID in `affiliate.amazonTag` in
`build.config.json` and rerun `npm run products` to tag every Amazon link.

Add the new URL to `sitemap.xml` in the same commit — the build checks for it.

## Search metadata (Bing / DuckDuckGo)

DuckDuckGo's web results come mostly from Bing, so the site is tuned for Bing.
After adding or editing a page:

```bash
npm run seo                       # regenerate head metadata for every page
node tools/seo.js --touch my.html # same, and mark my.html as updated today
```

`tools/seo.js` writes everything between `<!-- seo:start -->` and
`<!-- seo:end -->` in each `<head>`: canonical URL, robots directives,
favicons, Open Graph and Twitter cards, and JSON-LD (Organization, WebSite,
Article, BreadcrumbList, and FAQPage built from the `faq-item` blocks). Don't
edit that block by hand. It also syncs `<lastmod>` in `sitemap.xml`.

What you still write by hand:

- `<title>`: 60 characters or fewer, main keyword first. Leave off the brand
  suffix if it pushes past the limit; the brand is in the metadata already.
- `<meta name="description">`: 110 to 160 characters, says what the reader gets.
- Link to the homepage as `./` (or `../` from `reviews/`), not `index.html`.

Pages that should stay out of search results go in `noindex` in
`build.config.json` and must not be in the sitemap.

On every push to the default branch, `.github/workflows/indexnow.yml` sends
the changed URLs to IndexNow, which Bing (and so DuckDuckGo) uses to recrawl
quickly. Run it by hand from the Actions tab to resubmit the whole sitemap.
