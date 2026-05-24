// Five input-affordance treatments applied to the signed-math layout.
// Each shows ALL inputs (Total Cost, Equity, Rent, Op costs) plus their
// derived values (Loan needed, NOI, Debt service, Cash flow) so the
// editable/computed contrast is visible.

const IC_C = {
  ink: '#2b2724', body: '#4a4642', muted: '#8a847e', faint: '#b8b2ab',
  rule: '#e6e2dc', card: '#ffffff', page: '#f8f6f4',
  in: '#3f6b8a', inSoft: '#dbe4ec',
  out: '#b87351', outSoft: '#efddd1',
  net: '#5d7a3e',
};
const IC_N = {
  totalCost: 300000, equity: 60000, equityPct: 20, loanNeeded: 240000,
  rent: 2400, opCosts: 750, noi: 1650, debt: 1450, cashFlow: 200,
};
const icFmt = (n) => '$' + Math.round(n).toLocaleString();
const icFmtK = (n) => n >= 1000 ? '$' + Math.round(n / 1000) + 'k' : icFmt(n);

const icCard = {
  background: IC_C.card,
  borderRadius: 6,
  border: `1px solid ${IC_C.rule}`,
  padding: '18px 18px 20px',
  fontFamily: 'Inter, sans-serif',
  color: IC_C.ink,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
};
const icTitle = { fontFamily: 'Cardo, serif', fontSize: 17, fontWeight: 700, marginBottom: 4 };
const icSub = { fontSize: 11.5, color: IC_C.muted, marginBottom: 16, lineHeight: 1.4 };

function ICFrame({ title, sub, children, footnote }) {
  return (
    <div style={icCard}>
      <div style={icTitle}>{title}</div>
      <div style={icSub}>{sub}</div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>{children}</div>
      {footnote && <div style={{ fontSize: 11, color: IC_C.muted, marginTop: 14, lineHeight: 1.45, borderTop: `1px dashed ${IC_C.rule}`, paddingTop: 10 }}>{footnote}</div>}
    </div>
  );
}

// Generic row chrome: label on the left, sign + value on the right.
// `value` is whatever the variation wants to render (chip, plain text, slider, etc).
function ICRow({ label, sign, signColor, value, sublabel, dimmed }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '9px 0', opacity: dimmed ? 0.5 : 1,
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, color: IC_C.body }}>{label}</div>
        {sublabel && <div style={{ fontSize: 10.5, color: IC_C.faint, marginTop: 1 }}>{sublabel}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {sign && <span style={{ color: signColor, fontWeight: 600, fontSize: 14 }}>{sign}</span>}
        {value}
      </div>
    </div>
  );
}

function ICDivider() { return <div style={{ borderTop: `1px solid ${IC_C.rule}`, margin: '4px 0' }} />; }
function ICResultRow({ label, value, sign }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '11px 0', borderTop: `1.5px solid ${IC_C.ink}` }}>
      <span style={{ fontFamily: 'Cardo, serif', fontWeight: 700, fontSize: 15 }}>{label}</span>
      <span style={{ fontSize: 17, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
        <span style={{ color: IC_C.muted, marginRight: 4, fontWeight: 400 }}>{sign || '='}</span>
        {value}
      </span>
    </div>
  );
}

// =================================================================
// IA · Hairline chip
// =================================================================
function VariationIA() {
  const chip = (val, focused) => (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      border: `1px solid ${focused ? IC_C.in : IC_C.faint}`,
      background: focused ? '#fff' : '#fbfaf7',
      padding: '3px 10px', borderRadius: 6,
      fontSize: 15, fontWeight: 600, fontVariantNumeric: 'tabular-nums',
      color: IC_C.ink,
      boxShadow: focused ? `0 0 0 3px ${IC_C.inSoft}` : 'none',
    }}>
      {val}
    </span>
  );
  const computed = (val) => (
    <span style={{ fontSize: 15, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{val}</span>
  );
  return (
    <ICFrame
      title="IA · Hairline chip"
      sub="Editable values sit in a thin-bordered pill with a soft fill. Focused chip lights up navy. Computed values are plain bold text — no chrome, clearly different."
      footnote="Quietest visual lift while still saying ‘tap me.’ Chip subtly differs from the receipt rhythm."
    >
      <ICRow label="Total development cost" value={chip(icFmt(IC_N.totalCost))} />
      <ICRow label="Equity" sublabel={`${IC_N.equityPct}% of total`} value={chip(icFmt(IC_N.equity), true)} />
      <ICRow label="Loan needed" value={computed(icFmt(IC_N.loanNeeded))} />
      <ICDivider />
      <ICRow label="Rent" sign="+" signColor={IC_C.in} value={chip(icFmt(IC_N.rent))} />
      <ICRow label="Operating costs" sign="−" signColor={IC_C.out} value={chip(icFmt(IC_N.opCosts))} />
      <ICResultRow label="NOI" value={icFmt(IC_N.noi)} />
      <ICRow label="Debt service" sign="−" signColor={IC_C.out} value={computed(icFmt(IC_N.debt))} sublabel="6.5% / 35 yr" />
      <ICResultRow label="Cash flow" value={icFmt(IC_N.cashFlow)} />
    </ICFrame>
  );
}

// =================================================================
// IB · Dotted underline (most "prose-like")
// =================================================================
function VariationIB() {
  const editable = (val) => (
    <span style={{
      fontSize: 15, fontWeight: 600, fontVariantNumeric: 'tabular-nums',
      color: IC_C.in,
      borderBottom: `1.5px dashed ${IC_C.in}`,
      paddingBottom: 1,
      cursor: 'text',
    }}>{val}</span>
  );
  const computed = (val) => (
    <span style={{ fontSize: 15, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{val}</span>
  );
  return (
    <ICFrame
      title="IB · Dotted underline"
      sub="Numbers are inline text. Tappable ones get a dashed underline + navy ink, like a hyperlink. Most receipt-like; nothing breaks the prose rhythm."
      footnote="Lightest possible. Risk: looks like a link, may need a one-time hint on first run."
    >
      <ICRow label="Total development cost" value={editable(icFmt(IC_N.totalCost))} />
      <ICRow label="Equity" sublabel={`${IC_N.equityPct}% of total`} value={editable(icFmt(IC_N.equity))} />
      <ICRow label="Loan needed" value={computed(icFmt(IC_N.loanNeeded))} />
      <ICDivider />
      <ICRow label="Rent" sign="+" signColor={IC_C.in} value={editable(icFmt(IC_N.rent))} />
      <ICRow label="Operating costs" sign="−" signColor={IC_C.out} value={editable(icFmt(IC_N.opCosts))} />
      <ICResultRow label="NOI" value={icFmt(IC_N.noi)} />
      <ICRow label="Debt service" sign="−" signColor={IC_C.out} value={computed(icFmt(IC_N.debt))} sublabel="6.5% / 35 yr" />
      <ICResultRow label="Cash flow" value={icFmt(IC_N.cashFlow)} />
    </ICFrame>
  );
}

// =================================================================
// IC · Stepper (− / +)
// =================================================================
function VariationIC() {
  const stepper = (val) => {
    const btn = (label) => (
      <button style={{
        width: 22, height: 22, borderRadius: 4, border: `1px solid ${IC_C.rule}`,
        background: '#fff', color: IC_C.body, fontSize: 13, lineHeight: 1, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
      }}>{label}</button>
    );
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        {btn('−')}
        <span style={{ fontSize: 15, fontWeight: 600, fontVariantNumeric: 'tabular-nums', minWidth: 60, textAlign: 'right' }}>{val}</span>
        {btn('+')}
      </span>
    );
  };
  const computed = (val) => (
    <span style={{ fontSize: 15, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{val}</span>
  );
  return (
    <ICFrame
      title="IC · Stepper"
      sub="Tap − or + to nudge by a sensible step ($10k for cost, $50 for rent). Tap the number to type. Tactile and obvious."
      footnote="Best when users want to nudge, not type. Buttons add visual weight per row."
    >
      <ICRow label="Total cost" value={stepper(icFmt(IC_N.totalCost))} />
      <ICRow label="Equity" sublabel={`${IC_N.equityPct}% of total`} value={stepper(icFmt(IC_N.equity))} />
      <ICRow label="Loan needed" value={computed(icFmt(IC_N.loanNeeded))} />
      <ICDivider />
      <ICRow label="Rent" sign="+" signColor={IC_C.in} value={stepper(icFmt(IC_N.rent))} />
      <ICRow label="Op costs" sign="−" signColor={IC_C.out} value={stepper(icFmt(IC_N.opCosts))} />
      <ICResultRow label="NOI" value={icFmt(IC_N.noi)} />
      <ICRow label="Debt service" sign="−" signColor={IC_C.out} value={computed(icFmt(IC_N.debt))} sublabel="6.5% / 35 yr" />
      <ICResultRow label="Cash flow" value={icFmt(IC_N.cashFlow)} />
    </ICFrame>
  );
}

// =================================================================
// ID · Slider — best for tutorial intuition
// =================================================================
function VariationID() {
  const SliderRow = ({ label, sign, signColor, value, formatted, min, max, sublabel }) => {
    const pct = ((value - min) / (max - min)) * 100;
    return (
      <div style={{ padding: '8px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <span style={{ fontSize: 14, color: IC_C.body }}>{label}</span>
          <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 4 }}>
            {sign && <span style={{ color: signColor, fontWeight: 600, fontSize: 14 }}>{sign}</span>}
            <span style={{ fontSize: 16, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: IC_C.in }}>{formatted}</span>
          </span>
        </div>
        <div style={{ position: 'relative', height: 18 }}>
          {/* track */}
          <div style={{ position: 'absolute', top: 8, left: 0, right: 0, height: 3, background: IC_C.rule, borderRadius: 2 }} />
          {/* fill */}
          <div style={{ position: 'absolute', top: 8, left: 0, width: `${pct}%`, height: 3, background: IC_C.in, borderRadius: 2 }} />
          {/* thumb */}
          <div style={{
            position: 'absolute', top: 2, left: `calc(${pct}% - 8px)`,
            width: 16, height: 16, borderRadius: '50%', background: '#fff',
            border: `2px solid ${IC_C.in}`, boxShadow: '0 1px 3px rgba(0,0,0,.15)',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, color: IC_C.faint, marginTop: 3, fontVariantNumeric: 'tabular-nums' }}>
          <span>{icFmtK(min)}</span>
          <span>{sublabel}</span>
          <span>{icFmtK(max)}</span>
        </div>
      </div>
    );
  };
  const computed = (val) => (
    <span style={{ fontSize: 15, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{val}</span>
  );
  return (
    <ICFrame
      title="ID · Slider"
      sub="Drag to sweep the value. NOI, debt, cash flow update live so you feel the model. Best for teaching: a beginner can wiggle Rent and watch cash flow flip negative."
      footnote="Strongest for intuition-building. Cost: less precise typing; pair with a tap-to-edit number."
    >
      <SliderRow label="Total cost"      formatted={icFmt(IC_N.totalCost)} value={IC_N.totalCost} min={100000} max={1000000} />
      <SliderRow label="Equity"          formatted={icFmt(IC_N.equity)}    value={IC_N.equity}    min={0} max={IC_N.totalCost} sublabel={`${IC_N.equityPct}%`} />
      <ICRow label="Loan needed" value={computed(icFmt(IC_N.loanNeeded))} />
      <ICDivider />
      <SliderRow label="Rent"     sign="+" signColor={IC_C.in}  formatted={icFmt(IC_N.rent)}    value={IC_N.rent}    min={0} max={5000} />
      <SliderRow label="Op costs" sign="−" signColor={IC_C.out} formatted={icFmt(IC_N.opCosts)} value={IC_N.opCosts} min={0} max={2000} />
      <ICResultRow label="NOI" value={icFmt(IC_N.noi)} />
      <ICResultRow label="Cash flow" value={icFmt(IC_N.cashFlow)} />
    </ICFrame>
  );
}

// =================================================================
// IE · Numpad bottom sheet (showing the open state)
// =================================================================
function VariationIE() {
  const valuePill = (val, active) => (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '4px 10px', borderRadius: 6,
      background: active ? IC_C.inSoft : '#fbfaf7',
      border: `1px solid ${active ? IC_C.in : IC_C.faint}`,
      fontSize: 15, fontWeight: 600, fontVariantNumeric: 'tabular-nums',
      color: active ? IC_C.in : IC_C.ink,
    }}>{val}</span>
  );
  const computed = (val) => (
    <span style={{ fontSize: 15, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{val}</span>
  );
  const Key = ({ label, accent }) => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: 38, fontSize: 18, fontWeight: 500,
      background: accent === 'primary' ? IC_C.in : '#fff',
      color: accent === 'primary' ? '#fff' : IC_C.ink,
      borderRadius: 6, border: accent === 'primary' ? 'none' : `1px solid ${IC_C.rule}`,
      fontVariantNumeric: 'tabular-nums',
    }}>{label}</div>
  );
  return (
    <ICFrame
      title="IE · Numpad sheet"
      sub="Tap a value, a numpad rises from the bottom. Single focus, mobile-native. Shown here in its open state, editing Rent."
      footnote="Cleanest for typing on phones. Trade-off: hides part of the model while editing."
    >
      <div style={{ position: 'relative', flex: 1 }}>
        <div style={{ filter: 'opacity(0.55)' }}>
          <ICRow label="Total cost" value={valuePill(icFmt(IC_N.totalCost))} />
          <ICRow label="Equity" sublabel={`${IC_N.equityPct}%`} value={valuePill(icFmt(IC_N.equity))} />
          <ICRow label="Loan needed" value={computed(icFmt(IC_N.loanNeeded))} />
          <ICDivider />
        </div>
        {/* Active row — undimmed */}
        <div style={{ background: '#fbf8f4', margin: '0 -10px', padding: '4px 10px', borderRadius: 6 }}>
          <ICRow label="Rent" sign="+" signColor={IC_C.in} value={valuePill('2,4|', true)} />
        </div>
        <div style={{ filter: 'opacity(0.55)' }}>
          <ICRow label="Op costs" sign="−" signColor={IC_C.out} value={valuePill(icFmt(IC_N.opCosts))} />
        </div>

        {/* Bottom sheet numpad */}
        <div style={{
          position: 'absolute', bottom: -22, left: -18, right: -18,
          background: '#f4f0eb', borderTop: `1px solid ${IC_C.rule}`,
          borderRadius: '12px 12px 0 0',
          padding: '10px 12px 14px',
          boxShadow: '0 -8px 24px rgba(0,0,0,.06)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: IC_C.muted, fontWeight: 600 }}>Editing Rent</span>
            <span style={{ fontSize: 11, color: IC_C.in, fontWeight: 600 }}>Done</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {[1,2,3,4,5,6,7,8,9].map(n => <Key key={n} label={n} />)}
            <Key label="." />
            <Key label="0" />
            <Key label="⌫" accent="primary" />
          </div>
        </div>
      </div>
    </ICFrame>
  );
}

Object.assign(window, { VariationIA, VariationIB, VariationIC, VariationID, VariationIE });
