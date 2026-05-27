<script>
  let { children, icon = 'info' } = $props();
  let open = $state(false);
  let hovered = $state(false);
  let seen = $state(false);
  let el;
  let popoverEl;

  let show = $derived(open || hovered);
  let glow = $derived(!seen);

  function toggle() {
    open = !open;
    seen = true;
  }
  function handlePointerEnter(e) {
    if (e.pointerType !== 'mouse') return;
    hovered = true;
    seen = true;
  }
  function handlePointerLeave(e) {
    if (e.pointerType !== 'mouse') return;
    hovered = false;
  }

  function handleClickOutside(e) {
    if (open && el && !el.contains(e.target)) {
      open = false;
    }
  }

  // Keep popover within viewport
  $effect(() => {
    if (!show || !popoverEl) return;
    requestAnimationFrame(() => {
      if (!popoverEl) return;
      const rect = popoverEl.getBoundingClientRect();
      const vw = window.innerWidth;
      const margin = 8;
      let shift = 0;
      if (rect.left < margin) shift = margin - rect.left;
      else if (rect.right > vw - margin) shift = (vw - margin) - rect.right;
      popoverEl.style.setProperty('--shift', `${shift}px`);
    });
  });
</script>

<svelte:document onclick={handleClickOutside} />

<span
  class="info-tip"
  bind:this={el}
  onpointerenter={handlePointerEnter}
  onpointerleave={handlePointerLeave}
>
  <button class="info-icon" class:glow onclick={toggle} aria-label={icon === 'data' ? 'Local data' : 'More info'}>
    {#if icon === 'data'}
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
        <rect x="1.5" y="10" width="2.5" height="4.5" rx="0.5" />
        <rect x="6.75" y="6" width="2.5" height="8.5" rx="0.5" />
        <rect x="12" y="1.5" width="2.5" height="13" rx="0.5" />
      </svg>
    {:else}
      ⓘ
    {/if}
  </button>
  {#if show}
    <div class="popover" bind:this={popoverEl}>
      {@render children()}
    </div>
  {/if}
</span>

<style>
  .info-tip {
    position: relative;
    display: inline-flex;
    align-items: center;
    margin-left: 4px;
  }

  .info-icon {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 13px;
    color: #c8c2bb;
    padding: 0;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    transition: color 0.15s ease;
  }

  .info-icon:hover {
    color: #8a847e;
  }

  .info-icon.glow {
    color: #3f6b8a;
    animation: info-glow 1.8s ease-in-out infinite;
  }
  .info-icon.glow:hover {
    color: #2d5470;
  }

  @keyframes info-glow {
    0%, 100% { filter: drop-shadow(0 0 2px rgba(63, 107, 138, 0.5)); }
    50%      { filter: drop-shadow(0 0 6px rgba(63, 107, 138, 1)); }
  }

  .popover {
    position: absolute;
    bottom: calc(100% + 6px);
    left: 50%;
    transform: translateX(calc(-50% + var(--shift, 0px)));
    background: #2b2724;
    color: #f0eee9;
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 400;
    line-height: 1.45;
    padding: 8px 10px;
    border-radius: 6px;
    width: max-content;
    max-width: min(240px, calc(100vw - 16px));
    z-index: 10;
    pointer-events: auto;
  }

  .popover :global(p) {
    margin: 0;
  }

  .popover :global(p + p) {
    margin-top: 6px;
  }

  .popover :global(a) {
    color: #dbe4ec;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .popover :global(a:hover) {
    color: #ffffff;
  }

  .popover::after {
    content: '';
    position: absolute;
    top: 100%;
    left: calc(50% - var(--shift, 0px));
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: #2b2724;
  }
</style>
