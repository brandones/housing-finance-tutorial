# Handoff: Housing Finance Tutorial — Signed Math + Hairline Chip Inputs

## Overview

A mobile-first tutorial UI for housing development finance. Users input a few simple values (development cost, equity, rent, operating costs) and the model computes the derived metrics (loan needed, NOI, debt service, cash flow), helping the user build intuition about how these numbers relate.

The visual approach uses a **"signed math" layout**: the screen reads like a receipt, with `+` for inflows (rent), `−` for outflows (operating costs, debt service), and bold `=` lines for the nets (NOI, cash flow). Inflows are tinted navy; outflows are tinted terracotta; nets are plain bold black.

Inputs use a **hairline chip** affordance: editable values sit in a thin-bordered, soft-fill pill that's clearly tappable but doesn't break the receipt's rhythm. Computed values are plain bold text with no chrome.

## About the Design Files

The files in this bundle are **design references created in HTML** — they're prototypes showing intended look and behavior, not production code to copy directly. The task is to **recreate these designs in the target codebase's existing environment** (the original is a Svelte app — see `_reference_original_svelte/`) using its established patterns. The included `index.html` and `input-affordances.jsx` show the visual target; `variations.jsx` shows the broader brainstorm context (signed math is variation A).

## Fidelity

**High-fidelity.** All colors, type, spacing, and the input affordance treatment are final. Recreate the UI pixel-perfectly using the codebase's component patterns. Numbers, copy, and exact dimensions are documented below.

## Screens / Views

### Single screen: "Let's build an apartment!"

**Purpose:** Teach users how housing development finance works by letting them tweak inputs and watch derived numbers update.

**Layout (mobile, max-width 480px, page padding 16px):**

A vertical stack of two cards on a cream page background:

1. **Header** — `🏢 Let's build an apartment!` (Cardo serif, 24px, weight 700)
2. **Development card** — total cost, equity, loan needed
3. **Income & Expenses + Results card** (single unified card in this design, replacing the previous side-by-side and separate result cards)

The "signed math" card lists the rows in this order:

| Row | Kind | Sign | Treatment |
|---|---|---|---|
| Total development cost | Editable | (none) | Hairline chip |
| Equity | Editable | (none) | Hairline chip, with `20% of total` sub-label |
| Loan needed | Computed | (none) | Plain bold |
| *(divider — 1px solid `#e6e2dc`)* | | | |
| Rent | Editable | `+` (navy) | Hairline chip |
| Operating costs | Editable | `−` (terracotta) | Hairline chip |
| **NOI** | **Result** | `=` (muted) | **Bold result row, top-bordered 1.5px solid ink** |
| Debt service | Computed | `−` (terracotta) | Plain bold, with `6.5% / 35 yr` sub-label |
| **Cash flow** | **Result** | `=` (muted) | **Bold result row, top-bordered 1.5px solid ink** |

**Card chrome:**
- Background: `#ffffff`
- Border: `1px solid #e6e2dc`
- Border-radius: `6px`
- Padding: `18px 18px 20px`
- Title (`Cardo serif, 17px, weight 700`)
- Subtitle (`Inter, 11.5px, color #8a847e, line-height 1.4`)

### Row component

- Layout: flex, `space-between`, `align-items: center`, vertical padding `9px`
- **Label (left):** Inter 14px, color `#4a4642`
- **Sub-label (left, optional):** Inter 10.5px, color `#b8b2ab`, margin-top `1px`
- **Right side:** flex row, gap 4px, holds the optional sign character followed by the value
  - **Sign character:** font-size 14px, weight 600, color depends on kind (navy `#3f6b8a` for inflow, terracotta `#b87351` for outflow, muted `#8a847e` for result)

### Hairline chip (editable values)

```
inline-flex, gap 6px, padding 3px 10px, border-radius 6px
border: 1px solid #b8b2ab
background: #fbfaf7
font-size: 15px, weight 600, font-variant-numeric: tabular-nums
color: #2b2724
```

**Focus state:**
```
border: 1px solid #3f6b8a
background: #ffffff
box-shadow: 0 0 0 3px #dbe4ec   /* soft navy ring */
```

**Hover state (web only):**
```
border: 1px solid #8a847e
```

In a real implementation, each chip is an `<input type="number">` styled to match — or a contenteditable span that opens a numeric keypad on mobile (`inputmode="decimal"`).

### Computed values

Plain bold inline text — no border, no fill:
```
font-size: 15px, weight 700, font-variant-numeric: tabular-nums
color: #2b2724
```

### Result rows (NOI, Cash flow)

Visually emphasized to mark "this is the answer for this stage":
```
border-top: 1.5px solid #2b2724   /* hard divider above */
padding: 11px 0
label: Cardo serif, 15px, weight 700
value: Inter, 17px, weight 700, tabular-nums
"=" prefix: weight 400, color #8a847e, margin-right 4px
```

## Interactions & Behavior

- **Tap a chip** → focus the field; numeric keyboard appears on mobile. All downstream computed and result values update live as the user types.
- **Number formatting:** values are displayed as `$X,XXX` (commas, leading dollar sign, no decimals). On focus, show the raw integer to make editing easier; on blur, re-format.
- **Equity sub-label:** updates live as `(equity / totalCost * 100).toFixed(0) + '% of total'`.

### Sufficiency indicators (S2 · Inked result row)

The two result rows (**NOI** and **Cash flow**) carry a sufficiency state that updates live with every input change. The visual treatment is the same for both rows; only the threshold differs.

**NOI sufficiency:**
- **Sufficient when:** `noi >= debtService * 1.2` (covers 1.2× DSCR)
- **Sufficient message:** `Covers 1.2× debt service`
- **Insufficient message:** `Short of $X,XXX needed` (where `$X,XXX = debtService * 1.2`, formatted)

**Cash flow sufficiency:**
- **Sufficient when:** `cashFlow > 0`
- **Sufficient message:** `Money left over`
- **Insufficient message:** `Operating at a loss`

**Visual treatment of a result row:**

| Element | Sufficient state | Insufficient state |
|---|---|---|
| Top border | `2px solid var(--color-ok)` | `2px solid var(--color-warn)` |
| Label (Cardo, bold) | `color: var(--color-ok)` | `color: var(--color-warn)` |
| Value (Inter, bold, tabular-nums) | `color: var(--color-ok)` | `color: var(--color-warn)` |
| "=" prefix | `color: var(--color-muted)` (unchanged) | `color: var(--color-muted)` (unchanged) |
| Message line (Inter 10–11px, italic, mt 2px) | `color: var(--color-ok)` | `color: var(--color-warn)` |

The result row's border-top weight goes from the base layout's `1.5px solid #2b2724` to **`2px solid <status color>`** so the status reads even at a glance. The "=" prefix stays muted to preserve the receipt-math vocabulary.

**Color tokens for sufficiency** (add to the palette):

| Token | Hex | Usage |
|---|---|---|
| `--color-ok` | `#4a7a3a` | Olive/green — sufficient state border, label, value, message |
| `--color-ok-soft` | `#dde7d2` | (reserved for filled chip / pill variants) |
| `--color-warn` | `#b87351` | Terracotta — insufficient state (same as outflow accent; intentional — short = outflow problem) |
| `--color-warn-soft` | `#efddd1` | (reserved) |

Note: `--color-warn` is identical to `--color-out`. This is intentional: an insufficient result is a problem with outflows being too high, so the visual language ties together.

**Accessibility:**
- Do not rely on color alone. The message line carries the verdict in text.
- Maintain WCAG AA contrast: `#4a7a3a` on `#ffffff` is 4.5:1 ✓; `#b87351` on `#ffffff` is 3.4:1 — bold weights make this readable for 18px+ text, but for the 10–11px message line ship a slightly darker terracotta if QA flags it (e.g. `#a05a3a`).

## State Management

State variables (all numeric):
- `totalCost` (default 300000)
- `equity` (default 60000)
- `rent` (default 2400)
- `opCosts` (default 750)

Constants:
- `interestRate = 0.065`
- `loanTerm = 35` (years)
- `dcr = 1.2` (debt coverage ratio)

Derived (recompute on every input change):
- `equityPct = equity / totalCost`
- `loanNeeded = totalCost - equity`
- `debtService = pmt(interestRate / 12, loanTerm * 12, loanNeeded)` — standard amortization formula
- `noi = rent - opCosts`
- `cashFlow = noi - debtService`
- `requiredNoi = debtService * dcr`
- `noiSufficient = noi > requiredNoi`

The `pmt` function from the original Svelte file:
```js
function pmt(rate, nper, pv) {
  if (rate === 0) return pv / nper;
  const x = Math.pow(1 + rate, nper);
  return (pv * rate * x) / (x - 1);
}
```

## Design Tokens

### Colors

| Token | Hex | Usage |
|---|---|---|
| `--color-page` | `#f8f6f4` | Page background (existing) |
| `--color-card` | `#ffffff` | Card surfaces |
| `--color-ink` | `#2b2724` | Primary text |
| `--color-body` | `#4a4642` | Row labels |
| `--color-muted` | `#8a847e` | Subtitles, "=" prefix |
| `--color-faint` | `#b8b2ab` | Hairline chip border, sub-labels |
| `--color-rule` | `#e6e2dc` | Card border, dividers |
| `--color-chip-fill` | `#fbfaf7` | Hairline chip background (rest) |
| `--color-in` | `#3f6b8a` | Inflow accent (navy) |
| `--color-in-soft` | `#dbe4ec` | Focus ring fill |
| `--color-out` | `#b87351` | Outflow accent (terracotta) |
| `--color-out-soft` | `#efddd1` | (reserved) |
| `--color-ok` | `#4a7a3a` | Sufficiency: NOI covers DSCR / cash flow positive |
| `--color-warn` | `#b87351` | Sufficiency: short / negative (same as outflow) |

### Typography

- **Heading family:** `'Cardo', serif` (Google Fonts; weights 400, 700)
- **Body family:** `'Inter', sans-serif` (Google Fonts; weights 400, 500, 600, 700)

| Style | Family | Size | Weight | Other |
|---|---|---|---|---|
| Page title (`h1`) | Cardo | 24px | 700 | |
| Card title | Cardo | 17px | 700 | |
| Result row label | Cardo | 15px | 700 | |
| Card subtitle | Inter | 11.5px | 400 | line-height 1.4, color muted |
| Row label | Inter | 14px | 400 | color body |
| Sub-label | Inter | 10.5px | 400 | color faint |
| Chip value | Inter | 15px | 600 | tabular-nums |
| Computed value | Inter | 15px | 700 | tabular-nums |
| Result value | Inter | 17px | 700 | tabular-nums |

All numeric values must use `font-variant-numeric: tabular-nums` so columns align.

### Spacing

- Card padding: `18px 18px 20px`
- Row vertical padding: `9px`
- Result row vertical padding: `11px`
- Card-to-card gap: `12px`
- Sign-to-value gap: `4px`
- Chip internal gap: `6px`

### Radius / borders

- Card: `6px` radius, `1px solid var(--color-rule)`
- Chip: `6px` radius, `1px solid var(--color-faint)`
- Card divider: `1px solid var(--color-rule)`, margin `4px 0`
- Result-row top border: `1.5px solid var(--color-ink)`

### No shadows

The design is intentionally flat. Focus state is the only place a shadow appears (the soft navy ring on chips).

## Assets

No image or icon assets — emoji are used inline in headings (`🏢`, `🏗️`, `💵`, `💸`, `💰`, `🤑`, `📈`) for the original Svelte version. The signed-math card consolidates rows into one card, so only the page-title `🏢` needs to remain. **Confirm with the team whether to keep emoji or swap to a hand-drawn icon set.**

## Files in this bundle

- `README.md` — this document
- `index.html` — the brainstorm canvas containing the visualization, input-affordance, and sufficiency variations. The chosen direction is **Variation A (signed math)** + **Variation IA (hairline chip)** + **Variation S2 (inked result row)**.
- `variations.jsx` — visualization brainstorm; `VariationA` is the signed-math layout
- `input-affordances.jsx` — input affordance brainstorm; `VariationIA` is the hairline chip
- `sufficiency.jsx` — sufficiency-indicator brainstorm; `VariationS2` is the inked result row
- `design-canvas.jsx` — the canvas wrapper used to lay out variations side-by-side (not part of the production design)
- `_reference_original_svelte/` — the user's original Svelte source files for reference:
  - `App.svelte` — root layout (480px max-width)
  - `lib/Model1.svelte` — the original model with bordered-input fields (the one the new design replaces)
  - `app.css` — global font imports + body color/background
- `_reference_screenshot.png` — screenshot of the original UI for context

## Reference values (used in all mocks)

```
totalCost = 300000   →  $300,000
equity    = 60000    →  $60,000   (20% of total)
loanNeeded = 240000  →  $240,000
rent      = 2400     →  $2,400    (+)
opCosts   = 750      →  $750      (−)
noi       = 1650     →  $1,650    (= NOI)
debt      = 1450     →  $1,450    (−, computed at 6.5% / 35 yr)
cashFlow  = 200      →  $200      (= Cash flow)
```
