import { useMemo, useState } from 'react';

type Surface = 'smooth' | 'average' | 'porous';

// Sealcoat is applied thin. The working figure across the site is roughly one
// gallon per 80-100 sq ft per coat, which puts a 4.75-gallon pail at about
// 400 sq ft for a single coat on average asphalt.
const SQFT_PER_GALLON: Record<Surface, number> = {
  smooth: 100,
  average: 90,
  porous: 80,
};

const PAIL_GALLONS = 4.75;
const WASTE_FACTOR = 0.1;

const SURFACE_LABEL: Record<Surface, string> = {
  smooth: 'Smooth — sealed recently, tight surface',
  average: 'Average — some fading, light texture',
  porous: 'Porous — grey, coarse, aggregate showing',
};

function round(value: number, decimals = 1) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export default function DrivewaySealerCalculator() {
  const [length, setLength] = useState('30');
  const [width, setWidth] = useState('20');
  const [coats, setCoats] = useState('2');
  const [surface, setSurface] = useState<Surface>('average');
  const [pricePerPail, setPricePerPail] = useState('35');

  const result = useMemo(() => {
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    const c = parseInt(coats, 10) || 1;
    const area = l * w;
    const coverage = SQFT_PER_GALLON[surface];

    const rawGallons = (area * c) / coverage;
    const gallons = rawGallons * (1 + WASTE_FACTOR);
    const pails = Math.max(1, Math.ceil(gallons / PAIL_GALLONS));
    const price = parseFloat(pricePerPail) || 0;

    return {
      area,
      coverage,
      gallons: round(gallons),
      pails,
      cost: round(pails * price, 2),
      perCoatSqft: round(area, 0),
    };
  }, [length, width, coats, surface, pricePerPail]);

  const field =
    'w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 font-medium focus:border-[#1E90FF] focus:outline-none focus:ring-2 focus:ring-[#1E90FF]/20';
  const label = 'block text-xs font-black uppercase tracking-widest text-gray-500 mb-2';

  return (
    <div className="not-prose border border-gray-200 rounded-2xl overflow-hidden my-8 shadow-sm">
      <div className="bg-gray-900 px-6 py-4">
        <p className="text-white font-black text-lg m-0">Driveway Sealer Calculator</p>
        <p className="text-gray-400 text-xs m-0 mt-1">
          Enter your measurements to get gallons, pails and an estimated cost.
        </p>
      </div>

      <div className="p-6 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className={label} htmlFor="dsc-length">
              Length (feet)
            </label>
            <input
              id="dsc-length"
              className={field}
              type="number"
              min="0"
              inputMode="decimal"
              value={length}
              onChange={(e) => setLength(e.target.value)}
            />
          </div>
          <div>
            <label className={label} htmlFor="dsc-width">
              Width (feet)
            </label>
            <input
              id="dsc-width"
              className={field}
              type="number"
              min="0"
              inputMode="decimal"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
            />
          </div>
          <div>
            <label className={label} htmlFor="dsc-surface">
              Surface condition
            </label>
            <select
              id="dsc-surface"
              className={field}
              value={surface}
              onChange={(e) => setSurface(e.target.value as Surface)}
            >
              {(Object.keys(SURFACE_LABEL) as Surface[]).map((key) => (
                <option key={key} value={key}>
                  {SURFACE_LABEL[key]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label} htmlFor="dsc-coats">
              Number of coats
            </label>
            <select
              id="dsc-coats"
              className={field}
              value={coats}
              onChange={(e) => setCoats(e.target.value)}
            >
              <option value="1">1 coat — touch-up only</option>
              <option value="2">2 coats — recommended</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={label} htmlFor="dsc-price">
              Price per 4.75-gallon pail ($)
            </label>
            <input
              id="dsc-price"
              className={field}
              type="number"
              min="0"
              inputMode="decimal"
              value={pricePerPail}
              onChange={(e) => setPricePerPail(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-3xl font-black text-gray-900 m-0">{result.perCoatSqft}</p>
              <p className="text-gray-500 text-xs mt-1 m-0">Square feet</p>
            </div>
            <div>
              <p className="text-3xl font-black text-[#38BDF8] m-0">{result.gallons}</p>
              <p className="text-gray-500 text-xs mt-1 m-0">Gallons needed</p>
            </div>
            <div>
              <p className="text-3xl font-black text-[#FF4500] m-0">{result.pails}</p>
              <p className="text-gray-500 text-xs mt-1 m-0">4.75-gal pails</p>
            </div>
            <div>
              <p className="text-3xl font-black text-gray-900 m-0">${result.cost}</p>
              <p className="text-gray-500 text-xs mt-1 m-0">Estimated cost</p>
            </div>
          </div>
          <p className="text-gray-500 text-xs mt-4 mb-0 text-center">
            Based on {result.coverage} sq ft per gallon per coat for a {surface} surface, plus a 10%
            allowance for waste and edging. Round up rather than down — running out mid-coat leaves a
            visible boundary.
          </p>
        </div>
      </div>
    </div>
  );
}
