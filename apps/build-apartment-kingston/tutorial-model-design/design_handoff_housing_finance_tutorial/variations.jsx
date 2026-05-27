// Six visual takes on inflow / outflow / net for the housing finance tutorial.
// Numbers are pinned to the screenshot so the metaphors can be compared head-to-head.

const N = {
  rent: 2400,
  opCosts: 750,
  noi: 1650,
  debt: 1450,
  cashFlow: 200,
};
const fmt = (n) => '$' + Math.round(n).toLocaleString();

// Palette — extends Model1.svelte's existing navy/terracotta with a soft green
// for "result" so the eye gets three distinct semantic colors instead of two.
const C = {
  ink: '#2b2724',
  body: '#4a4642',
  muted: '#8a847e',
  faint: '#b8b2ab',
  rule: '#e6e2dc',
  card: '#ffffff',
  page: '#f8f6f4',
  in: '#3f6b8a',       // navy — inflow
  inSoft: '#dbe4ec',
  out: '#b87351',      // terracotta — outflow
  outSoft: '#efddd1',
  net: '#5d7a3e',      // olive — net / result
  netSoft: '#dde5cf',
};

// ---------- shared bits ----------------------------------------------------

const cardStyle = {
  background: C.card,
  borderRadius: 6,
  border: `1px solid ${C.rule}`,
  padding: '18px 18px 20px',
  fontFamily: 'Inter, sans-serif',
  color: C.ink,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
};

const titleStyle = {
  fontFamily: 'Cardo, serif',
  fontSize: 18,
  fontWeight: 700,
  marginBottom: 4,
};
const subStyle = {
  fontSize: 12,
  color: C.muted,
  marginBottom: 18,
  lineHeight: 1.4,
};

function Frame({ title, sub, children }) {
  return (
    <div style={cardStyle}>
      <div style={titleStyle}>{title}</div>
      <div style={subStyle}>{sub}</div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>{children}</div>
    </div>
  );
}

// =================================================================
// A · Signed math — minimal lift over the current layout
// =================================================================
function VariationA() {
  const row = (label, amt, kind, sign) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '10px 0' }}>
      <span style={{ color: C.body, fontSize: 15 }}>{label}</span>
      <span style={{
        fontSize: 17,
        fontWeight: 600,
        fontVariantNumeric: 'tabular-nums',
        color: kind === 'in' ? C.in : kind === 'out' ? C.out : C.ink,
      }}>
        <span style={{ opacity: 0.7, marginRight: 2 }}>{sign}</span>{fmt(amt)}
      </span>
    </div>
  );
  const result = (label, amt) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '12px 0', borderTop: `1.5px solid ${C.ink}` }}>
      <span style={{ fontFamily: 'Cardo, serif', fontWeight: 700, fontSize: 16 }}>{label}</span>
      <span style={{ fontSize: 19, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
        <span style={{ color: C.muted, marginRight: 4, fontWeight: 400 }}>=</span>{fmt(amt)}
      </span>
    </div>
  );
  return (
    <Frame title="A · Signed math" sub="Add a +/− prefix and tint. Lightest possible lift; reads like a receipt.">
      <div style={{ paddingTop: 4 }}>
        {row('Rent', N.rent, 'in', '+')}
        {row('Operating costs', N.opCosts, 'out', '−')}
        {result('NOI', N.noi)}
        {row('Debt service', N.debt, 'out', '−')}
        {result('Cash flow', N.cashFlow)}
      </div>
    </Frame>
  );
}

// =================================================================
// B · In / Out / Net pills + arrows — role-coded labels on every line
// =================================================================
function VariationB() {
  const Pill = ({ kind }) => {
    const styles = {
      in:  { bg: C.inSoft,  fg: C.in,  text: 'IN',  arrow: '↓' },
      out: { bg: C.outSoft, fg: C.out, text: 'OUT', arrow: '↑' },
      net: { bg: C.netSoft, fg: C.net, text: 'NET', arrow: '=' },
    }[kind];
    return (
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        background: styles.bg, color: styles.fg,
        padding: '3px 8px 3px 6px', borderRadius: 999,
        fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5,
        minWidth: 52, justifyContent: 'center',
      }}>
        <span style={{ fontSize: 13, lineHeight: 1 }}>{styles.arrow}</span>{styles.text}
      </div>
    );
  };
  const Row = ({ kind, label, amount }) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 10, alignItems: 'center', padding: '11px 0' }}>
      <Pill kind={kind} />
      <span style={{ color: C.body, fontSize: 14.5 }}>{label}</span>
      <span style={{
        fontSize: 16, fontWeight: 600, fontVariantNumeric: 'tabular-nums',
        color: kind === 'in' ? C.in : kind === 'out' ? C.out : C.ink,
      }}>{fmt(amount)}</span>
    </div>
  );
  return (
    <Frame title="B · Role pills" sub="Every line announces its role. Color + arrow + text — triple-coded.">
      <Row kind="in"  label="Rent"            amount={N.rent} />
      <Row kind="out" label="Operating costs" amount={N.opCosts} />
      <div style={{ borderTop: `1px dashed ${C.rule}` }} />
      <Row kind="net" label="NOI"             amount={N.noi} />
      <Row kind="out" label="Debt service"    amount={N.debt} />
      <div style={{ borderTop: `1px dashed ${C.rule}` }} />
      <Row kind="net" label="Cash flow"       amount={N.cashFlow} />
    </Frame>
  );
}

// =================================================================
// C · Waterfall chart — classic finance viz
// =================================================================
function VariationC() {
  const max = N.rent;
  const H = 180;
  const h = (v) => (v / max) * H;

  const Col = ({ kind, label, amt, value, baseline = 0 }) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
      <div style={{ fontSize: 10.5, color: kind === 'out' ? C.out : C.ink, fontWeight: 600, marginBottom: 4, fontVariantNumeric: 'tabular-nums' }}>
        {kind === 'out' ? '−' : ''}{fmt(amt)}
      </div>
      <div style={{ height: H, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', position: 'relative' }}>
        {/* spacer for waterfall offset */}
        <div style={{ width: '70%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
          {baseline > 0 && <div style={{ height: h(baseline) }} />}
          <div style={{
            height: h(value),
            background: kind === 'in' ? C.in : kind === 'net' ? C.net : C.out,
            borderRadius: '2px 2px 0 0',
          }} />
        </div>
      </div>
      <div style={{ fontSize: 10.5, color: C.muted, marginTop: 6, textAlign: 'center', lineHeight: 1.2 }}>{label}</div>
    </div>
  );

  return (
    <Frame title="C · Waterfall" sub="Bar height = dollars. Each step subtracts and lands on the next net.">
      <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', marginTop: 8 }}>
        <Col kind="in"  label="Rent"     amt={N.rent}     value={N.rent} />
        <Col kind="out" label="Op costs" amt={N.opCosts}  value={N.opCosts} baseline={N.noi} />
        <Col kind="net" label="NOI"      amt={N.noi}      value={N.noi} />
        <Col kind="out" label="Debt"     amt={N.debt}     value={N.debt} baseline={N.cashFlow} />
        <Col kind="net" label="Cash flow" amt={N.cashFlow} value={N.cashFlow} />
      </div>
      <div style={{ borderTop: `1px solid ${C.rule}`, marginTop: 4 }} />
      <div style={{ display: 'flex', gap: 4, marginTop: 14, fontSize: 10.5, color: C.muted, justifyContent: 'center' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 9, height: 9, background: C.in, borderRadius: 2 }} /> Inflow
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginLeft: 12 }}>
          <span style={{ width: 9, height: 9, background: C.out, borderRadius: 2 }} /> Outflow
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginLeft: 12 }}>
          <span style={{ width: 9, height: 9, background: C.net, borderRadius: 2 }} /> Net
        </span>
      </div>
    </Frame>
  );
}

// =================================================================
// D · Two-stage bucket — water metaphor
// =================================================================
function VariationD() {
  const Bucket = ({ inflow, inflowLabel, outflow, outflowLabel, net, netLabel, max }) => {
    const W = 130, H = 130;
    const fillPct = net / max;
    const drainPct = outflow / max;
    return (
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        {/* Bucket */}
        <div style={{ width: W, position: 'relative', flexShrink: 0 }}>
          {/* faucet/drip */}
          <div style={{ display: 'flex', justifyContent: 'center', height: 28, position: 'relative' }}>
            <div style={{ width: 14, height: 14, background: C.in, borderRadius: '0 0 4px 4px' }} />
            <div style={{ position: 'absolute', top: 14, width: 3, height: 14, background: C.in, opacity: 0.6 }} />
          </div>
          {/* bucket body */}
          <div style={{
            position: 'relative',
            width: W,
            height: H,
            border: `2px solid ${C.ink}`,
            borderTop: 'none',
            borderRadius: '0 0 10px 10px',
            background: '#fbfaf7',
            overflow: 'hidden',
          }}>
            {/* water fill */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              height: `${fillPct * 100}%`,
              background: `linear-gradient(180deg, ${C.in} 0%, #5587a8 100%)`,
              transition: 'height .4s',
            }} />
            {/* surface highlight */}
            <div style={{
              position: 'absolute', left: 0, right: 0,
              bottom: `${fillPct * 100}%`,
              height: 2, background: 'rgba(255,255,255,0.5)',
            }} />
            {/* level label */}
            <div style={{
              position: 'absolute', left: 8, right: 8,
              bottom: `calc(${fillPct * 100}% - 22px)`,
              fontSize: 10, color: '#fff', fontWeight: 700, textAlign: 'center',
              fontVariantNumeric: 'tabular-nums',
            }}>{fmt(net)}</div>
          </div>
          {/* drain spout (right side, drains the difference) */}
          <div style={{
            position: 'absolute', right: -16, top: 28 + H * (1 - drainPct),
            width: 16, height: 8, background: C.out, borderRadius: '0 4px 4px 0',
          }} />
          <div style={{
            position: 'absolute', right: -22, top: 28 + H * (1 - drainPct) + 10,
            width: 4, height: 18, background: C.out, opacity: 0.5,
          }} />
          <div style={{ textAlign: 'center', marginTop: 6, fontSize: 11, fontFamily: 'Cardo, serif', fontWeight: 700 }}>
            {netLabel}
          </div>
        </div>
        {/* annotations */}
        <div style={{ flex: 1, paddingTop: 4, fontSize: 11.5, lineHeight: 1.4 }}>
          <div style={{ color: C.in, fontWeight: 600 }}>↓ {inflowLabel}</div>
          <div style={{ color: C.muted, marginBottom: 12, fontVariantNumeric: 'tabular-nums' }}>+{fmt(inflow)} in</div>
          <div style={{ color: C.out, fontWeight: 600 }}>→ {outflowLabel}</div>
          <div style={{ color: C.muted, fontVariantNumeric: 'tabular-nums' }}>−{fmt(outflow)} out</div>
        </div>
      </div>
    );
  };
  return (
    <Frame title="D · Bucket cascade" sub="Rent fills the first bucket, op costs drain it. NOI overflows into the second; debt drains it. What's left is cash flow.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingTop: 6 }}>
        <Bucket
          inflow={N.rent} inflowLabel="Rent in"
          outflow={N.opCosts} outflowLabel="Op costs out"
          net={N.noi} netLabel="NOI = $1,650"
          max={N.rent}
        />
        <Bucket
          inflow={N.noi} inflowLabel="NOI in"
          outflow={N.debt} outflowLabel="Debt service out"
          net={N.cashFlow} netLabel="Cash flow = $200"
          max={N.noi}
        />
      </div>
    </Frame>
  );
}

// =================================================================
// E · Vertical Sankey — flow through the model
// =================================================================
function VariationE() {
  const W = 280;
  const max = N.rent;
  const w = (v) => (v / max) * W;

  const stem = (value, label, amt, kind) => (
    <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', height: 46 }}>
      <div style={{
        width: w(value),
        background: kind === 'in' ? C.in : C.net,
        position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: 12, fontWeight: 700,
        fontVariantNumeric: 'tabular-nums',
      }}>
        <span>{label} · {fmt(amt)}</span>
      </div>
    </div>
  );

  const branch = (parent, branchAmt, remainingAmt, branchLabel) => {
    const parentW = w(parent);
    const branchW = w(branchAmt);
    const remW = w(remainingAmt);
    return (
      <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', height: 56 }}>
        <svg width={W + 80} height={56} style={{ overflow: 'visible' }}>
          {/* remaining stem (continues straight down, centered) */}
          <path
            d={`M ${(W - parentW)/2 + W*0.04} 0
                L ${(W - parentW)/2 + W*0.04} 56
                L ${(W - parentW)/2 + W*0.04 + remW} 56
                L ${(W - parentW)/2 + W*0.04 + remW} 0 Z`}
            fill={C.net}
            opacity={0.85}
          />
          {/* outflow branch peeling right */}
          <path
            d={`M ${(W - parentW)/2 + W*0.04 + remW} 0
                C ${(W - parentW)/2 + parentW + 20} 18,
                  ${(W - parentW)/2 + parentW + 30} 18,
                  ${(W - parentW)/2 + parentW + 60} 26
                L ${(W - parentW)/2 + parentW + 60} ${26 + Math.max(branchW * 0.6, 6)}
                C ${(W - parentW)/2 + parentW + 30} ${20 + Math.max(branchW * 0.6, 6)},
                  ${(W - parentW)/2 + parentW + 20} ${20 + Math.max(branchW * 0.6, 6)},
                  ${(W - parentW)/2 + W*0.04 + remW + branchW} 0 Z`}
            fill={C.out}
            opacity={0.9}
          />
          <text x={(W - parentW)/2 + parentW + 64} y={32} fontSize="10" fill={C.out} fontWeight="700">−{fmt(branchAmt)}</text>
          <text x={(W - parentW)/2 + parentW + 64} y={44} fontSize="9.5" fill={C.muted}>{branchLabel}</text>
        </svg>
      </div>
    );
  };

  return (
    <Frame title="E · Sankey flow" sub="Rent enters at top. Each outflow peels a slice off the side. Width = dollars.">
      <div style={{ paddingTop: 8 }}>
        {stem(N.rent, 'Rent', N.rent, 'in')}
        {branch(N.rent, N.opCosts, N.noi, 'Op costs')}
        {stem(N.noi, 'NOI', N.noi, 'net')}
        {branch(N.noi, N.debt, N.cashFlow, 'Debt service')}
        {stem(N.cashFlow, 'Cash flow', N.cashFlow, 'net')}
      </div>
    </Frame>
  );
}

// =================================================================
// F · Carve-out bar — "what's left" stacked subtractions
// =================================================================
function VariationF() {
  const total = N.rent;
  const opPct = (N.opCosts / total) * 100;
  const debtPct = (N.debt / total) * 100;
  const cfPct = (N.cashFlow / total) * 100;

  const Bracket = ({ left, width, color, label, amount, top }) => (
    <div style={{
      position: 'absolute', left: `${left}%`, width: `${width}%`,
      top, height: 26,
      borderLeft: `1.5px solid ${color}`, borderRight: `1.5px solid ${color}`,
      borderTop: `1.5px solid ${color}`,
      borderRadius: '4px 4px 0 0',
    }}>
      <div style={{
        position: 'absolute', top: -22, left: '50%', transform: 'translateX(-50%)',
        whiteSpace: 'nowrap', fontSize: 11, fontWeight: 700, color,
        fontVariantNumeric: 'tabular-nums',
      }}>{label} · {fmt(amount)}</div>
    </div>
  );

  return (
    <Frame title="F · Carve-out bar" sub="One bar = total rent. Outflows carve from the left. What's left at each notch is the net.">
      <div style={{ paddingTop: 38, marginTop: 12, position: 'relative' }}>
        {/* Top brackets: NOI spans (debt + cash), Cash flow spans just cash */}
        <Bracket left={opPct} width={100 - opPct} color={C.net} label="NOI" amount={N.noi} top={-6} />

        {/* The bar itself */}
        <div style={{
          display: 'flex', height: 56, borderRadius: 6, overflow: 'hidden',
          border: `1px solid ${C.rule}`,
        }}>
          <div style={{
            width: `${opPct}%`, background: C.out,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 10, fontWeight: 700,
          }}>
            <div>OP</div>
            <div style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(N.opCosts)}</div>
          </div>
          <div style={{
            width: `${debtPct}%`, background: C.outSoft,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            color: C.out, fontSize: 10, fontWeight: 700, borderLeft: `1px solid ${C.card}`,
          }}>
            <div>DEBT</div>
            <div style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(N.debt)}</div>
          </div>
          <div style={{
            width: `${cfPct}%`, background: C.net,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 9.5, fontWeight: 700, borderLeft: `1px solid ${C.card}`,
          }}>
            <div>CF</div>
          </div>
        </div>

        {/* Bottom bracket: Cash flow */}
        <div style={{
          position: 'absolute', left: `${opPct + debtPct}%`, width: `${cfPct}%`,
          bottom: -28, height: 24,
          borderLeft: `1.5px solid ${C.in}`, borderRight: `1.5px solid ${C.in}`,
          borderBottom: `1.5px solid ${C.in}`,
          borderRadius: '0 0 4px 4px',
        }}>
          <div style={{
            position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)',
            whiteSpace: 'nowrap', fontSize: 11, fontWeight: 700, color: C.in,
            fontVariantNumeric: 'tabular-nums',
          }}>Cash flow · {fmt(N.cashFlow)}</div>
        </div>

        {/* Title above the whole bar */}
        <div style={{
          position: 'absolute', top: -38, left: 0, right: 0,
          textAlign: 'center', fontSize: 12, fontWeight: 700, color: C.ink,
          fontVariantNumeric: 'tabular-nums',
        }}>
          Rent · {fmt(N.rent)}
        </div>
      </div>

      <div style={{ marginTop: 80, fontSize: 11.5, color: C.body, lineHeight: 1.55 }}>
        <div style={{ marginBottom: 4 }}><strong style={{ color: C.out }}>Outflows</strong> sit on the left in red.</div>
        <div><strong style={{ color: C.in }}>What's left</strong> after each cut is the net.</div>
      </div>
    </Frame>
  );
}

// expose to the canvas script
Object.assign(window, { VariationA, VariationB, VariationC, VariationD, VariationE, VariationF });
