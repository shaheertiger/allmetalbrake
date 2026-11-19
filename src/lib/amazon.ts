import { SITE } from '../data/site';
import type { Product } from './types';

/** Affiliate URL for a product: /dp/ASIN when known, otherwise a tagged Amazon search. */
export function amazonUrl(p: Pick<Product, 'asin' | 'name' | 'amazonQuery'>): string {
  const tag = encodeURIComponent(SITE.amazonTag);
  if (p.asin) return `https://${SITE.amazonDomain}/dp/${p.asin}?tag=${tag}&linkCode=ll1`;
  const q = encodeURIComponent(p.amazonQuery || p.name);
  return `https://${SITE.amazonDomain}/s?k=${q}&tag=${tag}`;
}

/** Amazon product photo (m.media-amazon.com), same hotlinking as best-proteinpowder.com. Null until an image is fetched. */
export function amazonImage(p: Pick<Product, 'imageId'>, size = 400): string | null {
  return p.imageId ? `https://m.media-amazon.com/images/I/${p.imageId}._SL${size}_.jpg` : null;
}

export const AFFILIATE_REL = 'sponsored nofollow noopener';
