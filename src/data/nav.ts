// The "Best Lists" menu, in the enthusiastreview.com structure: groups of entries with an icon,
// a label and a one-line tagline. Used by the header mega menu, the mobile drawer and the home
// page's "Browse by Category". Guide entries name a slug; the build fails if that page is gone.
import { articleMap } from '../lib/data';

export interface NavItem {
  label: string;
  href: string;
  tagline: string;
  /** Category key for the icon (src/data/categories.ts), or one of the extra icons below. */
  icon: string;
  tool?: boolean;
}
export interface NavGroup {
  label: string;
  /** Shown on the home page's "Browse by Category"; the Database group is menu-only. */
  home: boolean;
  items: NavItem[];
}

/** Icons for menu entries that are not a product category (24x24 viewBox path data). */
export const EXTRA_ICONS: Record<string, string> = {
  tool: 'M5 3h14v18H5zM8 6h8v3H8zM8 12h2M11 12h2M14 12h2M8 15h2M11 15h2M14 15h2M8 18h2M11 18h5',
  gear: 'M4 5h16M4 12h16M4 19h16M8 3v4M15 10v4M11 17v4',
  brand: 'M4 4h7l9 9-7 7-9-9zM8 8h.01',
  compare: 'M3 5h7v14H3zM14 5h7v14h-7zM12 3v18',
  glossary: 'M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h11',
  score: 'M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z',
  guide: 'M4 4h16v16H4zM8 8h8M8 12h8M8 16h5',
  cost: 'M12 3v18M16 7H10a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6H8',
  clock: 'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0M12 7v5l3 3',
};

const guide = (slug: string, label: string, tagline: string, icon?: string): NavItem => {
  const a = articleMap.get(slug);
  if (!a) throw new Error(`src/data/nav.ts: no article "${slug}"`);
  return { label, href: `/${slug}/`, tagline, icon: icon ?? a.topic ?? a.hub };
};

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Generators',
    home: true,
    items: [
      guide('best-home-generator-for-power-outages', 'Best Home Generators', 'Standby, portable and inverter picks'),
      guide('best-inverter-generator', 'Best Inverter Generators', 'Quiet, clean power'),
      guide('best-dual-fuel-generator', 'Best Dual Fuel Generators', 'Gas and propane in one machine'),
      guide('best-small-generator-for-home', 'Best Small Generators', 'Compact backup for essentials'),
      guide('best-generator-for-well-pump', 'Best Generators for Well Pumps', '240V picks sized by horsepower'),
      { label: 'Generator Wattage Calculator', href: '/tools/generator-wattage-calculator/', tagline: 'Size it to your loads', icon: 'tool', tool: true },
    ],
  },
  {
    label: 'Battery Power',
    home: true,
    items: [
      guide('best-portable-power-station', 'Best Portable Power Stations', 'Battery backup without the fumes'),
      guide('best-portable-power-station-for-home-backup', 'Best Power Stations for Home', 'Sized by the loads you keep on'),
      guide('best-home-battery-backup', 'Best Home Battery Backup', 'Whole-house and plug-in systems'),
      guide('best-solar-generator', 'Best Solar Generators', 'Power stations matched to panels'),
      guide('ecoflow-vs-jackery', 'EcoFlow vs Jackery', 'Which brand to buy', 'compare'),
      { label: 'Runtime Calculator', href: '/tools/power-station-runtime-calculator/', tagline: 'How long will it run?', icon: 'tool', tool: true },
    ],
  },
  {
    label: 'Connect & Protect',
    home: true,
    items: [
      guide('best-generator-transfer-switch', 'Best Transfer Switches', 'Manual, interlock and inlet picks'),
      guide('best-whole-house-surge-protector', 'Best Whole-House Surge Protectors', 'Panel-mounted protection'),
      guide('best-ups-battery-backup', 'Best UPS Battery Backups', 'For routers, PCs and NAS boxes'),
      guide('best-battery-backup-for-cpap', 'Best Battery Backup for CPAP', 'Sized by nights of sleep'),
      guide('best-power-inverter', 'Best Power Inverters', 'Run AC gear from a 12V battery'),
    ],
  },
  {
    label: 'Outage Gear',
    home: true,
    items: [
      guide('best-indoor-heater-for-power-outage', 'Best Indoor Heaters for Outages', 'Safe emergency heat'),
      guide('best-portable-chargers-for-power-outages', 'Best Portable Chargers', 'Power banks to stations'),
      guide('best-emergency-lantern', 'Best Emergency Lanterns', 'Outage lights that last'),
      guide('best-hand-crank-radio', 'Best Hand Crank Radios', 'NOAA alerts for outages'),
      guide('best-battery-powered-fan', 'Best Battery Powered Fans', 'Cooling without the grid'),
    ],
  },
  {
    label: 'Guides',
    home: true,
    items: [
      guide('generac-generator-cost', 'Whole House Generator Cost', 'Generac unit, install and upkeep', 'cost'),
      guide('how-long-does-a-generator-last', 'How Long Does a Generator Last?', 'Run hours and years by type', 'clock'),
      guide('best-time-to-buy-a-generator', 'Best Time to Buy a Generator', 'Black Friday vs storm week', 'clock'),
      guide('ecoflow-vs-bluetti', 'EcoFlow vs Bluetti', 'Class-by-class comparison', 'compare'),
      { label: 'All Guides', href: '/guides/', tagline: 'Costs, lifespans, comparisons', icon: 'guide' },
    ],
  },
  {
    label: 'Database',
    home: false,
    items: [
      { label: 'All Backup Power Gear', href: '/gear/', tagline: 'Every product we track, scored', icon: 'gear' },
      { label: 'Brands', href: '/brands/', tagline: 'Every brand and its lineup', icon: 'brand' },
      { label: 'Compare Two Products', href: '/compare/', tagline: 'Head-to-head spec sheets', icon: 'compare' },
      { label: 'Glossary', href: '/glossary/', tagline: 'Running watts, LiFePO4, interlocks', icon: 'glossary' },
      { label: 'Calculators', href: '/tools/', tagline: 'Wattage and runtime tools', icon: 'tool' },
      { label: 'How We Score', href: '/how-we-test/', tagline: 'What the AMB Score weighs', icon: 'score' },
    ],
  },
];

/** Thin nav strip under the header (enthusiastreview.com's QUICK links). */
export const QUICK_LINKS = [
  { label: 'Generators', href: '/best-home-generator-for-power-outages/' },
  { label: 'Inverter', href: '/best-inverter-generator/' },
  { label: 'Power Stations', href: '/best-portable-power-station/' },
  { label: 'Home Batteries', href: '/best-home-battery-backup/' },
  { label: 'Transfer Switches', href: '/best-generator-transfer-switch/' },
  { label: 'All Gear', href: '/gear/' },
  { label: 'Compare', href: '/compare/' },
  { label: 'Tools', href: '/tools/' },
];

export const FOOTER_COMPANY = [
  { title: 'About Us', url: '/about/' },
  { title: 'How We Score', url: '/how-we-test/' },
  { title: 'Editorial Policy', url: '/editorial-policy/' },
  { title: 'Affiliate Disclosure', url: '/affiliate-disclosure/' },
  { title: 'Privacy Policy', url: '/privacy-policy/' },
  { title: 'Terms', url: '/terms/' },
  { title: 'Contact', url: '/contact/' },
  { title: 'Sitemap', url: '/sitemap/' },
];
