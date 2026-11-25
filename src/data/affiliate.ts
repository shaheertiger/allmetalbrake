// Amazon Associates tracking ID. Public by design: it identifies the account a
// click is credited to and appears in every outbound product link.
export const AMAZON_TAG = 'sktiger-20';

/**
 * Outbound Amazon link for a product, best option first:
 *   1. An explicit URL on the product (a SiteStripe link, say), tag added if missing.
 *   2. A direct /dp/ASIN link when the product has a verified `asin`.
 *   3. A tagged Amazon search for the product's `amazon` words, or its name.
 * Every branch carries the tag. Only set `asin` after checking the listing is the exact model.
 */
export function amazonLink(p: { name: string; amazon?: string; asin?: string; url?: string }): string {
  if (p.url && p.url.startsWith('http')) {
    return p.url.includes('tag=') ? p.url : `${p.url}${p.url.includes('?') ? '&' : '?'}tag=${AMAZON_TAG}`;
  }
  if (p.asin) return `https://www.amazon.com/dp/${p.asin}?tag=${AMAZON_TAG}&linkCode=ll1`;
  const q = (p.amazon ?? p.name).replace(/[()]/g, '').replace(/\s+/g, ' ').trim();
  return `https://www.amazon.com/s?k=${encodeURIComponent(q)}&tag=${AMAZON_TAG}`;
}
