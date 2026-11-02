#!/usr/bin/env node
// Builds src/data/asin-quarantine.json from the verification report.
//
//   node scripts/build-asin-quarantine.mjs
//
// Quarantining is deliberately not deletion. The ASIN stays in product-asins.json
// so it can be reviewed and corrected later; amazonLink() simply declines to use
// it and falls through to a tagged Amazon search for the product name, which is
// a valid Associate link that credits the same tag.
//
// A product is quarantined when the ASIN no longer resolves (the product is gone)
// or when the real Amazon title shares too little vocabulary with our product name
// to believe it is the same item. KEEP holds the ones a human confirmed are fine
// despite a low score, usually because the brand trades under another name.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const report = JSON.parse(readFileSync(join(root, 'scripts', 'affiliate-verify-report.json'), 'utf8'));
const THRESHOLD = 0.5;

// Low-scoring but verified correct: the seller trades under a different name, or
// the title is terse. Checked by hand against the product page.
const KEEP = new Set([
  'radius-360-hand-sander',      // Full Circle manufactures the Radius 360
  'ge-thqlsurge',                // "General Electric" vs "GE", exact model THQLSURGE
  'compare-n-save-concentrate',  // same brand, same herbicide
  'govee-water-leak-sensor',     // GoveeLife is Govee's sub-brand
  'yes4all-adjustable-dumbbells',
  'rubber-horse-stall-mats',     // 4x6, 3/4in spec matches
  'penofin-blue-label',          // Blue Label is Penofin's hardwood formula
  'messmers-uv-plus',
  'ecoflow-delta-pro-solar',
  'rust-oleum-triple-thick',     // Varathane is a Rust-Oleum brand
  'gutter-brush-basic',
  'levoit-core-300s',
  'wac-120v-3-cct-barlight',     // exact 24in 3-CCT bar, title just omits the model code
  'rheem-rtex-18',               // Rheem 18kW 240V tankless is the RTEX-18
  'twp-1500',                    // TWP 1501 is the 1500 Series Cedartone
  'fahrenheat-fuh54-garage-heater', // listed as FUH5-4
  'scotchblue-delicate-2080el-tape',
]);

// The reverse of KEEP: scores at or above the threshold but checked by hand and
// wrong. The fetcher accepts any result whose title contains the brand, so it
// often lands on a part, an accessory or a sibling model of the right brand.
const accessory = 'Resolves to a part or accessory, not the product';
const otherModel = 'Resolves to a different model from the same brand';
const otherBrand = 'Resolves to a different brand';
const FORCE = {
  ...Object.fromEntries([
    'stihl-fsa-60-r', 'kioti-cs2520', 'kubota-l2502', 'ls-mt225s', 'firman-h05751',
    'firman-h05751-portable', 'honda-eu2200i-companion-lpg', 'martinez-m1', 'firman-p08004',
    'bradford-white-aerotherm', 'ohio-steel-42swp22-lawn-sweeper', 'boss-industrial-es7t20',
    'powerhorse-22-ton', 'yardmax-yu2566', 'firman-t07571', 'firman-t07571-ng',
    'silky-hayauchi-179-39', 'ecoflow-blade', 'kohler-20rca', 'porter-cable-690lr',
    'toro-titan-max', 'ariens-ikon-xd-52', 'spartan-rz-hd', 'toro-snowmaster-824-qxe',
    'cub-cadet-2x-26',
  ].map((id) => [id, accessory])),
  ...Object.fromEntries([
    'champion-9200-dual-fuel', 'generac-gp8000e-df', 'westinghouse-igen4500df', 'duromax-xp9000ih',
    'firman-wh03042', 'lasko-ar122-smart-tower-heater', 'lasko-cd09475-ceramic-heater',
    'king-kb2410-eco2s-garage-heater', 'westinghouse-wgen9500-gas', 'makita-xhu02z', 'ego-hta2000',
    'reolink-argus-4-pro', 'bosch-gdr18v-1860cn-impact-driver', 'ego-me0800-edger',
    'toro-timemaster-30-21200-hills', 'toro-timemaster-30-21200-mulch',
    'toro-60v-recycler-22-21467-hills', 'toro-60v-recycler-22-21467-mulch',
    'agri-fab-45-0546-lawn-sweeper', 'toro-51621-ultraplus-blower-vac', 'bosch-gcm12sd',
    'metabo-hpt-c10fcgs', 'kohler-20rca-ng', 'champion-8750-trifuel', 'champion-8750-trifuel-ng',
    'duromax-xp12000hx', 'bosch-gop55-36', 'fiskars-394731-1002', 'aroma-arc-954sbd',
    'switchbot-k10-plus-pro', 'husqvarna-automower-430x', 'grizzly-g0899', 'grizzly-g7943',
    'wac-120v-3-cct-puck-kit', 'energizer-rechargeable-motion-light-bar',
    'brilliant-evolution-wireless-puck-brrc134',
    // Hand-checked on main: breaker bar, 20V drill, other wrench, 46-piece set, Ryobi kit, Gen 2.
    'tekton-24335-click', 'dewalt-12v-max-drill-driver', 'tekton-torque-wrench',
    'tekton-socket-ratchet-set', 'ryobi-inflator', 'anker-solix-c1000',
  ].map((id) => [id, otherModel])),
  ...Object.fromEntries([
    'rapid-set-cement-all', 'tsunami-seal-garage-threshold', 'green-mount-thumb-control-nozzle',
    'honda-hss724aat', 'behr-porch-patio-low-luster',
  ].map((id) => [id, otherBrand])),
};

const quarantine = {};
for (const r of report) {
  if (KEEP.has(r.id)) continue;
  if (FORCE[r.id] && r.status === 'resolved') {
    const note = `${FORCE[r.id]}: "${String(r.amazonTitle).slice(0, 90)}"`;
    quarantine[r.id] = { asin: r.asin, reason: 'mismatch', note, score: Number(r.score.toFixed(2)), file: r.file };
  } else if (r.status === 'unresolved') {
    quarantine[r.id] = { asin: r.asin, reason: 'dead', note: 'ASIN no longer resolves on Amazon', file: r.file };
  } else if (r.status === 'resolved' && r.score < THRESHOLD) {
    quarantine[r.id] = {
      asin: r.asin,
      reason: 'mismatch',
      note: `Resolves to "${String(r.amazonTitle).slice(0, 110)}"`,
      score: Number(r.score.toFixed(2)),
      file: r.file,
    };
  }
}

writeFileSync(join(root, 'src', 'data', 'asin-quarantine.json'), JSON.stringify(quarantine, null, 2) + '\n');
const dead = Object.values(quarantine).filter((q) => q.reason === 'dead').length;
const mismatch = Object.values(quarantine).filter((q) => q.reason === 'mismatch').length;
console.log(`Quarantined ${Object.keys(quarantine).length} ASINs (${dead} dead, ${mismatch} mismatched).`);
console.log(`Kept ${KEEP.size} low-scoring matches verified correct by hand.`);
console.log(`These now render a tagged Amazon search instead of a /dp/ link.`);
