/**
 * Global site settings. Change the Amazon tag here and every affiliate link on the
 * site updates on the next build.
 */
export const SITE = {
  name: 'All Metal Brake',
  shortName: 'AMB',
  url: 'https://www.allmetalbrake.com',
  tagline: 'Independent backup power reviews built on the spec sheet',
  description:
    'Independent backup power reviews: home and portable generators, power stations, home batteries, transfer switches and outage gear, checked against the spec sheet and your real loads. No paid placements.',
  locale: 'en_US',
  /** Byline on every page; full profile in src/data/authors.ts (/authors/justin-lee/). */
  author: 'Justin Lee',
  email: 'editors@allmetalbrake.com',
  ogImage: '/og-default.png',
  /** Amazon Associates tracking ID used on every Amazon link. */
  amazonTag: 'sktiger-20',
  amazonDomain: 'www.amazon.com',
  /** Google AdSense publisher ID (also loads Auto ads). Leave empty to omit. */
  adsenseId: 'ca-pub-2963693328827195',
  /** Optional: Google Search Console verification token. */
  googleSiteVerification: '',
} as const;

/** Name of the site's editorial score, shown on every product. */
export const SCORE_NAME = 'AMB Score';

export const CATEGORY_LABELS: Record<string, string> = {
  generator: 'Home & Portable Generators',
  'dual-fuel': 'Dual Fuel Generators',
  inverter: 'Inverter Generators',
  'camping-rv': 'Camping & RV Power',
  'power-station': 'Portable Power Stations',
  'home-battery': 'Home Battery Backup',
  solar: 'Solar Generators & Panels',
  'transfer-switch': 'Transfer Switches & Inlets',
  surge: 'Whole-House Surge Protectors',
  ups: 'UPS Battery Backups',
  cpap: 'CPAP Battery Backup',
  'power-inverter': 'Power Inverters',
  'power-bank': 'Power Banks & Chargers',
  lantern: 'Emergency Lanterns',
  radio: 'Emergency Radios',
  fan: 'Battery Powered Fans',
  heater: 'Outage Heaters',
  'fuel-pump': 'Fuel Transfer Pumps',
  // Revived guide hubs (Nov 23, 2026): old URLs that still earn Bing clicks on the sister site.
  driveway: 'Driveway & Concrete Sealing',
  'garage-floor': 'Garage Floors',
  basement: 'Basement & Mold',
  'deck-exterior': 'Deck, Fence & Exterior',
  yard: 'Lawn & Yard Equipment',
  tools: 'Tools & Workshop',
  'home-systems': 'Water Heaters, Water & Flooring',
  grooming: 'Grooming',
};

export const CATEGORY_ICONS: Record<string, string> = {
  generator: '⚡', 'dual-fuel': '⛽', inverter: '🔇', 'camping-rv': '🏕️', 'power-station': '🔋', 'home-battery': '🏠',
  solar: '☀️', 'transfer-switch': '🔌', surge: '🛡️', ups: '💻', cpap: '😴', 'power-inverter': '🚗', 'power-bank': '📱',
  lantern: '🔦', radio: '📻', fan: '🌀', heater: '🔥', 'fuel-pump': '🛢️',
  driveway: '🛣️', 'garage-floor': '🚗', basement: '🏚️', 'deck-exterior': '🪵', yard: '🌿', tools: '🔧', 'home-systems': '🚿', grooming: '💈',
};
