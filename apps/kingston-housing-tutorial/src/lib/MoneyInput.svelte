<script>
  let {
    value = $bindable(0),
    class: cls = 'chip',
    highlight = false,
    step = 50,
    min = 0,
  } = $props();

  function format(n) {
    if (n == null || isNaN(n)) return '$0';
    return '$' + Math.round(n).toLocaleString();
  }
  function parse(s) {
    const n = parseFloat(String(s).replace(/[^0-9.-]/g, ''));
    return isNaN(n) ? 0 : n;
  }
  function digitsBefore(s, pos) {
    let count = 0;
    for (let i = 0; i < pos && i < s.length; i++) {
      if (/\d/.test(s[i])) count++;
    }
    return count;
  }
  function posAfterNDigits(s, n) {
    if (n === 0) {
      const idx = s.indexOf('$');
      return idx >= 0 ? idx + 1 : 0;
    }
    let count = 0;
    for (let i = 0; i < s.length; i++) {
      if (count === n) return i;
      if (/\d/.test(s[i])) count++;
    }
    return s.length;
  }
  function groupDigits(digits) {
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  let display = $state(format(value));
  let focused = false;
  let inputEl;

  $effect(() => {
    if (!focused) display = format(value);
  });

  function handleInput(e) {
    if (!e.isTrusted) return; // synthetic events from bump pass through
    const input = e.currentTarget;
    const oldVal = input.value;
    const cursorPos = input.selectionStart ?? oldVal.length;
    const dbc = digitsBefore(oldVal, cursorPos);
    const digitsOnly = oldVal.replace(/[^0-9]/g, '');
    const n = parse(oldVal);

    // Preserve leading zeros while editing (so deleting "3" from "$300" → "$00", not "$0")
    const newDisplay = (digitsOnly.length > 1 && digitsOnly[0] === '0')
      ? '$' + groupDigits(digitsOnly)
      : format(n);

    input.value = newDisplay;
    const newPos = posAfterNDigits(newDisplay, dbc);
    input.setSelectionRange(newPos, newPos);
    value = n;
    display = newDisplay;
  }

  function handleFocus(e) {
    focused = true;
    requestAnimationFrame(() => e.currentTarget.select());
  }
  function handleBlur() {
    focused = false;
    display = format(value);
  }
  function bump(delta) {
    value = Math.max(min, value + delta);
    display = format(value);
    inputEl?.dispatchEvent(new Event('input', { bubbles: true }));
  }
  function handleKeyDown(e) {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      bump(step);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      bump(-step);
    }
  }
</script>

<span class="money-input">
  <input
    type="text"
    inputmode="decimal"
    class="{cls}"
    class:chip-highlight={highlight}
    bind:this={inputEl}
    value={display}
    oninput={handleInput}
    onfocus={handleFocus}
    onblur={handleBlur}
    onkeydown={handleKeyDown}
  />
  <span class="steppers">
    <button type="button" class="stepper-btn" tabindex="-1" onmousedown={(e) => e.preventDefault()} onclick={() => bump(step)} aria-label="Increase">▲</button>
    <button type="button" class="stepper-btn" tabindex="-1" onmousedown={(e) => e.preventDefault()} onclick={() => bump(-step)} aria-label="Decrease">▼</button>
  </span>
</span>

<style>
  .money-input {
    position: relative;
    display: inline-flex;
    align-items: stretch;
  }
  .money-input input {
    padding-right: 18px;
  }
  .steppers {
    position: absolute;
    right: 2px;
    top: 2px;
    bottom: 2px;
    display: flex;
    flex-direction: column;
    pointer-events: auto;
  }
  .stepper-btn {
    background: transparent;
    border: none;
    color: #b8b2ab;
    cursor: pointer;
    font-size: 7px;
    line-height: 1;
    padding: 0 3px;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Inter', sans-serif;
  }
  .stepper-btn:hover {
    color: #4a4642;
  }
  .stepper-btn:active {
    color: #2b2724;
  }
</style>
