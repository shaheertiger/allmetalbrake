// Product categories. Order = order on hubs, menus and the home page.
// Keys match src/content/products/<key>.json and the `hub` field of articles.
import { CATEGORY_LABELS } from './site';

export interface CategoryInfo {
  key: string;
  label: string; // "Inverter Generators"
  singular: string; // "inverter generator"
  plural: string; // "inverter generators"
  group: 'Generators' | 'Battery Power' | 'Connection & Protection' | 'Outage Essentials';
  /** Best list that answers "best <category>". */
  hero: string;
  blurb: string;
  icon: string; // SVG path data, 24x24 viewBox
}

const C = (key: string, singular: string, plural: string, group: CategoryInfo['group'], hero: string, blurb: string, icon: string): CategoryInfo => ({
  key, label: CATEGORY_LABELS[key] ?? key, singular, plural, group, hero, blurb, icon,
});

export const CATEGORIES: CategoryInfo[] = [
  C('generator', 'generator', 'generators', 'Generators', 'best-home-generator-for-power-outages', 'Standby and portable generators sized to your outage loads.', 'M3 8h18v10H3zM6 18v2M18 18v2M7 11h4v4H7zM14 11h4M14 14h4M9 5h6v3H9z'),
  C('inverter', 'inverter generator', 'inverter generators', 'Generators', 'best-inverter-generator', 'Quiet, clean power you can run next to a window.', 'M4 9a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v8H4zM8 6V4h8v2M7 11h4M7 14h4M15.5 12.5m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0M6 17v2M18 17v2'),
  C('dual-fuel', 'dual fuel generator', 'dual fuel generators', 'Generators', 'best-dual-fuel-generator', 'Gasoline and propane in one machine.', 'M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M3 21h12M6.5 7h5v4h-5zM14 10h2a2 2 0 0 1 2 2v4a1.5 1.5 0 0 0 3 0V8l-3-3'),
  C('camping-rv', 'camping generator', 'camping and RV power picks', 'Generators', 'best-generator-for-camping', 'Generators and power stations for the campsite and RV.', 'M3 20L12 4l9 16zM12 4v16M9 20l3-6 3 6'),
  C('power-station', 'power station', 'power stations', 'Battery Power', 'best-portable-power-station', 'Battery backup with no fumes, sized in usable watt-hours.', 'M4 7h16v13H4zM8 7V4h8v3M7.5 11h3M7.5 14h3M15 10.5l-2 3h3l-2 3'),
  C('home-battery', 'home battery', 'home batteries', 'Battery Power', 'best-home-battery-backup', 'Whole-house and plug-in battery systems.', 'M3 11l9-7 9 7v9H3zM13 10.5l-3 4h4l-3 4'),
  C('solar', 'solar panel', 'solar panels and generators', 'Battery Power', 'best-solar-generator', 'Panels and power stations that recharge from the sun.', 'M3 14l2-9h14l2 9zM4 9.5h16M9 5l-1 9M15 5l1 9M12 14v5M8 19h8'),
  C('power-bank', 'power bank', 'power banks and chargers', 'Battery Power', 'best-portable-chargers-for-power-outages', 'Phone and laptop power for a long outage.', 'M7 2h10v20H7zM10 5h4M13 9l-2 3h3l-2 3'),
  C('power-inverter', 'power inverter', 'power inverters', 'Battery Power', 'best-power-inverter', 'Car and 12V battery inverters with clean sine-wave output.', 'M3 8h18v11H3zM6 8V6h3v2M15 8V6h3v2M6.5 13.5h3M8 12v3M14.5 13.5h3'),
  C('transfer-switch', 'transfer switch', 'transfer switches and inlets', 'Connection & Protection', 'best-generator-transfer-switch', 'The safe, code-compliant way to connect a generator.', 'M5 3h14v18H5zM9 7h6v4H9zM12 11v3M9 17h6'),
  C('surge', 'surge protector', 'whole-house surge protectors', 'Connection & Protection', 'best-whole-house-surge-protector', 'Panel-mounted protection for every circuit.', 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM13 8l-3 4h4l-3 4'),
  C('ups', 'UPS', 'UPS battery backups', 'Connection & Protection', 'best-ups-battery-backup', 'Ride-through power for computers, routers and NAS boxes.', 'M7 3h10v18H7zM10 6h4M10 9.5h4M12 15m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0'),
  C('cpap', 'CPAP battery', 'CPAP batteries', 'Connection & Protection', 'best-battery-backup-for-cpap', 'Batteries sized by nights of sleep.', 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z'),
  C('heater', 'outage heater', 'outage heaters', 'Outage Essentials', 'best-indoor-heater-for-power-outage', 'Indoor-safe heat when the furnace is down.', 'M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-3 2-4 2-7 1 1 2 2 2 3 0-2 0-4 1-6z'),
  C('fan', 'battery fan', 'battery powered fans', 'Outage Essentials', 'best-battery-powered-fan', 'Cooling that runs off a battery pack.', 'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0M12 12c0-4 1-6 3-6s2 3-3 6zM12 12c4 0 6 1 6 3s-3 2-6-3zM12 12c0 4-1 6-3 6s-2-3 3-6zM12 12c-4 0-6-1-6-3s3-2 6 3z'),
  C('lantern', 'lantern', 'emergency lanterns', 'Outage Essentials', 'best-emergency-lantern', 'Outage lights that last the night.', 'M9 3h6M8 6h8l-1 2v9l1 2H8l1-2V8zM12 3V1M12 11v3'),
  C('radio', 'radio', 'emergency radios', 'Outage Essentials', 'best-hand-crank-radio', 'NOAA weather alerts with no grid power.', 'M3 9h18v11H3zM7 9l10-6M7.5 14.5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0M13 12h5M13 15h5M13 18h5'),
  C('fuel-pump', 'fuel pump', 'fuel transfer pumps', 'Outage Essentials', 'best-fuel-transfer-pump', 'Move fuel safely from drum to generator.', 'M6 4h12v16H6zM6 9h12M6 15h12M15 4V2'),
];

export const CATEGORY = Object.fromEntries(CATEGORIES.map((c) => [c.key, c])) as Record<string, CategoryInfo>;

/** Category info, with a safe fallback for hub keys that are not product categories ('guides', 'brands'). */
export function categoryOf(key: string | undefined): CategoryInfo {
  if (key && CATEGORY[key]) return CATEGORY[key];
  const label = key === 'brands' ? 'Brand Reviews' : key === 'guides' ? 'Guides' : (key ?? 'Guides');
  return { key: key ?? 'guides', label, singular: 'product', plural: 'products', group: 'Outage Essentials', hero: 'best-of', blurb: '', icon: '' };
}
