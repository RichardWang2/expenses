// Add-expense system — separate trigger placement from popover style.
//
// Triggers (where the button lives):
//   "header"  — Pill button in the top-left header strip beside the month label
//   "daycard" — The day's $amount is the trigger; subtle "+ ADD" hint when empty
//   "toolbar" — Sticky thin toolbar at the top of the page; CTA aligned right
//
// Popover styles (how the form opens):
//   "anchored" — drops from the trigger
//   "modal"    — centered with backdrop
//   "side"     — slide-in panel from the right
//
// One shared <AddPopover/> handles fields. AddTrigger components emit clicks
// with their bounding rect so the anchored popover can position correctly.

const ADD_TRIGGERS = [
  { key: 'floating', label: 'Floating bottom pill', sub: 'Centered, bottom of screen — thumb-reachable' },
  { key: 'header',   label: 'Header CTA',           sub: 'Pill beside the month label' },
  { key: 'daycard',  label: 'Day-card add',         sub: 'The $ amount IS the trigger' },
  { key: 'toolbar',  label: 'Sticky toolbar',       sub: 'Thin top bar, action right-aligned' },
];

const AddCfgCtx = React.createContext({ trigger: 'floating' });

// ── State hook the dashboards share ──────────────────────────────────
// Returns { open, anchorRect, openAt(rect), close, ghostId, setGhostId }.
// ghostId is used for the entrance animation on a freshly-logged row.
function useAddState() {
  const [state, setState] = React.useState({ open: false, anchorRect: null });
  const [ghostId, setGhostId] = React.useState(null);
  const openAt = (rect) => setState({ open: true, anchorRect: rect || null });
  const close  = () => setState({ open: false, anchorRect: null });
  return { ...state, openAt, close, ghostId, setGhostId };
}

// ── Triggers ─────────────────────────────────────────────────────────
// FloatingTrigger: centered pill at the bottom of the artboard.
// position: sticky keeps it pinned to the bottom of the dashboard while scrolling.
function FloatingTrigger({ onOpen, mobile }) {
  return (
    <div style={{
      position: 'sticky', bottom: 0, left: 0, right: 0,
      display: 'flex', justifyContent: 'center',
      pointerEvents: 'none', zIndex: 40,
      marginTop: mobile ? -72 : -90,
      paddingBottom: mobile ? 18 : 26,
      paddingTop: mobile ? 32 : 44,
      backgroundImage: 'linear-gradient(to bottom, transparent 0%, var(--bg) 65%)',
    }}>
      <button onClick={(e) => onOpen(e.currentTarget.getBoundingClientRect())}
        style={{
          pointerEvents: 'auto',
          display: 'inline-flex', alignItems: 'center', gap: 10,
          background: 'var(--ink)', color: 'var(--bg)', cursor: 'pointer',
          border: '1px solid var(--ink)',
          font: `500 ${mobile ? 10 : 11}px var(--font-mono)`, letterSpacing: '0.24em',
          padding: mobile ? '12px 22px' : '14px 28px', borderRadius: 999,
          boxShadow: '0 12px 32px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.12)',
          transition: 'transform 200ms cubic-bezier(0.22,1,0.36,1), box-shadow 200ms ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 18px 40px rgba(0,0,0,0.28), 0 2px 6px rgba(0,0,0,0.14)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.12)';
        }}>
        <span style={{ fontSize: mobile ? 16 : 18, lineHeight: 1, fontWeight: 300, marginTop: -1 }}>+</span>
        LOG EXPENSE
      </button>
    </div>
  );
}

function HeaderTrigger({ onOpen, mobile }) {
  const ref = React.useRef(null);
  return (
    <button ref={ref} onClick={() => onOpen(ref.current?.getBoundingClientRect())}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: 'var(--ink)', color: 'var(--bg)', cursor: 'pointer',
        border: '1px solid var(--ink)',
        font: `500 ${mobile ? 9 : 10}px var(--font-mono)`, letterSpacing: '0.22em',
        padding: mobile ? '7px 12px' : '9px 16px', borderRadius: 999,
        boxShadow: '0 2px 0 rgba(0,0,0,0.08)',
        transition: 'transform 150ms ease',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
      <span style={{ fontSize: mobile ? 13 : 15, lineHeight: 1, fontWeight: 300 }}>+</span>
      LOG EXPENSE
    </button>
  );
}

function ToolbarStrip({ monthName, year, onPrev, onNext, onToday, onSettings, onDark, isDark, isToday, onOpen, mobile }) {
  const ref = React.useRef(null);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: mobile ? '10px 16px' : '14px 24px',
      borderBottom: '1px solid var(--rule)',
      background: 'var(--bg)',
      marginInline: mobile ? -22 : -60,
      marginTop: mobile ? -38 : -52,
      marginBottom: mobile ? 22 : 30,
      position: 'sticky', top: 0, zIndex: 5,
    }}>
      <div style={{ font: '500 10px var(--font-mono)', letterSpacing: '0.24em', color: 'var(--ink-soft)' }}>
        {monthName.slice(0,3).toUpperCase()} · {year}
      </div>
      <div style={{ display: 'flex', gap: 6, marginLeft: 4 }}>
        <ChevronBtn dir="left" onClick={onPrev} />
        <ChevronBtn dir="right" onClick={onNext} />
      </div>
      {!isToday && (
        <button onClick={onToday} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'transparent', border: '1px solid var(--rule)',
          color: 'var(--ink)', cursor: 'pointer',
          font: '500 9px var(--font-mono)', letterSpacing: '0.2em',
          padding: '5px 9px', borderRadius: 999,
        }}>
          <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: 99,
            background: '#9b3c3c', animation: 'pulseDot 1.6s ease-in-out infinite' }} />
          TODAY
        </button>
      )}
      <div style={{ flex: 1 }} />
      <button onClick={onDark} style={{ background: 'transparent', border: 'none',
        color: 'var(--ink)', cursor: 'pointer', padding: 4 }} title={isDark ? 'Light' : 'Dark'}>
        <SunMoonIcon size={16} dark={isDark} />
      </button>
      <button onClick={onSettings} style={{ background: 'transparent', border: 'none',
        color: 'var(--ink)', cursor: 'pointer', padding: 4 }} title="Settings">
        <DotsIcon size={16} />
      </button>
      <button ref={ref} onClick={() => onOpen(ref.current?.getBoundingClientRect())}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--ink)', color: 'var(--bg)', cursor: 'pointer',
          border: '1px solid var(--ink)',
          font: '500 10px var(--font-mono)', letterSpacing: '0.22em',
          padding: '8px 14px', borderRadius: 999,
        }}>
        <span style={{ fontSize: 14, lineHeight: 1, fontWeight: 300 }}>+</span>
        LOG EXPENSE
      </button>
    </div>
  );
}

// Day-card trigger renders inline inside the day amount block.
function DayCardTrigger({ amount, isClosed, onOpen, mobile }) {
  const ref = React.useRef(null);
  const empty = amount === 0 && !isClosed;
  if (isClosed) {
    return (
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4,
        font: `300 ${mobile ? 48 : 96}px/0.9 var(--font-display)`,
        color: 'var(--ink-soft)', textDecoration: 'line-through' }}>
        <span style={{ fontSize: '0.32em', marginTop: '0.18em' }}>$</span>
        <span style={{ letterSpacing: '-0.04em' }}><AnimatedNumber value={amount} /></span>
      </div>
    );
  }
  return (
    <button ref={ref} onClick={() => onOpen(ref.current?.getBoundingClientRect())}
      style={{
        display: 'inline-flex', alignItems: 'baseline', gap: 6,
        background: 'transparent', border: 'none', cursor: 'pointer',
        color: 'var(--ink)', padding: 0,
        textAlign: 'left', position: 'relative',
      }}
      title="Log an expense for this day"
      onMouseEnter={e => {
        const hint = e.currentTarget.querySelector('.daycard-hint');
        if (hint) hint.style.opacity = 1;
      }}
      onMouseLeave={e => {
        const hint = e.currentTarget.querySelector('.daycard-hint');
        if (hint) hint.style.opacity = empty ? 1 : 0.55;
      }}>
      <span style={{ display: 'flex', alignItems: 'flex-start', gap: 4,
        font: `300 ${mobile ? 48 : 96}px/0.9 var(--font-display)`,
        color: 'var(--ink)' }}>
        <span style={{ fontSize: '0.32em', marginTop: '0.18em', color: 'var(--ink-soft)' }}>$</span>
        <span style={{ letterSpacing: '-0.04em' }}><AnimatedNumber value={amount} /></span>
      </span>
      <span className="daycard-hint" style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: mobile ? '5px 9px' : '8px 14px', borderRadius: 999,
        background: empty ? 'var(--ink)' : 'transparent',
        color: empty ? 'var(--bg)' : 'var(--ink)',
        border: empty ? '1px solid var(--ink)' : '1px solid var(--ink)',
        font: `500 ${mobile ? 9 : 10}px var(--font-mono)`, letterSpacing: '0.22em',
        opacity: empty ? 1 : 0.55,
        transition: 'opacity 180ms ease, background 180ms ease, color 180ms ease',
        marginBottom: mobile ? 6 : 14, alignSelf: 'flex-end',
      }}>
        <span style={{ fontSize: mobile ? 12 : 14, lineHeight: 1, fontWeight: 300 }}>+</span>
        {empty ? 'LOG' : 'ADD'}
      </span>
    </button>
  );
}

// ── Popover ───────────────────────────────────────────────────────────
// Single style: centered modal with backdrop (bottom-sheet on mobile).
function AddPopover({ open, onClose, onAdd, defaultDay, categories, recents, mobile }) {
  if (!open) return null;
  const enabledCats = categories.filter(c => c.enabled);
  return (
    <ModalShell onClose={onClose} mobile={mobile}>
      <PopoverForm enabledCats={enabledCats} categories={categories}
        defaultDay={defaultDay} recents={recents}
        onAdd={onAdd} onClose={onClose} mobile={mobile} />
    </ModalShell>
  );
}

function ModalShell({ onClose, children, mobile }) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 80,
      background: 'rgba(28,24,18,0.32)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: mobile ? 'flex-end' : 'center', justifyContent: 'center',
      animation: 'fadeIn 200ms ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg)', color: 'var(--ink)',
        width: mobile ? '100%' : 480, maxWidth: '94%',
        borderRadius: mobile ? '12px 12px 0 0' : 4,
        border: '1px solid var(--rule)', borderBottom: mobile ? 'none' : undefined,
        boxShadow: '0 30px 80px rgba(0,0,0,0.18)',
        animation: 'sheetUp 320ms cubic-bezier(0.22,1,0.36,1)',
        fontFamily: 'var(--font-sans)',
      }}>
        {children}
      </div>
    </div>
  );
}

function SideShell({ onClose, children, mobile }) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 80,
      background: 'rgba(28,24,18,0.20)',
      animation: 'fadeIn 200ms ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        position: 'absolute', top: 0, right: 0, bottom: 0,
        width: mobile ? '90%' : 420,
        background: 'var(--bg)', color: 'var(--ink)',
        borderLeft: '1px solid var(--rule)',
        boxShadow: '-12px 0 40px rgba(0,0,0,0.15)',
        animation: 'slideInRight 320ms cubic-bezier(0.22,1,0.36,1)',
        overflowY: 'auto', fontFamily: 'var(--font-sans)',
      }}>
        {children}
      </div>
    </div>
  );
}

function AnchoredShell({ onClose, anchorRect, children, mobile }) {
  // Position below + slightly left of the trigger; clamp within viewport.
  const pop = { width: mobile ? Math.min(window.innerWidth - 16, 340) : 420 };
  let top  = anchorRect ? anchorRect.bottom + 8 : 80;
  let left = anchorRect ? anchorRect.left : 24;
  if (left + pop.width > window.innerWidth - 8) {
    left = Math.max(8, window.innerWidth - pop.width - 8);
  }
  // If too low, pop above instead
  const popHeight = 380;
  if (top + popHeight > window.innerHeight - 8 && anchorRect) {
    top = Math.max(8, anchorRect.top - popHeight - 8);
  }
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 80 }}>
      <div onClick={e => e.stopPropagation()} style={{
        position: 'absolute', top, left, width: pop.width,
        background: 'var(--bg)', color: 'var(--ink)',
        border: '1px solid var(--ink)', borderRadius: 4,
        boxShadow: '0 20px 50px rgba(0,0,0,0.22)',
        animation: 'sheetUp 240ms cubic-bezier(0.22,1,0.36,1)',
        fontFamily: 'var(--font-sans)',
      }}>
        {children}
      </div>
    </div>
  );
}

// ── Form (shared across all shells) ──────────────────────────────────
function PopoverForm({ enabledCats, categories, defaultDay, recents, onAdd, onClose, mobile }) {
  const [amount, setAmount] = React.useState('');
  const [cat, setCat]       = React.useState(enabledCats[0]?.key);
  const [label, setLabel]   = React.useState('');
  const [day, setDay]       = React.useState(defaultDay);
  const inputRef = React.useRef(null);

  React.useEffect(() => { setTimeout(() => inputRef.current?.focus(), 40); }, []);
  const ready = parseFloat(amount) > 0;

  const submit = () => {
    if (!ready) return;
    const c = categories.find(x => x.key === cat);
    onAdd({ amount: parseFloat(amount), cat, label: label.trim() || c?.label || 'Expense', day });
    onClose();
  };

  const fillFromRecent = (r) => {
    setAmount(String(r.amount));
    setCat(r.cat);
    setLabel(r.label);
  };

  return (
    <div style={{ padding: mobile ? '20px 18px 16px' : '24px 26px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ font: '500 10px var(--font-mono)', letterSpacing: '0.22em', color: 'var(--ink-soft)' }}>
          NEW EXPENSE
        </div>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none',
          color: 'var(--ink-soft)', cursor: 'pointer',
          font: '500 10px var(--font-mono)', letterSpacing: '0.2em', padding: 0 }}>ESC</button>
      </div>

      {/* Amount */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 16,
        paddingBottom: 12, borderBottom: '1px solid var(--rule)' }}>
        <span style={{ font: '300 32px/1 var(--font-display)', color: 'var(--ink-soft)' }}>$</span>
        <input ref={inputRef} type="number" inputMode="decimal" step="0.01" placeholder="0"
          value={amount} onChange={e => setAmount(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onClose(); }}
          style={{ flex: 1, font: '400 38px/1 var(--font-display)', color: 'var(--ink)',
            background: 'transparent', border: 'none', outline: 'none', minWidth: 0 }} />
      </div>

      {/* Recent suggestions */}
      {recents && recents.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ font: '500 9px var(--font-mono)', letterSpacing: '0.22em', color: 'var(--ink-soft)', marginBottom: 8 }}>
            QUICK REPEAT
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {recents.slice(0, 3).map((r, i) => {
              const c = categories.find(x => x.key === r.cat);
              return (
                <button key={i} onClick={() => fillFromRecent(r)} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '5px 9px', borderRadius: 999,
                  border: '1px solid var(--rule)', background: 'transparent',
                  color: 'var(--ink)', cursor: 'pointer',
                  font: '400 12px var(--font-sans)',
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: 99, background: c?.color }} />
                  ${r.amount} · {r.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Category */}
      <div style={{ font: '500 9px var(--font-mono)', letterSpacing: '0.22em', color: 'var(--ink-soft)', marginBottom: 8 }}>
        CATEGORY
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 16 }}>
        {enabledCats.map(c => {
          const active = c.key === cat;
          return (
            <button key={c.key} onClick={() => setCat(c.key)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 10px', borderRadius: 999,
              border: `1px solid ${active ? c.color : 'var(--rule)'}`,
              background: active ? c.color + '22' : 'transparent',
              color: 'var(--ink)', cursor: 'pointer',
              font: '400 12px var(--font-sans)',
              transition: 'all 150ms ease',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: c.color }} />
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Note + day */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px', gap: 12, marginBottom: 18 }}>
        <div>
          <div style={{ font: '500 9px var(--font-mono)', letterSpacing: '0.22em', color: 'var(--ink-soft)', marginBottom: 4 }}>NOTE</div>
          <input value={label} onChange={e => setLabel(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onClose(); }}
            placeholder="optional"
            style={{ width: '100%', font: '400 14px var(--font-sans)', color: 'var(--ink)',
              background: 'transparent', border: 'none', borderBottom: '1px solid var(--rule)',
              padding: '6px 0', outline: 'none' }} />
        </div>
        <div>
          <div style={{ font: '500 9px var(--font-mono)', letterSpacing: '0.22em', color: 'var(--ink-soft)', marginBottom: 4 }}>DAY</div>
          <input type="number" min={1} max={31} value={day}
            onChange={e => setDay(parseInt(e.target.value) || 1)}
            style={{ width: '100%', font: '400 14px var(--font-sans)', color: 'var(--ink)',
              background: 'transparent', border: 'none', borderBottom: '1px solid var(--rule)',
              padding: '6px 0', outline: 'none' }} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none',
          color: 'var(--ink-soft)', cursor: 'pointer',
          font: '500 10px var(--font-mono)', letterSpacing: '0.22em', padding: '8px 12px' }}>
          CANCEL
        </button>
        <button onClick={submit} disabled={!ready} style={{
          background: ready ? 'var(--ink)' : 'transparent',
          color: ready ? 'var(--bg)' : 'var(--ink-soft)',
          border: `1px solid ${ready ? 'var(--ink)' : 'var(--rule)'}`,
          cursor: ready ? 'pointer' : 'default',
          font: '500 10px var(--font-mono)', letterSpacing: '0.22em',
          padding: '9px 16px', borderRadius: 999,
        }}>
          LOG ↵
        </button>
      </div>
    </div>
  );
}

Object.assign(window, {
  ADD_TRIGGERS, AddCfgCtx, useAddState,
  FloatingTrigger, HeaderTrigger, ToolbarStrip, DayCardTrigger,
  AddPopover, PopoverForm,
});
