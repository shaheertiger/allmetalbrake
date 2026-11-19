export interface NavLink { title: string; blurb: string; icon: string; url: string }
export interface NavGroup { label: string; links: NavLink[] }

export const NAV: NavGroup[] = [
  {
    label: 'Generators',
    links: [
      { title: 'Best Home Generators for Outages', blurb: 'Standby, portable and inverter picks', icon: '⚡', url: '/best-home-generator-for-power-outages/' },
      { title: 'Best Inverter Generators', blurb: 'Quiet, clean power', icon: '🔇', url: '/best-inverter-generator/' },
      { title: 'Best Dual Fuel Generators', blurb: 'Gas and propane in one machine', icon: '⛽', url: '/best-dual-fuel-generator/' },
      { title: 'Best Small Generators for Home', blurb: 'Compact backup for essentials', icon: '🏠', url: '/best-small-generator-for-home/' },
      { title: 'Best Gas Generators', blurb: 'Gasoline portables compared', icon: '🛢️', url: '/best-gas-generator/' },
      { title: 'Best Generators for Well Pumps', blurb: '240V picks sized by horsepower', icon: '💧', url: '/best-generator-for-well-pump/' },
      { title: 'Generator Wattage Calculator', blurb: 'Size it to your loads', icon: '🧮', url: '/tools/generator-wattage-calculator/' },
    ],
  },
  {
    label: 'Power Stations',
    links: [
      { title: 'Best Portable Power Stations', blurb: 'Battery backup without the fumes', icon: '🔋', url: '/best-portable-power-station/' },
      { title: 'Best Power Stations for Home Backup', blurb: 'Sized by the loads you keep on', icon: '🏠', url: '/best-portable-power-station-for-home-backup/' },
      { title: 'Best Home Battery Backup', blurb: 'Whole-house and plug-in systems', icon: '🏡', url: '/best-home-battery-backup/' },
      { title: 'Best Solar Generators', blurb: 'Power stations matched to panels', icon: '☀️', url: '/best-solar-generator/' },
      { title: 'EcoFlow vs Jackery', blurb: 'Which brand to buy', icon: '⚖️', url: '/ecoflow-vs-jackery/' },
      { title: 'Power Station Runtime Calculator', blurb: 'How long will it run?', icon: '⏱️', url: '/tools/power-station-runtime-calculator/' },
    ],
  },
  {
    label: 'Outage Gear',
    links: [
      { title: 'Best Generator Transfer Switches', blurb: 'Manual, interlock and inlet picks', icon: '🔌', url: '/best-generator-transfer-switch/' },
      { title: 'Best Battery Backup for CPAP', blurb: 'Sized by nights of sleep', icon: '😴', url: '/best-battery-backup-for-cpap/' },
      { title: 'Best Indoor Heaters for Outages', blurb: 'Safe emergency heat', icon: '🔥', url: '/best-indoor-heater-for-power-outage/' },
      { title: 'Best Portable Chargers for Outages', blurb: 'Power banks to stations', icon: '📱', url: '/best-portable-chargers-for-power-outages/' },
      { title: 'Best Emergency Lanterns', blurb: 'Outage lights that last', icon: '🔦', url: '/best-emergency-lantern/' },
      { title: 'Best Hand Crank Radios', blurb: 'NOAA alerts for outages', icon: '📻', url: '/best-hand-crank-radio/' },
    ],
  },
  {
    label: 'Guides',
    links: [
      { title: 'Whole House Generator Cost', blurb: 'Generac unit, install and upkeep', icon: '💲', url: '/generac-generator-cost/' },
      { title: 'How Long Does a Generator Last?', blurb: 'Run hours and years by type', icon: '⏳', url: '/how-long-does-a-generator-last/' },
      { title: 'Best Time to Buy a Generator', blurb: 'Black Friday vs storm week', icon: '📅', url: '/best-time-to-buy-a-generator/' },
      { title: 'EcoFlow vs Bluetti', blurb: 'Class-by-class comparison', icon: '⚖️', url: '/ecoflow-vs-bluetti/' },
      { title: 'All Guides', blurb: 'Costs, lifespans, comparisons', icon: '🧭', url: '/guides/' },
    ],
  },
  {
    label: 'Database',
    links: [
      { title: 'All Backup Power Gear', blurb: 'Every product, one table', icon: '📋', url: '/gear/' },
      { title: 'Brands', blurb: 'Every brand, every product', icon: '🏷️', url: '/brands/' },
      { title: 'Compare Two Products', blurb: 'Spec sheets side by side', icon: '⚖️', url: '/compare/' },
      { title: 'Glossary', blurb: 'Running watts, LiFePO4, interlock…', icon: '📖', url: '/glossary/' },
      { title: 'How We Score', blurb: 'The AMB Score method', icon: '🧮', url: '/how-we-test/' },
    ],
  },
];

export const FOOTER_CATEGORIES = [
  { title: 'Home Generators', url: '/best-home-generator-for-power-outages/' },
  { title: 'Inverter Generators', url: '/best-inverter-generator/' },
  { title: 'Portable Power Stations', url: '/best-portable-power-station/' },
  { title: 'Home Battery Backup', url: '/best-home-battery-backup/' },
  { title: 'Transfer Switches', url: '/best-generator-transfer-switch/' },
  { title: 'Solar Generators', url: '/best-solar-generator/' },
  { title: 'All Best Lists', url: '/best-of/' },
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
