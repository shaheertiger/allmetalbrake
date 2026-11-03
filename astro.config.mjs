import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// Buyer's guides that target high-volume search terms. They get a higher
// sitemap priority than the 0.5 default so crawlers reach them sooner.
const priorityGuides = new Set([
  // November 2026: every guide on the site (fresh rewrites of the 124 THR pages with clicks).
  'best-asphalt-driveway-sealer-reviews',
  'best-driveway-sealer',
  'blacktop-driveway-sealer',
  'best-asphalt-sealer',
  'latex-ite-driveway-sealer-review',
  'driveway-sealer-home-depot',
  'driveway-sealer-menards',
  'oil-based-vs-water-based-driveway-sealer',
  'asphalt-sealcoating',
  'how-to-seal-a-driveway',
  'how-much-does-it-cost-to-seal-a-driveway',
  'when-should-you-seal-a-new-asphalt-driveway',
  'how-long-for-driveway-sealer-to-dry',
  'sealing-asphalt-driveway-pros-and-cons',
  'best-time-to-seal-driveway',
  'what-temperature-to-seal-driveway',
  'how-often-should-you-seal-your-driveway',
  'rain-after-driveway-sealing',
  'how-to-remove-moss-from-asphalt-driveway',
  'best-driveway-crack-filler',
  'best-driveway-paint-reviews',
  'how-to-remove-oil-stains-from-driveway',
  'how-to-get-oil-out-of-concrete',
  'best-oil-stain-remover-for-concrete',
  'best-driveway-cleaner',
  'best-surface-cleaner-for-pressure-washer',
  'best-concrete-driveway-sealer-reviews',
  'how-to-seal-a-concrete-driveway',
  'best-concrete-sealer',
  'best-penetrating-concrete-sealer',
  'best-stamped-concrete-sealer',
  'silane-vs-siloxane-sealers',
  'best-granite-sealer',
  'best-marble-sealer',
  'best-grout-sealer',
  'best-brick-sealer-reviews',
  'best-chimney-sealer',
  'best-polymeric-sand-for-pavers',
  'best-polymeric-sand',
  'how-to-use-polymeric-sand',
  'polymeric-sand-vs-regular-sand-for-pavers',
  'polymeric-sand-pros-and-cons',
  'best-paver-sealer',
  'best-water-based-paver-sealer-reviews',
  'how-to-stain-concrete-patio-to-look-like-stone',
  'best-ice-melt-for-concrete',
  'best-garage-floor-epoxy',
  'epoxy-garage-floor-cost',
  'best-garage-floor-coating',
  'how-to-apply-garage-floor-epoxy',
  'rust-oleum-epoxyshield-review',
  'best-garage-floor-tiles',
  'best-concrete-floor-paint',
  'best-concrete-floor-coating',
  'best-basement-floor-paint',
  'best-porch-paint',
  'best-ceiling-paint',
  'best-paint-sprayer',
  'best-basement-wall-sealer',
  'how-to-waterproof-a-basement',
  'best-basement-waterproofing-systems',
  'how-to-fix-a-damp-basement',
  'best-cinder-block-sealer-reviews',
  'best-paint-for-cinder-block',
  'best-dehumidifier-for-basement',
  'best-air-purifier-for-mold',
  'best-mold-remover',
  'best-whole-house-fan',
  'best-gas-water-heater',
  'best-heat-pump-water-heater',
  'best-water-filter-pitcher',
  'best-water-filtration-system-for-home',
  'best-drain-snake',
  'best-whole-house-surge-protector',
  'best-circuit-breaker-finder',
  'best-home-generator-for-power-outages',
  'best-portable-power-station',
  'best-solar-generator',
  'best-portable-power-station-for-home-backup',
  'best-portable-power-station-for-camping',
  'ecoflow-vs-jackery',
  'best-portable-chargers-for-power-outages',
  'best-charging-station',
  'best-usb-c-charger',
  'best-battery-pack-with-ac-outlet',
  'best-portable-ev-charger',
  'best-car-battery',
  'best-miter-saw-stand',
  'best-jobsite-table-saw',
  'best-chest-freezer',
  'best-small-microwave',
  'best-heated-lunch-box',
  'best-portable-blender',
  'best-small-window-air-conditioner',
  'best-portable-washer',
  'best-portable-dryer',
  'best-dryer-cord',
  'best-home-energy-monitor',
  'best-battery-powered-water-pump',
  'best-generator-transfer-switch',
  'best-fuel-transfer-pump',
  'best-rv-power-adapter',
  'best-ecoflow-power-station',
  'best-jackery-power-station',
  'best-anker-solix-power-station',
  'ecoflow-vs-bluetti',
  'best-home-battery-backup',
  'best-ups-battery-backup',
  'best-power-inverter',
  'best-lithium-rv-battery',
  'best-battery-backup-for-cpap',
  'best-solar-power-bank',
  'best-portable-solar-panel',
  'best-12v-fridge-for-camping',
  'best-portable-air-conditioner-for-camping',
  'best-battery-powered-fan',
  'best-emergency-lantern',
  'best-laptop-power-bank',
  'best-rv-generator',
  'best-generator-for-camping',
  'best-generator-for-well-pump',
  'best-indoor-heater-for-power-outage',
  'best-small-generator-for-home',
  'best-gas-generator',
  'generac-generator-cost',
  'best-deck-stain-reviews',
  'best-deck-stain-for-pressure-treated-wood',
  'best-deck-stain-for-cedar',
  'best-oil-based-deck-stain',
  'deck-stain-drying-time',
  'deck-stain-colors-guide',
  'best-deck-sealant',
  'best-deck-paint',
  'best-exterior-wood-sealer',
  'best-redwood-sealer',
  'best-fence-stain',
  'can-you-stain-pressure-treated-wood',
  'best-exterior-caulk',
  'how-long-does-caulk-take-to-dry',
  'how-to-caulk-exterior-windows',
  'best-wood-filler',
  'best-gutter-guards',
  'best-self-propelled-lawn-mower',
  'best-zero-turn-mower',
  'best-riding-lawn-mower',
  'best-gas-lawn-mowers',
  'best-lawn-mower-for-small-yard',
  'best-compact-tractor',
  'best-weed-killer',
  'best-weed-eater',
  'best-cordless-leaf-blower',
  'best-chainsaw',
  'best-log-splitter',
  'best-hookaroon-reviews',
  'best-electric-pressure-washer',
  'best-pressure-washer',
  'best-shop-vac',
  'best-benchtop-planer',
  'milwaukee-vs-dewalt',
  'ryobi-tools-review',
  'tekton-tools-review',
  'best-torque-wrench',
  'best-stud-finder',
  'best-laser-level',
  'best-vinyl-plank-flooring',
  'best-laminate-flooring',
  'rust-converter-vs-rust-remover',
  'best-mens-back-shavers',
  'buzz-cut-guide',
  // October 2026: legacy-domain keywords with no page (sealers, sand, doors, Tekton).
  'armor-ar350-vs-ar500',
  'should-you-seal-concrete',
  'how-to-stain-a-concrete-patio',
  'french-barn-doors',
  'pocket-door-vs-barn-door',
  'tekton-vs-stanley',
  'black-concrete-driveway',
  'how-to-keep-sand-between-pavers',
  'redwood-fence-stain',
  'how-to-stain-a-redwood-deck',
  'semco-teak-sealer-review',
  'tuff-duck-concrete-countertop-sealer-review',
  'stonetech-bulletproof-sealer-review',
  'how-to-seal-marble-floor-tile',
  'how-to-apply-teak-oil',
  'barn-door-cost',
  'how-to-apply-polyurethane-without-brush-marks',
  'how-to-seal-fireplace-brick',
  'silica-sand-for-pavers',
  'alliance-gator-polymeric-sand-review',
  'henry-driveway-sealer-review',
  'tekton-sockets-review',
  'masonry-defender-review',
  // October 2026: Semrush keyword-gap batch (water heaters, dehumidifiers, humidifiers, shop vacs).
  'water-heater-replacement-cost',
  'how-to-drain-a-water-heater',
  'water-heater-anode-rod-replacement',
  'water-heater-expansion-tank',
  'water-heater-leaking',
  'how-to-tell-the-age-of-a-water-heater',
  'water-heater-pressure-relief-valve',
  'water-heater-element',
  'best-propane-tankless-water-heater',
  'how-to-choose-a-dehumidifier',
  'does-a-dehumidifier-get-rid-of-silverfish',
  'does-a-dehumidifier-get-rid-of-centipedes',
  'best-bathroom-dehumidifier',
  'best-dehumidifier-for-bedroom',
  'does-a-humidifier-help-with-congestion',
  'humidifier-for-nosebleeds',
  'best-ultrasonic-humidifier',
  'best-evaporative-humidifier',
  'ridgid-shop-vac-review',
  'best-christmas-gifts-for-men',
  'christmas-gifts-for-men-under-50',
  'christmas-gifts-for-men-who-have-everything',
  'best-electric-space-heater',
  'small-brown-bugs-in-house',
  'small-black-flying-bugs-in-house',
  'best-battery-string-trimmer',
  'best-under-cabinet-lighting',
  'what-temperature-should-a-refrigerator-be',
  'how-often-should-you-seal-a-deck',
  'how-long-does-deck-sealer-take-to-dry',
  'does-thompsons-water-seal-work',
  'should-you-seal-pressure-treated-wood',
  'how-much-does-it-cost-to-seal-a-deck',
  'how-long-does-concrete-paint-take-to-dry',
  'concrete-stain-vs-paint',
  'how-to-paint-a-concrete-floor',
  'why-is-my-concrete-floor-paint-peeling',
  'how-much-does-it-cost-to-paint-a-concrete-floor',
  'heated-driveway-cost',
  'does-salt-damage-concrete',
  'gravel-driveway-cost',
  'tar-and-chip-vs-asphalt',
  'asphalt-millings-driveway',
  'how-long-does-asphalt-take-to-cure',
  'concrete-leveling-cost',
  'mudjacking-vs-polyjacking',
  'concrete-patio-cost',
  'how-long-does-concrete-take-to-cure',
  'how-long-does-concrete-sealer-take-to-dry',
  'pavers-vs-concrete',
  'can-you-pour-concrete-in-the-rain',
  'crawl-space-encapsulation-cost',
  'sump-pump-installation-cost',
  'pedestal-vs-submersible-sump-pump',
  'foundation-crack-repair-cost',
  'french-drain-cost',
  'mold-remediation-cost',
  'radon-mitigation-cost',
  'can-you-put-hot-water-in-a-pressure-washer',
  'how-long-do-electric-pressure-washers-last',
  'why-is-my-pressure-washer-pulsing',
  'how-long-can-a-pressure-washer-run-without-water',
  'can-you-use-dish-soap-in-a-pressure-washer',
  'how-much-does-a-pressure-washer-cost',
  'can-you-pressure-wash-a-deck',
  'can-you-use-bleach-in-a-pressure-washer',
  'does-a-hepa-filter-remove-mold-spores',
  'can-mold-grow-in-an-air-purifier',
  'how-often-to-change-air-purifier-filter',
  'do-air-purifiers-produce-ozone',
  'how-long-does-it-take-an-air-purifier-to-clean-a-room',
  'how-much-electricity-does-an-air-purifier-use',
  'should-you-run-an-air-purifier-24-7',
  'can-you-use-stainless-steel-on-induction',
  'can-you-use-aluminum-on-induction',
  'can-you-use-nonstick-pans-on-induction',
  'why-is-my-induction-cooktop-buzzing',
  'is-induction-cooking-safe',
  'induction-vs-electric-cooktop',
  'does-induction-cooking-use-more-electricity',
  'can-a-portable-power-station-run-a-space-heater',
  'can-a-portable-power-station-run-an-air-conditioner',
  'how-long-does-it-take-to-charge-a-portable-power-station',
  'are-portable-power-stations-worth-it',
  'what-do-the-numbers-on-a-drill-mean',
  '18v-vs-20v-drill',
  '12v-vs-18v-drill',
  'how-long-do-cordless-drill-batteries-last',
  'when-to-fertilize-lawn',
  'when-to-aerate-lawn',
  'when-to-dethatch-lawn',
  'how-long-does-it-take-grass-seed-to-grow',
  'how-long-do-water-heaters-last',
  'how-long-do-water-softeners-last',
  'why-does-my-water-smell-like-rotten-eggs',
  'how-often-to-change-brita-filter',
  'how-long-do-dishwashers-last',
  'how-long-do-garage-door-openers-last',
  'how-long-do-mini-splits-last',
  'how-long-do-sump-pumps-last',
  'can-you-paint-over-wallpaper',
  'how-long-does-polyurethane-take-to-dry',
  'how-long-does-wood-filler-take-to-dry',
  'can-you-caulk-over-caulk',
  'is-laminate-flooring-waterproof',
  'how-long-does-a-radon-test-take',
  'do-air-purifiers-help-with-dust',
  'how-tight-should-a-chainsaw-chain-be',
  'best-electric-tankless-water-heater',
  'best-attic-fan',
  'best-mold-remover',
  'best-moisture-meter',
  'best-garage-door-opener',
  'best-hedge-trimmer',
  'best-pole-saw',
  'best-lawn-edger',
  'best-chainsaw-sharpener',
  'best-leaf-vacuum',
  'best-miter-saw',
  'best-reciprocating-saw',
  'best-angle-grinder',
  'best-wood-filler',
  'best-garden-hose-nozzle',
  'condensing-vs-non-condensing-tankless-water-heater',
  'tankless-water-heater-not-heating',
  'how-long-do-tankless-water-heaters-last',
  'does-uv-light-kill-mold',
  'do-ozone-generators-kill-mold',
  'whole-house-fan-vs-attic-fan',
  'ceiling-fan-light-not-working',
  'dc-vs-ac-ceiling-fan',
  'how-to-find-a-stud-without-a-stud-finder',
  'does-vinegar-kill-weeds',
  'how-to-kill-weeds-in-driveway-cracks',
  'how-to-restring-a-weed-eater',
  'zero-turn-vs-riding-mower',
  'self-propelled-mower-not-self-propelling',
  'lvp-vs-laminate',
  'do-air-purifiers-help-with-mold',
  'air-purifier-vs-dehumidifier',
  'how-to-get-rid-of-mold-in-basement',
  'what-pans-work-on-induction',
  'does-cast-iron-work-on-induction',
  'induction-vs-gas-cooktop',
  'where-are-tekton-tools-made',
  'tekton-vs-icon',
  'bluetti-vs-ecoflow',
  'ryobi-vs-dewalt',
  'tankless-water-heater-cost',
  'tankless-water-heater-pros-and-cons',
  'how-to-flush-a-tankless-water-heater',
  'what-size-tankless-water-heater-do-i-need',
  'ceiling-fan-direction-summer-and-winter',
  'what-size-ceiling-fan-do-i-need',
  'why-is-my-ceiling-fan-wobbling',
  'jackery-vs-ecoflow',
  'generac-vs-kohler',
  'ryobi-vs-greenworks-pressure-washer',
  'best-impact-wrench',
  'best-oscillating-tool',
  'best-lawn-aerator',
  'best-dethatcher',
  'best-lawn-sweeper',
  'best-broadcast-spreader',
  'best-solar-generator',
  'best-portable-solar-panel',
  'best-primer',
  'best-garage-door-bottom-seal',
  'best-concrete-crack-filler',
  'best-concrete-resurfacer',
  'best-asphalt-patch',
  'best-paver-cleaner',
  'best-sump-pump',
  'best-battery-backup-sump-pump',
  'best-crawl-space-dehumidifier',
  'best-dehumidifier-with-pump',
  'best-radon-detector',
  'best-hygrometer',
  'best-lawn-mower-for-hills',
  'best-mulching-mower',
  'best-reel-mower',
  'best-lawn-mower-blades',
  'best-impact-driver',
  'best-cordless-circular-saw',
  'best-painters-tape',
  'best-interior-paint',
  'best-garage-heater',
  'best-gutter-sealant',
  'how-to-tell-if-granite-needs-sealing',
  'how-to-seal-granite-countertops',
  'how-often-to-seal-granite-countertops',
  'how-to-remove-stains-from-granite',
  'impregnating-vs-topical-stone-sealer',
  'acrylic-vs-penetrating-concrete-sealer',
  'how-much-concrete-sealer-do-i-need',
  'how-long-does-concrete-sealer-last',
  'concrete-sealer-cost',
  'how-many-coats-of-concrete-sealer',
  'what-temperature-to-seal-driveway',
  'driveway-sealer-streaks',
  'how-to-remove-driveway-sealer-from-concrete',
  'diy-vs-professional-driveway-sealing',
  'sand-additive-for-driveway-sealer',
  'acrylic-vs-asphalt-emulsion-driveway-sealer',
  'driveway-sealer-vs-resurfacer',
  'how-to-fix-alligator-cracks-in-asphalt-driveway',
  'is-driveway-sealer-toxic',
  'driveway-sealer-tire-marks',
  'epoxy-garage-floor-peeling',
  'hot-tire-pickup-epoxy-garage-floor',
  'epoxy-garage-floor-moisture-test',
  'acid-etching-vs-grinding-garage-floor',
  'water-based-vs-100-solids-epoxy',
  'epoxy-garage-floor-bubbles',
  'deck-stain-peeling',
  'how-long-to-wait-to-stain-a-new-deck',
  'what-temperature-to-stain-a-deck',
  'do-you-need-to-sand-a-deck-before-staining',
  'how-much-deck-stain-do-i-need',
  'deck-stain-not-drying',
  'efflorescence-on-basement-walls',
  'best-basement-waterproofing-supplies',
  'how-much-drylok-do-i-need',
  'what-size-sump-pump-do-i-need',
  'vapor-barrier-vs-waterproofing-membrane',
  'how-to-use-hydraulic-cement',
  'basement-water-alarm',
  'hydrostatic-pressure-in-basement',
  'basement-drainage-system',
  'basement-moisture-control',
  'waterproofing-cinder-block-basement-walls',
  'caulk-for-basement-wall-cracks',
  'basement-leaking-where-floor-meets-wall',
  'can-you-run-a-generator-in-the-rain',
  'best-spackle',
  'best-tile-sealer',
  'best-polyurethane-for-furniture',
  'best-paint-for-cinder-block',
  'best-penetrating-concrete-sealer',
  'best-concrete-mix',
  'best-roller-for-polyurethane',
  'best-flagstone-sealer',
  'best-barn-doors',
  'best-bathroom-caulk',
  'best-caulk-gun',
  'best-cordless-tool-brand',
  'dewalt-vs-makita',
  'milwaukee-vs-ryobi',
  'how-to-caulk-exterior-windows',
  'how-to-remove-old-caulk',
  'how-long-does-caulk-take-to-dry',
  'where-not-to-caulk',
  'silicone-vs-latex-caulk',
  'caulk-vs-sealant',
  'polyurethane-vs-silicone-caulk',
  'best-weed-killer',
  'best-pressure-washer',
  'best-electric-pressure-washer',
  'best-stud-finder',
  'best-electric-lawn-mower',
  'best-dehumidifier-for-basement',
  'what-size-dehumidifier-for-basement',
  'what-should-a-basement-dehumidifier-be-set-at',
  'where-to-place-a-dehumidifier-in-a-basement',
  'do-i-need-a-dehumidifier-in-my-basement',
  'how-to-keep-a-basement-dry-without-a-dehumidifier',
  'how-to-drain-a-dehumidifier-without-a-floor-drain',
  'will-a-dehumidifier-get-rid-of-musty-basement-smell',
  'will-a-basement-dehumidifier-help-the-whole-house',
  'how-much-electricity-does-a-dehumidifier-use',
  'whole-house-vs-portable-dehumidifier',
  'best-garden-hose',
  'best-snow-blower',
  'best-leaf-blower',
  'best-cordless-leaf-blower',
  'best-string-trimmer',
  'best-shop-vac',
  'best-riding-lawn-mower',
  'best-battery-powered-lawn-mower',
  'best-push-mower',
  'best-portable-power-station',
  'best-grass-seed',
  'best-fertilizer-for-grass',
  'best-electric-snow-blower',
  'best-laser-level',
  'best-weed-eater',
  'best-torque-wrench',
  'best-expandable-garden-hose',
  'best-hose-reel',

  // August 2026 batch: water heaters, flooring, home systems and workshop tools.
  'best-tankless-water-heater',
  'best-gas-water-heater',
  'best-laminate-flooring',
  'best-vinyl-plank-flooring',
  'best-underlayment-for-vinyl-plank-flooring',
  'best-tile-leveling-system',
  'best-grout-sealer',
  'best-air-purifier-for-smoke',
  'best-whole-house-fan',
  'best-whole-house-surge-protector',
  'best-circuit-breaker-finder',
  'best-drain-snake',
  'best-belt-sander',
  'best-drywall-sander',
  'best-palm-sander',
  'best-telescoping-ladder',
  'best-attic-ladder',
  'best-jigsaw',
  'best-wood-router',
  'best-router-table',
  'best-drill-press',
  'best-benchtop-planer',
  'best-framing-hammer',
  'best-bench-vise',
  'best-wire-stripper',

  // August 2026 batch: generators, mowers, waterproofing and concrete coatings.
  'best-zero-turn-mower',
  'best-home-battery-backup-system',
  'best-mini-split-heat-pump',
  'best-heat-pump-water-heater',
  'best-compact-tractor',
  'best-log-splitter',
  'best-table-saw',
  'best-air-purifier-for-allergies',
  'best-robot-vacuum',
  'best-home-security-cameras',
  'best-smart-lock',
  'best-video-doorbell',
  'home-improvement-ideas',
  'best-air-fryer',
  'best-heat-pump-dryer',
  'best-refrigerator-brands',
  'best-cordless-vacuum',
  'best-vacuum-cleaner',
  'best-enzyme-cleaner',
  'best-spc-flooring',
  'best-sintered-stone-countertops',
  'best-dehumidifier-for-home',
  'diy-garden-landscaping-ideas',
  'best-induction-cookware',
  'best-electric-kettle',
  'best-rice-cooker',
  'shop-vac-vs-regular-vacuum',
  'what-size-shop-vac-do-i-need',
  'shop-vac-cfm-vs-horsepower',
  'shop-vac-filters-explained',
  'shop-vac-losing-suction',
  'how-to-vacuum-water-with-a-shop-vac',
  'can-you-use-a-shop-vac-without-a-filter',
  'shop-vac-vs-dust-extractor',
  'robot-vacuum-vs-regular-vacuum',
  'are-robot-vacuums-worth-it',
  'lidar-vs-camera-robot-vacuum-navigation',
  'self-emptying-robot-vacuum-worth-it',
  'how-long-do-robot-vacuums-last',
  'do-robot-vacuums-work-on-pet-hair',
  'what-size-air-purifier-do-i-need',
  'what-drive-size-socket-set-do-i-need',
  '6-point-vs-12-point-sockets',
  'chrome-vanadium-vs-chrome-molybdenum-sockets',
  'ratchet-tooth-count-explained',
  'how-to-prevent-rust-on-hand-tools',
  'latex-ite-vs-henry-driveway-sealer',
  'drylok-vs-radonseal',
  'best-deck-stain-remover',
  'how-to-strip-paint-from-a-deck',
  'how-to-strip-solid-stain-from-a-deck',
  'caustic-vs-oxygen-deck-stripper',
  'how-much-deck-stripper-do-i-need',
  'deck-stripping-cost',
  'how-to-seal-pavers',
  'do-pavers-need-to-be-sealed',
  'does-sealing-pavers-make-them-slippery',
  'how-often-to-seal-pavers',
  'paver-sealing-cost',
  'best-paver-sealers-for-a-wet-look',
  'water-based-vs-solvent-based-paver-sealer',
  'how-to-remove-sealer-from-pavers',
  'how-long-before-you-can-walk-on-sealed-pavers',
  'what-temperature-to-seal-pavers',
  'paver-sealer-not-drying',
  'how-to-seal-a-concrete-countertop',
  'epoxy-vs-penetrating-concrete-countertop-sealer',
  'food-safe-concrete-countertop-sealer',
  'how-often-to-seal-concrete-countertops',
  'concrete-countertop-sealer-not-curing',
  'best-water-based-paver-sealer-reviews',
  'best-concrete-countertop-sealer',
  'best-caulk-for-wood-siding',
  'best-robotic-lawn-mower',
  'best-inverter-generator',
  'best-dual-fuel-inverter-generator',
  'best-dual-fuel-generator',
  'best-tri-fuel-generator',
  'best-natural-gas-generator',
  'best-whole-house-generator',
  'best-concrete-floor-coating',
  'best-exterior-wood-sealer',
  'driveway-resurfacing-cost',
  'waterproofing-basement-walls-from-outside',
  'how-to-get-oil-out-of-concrete',
  'leaf-filter-reviews',
  // August 2026 publishing batch: epoxy floor how-tos, generator sizing,
  // sealing troubleshooting, basement water and mower maintenance.
  'how-to-clean-epoxy-garage-floor',
  'how-to-seal-epoxy-garage-floor',
  'how-to-prepare-concrete-for-epoxy',
  'garage-floor-epoxy-drying-time',
  'what-size-generator-do-i-need-for-my-house',
  'rain-after-driveway-sealing',
  'deck-stain-drying-time',
  'why-paver-sealer-turns-white',
  'water-coming-through-basement-floor',
  'how-often-to-sharpen-mower-blades',

  // August 2026: home gym, garage fit-out and outdoor gear.
  'best-home-gym-equipment-on-a-budget',
  'best-crash-pad-for-bouldering-outdoors',
  'best-canoes-for-river-paddling',
  'best-harness-for-zipline-riding',
  'best-ski-gloves',

  // September 2026: the electric pressure washer supporting cluster.
  'electric-vs-gas-pressure-washer',
  'what-psi-pressure-washer-do-i-need',
  'pressure-washer-psi-vs-gpm',
  'induction-vs-universal-motor-pressure-washer',
  'cordless-vs-corded-pressure-washer',
  'pressure-washer-extension-cord-size',
  'pressure-washer-water-supply-requirements',
  'how-to-pressure-wash-a-car',
  'how-to-pressure-wash-vinyl-siding',
  'can-an-electric-pressure-washer-clean-concrete',
  'pressure-washer-nozzle-colors-explained',
  'what-not-to-pressure-wash',
  'how-to-use-detergent-in-a-pressure-washer',
  'how-to-winterize-a-pressure-washer',
  'pressure-washer-not-building-pressure',

  // September 2026: garage floor and epoxy gaps from keyword data.
  'epoxy-flooring',
  'garage-flooring-options',
  'garage-floor-coating-contractors',

  // September 2026: driveway sealing troubleshooting and application gaps.
  'fill-driveway-cracks-before-sealing',
  'driveway-sealer-peeling',
  'driveway-sealer-still-sticky',
  'brush-vs-roller-vs-squeegee-driveway-sealer',

  // September 2026: the deck and exterior wood finishing cluster.
  'deck-stain-vs-sealer',
  'how-to-stain-a-deck',
  'how-to-prep-a-deck-for-staining',
  'how-to-strip-deck-stain',
  'how-many-coats-of-deck-stain',
  'how-often-to-stain-a-deck',
  'best-time-of-year-to-stain-a-deck',
  'oil-based-vs-water-based-deck-stain',
  'solid-vs-semi-transparent-deck-stain',
  'deck-paint-vs-deck-stain',
  'brush-vs-roller-vs-sprayer-deck-stain',
  'can-you-stain-over-old-deck-stain',

  // September 2026: deck staining cluster gaps — cost, cleaning, composite and
  // the two removal questions the cluster had no page for.
  'how-much-does-it-cost-to-stain-a-deck',
  'how-to-clean-a-deck',
  'can-you-stain-composite-decking',
  'can-you-paint-over-deck-stain',
  'how-to-remove-deck-stain-from-vinyl-siding',

  // September 2026: the portable power station cluster. "best portable power
  // stations" is the site's largest keyword by impressions and the money page
  // had no supporting content at all.
  'portable-power-station-vs-generator',
  'what-size-portable-power-station-do-i-need',
  'can-a-portable-power-station-run-a-refrigerator',
  'lifepo4-vs-lithium-ion-power-stations',
  'how-to-charge-a-portable-power-station-with-solar',
  'pure-sine-wave-vs-modified-sine-wave',
  'how-long-do-portable-power-stations-last',
  'can-a-portable-power-station-run-a-cpap',

  // September 2026: the two missing 'best generator' category pages — the
  // portable and gasoline head terms had no roundup of their own.
  'best-portable-generator',
  'best-gas-generator',
  'best-small-generator-for-home',
  'are-ryobi-one-plus-batteries-interchangeable',
  'ryobi-one-plus-hp-vs-standard',
  'how-long-do-ryobi-batteries-last',
  'ryobi-battery-not-charging',
  'ryobi-18v-vs-40v',
  'do-i-need-to-ground-a-portable-generator',
  'how-to-use-a-portable-generator',
  'how-long-can-a-generator-run-continuously',
  'how-do-portable-generators-work',
  'generator-extension-cord-size',
  'best-ryobi-one-plus-tools',

  // September 2026: ten troubleshooting and comparison gaps identified across
  // the deck, garage floor, paver, driveway, generator, caulk and mower clusters.
  'deck-brightener-vs-deck-cleaner',
  'rain-after-staining-a-deck',
  'can-you-apply-epoxy-over-existing-epoxy',
  'why-is-my-concrete-sealer-turning-white',
  'how-to-remove-polymeric-sand-haze-from-pavers',
  'how-to-fix-puddles-in-an-asphalt-driveway',
  'how-to-store-a-portable-generator',
  'generator-runs-but-no-power',
  'why-does-exterior-caulk-keep-cracking',
  'front-wheel-vs-rear-wheel-drive-lawn-mower',
  'are-portable-power-stations-safe-indoors',

  // September 2026: cordless tool fundamentals. Nine drill and brand money
  // pages had no informational support, which shows in an average position
  // near 8 for "best cordless drills".
  'brushless-vs-brushed-drill',
  'drill-vs-impact-driver',
  'hammer-drill-vs-drill-driver',
  'cordless-tool-batteries-explained',

  // September 2026: topics from the organic positions export that were
  // ranking on a neighbouring page because they had none of their own.
  'best-teak-sealer',
  'best-basement-waterproofing-paint',
  'flex-seal-for-basement-walls',
  'what-is-paver-sand',
  'sealing-old-concrete',
  'tekton-vs-gearwrench',
  'tekton-vs-snap-on',
  'lastiseal-reviews',
  'liquid-rubber-vs-drylok',

  // September 2026: second pass over the organic positions export —
  // driveway cost terms, drywall filler, and the sealer sub-categories
  // that were ranking on neighbouring pages.
  'concrete-driveway-cost',
  'asphalt-driveway-cost',
  'joint-compound-vs-spackle',
  'how-long-does-spackle-take-to-dry',
  'polymeric-sand-home-depot',
  'polymeric-sand-colors',
  'dominator-polymeric-sand-review',
  'drylok-review',
  'best-foundation-sealer',
  'best-natural-stone-sealer',
  'best-outdoor-concrete-stain',
  'best-chimney-sealer',
  'best-pool-deck-sealer',
  'best-natural-look-paver-sealer',
  'best-water-based-polyurethane-for-floors',
  'best-teak-oil',
  'does-flex-seal-work-on-concrete',

  // September 2026: seasonal winter-preparation cluster. The search console
  // export for the quarter to 10 September shows impressions up 86% period on
  // period while CTR fell from 4.50% to 2.39% — the site is picking up
  // impressions on autumn and winter maintenance intent it had no dedicated
  // pages for. These ten fill that gap across the mower, snow, generator,
  // driveway, concrete, basement and exterior clusters.
  'how-to-winterize-a-lawn-mower',
  'how-to-prepare-a-snow-blower-for-winter',
  'where-to-place-a-generator-outside',
  'how-often-to-change-generator-oil',
  'sump-pump-battery-backup-vs-generator',
  'how-to-winterize-outdoor-faucets',
  'how-to-prevent-concrete-spalling-in-winter',
  'how-to-prepare-a-driveway-for-winter',
  'do-you-need-a-dehumidifier-in-winter',
  'how-to-clean-gutters-before-winter',

  // October 2026 batch: water heater cluster.
  'types-of-water-heaters',
  'what-is-a-tankless-water-heater',
  'point-of-use-water-heater',
  'replace-water-heater-with-tankless',
  'water-heater-brands',

  // October 2026 batch: electric snow blower cluster.
  'electric-vs-gas-snow-blower',
  'electric-snow-shovel',
  'ego-snow-blower',
  'toro-electric-snow-blower',
  'snow-joe-snow-blower',

  // October 2026 batch: humidifier cluster.
  'best-humidifier',
  'best-humidifier-for-bedroom',
  'best-humidifier-for-large-room',
  'best-whole-house-humidifier',
  'whole-house-humidifier',
  'evaporative-vs-ultrasonic-humidifier',
  'warm-mist-vs-cool-mist-humidifier',
  'how-to-clean-a-humidifier',
  'what-size-humidifier-do-i-need',
  'ideal-indoor-humidity',
  'best-warm-mist-humidifier',
  'types-of-humidifiers',
  'stainless-steel-humidifier',
  'how-much-does-a-humidifier-cost',
  'best-small-humidifier',
  'best-humidifier-for-allergies',
  'humidifier-air-purifier-combo',

  // October 2026 batch: snow shovel and snow tools cluster.
  'best-snow-shovel',
  'best-cordless-snow-shovel',
  'best-snow-shovel-for-car',
  'snow-removal-tools',
  'self-propelled-snow-blower',
  'greenworks-snow-blower',
  'ryobi-snow-blower',

  // October 2026 run: 30 supporting articles across six clusters.
  'how-to-use-a-laser-level',
  'line-laser-vs-rotary-laser',
  'green-vs-red-laser-level',
  'how-to-check-laser-level-accuracy',
  'self-leveling-vs-manual-laser-level',
  'how-to-use-a-pressure-washer-surface-cleaner',
  'surface-cleaner-leaving-streaks',
  'what-size-surface-cleaner-do-i-need',
  'surface-cleaner-vs-turbo-nozzle',
  'how-to-pressure-wash-a-patio',
  'how-to-use-a-circuit-breaker-finder',
  'circuit-breaker-finder-not-working',
  'how-to-label-a-breaker-panel',
  'how-to-find-which-breaker-controls-an-outlet',
  'breaker-finder-vs-non-contact-voltage-tester',
  'how-to-seal-marble',
  'how-often-to-seal-marble',
  'how-to-remove-etching-from-marble',
  'how-to-remove-stains-from-marble',
  'how-to-clean-marble-countertops',
  'what-size-riding-mower-do-i-need',
  'how-much-does-a-riding-lawn-mower-cost',
  'how-long-do-riding-lawn-mowers-last',
  'riding-mower-wont-start',
  'riding-lawn-mower-maintenance',
  'how-to-paint-a-ceiling',
  'ceiling-paint-vs-wall-paint',
  'ceiling-paint-sheen',
  'ceiling-paint-roller-marks',
  'how-much-paint-for-a-ceiling',

  // October 2026 run: pickleball cluster.
  'best-pickleball-paddle',
  'best-pickleball-shoes',
  'best-pickleball-paddle-for-beginners',
  'best-pickleball-paddle-for-spin',
  'best-pickleball-paddle-for-tennis-elbow',
  'best-pickleball-balls',
  'how-to-choose-a-pickleball-paddle',
  'pickleball-paddle-weight',
  'pickleball-paddle-grip-size',
  '14mm-vs-16mm-pickleball-paddle',
  'carbon-fiber-vs-fiberglass-pickleball-paddle',
  'thermoformed-pickleball-paddle',
  'elongated-vs-standard-pickleball-paddle',
  'usa-pickleball-approved-paddles',
  'how-long-do-pickleball-paddles-last',
  'how-much-does-a-pickleball-paddle-cost',
  'indoor-vs-outdoor-pickleball-balls',
  'pickleball-court-dimensions',
  'pickleball-shoes-vs-tennis-shoes',
  'can-you-wear-running-shoes-for-pickleball',

  // October 2026 run: 20 money pages.
  'best-garage-floor-mat',
  'best-garage-door-insulation-kit',
  'best-lawn-tractor',
  'best-lawn-mower-for-large-yard',
  'best-caulk-for-concrete',
  'best-caulk-for-windows',
  'best-whole-house-dehumidifier',
  'best-dehumidifier-for-garage',
  'best-manual-transfer-switch',
  'best-rv-generator',
  'best-flooring-for-basement',
  'best-hydraulic-cement',
  'best-cordless-shop-vac',
  'milwaukee-vs-makita',
  'best-under-sink-water-filter',
  'best-shower-head-filter',
  'best-electric-water-heater',
  'best-pressure-washer-for-concrete',
  'best-wood-chipper',
  'best-crabgrass-preventer',

  // October 2026 run: 30 Semrush-picked roundups ($100+ products, low KD).
  'best-espresso-machine',
  'best-countertop-ice-maker',
  'best-walking-pad',
  'best-weight-bench',
  'best-carpet-cleaner',
  'best-food-dehydrator',
  'best-charcoal-grill',
  'best-fire-pit',
  'best-smoker',
  'best-electric-smoker',
  'best-pool-vacuum',
  'best-robotic-pool-cleaner',
  'best-pool-heater',
  'best-hot-tub',
  'best-cold-plunge',
  'best-sauna',
  'best-electric-scooter',
  'best-electric-bike-for-seniors',
  'best-fishing-kayak',
  'best-paddle-board',
  'best-trolling-motor',
  'best-backpack-leaf-blower',
  'best-dust-collector',
  'best-electric-fireplace',
  'best-evaporative-cooler',
  'best-framing-nailer',
  'best-band-saw',
  'best-welder-for-beginners',
  'best-plasma-cutter',
  'best-kitchen-faucet',
]);

export default defineConfig({
  site: 'https://www.allmetalbrake.com',
  // Canonical URLs, sitemap entries and internal links all use a trailing slash;
  // Vercel 308-redirects the slash-less form (see trailingSlash in vercel.json).
  trailingSlash: 'always',
  integrations: [
    react(),
    tailwind(),
    sitemap({
      serialize(item) {
        const url = item.url.replace(/\/$/, '');
        const base = 'https://www.allmetalbrake.com';

        if (url === base || url === `${base}/`) {
          item.changefreq = 'weekly';
          item.lastmod = new Date().toISOString();
          item.priority = 1.0;
        } else if (url === `${base}/best-of`) {
          item.changefreq = 'weekly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.9;
        } else if (url === `${base}/best-mens-back-shavers`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.8;
        } else if (url === `${base}/braun-type-5544-vs-series-7`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.7;
        } else if (url === `${base}/the-brutal-truth-about-back-hair`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.7;
        } else if (url === `${base}/buzz-cut-guide`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.8;
        } else if (url === `${base}/how-to-shave-back-hair`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.8;
        } else if (url === `${base}/best-redwood-sealer`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.8;
        } else if (url === `${base}/best-basement-wall-sealer`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.8;
        } else if (url === `${base}/best-asphalt-sealer`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.8;
        } else if (url === `${base}/asphalt-repair`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.9;
        } else if (url === `${base}/best-asphalt-crack-filler`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.9;
        } else if (url === `${base}/best-concrete-sealer`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.9;
        } else if (url === `${base}/asphalt-sealcoating`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.8;
        } else if (url === `${base}/best-cinder-block-sealer-reviews`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.8;
        } else if (url === `${base}/best-paint-sprayer`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.9;
        } else if (url === `${base}/best-deck-paint`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.9;
        } else if (url === `${base}/best-ceiling-paint`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.9;
        } else if (url === `${base}/best-deck-sealant`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.9;
        } else if (url === `${base}/paint-sprayer-rental`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.9;
        } else if (url === `${base}/best-paint-brushes`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.9;
        } else if (url === `${base}/basement-crack-repair`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.9;
        } else if (url === `${base}/basement-waterproofing-cost`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.9;
        } else if (url === `${base}/polyaspartic-floor-coating`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.9;
        } else if (url === `${base}/cold-patch-asphalt`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.8;
        } else if (url === `${base}/wet-basement-solutions`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.8;
        } else if (url === `${base}/polyurea-garage-floor-coating`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.8;
        } else if (url === `${base}/can-you-stain-pressure-treated-wood`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.8;
        } else if (url === `${base}/driveway-crack-repair`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.7;
        } else if (url === `${base}/epoxy-floor-colors`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.7;
        } else if (url === `${base}/garage-floor-coating-cost`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.7;
        } else if (url === `${base}/best-garage-floor-paint`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.7;
        } else if (url === `${base}/best-deck-cleaner`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.7;
        } else if (url === `${base}/asphalt-driveway-maintenance`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.6;
        } else if (url === `${base}/garage-floor-epoxy-colors`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.6;
        } else if (url === `${base}/basement-floor-sealer`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.6;
        } else if (url === `${base}/best-gas-lawn-mowers`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.9;
        } else if (url === `${base}/interior-basement-waterproofing`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.9;
        } else if (url === `${base}/best-basement-floor-paint`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.8;
        } else if (url === `${base}/blacktop-sealer-cost`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.7;
        } else if (url === `${base}/best-oil-based-deck-stain`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.7;
        } else if (url === `${base}/best-chainsaw`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.8;
        } else if (url === `${base}/best-cordless-drills`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.8;
        } else if (url === `${base}/best-dishwasher`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.8;
        } else if (url === `${base}/best-water-softener-system`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.7;
        } else if (url === `${base}/best-water-filtration-system-for-home`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.7;
        } else if (url === `${base}/best-water-filter-pitcher`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.6;
        } else if (url === `${base}/best-ceiling-fans-with-lights`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.8;
        } else if (url === `${base}/best-air-purifier-for-home`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.8;
        } else if (url === `${base}/best-cordless-drill-for-home-use`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.6;
        } else if (url === `${base}/generac-generator-cost`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.9;
        } else if (url === `${base}/what-size-generator-do-i-need-for-my-house`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.9;
        } else if (url === `${base}/how-to-prepare-concrete-for-epoxy`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.9;
        } else if (url === `${base}/water-coming-through-basement-floor`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.9;
        } else if (priorityGuides.has(url.slice(base.length + 1))) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.8;
        } else {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.5;
        }

        return item;
      },
    }),
  ],
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
});
