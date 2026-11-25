// Strict Amazon listing rules for scripts/fetch-product-images.mjs (same API as enthusiastreview.com).
//
// Each product id has a rule: every `all` pattern must match the Amazon title, no `none`
// pattern may match, and `prefer` patterns rank otherwise-equal listings. A product with no rule
// is left unmatched and keeps the ASIN and photo already in its JSON, or its tagged Amazon search.
// allmetalbrake.com's verified ASINs and photos were carried over in each product's `asin` and
// `image` fields, so no rules are needed yet.

const r = (s) => new RegExp(s, 'i');

/** Listings that are never the product itself, whatever the category. */
export const NEVER = r(String.raw`\b(renewed|refurbished|pre-?owned|open box|used|replacement for|compatible with|for parts)\b`);
export const SYSTEM = r(String.raw`(?!)`);

export const RULES = {};

/** Does this Amazon title pass the product's rule? */
export function passes(id, title) {
  const rule = RULES[id];
  if (!rule || !title) return false;
  if (NEVER.test(title)) return false;
  if (!rule.all.every((p) => r(p).test(title))) return false;
  if ((rule.none ?? []).some((p) => r(p).test(title))) return false;
  return true;
}

/** Best listing for a product among Amazon results (kept in Amazon's order), or undefined. */
export function pick(id, items) {
  const ok = items.filter((it) => passes(id, it.title) && it.image);
  const prefer = (RULES[id]?.prefer ?? []).map(r);
  const score = (it) => prefer.filter((p) => p.test(it.title)).length;
  return ok.sort((a, b) => score(b) - score(a))[0];
}

export const searchWords = (p) => RULES[p.id]?.q ?? (p.amazon ?? p.name).replace(/[()]/g, ' ').replace(/\s+/g, ' ').trim();
