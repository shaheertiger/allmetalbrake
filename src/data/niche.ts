// Everything that makes this site about backup power rather than another niche.
// The template code (src/components, src/layouts, src/lib, src/pages except the prose pages and
// tools) is byte-identical to enthusiastreview.com's; only this file, site.config.json,
// categories.ts, nav.ts, authors.ts and the JSON content differ.
import type { Product } from '../lib/data';

/* ------------------------------- header / footer ------------------------------- */

/** Links in the strip under the logo, after the "Best Lists" mega menu. */
export const QUICK_NAV = [
  { label: 'Generators', href: '/best-home-generator-for-power-outages/' },
  { label: 'Inverter', href: '/best-inverter-generator/' },
  { label: 'Power Stations', href: '/best-portable-power-station/' },
  { label: 'Home Batteries', href: '/best-home-battery-backup/' },
  { label: 'Transfer Switches', href: '/best-generator-transfer-switch/' },
  { label: 'All Gear', href: '/gear/' },
  { label: 'Compare', href: '/compare/' },
  { label: 'Tools', href: '/tools/' },
];

/** The free calculators: footer "Database" column, /tools/ hub. */
export const TOOLS = [
  { href: '/tools/generator-wattage-calculator/', label: 'Wattage Calculator', name: 'Generator Wattage Calculator', text: 'Tick the appliances you need in an outage and get the running and starting watts to shop for, with a 240V check.' },
  { href: '/tools/power-station-runtime-calculator/', label: 'Runtime Calculator', name: 'Power Station Runtime Calculator', text: 'How many hours a power station or home battery runs your loads, with inverter losses and solar included.' },
];

/** The niche in a few words, for hub titles and schema names. */
export const NICHE = {
  title: 'Backup Power',
  lower: 'backup power',
  gear: 'Backup Power Gear',
  part: 'product',
  parts: 'products',
  partLower: 'backup power product',
  /** "the right pick depends on the setup" */
  use: 'setup',
  /** What every score and pick is researched against (gear pages). */
  scoreBasis: "the spec sheet, the owner's manual, widely published independent measurements and owner reports",
  /** Same, for guide disclosures. */
  pickBasis: "spec sheets, owner's manuals, widely published independent measurements and owner reports",
  /** Freshness note under an article's sources. */
  articleChecked: "Steps and product details checked against the manufacturers' current instructions and support pages as of",
  footerAbout: 'Every product is matched to the loads it suits, scored against the spec sheet, the manual, independent measurements and owner reports.',
};

/* ----------------------------------- hubs ----------------------------------- */

export const HUBS = {
  bestOf: {
    title: (n: number) => `Best Backup Power Gear (2026): ${n} Buying Guides by Need`,
    description: (n: number) => `${n} backup power buying guides with ranked picks: the best home generator, inverter generator, power station, home battery, transfer switch and outage gear.`,
    h1: 'Backup Power: Every Best List',
    dek: 'Ranked shortlists for every part of an outage plan, matched to the loads you run, your fuel and your budget.',
  },
  gear: {
    title: (n: number, score: string) => `All Backup Power Gear We Track: ${n} Products Rated by ${score}`,
    description: (n: number, score: string) => `All ${n} backup power products we track, ranked by ${score} in each category: generators, power stations, home batteries, switches and outage gear.`,
  },
  brands: {
    description: (score: string) => `Every backup power brand we track, from Honda, Generac and Champion to EcoFlow, Jackery and Bluetti: each lineup, its average ${score} and best model.`,
  },
  compare: {
    description: (n: number) => `${n} head-to-head backup power comparisons: Honda EU2200i vs Yamaha EF2200iS, EcoFlow Delta 2 vs Jackery 1000 v2 and more, with specs, scores and a verdict.`,
  },
  glossary: {
    description: (n: number) => `${n} backup power terms explained with worked numbers: running vs starting watts, THD, LiFePO4, watt-hours, pass-through, transfer switches and interlocks.`,
    dek: 'The spec-sheet words that decide whether a generator or battery can run your loads, each with a worked example.',
  },
  tools: {
    title: 'Free Backup Power Tools: Wattage and Runtime Calculators',
    description: 'Two free backup power calculators: work out what size generator you need in running and starting watts, and how long a power station will run your loads.',
    h1: 'Backup Power Tools',
    dek: 'Quick calculators for the two questions every outage plan raises.',
  },
  notFound: 'This page does not exist. Browse every backup power best list, the products we track, comparisons and calculators on All Metal Brake.',
};

/* --------------------------------- home page --------------------------------- */

export const HOME = {
  /** Guide whose #1 pick is the home page's quick answer. */
  hero: 'best-home-generator-for-power-outages',
  title: (name: string) => `${name}: Independent Backup Power Reviews and Guides`,
  description: (n: number) => `Independent backup power reviews: ${n} generators, power stations, home batteries and outage gear checked against the spec sheet. No paid placements.`,
  kicker: 'Backup power, researched',
  h1: 'Read the Spec Sheet. Keep the Lights On.',
  dek: (n: number, brands: number) => `We match every generator, power station and home battery to the loads it suits: what you need to run, your fuel and the outages you actually get. ${n} products from ${brands} brands, scored.`,
  ctas: [
    { href: '/best-home-generator-for-power-outages/', label: 'Best Home Generators' },
    { href: '/best-portable-power-station/', label: 'Best Power Stations' },
  ],
  answerH2: 'What Is the Best Home Generator for Power Outages?',
  answerLink: (n: number) => `See all ${n} picks in our best home generator guide →`,
  featuredH2: 'Best Backup Power Gear: Picks by Need and Budget',
  promiseH2: 'Built on the Spec Sheet, Not the Marketing',
  promise: (score: string) => `Every product on this site has a page with its full spec sheet, a research-based ${score} out of 100 and a plain verdict: who it suits, who should skip it and what to buy instead. The score weighs specs against the price tier and what owners report after months of use. We do not run a test lab, and we say so on every page. Where performance matters we lean on the broad pattern of independent reviews, never a single cherry-picked chart.`,
  /** "How we're different": [heading, HTML]. */
  different: [
    ['We Do the Load Maths', 'Running and starting watts for your appliances, usable watt-hours after inverter losses, 240V outlets for well pumps, transfer switch sizing: the things that decide whether your backup actually runs the house. Our <a href="/tools/generator-wattage-calculator/">wattage</a> and <a href="/tools/power-station-runtime-calculator/">runtime</a> calculators do the sums for you.'],
    ['Loads First, Product Second', 'We pick for the loads, fuel and budget you actually have, so the best generator for a well pump is not the best one for a campsite.'],
    ['No Paid Placements', 'Manufacturers never see a guide before it is published, and affiliate commissions never change a ranking. <a href="/how-we-review/">How we score</a>.'],
  ] as [string, string][],
  about: (name: string, founded: string) => `${name} has covered backup power since ${founded}. We help you buy the right generator, power station, home battery, transfer switch and outage gear for the loads you actually run, and we tell you plainly when a smaller unit will do.`,
};

/* ------------------------------ text and titles ------------------------------ */

/** Acronyms upper-cased in "<query>: The Short Answer" headings. */
export const ACRONYMS = /\b(ups|cpap|rv|ac|dc|lfp|gfci|btu|kw|kwh|wh)\b/gi;
/** Words that already name the product type, so "<name> <singular>" is not appended in titles. */
export const PRODUCT_NOUNS = 'Generator|Station|Battery|Panel|Switch|Protector|Inverter|Bank|Charger|Lantern|Radio|Fan|Heater|Pump|UPS|Backup|Inlet|Kit|Device';

/** Caption suffix under a product photo, when the listing is one of several versions. */
export const listingNote = (_p: Product) => '';

/* ------------------------ answer-first compare headings ------------------------ */

export type DiffRule = { label: string; topic?: string; more?: string; less?: string; dp?: number; kind?: 'lanes' | 'gen' };
const GEN_RULES: DiffRule[] = [
  { label: 'Running Watts', more: 'delivers {d} more running watts' },
  { label: 'Running Watts (Gas / Propane)', topic: 'Running watts', more: 'delivers {d} more running watts on gas' },
  { label: 'Running / Starting Watts', topic: 'Running watts', more: 'delivers {d} more running watts' },
  { label: 'Starting Watts', more: 'has {d} more starting watts' },
  { label: 'Peak Watts (Gas / Propane)', topic: 'Starting watts', more: 'has {d} more starting watts on gas' },
  { label: 'Run Time at 50% Load', topic: 'Run time', more: 'runs about {d} hour{s} longer at half load' },
  { label: 'Run Time', more: 'runs about {d} hour{s} longer' },
  { label: 'Rated Noise', topic: 'Noise', less: 'is rated {d} dBA quieter' },
  { label: 'Weight', less: 'is {d} lb lighter' },
];
const BATTERY_RULES: DiffRule[] = [
  { label: 'Battery', topic: 'Capacity', more: 'stores {d} Wh more' },
  { label: 'AC Output', more: 'puts out {d} W more continuous AC' },
  { label: 'Continuous Power', more: 'delivers {d} W more continuous power' },
  { label: 'Solar Input', more: 'takes {d} W more solar' },
  { label: 'AC Recharge', topic: 'Wall charging', more: 'charges from the wall at {d} W more' },
  { label: 'Weight', less: 'is {d} lb lighter' },
  { label: 'Warranty', more: 'has a {d}-year longer warranty' },
];
export const DIFF_RULES: Record<string, DiffRule[]> = {
  generator: GEN_RULES,
  'dual-fuel': GEN_RULES,
  inverter: GEN_RULES,
  'camping-rv': GEN_RULES,
  'power-station': BATTERY_RULES,
  'home-battery': BATTERY_RULES,
  solar: [
    { label: 'Rated Power', more: 'is rated {d} W higher' },
    { label: 'Weight', less: 'is {d} lb lighter' },
  ],
  'power-bank': [
    { label: 'Battery', topic: 'Capacity', more: 'holds {d} mAh more' },
    { label: 'Max Output', more: 'puts out {d} W more' },
  ],
  'power-inverter': [
    { label: 'Continuous Power', more: 'delivers {d} W more continuous power' },
    { label: 'Peak Power', more: 'has {d} W more surge' },
  ],
  ups: [
    { label: 'Capacity', more: 'is rated {d} VA higher' },
    { label: 'Weight', less: 'is {d} lb lighter' },
  ],
  cpap: [{ label: 'Battery', topic: 'Capacity', more: 'stores {d} Wh more' }],
  'transfer-switch': [
    { label: 'Amp Rating', more: 'is rated {d} A higher' },
    { label: 'Max Generator Size', more: 'handles a generator {d} W bigger' },
  ],
  surge: [
    { label: 'Surge Current', more: 'absorbs {d} kA more surge current' },
    { label: 'Warranty', more: 'has a {d}-year longer warranty' },
  ],
  heater: [{ label: 'Heat Output', more: 'puts out {d} BTU more heat' }],
  fan: [
    { label: 'Runtime', more: 'runs about {d} hour{s} longer' },
    { label: 'Blade Size', more: 'has a {d}-inch bigger blade' },
  ],
  lantern: [{ label: 'Brightness', more: 'is {d} lumens brighter' }],
  'fuel-pump': [{ label: 'Flow Rate', more: 'moves {d} GPM more' }],
};

/* ---------------------------------- interlinking ---------------------------------- */

export interface Series {
  key: string;
  heading: string;
  re: RegExp;
  hub?: { href: string; text: string };
}
/** Page families: every member links every sibling (first match wins). */
export const SERIES: Series[] = [
  { key: 'generator-for', heading: 'Best Generator for Other Jobs', re: /^best-(generator|inverter-generator)-for-|^best-(small|gas|quiet|portable|whole-house)-generator|^best-dual-fuel-(inverter-)?generator$/, hub: { href: '/tools/generator-wattage-calculator/', text: 'Generator wattage calculator: size it to your loads' } },
  { key: 'battery-for', heading: 'Battery Backup for Other Jobs', re: /^best-(portable-power-station|power-station|battery-backup|solar-generator|home-battery|solar-power-bank|portable-chargers?)/, hub: { href: '/tools/power-station-runtime-calculator/', text: 'Runtime calculator: how long will it run?' } },
  { key: 'brand-vs', heading: 'More Brand Comparisons', re: /^[a-z]+-vs-[a-z]+$/ },
  { key: 'brands', heading: 'Is It a Good Brand? More Brand Reviews', re: /^best-(anker|jackery|bluetti|generac|honda|champion)-/ },
  { key: 'costs', heading: 'More Costs, Lifespans and Timing', re: /-cost$|^how-long-|^best-time-to-buy-/ },
  { key: 'outage', heading: 'More Outage Gear', re: /^best-(indoor-heater|emergency-lantern|hand-crank-radio|battery-powered-fan|fuel-transfer-pump|ups-battery|whole-house-surge|generator-transfer-switch|power-inverter)/ },
  // The older home and yard guides, grouped by subject.
  { key: 'driveway', heading: 'More Driveway and Concrete Guides', re: /driveway|asphalt|concrete|paver|polymeric|brick|stone-seal|granite|marble|stamped/ },
  { key: 'deck', heading: 'More Deck, Fence and Exterior Guides', re: /deck|fence|redwood|teak|cedar|chimney|wood-sealer|caulk|exterior/ },
  { key: 'garage', heading: 'More Garage Floor Guides', re: /garage-floor|epoxy|acid-etching/ },
  { key: 'basement', heading: 'More Basement and Mold Guides', re: /basement|cinder-block|mold|dehumidifier|sump/ },
  { key: 'yard', heading: 'More Lawn and Yard Guides', re: /lawn|mower|trimmer|leaf|chainsaw|tractor|hookaroon|weed|log-splitter|snow/ },
];

/** "best <x> for <part>" guides: the part slug is group 1. Slugs in SUBJECT_SKIP are not parts. */
export const SUBJECT_RE = /^$/;
export const SUBJECT_SKIP: string[] = [];

/** Chart pages that map one brand's models to another's (hub at /equivalents/). None here. */
export const EQUIVALENTS_RE = /^$/;

/** The equivalents chart that maps this product to its rivals. */
export function equivalentsSlug(_p: Product): string | undefined {
  return undefined;
}

/** Charts linked first on a cross-brand compare page. */
export function compareEquivalents(_a: Product, _b: Product): string[] {
  return [];
}
