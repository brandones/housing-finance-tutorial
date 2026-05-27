<script>
  import InfoTip from './InfoTip.svelte';
  import MoneyInput from './MoneyInput.svelte';

  const STORAGE_KEY = 'model1-inputs';
  const DEFAULTS = {
    bedrooms: 2,
    costPerSqft: 300,
    equity: 60000,
    subsidy: 0,
    rent: 2500,
    opCosts: 750,
  };

  function loadStored() {
    try {
      return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
    } catch {
      return { ...DEFAULTS };
    }
  }
  const stored = loadStored();

  let bedrooms = $state(stored.bedrooms);
  let costPerSqft = $state(stored.costPerSqft);
  let equity = $state(stored.equity);
  let subsidy = $state(stored.subsidy);
  let rent = $state(stored.rent);
  let opCosts = $state(stored.opCosts);

  // Typical apartment sqft per bedroom count (internal)
  const SQFT_BY_BR = { 0: 500, 1: 700, 2: 900, 3: 1100, 4: 1300, 5: 1500 };
  let sqft = $derived(SQFT_BY_BR[Math.max(0, Math.min(5, bedrooms))] ?? 900);
  let totalCost = $derived(costPerSqft * sqft);

  $effect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ bedrooms, costPerSqft, equity, subsidy, rent, opCosts }));
    } catch {}
  });

  function resetAll() {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('model')) localStorage.removeItem(key);
    }
    location.reload();
  }

  // Rent benchmarks
  const FOUR_PERSON_AMI = 117000;
  const HH_FACTORS = { 1: 0.70, 2: 0.80, 3: 0.90, 4: 1.00, 5: 1.08, 6: 1.16, 7: 1.24, 8: 1.32, 9: 1.40 };
  const AMI_LEVELS = [30, 50, 60, 80, 100, 120];
  const MARKET_RENTS = {
    0: [{ label: '25th', value: 1000 }, { label: 'median', value: 1500 }, { label: '75th', value: 1650 }],
    1: [{ label: '25th', value: 1400 }, { label: 'median', value: 1600 }, { label: '75th', value: 1800 }],
    2: [{ label: '25th', value: 1650 }, { label: 'median', value: 1900 }, { label: '75th', value: 2400 }],
    3: [{ label: '25th', value: 1900 }, { label: 'median', value: 2400 }, { label: '75th', value: 2800 }],
  };
  const RENT_MIN = 500;
  const RENT_MAX = 4000;

  function amiRent(bedroomCount, pct) {
    const people = Math.max(1, Math.min(9, bedroomCount + 1));
    const factor = HH_FACTORS[people];
    return Math.round((FOUR_PERSON_AMI * factor * pct / 100 * 0.30) / 12);
  }

  function rentPct(v) {
    return Math.max(0, Math.min(100, ((v - RENT_MIN) / (RENT_MAX - RENT_MIN)) * 100));
  }

  const interestRate = 0.065;
  const loanTerm = 35;
  const dcr = 1.2;
  const hurdleRate = 8; // % cash-on-cash return required

  function pmt(rate, nper, pv) {
    if (rate === 0) return pv / nper;
    const x = Math.pow(1 + rate, nper);
    return (pv * rate * x) / (x - 1);
  }

  function pv(rate, nper, pmtAmt) {
    if (rate === 0) return pmtAmt * nper;
    return pmtAmt * (1 - Math.pow(1 + rate, -nper)) / rate;
  }

  function fmt(n) {
    const sign = n < 0 ? '-' : '';
    return sign + '$' + Math.abs(Math.round(n)).toLocaleString();
  }

  let tdcTier = $derived(
    costPerSqft < 280
      ? { name: 'Floor', desc: 'Stick-built garden apartments, 2–3 stories, no elevator, vinyl siding, cheapo finishes.' }
      : costPerSqft < 400
      ? { name: 'Typical new construction', desc: 'Up to 5 story wood frame, elevator, all-electric, basic finishes.' }
      : costPerSqft < 550
      ? { name: 'Green / nicer', desc: 'Passive House, triple-pane windows, upgraded HVAC, real hardwood, better cabinetry.' }
      : { name: 'Luxury', desc: 'Parking structure, premium millwork and stone, high-end appliances, oak floors, amenities. Steel or concrete for taller buildings.' }
  );

  let noi = $derived(rent - opCosts);
  let maxDebtService = $derived(noi / dcr);
  let maxLoan = $derived(pv(interestRate / 12, loanTerm * 12, maxDebtService));
  let equityPct = $derived((equity / totalCost * 100).toFixed(0));
  let loanNeeded = $derived(totalCost - equity - subsidy);
  let gap = $derived(Math.max(0, loanNeeded - maxLoan));
  let loanSupportable = $derived(gap <= 0);
  let debtService = $derived(pmt(interestRate / 12, loanTerm * 12, loanNeeded));
  let cashFlow = $derived(noi - debtService);
  let requiredCashFlow = $derived(equity * (hurdleRate / 100) / 12);
  let cocReturn = $derived(equity > 0 ? (cashFlow * 12 / equity * 100) : 0);
  let cfSufficient = $derived(cashFlow >= requiredCashFlow);

  let marketTicks = $derived(MARKET_RENTS[Math.max(0, Math.min(3, bedrooms))]);
  let amiTicks = $derived(AMI_LEVELS.map(pct => ({ pct, value: amiRent(bedrooms, pct) })));
  let p75Market = $derived(marketTicks[2].value);
  let highRentWarning = $derived(rent > p75Market * 1.10);
</script>

<div class="card card-inline">
  <span class="card-title-inline">📐 Project</span>
  <span class="inline-control">
    <span class="label">Bedrooms</span>
    <input type="number" class="chip chip-sm" bind:value={bedrooms} min="0" max="5" step="1">
  </span>
</div>

<div class="card">
  <div class="card-title">💵 Income</div>

  <div class="row">
    <div class="label">
      Rent
      {#if highRentWarning}
        <InfoTip icon="warn"><p>You might struggle with high vacancies at this level of rent. Income from a vacant unit is $0.</p></InfoTip>
      {/if}
    </div>
    <div class="right">
      <span class="sign sign-in">+</span>
      <span class="computed">{fmt(rent)}</span>
    </div>
  </div>
  <div class="rent-slider-block">
    <div class="rent-ticks rent-ticks-top">
      <div
        class="rent-tick-connector"
        style="left: {rentPct(marketTicks[0].value)}%; right: {100 - rentPct(marketTicks[marketTicks.length - 1].value)}%"
      ></div>
      {#each marketTicks as t}
        <div class="rent-tick" class:rent-tick-median={t.label === 'median'} style="left: {rentPct(t.value)}%">
          <span class="rent-tick-label">{t.label}</span>
          <span class="rent-tick-mark"></span>
        </div>
      {/each}
      <span class="rent-axis-label rent-axis-label-top">market</span>
    </div>
    <input
      type="range"
      class="rent-slider"
      bind:value={rent}
      min={RENT_MIN}
      max={RENT_MAX}
      step="25"
    />
    <div class="rent-ticks rent-ticks-bottom">
      {#each amiTicks as t}
        <div class="rent-tick" style="left: {rentPct(t.value)}%">
          <span class="rent-tick-mark"></span>
          <span class="rent-tick-label">{t.pct}%</span>
        </div>
      {/each}
      <span class="rent-axis-label rent-axis-label-bottom">AMI</span>
    </div>
  </div>
  <div class="row">
    <div class="label">Operating costs <InfoTip><p>Includes utilities, taxes, insurance, and maintenance.</p></InfoTip><InfoTip icon="data"><p>These are hard to get data on, but $750/month is pretty typical for Kingston.</p><p><a href="https://www.prea.org/publications/quarterly/multifamily-property-expenses-rising-rapidly-led-by-insurance/" target="_blank" rel="noopener">PREA</a> is a good source for national comparisons.</p></InfoTip></div>
    <div class="right">
      <span class="sign sign-out">−</span>
      <MoneyInput bind:value={opCosts} step={50} />
    </div>
  </div>

  <div class="result-row">
    <span class="result-label">Net Operating Income <InfoTip><p>NOI is revenue (just rent in this case) minus operating costs.</p></InfoTip></span>
    <span class="result-value">
      <span class="sign sign-eq">=</span>{fmt(noi)}
    </span>
  </div>

  <div class="row">
    <div class="label">
      How big a loan you can get<InfoTip><p>The maximum supportable loan is the largest loan whose monthly payments NOI can cover, given the debt coverage ratio.</p></InfoTip>
      <div class="sublabel">based on NOI × {dcr} DCR</div>
    </div>
    <div class="right">
      <span class="computed">{fmt(maxLoan)}</span>
    </div>
  </div>
</div>

<div class="card">
  <div class="card-title">🏗️ Development</div>

  <div class="row">
    <div class="label">Cost per square foot <InfoTip><p>Includes land costs, construction, and soft costs (fees, legal services, etc).</p></InfoTip></div>
    <div class="right">
      <span class="computed">${costPerSqft}</span>
      <span class="unit">/sqft</span>
    </div>
  </div>
  <div class="slider-row">
    <input
      type="range"
      class="cost-slider"
      bind:value={costPerSqft}
      min="240"
      max="700"
      step="5"
    >
  </div>
  <p class="tier-desc">
    <span class="tier-name">{tdcTier.name}.</span>
    {tdcTier.desc}
  </p>
  <div class="row">
    <div class="label">
      Total development cost
      <div class="sublabel">× {sqft.toLocaleString()} sqft</div>
    </div>
    <div class="right">
      <span class="computed">{fmt(totalCost)}</span>
    </div>
  </div>
  <div class="row">
    <div class="label">
      Equity <InfoTip><p>Cash you or equity investors can put into the project. Investors expect returns. If you are a non-profit or government agency, this cash comes from your reserves.</p></InfoTip>
      <div class="sublabel">{equityPct}% of total</div>
    </div>
    <div class="right">
      <MoneyInput bind:value={equity} step={5000} />
    </div>
  </div>
  <div class="row">
    <div class="label">Subsidy <InfoTip><p>Capital subsidy — federal, state, or local grants, low-interest gap financing, or capitalized tax breaks like PILOTs. Hard to get, very valuable stuff.</p></InfoTip></div>
    <div class="right">
      <MoneyInput bind:value={subsidy} step={5000} />
    </div>
  </div>
  <div class="row">
    <div class="label">Loan needed</div>
    <div class="right">
      <span class="computed">{fmt(loanNeeded)}</span>
    </div>
  </div>

  <div class="result-row" class:result-ok={loanSupportable} class:result-warn={!loanSupportable}>
    <span class="result-label">Gap <InfoTip><p>How much additional money — in equity or subsidy — the project needs to be viable.</p></InfoTip></span>
    <span class="result-value">
      <span class="sign sign-eq">=</span>{fmt(gap)}
    </span>
  </div>
  {#if loanSupportable}
    <p class="result-message ok">You can cover development costs!</p>
  {:else}
    <p class="result-message warn">You need {fmt(gap)} more in equity or subsidy.</p>
  {/if}
</div>

<div class="card">
  <div class="card-title">🧮 Results</div>

  <div class="row">
    <div class="label">
      Debt service <InfoTip><p>Your monthly loan payments. This comes out of NOI.</p></InfoTip>
      <div class="sublabel">6.5% / 35 yr</div>
    </div>
    <div class="right">
      <span class="sign sign-out">−</span>
      <span class="computed">{fmt(debtService)}</span>
    </div>
  </div>

  <div class="result-row" class:result-ok={cfSufficient} class:result-warn={!cfSufficient}>
    <span class="result-label">Cash flow <InfoTip><p>For a for-profit developer, this is profit. It needs to provide a sufficient return on equity — measured as "cash on cash," annual cash flow as a percentage of equity invested.</p><p>For a nonprofit or public developer, cash flow provides funding that can be used to help build or subsidize other projects.</p></InfoTip></span>
    <span class="result-value">
      <span class="sign sign-eq">=</span>{fmt(cashFlow)}
    </span>
  </div>
  {#if cfSufficient}
    <p class="result-message ok">Cash on cash return on equity is {cocReturn.toFixed(1)}% — you can repay your investors!</p>
  {:else}
    <p class="result-message warn">Cash on cash return is {cocReturn.toFixed(1)}% — below the {hurdleRate}% hurdle.</p>
  {/if}

  <button class="reset-row" onclick={resetAll} aria-label="Reset to defaults">
    <span class="reset-label">Reset to defaults</span>
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  </button>
</div>

<style>
  .card {
    background: #ffffff;
    border: 1px solid #e6e2dc;
    border-radius: 6px;
    padding: 18px 18px 20px;
    margin-bottom: 12px;
  }

  .card-title {
    font-family: 'Cardo', serif;
    font-size: 17px;
    font-weight: 700;
    color: #2b2724;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e6e2dc;
  }

  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 9px 0;
  }

  .label {
    font-size: 14px;
    color: #4a4642;
  }

  .sublabel {
    font-size: 10.5px;
    color: #b8b2ab;
    margin-top: 1px;
  }

  .right {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .sign {
    font-size: 14px;
    font-weight: 600;
  }
  .sign-in { color: #3f6b8a; }
  .sign-out { color: #b87351; }
  .sign-eq { color: #8a847e; font-weight: 400; margin-right: 4px; }

  .unit {
    font-size: 13px;
    color: #8a847e;
    font-weight: 500;
    min-width: 16px;
  }

  .slider-row {
    padding: 2px 0 8px;
    position: relative;
  }

  .cost-slider {
    width: 100%;
    height: 6px;
    -webkit-appearance: none;
    appearance: none;
    background: #e6e2dc;
    border-radius: 3px;
    outline: none;
  }

  .cost-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #3f6b8a;
    border: 2px solid #ffffff;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    cursor: pointer;
  }

  .cost-slider::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #3f6b8a;
    border: 2px solid #ffffff;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    cursor: pointer;
  }

  /* Inline (one-line) card */
  .card-inline {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 18px;
  }
  .card-title-inline {
    font-family: 'Cardo', serif;
    font-size: 17px;
    font-weight: 700;
    color: #2b2724;
  }
  .inline-control {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* Rent slider with AMI / market tick marks */
  .rent-slider-block {
    padding: 2px 0 6px;
    position: relative;
  }

  .rent-ticks {
    position: relative;
    height: 22px;
  }

  .rent-tick {
    position: absolute;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: 'Inter', sans-serif;
    font-size: 9.5px;
    color: #8a847e;
    line-height: 1.2;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
    padding: 0 4px; /* expand hover hit area */
  }

  .rent-ticks-top .rent-tick .rent-tick-label {
    opacity: 0;
    transition: opacity 0.12s ease;
    pointer-events: none;
  }
  .rent-ticks-top .rent-tick:hover {
    z-index: 1;
  }
  .rent-ticks-top .rent-tick:hover .rent-tick-label {
    opacity: 1;
  }

  .rent-tick-median .rent-tick-mark {
    background: #8a847e;
  }
  .rent-tick-median .rent-tick-label {
    color: #6a645e;
  }

  .rent-tick-connector {
    position: absolute;
    bottom: 3px;
    height: 1px;
    background: #b8b2ab;
    pointer-events: none;
  }

  .rent-tick-mark {
    width: 1px;
    height: 5px;
    background: #b8b2ab;
    margin: 2px 0;
  }

  .rent-slider {
    width: 100%;
    height: 6px;
    -webkit-appearance: none;
    appearance: none;
    background: #e6e2dc;
    border-radius: 3px;
    outline: none;
    display: block;
    margin: 0;
    position: relative;
    z-index: 2;
  }

  .rent-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #3f6b8a;
    border: 2px solid #ffffff;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    cursor: pointer;
  }

  .rent-slider::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #3f6b8a;
    border: 2px solid #ffffff;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    cursor: pointer;
  }

  .rent-axis-label {
    position: absolute;
    right: 0;
    font-family: 'Inter', sans-serif;
    font-size: 9.5px;
    color: #8a847e;
    line-height: 1.2;
    white-space: nowrap;
  }
  .rent-axis-label-top { top: 0; }
  .rent-axis-label-bottom { bottom: 0; }

  .tier-desc {
    font-size: 11.5px;
    color: #8a847e;
    line-height: 1.4;
    margin: -2px 0 6px;
  }

  .tier-name {
    color: #4a4642;
    font-weight: 600;
  }

  .computed {
    font-size: 15px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: #2b2724;
  }

  .result-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 11px 0;
    border-top: 2px solid #2b2724;
  }

  .result-label {
    font-family: 'Cardo', serif;
    font-size: 15px;
    font-weight: 700;
    color: inherit;
  }

  .result-value {
    font-size: 17px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: inherit;
  }

  .result-ok {
    border-top-color: #4a7a3a;
    color: #4a7a3a;
  }

  .result-warn {
    border-top-color: #b87351;
    color: #b87351;
  }

  .result-row .sign-eq {
    color: #8a847e;
  }

  .result-message {
    font-size: 11px;
    font-style: italic;
    margin: -4px 0 4px;
  }
  .result-message.ok {
    color: #4a7a3a;
  }
  .result-message.warn {
    color: #b87351;
  }

  .reset-row {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 5px;
    background: none;
    border: none;
    color: #b8b2ab;
    cursor: pointer;
    padding: 8px 0 0;
    margin-left: auto;
    font-family: 'Inter', sans-serif;
    font-size: 11px;
    transition: color 0.15s ease;
    width: 100%;
  }
  .reset-row:hover {
    color: #8a847e;
  }
  .reset-label {
    line-height: 1;
    font-style: italic;
  }
</style>
