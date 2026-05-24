# Handoff: Stage Transition Animation (PR4)

## Overview

This handoff covers a single self-contained motion prototype: the **stage-to-stage transition** for a multi-stage financial-modeling tutorial (a "build an apartment" walkthrough). The prototype illustrates how a user moves from **Stage 1 — Basics** (rent, operating costs, NOI, cash flow) into **Stage 2 — Finance** (interest rate, DSCR, equity return) inside a phone-sized canvas.

The deliverable is the choreography itself: chapter-strip behavior, model-card crossfade, the in-flow narrator banner that escalates from rest → ready, and the way Stage 2's content stacks (collapsed Development → new Finance card → carried-forward Income & Expenses).

## About the Design Files

The files in this bundle are **design references created in HTML/React** — a prototype showing intended look and behavior, not production code to copy directly. The HTML uses inline React + Babel transpilation in the browser purely for prototyping convenience.

The task is to **recreate this design in the target codebase's existing environment** (React, Svelte, Vue, SwiftUI, native, etc.) using its established components, animation primitives, and design tokens. If no environment exists yet, pick the most appropriate framework for the project and implement there.

The prototype loops on a fixed 10-second timeline so the motion is easy to study; in the real product, transitions are driven by user actions (typing into inputs, tapping Continue) — not a scrubber.

## Fidelity

**High-fidelity (hifi)** — final colors, typography, spacing, easing curves, and interaction states are all specified below to exact values. Pixel-match where reasonable, but adapt to the host codebase's design system rather than introducing one-off tokens.

## Screens / Views

There is one screen with two visible states (Stage 1 and Stage 2), connected by a transition. The phone-frame canvas is **360 × 720** with a 10px black bezel (`#1a1714`) and 38px outer radius. A 110 × 22 notch sits centered at the top.

### Top: Chapter Strip (persistent across stages)

- Anchored at `top: 30, left: 14, right: 14`, `z-index: 5`.
- Row of 4 tiles, `gap: 6`.
- Each tile: `border-radius: 6`, `1px` border.
- **Current tile** expands to `flex: 3`, all others `flex: 1`. Expansion transition: `flex .42s cubic-bezier(.5, 0, .2, 1)` (matched on `padding`).
- Current tile: background `#2b2724` (ink), white text, padding `7px 11px`, content left-aligned. Shows the stage number (`02`) at 9.5px / 700 / `letter-spacing: 0.6` with `opacity: 0.7`, then the stage label below in **Cardo serif 14.5px / 700**.
- Past tiles: background `#dde7d2` (okSoft), text `#4a7a3a` (ok), centered checkmark glyph at 9.5px / 700.
- Future tiles: white background, `#b8b2ab` (faint) text, centered number.
- **Stages**: `01 Basics`, `02 Finance`, `03 Risk`, `04 Exit`. The strip's current-index flip happens at `transProgress > 0.6` so it lines up with the moment Stage 2 visually dominates — not at the literal midpoint.

### Middle: Model Card Area (Stage 1)

Scrollable region from `top: 76` to `bottom: 14`, padding `6px 14px 14px`. Contents stack vertically: Stage 1 cards, then the narrator banner, with a `marginTop/marginBottom: 14` gap between them.

**H1**: `🏢 Let's build an apartment!` — Cardo serif, 22px / 700, `margin-bottom: 14`.

**Development card** (carried forward in Stage 2 as a collapsed row):
- White, `1px solid #e6e2dc` border, `border-radius: 6`, padding `14px 16px`, `margin-bottom: 12`.
- Title `🏗️ Development` in Cardo 15 / 700, `margin-bottom: 8`.
- Three rows: `Total cost $300,000`, `Equity $60,000` (sublabel "20% of total"), `Loan needed $240,000`.

**Income & Expenses card**:
- Same shell as Development.
- Two editable rows (Rent, Operating costs) using a **highlighted ChipInput**: `1px solid #3f6b8a` (in) border, `box-shadow: 0 0 0 3px #dbe4ec` (inSoft) ring on focus, `$` prefix in `#8a847e` (muted), tabular-num right-aligned input at 15 / 600.
- Each row has a colored sign indicator: `+` in blue `#3f6b8a` for Rent, `−` in orange `#b87351` for costs.
- **NOI ResultRow**: top border `2px solid` in `#4a7a3a` (ok) or `#b87351` (out) depending on whether NOI ≥ 1.2 × debt service. Label "NOI" in Cardo 15 / 700, value at 17 / 700 tabular-num with `=` prefix in muted. Italic 11px msg below: "Covers 1.2× debt service" or `Short of $X needed`.
- **Debt service** row: read-only Plain (no chip), sublabel "6.5% / 35 yr".
- **Cash flow ResultRow**: same pattern; "Money left over" vs "Operating at a loss".

### Middle: Model Card Area (Stage 2)

Same H1. Card stack changes:

1. **Development — collapsed**. Single line: white card, `1px solid #e6e2dc`, padding `10px 16px`, `margin-bottom: 12`. Left: `🏗️ Development` Cardo 14 / 700. Right: `$300,000 · 20% eq` at 11.5px muted, tabular-num, with a `▾` chevron in faint. No fade — full opacity.
2. **Finance — new card** (highlighted). White, **`2px solid #3f6b8a`** (in) border, **`box-shadow: 0 0 0 4px #dbe4ec`** ring, padding `14px 16px`, `margin-bottom: 12`. Title `📈 Finance` Cardo 15 / 700 in `#3f6b8a`. Three rows, each with a highlighted Chip: `Interest rate 6.5%`, `DSCR target 1.2×`, `Required equity return 8.0%`.
3. **Income & Expenses — carried forward**. Same structure as Stage 1 but with **all values static / non-editable** (no ChipInput, just Chip): Rent `$2,800`, Operating costs `$750`, NOI/Debt service/Cash flow computed the same way. Debt service uses the same loan from Development.

### Bottom: Narrator Banner (inside the scroll area, after content)

The banner sits at the bottom of the Stage 1 content stack — not pinned to the viewport. It has three visual variants but the prototype uses only **rest** and **ready** (the amber "engaged" variant is defined in code but intentionally skipped).

Common shell: padding `10px 12px`, `1px solid` border, `border-radius: 8`, `display: flex; align-items: center; gap: 10`. Transitions `background .35s, border-color .35s, color .35s` so the swap feels like one banner shifting tone, not two banners replacing each other.

| State | Background | Border | Text color | Italic | Lead | Message | CTA |
|---|---|---|---|---|---|---|---|
| `rest` | `#fbfaf7` | `#e6e2dc` rule | `#8a847e` muted | yes | — | Try changing rent or operating costs. Watch NOI and cash flow respond. | none |
| `engaged` *(defined, unused)* | `#f1e6cc` amberSoft | `#b8893a` amber | `#b8893a` amber | no | "Nice." | Keep playing, or move on whenever you're ready. | "Continue →" secondary |
| `ready` | `#dbe4ec` inSoft | `#3f6b8a` in | `#3f6b8a` in | no | — | Next we'll add interest rate, DSCR, and equity returns. | "Continue →" **primary** |

Lead is `<strong>` with `margin-right: 4` when present. Message is 12.5px / 1.4 line-height. CTA button: Inter 11.5 / 600, padding `6px 10px`, `border-radius: 5`, `border: 1px solid #3f6b8a`. Primary: blue fill + white text. Secondary: white fill + blue text.

## Interactions & Behavior

### Timeline (prototype loops 0 → 10s)

| t (s) | Event | Phase | Stage | Scroll |
|---|---|---|---|---|
| 0.0 | Land on Stage 1 | `rest` | 0 | 0 |
| 2.5 | User edits Rent (animated 2500 → 2800 over 2.0–3.5s) | `rest` | 0 | 0.6 |
| 5.0 | After a beat → banner shifts to `ready` | `ready` | 0 | 1.0 |
| 7.0 | Tap Continue → transition begins | `transition` | 0 | 1.0 |
| 8.6 | Transition complete — Stage 2 settled | `rest` | 1 | 0 |

In production this is event-driven, not time-driven:
- `rest` is the default after a stage loads.
- `ready` is triggered after the user has interacted with at least one editable input and a short dwell (~1.5–2s of no further input) has elapsed. The amber `engaged` state is **not used** — go directly from `rest` to `ready`.
- Tapping the primary "Continue →" button on the `ready` banner kicks off the transition.

### Stage-to-stage transition (1.6s)

Driven by a single `transProgress` 0 → 1 from t=7.0 to t=8.6. All values below are functions of that progress.

- **Stage 1 fades out** over `0 → 0.6`: `opacity = max(0, 1 - p/0.6)`; `translateY = -40 * p` px.
- **Stage 2 fades in** over `0.4 → 1`: `opacity = min(1, (p-0.4)/0.6)`; `translateY = max(0, (1 - (p-0.4)/0.6)) * 40` px (slides up into place).
- The two render simultaneously through the overlap window so there is **no blank frame**. Stage 1 switches to `position: absolute` once `p > 0.4` to free flow for Stage 2 underneath; Stage 1 also drops `pointer-events` to none when its `stageIndex` is no longer 0.
- **Chapter strip** flips its current-index at `p > 0.6` (deliberately past the midpoint — feels less abrupt than 0.5).
- Recommended easing in production: a single `cubic-bezier(.5, 0, .2, 1)` driving a shared progress value, with the two stages' opacity/translate derived from it as above. Total duration **1.6s**.

### Editable rent affordance (Stage 1)

- The Rent input animates from $2,500 → $2,800 between t=2.0–3.5s purely to demonstrate the affordance in the loop. In production, the user types into it directly.
- Highlighted ChipInput: `box-shadow: 0 0 0 3px #dbe4ec` ring is permanent (it indicates editability), the border swap on focus is `transition: border-color .15s, box-shadow .15s, background .15s`.
- The NOI/Cash flow ResultRows change their top-border color and text color when the computed value crosses its threshold — `transition: color .3s, border-color .3s`.

## State Management

- `stageIndex: number` (0..3) — current stage.
- `phase: 'rest' | 'ready' | 'transition'` — banner state machine. Skip `'engaged'`.
- `rent: number`, `opCosts: number` — Stage 1 editable inputs. NOI/cash-flow derive from these plus the fixed development numbers.
- `transProgress: number` (0..1) — only non-zero during the 1.6s stage swap; drives all crossfade math.

Derived (don't store):
- `stageIndex` flips to next stage at `transProgress > 0.5`.
- `stripStageIndex` flips at `transProgress > 0.6`.
- `bannerState` = `'ready'` while `phase === 'transition'`; otherwise `phase`.

## Design Tokens

```
// Type
ink     #2b2724   body text, current chapter tile bg
body    #4a4642   row labels
muted   #8a847e   subdued copy, $ prefix
faint   #b8b2ab   future-stage tiles, dropdown chevron
rule    #e6e2dc   card borders, separators
card    #ffffff
page    #f8f6f4   phone background
app bg  #f0eee9   outer page background

// Semantic
in      #3f6b8a   blue — inputs / new / primary CTA
inSoft  #dbe4ec
out     #b87351   orange — expenses, negative results
outSoft #efddd1
ok      #4a7a3a   green — positive results, past stages
okSoft  #dde7d2
amber   #b8893a   (defined, unused in final flow)
amberSoft #f1e6cc

// Fonts
Serif:  Cardo 400/700 (headings, card titles, ResultRow label)
Sans:   Inter 400/500/600/700 (everything else)

// Radii
6   chapter tiles, cards, chips
8   banner
5   CTA button
38  phone bezel outer

// Borders
1px rule  card outline
2px in    Finance card (highlighted)
2px ok/out ResultRow top divider
4px inSoft ring  Finance card glow
3px inSoft ring  ChipInput / Chip glow

// Timing
.42s cubic-bezier(.5, 0, .2, 1)   chapter tile expand (flex + padding)
.35s ease (default)               banner background / border / color tween
.30s ease                         ResultRow color flip
.15s ease                         input focus border / shadow / bg
1.6s cubic-bezier(.5, 0, .2, 1)   stage crossfade (full transProgress)
```

## Assets

No external image or icon assets. All glyphs are **Unicode emoji**: 🏢 🏗️ 📈 ▾ ✓ + − = $. In production you may want to replace these with the host app's icon set (the building/chart-up glyphs especially — emoji rendering varies wildly across platforms).

Fonts are loaded from Google Fonts in the prototype; substitute with whatever the host codebase already ships.

## Files

- `Stage transition.html` — the prototype itself. Single self-contained file with all React components, the timeline driver, and the scrubber. Open in any browser. Loops automatically.

The scrubber/timeline UI below the phone is a **prototype-only debugging aid** — do not port it. It exists so a reviewer can scrub to any moment and inspect the frame.
