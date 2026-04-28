// Mobile dashboard variant — single column, 375 wide.

function DashboardMobile({ width, height, s, d, dispatch,
  addState, addCfg, editingId, setEditingId,
  cells, selDayExp, selDayTotal, recents, dayLabel, isClosed,
  addExp, updateExp, deleteExp, toggleClosed }) {

  const triggerMode = addCfg.trigger;
  const showCatBudgets = s.budgetsEnabled;

  return (
    <div style={{
      width, minHeight: height, background: 'var(--bg)', color: 'var(--ink)',
      fontFamily: 'var(--font-sans)', position: 'relative',
      padding: triggerMode === 'toolbar' ? '0 22px 24px' : '38px 22px 24px',
      boxSizing: 'border-box',
      animation: 'fadeIn 320ms ease',
    }}>
      {triggerMode === 'toolbar' && (
        <ToolbarStrip mobile
          monthName={MONTH_NAMES[s.month]} year={s.year}
          onPrev={() => dispatch({ type: 'PREV_MONTH' })}
          onNext={() => dispatch({ type: 'NEXT_MONTH' })}
          onToday={() => dispatch({ type: 'GO_TODAY' })}
          onSettings={() => dispatch({ type: 'SET_ROUTE', route: 'settings' })}
          onDark={() => dispatch({ type: 'TOGGLE_DARK' })}
          isDark={s.darkMode}
          isToday={s.selectedDay === TODAY.day && s.year === TODAY.year && s.month === TODAY.month}
          onOpen={(rect) => addState.openAt(rect)} />
      )}
      {triggerMode !== 'toolbar' && (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <div style={{ font: '500 9px var(--font-mono)', letterSpacing: '0.24em', color: 'var(--ink-soft)' }}>
            {MONTH_NAMES[s.month].slice(0,3).toUpperCase()} · {s.year}
          </div>
          {triggerMode === 'header' && (
            <HeaderTrigger mobile onOpen={(rect) => addState.openAt(rect)} />
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <ChevronBtn dir="left" onClick={() => dispatch({ type: 'PREV_MONTH' })} />
          <ChevronBtn dir="right" onClick={() => dispatch({ type: 'NEXT_MONTH' })} />
          <button onClick={() => dispatch({ type: 'SET_ROUTE', route: 'settings' })}
            style={{ background: 'transparent', border: 'none', color: 'var(--ink)', cursor: 'pointer', padding: 4, marginLeft: 4 }}>
            <GearIcon size={16} />
          </button>
        </div>
      </div>
      )}

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr auto', gap: 14,
        alignItems: 'flex-end', marginBottom: 22, paddingBottom: 16,
        borderBottom: selDayExp.length > 0 ? 'none' : '1px solid var(--rule)',
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ font: 'italic 400 13px var(--font-display)', color: 'var(--ink-soft)', marginBottom: 4 }}>
            {dayLabel}{isClosed && ' · CLOSED'}
          </div>
          <h1 style={{ font: '400 38px/1 var(--font-display)', margin: 0, letterSpacing: '-0.01em' }}>
            {MONTH_NAMES[s.month]} {s.selectedDay}
          </h1>
          <div style={{ font: '500 9px var(--font-mono)', letterSpacing: '0.22em', color: 'var(--ink-soft)', marginTop: 8 }}>
            {s.selectedDay === TODAY.day ? 'TODAY' : 'THIS DAY'}
          </div>
        </div>
        <div style={{ justifySelf: 'end' }}>
          {triggerMode === 'daycard'
            ? <DayCardTrigger mobile amount={selDayTotal} isClosed={isClosed}
                onOpen={(rect) => addState.openAt(rect)} />
            : <span style={{ display: 'flex', alignItems: 'baseline', gap: 2,
                color: isClosed ? 'var(--ink-soft)' : 'var(--ink)' }}>
                <span style={{ font: '300 18px var(--font-display)', color: 'var(--ink-soft)' }}>$</span>
                <span style={{ font: '300 48px/0.95 var(--font-display)', letterSpacing: '-0.03em',
                  textDecoration: isClosed ? 'line-through' : 'none' }}>
                  <AnimatedNumber value={selDayTotal} />
                </span>
              </span>}
        </div>
      </div>

      {/* Day expenses */}
      {selDayExp.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          {selDayExp.map(e => {
            const cat = d.catByKey[e.cat];
            const ghost = e.id === addState.ghostId;
            return (
              <div key={e.id} style={{
                display: 'grid', gridTemplateColumns: '10px 1fr auto', gap: 10,
                alignItems: 'center', padding: '10px 0', borderTop: '1px solid var(--rule)',
                animation: ghost ? 'ghostIn 600ms cubic-bezier(0.22,1,0.36,1)' : undefined,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: 99, background: cat.color, justifySelf: 'center' }} />
                <div>
                  <div style={{ font: '400 13px var(--font-sans)' }}>{e.label}</div>
                  <div style={{ font: '500 8px var(--font-mono)', letterSpacing: '0.16em', color: 'var(--ink-soft)', marginTop: 2 }}>
                    {cat.label.toUpperCase()}
                  </div>
                </div>
                <span style={{ font: 'italic 400 17px var(--font-display)' }}>${e.amount}</span>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button onClick={() => toggleClosed(s.selectedDay)} style={pillBtn(isClosed)}>
          {isClosed ? 'REOPEN DAY' : 'CLOSE DAY'}
        </button>
      </div>

      {/* Mini-calendar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginBottom: 4 }}>
          {DOW_SHORT.map((dd, i) => (
            <div key={i} style={{ font: '500 8px var(--font-mono)', letterSpacing: '0.16em',
              color: 'var(--ink-soft)', textAlign: 'center', padding: '2px 0' }}>{dd}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
          {cells.map((day, i) => {
            if (!day) return <div key={i} style={{ aspectRatio: '1' }} />;
            const exp = d.byDay[day] || [];
            const total = exp.reduce((a, b) => a + b.amount, 0);
            const dom = dominantCatForDay(exp, d.catByKey);
            const isToday = day === TODAY.day;
            const isSelected = day === s.selectedDay;
            const closed = s.closedDays.includes(day);
            return (
              <button key={i} onClick={() => dispatch({ type: 'SET_DAY', day })} style={{
                aspectRatio: '1', position: 'relative',
                background: closed ? 'rgba(0,0,0,0.04)' : (total > 0 ? dom.color + '2a' : 'transparent'),
                border: `1px solid ${isSelected ? 'var(--ink)' : 'var(--rule)'}`,
                cursor: 'pointer', padding: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: closed ? 0.55 : 1,
                transition: 'all 200ms ease',
              }}>
                <span style={{ font: '500 10px var(--font-mono)',
                  color: isToday ? 'var(--ink)' : (total > 0 ? 'var(--ink)' : 'var(--ink-soft)'),
                  fontWeight: isToday ? 700 : 500,
                  textDecoration: closed ? 'line-through' : 'none' }}>{day}</span>
                {total > 0 && !closed && (
                  <span style={{ position: 'absolute', top: 2, right: 2, width: 3, height: 3, borderRadius: 99, background: dom.color }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Donut + cats with budgets */}
      <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 16, marginBottom: 22, alignItems: 'center' }}>
        <Donut totals={d.totals} size={110} thickness={16} centerLabel={`$${d.monthTotal}`} centerSub="MONTH" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: showCatBudgets ? 6 : 4 }}>
          {d.totals.map(t => {
            if (!showCatBudgets) {
              const pct = d.monthTotal > 0 ? Math.round((t.amount / d.monthTotal) * 100) : 0;
              return (
                <div key={t.key} style={{ display: 'grid', gridTemplateColumns: '8px 1fr auto auto', gap: 8,
                  alignItems: 'center', padding: '4px 0' }}>
                  <span style={{ width: 6, height: 6, borderRadius: 99, background: t.color, alignSelf: 'center' }} />
                  <span style={{ font: '400 11px var(--font-sans)' }}>{t.label}</span>
                  <span style={{ font: 'italic 400 14px var(--font-display)' }}>${t.amount}</span>
                  <span style={{ font: '500 8px var(--font-mono)', letterSpacing: '0.1em', color: 'var(--ink-soft)', minWidth: 26, textAlign: 'right' }}>{pct}%</span>
                </div>
              );
            }
            const ratio = t.budget > 0 ? t.amount / t.budget : 0;
            return (
              <div key={t.key} style={{ display: 'grid', gridTemplateColumns: '8px 1fr auto', gap: 6, alignItems: 'center', columnGap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: 99, background: t.color, alignSelf: 'center' }} />
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', font: '400 11px var(--font-sans)' }}>
                    <span>{t.label}</span>
                    <span style={{ font: '500 8px var(--font-mono)', letterSpacing: '0.1em', color: 'var(--ink-soft)' }}>${t.amount}/${t.budget}</span>
                  </div>
                  <div style={{ height: 1.5, background: 'var(--rule)', marginTop: 3, position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, height: '100%',
                      width: `${Math.min(100, ratio * 100)}%`, background: ratio > 1 ? '#9b3c3c' : t.color,
                      transition: 'width 600ms cubic-bezier(0.22,1,0.36,1)' }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Budget rail */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ height: 1, background: 'var(--rule)', marginBottom: 8, position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: -1, height: 3,
            width: `${Math.min(1, d.monthTotal / Math.max(1, d.effBudget)) * 100}%`,
            background: 'var(--ink)', transition: 'width 600ms cubic-bezier(0.22,1,0.36,1)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between',
          font: '500 9px var(--font-mono)', letterSpacing: '0.18em', color: 'var(--ink-soft)' }}>
          <span>${d.monthTotal} OF ${Math.round(d.effBudget)}</span>
          <span>DAY {TODAY.day} OF {d.dim}</span>
        </div>
      </div>

      {/* Recents */}
      <div>
        <div style={{ font: '500 9px var(--font-mono)', letterSpacing: '0.22em', color: 'var(--ink-soft)', marginBottom: 8 }}>RECENT</div>
        {recents.slice(0, 4).map(e => {
          const cat = d.catByKey[e.cat];
          return (
            <div key={e.id} onClick={() => dispatch({ type: 'SET_DAY', day: e.day })}
              style={{ display: 'grid', gridTemplateColumns: '10px 1fr auto', gap: 10,
                alignItems: 'center', padding: '11px 0', borderBottom: '1px solid var(--rule)', cursor: 'pointer' }}>
              <span style={{ width: 5, height: 5, borderRadius: 99, background: cat.color, justifySelf: 'center' }} />
              <div>
                <div style={{ font: '500 9px var(--font-mono)', letterSpacing: '0.16em', color: 'var(--ink)' }}>
                  APR {e.day}
                </div>
                <div style={{ font: '500 8px var(--font-mono)', letterSpacing: '0.16em', color: 'var(--ink-soft)', marginTop: 2 }}>
                  {cat.label.toUpperCase()} · {e.label.toUpperCase()}
                </div>
              </div>
              <span style={{ font: 'italic 400 18px var(--font-display)' }}>${e.amount}</span>
            </div>
          );
        })}
      </div>

      {triggerMode === 'floating' && (
        <FloatingTrigger mobile onOpen={(rect) => addState.openAt(rect)} />
      )}
      <AddPopover open={addState.open}
        mobile
        onClose={addState.close} onAdd={addExp}
        defaultDay={s.selectedDay} categories={s.categories} recents={recents} />
    </div>
  );
}

// ── Mobile compact omnibar ──
// Row 1: $ amount  ·  note input  ·  LOG
// Row 2: horizontal-scroll category chip strip
function MobileOmnibar({ defaultDay, categories, onAdd, dayLabel }) {
  const enabledCats = categories.filter(c => c.enabled);
  const [amount, setAmount] = React.useState('');
  const [label, setLabel]   = React.useState('');
  const [cat, setCat]       = React.useState(enabledCats[0]?.key);
  const inputRef = React.useRef(null);
  const ready = parseFloat(amount) > 0;

  const submit = () => {
    if (!ready) return;
    const c = categories.find(x => x.key === cat);
    onAdd({ amount: parseFloat(amount), cat, label: label.trim() || c?.label || 'Expense', day: defaultDay });
    setAmount(''); setLabel('');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div style={{
      borderTop: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)',
      padding: '12px 0', marginBottom: 22,
    }}>
      <div style={{ font: '500 8px var(--font-mono)', letterSpacing: '0.22em',
        color: 'var(--ink-soft)', marginBottom: 8 }}>
        LOG TO {dayLabel?.toUpperCase()}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '74px 1fr auto', gap: 8, alignItems: 'baseline', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
          <span style={{ font: 'italic 300 18px var(--font-display)', color: 'var(--ink-soft)' }}>$</span>
          <input ref={inputRef} type="number" inputMode="decimal" step="0.01" placeholder="0"
            value={amount} onChange={e => setAmount(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            style={{ width: '100%', font: '400 24px/1 var(--font-display)', color: 'var(--ink)',
              background: 'transparent', border: 'none', outline: 'none', padding: 0, minWidth: 0 }} />
        </div>
        <input value={label} onChange={e => setLabel(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="what for?"
          style={{ font: 'italic 400 14px var(--font-display)', color: 'var(--ink)',
            background: 'transparent', border: 'none', borderBottom: '1px solid var(--rule)',
            outline: 'none', padding: '4px 0', alignSelf: 'end', minWidth: 0 }} />
        <button onClick={submit} disabled={!ready} style={{
          background: ready ? 'var(--ink)' : 'transparent',
          color:  ready ? 'var(--bg)' : 'var(--ink-soft)',
          border: `1px solid ${ready ? 'var(--ink)' : 'var(--rule)'}`,
          cursor: ready ? 'pointer' : 'default',
          font: '500 9px var(--font-mono)', letterSpacing: '0.18em',
          padding: '7px 11px', borderRadius: 999, alignSelf: 'end',
          transition: 'all 150ms ease', whiteSpace: 'nowrap',
        }}>LOG ↵</button>
      </div>
      {/* Category strip — horizontal scroll */}
      <div style={{
        display: 'flex', gap: 5, overflowX: 'auto', paddingBottom: 2,
        marginInline: -2, paddingInline: 2,
        scrollbarWidth: 'none', msOverflowStyle: 'none',
      }}>
        {enabledCats.map(c => {
          const active = c.key === cat;
          return (
            <button key={c.key} onClick={() => setCat(c.key)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 5, flex: '0 0 auto',
              padding: '4px 9px', borderRadius: 999,
              border: `1px solid ${active ? c.color : 'var(--rule)'}`,
              background: active ? c.color + '22' : 'transparent',
              color: 'var(--ink)', cursor: 'pointer',
              font: '400 11px var(--font-sans)',
              transition: 'all 150ms ease',
              whiteSpace: 'nowrap',
            }}>
              <span style={{ width: 5, height: 5, borderRadius: 99, background: c.color }} />
              {c.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { DashboardMobile });
