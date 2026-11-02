import { useMemo, useState } from 'react';

// Figures match the appliance table on this page: running watts, then the
// surge drawn at start-up. Motor-driven loads surge; resistive loads do not.
type Appliance = {
  id: string;
  name: string;
  running: number;
  starting: number;
  group: 'Essentials' | 'Heating & Cooling' | 'Water' | 'Kitchen & Laundry';
  common?: boolean;
};

const APPLIANCES: Appliance[] = [
  { id: 'fridge', name: 'Refrigerator or freezer', running: 700, starting: 2200, group: 'Essentials', common: true },
  { id: 'lights', name: 'Lights, TV, router, laptops', running: 600, starting: 600, group: 'Essentials', common: true },
  { id: 'furnace', name: 'Gas furnace blower', running: 900, starting: 2400, group: 'Heating & Cooling', common: true },
  { id: 'window-ac', name: 'Window AC, 10,000 BTU', running: 1200, starting: 3000, group: 'Heating & Cooling' },
  { id: 'central-ac', name: 'Central AC, 3 ton', running: 3800, starting: 12000, group: 'Heating & Cooling' },
  { id: 'sump', name: 'Sump pump, 1/2 HP', running: 1050, starting: 2600, group: 'Water', common: true },
  { id: 'well', name: 'Well pump, 1 HP', running: 1200, starting: 4000, group: 'Water' },
  { id: 'water-heater', name: 'Electric water heater', running: 4500, starting: 4500, group: 'Water' },
  { id: 'microwave', name: 'Microwave', running: 1500, starting: 1500, group: 'Kitchen & Laundry' },
  { id: 'range', name: 'Electric range, one element', running: 2500, starting: 2500, group: 'Kitchen & Laundry' },
  { id: 'dryer', name: 'Electric dryer', running: 5500, starting: 6500, group: 'Kitchen & Laundry' },
];

const GROUPS = ['Essentials', 'Heating & Cooling', 'Water', 'Kitchen & Laundry'] as const;

// Common generator sizes, so the result maps onto something buyable.
const SIZES = [2200, 3500, 5000, 7500, 9500, 12000, 14000, 18000, 22000, 26000];

export default function GeneratorWattageCalculator() {
  const [selected, setSelected] = useState<string[]>(
    APPLIANCES.filter((a) => a.common).map((a) => a.id)
  );
  const [headroom, setHeadroom] = useState(true);

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const result = useMemo(() => {
    const picked = APPLIANCES.filter((a) => selected.includes(a.id));
    const running = picked.reduce((sum, a) => sum + a.running, 0);

    // Correct sizing method: everything runs at once, but only the single
    // largest motor surges at any one moment. Adding every surge together
    // massively oversizes the generator.
    const largestSurge = picked.reduce((max, a) => Math.max(max, a.starting - a.running), 0);
    const peak = running + largestSurge;

    const target = headroom ? Math.round(peak * 1.2) : peak;
    const recommended = SIZES.find((s) => s >= target) ?? SIZES[SIZES.length - 1];
    const surgeSource = picked.reduce(
      (best, a) => (a.starting - a.running > (best ? best.starting - best.running : -1) ? a : best),
      null as Appliance | null
    );

    return { running, largestSurge, peak, target, recommended, surgeSource, count: picked.length };
  }, [selected, headroom]);

  const chip = (on: boolean) =>
    `text-left w-full rounded-xl border px-4 py-3 transition-colors ${
      on
        ? 'border-[#1E90FF] bg-[#1E90FF]/5 text-gray-900'
        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
    }`;

  return (
    <div className="not-prose border border-gray-200 rounded-2xl overflow-hidden my-8 shadow-sm">
      <div className="bg-gray-900 px-6 py-4">
        <p className="text-white font-black text-lg m-0">Generator Wattage Calculator</p>
        <p className="text-gray-400 text-xs m-0 mt-1">
          Tick what you need to run during an outage. Sizing assumes everything runs together and the
          largest motor surges once.
        </p>
      </div>

      <div className="p-6 bg-white">
        {GROUPS.map((group) => (
          <div key={group} className="mb-5">
            <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2">{group}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {APPLIANCES.filter((a) => a.group === group).map((a) => {
                const on = selected.includes(a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    aria-pressed={on}
                    className={chip(on)}
                    onClick={() => toggle(a.id)}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-sm">{a.name}</span>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {a.running.toLocaleString()}W
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <label className="flex items-center gap-3 mb-5 cursor-pointer">
          <input
            type="checkbox"
            checked={headroom}
            onChange={(e) => setHeadroom(e.target.checked)}
            className="w-4 h-4 accent-[#1E90FF]"
          />
          <span className="text-sm text-gray-700">
            Add 20% headroom (recommended — generators should not run at full load continuously)
          </span>
        </label>

        <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-black text-gray-900 m-0">
                {result.running.toLocaleString()}
              </p>
              <p className="text-gray-500 text-xs mt-1 m-0">Running watts</p>
            </div>
            <div>
              <p className="text-2xl font-black text-[#38BDF8] m-0">
                +{result.largestSurge.toLocaleString()}
              </p>
              <p className="text-gray-500 text-xs mt-1 m-0">Largest surge</p>
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900 m-0">{result.peak.toLocaleString()}</p>
              <p className="text-gray-500 text-xs mt-1 m-0">Peak demand</p>
            </div>
            <div>
              <p className="text-2xl font-black text-[#FF4500] m-0">
                {result.recommended.toLocaleString()}W
              </p>
              <p className="text-gray-500 text-xs mt-1 m-0">Generator size</p>
            </div>
          </div>

          <p className="text-gray-600 text-xs mt-4 mb-0 text-center">
            {result.count === 0
              ? 'Select at least one appliance to size a generator.'
              : `${result.count} load${result.count === 1 ? '' : 's'} selected. ${
                  result.surgeSource
                    ? `Surge allowance comes from the ${result.surgeSource.name.toLowerCase()}.`
                    : 'No motor loads selected, so there is no start-up surge.'
                } ${
                  headroom ? 'Includes 20% headroom. ' : ''
                }Wattages are typical figures — check the data plate on your own appliances, which is the only number that describes your house.`}
          </p>
        </div>
      </div>
    </div>
  );
}
