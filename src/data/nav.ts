// Site navigation: every article on the site, grouped the way the header,
// mobile menu, footer, home page and /best-of/ present them.
//
// `header: true` groups get a dropdown in the desktop header, which shows the
// first HEADER_LINKS links and an "all guides" link to the group's section on
// /best-of/. Every group is listed in full on /best-of/ and in the mobile menu.
export interface NavLink { title: string; url: string; blurb: string }
export interface NavGroup { label: string; icon: string; header?: boolean; links: NavLink[] }

export const HEADER_LINKS = 6;

export const groupId = (label: string) => label.toLowerCase().replace(/[^a-z]+/g, '-');

const l = (url: string, title: string, blurb: string): NavLink => ({ title, url: `/${url}/`, blurb });

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Generators',
    icon: '⚡',
    header: true,
    links: [
      l('best-home-generator-for-power-outages', 'Best Home Generators for Outages', 'Standby, portable and inverter picks'),
      l('best-dual-fuel-generator', 'Best Dual Fuel Generators', 'Gas and propane in one machine'),
      l('best-inverter-generator', 'Best Inverter Generators', 'Quiet, clean power'),
      l('best-dual-fuel-inverter-generator', 'Best Dual Fuel Inverter Generators', 'Quiet power on gas or propane'),
      l('best-small-generator-for-home', 'Best Small Generators for Home', 'Quiet, compact backup power'),
      l('best-gas-generator', 'Best Gas Generators', 'Gasoline portables compared'),
      l('best-generator-for-well-pump', 'Best Generators for Well Pumps', '240V picks sized by horsepower'),
      l('generac-generator-cost', 'Whole House Generator Cost', 'Generac unit, install and upkeep'),
      l('how-long-does-a-generator-last', 'How Long a Generator Lasts', 'Run hours and years by type'),
      l('best-time-to-buy-a-generator', 'Best Time to Buy a Generator', 'Black Friday vs storm week'),
      l('best-generator-transfer-switch', 'Best Generator Transfer Switches', 'Manual, interlock and inlet picks'),
      l('best-fuel-transfer-pump', 'Best Fuel Transfer Pumps', 'Refuel generators safely'),
      l('best-whole-house-surge-protector', 'Best Whole-House Surge Protectors', 'Panel-mounted protection'),
    ],
  },
  {
    label: 'Power Stations & Batteries',
    icon: '🔋',
    header: true,
    links: [
      l('best-portable-power-station', 'Best Portable Power Stations', 'Battery backup without the fumes'),
      l('best-portable-power-station-for-home-backup', 'Best Power Stations for Home Backup', 'Sized by the loads you keep on'),
      l('best-home-battery-backup', 'Best Home Battery Backup', 'Whole-house and plug-in systems'),
      l('best-solar-generator', 'Best Solar Generators', 'Power stations matched to panels'),
      l('best-portable-solar-panel', 'Best Portable Solar Panels', 'Connectors, Voc limits, real output'),
      l('best-ecoflow-power-station', 'Best EcoFlow Power Stations', 'Every model by job'),
      l('best-jackery-power-station', 'Best Jackery Power Stations', 'Explorer v2 and Plus by use'),
      l('best-anker-solix-power-station', 'Best Anker SOLIX Power Stations', 'Every SOLIX model sorted'),
      l('ecoflow-vs-jackery', 'EcoFlow vs Jackery', 'Which brand to buy'),
      l('ecoflow-vs-bluetti', 'EcoFlow vs Bluetti', 'Class-by-class comparison'),
      l('best-ups-battery-backup', 'Best UPS Battery Backups', 'Computers, routers, home office'),
      l('best-battery-pack-with-ac-outlet', 'Best Battery Packs With AC Outlet', 'What 300 watts really runs'),
      l('best-power-inverter', 'Best Power Inverters', '12V picks for cars, trucks, RVs'),
    ],
  },
  {
    label: 'Outage Essentials',
    icon: '🔦',
    header: true,
    links: [
      l('best-battery-backup-for-cpap', 'Best Battery Backup for CPAP', 'Sized by nights of sleep'),
      l('best-indoor-heater-for-power-outage', 'Best Indoor Heaters for Outages', 'Safe emergency heat'),
      l('best-portable-chargers-for-power-outages', 'Best Portable Chargers for Outages', 'Power banks to stations'),
      l('best-solar-power-bank', 'Best Solar Power Banks', 'What really charges from the sun'),
      l('best-hand-crank-radio', 'Best Hand Crank Radios', 'NOAA alerts for outages'),
      l('best-emergency-lantern', 'Best Emergency Lanterns', 'Outage lights that last'),
      l('best-battery-powered-fan', 'Best Battery Powered Fans', 'Runtime by battery size'),
    ],
  },
  {
    label: 'Camping & RV Power',
    icon: '🏕️',
    header: true,
    links: [
      l('best-portable-power-station-for-camping', 'Best Power Stations for Camping', 'Sized by trip'),
      l('best-generator-for-camping', 'Best Generators for Camping', 'Quiet inverters that pack small'),
      l('best-rv-generator', 'Best RV Generators', 'Sized for the rooftop AC'),
    ],
  },
];

export const HEADER_GROUPS = NAV_GROUPS.filter((g) => g.header);
