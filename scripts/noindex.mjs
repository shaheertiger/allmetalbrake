// Pages kept live for old links and bookmarks but kept OUT of the search index.
//
// The site is a home-improvement and outdoor-power site. Off-topic pages pull
// impressions with no clicks (Bing showed "buzz cut" 1,958 times for 1 click)
// and blur what the site is an authority on. These pages get
// <meta name="robots" content="noindex, follow">, are dropped from the sitemap,
// navigation, the best-of index, llms.txt and the generated "More in" links.
//
// Add a slug here instead of deleting a page that still gets traffic; delete the
// page (and add a 301 in vercel.json) once it gets none.
export const NOINDEX_SLUGS = new Set([
  'buzz-cut-guide',
  'best-mens-back-shavers',
  'best-heated-lunch-box',
  'best-portable-blender',
  'best-usb-c-charger',
  'best-car-battery',
]);
