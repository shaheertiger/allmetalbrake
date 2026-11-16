# All Metal Brake — allmetalbrake.com

Home-improvement buying guides, built with [Astro](https://astro.build/) and deployed on Vercel.

The site carries the 30 best-performing articles from The Honest Reviewers, all using its
article template (hero, quick picks, product cards, buying guide, mistakes, FAQ, related
guides, bottom line, author bio). Old allmetalbrake.com URLs that no longer exist are
301-redirected to the closest guide in `vercel.json`.

Search strategy lives in [`docs/bing-playbook.md`](docs/bing-playbook.md): the site is
judged by Bing Webmaster Tools data, and the build enforces its title and description rules.

## Commands

| Command                  | Action                                                        |
| ------------------------ | ------------------------------------------------------------- |
| `npm install`            | Install dependencies                                          |
| `npm run dev`            | Dev server                                                    |
| `npm run build`          | Content gates + `astro build` + Markdown copies to `dist/`    |
| `npm run validate:all`   | Word count (2,500 min), Bing title/description gate, internal links, format, new-page gate |
| `npm run indexnow`       | Submit sitemap URLs to IndexNow                               |

## Where things live

- `src/pages/` — one `.astro` file per page
- `src/layouts/Layout.astro` — header, footer, ads, sticky CTA
- `src/data/nav.ts` — header, mobile menu, footer, home and best-of categories
- `src/data/site.ts` — site name, URL and contact email
- `scripts/` — build gates, interlink and top-pick generators, IndexNow
