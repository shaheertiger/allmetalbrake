export interface Term { slug: string; term: string; short: string; body: string; related: { title: string; url: string }[] }

const GEN = { title: 'Best Home Generators for Power Outages', url: '/best-home-generator-for-power-outages/' };
const INV = { title: 'Best Inverter Generators', url: '/best-inverter-generator/' };
const PPS = { title: 'Best Portable Power Stations', url: '/best-portable-power-station/' };
const TS = { title: 'Best Generator Transfer Switches', url: '/best-generator-transfer-switch/' };
const CALC = { title: 'Generator Wattage Calculator', url: '/tools/generator-wattage-calculator/' };
const RUN = { title: 'Power Station Runtime Calculator', url: '/tools/power-station-runtime-calculator/' };

export const glossary: Term[] = [
  {
    slug: 'running-watts',
    term: 'Running Watts',
    short: 'The power a generator can deliver continuously, hour after hour. It is lower than the starting (peak) figure on the box, and it is the number to size by.',
    body: `**Running watts** (also called rated or continuous watts) is the output a generator can sustain for as long as it has fuel. It is always lower than the headline **starting** or **peak** figure printed in large type on the box.

To size a generator, add up the running watts of everything you want on at the same time, then make sure the largest single motor's extra starting surge also fits under the starting rating. A refrigerator might run on 150 to 200 watts but need several times that for a second or two when its compressor starts.

**Rule of thumb:** buy on running watts, and keep your planned load at or below about 80% of them so the engine is not working flat out for days.`,
    related: [CALC, GEN],
  },
  {
    slug: 'starting-watts',
    term: 'Starting Watts (Surge or Peak Watts)',
    short: 'The brief extra power a generator can supply for a second or two to start motors such as fridge compressors, pumps and AC units.',
    body: `Electric motors draw a burst of current when they start, often two to three times their running draw and more for some pumps and air conditioners. **Starting watts** (also sold as surge or peak watts) is how much a generator can deliver for that brief moment.

The starting figure is the bigger number in the marketing, which is why a "9,500-watt" generator may only run 7,500 watts continuously. Check both numbers. Start the biggest motor load first, then add smaller loads, so two surges never land at once.

A soft starter on a central AC unit lowers its starting surge and can let a smaller generator start it.`,
    related: [CALC, GEN],
  },
  {
    slug: 'inverter-generator',
    term: 'Inverter Generator',
    short: 'A generator that converts its raw output to clean, stable AC electronically, so the engine can throttle down at light load and run quieter.',
    body: `A conventional generator must spin its engine at a fixed speed (usually 3,600 rpm) to produce 60 Hz power. An **inverter generator** produces raw AC, converts it to DC, then electronically inverts it back to clean 120V, 60 Hz AC. Because frequency no longer depends on engine speed, the engine can slow down when the load is light.

That gives three practical benefits: lower noise, better fuel economy at partial load, and low total harmonic distortion (clean power) for electronics. Most small inverters can also be paralleled with a second unit for more output.

The trade-offs are cost per watt and, on small models, no 240V outlet for a well pump or transfer switch.`,
    related: [INV, { title: 'Best Dual Fuel Inverter Generators', url: '/best-dual-fuel-inverter-generator/' }],
  },
  {
    slug: 'thd',
    term: 'THD (Total Harmonic Distortion)',
    short: 'A measure of how far a generator\'s AC waveform departs from a clean sine wave. Lower is better for electronics.',
    body: `**Total harmonic distortion** expresses, as a percentage, how much a generator's output waveform deviates from a pure sine wave. Utility power is typically low single digits.

Inverter generators commonly list THD under 3%, which is comfortable for computers, TVs, chargers and modern furnace control boards. Conventional open-frame generators often list higher figures, and some do not publish one at all.

If you plan to run sensitive electronics or a furnace with an electronic control board, look for a published low THD rating, or run the electronics from a power station or UPS that is charged by the generator.`,
    related: [INV, { title: 'Best UPS Battery Backups', url: '/best-ups-battery-backup/' }],
  },
  {
    slug: 'dual-fuel',
    term: 'Dual Fuel Generator',
    short: 'A generator that can run on either gasoline or propane (LPG), switched with a selector.',
    body: `A **dual fuel** generator runs on gasoline or propane. Propane stores for years without going stale, is available in exchangeable tanks, and burns cleaner, which is easier on the carburetor during long storage. Gasoline gives slightly more power per engine size.

Expect lower output on propane: makers typically rate a dual fuel model roughly 10% lower on LPG than on gasoline, and the spec sheet lists both figures. Some models add natural gas as a third fuel (tri-fuel) with a conversion kit.

For outage backup, propane's shelf life is the main reason to choose dual fuel: a generator that sits for a year is far more likely to start on propane.`,
    related: [{ title: 'Best Dual Fuel Generators', url: '/best-dual-fuel-generator/' }, GEN],
  },
  {
    slug: 'standby-generator',
    term: 'Standby Generator',
    short: 'A permanently installed generator that runs on natural gas or propane and starts automatically when the power goes out.',
    body: `A **home standby generator** sits on a pad outside the house, connects to the gas supply and to an **automatic transfer switch**, and starts within seconds of an outage without anyone touching it. It exercises itself weekly so faults show up before a storm.

Air-cooled units cover most homes; larger liquid-cooled units suit big all-electric houses and long outages. Installed cost is usually several times the price of the generator itself, because of the transfer switch, electrical and gas work, the pad and permits.

Standby is the most convenient backup but needs professional installation, a permit and annual service.`,
    related: [{ title: 'Whole House Generator Cost', url: '/generac-generator-cost/' }, { title: 'How Long Does a Generator Last?', url: '/how-long-does-a-generator-last/' }],
  },
  {
    slug: 'transfer-switch',
    term: 'Transfer Switch',
    short: 'A switch that safely moves selected household circuits from utility power to a generator, so the generator can never feed back into the grid.',
    body: `A **transfer switch** connects a generator to your home's wiring while physically isolating the house from the utility line. Without one, generator power can back-feed into the grid and endanger line workers, which is why plugging a generator into a wall outlet (a "suicide cord") is illegal and dangerous.

**Manual transfer switches** sit beside the main panel and move a set of chosen circuits (typically 6 to 10) to generator power with individual switches. **Automatic transfer switches** come with standby generators and switch over on their own.

Installation is electrician work and usually needs a permit.`,
    related: [TS, { title: 'Interlock Kit', url: '/glossary/interlock-kit/' }],
  },
  {
    slug: 'interlock-kit',
    term: 'Interlock Kit',
    short: 'A mechanical plate on the main panel that makes it impossible to have the main breaker and the generator breaker on at the same time.',
    body: `An **interlock kit** is a sliding plate fitted to your existing breaker panel. It physically prevents the main utility breaker and a dedicated generator back-feed breaker from both being on, which gives the same protection against back-feeding as a transfer switch.

Because it powers the whole panel, you choose which circuits to run by switching breakers on and off, and you must manage the load yourself so you stay under the generator's running watts.

Interlocks must be listed for your specific panel, are installed by an electrician with a power inlet box, and are not allowed by every local code.`,
    related: [TS, { title: 'Power Inlet Box', url: '/glossary/power-inlet-box/' }],
  },
  {
    slug: 'power-inlet-box',
    term: 'Power Inlet Box',
    short: 'An outdoor receptacle where you plug a generator cord into the house wiring through a transfer switch or interlock.',
    body: `A **power inlet box** is a weatherproof male inlet mounted on an outside wall. A generator cord runs from the generator's twist-lock outlet to the inlet, and wiring inside runs to the transfer switch or interlocked panel.

Inlets are rated by amperage and plug type, commonly **30 amp (L14-30)** or **50 amp (CS6365 or 14-50)**, and must match the generator's outlet and the cord. A 30-amp, 240V connection can carry up to about 7,200 watts; a 50-amp, 240V connection up to about 12,000 watts.

Place the generator at least 20 feet from the house with exhaust pointed away, which is why inlet cords are usually 20 to 30 feet long.`,
    related: [TS, GEN],
  },
  {
    slug: 'l14-30',
    term: 'L14-30 Outlet',
    short: 'A 30-amp, 120/240-volt twist-lock outlet found on many portable generators, used to feed a transfer switch or inlet box.',
    body: `The **NEMA L14-30** is a four-prong, 30-amp twist-lock receptacle that supplies both 120V and 240V. It is the standard connection from a portable generator to a house transfer switch or power inlet box, and it is required to run 240V loads such as a well pump through a transfer switch.

At 240V and 30 amps it can deliver up to 7,200 watts, though your generator's running watts set the real limit. Larger generators may offer a 50-amp 14-50 or CS6365 outlet instead.

If a generator has only 120V household outlets (common on small inverters), it cannot power 240V circuits through a transfer switch.`,
    related: [TS, { title: 'Best Generators for Well Pumps', url: '/best-generator-for-well-pump/' }],
  },
  {
    slug: 'watt-hours',
    term: 'Watt-Hours (Wh)',
    short: 'The amount of energy a battery or power station stores. Divide by your load in watts to estimate runtime.',
    body: `**Watt-hours** measure stored energy. A 1,000Wh power station could in theory run a 100-watt load for 10 hours. In practice, the inverter that turns battery DC into household AC loses some energy, typically 10 to 15%, so plan on about 85% of the rated capacity for AC loads.

**Runtime estimate:** usable Wh ÷ average load in watts = hours. Fridges and freezers cycle on and off, so use their daily energy figure (often 1 to 2 kWh per day for a full-size fridge) rather than their running watts.

Don't confuse Wh with **watts (W)**, which is how much power the station can deliver at once.`,
    related: [RUN, PPS],
  },
  {
    slug: 'lifepo4',
    term: 'LiFePO4 (LFP) Battery',
    short: 'Lithium iron phosphate, the battery chemistry used in most current power stations, rated for thousands of charge cycles.',
    body: `**Lithium iron phosphate** (LiFePO4 or LFP) batteries are heavier per watt-hour than the NMC cells used in older power stations, but makers commonly rate them for 3,000 or more cycles to 70 to 80% of original capacity, compared with roughly 500 to 1,000 cycles for typical NMC packs. They are also more thermally stable.

For backup power that sits most of the year and is cycled hard in storms, LFP is the better long-term buy. Check the spec sheet: most current EcoFlow, Jackery, Anker SOLIX and Bluetti models list LFP chemistry.

Store LFP stations partly charged and top them up every few months.`,
    related: [PPS, { title: 'NMC Battery', url: '/glossary/nmc-battery/' }],
  },
  {
    slug: 'nmc-battery',
    term: 'NMC Battery',
    short: 'Lithium nickel manganese cobalt cells: lighter than LiFePO4 but typically rated for fewer charge cycles. Still common in power banks and older power stations.',
    body: `**NMC** (nickel manganese cobalt) lithium-ion cells pack more energy into less weight than LiFePO4, which is why they still appear in some compact and older power stations and in most power banks.

The trade-off is cycle life: NMC packs are commonly rated for roughly 500 to 1,000 cycles to 80% capacity, versus 3,000 or more for LFP. For a station you carry often and cycle rarely, NMC's weight advantage can matter. For home backup that may be cycled through many outages, LFP usually wins.`,
    related: [{ title: 'LiFePO4 Battery', url: '/glossary/lifepo4/' }, PPS],
  },
  {
    slug: 'pure-sine-wave',
    term: 'Pure Sine Wave Inverter',
    short: 'An inverter that produces a smooth AC waveform like utility power, safe for motors, electronics and medical devices.',
    body: `Power stations, UPS units and car power inverters turn battery DC into AC. A **pure sine wave** inverter produces a smooth waveform close to grid power. A **modified sine wave** inverter produces a stepped approximation that is cheaper to build.

Motors, compressors, CPAP machines, laptop chargers and anything with a sensitive power supply run cooler and quieter on pure sine wave. Some devices will not run at all on modified sine wave.

Almost every current power station is pure sine wave; check before buying a cheap car inverter or UPS.`,
    related: [{ title: 'Best Power Inverters', url: '/best-power-inverter/' }, { title: 'Best Battery Backup for CPAP', url: '/best-battery-backup-for-cpap/' }],
  },
  {
    slug: 'ups-mode',
    term: 'UPS Mode (Pass-Through)',
    short: 'A power station feature that passes wall power to your devices and switches to battery automatically if the power fails.',
    body: `In **UPS** or pass-through mode, a power station stays plugged into the wall, charges itself and passes power through to connected devices. When the grid fails, it switches to battery.

The switchover time matters. A true **UPS** for computers switches in under about 10 milliseconds. Many power stations advertise switchover times in the 10 to 30 ms range, which most routers, CPAPs and fridges ride through, but some desktop PCs may reboot. Check the published figure.

For a desktop computer and network gear, a dedicated UPS is still the safest choice.`,
    related: [{ title: 'Best UPS Battery Backups', url: '/best-ups-battery-backup/' }, PPS],
  },
  {
    slug: 'solar-generator',
    term: 'Solar Generator',
    short: 'A marketing name for a portable power station sold with solar panels. It stores energy; it does not generate it without the panels.',
    body: `A **solar generator** is a portable power station bundled with one or more folding solar panels. The station holds the energy; the panels recharge it.

What matters is the station's solar input limits, listed as maximum watts and an input voltage range (Voc). Panels whose combined open-circuit voltage exceeds that range can damage the station or will not charge. Real-world panel output is usually well below the nameplate rating, often 50 to 80% in good sun.

A solar generator suits long outages where fuel runs out and quiet, fume-free power matters.`,
    related: [{ title: 'Best Solar Generators', url: '/best-solar-generator/' }, { title: 'Best Portable Solar Panels', url: '/best-portable-solar-panel/' }],
  },
  {
    slug: 'mppt',
    term: 'MPPT Charge Controller',
    short: 'Maximum power point tracking: circuitry that pulls the most power a solar panel can give as sun and temperature change.',
    body: `A solar panel's best operating voltage shifts with light and temperature. An **MPPT** controller continuously adjusts to that sweet spot and converts the excess voltage into extra charging current. Older PWM controllers are simpler and waste more of the panel's output.

Every current power station of note has a built-in MPPT controller, so the spec to check is its input window: maximum watts and the voltage range. Stay inside both when wiring panels in series or parallel.`,
    related: [{ title: 'Best Portable Solar Panels', url: '/best-portable-solar-panel/' }, { title: 'Solar Generator', url: '/glossary/solar-generator/' }],
  },
  {
    slug: 'co-shutoff',
    term: 'CO Shutoff',
    short: 'A carbon monoxide sensor on a generator that shuts the engine down if CO builds up around it, such as Honda CO-MINDER, Champion CO Shield and Generac COsense.',
    body: `Generator exhaust contains carbon monoxide, which kills hundreds of people in the US every year, many after storms. **CO shutoff** systems such as Honda CO-MINDER, Champion CO Shield, Generac COsense and Westinghouse CO Sensor monitor CO around the generator and stop the engine when levels rise.

They are a backup, not permission to run a generator indoors, in a garage, or near windows. Run any generator outdoors, at least 20 feet from the house with the exhaust pointed away, and keep battery CO alarms on every floor of the home.

Several states and the PWRS/UL safety standards now push makers toward CO shutoff on new portables.`,
    related: [GEN, { title: 'Best Indoor Heaters for Power Outages', url: '/best-indoor-heater-for-power-outage/' }],
  },
  {
    slug: 'parallel-kit',
    term: 'Parallel Kit',
    short: 'Cables that join two compatible inverter generators so they act as one with roughly double the output.',
    body: `Most inverter generators have parallel ports. A **parallel kit** links two units, usually the same model or same brand family, so their output combines through an outlet on the kit, often a 30-amp RV or TT-30 receptacle.

Two small inverters are easier to carry than one large one, and you can run just one when the load is light to save fuel. The combined output is still 120V only on most kits, so parallel pairs generally cannot run 240V well pumps.

Check the manual for which models can pair; mixing brands is not supported.`,
    related: [INV, { title: 'Best RV Generators', url: '/best-rv-generator/' }],
  },
  {
    slug: 'tt-30',
    term: 'TT-30 (RV 30-Amp)',
    short: 'The 30-amp, 120-volt RV plug. Not the same as the L14-30 used for home transfer switches.',
    body: `The **NEMA TT-30** is the standard 30-amp, 120V RV connector. It supplies up to 3,600 watts and is found on many RV-ready generators and parallel kits.

It is easily confused with the **L14-30** (30-amp, 120/240V twist-lock) used for home transfer switches, and with the 50-amp **14-50** used by larger RVs. They are not interchangeable without the right adapter, and adapting a 120V TT-30 to a 240V home inlet will not power 240V circuits.`,
    related: [{ title: 'Best RV Generators', url: '/best-rv-generator/' }, { title: 'L14-30 Outlet', url: '/glossary/l14-30/' }],
  },
  {
    slug: 'surge-protective-device',
    term: 'Surge Protective Device (SPD)',
    short: 'A whole-house surge protector mounted at the main panel or meter that diverts voltage spikes to ground. UL 1449 sorts them into Type 1 and Type 2.',
    body: `A **surge protective device** at the panel limits voltage spikes from lightning, utility switching and power restoration after an outage. UL 1449 classifies them by location: **Type 1** can mount on the line side ahead of the main breaker (often at the meter), **Type 2** mounts on the load side in or beside the panel.

Look for the UL 1449 listing, a surge current rating (kA) per mode, and a status indicator. A panel SPD handles large surges; plug-in strips at sensitive electronics catch what remains.

Installation is electrician work, often done at the same visit as a transfer switch.`,
    related: [{ title: 'Best Whole-House Surge Protectors', url: '/best-whole-house-surge-protector/' }, TS],
  },
  {
    slug: 'run-time',
    term: 'Run Time (Generator)',
    short: 'How long a generator runs on one tank, quoted by makers at a stated load, usually 25% or 50%.',
    body: `Generator **run time** is published at a specific load: a figure "at 25% load" can be two or three times the figure at full load. Compare models at the same load percentage.

Inverters stretch run time most at light load because the engine slows down. Conventional generators burn fuel at a more constant rate regardless of load.

For outage planning, estimate your average load, read the matching run time figure and the tank size, and store enough stabilized fuel (or propane) for the outage length you expect.`,
    related: [GEN, { title: 'How Long Does a Generator Last?', url: '/how-long-does-a-generator-last/' }],
  },
];
