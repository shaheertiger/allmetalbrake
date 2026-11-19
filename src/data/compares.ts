/** Head-to-head pages. Each pair becomes /compare/<a>-vs-<b>/ (slugs sorted alphabetically). */
export const compares: [string, string][] = [
  // Inverter generators
  ['honda-eu2200i', 'yamaha-ef2200is'],
  ['honda-eu2200i', 'champion-201319'],
  ['honda-eu2200i', 'westinghouse-igen4500'],
  ['wen-56380i', 'champion-201319'],
  ['generac-iq5200df', 'westinghouse-igen5000df'],
  ['honda-eu3000is', 'honda-eu3200i'],
  ['honda-eu1000i', 'honda-eu2200i'],
  ['westinghouse-igen4500df', 'westinghouse-igen4500dfc'],
  // Portable and dual fuel generators
  ['westinghouse-wgen9500df', 'champion-9200-dual-fuel'],
  ['duromax-xp13000eh', 'westinghouse-wgen9500df'],
  ['generac-gp7500e-df', 'westinghouse-wgen7500df'],
  ['generac-gp8000e', 'westinghouse-wgen7500df'],
  ['duromax-xp12000eh', 'duromax-xp13000eh'],
  // Power stations
  ['ecoflow-delta-2', 'jackery-explorer-1000-v2'],
  ['anker-solix-c1000', 'ecoflow-delta-2'],
  ['anker-solix-c1000', 'jackery-explorer-1000-v2'],
  ['ecoflow-delta-3-plus', 'jackery-explorer-1000-v2'],
  ['ecoflow-delta-3-plus', 'anker-solix-c1000-gen-2'],
  ['ecoflow-river-3', 'bluetti-eb3a'],
  ['jackery-explorer-300-plus', 'ecoflow-river-3-plus'],
  ['anker-solix-c300x', 'ecoflow-river-3-plus'],
  ['bluetti-ac200l', 'ecoflow-delta-2-max'],
  ['jackery-explorer-2000-v2', 'ecoflow-delta-2-max'],
  ['anker-solix-f3800', 'ecoflow-delta-pro-3'],
  ['jackery-explorer-5000-plus', 'ecoflow-delta-pro-ultra'],
  ['anker-solix-f3800-plus', 'ecoflow-delta-pro-ultra'],
  ['goal-zero-yeti-1500x', 'jackery-explorer-1000-plus'],
  // Home batteries
  ['tesla-powerwall-3', 'enphase-iq-battery-5p'],
  ['tesla-powerwall-3', 'franklinwh-apower-2'],
  ['enphase-iq-battery-5p', 'franklinwh-apower-2'],
  // Solar panels
  ['jackery-solarsaga-100w-solar-panel', 'ecoflow-220w-bifacial-portable-solar-panel'],
  ['anker-solix-ps100-portable-solar-panel', 'jackery-solarsaga-100w-solar-panel'],
  // Connection and protection
  ['reliance-31406crk', 'reliance-31410crk'],
  ['siemens-fs140', 'eaton-chsptultra'],
  ['square-d-hepd80', 'siemens-fs140'],
  ['cyberpower-cp1500pfclcd', 'apc-back-ups-pro-br1500ms2'],
  // Outage essentials
  ['midland-er310', 'eton-frx3-plus'],
  ['mr-heater-big-buddy', 'mr-heater-portable-buddy'],
  ['goal-zero-lighthouse-600', 'biolite-alpenglow-500'],
  ['fill-rite-fr1210g', 'gpi-m-150s'],
];
