<script>
  let landCost = $state(5000);
  let hardSoftCosts = $state(245000);
  let equity = $state(60000);
  let capitalSubsidy = $state(0);
  let interestRate = $state(6.5);
  let loanTerm = $state(35);
  let rent = $state(2200);
  let operatingSubsidy = $state(0);
  let opCosts = $state(400);
  let propertyTax = $state(250);
  let dcr = $state(1.2);
  let hurdleRate = $state(8);

  function pmt(rate, nper, pv) {
    if (rate === 0) return pv / nper;
    const x = Math.pow(1 + rate, nper);
    return (pv * rate * x) / (x - 1);
  }

  function fmt(n) {
    return '$' + Math.round(n).toLocaleString();
  }

  let totalCost = $derived(landCost + hardSoftCosts);
  let equityPct = $derived((equity / totalCost * 100).toFixed(0));
  let loanNeeded = $derived(totalCost - equity - capitalSubsidy);
  let debtService = $derived(pmt(interestRate / 100 / 12, loanTerm * 12, loanNeeded));
  let noi = $derived(rent - opCosts - propertyTax + operatingSubsidy);
  let cashFlow = $derived(noi - debtService);
  let requiredNoi = $derived(debtService * dcr);
  let noiSufficient = $derived(noi >= requiredNoi);
  let requiredCashFlow = $derived(equity * (hurdleRate / 100) / 12);
  let cfSufficient = $derived(cashFlow >= requiredCashFlow);
</script>

<h1>🏢 Let's build an apartment!</h1>

<div class="card">
  <div class="card-title">🏗️ Development</div>

  <div class="row">
    <div class="label">Land cost</div>
    <div class="right">
      <input type="number" class="chip" bind:value={landCost} min="0" step="1000">
    </div>
  </div>
  <div class="row">
    <div class="label">Hard costs + soft costs</div>
    <div class="right">
      <input type="number" class="chip" bind:value={hardSoftCosts} min="0" step="5000">
    </div>
  </div>
  <div class="row">
    <div class="label">Total development cost</div>
    <div class="right">
      <span class="computed">{fmt(totalCost)}</span>
    </div>
  </div>

  <div class="divider"></div>

  <div class="row">
    <div class="label">
      Equity
      <div class="sublabel">{equityPct}% of TDC</div>
    </div>
    <div class="right">
      <input type="number" class="chip" bind:value={equity} min="0" step="5000">
    </div>
  </div>
  <div class="row">
    <div class="label">Subsidy (capital)</div>
    <div class="right">
      <input type="number" class="chip" bind:value={capitalSubsidy} min="0" step="1000">
    </div>
  </div>
  <div class="row">
    <div class="label">Loan needed</div>
    <div class="right">
      <span class="computed">{fmt(loanNeeded)}</span>
    </div>
  </div>
</div>

<div class="card">
  <div class="card-title">📈 Finance</div>

  <div class="row">
    <div class="label">Interest rate</div>
    <div class="right">
      <input type="number" class="chip chip-sm" bind:value={interestRate} min="0" max="30" step="0.25">
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
  <div class="row">
    <div class="label">Hurdle rate</div>
    <div class="right">
      <input type="number" class="chip chip-sm" bind:value={hurdleRate} min="0" max="30" step="0.5">
      <span class="unit">%</span>
    </div>
  </div>
</div>

<div class="card">
  <div class="card-title">💰 Income & expenses</div>

  <div class="row">
    <div class="label">Rent</div>
    <div class="right">
      <span class="sign sign-in">+</span>
      <input type="number" class="chip" bind:value={rent} min="0" step="50">
    </div>
  </div>
  <div class="row">
    <div class="label">Subsidy (operating)</div>
    <div class="right">
      <span class="sign sign-in">+</span>
      <input type="number" class="chip" bind:value={operatingSubsidy} min="0" step="50">
    </div>
  </div>
  <div class="row">
    <div class="label">Operating costs</div>
    <div class="right">
      <span class="sign sign-out">−</span>
      <input type="number" class="chip" bind:value={opCosts} min="0" step="50">
    </div>
  </div>
  <div class="row">
    <div class="label">Property tax</div>
    <div class="right">
      <span class="sign sign-out">−</span>
      <input type="number" class="chip" bind:value={propertyTax} min="0" step="25">
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
  h1 {
    font-family: 'Cardo', serif;
    font-size: 24px;
    font-weight: 700;
    color: #2b2724;
    margin-bottom: 16px;
  }

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

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 1px solid #b8b2ab;
    background: #fbfaf7;
    padding: 3px 10px;
    border-radius: 6px;
    font-family: 'Inter', sans-serif;
    font-size: 15px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: #2b2724;
    text-align: right;
    width: 120px;
  }
  .chip-sm {
    width: 80px;
  }
  .chip:hover {
    border-color: #8a847e;
  }
  .chip:focus {
    outline: none;
    border-color: #3f6b8a;
    background: #ffffff;
    box-shadow: 0 0 0 3px #dbe4ec;
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
</style>
