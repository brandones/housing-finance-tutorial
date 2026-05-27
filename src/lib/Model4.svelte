<script>
  import InfoTip from './InfoTip.svelte';
  import MoneyInput from './MoneyInput.svelte';

  const STORAGE_KEY = 'model4-inputs';
  const SQFT_BY_BR = { 0: 500, 1: 700, 2: 900, 3: 1100, 4: 1300, 5: 1500 };
  const DEFAULTS = {
    bedrooms: 2,
    sqft: 900,
    equity: 60000,
    subsidy: 0,
    rent: 2500,
    opCosts: 500,
    propertyTax: 0,
    operatingSubsidy: 0,
    interestRate: 5.5,
    loanTerm: 35,
    dcr: 1.15,
    hurdleRate: 8, // preserved for cross-model consistency but unused
    landCostPerSqft: 20,
    sitePrepPerSqft: 20,
    hardCostPerSqft: 200,
    softCostPerSqft: 30,
    wageLevel: 'prevailing',
  };

  function loadStored() {
    try {
      const m1 = JSON.parse(localStorage.getItem('model1-inputs') || '{}');
      const m2 = JSON.parse(localStorage.getItem('model2-inputs') || '{}');
      const m3 = JSON.parse(localStorage.getItem('model3-inputs') || '{}');
      const m4 = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return { ...DEFAULTS, ...m1, ...m2, ...m3, ...m4 };
    } catch {
      return { ...DEFAULTS };
    }
  }
  const stored = loadStored();
  const defaultSqftForBR = SQFT_BY_BR[stored.bedrooms] ?? 900;

  let bedrooms = $state(stored.bedrooms);
  let sqft = $state(stored.sqft ?? defaultSqftForBR);
  let equity = $state(stored.equity);
  let subsidy = $state(stored.subsidy);
  let rent = $state(stored.rent);
  let opCosts = $state(stored.opCosts);
  let propertyTax = $state(stored.propertyTax);
  let operatingSubsidy = $state(stored.operatingSubsidy);
  let interestRate = $state(stored.interestRate);
  let loanTerm = $state(stored.loanTerm);
  let dcr = $state(stored.dcr);
  let hurdleRate = $state(stored.hurdleRate); // preserved
  let landCostPerSqft = $state(stored.landCostPerSqft);
  let sitePrepPerSqft = $state(stored.sitePrepPerSqft);
  let hardCostPerSqft = $state(stored.hardCostPerSqft);
  let softCostPerSqft = $state(stored.softCostPerSqft);
  let wageLevel = $state(stored.wageLevel);

  let projectOpen = $state(true);
  let financeOpen = $state(true);
  let incomeOpen = $state(true);
  let devOpen = $state(true);

  // Minimum sqft thresholds per bedroom count
  const MIN_SQFT = { 0: 300, 1: 500, 2: 700, 3: 900, 4: 1100, 5: 1300 };
  let sqftWarning = $derived(
    MIN_SQFT[bedrooms] && sqft < MIN_SQFT[bedrooms]
      ? `${sqft.toLocaleString()} sqft is tight for a ${bedrooms}BR — typically ${MIN_SQFT[bedrooms].toLocaleString()}+ sqft`
      : null
  );

  const wageMultipliers = {
    'open': 1.0,
    'davis-bacon': 1.10,
    'prevailing': 1.25,
  };

  let effectiveHardCost = $derived(hardCostPerSqft * wageMultipliers[wageLevel]);
  let costPerSqft = $derived(landCostPerSqft + sitePrepPerSqft + effectiveHardCost + softCostPerSqft);
  let totalCost = $derived(costPerSqft * sqft);

  $effect(() => {
    try {
      localStorage.setItem('model1-inputs', JSON.stringify({
        bedrooms, sqft, costPerSqft: Math.round(costPerSqft), equity, subsidy, rent, opCosts, propertyTax, operatingSubsidy,
      }));
      localStorage.setItem('model2-inputs', JSON.stringify({
        interestRate, loanTerm, dcr, hurdleRate,
      }));
      localStorage.setItem('model3-inputs', JSON.stringify({
        landCostPerSqft, sitePrepPerSqft, hardCostPerSqft, softCostPerSqft, wageLevel,
      }));
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

  let hardCostTier = $derived(
    hardCostPerSqft < 180
      ? { name: 'Floor', desc: 'Stick-built garden apartments, 2–3 stories, no elevator, vinyl siding, cheapo finishes.' }
      : hardCostPerSqft < 275
      ? { name: 'Typical new construction', desc: 'Up to 5 story wood frame, elevator, all-electric, basic finishes.' }
      : hardCostPerSqft < 400
      ? { name: 'Green / nicer', desc: 'Passive House, triple-pane windows, upgraded HVAC, real hardwood, better cabinetry.' }
      : { name: 'Luxury', desc: 'Parking structure, premium millwork and stone, high-end appliances, oak floors, amenities. Steel or concrete for taller buildings.' }
  );

  let landPct = $derived(totalCost > 0 ? Math.round(landCostPerSqft * sqft / totalCost * 100) : 0);
  let sitePrepPct = $derived(totalCost > 0 ? Math.round(sitePrepPerSqft * sqft / totalCost * 100) : 0);
  let softPct = $derived(totalCost > 0 ? Math.round(softCostPerSqft * sqft / totalCost * 100) : 0);

  let noi = $derived(rent - opCosts - propertyTax + operatingSubsidy);
  let maxDebtService = $derived(noi / dcr);
  let maxLoan = $derived(pv(interestRate / 100 / 12, loanTerm * 12, maxDebtService));
  let equityPct = $derived((equity / totalCost * 100).toFixed(0));
  let loanNeeded = $derived(totalCost - equity - subsidy);
  let gap = $derived(Math.max(0, loanNeeded - maxLoan));
  let loanSupportable = $derived(gap <= 0);
  let debtService = $derived(pmt(interestRate / 100 / 12, loanTerm * 12, loanNeeded));
  let cashFlow = $derived(noi - debtService);
  let cfSufficient = $derived(cashFlow >= 0);

  let marketTicks = $derived(MARKET_RENTS[Math.max(0, Math.min(3, bedrooms))]);
  let amiTicks = $derived(AMI_LEVELS.map(pct => ({ pct, value: amiRent(bedrooms, pct) })));
  let p75Market = $derived(marketTicks[2].value);
  let highRentWarning = $derived(rent > p75Market * 1.10);
</script>

<div class="card">
  <button class="card-title collapsible" class:collapsed={!projectOpen} onclick={() => projectOpen = !projectOpen}>
    <span>📐 Project</span>
    <span class="collapse-summary">
      {#if !projectOpen}
        <span class="summary-text">{bedrooms} BR · {sqft.toLocaleString()} sqft</span>
      {/if}
      <span class="chevron" class:chevron-closed={!projectOpen}>▾</span>
    </span>
  </button>

  {#if projectOpen}
    <div class="row">
      <div class="label">Bedrooms</div>
      <div class="right">
        <input type="number" class="chip chip-sm" bind:value={bedrooms} min="0" max="5" step="1">
      </div>
    </div>
    <div class="row">
      <div class="label">Square feet</div>
      <div class="right">
        <input type="number" class="chip chip-sm" bind:value={sqft} min="200" max="5000" step="50">
        <span class="unit">sqft</span>
      </div>
    </div>
    {#if sqftWarning}
      <p class="warning-text">{sqftWarning}</p>
    {/if}
  {/if}
</div>

<div class="card">
  <button class="card-title collapsible" class:collapsed={!financeOpen} onclick={() => financeOpen = !financeOpen}>
    <span>📈 Finance</span>
    <span class="collapse-summary">
      {#if !financeOpen}
        <span class="summary-text">{interestRate}% · {loanTerm}yr · {dcr}×</span>
      {/if}
      <span class="chevron" class:chevron-closed={!financeOpen}>▾</span>
    </span>
  </button>

  {#if financeOpen}
    <div class="row">
      <div class="label">Interest rate <InfoTip><p>Public developers can finance with municipal bonds, which carry lower interest rates than commercial loans. After bond insurance, this will likely come to about 5.5% instead of the 6.5%+ a private developer would pay.</p></InfoTip></div>
      <div class="right">
        <input type="number" class="chip chip-sm" bind:value={interestRate} min="0" max="30" step="0.1">
        <span class="unit">%</span>
      </div>
    </div>
    <div class="row">
      <div class="label">Loan term</div>
      <div class="right">
        <input type="number" class="chip chip-sm" bind:value={loanTerm} min="1" max="50" step="1">
        <span class="unit">yr</span>
      </div>
    </div>
    <div class="row">
      <div class="label">Debt coverage ratio</div>
      <div class="right">
        <input type="number" class="chip chip-sm" bind:value={dcr} min="1" max="3" step="0.05">
        <span class="unit">×</span>
      </div>
    </div>
  {/if}
</div>

<div class="card">
  <button class="card-title collapsible" class:collapsed={!incomeOpen} onclick={() => incomeOpen = !incomeOpen}>
    <span>💵 Income</span>
    <span class="collapse-summary">
      {#if !incomeOpen}
        <span class="summary-text">{fmt(rent)} rent · {fmt(noi)} NOI</span>
      {/if}
      <span class="chevron" class:chevron-closed={!incomeOpen}>▾</span>
    </span>
  </button>

  {#if incomeOpen}
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
    <div class="label">Operating costs</div>
    <div class="right">
      <span class="sign sign-out">−</span>
      <MoneyInput bind:value={opCosts} step={50} />
    </div>
  </div>
  <div class="row">
    <div class="label">Property tax <InfoTip><p>Publicly held properties are generally exempt from property tax.</p></InfoTip></div>
    <div class="right">
      <span class="sign sign-out">−</span>
      <MoneyInput bind:value={propertyTax} step={25} />
    </div>
  </div>
  <div class="row">
    <div class="label">Operating subsidy</div>
    <div class="right">
      <span class="sign sign-in">+</span>
      <MoneyInput bind:value={operatingSubsidy} step={50} />
    </div>
  </div>

  <div class="result-row">
    <span class="result-label">Net Operating Income</span>
    <span class="result-value">
      <span class="sign sign-eq">=</span>{fmt(noi)}
    </span>
  </div>

  <div class="row">
    <div class="label">
      <span class="label-strong">Maximum Supportable Loan</span>
      <div class="sublabel">based on NOI × {dcr} DCR</div>
    </div>
    <div class="right">
      <span class="computed">{fmt(maxLoan)}</span>
    </div>
  </div>
  {/if}
</div>

<div class="card">
  <button class="card-title collapsible" class:collapsed={!devOpen} onclick={() => devOpen = !devOpen}>
    <span>🏗️ Development</span>
    <span class="collapse-summary">
      {#if !devOpen}
        <span class="summary-text">{fmt(totalCost)} TDC · {fmt(loanNeeded)} loan</span>
      {/if}
      <span class="chevron" class:chevron-closed={!devOpen}>▾</span>
    </span>
  </button>

  {#if devOpen}
    <div class="row">
      <div class="label">
        Land cost <InfoTip><p>Public developers can often use state- or city-owned land, or benefit from zoning overrides that allow more density on a given site.</p><p>Either way, land cost per built square foot drops — free or subsidized land, or more square feet on the same parcel.</p></InfoTip>
        <div class="sublabel">{landPct}% of TDC</div>
      </div>
      <div class="right">
        <MoneyInput class="chip chip-sm" bind:value={landCostPerSqft} step={5} />
        <span class="unit">/sqft</span>
      </div>
    </div>

    <div class="row">
      <div class="label">
        Site prep
        <div class="sublabel">{sitePrepPct}% of TDC</div>
      </div>
      <div class="right">
        <MoneyInput class="chip chip-sm" bind:value={sitePrepPerSqft} step={5} />
        <span class="unit">/sqft</span>
      </div>
    </div>

    <div class="row">
      <div class="label">Hard costs</div>
      <div class="right">
        <span class="computed">${Math.round(effectiveHardCost)}</span>
        <span class="unit">/sqft</span>
      </div>
    </div>
    <div class="slider-row">
      <input
        type="range"
        class="cost-slider"
        bind:value={hardCostPerSqft}
        min="140"
        max="550"
        step="5"
      >
    </div>
    <p class="tier-desc">
      <span class="tier-name">{hardCostTier.name}.</span>
      {hardCostTier.desc}
    </p>

    <div class="row">
      <div class="label">Wage level</div>
      <div class="right">
        <div class="toggle-group">
          <button class="toggle-btn" class:toggle-active={wageLevel === 'open'} onclick={() => wageLevel = 'open'}>Open shop</button>
          <button class="toggle-btn" class:toggle-active={wageLevel === 'davis-bacon'} onclick={() => wageLevel = 'davis-bacon'}>Davis-Bacon
            <span class="toggle-detail">+10%</span>
          </button>
          <button class="toggle-btn" class:toggle-active={wageLevel === 'prevailing'} onclick={() => wageLevel = 'prevailing'}>Prevailing
            <span class="toggle-detail">+25%</span>
          </button>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="label">
        Soft costs
        <div class="sublabel">{softPct}% of TDC</div>
      </div>
      <div class="right">
        <MoneyInput class="chip chip-sm" bind:value={softCostPerSqft} step={5} />
        <span class="unit">/sqft</span>
      </div>
    </div>

    <div class="divider"></div>

    <div class="row">
      <div class="label">
        Total development cost
        <div class="sublabel">${Math.round(costPerSqft)}/sqft × {sqft.toLocaleString()} sqft</div>
      </div>
      <div class="right">
        <span class="sign sign-in">+</span>
        <span class="computed">{fmt(totalCost)}</span>
      </div>
    </div>
    <div class="row">
      <div class="label">
        Equity <InfoTip><p>For a public developer, equity is the cash reserves of the development agency.</p></InfoTip>
        <div class="sublabel">{equityPct}% of total</div>
      </div>
      <div class="right">
        <span class="sign sign-out">−</span>
        <MoneyInput bind:value={equity} step={5000} />
      </div>
    </div>
    <div class="row">
      <div class="label">Subsidy</div>
      <div class="right">
        <span class="sign sign-out">−</span>
        <MoneyInput bind:value={subsidy} step={5000} />
      </div>
    </div>

    <div class="result-row">
      <span class="result-label">Loan needed</span>
      <span class="result-value">
        <span class="sign sign-eq">=</span>{fmt(loanNeeded)}
      </span>
    </div>
  {/if}
</div>

<div class="card">
  <div class="card-title">🧮 Results</div>

  <div class="row">
    <div class="label">Loan needed</div>
    <div class="right">
      <span class="computed">{fmt(loanNeeded)}</span>
      <span class="unit">out of available</span>
      <span class="computed">{fmt(maxLoan)}</span>
    </div>
  </div>

  <div class="result-row" class:result-ok={loanSupportable} class:result-warn={!loanSupportable}>
    <span class="result-label">Gap</span>
    <span class="result-value">
      <span class="sign sign-eq">=</span>{fmt(gap)}
    </span>
  </div>
  {#if loanSupportable}
    <p class="result-message ok">You can cover development costs!</p>
  {:else}
    <p class="result-message warn">You need {fmt(gap)} more in equity or subsidy.</p>
  {/if}

  <div class="row">
    <div class="label">
      Debt service
      <div class="sublabel">{interestRate}% / {loanTerm} yr</div>
    </div>
    <div class="right">
      <span class="sign sign-out">−</span>
      <span class="computed">{fmt(debtService)}</span>
    </div>
  </div>

  <div class="result-row" class:result-ok={cfSufficient} class:result-warn={!cfSufficient}>
    <span class="result-label">Cash flow</span>
    <span class="result-value">
      <span class="sign sign-eq">=</span>{fmt(cashFlow)}
    </span>
  </div>
  {#if cfSufficient}
    <p class="result-message ok">Cash flow is positive! This money helps replenish reserves and support development of other units.</p>
  {:else}
    <p class="result-message warn">This project costs the state money every month, on top of the initial susbsidy and reserves required.</p>
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
  .card:has(.collapsed) {
    padding: 10px 16px;
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

  .collapsible {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    background: none;
    border: none;
    border-bottom: 1px solid #e6e2dc;
    cursor: pointer;
    padding: 0 0 8px;
    margin-bottom: 12px;
  }
  .collapsible.collapsed {
    margin-bottom: 0;
    border-bottom: none;
    padding-bottom: 0;
  }

  .collapse-summary {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .summary-text {
    font-family: 'Inter', sans-serif;
    font-size: 11.5px;
    font-weight: 400;
    color: #8a847e;
    font-variant-numeric: tabular-nums;
  }
  .chevron {
    font-size: 12px;
    color: #b8b2ab;
    transition: transform 0.2s ease;
  }
  .chevron-closed {
    transform: rotate(-90deg);
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
  .label-strong {
    font-family: 'Cardo', serif;
    font-weight: 700;
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

  .divider {
    border-top: 1px solid #e6e2dc;
    margin: 6px 0;
  }

  .warning-text {
    font-size: 11px;
    font-style: italic;
    color: #b87351;
    margin: -4px 0 4px;
  }

  /* Hard cost slider */
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

  /* Wage toggle */
  .toggle-group {
    display: flex;
    gap: 0;
    border: 1px solid #b8b2ab;
    border-radius: 6px;
    overflow: hidden;
  }
  .toggle-btn {
    font-family: 'Inter', sans-serif;
    font-size: 11px;
    font-weight: 500;
    padding: 5px 8px;
    border: none;
    background: #fbfaf7;
    color: #4a4642;
    cursor: pointer;
    border-right: 1px solid #e6e2dc;
    line-height: 1.2;
    text-align: center;
  }
  .toggle-btn:last-child {
    border-right: none;
  }
  .toggle-btn.toggle-active {
    background: #2b2724;
    color: #ffffff;
  }
  .toggle-detail {
    display: block;
    font-size: 9px;
    font-weight: 400;
    opacity: 0.7;
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
    padding: 0 4px;
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
