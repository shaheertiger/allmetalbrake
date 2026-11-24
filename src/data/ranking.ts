/**
 * "How We Ranked These …" section on every best list and brand review (the enthusiastreview.com
 * guide skeleton). The criteria are the four parts of each category's AMB Score, so the section
 * says exactly what the score shown on the page weighs. An article can override them with its own
 * `ranking` field.
 */
export const RANK_SOURCES =
  'manufacturer spec sheets and owner\'s manuals, EPA and CARB listings, UL and safety certifications, published warranty terms and owner reports';

export const RANKING: Record<string, [string, string][]> = {
  generator: [
    ['Power output', 'Running watts first, then starting watts, judged against the loads a home actually starts at once: a well pump, a fridge, a furnace blower.'],
    ['Fuel and runtime', 'Tank size and run time at half load, plus propane or natural gas options for long outages.'],
    ['Noise and ease of use', 'Rated decibels where published, electric or remote start, wheels and weight.'],
    ['Safety and features', 'CO shutoff, GFCI outlets and a transfer-switch-ready L14-30 or 14-50 outlet.'],
  ],
  'dual-fuel': [
    ['Gas output', 'Running and starting watts on gasoline.'],
    ['Propane output', 'How much power is left on propane, which is where dual fuel models differ most.'],
    ['Runtime and fuel', 'Hours per tank or per 20 lb cylinder at half load.'],
    ['Outlets and features', 'Transfer-switch outlets, electric start, CO shutoff and fuel selector design.'],
  ],
  inverter: [
    ['Power output', 'Running and starting watts, and whether two units can run in parallel.'],
    ['Fuel and runtime', 'Run time per tank at a quarter or half load, and fuel options.'],
    ['Noise and portability', 'Rated decibels at load and distance, weight and handles or wheels.'],
    ['Safety and features', 'CO shutoff, clean power (THD) for electronics, eco mode and outlets.'],
  ],
  'camping-rv': [
    ['Power output', 'Running watts against a 13,500 BTU RV air conditioner and a 30A RV outlet.'],
    ['Fuel and runtime', 'Run time per tank and propane options.'],
    ['Noise and portability', 'Campground noise rules, weight and size.'],
    ['Safety and features', 'CO shutoff, TT-30R outlet and parallel capability.'],
  ],
  'power-station': [
    ['Capacity and output', 'Usable watt-hours, continuous AC watts and surge, judged against fridge, CPAP and sump pump loads.'],
    ['Charging speed', 'Wall, solar and car charging rates, and how long a full recharge takes.'],
    ['Battery and lifespan', 'LiFePO4 or NMC chemistry, rated cycles and warranty length.'],
    ['Ports and portability', 'AC and USB-C outlets, a 30A or 240V option, expansion batteries and weight.'],
  ],
  'home-battery': [
    ['Capacity', 'Usable kilowatt-hours per unit and per stack.'],
    ['Backup power', 'Continuous and peak output, and whether it can start a central air conditioner or well pump.'],
    ['Expandability', 'How far capacity grows with extra batteries.'],
    ['Install and ecosystem', 'Solar coupling, transfer panel options, app monitoring and warranty.'],
  ],
  solar: [
    ['Output and efficiency', 'Rated watts and cell type.'],
    ['Portability and setup', 'Folded size, weight and kickstands.'],
    ['Durability and weather', 'Water resistance rating and build.'],
    ['Compatibility', 'Connectors and voltage range against common power stations.'],
  ],
  'transfer-switch': [
    ['Capacity and circuits', 'Amp rating, circuit count and the largest generator it accepts.'],
    ['Safety and code', 'UL listing and whether the design meets the NEC for back-feeding a home.'],
    ['Ease of install', 'Prewired kits, inlet boxes and what an electrician has to add.'],
    ['Value', 'What the kit includes against what you would buy separately.'],
  ],
  surge: [
    ['Surge capacity', 'Rated surge current per phase.'],
    ['Let-through voltage', 'The voltage protection rating (VPR) that reaches your appliances.'],
    ['Status and alarms', 'Indicator lights and audible alarms that show when protection is spent.'],
    ['Install and warranty', 'Type 1 or Type 2 mounting, enclosure and warranty terms.'],
  ],
  ups: [
    ['Capacity and runtime', 'VA and watt rating, and runtime at half and full load.'],
    ['Power quality', 'Pure sine or simulated output and line-interactive topology.'],
    ['Outlets and ports', 'Battery-backed outlets, surge-only outlets and USB.'],
    ['Monitoring and warranty', 'Display, shutdown software and warranty.'],
  ],
  cpap: [
    ['Capacity and runtime', 'Watt-hours against a CPAP\'s draw with and without the humidifier.'],
    ['Machine compatibility', 'DC cables and outputs for ResMed and Philips machines.'],
    ['Travel and airline', 'FAA watt-hour limits for carry-on batteries.'],
    ['Charging and ports', 'Recharge time and extra outlets.'],
  ],
  'power-inverter': [
    ['Power output', 'Continuous and peak watts against the loads you plan to run.'],
    ['Power quality', 'Pure or modified sine wave output.'],
    ['Efficiency and idle draw', 'Rated efficiency and how fast it drains the battery doing nothing.'],
    ['Wiring and features', 'Cables, fusing, remote and low-voltage protection.'],
  ],
  'power-bank': [
    ['Capacity and output', 'Rated milliamp-hours and maximum output in watts.'],
    ['Charging speed', 'USB-C input and output rates.'],
    ['Portability', 'Size, weight and airline limits.'],
    ['Ports and features', 'Port count, AC or solar options and display.'],
  ],
  lantern: [
    ['Brightness', 'Rated lumens on high.'],
    ['Runtime and power', 'Hours on low, battery type and recharge options.'],
    ['Light quality', 'Color, beam spread and dimming modes.'],
    ['Durability and portability', 'Water resistance, build and weight.'],
  ],
  radio: [
    ['Alerts and reception', 'NOAA weather alert function and band coverage.'],
    ['Power options', 'Hand crank, solar, batteries and USB charging.'],
    ['Light and extras', 'Flashlight, reading lamp and phone charging.'],
    ['Build and size', 'Water resistance, weight and size.'],
  ],
  fan: [
    ['Airflow', 'Blade size and rated airflow.'],
    ['Runtime and power', 'Hours per charge on low and power sources.'],
    ['Quiet operation', 'Noise at night-time speeds.'],
    ['Portability and build', 'Weight, mounting options and build.'],
  ],
  heater: [
    ['Heat output', 'BTU rating against the room size it has to heat.'],
    ['Safety', 'Indoor rating, oxygen depletion sensor and tip-over shutoff.'],
    ['Runtime and efficiency', 'Hours per propane cylinder or per charge.'],
    ['Ease of use', 'Ignition, controls and setup.'],
  ],
  'fuel-pump': [
    ['Flow rate', 'Gallons per minute.'],
    ['Fuel compatibility', 'Which fuels the pump is rated for.'],
    ['Ease of use', 'Hose length, nozzle and power source.'],
    ['Build and support', 'Duty cycle and warranty.'],
  ],
};
