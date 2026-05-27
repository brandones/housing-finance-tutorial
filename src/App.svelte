<script>
  import Model1 from './lib/Model1.svelte'
  import Model2 from './lib/Model2.svelte'
  import Model3 from './lib/Model3.svelte'
  import Model4 from './lib/Model4.svelte'

  let stage = $state(0);
  let touchedCount = $state(0);
  let touchedInputs = new Set();
  const INTERACTION_THRESHOLD = 2;
  let hasInteracted = $derived(touchedCount >= INTERACTION_THRESHOLD);

  const stages = [
    { num: '01', label: 'Basics' },
    { num: '02', label: 'Finance' },
    { num: '03', label: 'Development' },
    { num: '04', label: 'Social Housing' },
  ];

  const bannerText = [
    {
      rest: 'Try changing rent or operating costs. Watch NOI and cash flow respond.',
      ready: "Next we'll mess with the financial variables.",
    },
    {
      rest: 'Try adjusting the finance parameters or adding subsidy.',
      ready: "Next we'll break down development costs in detail.",
    },
    {
      rest: 'Try adjusting construction or land costs.',
      ready: "Next we'll look at how social housing changes the equation.",
    },
    {
      rest: "Now let's see how things are different for a public developer. Note the lower land costs, interest rate, and property taxes, as well as the higher wage level.",
      ready: '',
    },
  ];

  function handleInput(e) {
    if (e.target && !touchedInputs.has(e.target)) {
      touchedInputs.add(e.target);
      touchedCount = touchedInputs.size;
    }
  }

  function resetInteractions() {
    touchedInputs.clear();
    touchedCount = 0;
  }

  function advance() {
    if (stage < stages.length - 1) {
      stage++;
      resetInteractions();
    }
  }

</script>

<main>
  <h1>🔑 Let's build an apartment!</h1>
  <p class="location">
    <svg class="pin" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
    Kingston, NY
  </p>

  <nav class="chapter-strip">
    {#each stages as s, i}
      <button
        class="tile"
        class:current={stage === i}
        class:past={stage > i}
        class:future={stage < i}
        onclick={() => { stage = i; resetInteractions(); }}
        disabled={i > 3}
      >
        {#if stage === i}
          <span class="tile-num">{s.num}</span>
          <span class="tile-label">{s.label}</span>
        {:else}
          <span class="tile-other-num">{s.num}</span>
        {/if}
      </button>
    {/each}
  </nav>

  {#if bannerText[stage]}
    {#if hasInteracted && stage < stages.length - 1}
      <div class="banner banner-ready">
        <p class="banner-message">{bannerText[stage].ready}</p>
        <button class="banner-cta" onclick={advance}>Continue →</button>
      </div>
    {:else if bannerText[stage].rest}
      <div class="banner banner-rest">
        <p class="banner-message">{bannerText[stage].rest}</p>
      </div>
    {/if}
  {/if}

  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div oninput={handleInput}>
    {#if stage === 0}
      <Model1 />
    {:else if stage === 1}
      <Model2 />
    {:else if stage === 2}
      <Model3 />
    {:else if stage === 3}
      <Model4 />
    {/if}
  </div>

  <footer>
    <span class="credit">Brandon Istenes / Rent & Rentier 2026</span>
  </footer>
</main>

<style>
  main {
    max-width: 480px;
    margin: 0 auto;
    padding: 16px;
  }

  h1 {
    font-family: 'Cardo', serif;
    font-size: 24px;
    font-weight: 700;
    color: #2b2724;
    margin: 0 0 2px;
  }

  .location {
    display: flex;
    align-items: center;
    gap: 4px;
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    color: #8a847e;
    margin: 0 0 12px;
  }

  .pin {
    flex-shrink: 0;
  }

  .chapter-strip {
    display: flex;
    gap: 6px;
    margin-bottom: 16px;
  }

  .tile {
    border-radius: 6px;
    border: 1px solid #e6e2dc;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: flex 0.42s cubic-bezier(.5, 0, .2, 1),
                padding 0.42s cubic-bezier(.5, 0, .2, 1),
                background 0.35s ease,
                border-color 0.35s ease,
                color 0.35s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 0;
    overflow: hidden;
  }

  .tile.current {
    flex: 3;
    background: #2b2724;
    border-color: #2b2724;
    color: #ffffff;
    padding: 7px 11px;
    align-items: flex-start;
  }

  .tile.past, .tile.future {
    flex: 1;
    background: #ffffff;
    border-color: #e6e2dc;
    color: #b8b2ab;
    padding: 7px 0;
  }

  .tile.past {
    cursor: pointer;
  }

  .tile:disabled {
    cursor: default;
    opacity: 0.6;
  }

  .tile-num {
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.6px;
    opacity: 0.7;
  }

  .tile-label {
    font-family: 'Cardo', serif;
    font-size: 14.5px;
    font-weight: 700;
  }

  .tile-other-num {
    font-size: 9.5px;
    font-weight: 700;
  }

  .banner {
    padding: 10px 12px;
    border: 1px solid transparent;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
    min-height: 48px;
  }

  .banner-rest {
    border-color: #e6e2dc;
    background: #fbfaf7;
    color: #4a4642;
  }

  .banner-ready {
    border-color: #3f6b8a;
    background: #dbe4ec;
    color: #3f6b8a;
  }

  .banner-message {
    flex: 1;
    font-size: 12.5px;
    line-height: 1.4;
    margin: 0;
  }

  .banner-cta {
    font-family: 'Inter', sans-serif;
    font-size: 11.5px;
    font-weight: 600;
    padding: 6px 10px;
    border-radius: 5px;
    border: 1px solid #3f6b8a;
    background: #3f6b8a;
    color: #ffffff;
    cursor: pointer;
    white-space: nowrap;
  }

  .banner-cta:hover {
    opacity: 0.9;
  }

  footer {
    margin-top: 24px;
    padding-top: 12px;
    font-family: 'Inter', sans-serif;
    font-size: 11px;
    color: #8a847e;
  }
</style>
