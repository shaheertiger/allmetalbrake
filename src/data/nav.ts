// Site navigation: every article on the site, grouped the way the header,
// mobile menu and footer present them.
export interface NavLink { title: string; url: string; blurb: string }
export interface NavGroup { label: string; icon: string; links: NavLink[] }

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Power & Generators',
    icon: '⚡',
    links: [
      { title: 'Best Home Generators for Outages', url: '/best-home-generator-for-power-outages/', blurb: 'Standby, portable and inverter picks' },
      { title: 'Best Portable Power Stations', url: '/best-portable-power-station/', blurb: 'Battery backup without the fumes' },
      { title: 'Best Small Generators for Home', url: '/best-small-generator-for-home/', blurb: 'Quiet, compact backup power' },
      { title: 'Best Gas Generators', url: '/best-gas-generator/', blurb: 'Gasoline portables compared' },
    ],
  },
  {
    label: 'Driveway & Concrete',
    icon: '🛣️',
    links: [
      { title: 'Best Asphalt Driveway Sealers', url: '/best-asphalt-driveway-sealer-reviews/', blurb: 'Coverage, cure time and wear' },
      { title: 'Best Concrete Driveway Sealers', url: '/best-concrete-driveway-sealer-reviews/', blurb: 'Penetrating vs film-forming' },
      { title: 'Cost to Seal a Driveway', url: '/how-much-does-it-cost-to-seal-a-driveway/', blurb: 'DIY vs pro, by square foot' },
      { title: 'When to Seal a New Asphalt Driveway', url: '/when-should-you-seal-a-new-asphalt-driveway/', blurb: 'The cure window that matters' },
      { title: 'How to Get Oil Out of Concrete', url: '/how-to-get-oil-out-of-concrete/', blurb: 'Fresh spills to old stains' },
      { title: 'Remove Oil Stains From a Driveway', url: '/how-to-remove-oil-stains-from-driveway/', blurb: 'Methods ranked by result' },
    ],
  },
  {
    label: 'Garage & Floors',
    icon: '🏠',
    links: [
      { title: 'Best Garage Floor Epoxy', url: '/best-garage-floor-epoxy/', blurb: 'Kits that survive hot tires' },
      { title: 'Epoxy Garage Floor Cost', url: '/epoxy-garage-floor-cost/', blurb: 'What DIY and pro jobs run' },
      { title: 'Best Garage Floor Tiles', url: '/best-garage-floor-tiles/', blurb: 'Interlocking tiles tested' },
      { title: 'Best Concrete Floor Paint', url: '/best-concrete-floor-paint/', blurb: 'Basements, patios and garages' },
      { title: 'Best Vinyl Plank Flooring', url: '/best-vinyl-plank-flooring/', blurb: 'Wear layers and waterproofing' },
    ],
  },
  {
    label: 'Basement & Water',
    icon: '💧',
    links: [
      { title: 'Best Basement Wall Sealers', url: '/best-basement-wall-sealer/', blurb: 'Stop seepage at the wall' },
      { title: 'Best Dehumidifiers for Basements', url: '/best-dehumidifier-for-basement/', blurb: 'Sized for damp below-grade air' },
      { title: 'Best Mold Removers', url: '/best-mold-remover/', blurb: 'What actually kills it' },
      { title: 'Best Gas Water Heaters', url: '/best-gas-water-heater/', blurb: 'Tank models compared' },
      { title: 'Best Water Filtration Systems', url: '/best-water-filtration-system-for-home/', blurb: 'Whole-house and under-sink' },
      { title: 'Best Water Filter Pitchers', url: '/best-water-filter-pitcher/', blurb: 'Certified pitchers ranked' },
    ],
  },
  {
    label: 'Yard & Tools',
    icon: '🛠️',
    links: [
      { title: 'Best Zero-Turn Mowers', url: '/best-zero-turn-mower/', blurb: 'Residential zero-turns tested' },
      { title: 'Best Self-Propelled Mowers', url: '/best-self-propelled-lawn-mower/', blurb: 'Gas and battery walk-behinds' },
      { title: 'Best Compact Tractors', url: '/best-compact-tractor/', blurb: 'Sub-compact to compact' },
      { title: 'Best Shop Vacs', url: '/best-shop-vac/', blurb: 'Wet/dry vacs for garage work' },
      { title: 'Best Stud Finders', url: '/best-stud-finder/', blurb: 'Accuracy through plaster and tile' },
      { title: 'Milwaukee vs DeWalt', url: '/milwaukee-vs-dewalt/', blurb: 'Which battery platform to buy into' },
      { title: 'Best Exterior Caulk', url: '/best-exterior-caulk/', blurb: 'Siding, trim and windows' },
      { title: 'Best Deck Stains', url: '/best-deck-stain-reviews/', blurb: 'Two-season weathering results' },
      { title: 'Best Gutter Guards', url: '/best-gutter-guards/', blurb: 'Mesh, screen and reverse-curve' },
    ],
  },
];
