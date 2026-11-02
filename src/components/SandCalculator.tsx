import { useMemo, useState } from 'react';

type Mode = 'jointing' | 'bedding';

const WASTE_FACTOR = 0.15;
const JOINTING_REFERENCE_SQFT_PER_BAG = 45; // 50-lb bag at a 1/4" wide x 1.5" deep joint
const JOINTING_REFERENCE_WIDTH_IN = 0.25;
const JOINTING_REFERENCE_DEPTH_IN = 1.5;
const BEDDING_LBS_PER_CUFT = 100; // typical compacted concrete/bedding sand
const BEDDING_CUFT_PER_BAG = 0.5; // standard 50-lb bag of bedding/paver sand

function round(value: number, decimals = 1) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export default function SandCalculator() {
  const [mode, setMode] = useState<Mode>('jointing');
  const [length, setLength] = useState('20');
  const [width, setWidth] = useState('15');
  const [jointWidth, setJointWidth] = useState('0.25');
  const [jointDepth, setJointDepth] = useState('1.5');
  const [beddingDepth, setBeddingDepth] = useState('1');
  const [pricePerBag, setPricePerBag] = useState('35');

  const area = useMemo(() => {
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    return l * w;
  }, [length, width]);

  const jointingResult = useMemo(() => {
    const jw = parseFloat(jointWidth) || JOINTING_REFERENCE_WIDTH_IN;
    const jd = parseFloat(jointDepth) || JOINTING_REFERENCE_DEPTH_IN;
    const scale =
      (JOINTING_REFERENCE_WIDTH_IN * JOINTING_REFERENCE_DEPTH_IN) / (jw * jd || 1);
    const sqftPerBag = JOINTING_REFERENCE_SQFT_PER_BAG * scale;
    const rawBags = area / sqftPerBag;
    const bagsWithWaste = rawBags * (1 + WASTE_FACTOR);
    const bags = Math.max(1, Math.ceil(bagsWithWaste));
    const totalWeightLbs = bags * 50;
    return { sqftPerBag: round(sqftPerBag), bags, totalWeightLbs };
  }, [area, jointWidth, jointDepth]);

  const beddingResult = useMemo(() => {
    const depthFt = (parseFloat(beddingDepth) || 1) / 12;
    const cubicFeet = area * depthFt;
    const cubicYards = cubicFeet / 27;
    const totalWeightLbs = cubicFeet * BEDDING_LBS_PER_CUFT;
    const rawBags = cubicFeet / BEDDING_CUFT_PER_BAG;
    const bags = Math.max(1, Math.ceil(rawBags * (1 + WASTE_FACTOR)));
    const tons = totalWeightLbs / 2000;
    return {
      cubicFeet: round(cubicFeet),
      cubicYards: round(cubicYards, 2),
      tons: round(tons, 2),
      bags,
      totalWeightLbs: Math.round(totalWeightLbs),
    };
  }, [area, beddingDepth]);

  const bags = mode === 'jointing' ? jointingResult.bags : beddingResult.bags;
  const price = parseFloat(pricePerBag) || 0;
  const estimatedCost = bags * price;
  const useBulk = mode === 'bedding' && beddingResult.cubicYards >= 1;

  return (
    <div className="bg-white border border-gray-200 rounded-3xl shadow-lg overflow-hidden">
      <div className="bg-gray-900 px-6 py-5 sm:px-8">
        <p className="text-[#38BDF8] text-xs font-black uppercase tracking-widest mb-1">
          Interactive Tool
        </p>
        <h2 className="text-white text-xl sm:text-2xl font-black">Paver Sand Calculator</h2>
      </div>

      <div className="p-6 sm:p-8">
        {/* Mode toggle */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <button
            type="button"
            onClick={() => setMode('jointing')}
            className={`rounded-xl border-2 px-4 py-3 text-sm font-bold transition-colors ${
              mode === 'jointing'
                ? 'border-[#1E90FF] bg-[#1E90FF]/10 text-[#1E90FF]'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            Polymeric Jointing Sand
          </button>
          <button
            type="button"
            onClick={() => setMode('bedding')}
            className={`rounded-xl border-2 px-4 py-3 text-sm font-bold transition-colors ${
              mode === 'bedding'
                ? 'border-[#1E90FF] bg-[#1E90FF]/10 text-[#1E90FF]'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            Paver Base / Bedding Sand
          </button>
        </div>

        {/* Dimensions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <label className="block">
            <span className="text-xs font-black uppercase tracking-widest text-gray-500">
              Length (ft)
            </span>
            <input
              type="number"
              min="0"
              step="0.5"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 font-bold focus:border-[#1E90FF] focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="text-xs font-black uppercase tracking-widest text-gray-500">
              Width (ft)
            </span>
            <input
              type="number"
              min="0"
              step="0.5"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 font-bold focus:border-[#1E90FF] focus:outline-none"
            />
          </label>
        </div>

        {mode === 'jointing' ? (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <label className="block">
              <span className="text-xs font-black uppercase tracking-widest text-gray-500">
                Joint Width (in)
              </span>
              <input
                type="number"
                min="0.0625"
                step="0.0625"
                value={jointWidth}
                onChange={(e) => setJointWidth(e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 font-bold focus:border-[#1E90FF] focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs font-black uppercase tracking-widest text-gray-500">
                Joint Depth (in)
              </span>
              <input
                type="number"
                min="0.5"
                step="0.25"
                value={jointDepth}
                onChange={(e) => setJointDepth(e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 font-bold focus:border-[#1E90FF] focus:outline-none"
              />
            </label>
          </div>
        ) : (
          <div className="mb-6">
            <label className="block">
              <span className="text-xs font-black uppercase tracking-widest text-gray-500">
                Bedding Layer Depth (in)
              </span>
              <input
                type="number"
                min="0.5"
                step="0.25"
                value={beddingDepth}
                onChange={(e) => setBeddingDepth(e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 font-bold focus:border-[#1E90FF] focus:outline-none"
              />
            </label>
            <p className="text-xs text-gray-400 mt-2">
              Standard bedding layer under pavers is 1 inch after compaction. Use 4-6 inches if you're also calculating a compacted gravel base separately.
            </p>
          </div>
        )}

        <label className="block mb-8">
          <span className="text-xs font-black uppercase tracking-widest text-gray-500">
            Price per 50-lb Bag ($)
          </span>
          <input
            type="number"
            min="0"
            step="1"
            value={pricePerBag}
            onChange={(e) => setPricePerBag(e.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 font-bold focus:border-[#1E90FF] focus:outline-none"
          />
        </label>

        {/* Results */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
          <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">
            Estimated Materials Needed
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-3xl font-black text-gray-900">{round(area)}</p>
              <p className="text-gray-500 text-xs mt-1">Square feet</p>
            </div>
            <div>
              <p className="text-3xl font-black text-[#1E90FF]">{bags}</p>
              <p className="text-gray-500 text-xs mt-1">50-lb bags needed</p>
            </div>
            <div>
              <p className="text-3xl font-black text-gray-900">
                ${estimatedCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <p className="text-gray-500 text-xs mt-1">Estimated cost</p>
            </div>
            {mode === 'jointing' ? (
              <div>
                <p className="text-3xl font-black text-gray-900">{jointingResult.sqftPerBag}</p>
                <p className="text-gray-500 text-xs mt-1">Sq ft covered per bag</p>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-3xl font-black text-gray-900">{beddingResult.cubicYards}</p>
                  <p className="text-gray-500 text-xs mt-1">Cubic yards</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-gray-900">{beddingResult.tons}</p>
                  <p className="text-gray-500 text-xs mt-1">Tons (bulk order)</p>
                </div>
              </>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-5 leading-relaxed">
            Includes a 15% waste buffer for compaction settling, spillage, and touch-ups. These are
            planning estimates — always check the coverage chart printed on your specific product,
            since exact yield varies by brand and grain size.
          </p>
          {useBulk && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm text-amber-800">
                <strong>You need more than a cubic yard.</strong> At this volume, ordering bulk sand
                by the ton or cubic yard from a landscape supply yard is almost always cheaper and
                faster than buying dozens of individual bags.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
