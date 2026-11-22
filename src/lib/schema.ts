import { SITE } from '../data/site';
import type { Article, FAQ, Product } from './types';
import { amazonImage } from './amazon';
import { plain } from './md';
import { productUrl, hubLabel } from './data';

const abs = (path: string) => new URL(path, SITE.url).toString();

export const orgRef = { '@id': `${SITE.url}/#organization` };

export function organization() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE.url}/#organization`,
    name: SITE.name,
    url: SITE.url + '/',
    logo: { '@type': 'ImageObject', url: abs('/logo.png'), width: 512, height: 512 },
    email: SITE.email,
    description: SITE.description,
  };
}

export function website() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE.url}/#website`,
    name: SITE.name,
    url: SITE.url + '/',
    publisher: orgRef,
    inLanguage: 'en-US',
  };
}

export function breadcrumbs(items: { name: string; url: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.url) })),
  };
}

export function faqPage(faqs: FAQ[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: plain(f.a) } })),
  };
}

const author = () => ({ '@type': 'Organization', name: SITE.author, url: abs('/about/') });

export function articleSchema(a: Pick<Article, 'title' | 'metaDescription' | 'published' | 'updated' | 'hub' | 'keywords'>, url: string, image?: string) {
  return {
    '@type': 'Article',
    headline: a.title.slice(0, 110),
    description: a.metaDescription,
    datePublished: a.published,
    dateModified: a.updated,
    author: author(),
    publisher: { '@type': 'Organization', name: SITE.name, url: SITE.url + '/', logo: { '@type': 'ImageObject', url: abs('/logo.png') } },
    mainEntityOfPage: { '@type': 'WebPage', '@id': abs(url) },
    image: image ?? abs(SITE.ogImage),
    articleSection: hubLabel(a.hub),
    keywords: a.keywords.join(', '),
    inLanguage: 'en-US',
  };
}

export function productSchema(p: Product, withReview = true) {
  const img = amazonImage(p, 500);
  const o: Record<string, unknown> = {
    '@type': 'Product',
    name: p.name,
    brand: { '@type': 'Brand', name: p.brand },
    description: plain(p.summary),
    url: abs(productUrl(p)),
    category: p.category,
  };
  if (img) o.image = img;
  if (p.asin) o.sku = p.asin;
  if (withReview) {
    o.review = {
      '@type': 'Review',
      name: `${p.name} review`,
      author: author(),
      publisher: orgRef,
      datePublished: '2026-11-17',
      reviewBody: plain(p.verdict).slice(0, 500),
      reviewRating: { '@type': 'Rating', ratingValue: p.score, bestRating: 100, worstRating: 0 },
      positiveNotes: { '@type': 'ItemList', itemListElement: p.pros.map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x })) },
      negativeNotes: { '@type': 'ItemList', itemListElement: p.cons.map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x })) },
    };
  }
  return o;
}

export function itemList(items: { name: string; url: string; product?: Product }[], name?: string) {
  return {
    '@type': 'ItemList',
    ...(name ? { name } : {}),
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      ...(it.product ? { item: productSchema(it.product) } : { name: it.name, url: abs(it.url) }),
    })),
  };
}

export function graph(...nodes: object[]) {
  return { '@context': 'https://schema.org', '@graph': nodes };
}
