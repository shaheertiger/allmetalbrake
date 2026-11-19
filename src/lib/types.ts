export interface FAQ { q: string; a: string }

export interface Product {
  slug: string;
  name: string;
  brand: string;
  category: string;
  /** Amazon ASIN. When set, buttons deep-link to /dp/ASIN and the product photo is shown. */
  asin?: string;
  /** Amazon image id, e.g. "91Ef5beEgqL" from m.media-amazon.com/images/I/91Ef5beEgqL._AC_SL1500_.jpg */
  imageId?: string;
  /** Search phrase used for the Amazon link when no ASIN is set. Defaults to the product name. */
  amazonQuery?: string;
  released?: string;
  /** Approximate street price band, e.g. "$400–$500". Never an exact price. */
  priceBand?: string;
  /** 1 = budget … 4 = premium */
  priceTier?: 0 | 1 | 2 | 3 | 4;
  /** Overall AMB Score out of 100 (editorial ranking). */
  score: number;
  scores?: { label: string; value: number }[];
  /** One-sentence quick answer. */
  summary: string;
  /** Longer verdict (markdown). */
  verdict: string;
  bestFor: string;
  skipIf: string;
  pros: string[];
  cons: string[];
  /** Ordered key/value spec sheet. */
  specs: Record<string, string>;
  /** Spec keys to surface on cards (3–4). */
  keySpecs?: string[];
  faqs?: FAQ[];
  /** One-line spec summary from the guide that features it. */
  atAGlance?: string;
}

export interface Pick {
  product: string;
  award: string;
  /** Markdown body for this pick inside the roundup. */
  body: string;
  pros?: string[];
  cons?: string[];
}

export interface Section {
  heading: string;
  body: string;
  /** 'before' renders ahead of the product list, 'after' (default) after it. */
  position?: 'before' | 'after';
}

export interface Article {
  slug: string;
  kind: 'roundup' | 'review' | 'guide';
  title: string;
  metaDescription: string;
  h1: string;
  keyword: string;
  keywords: string[];
  /** Hub category key from CATEGORY_LABELS, or 'guides' / 'brands'. */
  hub: string;
  published: string;
  updated: string;
  intro: string;
  quickAnswer?: string;
  picksHeading?: string;
  picks?: Pick[];
  sections: Section[];
  comparisonSpecs?: string[];
  mistakes?: { title: string; body: string }[];
  faqs: FAQ[];
  related: string[];
  bottomLine: string;
  /** Product category a guide belongs to (for 'More in' links). */
  topic?: string;
  /** Brand this review covers (for kind === 'review'). */
  brand?: string;
}
