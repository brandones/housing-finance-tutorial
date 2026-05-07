<script>
  let totalCost = $state(300000);
  let equity = $state(60000);
  let rent = $state(2500);
  let opCosts = $state(750);

  const interestRate = 0.065;
  const loanTerm = 35;
  const dcr = 1.2;

  function pmt(rate, nper, pv) {
    if (rate === 0) return pv / nper;
    const x = Math.pow(1 + rate, nper);
    return (pv * rate * x) / (x - 1);
  }

  function fmt(n) {
    return '$' + Math.round(n).toLocaleString();
  }

  let equityPct = $derived(equity / totalCost);
  let loanNeeded = $derived(totalCost - equity);
  let debtService = $derived(pmt(interestRate / 12, loanTerm * 12, loanNeeded));
  let noi = $derived(rent - opCosts);
  let cashFlow = $derived(noi - debtService);
  let requiredNoi = $derived(debtService * dcr);
  let noiSufficient = $derived(noi > requiredNoi);
</script>

<h1>🏢 Let's build an apartment!</h1>

<div class="section">
  <h2>🏗️ Development</h2>
  <div class="row">
    <label for="totalCost">Total Development Cost</label>
    <input type="number" id="totalCost" bind:value={totalCost} min="0" step="10000">
  </div>
  <div class="row">
    <label for="equity">Equity</label>
    <div class="input-with-suffix">
      <input type="number" id="equity" bind:value={equity} min="0" step="5000">
      <span class="suffix">({(equityPct * 100).toFixed(0)}%)</span>
    </div>
  </div>
  <div class="row">
    <span class="row-label">Loan needed</span>
    <span class="value">{fmt(loanNeeded)}</span>
  </div>
</div>

<div class="side-by-side">
  <div class="section">
    <h2>💵 Income</h2>
    <div class="row">
      <label for="rent">Rent</label>
      <input type="number" id="rent" bind:value={rent} min="0" step="50">
    </div>
  </div>

  <div class="section">
    <h2>💸 Expenses</h2>
    <div class="row">
      <label for="opCosts">Operating costs</label>
      <input type="number" id="opCosts" bind:value={opCosts} min="0" step="50">
    </div>
  </div>
</div>

<div class="section">
  <h2>💰 Net Operating Income (NOI)</h2>
  <div class="row">
    <span class="row-label">Rent minus operating costs</span>
    <span class="value">{fmt(noi)}</span>
  </div>
  {#if noiSufficient}
    <p class="noi-message sufficient">NOI is enough to cover the loan!</p>
  {:else}
    <p class="noi-message insufficient">NOI is less than the loan requirement of {fmt(requiredNoi)}</p>
  {/if}
</div>

<div class="section">
  <h2>🤑 Debt Service</h2>
  <div class="row">
    <span class="row-label">Monthly loan payment</span>
    <span class="value">{fmt(debtService)}</span>
  </div>
  <p class="helper">6.5% interest, 35-year term</p>
  <p class="helper">1.2x DSCR requires NOI of {fmt(requiredNoi)}</p>
</div>

<div class="section">
  <h2>📈 Cash Flow</h2>
  <div class="row">
    <span class="row-label">NOI minus debt service</span>
    <span class="value {cashFlow >= 0 ? 'positive' : 'negative'}">{fmt(cashFlow)}</span>
  </div>
</div>

<style>
  h1 { font-size: 1.4rem; margin-bottom: 12px; }
  h2 { font-size: 1.1rem; margin-bottom: 8px; }
  .section { background: #fff; border-radius: 8px; padding: 14px; margin-bottom: 12px; }
  .side-by-side {
    display: flex;
    gap: 12px;
  }
  .side-by-side .section {
    flex: 1;
  }
  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
  }
  .row label, .row .row-label { font-size: 0.9rem; }
  .value { font-size: 0.9rem; font-weight: 600; }
  .input-with-suffix { text-align: right; }
  .suffix { font-size: 0.8rem; color: #666; display: block; }
  .helper { font-size: 0.8rem; color: #666; margin-top: 4px; }
  input[type="number"] {
    width: 110px;
    padding: 6px 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 0.9rem;
    text-align: right;
  }
  .positive { color: #2e7d32; font-weight: 700; }
  .negative { color: #c62828; font-weight: 700; }
  .noi-message { font-size: 0.85rem; margin-top: 4px; font-style: italic; }
  .noi-message.sufficient { color: #2e7d32; }
  .noi-message.insufficient { color: #c62828; }
</style>
