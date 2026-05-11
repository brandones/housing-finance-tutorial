<script>
  import Model1 from './lib/Model1.svelte'
  import Model2 from './lib/Model2.svelte'

  let stage = $state(0);

  const stages = [
    { num: '01', label: 'Basics' },
    { num: '02', label: 'Finance' },
    { num: '03', label: 'Risk' },
  ];
</script>

<main>
  <nav class="chapter-strip">
    {#each stages as s, i}
      <button
        class="tile"
        class:current={stage === i}
        class:past={stage > i}
        class:future={stage < i}
        onclick={() => { stage = i; }}
        disabled={i > 1}
      >
        {#if stage === i}
          <span class="tile-num">{s.num}</span>
          <span class="tile-label">{s.label}</span>
        {:else if stage > i}
          <span class="tile-check">✓</span>
        {:else}
          <span class="tile-future-num">{s.num}</span>
        {/if}
      </button>
    {/each}
  </nav>

  {#if stage === 0}
    <Model1 />
  {:else if stage === 1}
    <Model2 />
  {/if}
</main>

<style>
  main {
    max-width: 480px;
    margin: 0 auto;
    padding: 16px;
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
                padding 0.42s cubic-bezier(.5, 0, .2, 1);
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

  .tile.past {
    flex: 1;
    background: #dde7d2;
    border-color: #dde7d2;
    color: #4a7a3a;
    padding: 7px 0;
  }

  .tile.future {
    flex: 1;
    background: #ffffff;
    border-color: #e6e2dc;
    color: #b8b2ab;
    padding: 7px 0;
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

  .tile-check {
    font-size: 9.5px;
    font-weight: 700;
  }

  .tile-future-num {
    font-size: 9.5px;
    font-weight: 700;
  }
</style>
