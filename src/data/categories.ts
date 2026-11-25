// Product categories. Order = order on hubs, menus and the home page.
// The backup power categories carry products; the Home & Yard ones hold the older guides only
// (hubs, the footer and /gear/ skip categories with no products).
export interface CategoryInfo {
  key: string;
  label: string; // "Inverter Generators"
  singular: string; // "inverter generator"
  plural: string; // "inverter generators"
  group: 'Generators' | 'Battery Power' | 'Connection & Protection' | 'Outage Essentials' | 'Home & Yard';
  /** Guide that answers "best <category>". */
  hero: string;
  blurb: string;
  icon: string; // SVG path data, 24x24 viewBox
}

export const CATEGORIES: CategoryInfo[] = [
  { key: 'generator', label: 'Home & Portable Generators', singular: 'generator', plural: 'generators', group: 'Generators', hero: 'best-home-generator-for-power-outages', blurb: 'Standby and portable generators sized to your outage loads.', icon: 'M3 8h18v10H3zM6 18v2M18 18v2M7 11h4v4H7zM14 11h4M14 14h4M9 5h6v3H9z' },
  { key: 'inverter', label: 'Inverter Generators', singular: 'inverter generator', plural: 'inverter generators', group: 'Generators', hero: 'best-inverter-generator', blurb: 'Quiet, clean power you can run next to a window.', icon: 'M4 9a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v8H4zM8 6V4h8v2M7 11h4M7 14h4M15.5 12.5m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0M6 17v2M18 17v2' },
  { key: 'dual-fuel', label: 'Dual Fuel Generators', singular: 'dual fuel generator', plural: 'dual fuel generators', group: 'Generators', hero: 'best-dual-fuel-generator', blurb: 'Gasoline and propane in one machine.', icon: 'M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M3 21h12M6.5 7h5v4h-5zM14 10h2a2 2 0 0 1 2 2v4a1.5 1.5 0 0 0 3 0V8l-3-3' },
  { key: 'camping-rv', label: 'Camping & RV Power', singular: 'camping generator', plural: 'camping and RV power picks', group: 'Generators', hero: 'best-generator-for-camping', blurb: 'Generators and power stations for the campsite and RV.', icon: 'M3 20L12 4l9 16zM12 4v16M9 20l3-6 3 6' },
  { key: 'power-station', label: 'Portable Power Stations', singular: 'power station', plural: 'power stations', group: 'Battery Power', hero: 'best-portable-power-station', blurb: 'Battery backup with no fumes, sized in usable watt-hours.', icon: 'M4 7h16v13H4zM8 7V4h8v3M7.5 11h3M7.5 14h3M15 10.5l-2 3h3l-2 3' },
  { key: 'home-battery', label: 'Home Battery Backup', singular: 'home battery', plural: 'home batteries', group: 'Battery Power', hero: 'best-home-battery-backup', blurb: 'Whole-house and plug-in battery systems.', icon: 'M3 11l9-7 9 7v9H3zM13 10.5l-3 4h4l-3 4' },
  { key: 'solar', label: 'Solar Generators & Panels', singular: 'solar panel', plural: 'solar panels and generators', group: 'Battery Power', hero: 'best-solar-generator', blurb: 'Panels and power stations that recharge from the sun.', icon: 'M3 14l2-9h14l2 9zM4 9.5h16M9 5l-1 9M15 5l1 9M12 14v5M8 19h8' },
  { key: 'power-bank', label: 'Power Banks & Chargers', singular: 'power bank', plural: 'power banks and chargers', group: 'Battery Power', hero: 'best-portable-chargers-for-power-outages', blurb: 'Phone and laptop power for a long outage.', icon: 'M7 2h10v20H7zM10 5h4M13 9l-2 3h3l-2 3' },
  { key: 'power-inverter', label: 'Power Inverters', singular: 'power inverter', plural: 'power inverters', group: 'Battery Power', hero: 'best-power-inverter', blurb: 'Car and 12V battery inverters with clean sine-wave output.', icon: 'M3 8h18v11H3zM6 8V6h3v2M15 8V6h3v2M6.5 13.5h3M8 12v3M14.5 13.5h3' },
  { key: 'transfer-switch', label: 'Transfer Switches & Inlets', singular: 'transfer switch', plural: 'transfer switches and inlets', group: 'Connection & Protection', hero: 'best-generator-transfer-switch', blurb: 'The safe, code-compliant way to connect a generator.', icon: 'M5 3h14v18H5zM9 7h6v4H9zM12 11v3M9 17h6' },
  { key: 'surge', label: 'Whole-House Surge Protectors', singular: 'surge protector', plural: 'whole-house surge protectors', group: 'Connection & Protection', hero: 'best-whole-house-surge-protector', blurb: 'Panel-mounted protection for every circuit.', icon: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM13 8l-3 4h4l-3 4' },
  { key: 'ups', label: 'UPS Battery Backups', singular: 'UPS', plural: 'UPS battery backups', group: 'Connection & Protection', hero: 'best-ups-battery-backup', blurb: 'Ride-through power for computers, routers and NAS boxes.', icon: 'M7 3h10v18H7zM10 6h4M10 9.5h4M12 15m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0' },
  { key: 'cpap', label: 'CPAP Battery Backup', singular: 'CPAP battery', plural: 'CPAP batteries', group: 'Connection & Protection', hero: 'best-battery-backup-for-cpap', blurb: 'Batteries sized by nights of sleep.', icon: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z' },
  { key: 'heater', label: 'Outage Heaters', singular: 'outage heater', plural: 'outage heaters', group: 'Outage Essentials', hero: 'best-indoor-heater-for-power-outage', blurb: 'Indoor-safe heat when the furnace is down.', icon: 'M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-3 2-4 2-7 1 1 2 2 2 3 0-2 0-4 1-6z' },
  { key: 'fan', label: 'Battery Powered Fans', singular: 'battery fan', plural: 'battery powered fans', group: 'Outage Essentials', hero: 'best-battery-powered-fan', blurb: 'Cooling that runs off a battery pack.', icon: 'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0M12 12c0-4 1-6 3-6s2 3-3 6zM12 12c4 0 6 1 6 3s-3 2-6-3zM12 12c0 4-1 6-3 6s-2-3 3-6zM12 12c-4 0-6-1-6-3s3-2 6 3z' },
  { key: 'lantern', label: 'Emergency Lanterns', singular: 'lantern', plural: 'emergency lanterns', group: 'Outage Essentials', hero: 'best-emergency-lantern', blurb: 'Outage lights that last the night.', icon: 'M9 3h6M8 6h8l-1 2v9l1 2H8l1-2V8zM12 3V1M12 11v3' },
  { key: 'radio', label: 'Emergency Radios', singular: 'radio', plural: 'emergency radios', group: 'Outage Essentials', hero: 'best-hand-crank-radio', blurb: 'NOAA weather alerts with no grid power.', icon: 'M3 9h18v11H3zM7 9l10-6M7.5 14.5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0M13 12h5M13 15h5M13 18h5' },
  { key: 'fuel-pump', label: 'Fuel Transfer Pumps', singular: 'fuel pump', plural: 'fuel transfer pumps', group: 'Outage Essentials', hero: 'best-fuel-transfer-pump', blurb: 'Move fuel safely from drum to generator.', icon: 'M6 4h12v16H6zM6 9h12M6 15h12M15 4V2' },
  { key: 'driveway', label: 'Driveway & Concrete Sealing', singular: 'driveway sealer', plural: 'driveway and concrete products', group: 'Home & Yard', hero: 'best-driveway-sealer', blurb: 'Sealers, crack fillers and cleaners for asphalt and concrete.', icon: 'M4 20L9 4h6l5 16zM12 6v2M12 11v2M12 16v2' },
  { key: 'garage-floor', label: 'Garage Floors', singular: 'garage floor coating', plural: 'garage floor products', group: 'Home & Yard', hero: 'best-garage-floor-epoxy', blurb: 'Epoxy, coatings and tiles for garage floors.', icon: 'M3 10l9-6 9 6v10H3zM7 20v-6h10v6' },
  { key: 'basement', label: 'Basement & Mold', singular: 'basement product', plural: 'basement and mold products', group: 'Home & Yard', hero: 'best-basement-wall-sealer', blurb: 'Sealers, dehumidifiers and mold control for basements.', icon: 'M3 9l9-6 9 6v12H3zM3 15h18M8 21v-3h8v3' },
  { key: 'deck-exterior', label: 'Deck, Fence & Exterior', singular: 'deck stain', plural: 'deck, fence and exterior products', group: 'Home & Yard', hero: 'best-deck-stain-reviews', blurb: 'Stains, sealers and paint for decks, fences and siding.', icon: 'M3 8h18M3 13h18M3 18h18M6 8v10M12 8v10M18 8v10' },
  { key: 'yard', label: 'Lawn & Yard Equipment', singular: 'yard tool', plural: 'lawn and yard tools', group: 'Home & Yard', hero: 'best-gas-lawn-mowers', blurb: 'Mowers, trimmers, blowers and chainsaws.', icon: 'M12 21V11M12 11c-4 0-6-3-6-7 4 0 6 3 6 7zM12 14c3 0 5-2 5-6-3 0-5 2-5 6M5 21h14' },
  { key: 'tools', label: 'Tools & Workshop', singular: 'tool', plural: 'tools and workshop gear', group: 'Home & Yard', hero: 'best-shop-vac', blurb: 'Shop tools, testers and sprayers.', icon: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z' },
  { key: 'home-systems', label: 'Water Heaters, Water & Flooring', singular: 'home system', plural: 'water heaters, water and flooring', group: 'Home & Yard', hero: 'best-gas-water-heater', blurb: 'Water heaters, filters, flooring and paint.', icon: 'M8 3h8v18H8zM8 8h8M12 12v4' },
  { key: 'grooming', label: 'Grooming', singular: 'grooming tool', plural: 'grooming tools', group: 'Home & Yard', hero: 'best-mens-back-shavers', blurb: 'Grooming tools.', icon: 'M6 3l12 12M14 3l-8 8M9 18a3 3 0 1 1-6 0a3 3 0 0 1 6 0z' },
  { key: 'sleep', label: 'Sleep & Mattresses', singular: 'mattress', plural: 'mattresses', group: 'Home & Yard', hero: 'best-mattress', blurb: 'Mattresses and toppers by sleep position.', icon: 'M3 18v-6h18v6M3 14h18M6 12V9h5v3M3 18v2M21 18v2' },
  { key: 'home-kitchen', label: 'Home & Kitchen', singular: 'appliance', plural: 'home and kitchen products', group: 'Home & Yard', hero: 'best-small-microwave', blurb: 'Small appliances, water filters and laundry.', icon: 'M3 6h18v12H3zM15 6v12M18 10v2' },
];

export const CATEGORY = Object.fromEntries(CATEGORIES.map((c) => [c.key, c])) as Record<string, CategoryInfo>;
