/* ------------------------------------------------------------------ */
/* Structured data shared by every template.                           */
/*                                                                    */
/* Mirrors besthometheaterreview.com, where Search Console shows       */
/* "Product snippets" and "Review snippet" rich results: every product */
/* that appears on a page (product page, guide pick, comparison side)  */
/* is a full Product with a Review, rating and the Amazon ASIN as sku, */
/* and every page carries the same Organization and WebSite nodes.     */
/* ------------------------------------------------------------------ */
import { SITE } from '../data/site';
import { authorSchema } from '../data/authors';
import { getBrand, categoryOf, productPath, productUpdated, plain, type Product } from './data';

export const ORG_ID = `${SITE.url}/#organization`;
export const WEBSITE_ID = `${SITE.url}/#website`;
export const LOGO_URL = `${SITE.url}/logo.png`;

/** Organization + WebSite, emitted once per page by Base.astro. */
export const siteSchema = () => [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE.name,
    url: `${SITE.url}/`,
    logo: { '@type': 'ImageObject', url: LOGO_URL, width: 512, height: 512 },
    email: SITE.email,
    description: SITE.tagline,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE.name,
    url: `${SITE.url}/`,
    publisher: { '@id': ORG_ID },
    inLanguage: 'en-US',
  },
];

/** Publisher block for Article/Review nodes: a reference to the site Organization. */
export const publisherRef = () => ({ '@id': ORG_ID });

/** Full Product + Review node. Used on /gear/, inside guide ItemLists and on comparisons. */
export function productSchema(p: Product, author?: string) {
  return {
    '@type': 'Product',
    name: p.name,
    brand: { '@type': 'Brand', name: getBrand(p.brand).name },
    description: plain(p.quick),
    url: `${SITE.url}${productPath(p)}`,
    category: categoryOf(p.category).label,
    ...(p.image ? { image: p.image } : {}),
    ...(p.asin ? { sku: p.asin } : {}),
    review: {
      '@type': 'Review',
      name: `${p.name} review`,
      author: authorSchema(author),
      publisher: publisherRef(),
      datePublished: productUpdated(p),
      reviewBody: plain(p.verdict[0]),
      reviewRating: { '@type': 'Rating', ratingValue: p.score.overall, bestRating: 100, worstRating: 0 },
      positiveNotes: { '@type': 'ItemList', itemListElement: p.pros.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t })) },
      negativeNotes: { '@type': 'ItemList', itemListElement: p.cons.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t })) },
    },
  };
}

/** ItemList whose items are full Products (guide picks, comparison pairs). */
export const productItemList = (products: Product[], name?: string, author?: string) => ({
  '@type': 'ItemList',
  ...(name ? { name } : {}),
  numberOfItems: products.length,
  itemListElement: products.map((p, i) => ({ '@type': 'ListItem', position: i + 1, item: productSchema(p, author) })),
});

