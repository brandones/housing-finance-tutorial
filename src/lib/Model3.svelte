<script>
  import InfoTip from './InfoTip.svelte';
  import MoneyInput from './MoneyInput.svelte';

  // Unit size
  let sqft = $state(800);
  let bedrooms = $state(2);

  // Development costs (per sqft)
  let landCostPerSqft = $state(40);
  let sitePrepPerSqft = $state(20);
  let hardCostPerSqft = $state(265);
  let softCostPerSqft = $state(50);
  let wageLevel = $state('open'); // 'open' | 'davis-bacon' | 'prevailing'

  let equity = $state(60000);
  let capitalSubsidy = $state(0);
  let interestRate = $state(6.5);
  let loanTerm = $state(35);
  let rent = $state(2500);
  let operatingSubsidy = $state(0);
  let opCosts = $state(500);
  let propertyTax = $state(250);
  let dcr = $state(1.2);
  let hurdleRate = $state(8);

  let devOpen = $state(true);
  let financeOpen = $state(true);

  const wageMultipliers = {
    'open': 1.0,
    'davis-bacon': 1.10,
    'prevailing': 1.25,
  };

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

  function fmt(n) {
    return '$' + Math.round(n).toLocaleString();
  }

  // Minimum sqft thresholds per bedroom count
  const minSqft = { 0: 300, 1: 500, 2: 700, 3: 900, 4: 1100 };
  let sqftWarning = $derived(
    minSqft[bedrooms] && sqft < minSqft[bedrooms]
      ? `${sqft} sqft is tight for a ${bedrooms}BR — typically ${minSqft[bedrooms]}+ sqft`
      : null
  );

  let effectiveHardCost = $derived(hardCostPerSqft * wageMultipliers[wageLevel]);
  let hardCostTier = $derived(
    hardCostPerSqft < 250
      ? { name: 'Floor', desc: 'Stick-built garden apartments, 2–3 stories, no elevator, vinyl siding, cheapo finishes.' }
      : hardCostPerSqft < 375
      ? { name: 'Typical new construction', desc: 'Up to 5 story wood frame, all-electric, basic finishes.' }
      : hardCostPerSqft < 450
      ? { name: 'Green / nicer', desc: 'Passive House, triple-pane windows, upgraded HVAC, real hardwood, better cabinetry.' }
      : { name: 'Luxury', desc: 'Parking structure, premium millwork and stone, high-end appliances, oak floors, amenities. Steel or concrete for taller buildings.' }
  );
  let landCost = $derived(landCostPerSqft * sqft);
  let sitePrepCost = $derived(sitePrepPerSqft * sqft);
  let hardCost = $derived(effectiveHardCost * sqft);
  let softCost = $derived(softCostPerSqft * sqft);
  let totalCost = $derived(landCost + sitePrepCost + hardCost + softCost);
  let landPct = $derived(totalCost > 0 ? Math.round(landCost / totalCost * 100) : 0);
  let sitePrepPct = $derived(totalCost > 0 ? Math.round(sitePrepCost / totalCost * 100) : 0);
  let softPct = $derived(totalCost > 0 ? Math.round(softCost / totalCost * 100) : 0);
  let equityPct = $derived((equity / totalCost * 100).toFixed(0));
  let loanNeeded = $derived(totalCost - equity - capitalSubsidy);
  let debtService = $derived(pmt(interestRate / 100 / 12, loanTerm * 12, loanNeeded));
  let noi = $derived(rent - opCosts - propertyTax + operatingSubsidy);
  let cashFlow = $derived(noi - debtService);
  let requiredNoi = $derived(debtService * dcr);
  let noiSufficient = $derived(noi >= requiredNoi);
  let requiredCashFlow = $derived(equity * (hurdleRate / 100) / 12);
  let cfSufficient = $derived(cashFlow >= requiredCashFlow);

  let marketTicks = $derived(MARKET_RENTS[Math.max(0, Math.min(3, bedrooms))]);
  let amiTicks = $derived(AMI_LEVELS.map(pct => ({ pct, value: amiRent(bedrooms, pct) })));

</script>

<div class="card">
  <button class="card-title collapsible" class:collapsed={!devOpen} onclick={() => devOpen = !devOpen}>
    <span>🏗️ Development</span>
    <span class="collapse-summary">
      {#if !devOpen}
        <span class="summary-text">{fmt(totalCost)} · {sqft} sqft · {equityPct}% eq</span>
      {/if}
      <span class="chevron" class:chevron-closed={!devOpen}>▾</span>
    </span>
  </button>

  {#if devOpen}
    <div class="row">
      <div class="label">Square feet</div>
      <div class="right">
        <input type="number" class="chip" bind:value={sqft} min="100" step="50">
      </div>
    </div>
    <div class="row">
      <div class="label">Bedrooms</div>
      <div class="right">
        <input type="number" class="chip chip-sm" bind:value={bedrooms} min="0" max="5" step="1">
      </div>
    </div>
    {#if sqftWarning}
      <p class="warning-text">{sqftWarning}</p>
    {/if}

    <div class="divider"></div>

    <div class="row">
      <div class="label">
        Land cost <InfoTip><p>The price for vacant land per buildable square foot.</p></InfoTip><InfoTip icon="data"><p>Vacant land in Kingston is around $20–$50 per buildable square foot. Around 15% of TDC is typical for acquisition.</p></InfoTip>
        <div class="sublabel">{landPct}% of TDC</div>
      </div>
      <div class="right">
        <MoneyInput class="chip chip-sm" bind:value={landCostPerSqft} step={5} />
        <span class="unit">/sqft</span>
      </div>
    </div>

    <div class="row">
      <div class="label">
        Site prep <InfoTip><p>Demolition, grading, utility hookups, and other work needed to get the site ready to build. If the site is a brownfield, include remediation costs here too.</p></InfoTip><InfoTip icon="data"><p>Minimal work (utilities present, flat lot): $5–15/sqft.</p><p>Typical (grading and some new site utilities): $20–25/sqft.</p><p>Rock excavation or utility upgrades: $30–40/sqft.</p><p>Brownfield remediation varies widely, but Kingston sites might be ~$500k–$2M (so maybe $20–75/sqft of your building). Subsidies and credits for remediation can bring net costs down to ~$10–40/sqft.</p></InfoTip>
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
        min="200"
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
        Soft costs <InfoTip><p>Architecture, engineering, legal, permitting, financing fees, insurance during construction, etc.</p></InfoTip><InfoTip icon="data"><p>For market-rate projects, soft costs are generally 8–15% of TDC. For affordable projects with many sources of subsidy, this can be as high as 35% of TDC.</p></InfoTip>
        <div class="sublabel">{softPct}% of TDC</div>
      </div>
      <div class="right">
        <MoneyInput class="chip chip-sm" bind:value={softCostPerSqft} step={5} />
        <span class="unit">/sqft</span>
      </div>
    </div>

    <div class="divider"></div>

    <div class="row">
      <div class="label">Total development cost</div>
      <div class="right">
        <span class="computed">{fmt(totalCost)}</span>
      </div>
    </div>
    <div class="row">
      <div class="label">
        Equity
        <div class="sublabel">{equityPct}% of TDC</div>
      </div>
      <div class="right">
        <MoneyInput bind:value={equity} step={5000} />
      </div>
    </div>
    <div class="row">
      <div class="label">Subsidy (capital) <InfoTip><p>Can come from federal grants, state or local grants, low-interest gap financing, or tax breaks such as PILOTs.</p><p>Subsidy is very limited, competitive, and hard to obtain.</p></InfoTip></div>
      <div class="right">
        <MoneyInput bind:value={capitalSubsidy} step={1000} />
      </div>
    </div>
    <div class="row">
      <div class="label">Loan needed</div>
      <div class="right">
        <span class="computed">{fmt(loanNeeded)}</span>
      </div>
    </div>
  {/if}
</div>

<div class="card">
  <button class="card-title collapsible" class:collapsed={!financeOpen} onclick={() => financeOpen = !financeOpen}>
    <span>📈 Finance</span>
    <span class="collapse-summary">
      {#if !financeOpen}
        <span class="summary-text">{interestRate}% · {loanTerm}yr · {dcr}× · {hurdleRate}%</span>
      {/if}
      <span class="chevron" class:chevron-closed={!financeOpen}>▾</span>
    </span>
  </button>

  {#if financeOpen}
    <div class="row">
      <div class="label">Interest rate <InfoTip><p>A typical loan will be in the vicinity of the current mortgage rate. Right now that's around 6.5%.</p><p>Public sector builders can finance with bonds, which get a lower interest rate than loans. Municipal bonds can get something like 5.5%.</p><p>Subsidized loans may be available to nonprofit affordable developers at even lower rates.</p></InfoTip></div>
      <div class="right">
        <input type="number" class="chip chip-sm" bind:value={interestRate} min="0" max="30" step="0.1">
        <span class="unit">%</span>
      </div>
    </div>
    <div class="row">
      <div class="label">Loan term <InfoTip><p>35 years is about as long as you're going to find.</p></InfoTip></div>
      <div class="right">
        <input type="number" class="chip chip-sm" bind:value={loanTerm} min="1" max="50" step="1">
        <span class="unit">yr</span>
      </div>
    </div>
    <div class="row">
      <div class="label">Debt coverage ratio <InfoTip><p>The debt service coverage ratio (DSCR or DCR) is how much net operating income (NOI) you need relative to your monthly debt payments in order for the lender to give you the loan.</p><p>1.15 is about as low as any lender will go.</p></InfoTip></div>
      <div class="right">
        <input type="number" class="chip chip-sm" bind:value={dcr} min="1" max="3" step="0.05">
        <span class="unit">×</span>
      </div>
    </div>
    <div class="row">
      <div class="label">Hurdle rate <InfoTip><p>The annual rate of return on equity that an investor requires to put up money. This is calculated "cash on cash" — annual NOI divided by equity.</p><p>Investors and for-profit developers compare this to the local capitalization rate (cap rate) — the ratio of a building's annual income to its property value. If the returns are lower than local cap rates, an investor would do better buying an existing building than developing a new one.</p><p>For a nonprofit or public developer using its own reserves for equity, the hurdle rate can be zero.</p><p>Both the hurdle rate and the cap rate are expressed as annual income flows — so a 12% hurdle rate means monthly cash flow needs to be 1% of equity invested.</p></InfoTip><InfoTip icon="data"><p>Hurdle rates / cap rates can be mysterious. In New York City, they can be as low as 5% or so. In Kingston, they're likely a few points higher. <a href="https://www.caprateindex.com/cap-rate-list/" target="_blank" rel="noopener">Cap Rate Index</a> puts Kingston at about 9–10%, but I doubt it's actually that high.</p></InfoTip></div>
      <div class="right">
        <input type="number" class="chip chip-sm" bind:value={hurdleRate} min="0" max="30" step="0.5">
        <span class="unit">%</span>
      </div>
    </div>
  {/if}
</div>

<div class="card">
  <div class="card-title">💰 Income & expenses</div>

  <div class="row">
    <div class="label">Rent</div>
    <div class="right">
      <span class="sign sign-in">+</span>
      <span class="computed">{fmt(rent)}</span>
    </div>
  </div>
  <div class="rent-slider-block">
    <div class="rent-ticks rent-ticks-top">
      {#each marketTicks as t}
        <div class="rent-tick" style="left: {rentPct(t.value)}%">
          <span class="rent-tick-label">{t.label}</span>
          <span class="rent-tick-mark"></span>
        </div>
      {/each}
      <span class="rent-axis-label rent-axis-label-top">percentile</span>
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
    <div class="label">Subsidy (operating) <InfoTip><p>Can include Section 8, tax abatements like PILOTs or 421-a, and operating grants like the Empire State Supportive Housing Initiative.</p><p>Often tax abatements will be "capitalized" — you find a lender who will give you a loan and receive the monthly tax abatement as payment. This makes the money available up front but costs some interest.</p></InfoTip></div>
    <div class="right">
      <span class="sign sign-in">+</span>
      <MoneyInput bind:value={operatingSubsidy} step={50} />
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
    <div class="label">Property tax <InfoTip><p>If you get a property tax abatement, you can reduce this number, or add the value to operating subsidy, or add the capitalized value to capital subsidy. Whichever you like.</p></InfoTip></div>
    <div class="right">
      <span class="sign sign-out">−</span>
      <MoneyInput bind:value={propertyTax} step={25} />
    </div>
  </div>

  <div class="result-row" class:result-ok={noiSufficient} class:result-warn={!noiSufficient}>
    <span class="result-label">NOI</span>
    <span class="result-value">
      <span class="sign sign-eq">=</span>{fmt(noi)}
    </span>
  </div>
  {#if noiSufficient}
    <p class="result-message ok">NOI is enough to cover the loan!</p>
  {:else}
    <p class="result-message warn">NOI is less than the loan requirement of {fmt(requiredNoi)}</p>
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
    <p class="result-message ok">Cash flow meets the {hurdleRate}% hurdle rate!</p>
  {:else}
    <p class="result-message warn">Cash flow is less than the hurdle rate requirement of {fmt(requiredCashFlow)}</p>
  {/if}
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

  .divider {
    border-top: 1px solid #e6e2dc;
    margin: 4px 0;
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

  .computed {
    font-size: 15px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: #2b2724;
  }

  .warning-text {
    font-size: 11px;
    font-style: italic;
    color: #b87351;
    margin: -4px 0 4px;
  }

  /* Slider */
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
</style>
