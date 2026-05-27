// Sufficiency indicators for NOI (>= debt × 1.2) and Cash flow (> 0).
// Applied to the signed-math + hairline-chip layout.
// Each artboard shows BOTH the "sufficient" and "insufficient" states stacked,
// so reviewer can see the contrast at a glance.

const S_C = {
  ink: '#2b2724', body: '#4a4642', muted: '#8a847e', faint: '#b8b2ab',
  rule: '#e6e2dc', card: '#ffffff',
  in: '#3f6b8a', inSoft: '#dbe4ec',
  out: '#b87351', outSoft: '#efddd1',
  ok: '#4a7a3a', okSoft: '#dde7d2', okFaint: '#eef3e6',
  warn: '#b87351', warnSoft: '#efddd1', warnFaint: '#f7ece4',
};
const sFmt = (n) => '$' + Math.round(n).toLocaleString();

// Two scenarios with same inputs so only one row's status changes:
// GOOD: rent 2400, op 750 -> noi 1650; debt 1300 -> needs 1560; cf 350
// BAD:  rent 1800, op 800 -> noi 1000; debt 1450 -> needs 1740; cf -450
const SC = {
  good: { rent: 2400, op: 750,  noi: 1650, debt: 1300, needs: 1560, cf:  350 },
  bad:  { rent: 1800, op: 800,  noi: 1000, debt: 1450, needs: 1740, cf: -450 },
};

const sCard = {
  background: S_C.card,
  borderRadius: 6, border: `1px solid ${S_C.rule}`,
  padding: '16px 16px 18px',
  fontFamily: 'Inter, sans-serif', color: S_C.ink,
  height: '100%', display: 'flex', flexDirection: 'column',
};
const sTitle = { fontFamily: 'Cardo, serif', fontSize: 16, fontWeight: 700, marginBottom: 3 };
const sSub = { fontSize: 11, color: S_C.muted, marginBottom: 12, lineHeight: 1.4 };

function SFrame({ title, sub, children, footnote }) {
  return (
    <div style={sCard}>
      <div style={sTitle}>{title}</div>
      <div style={sSub}>{sub}</div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
      {footnote && <div style={{ fontSize: 10.5, color: S_C.muted, marginTop: 10, lineHeight: 1.45, borderTop: `1px dashed ${S_C.rule}`, paddingTop: 8 }}>{footnote}</div>}
    </div>
  );
}

// shared chip/row helpers
const chip = (val) => (
  <span style={{
    display: 'inline-flex', padding: '2px 8px', borderRadius: 5,
    border: `1px solid ${S_C.faint}`, background: '#fbfaf7',
    fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums',
  }}>{val}</span>
);
const plain = (val, color) => (
  <span style={{ fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: color || S_C.ink }}>{val}</span>
);
function SRow({ label, sign, signColor, value, sublabel }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0' }}>
      <div>
        <div style={{ fontSize: 12.5, color: S_C.body }}>{label}</div>
        {sublabel && <div style={{ fontSize: 10, color: S_C.faint }}>{sublabel}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        {sign && <span style={{ color: signColor, fontWeight: 600, fontSize: 12.5 }}>{sign}</span>}
        {value}
      </div>
    </div>
  );
}

// =================================================================
// S1 · Pill badge alongside the result
// =================================================================
function SBlock1({ scenario }) {
  const ok = scenario.noi >= scenario.needs;
  const cfOk = scenario.cf > 0;
  const Badge = ({ ok, label }) => (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      background: ok ? S_C.okSoft : S_C.warnSoft,
      color: ok ? S_C.ok : S_C.warn,
      fontSize: 9.5, fontWeight: 700, letterSpacing: 0.4,
      padding: '2px 6px', borderRadius: 999, marginRight: 6,
    }}>
      <span style={{ fontSize: 10 }}>{ok ? '✓' : '!'}</span>{label}
    </span>
  );
  const Result = ({ label, value, ok, badgeLabel, color }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '7px 0', borderTop: `1.5px solid ${S_C.ink}` }}>
      <span style={{ fontFamily: 'Cardo, serif', fontWeight: 700, fontSize: 13 }}>{label}</span>
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        <Badge ok={ok} label={badgeLabel} />
        <span style={{ color: S_C.muted, marginRight: 3, fontWeight: 400, fontSize: 12 }}>=</span>
        <span style={{ fontSize: 14.5, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: color || S_C.ink }}>{sFmt(scenario.cf)}</span>
      </span>
    </div>
  );
  return (
    <div style={{ background: '#fbfaf7', borderRadius: 4, padding: '8px 10px' }}>
      <SRow label="Rent" sign="+" signColor={S_C.in} value={chip(sFmt(scenario.rent))} />
      <SRow label="Op costs" sign="−" signColor={S_C.out} value={chip(sFmt(scenario.op))} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '7px 0', borderTop: `1.5px solid ${S_C.ink}` }}>
        <span style={{ fontFamily: 'Cardo, serif', fontWeight: 700, fontSize: 13 }}>NOI</span>
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            background: ok ? S_C.okSoft : S_C.warnSoft,
            color: ok ? S_C.ok : S_C.warn,
            fontSize: 9.5, fontWeight: 700, letterSpacing: 0.4,
            padding: '2px 6px', borderRadius: 999, marginRight: 6,
          }}>
            <span style={{ fontSize: 10 }}>{ok ? '✓' : '!'}</span>{ok ? 'COVERS DEBT' : 'SHORT'}
          </span>
          <span style={{ color: S_C.muted, marginRight: 3, fontWeight: 400, fontSize: 12 }}>=</span>
          <span style={{ fontSize: 14.5, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{sFmt(scenario.noi)}</span>
        </span>
      </div>
      <SRow label="Debt service" sign="−" signColor={S_C.out} value={plain(sFmt(scenario.debt))} sublabel={`needs ${sFmt(scenario.needs)} for 1.2× DSCR`} />
      <Result label="Cash flow" value={scenario.cf} ok={cfOk} badgeLabel={cfOk ? 'POSITIVE' : 'NEGATIVE'} color={cfOk ? S_C.ok : S_C.warn} />
    </div>
  );
}

function VariationS1() {
  return (
    <SFrame
      title="S1 · Pill badges"
      sub="Small status pill rides on the result line. Green ✓ when sufficient, terracotta ! when short. Reads alongside the number, doesn't change the number's color."
      footnote="Pros: explicit, scannable, status word is unambiguous. Cons: another visual element per row; needs careful placement on narrow phones."
    >
      <div style={{ fontSize: 10, color: S_C.muted, fontWeight: 600, letterSpacing: 0.4, marginBottom: 2 }}>SUFFICIENT</div>
      <SBlock1 scenario={SC.good} />
      <div style={{ fontSize: 10, color: S_C.muted, fontWeight: 600, letterSpacing: 0.4, marginTop: 6 }}>INSUFFICIENT</div>
      <SBlock1 scenario={SC.bad} />
    </SFrame>
  );
}

// =================================================================
// S2 · Inked result row — color shifts the divider + value
// =================================================================
function SBlock2({ scenario }) {
  const ok = scenario.noi >= scenario.needs;
  const cfOk = scenario.cf > 0;
  const noiColor = ok ? S_C.ok : S_C.warn;
  const cfColor = cfOk ? S_C.ok : S_C.warn;
  const ResultRow = ({ label, value, color, msg }) => (
    <div style={{ padding: '7px 0', borderTop: `2px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontFamily: 'Cardo, serif', fontWeight: 700, fontSize: 13, color }}>{label}</span>
        <span>
          <span style={{ color: S_C.muted, marginRight: 3, fontWeight: 400, fontSize: 12 }}>=</span>
          <span style={{ fontSize: 14.5, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color }}>{sFmt(value)}</span>
        </span>
      </div>
      {msg && <div style={{ fontSize: 10, color, marginTop: 2, fontStyle: 'italic' }}>{msg}</div>}
    </div>
  );
  return (
    <div style={{ background: '#fbfaf7', borderRadius: 4, padding: '8px 10px' }}>
      <SRow label="Rent" sign="+" signColor={S_C.in} value={chip(sFmt(scenario.rent))} />
      <SRow label="Op costs" sign="−" signColor={S_C.out} value={chip(sFmt(scenario.op))} />
      <ResultRow
        label="NOI" value={scenario.noi} color={noiColor}
        msg={ok ? 'Covers 1.2× debt service' : `Short of ${sFmt(scenario.needs)} needed`}
      />
      <SRow label="Debt service" sign="−" signColor={S_C.out} value={plain(sFmt(scenario.debt))} />
      <ResultRow
        label="Cash flow" value={scenario.cf} color={cfColor}
        msg={cfOk ? 'Money left over' : 'Operating at a loss'}
      />
    </div>
  );
}

function VariationS2() {
  return (
    <SFrame
      title="S2 · Inked result row"
      sub="The result row's top-border, label and value all shift color. A short italic message under the value explains the verdict in plain language."
      footnote="Pros: minimal new chrome, the existing result row just *becomes* the indicator. Cons: relies on color; bring the message to carry meaning for colorblind users."
    >
      <div style={{ fontSize: 10, color: S_C.muted, fontWeight: 600, letterSpacing: 0.4, marginBottom: 2 }}>SUFFICIENT</div>
      <SBlock2 scenario={SC.good} />
      <div style={{ fontSize: 10, color: S_C.muted, fontWeight: 600, letterSpacing: 0.4, marginTop: 6 }}>INSUFFICIENT</div>
      <SBlock2 scenario={SC.bad} />
    </SFrame>
  );
}

// =================================================================
// S3 · Threshold meter — show value vs requirement
// =================================================================
function SBlock3({ scenario }) {
  const ok = scenario.noi >= scenario.needs;
  const cfOk = scenario.cf > 0;
  // NOI meter scale: 0 to max(noi, needs) * 1.3
  const noiMax = Math.max(scenario.noi, scenario.needs) * 1.3;
  const noiPct = (scenario.noi / noiMax) * 100;
  const needsPct = (scenario.needs / noiMax) * 100;
  // CF meter scale: -max to +max centered on 0
  const cfRange = Math.max(Math.abs(scenario.cf), 600) * 1.2;
  const cfZero = 50;
  const cfPos = 50 + (scenario.cf / (cfRange * 2)) * 100;

  return (
    <div style={{ background: '#fbfaf7', borderRadius: 4, padding: '8px 10px' }}>
      <SRow label="Rent" sign="+" signColor={S_C.in} value={chip(sFmt(scenario.rent))} />
      <SRow label="Op costs" sign="−" signColor={S_C.out} value={chip(sFmt(scenario.op))} />
      <div style={{ padding: '7px 0', borderTop: `1.5px solid ${S_C.ink}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <span style={{ fontFamily: 'Cardo, serif', fontWeight: 700, fontSize: 13 }}>NOI</span>
          <span>
            <span style={{ color: S_C.muted, marginRight: 3, fontWeight: 400, fontSize: 12 }}>=</span>
            <span style={{ fontSize: 14.5, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: ok ? S_C.ok : S_C.warn }}>{sFmt(scenario.noi)}</span>
          </span>
        </div>
        {/* meter */}
        <div style={{ position: 'relative', height: 8, background: S_C.rule, borderRadius: 4, overflow: 'visible' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, height: 8, width: `${noiPct}%`, background: ok ? S_C.ok : S_C.warn, borderRadius: 4 }} />
          {/* threshold marker */}
          <div style={{ position: 'absolute', left: `${needsPct}%`, top: -3, width: 2, height: 14, background: S_C.ink }} />
          <div style={{ position: 'absolute', left: `${needsPct}%`, top: 14, transform: 'translateX(-50%)', fontSize: 9, color: S_C.muted, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
            ↑ needs {sFmt(scenario.needs)}
          </div>
        </div>
        <div style={{ height: 14 }} />
      </div>
      <SRow label="Debt service" sign="−" signColor={S_C.out} value={plain(sFmt(scenario.debt))} />
      <div style={{ padding: '7px 0', borderTop: `1.5px solid ${S_C.ink}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <span style={{ fontFamily: 'Cardo, serif', fontWeight: 700, fontSize: 13 }}>Cash flow</span>
          <span>
            <span style={{ color: S_C.muted, marginRight: 3, fontWeight: 400, fontSize: 12 }}>=</span>
            <span style={{ fontSize: 14.5, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: cfOk ? S_C.ok : S_C.warn }}>{sFmt(scenario.cf)}</span>
          </span>
        </div>
        {/* signed meter centered on 0 */}
        <div style={{ position: 'relative', height: 8, background: S_C.rule, borderRadius: 4 }}>
          {/* zero line */}
          <div style={{ position: 'absolute', left: `${cfZero}%`, top: -3, width: 2, height: 14, background: S_C.ink }} />
          {/* bar from 0 to value */}
          {scenario.cf >= 0 ? (
            <div style={{ position: 'absolute', left: `${cfZero}%`, top: 0, height: 8, width: `${cfPos - cfZero}%`, background: S_C.ok, borderRadius: '0 4px 4px 0' }} />
          ) : (
            <div style={{ position: 'absolute', left: `${cfPos}%`, top: 0, height: 8, width: `${cfZero - cfPos}%`, background: S_C.warn, borderRadius: '4px 0 0 4px' }} />
          )}
          <div style={{ position: 'absolute', left: `${cfZero}%`, top: 14, transform: 'translateX(-50%)', fontSize: 9, color: S_C.muted, whiteSpace: 'nowrap' }}>↑ zero</div>
        </div>
        <div style={{ height: 14 }} />
      </div>
    </div>
  );
}

function VariationS3() {
  return (
    <SFrame
      title="S3 · Threshold meter"
      sub="A tiny bar under each result shows where you are versus the threshold. NOI has a marker at ‘needs $X’; cash flow is centered on zero with bar going +/−."
      footnote="Pros: best for tutorial intuition — you SEE the gap. Cons: adds vertical space; the second meter has a different scale than the first."
    >
      <div style={{ fontSize: 10, color: S_C.muted, fontWeight: 600, letterSpacing: 0.4, marginBottom: 2 }}>SUFFICIENT</div>
      <SBlock3 scenario={SC.good} />
      <div style={{ fontSize: 10, color: S_C.muted, fontWeight: 600, letterSpacing: 0.4, marginTop: 6 }}>INSUFFICIENT</div>
      <SBlock3 scenario={SC.bad} />
    </SFrame>
  );
}

// =================================================================
// S4 · Margin-gutter glyph — quiet left margin status
// =================================================================
function SBlock4({ scenario }) {
  const ok = scenario.noi >= scenario.needs;
  const cfOk = scenario.cf > 0;
  const Glyph = ({ ok }) => (
    <div style={{
      position: 'absolute', left: -16, top: '50%', transform: 'translateY(-50%)',
      width: 14, height: 14, borderRadius: '50%',
      background: ok ? S_C.ok : S_C.warn, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 9, fontWeight: 700,
    }}>{ok ? '✓' : '!'}</div>
  );
  const ResultRow = ({ label, value, ok, hint }) => (
    <div style={{ position: 'relative', padding: '7px 0', borderTop: `1.5px solid ${S_C.ink}` }}>
      <Glyph ok={ok} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontFamily: 'Cardo, serif', fontWeight: 700, fontSize: 13 }}>{label}</span>
        <span>
          <span style={{ color: S_C.muted, marginRight: 3, fontWeight: 400, fontSize: 12 }}>=</span>
          <span style={{ fontSize: 14.5, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{sFmt(value)}</span>
        </span>
      </div>
      {hint && <div style={{ fontSize: 10, color: S_C.muted, marginTop: 2 }}>{hint}</div>}
    </div>
  );
  return (
    <div style={{ background: '#fbfaf7', borderRadius: 4, padding: '8px 10px 8px 24px' }}>
      <SRow label="Rent" sign="+" signColor={S_C.in} value={chip(sFmt(scenario.rent))} />
      <SRow label="Op costs" sign="−" signColor={S_C.out} value={chip(sFmt(scenario.op))} />
      <ResultRow label="NOI" value={scenario.noi} ok={ok} hint={ok ? 'covers debt at 1.2× DSCR' : `needs ${sFmt(scenario.needs)}`} />
      <SRow label="Debt service" sign="−" signColor={S_C.out} value={plain(sFmt(scenario.debt))} />
      <ResultRow label="Cash flow" value={scenario.cf} ok={cfOk} />
    </div>
  );
}

function VariationS4() {
  return (
    <SFrame
      title="S4 · Margin glyph"
      sub="A small colored ✓ or ! sits in the left gutter against each result row. Numbers stay ink-black; status is purely marginal."
      footnote="Pros: quietest of the lot, lets the numbers stay calm. Cons: glyph competes for attention with the result label; less explicit than a badge."
    >
      <div style={{ fontSize: 10, color: S_C.muted, fontWeight: 600, letterSpacing: 0.4, marginBottom: 2 }}>SUFFICIENT</div>
      <SBlock4 scenario={SC.good} />
      <div style={{ fontSize: 10, color: S_C.muted, fontWeight: 600, letterSpacing: 0.4, marginTop: 6 }}>INSUFFICIENT</div>
      <SBlock4 scenario={SC.bad} />
    </SFrame>
  );
}

// =================================================================
// S5 · Verdict footer — sentence beneath each result
// =================================================================
function SBlock5({ scenario }) {
  const ok = scenario.noi >= scenario.needs;
  const cfOk = scenario.cf > 0;
  const Verdict = ({ ok, children }) => (
    <div style={{
      fontSize: 11, marginTop: 4, padding: '5px 8px',
      background: ok ? S_C.okFaint : S_C.warnFaint,
      borderLeft: `2px solid ${ok ? S_C.ok : S_C.warn}`,
      color: ok ? S_C.ok : S_C.warn,
      borderRadius: '0 4px 4px 0', lineHeight: 1.35,
    }}>{children}</div>
  );
  const ResultRow = ({ label, value, ok, msg }) => (
    <div style={{ padding: '7px 0', borderTop: `1.5px solid ${S_C.ink}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontFamily: 'Cardo, serif', fontWeight: 700, fontSize: 13 }}>{label}</span>
        <span>
          <span style={{ color: S_C.muted, marginRight: 3, fontWeight: 400, fontSize: 12 }}>=</span>
          <span style={{ fontSize: 14.5, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{sFmt(value)}</span>
        </span>
      </div>
      <Verdict ok={ok}>
        <strong>{ok ? '✓ ' : '! '}</strong>{msg}
      </Verdict>
    </div>
  );
  return (
    <div style={{ background: '#fbfaf7', borderRadius: 4, padding: '8px 10px' }}>
      <SRow label="Rent" sign="+" signColor={S_C.in} value={chip(sFmt(scenario.rent))} />
      <SRow label="Op costs" sign="−" signColor={S_C.out} value={chip(sFmt(scenario.op))} />
      <ResultRow
        label="NOI" value={scenario.noi} ok={ok}
        msg={ok
          ? `Covers debt service with room to spare (need ${sFmt(scenario.needs)} at 1.2× DSCR).`
          : `Short by ${sFmt(scenario.needs - scenario.noi)} — bank needs ${sFmt(scenario.needs)} for this loan.`}
      />
      <SRow label="Debt service" sign="−" signColor={S_C.out} value={plain(sFmt(scenario.debt))} />
      <ResultRow
        label="Cash flow" value={scenario.cf} ok={cfOk}
        msg={cfOk
          ? `${sFmt(scenario.cf)}/month left over for reserves, distributions, or upside.`
          : `Losing ${sFmt(Math.abs(scenario.cf))}/month — you'd need to feed the deal.`}
      />
    </div>
  );
}

function VariationS5() {
  return (
    <SFrame
      title="S5 · Verdict footer"
      sub="A full sentence sits under each result, explaining what the number means and (when short) the exact gap. Teaches as it judges."
      footnote="Pros: best teaching value — explains why, not just whether. Cons: heaviest in vertical space; the page no longer reads like a quick receipt."
    >
      <div style={{ fontSize: 10, color: S_C.muted, fontWeight: 600, letterSpacing: 0.4, marginBottom: 2 }}>SUFFICIENT</div>
      <SBlock5 scenario={SC.good} />
      <div style={{ fontSize: 10, color: S_C.muted, fontWeight: 600, letterSpacing: 0.4, marginTop: 6 }}>INSUFFICIENT</div>
      <SBlock5 scenario={SC.bad} />
    </SFrame>
  );
}

Object.assign(window, { VariationS1, VariationS2, VariationS3, VariationS4, VariationS5 });
