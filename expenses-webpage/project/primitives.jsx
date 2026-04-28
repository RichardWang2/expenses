// Shared UI primitives.

// ── AnimatedNumber ────────────────────────────────────────────────────────
// Smoothly tweens between values.
function AnimatedNumber({ value, duration = 400, format = (v) => Math.round(v) }) {
  const [display, setDisplay] = React.useState(value);
  const fromRef = React.useRef(value);
  const startRef = React.useRef(performance.now());
  const rafRef = React.useRef(null);
  React.useEffect(() => {
    fromRef.current = display;
    startRef.current = performance.now();
    cancelAnimationFrame(rafRef.current);
    const tick = (t) => {
      const k = Math.min(1, (t - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - k, 3);
      const v = fromRef.current + (value - fromRef.current) * eased;
      setDisplay(v);
      if (k < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);
  return <>{format(display)}</>;
}

// ── Donut ─────────────────────────────────────────────────────────────────
function Donut({ totals, size = 140, thickness = 18, gap = 2, centerLabel, centerSub, animate = true }) {
  const total = totals.reduce((a, b) => a + b.amount, 0) || 1;
  const r = (size - thickness) / 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={thickness} />
      {totals.map((t) => {
        const frac = t.amount / total;
        const len  = Math.max(0, frac * circ - gap);
        const dash = `${len} ${circ - len}`;
        const dashOff = -offset;
        offset += frac * circ;
        return (
          <circle key={t.key} cx={c} cy={c} r={r} fill="none"
            stroke={t.color} strokeWidth={thickness}
            strokeDasharray={dash} strokeDashoffset={dashOff}
            strokeLinecap="butt"
            transform={`rotate(-90 ${c} ${c})`}
            style={animate ? { transition: 'stroke-dasharray 500ms cubic-bezier(0.22,1,0.36,1), stroke-dashoffset 500ms cubic-bezier(0.22,1,0.36,1)' } : null} />
        );
      })}
      {centerLabel != null && (
        <text x={c} y={c - 2} textAnchor="middle" dominantBaseline="middle"
          style={{ font: '500 22px var(--font-display, serif)', fill: 'var(--ink)' }}>
          {centerLabel}
        </text>
      )}
      {centerSub != null && (
        <text x={c} y={c + 18} textAnchor="middle" dominantBaseline="middle"
          style={{ font: '500 9px var(--font-mono, monospace)', letterSpacing: '0.18em', fill: 'var(--ink-soft)' }}>
          {centerSub}
        </text>
      )}
    </svg>
  );
}

// ── Chevron ───────────────────────────────────────────────────────────────
function ChevronBtn({ dir, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: 26, height: 26, border: 'none', background: 'transparent',
      color: 'var(--ink)', cursor: 'pointer', padding: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        {dir === 'left'
          ? <path d="M9 2 L4 7 L9 12" stroke="currentColor" strokeWidth="1.2" />
          : <path d="M5 2 L10 7 L5 12" stroke="currentColor" strokeWidth="1.2" />}
      </svg>
    </button>
  );
}

// ── GearIcon ──────────────────────────────────────────────────────────────
function GearIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
    </svg>
  );
}

// ── SunMoonIcon ──────────────────────────────────────────────────────────
function SunMoonIcon({ size = 18, dark = false }) {
  return dark ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M20 13.5A8 8 0 0 1 10.5 4a7 7 0 1 0 9.5 9.5z" />
    </svg>
  ) : (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </svg>
  );
}

// ── DotsIcon ─────────────────────────────────────────────────────────────
function DotsIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
    </svg>
  );
}

// ── AddExpenseModal ──────────────────────────────────────────────────────
function AddExpenseModal({ open, onClose, onAdd, defaultDay, categories }) {
  const enabledCats = categories.filter(c => c.enabled);
  const [amount, setAmount] = React.useState('');
  const [cat, setCat]       = React.useState(enabledCats[0]?.key || 'food');
  const [label, setLabel]   = React.useState('');
  const [day, setDay]       = React.useState(defaultDay);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (open) {
      setAmount(''); setCat(enabledCats[0]?.key || 'food'); setLabel(''); setDay(defaultDay);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, defaultDay]);

  if (!open) return null;
  const submit = () => {
    const n = parseFloat(amount);
    if (!n || n <= 0) return;
    const catObj = categories.find(c => c.key === cat);
    onAdd({ amount: n, cat, label: label || catObj?.label || 'Expense', day });
    onClose();
  };

  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, background: 'rgba(28,24,18,0.32)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50, backdropFilter: 'blur(4px)',
      animation: 'fadeIn 220ms ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg)', color: 'var(--ink)',
        width: 440, maxWidth: '92%', padding: '32px 36px 28px', borderRadius: 4,
        boxShadow: '0 30px 80px rgba(0,0,0,0.18)',
        border: '1px solid var(--rule)',
        fontFamily: 'var(--font-sans)',
        animation: 'sheetUp 320ms cubic-bezier(0.22,1,0.36,1)',
      }}>
        <div style={{ font: '500 10px var(--font-mono)', letterSpacing: '0.22em', color: 'var(--ink-soft)', marginBottom: 18 }}>
          NEW EXPENSE
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 24, borderBottom: '1px solid var(--rule)', paddingBottom: 14 }}>
          <span style={{ font: '300 36px/1 var(--font-display)', color: 'var(--ink-soft)' }}>$</span>
          <input ref={inputRef} type="number" step="0.01" placeholder="0"
            value={amount} onChange={e => setAmount(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            style={{ flex: 1, font: '400 44px/1 var(--font-display)', color: 'var(--ink)',
              border: 'none', outline: 'none', background: 'transparent', minWidth: 0 }} />
        </div>
        <div style={{ font: '500 10px var(--font-mono)', letterSpacing: '0.18em', color: 'var(--ink-soft)', marginBottom: 10 }}>CATEGORY</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 22 }}>
          {enabledCats.map(c => {
            const active = c.key === cat;
            return (
              <button key={c.key} onClick={() => setCat(c.key)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '7px 12px', borderRadius: 999,
                border: `1px solid ${active ? c.color : 'var(--rule)'}`,
                background: active ? c.color + '22' : 'transparent',
                color: 'var(--ink)', cursor: 'pointer',
                font: '400 13px var(--font-sans)',
                transition: 'all 150ms ease',
              }}>
                <span style={{ width: 8, height: 8, borderRadius: 99, background: c.color }} />
                {c.label}
              </button>
            );
          })}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 12, marginBottom: 24 }}>
          <div>
            <div style={{ font: '500 10px var(--font-mono)', letterSpacing: '0.18em', color: 'var(--ink-soft)', marginBottom: 6 }}>NOTE</div>
            <input value={label} onChange={e => setLabel(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()} placeholder="optional"
              style={{ width: '100%', font: '400 14px var(--font-sans)', color: 'var(--ink)',
                background: 'transparent', border: 'none', borderBottom: '1px solid var(--rule)', padding: '6px 0', outline: 'none' }} />
          </div>
          <div>
            <div style={{ font: '500 10px var(--font-mono)', letterSpacing: '0.18em', color: 'var(--ink-soft)', marginBottom: 6 }}>DAY</div>
            <input type="number" min={1} max={31} value={day} onChange={e => setDay(parseInt(e.target.value) || 1)}
              style={{ width: '100%', font: '400 14px var(--font-sans)', color: 'var(--ink)',
                background: 'transparent', border: 'none', borderBottom: '1px solid var(--rule)', padding: '6px 0', outline: 'none' }} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 14 }}>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--ink-soft)', cursor: 'pointer',
            font: '500 11px var(--font-mono)', letterSpacing: '0.2em', padding: '10px 14px' }}>CANCEL</button>
          <button onClick={submit} style={{ background: 'var(--ink)', color: 'var(--bg)', border: 'none', cursor: 'pointer',
            font: '500 11px var(--font-mono)', letterSpacing: '0.2em', padding: '10px 18px', borderRadius: 2 }}>ADD</button>
        </div>
      </div>
    </div>
  );
}

function AddFab({ onClick, style }) {
  return (
    <button onClick={onClick} style={{
      position: 'absolute', right: 28, bottom: 28, zIndex: 30,
      width: 52, height: 52, borderRadius: '50%',
      background: 'var(--ink)', color: 'var(--bg)', border: 'none', cursor: 'pointer',
      boxShadow: '0 6px 18px rgba(28,24,18,0.22)',
      fontSize: 26, lineHeight: 1, fontWeight: 200, paddingBottom: 4,
      transition: 'transform 200ms ease',
      ...style,
    }}
    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>+</button>
  );
}

Object.assign(window, { AnimatedNumber, Donut, ChevronBtn, GearIcon, SunMoonIcon, DotsIcon, AddExpenseModal, AddFab });
