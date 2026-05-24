<script>
  import InfoTip from './InfoTip.svelte';
  import MoneyInput from './MoneyInput.svelte';

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

  let equityPct = $derived((equity / totalCost * 100).toFixed(0));
  let loanNeeded = $derived(totalCost - equity);
  let debtService = $derived(pmt(interestRate / 12, loanTerm * 12, loanNeeded));
  let noi = $derived(rent - opCosts);
  let cashFlow = $derived(noi - debtService);
  let requiredNoi = $derived(debtService * dcr);
  let noiSufficient = $derived(noi >= requiredNoi);
  let cfSufficient = $derived(cashFlow > 0);
</script>

<div class="card">
  <div class="card-title">🏗️ Development</div>

  <div class="row">
    <div class="label">Total development cost <InfoTip><p>Includes land costs, construction, and soft costs (fees, legal services, etc).</p></InfoTip><InfoTip icon="data"><p>In Kingston, ~$260 per square foot of living space is the absolute low end. $300/sqft is a typical low end for private development. Most local affordable housing projects are more like $400–$500/sqft.</p></InfoTip></div>
    <div class="right">
      <MoneyInput bind:value={totalCost} step={10000} />
    </div>
  </div>
  <div class="row">
    <div class="label">
      Equity <InfoTip><p>How much cash do you have available? This is like the down payment on a house.</p><p>You can also get equity from others, but they will expect returns and have a stake in your project.</p></InfoTip>
      <div class="sublabel">{equityPct}% of total</div>
    </div>
    <div class="right">
      <MoneyInput bind:value={equity} step={5000} />
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
  <div class="card-title">💰 Income & expenses</div>

  <div class="row">
    <div class="label">Rent <InfoTip icon="data"><p>Check reference rents on <a href="https://www.rentometer.com/" target="_blank" rel="noopener">Rentometer</a>.</p><p>75th percentile apartment rents in Kingston: $1,800/1BR, $2,200/2BR, $2,400/3BR. If you try to charge much more than that, you may lose money to vacancies.</p></InfoTip></div>
    <div class="right">
      <span class="sign sign-in">+</span>
      <MoneyInput bind:value={rent} step={50} />
    </div>
  </div>
  <div class="row">
    <div class="label">Operating costs <InfoTip><p>Includes utilities, taxes, insurance, and maintenance.</p></InfoTip><InfoTip icon="data"><p>$750/month is pretty typical for Kingston.</p><p><a href="https://www.prea.org/publications/quarterly/multifamily-property-expenses-rising-rapidly-led-by-insurance/" target="_blank" rel="noopener">PREA</a> is a good source for national comparisons.</p></InfoTip></div>
    <div class="right">
      <span class="sign sign-out">−</span>
      <MoneyInput bind:value={opCosts} step={50} />
    </div>
  </div>

  <div class="result-row" class:result-ok={noiSufficient} class:result-warn={!noiSufficient}>
    <span class="result-label">NOI <InfoTip><p>Net Operating Income or NOI is revenue (just rent in this case) minus operating costs.</p></InfoTip></span>
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
      Debt service <InfoTip><p>The payments made on the loan.</p></InfoTip>
      <div class="sublabel">6.5% / 35 yr</div>
    </div>
    <div class="right">
      <span class="sign sign-out">−</span>
      <span class="computed">{fmt(debtService)}</span>
    </div>
  </div>

  <div class="result-row" class:result-ok={cfSufficient} class:result-warn={!cfSufficient}>
    <span class="result-label">Cash flow <InfoTip><p>For a for-profit developer, this is profit. For a nonprofit or public developer, cash flow provides funding that can be used to help build or subsidize other projects.</p></InfoTip></span>
    <span class="result-value">
      <span class="sign sign-eq">=</span>{fmt(cashFlow)}
    </span>
  </div>
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
