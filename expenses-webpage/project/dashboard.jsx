// Dashboard — desktop and mobile.
// Two-column hero on desktop, single-column on mobile.

function Dashboard({ width = 1000, height = 1100, mobile = false }) {
  const [s, dispatch] = useStore();
  const d = useDerived();
  const addCfg = React.useContext(AddCfgCtx);
  const addState = useAddState();
  const [editingId, setEditingId] = React.useState(null);

  const dayLabel = DOW_FULL[new Date(s.year, s.month, s.selectedDay).getDay()];
  const isClosed = s.closedDays.includes(s.selectedDay);
  const cells = buildCells(s.year, s.month);
  const selDayExp = d.byDay[s.selectedDay] || [];
  const selDayTotal = selDayExp.reduce((a, b) => a + b.amount, 0);
  const recents = [...d.visibleExpenses].sort((a, b) => b.day - a.day || b.amount - a.amount).slice(0, 5);

  const updateExp = (id, patch) => dispatch({ type: 'UPDATE_EXPENSE', id, patch });
  const deleteExp = (id) => dispatch({ type: 'DELETE_EXPENSE', id });
  const addExp    = (e)  => {
    const id = 'e' + Math.random().toString(36).slice(2,8);
    dispatch({ type: 'ADD_EXPENSE', expense: { ...e, id } });
    addState.setGhostId(id);
    setTimeout(() => addState.setGhostId(null), 800);
  };
  const toggleClosed = (day) => dispatch({ type: 'TOGGLE_CLOSED', day });

  if (mobile) return <DashboardMobile width={width} height={height}
    s={s} d={d} dispatch={dispatch}
    addState={addState} addCfg={addCfg}
    editingId={editingId} setEditingId={setEditingId}
    cells={cells} selDayExp={selDayExp} selDayTotal={selDayTotal}
    recents={recents} dayLabel={dayLabel} isClosed={isClosed}
    addExp={addExp} updateExp={updateExp} deleteExp={deleteExp} toggleClosed={toggleClosed} />;

  const isToday = s.selectedDay === TODAY.day && s.year === TODAY.year && s.month === TODAY.month;
  const showCatBudgets = s.budgetsEnabled;
  const triggerMode = addCfg.trigger;

  return (
    <div style={{
      width, minHeight: height, background: 'var(--bg)', color: 'var(--ink)',
      fontFamily: 'var(--font-sans)', position: 'relative',
      boxSizing: 'border-box',
      animation: 'fadeIn 320ms ease',
    }}>
    {/* Mode toolbar: full-width sticky strip */}
    {triggerMode === 'toolbar' && (
      <ToolbarStrip
        monthName={MONTH_NAMES[s.month]} year={s.year}
        onPrev={() => dispatch({ type: 'PREV_MONTH' })}
        onNext={() => dispatch({ type: 'NEXT_MONTH' })}
        onToday={() => dispatch({ type: 'GO_TODAY' })}
        onSettings={() => dispatch({ type: 'SET_ROUTE', route: 'settings' })}
        onDark={() => dispatch({ type: 'TOGGLE_DARK' })}
        isDark={s.darkMode} isToday={isToday}
        onOpen={(rect) => addState.openAt(rect)} />
    )}
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 70,
      padding: triggerMode === 'toolbar' ? '8px 60px 56px' : '52px 60px 56px',
      boxSizing: 'border-box',
    }}>
      {/* LEFT */}
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36, gap: 14, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ font: '500 10px var(--font-mono)', letterSpacing: '0.28em', color: 'var(--ink-soft)' }}>
              {MONTH_NAMES[s.month].slice(0,3).toUpperCase()} · {s.year}
            </div>
            {triggerMode === 'header' && (
              <HeaderTrigger onOpen={(rect) => addState.openAt(rect)} />
            )}
          </div>
          {!isToday && triggerMode !== 'toolbar' && (
            <button onClick={() => dispatch({ type: 'GO_TODAY' })} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'transparent', border: '1px solid var(--ink)',
              color: 'var(--ink)', cursor: 'pointer',
              font: '500 10px var(--font-mono)', letterSpacing: '0.22em',
              padding: '7px 12px', borderRadius: 999,
            }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: 99,
                background: '#9b3c3c', animation: 'pulseDot 1.6s ease-in-out infinite' }} />
              JUMP TO TODAY
            </button>
          )}
        </div>

        <div style={{ font: 'italic 400 16px/1 var(--font-display)', color: 'var(--ink-soft)', marginBottom: 14 }}>
          {dayLabel}{isClosed && ' · CLOSED'}
        </div>
        <h1 style={{ font: '400 84px/1 var(--font-display)', letterSpacing: '-0.01em', margin: 0 }}>
          {MONTH_NAMES[s.month]} {s.selectedDay}
        </h1>

        <div style={{ flex: '0 0 48px' }} />

        <div style={{ font: '500 10px var(--font-mono)', letterSpacing: '0.24em', color: 'var(--ink-soft)', marginBottom: 8 }}>
          {s.selectedDay === TODAY.day ? 'TODAY' : 'THIS DAY'}
        </div>
        <div style={{ marginBottom: 14 }}>
          {triggerMode === 'daycard'
            ? <DayCardTrigger amount={selDayTotal} isClosed={isClosed}
                onOpen={(rect) => addState.openAt(rect)} />
            : <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 4,
                font: '300 96px/0.9 var(--font-display)', color: isClosed ? 'var(--ink-soft)' : 'var(--ink)',
                textDecoration: isClosed ? 'line-through' : 'none',
              }}>
                <span style={{ fontSize: '0.32em', marginTop: '0.18em', color: 'var(--ink-soft)' }}>$</span>
                <span style={{ letterSpacing: '-0.04em' }}>
                  <AnimatedNumber value={selDayTotal} />
                </span>
              </div>}
        </div>

        {/* Daily delta */}
        {!isClosed && d.dayRate > 0 && (
          <div style={{ font: '500 10px var(--font-mono)', letterSpacing: '0.18em', marginBottom: 24,
            color: selDayTotal > d.dayRate ? '#9b3c3c' : 'var(--ink-soft)' }}>
            {selDayTotal > d.dayRate
              ? <>OVER DAILY BY {fmtMoney(selDayTotal - d.dayRate)} · PACE {fmtMoney(d.dayRate)}/DAY</>
              : <>{fmtMoney(d.dayRate - selDayTotal)} UNDER DAILY · PACE {fmtMoney(d.dayRate)}/DAY</>}
          </div>
        )}

        {/* Day expenses */}
        <div style={{ marginBottom: 28 }}>
          {selDayExp.length === 0 ? (
            <div style={{
              font: 'italic 400 15px/1.5 var(--font-display)', color: 'var(--ink-soft)',
              padding: '14px 0', borderTop: '1px solid var(--rule)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span>{isClosed ? 'Day closed — skipped from pacing.' : 'Nothing logged this day.'}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => toggleClosed(s.selectedDay)} style={pillBtn(isClosed)}>
                  {isClosed ? 'REOPEN' : 'CLOSE DAY'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {selDayExp.map(e => (
                <DayExpenseRow key={e.id} expense={e} categories={s.categories}
                  isGhost={e.id === addState.ghostId}
                  editing={editingId === e.id}
                  onStartEdit={() => setEditingId(e.id)}
                  onCancelEdit={() => setEditingId(null)}
                  onUpdate={patch => { updateExp(e.id, patch); setEditingId(null); }}
                  onDelete={() => deleteExp(e.id)} />
              ))}
              <div style={{
                paddingTop: 10, display: 'flex', justifyContent: 'flex-end',
                font: '500 10px var(--font-mono)', letterSpacing: '0.18em',
              }}>
                <button onClick={() => toggleClosed(s.selectedDay)} style={pillBtn(isClosed)}>
                  {isClosed ? 'REOPEN' : 'CLOSE DAY'}
                </button>
              </div>
            </>
          )}
        </div>

        <div style={{ font: 'italic 400 16px/1.5 var(--font-display)', color: 'var(--ink-soft)', marginBottom: 32, maxWidth: 380 }}>
          {pacingMessage(d.monthTotal, d.expectedSoFar, d.effBudget, d.totalBudget, s.closedDays.length)}
        </div>

        <div style={{ flex: 1, minHeight: 8 }} />

        {/* Budget rail */}
        <div style={{ marginTop: 'auto' }}>
          <div style={{ position: 'relative', height: 1, background: 'var(--rule)', marginBottom: 14 }}>
            <div style={{
              position: 'absolute', left: 0, top: -1, height: 3,
              width: `${Math.min(1, d.monthTotal / Math.max(1, d.effBudget)) * 100}%`,
              background: d.monthDelta > 0 ? '#9b3c3c' : 'var(--ink)',
              transition: 'width 600ms cubic-bezier(0.22,1,0.36,1), background 200ms',
            }} />
            {/* Pace marker */}
            {d.expectedSoFar > 0 && d.expectedSoFar < d.effBudget && (
              <div style={{ position: 'absolute', top: -4, height: 9, width: 1,
                left: `${(d.expectedSoFar / Math.max(1, d.effBudget)) * 100}%`,
                background: 'var(--ink-soft)' }} title="Pace marker" />
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', font: '500 10px var(--font-mono)', letterSpacing: '0.2em', color: 'var(--ink-soft)' }}>
            <span>{fmtMoney(d.monthTotal)} OF {fmtMoney(d.effBudget)}{s.closedDays.length > 0 && ` · ${s.closedDays.length} CLOSED`}</span>
            <span style={{ color: d.monthDelta > 0 ? '#9b3c3c' : 'var(--ink-soft)' }}>
              {d.monthDelta > 0
                ? `+${fmtMoney(d.monthDelta)} OVER PACE`
                : `${fmtMoney(-d.monthDelta)} UNDER PACE`}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between',
            font: '500 9px var(--font-mono)', letterSpacing: '0.18em',
            color: 'var(--ink-soft)', marginTop: 6, opacity: 0.75 }}>
            <span>DAY {TODAY.day} OF {d.dim} · {fmtMoney(d.dayRate)}/DAY</span>
            <span>{fmtMoney(Math.max(0, d.effBudget - d.monthTotal))} REMAINING</span>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 36, paddingTop: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ font: 'italic 400 22px/1 var(--font-display)', margin: 0 }}>This month</h2>
          {triggerMode !== 'toolbar' && (
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <ChevronBtn dir="left" onClick={() => dispatch({ type: 'PREV_MONTH' })} />
              <ChevronBtn dir="right" onClick={() => dispatch({ type: 'NEXT_MONTH' })} />
              <button onClick={() => dispatch({ type: 'TOGGLE_DARK' })}
                style={{ background: 'transparent', border: 'none', color: 'var(--ink)', cursor: 'pointer', padding: 4, marginLeft: 8 }}
                title={s.darkMode ? 'Light mode' : 'Dark mode'}>
                <SunMoonIcon size={18} dark={s.darkMode} />
              </button>
              <button onClick={() => dispatch({ type: 'SET_ROUTE', route: 'settings' })}
                style={{ background: 'transparent', border: 'none', color: 'var(--ink)', cursor: 'pointer', padding: 4 }}
                title="Settings"><DotsIcon size={18} /></button>
            </div>
          )}
        </div>

        <Calendar cells={cells} byDay={d.byDay} catByKey={d.catByKey}
          today={TODAY.day} selected={s.selectedDay} closedDays={s.closedDays}
          onSelect={(day) => dispatch({ type: 'SET_DAY', day })}
          onToggleClosed={toggleClosed} />

        {/* By category — with or without budgets */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
            <div style={{ font: '500 10px var(--font-mono)', letterSpacing: '0.24em', color: 'var(--ink-soft)' }}>BY CATEGORY</div>
            <div style={{ font: '500 9px var(--font-mono)', letterSpacing: '0.18em', color: 'var(--ink-soft)' }}>
              {showCatBudgets ? 'SPENT / BUDGET' : 'SPENT · % OF MONTH'}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 28, alignItems: 'center' }}>
            <Donut totals={d.totals} size={150} thickness={20} centerLabel={`$${d.monthTotal}`} centerSub="TOTAL" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: showCatBudgets ? 10 : 6 }}>
              {d.totals.map(t => showCatBudgets
                ? <CatBudgetRow key={t.key} cat={t} />
                : <CatPlainRow key={t.key} cat={t} total={d.monthTotal} />)}
            </div>
          </div>
        </div>

        {/* Recent */}
        <div>
          <div style={{ font: '500 10px var(--font-mono)', letterSpacing: '0.24em', color: 'var(--ink-soft)', marginBottom: 14 }}>RECENT</div>
          {recents.map(e => (
            <RecentRow key={e.id} expense={e} cat={d.catByKey[e.cat]} year={s.year} month={s.month}
              onSelectDay={(day) => dispatch({ type: 'SET_DAY', day })}
              onUpdate={(patch) => updateExp(e.id, patch)}
              onDelete={() => deleteExp(e.id)} categories={s.categories} />
          ))}
        </div>
      </div>

    </div>
    {triggerMode === 'floating' && (
      <FloatingTrigger onOpen={(rect) => addState.openAt(rect)} />
    )}
    <AddPopover open={addState.open}
      onClose={addState.close} onAdd={addExp}
      defaultDay={s.selectedDay} categories={s.categories} recents={recents} />
    </div>
  );
}

function pillBtn(active, primary) {
  return {
    background: primary ? 'var(--ink)' : (active ? 'var(--ink)' : 'transparent'),
    color: primary ? 'var(--bg)' : (active ? 'var(--bg)' : 'var(--ink-soft)'),
    border: `1px solid ${primary || active ? 'var(--ink)' : 'var(--rule)'}`,
    cursor: 'pointer',
    font: '500 9px var(--font-mono)', letterSpacing: '0.2em',
    padding: '6px 12px', borderRadius: 999,
    transition: 'all 150ms ease',
  };
}

function pacingMessage(spent, expected, effBudget, totalBudget, closedCount) {
  if (closedCount > 0 && spent < expected) {
    return `Closed ${closedCount} day${closedCount === 1 ? '' : 's'}. Budget recalibrated to ${fmtMoney(effBudget)}.`;
  }
  if (spent > expected) return `Over by ${fmtMoney(spent - expected)} this month, but still on pace overall.`;
  if (spent < expected * 0.85) return `Under pace by ${fmtMoney(expected - spent)} — a quiet month.`;
  return `Tracking steady against ${fmtMoney(effBudget)} budget.`;
}

// ── Calendar ──
function Calendar({ cells, byDay, catByKey, today, selected, closedDays, onSelect, onToggleClosed }) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 8 }}>
        {DOW_SHORT.map((d, i) => (
          <div key={i} style={{ font: '500 10px var(--font-mono)', letterSpacing: '0.18em', color: 'var(--ink-soft)', textAlign: 'center', padding: '4px 0' }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
        {cells.map((day, i) => (
          <CalCell key={i} day={day} expenses={day ? byDay[day] : null} catByKey={catByKey}
            isToday={day === today} isSelected={day === selected}
            isClosed={day && closedDays.includes(day)}
            onClick={() => day && onSelect(day)}
            onToggleClosed={() => day && onToggleClosed(day)} />
        ))}
      </div>
    </div>
  );
}

function CalCell({ day, expenses, catByKey, isToday, isSelected, isClosed, onClick, onToggleClosed }) {
  const [hover, setHover] = React.useState(false);
  const cellRef = React.useRef(null);
  if (!day) return <div style={{ aspectRatio: '1 / 1' }} />;
  const total = (expenses || []).reduce((a, b) => a + b.amount, 0);
  const dom = dominantCatForDay(expenses, catByKey);
  const fill = isClosed ? 'rgba(0,0,0,0.04)' : (total > 0 ? (dom?.color || 'var(--ink)') + '22' : 'transparent');
  const stroke = isSelected ? 'var(--ink)' : (isToday ? 'var(--ink)' : 'var(--rule)');

  return (
    <div ref={cellRef} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ position: 'relative', aspectRatio: '1 / 1' }}>
      <button onClick={onClick} style={{
        width: '100%', height: '100%', position: 'relative',
        background: fill, border: `${isToday ? '1.5px' : '1px'} solid ${stroke}`,
        borderRadius: 2, cursor: 'pointer', padding: 6,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        transition: 'background 200ms ease, border-color 200ms ease, transform 150ms ease',
        boxShadow: isSelected ? 'inset 0 0 0 1px var(--ink)' : 'none',
        fontFamily: 'inherit', textAlign: 'left',
        transform: hover && !isSelected ? 'translateY(-1px)' : 'none',
        opacity: isClosed ? 0.55 : 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {dom && !isClosed && <span style={{ width: 5, height: 5, borderRadius: 99, background: dom.color }} />}
          <span style={{ font: '500 10px var(--font-mono)', letterSpacing: '0.08em',
            color: isToday ? 'var(--ink)' : 'var(--ink-soft)', fontWeight: isToday ? 700 : 500,
            textDecoration: isClosed ? 'line-through' : 'none' }}>{day}</span>
          {isToday && (
            <span style={{
              marginLeft: 'auto', display: 'inline-block',
              width: 5, height: 5, borderRadius: 99, background: '#9b3c3c',
              animation: 'pulseDot 1.6s ease-in-out infinite',
            }} title="Today" />
          )}
        </div>
        {total > 0 && !isClosed && (
          <div style={{ font: 'italic 400 13px/1 var(--font-display)', color: 'var(--ink)' }}>${Math.round(total)}</div>
        )}
        {isClosed && (
          <div style={{ font: '500 8px var(--font-mono)', letterSpacing: '0.18em', color: 'var(--ink-soft)' }}>—</div>
        )}
      </button>

      {/* Hover close-day affordance */}
      {hover && !isClosed && (
        <button onClick={(e) => { e.stopPropagation(); onToggleClosed(); }}
          title="Close this day (skip from pacing)"
          style={{
            position: 'absolute', top: 3, right: 3, zIndex: 2,
            width: 16, height: 16, borderRadius: 99,
            background: 'var(--bg)', border: '1px solid var(--rule)',
            color: 'var(--ink-soft)', cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            font: '500 10px var(--font-mono)', lineHeight: 1,
            animation: 'fadeIn 120ms ease',
          }}>×</button>
      )}
      {hover && isClosed && (
        <button onClick={(e) => { e.stopPropagation(); onToggleClosed(); }}
          title="Reopen this day"
          style={{
            position: 'absolute', top: 3, right: 3, zIndex: 2,
            width: 16, height: 16, borderRadius: 99,
            background: 'var(--bg)', border: '1px solid var(--rule)',
            color: 'var(--ink-soft)', cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            font: '500 9px var(--font-mono)', lineHeight: 1,
            animation: 'fadeIn 120ms ease',
          }}>↺</button>
      )}
    </div>
  );
}

// ── CatPlainRow ─ simple row when budgets are off
function CatPlainRow({ cat, total }) {
  const pct = total > 0 ? Math.round((cat.amount / total) * 100) : 0;
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '12px 1fr auto auto', gap: 10,
      alignItems: 'center', padding: '8px 0', columnGap: 12,
      borderBottom: '1px dotted var(--rule)',
    }}>
      <span style={{ width: 8, height: 8, borderRadius: 99, background: cat.color, justifySelf: 'center' }} />
      <span style={{ font: '400 14px var(--font-sans)', color: 'var(--ink)' }}>{cat.label}</span>
      <span style={{ font: 'italic 400 18px var(--font-display)', color: 'var(--ink)' }}>${cat.amount}</span>
      <span style={{ font: '500 10px var(--font-mono)', letterSpacing: '0.1em', color: 'var(--ink-soft)', textAlign: 'right', minWidth: 40 }}>
        {pct}%
      </span>
    </div>
  );
}

// ── CatBudgetRow ─ shows spent/budget + mini progress bar
function CatBudgetRow({ cat }) {
  const ratio = cat.budget > 0 ? cat.amount / cat.budget : 0;
  const over  = ratio > 1;
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '12px 1fr auto auto', gap: 10,
      alignItems: 'center', padding: '4px 0', columnGap: 12,
    }}>
      <span style={{ width: 8, height: 8, borderRadius: 99, background: cat.color, justifySelf: 'center' }} />
      <div style={{ minWidth: 0 }}>
        <div style={{ font: '400 14px var(--font-sans)', color: 'var(--ink)' }}>{cat.label}</div>
        <div style={{ height: 2, background: 'var(--rule)', marginTop: 6, position: 'relative' }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, height: '100%',
            width: `${Math.min(100, ratio * 100)}%`,
            background: over ? '#9b3c3c' : cat.color,
            transition: 'width 600ms cubic-bezier(0.22,1,0.36,1), background 200ms',
          }} />
        </div>
      </div>
      <span style={{ font: '400 14px var(--font-display)', fontStyle: 'italic', color: 'var(--ink)' }}>
        ${cat.amount}
      </span>
      <span style={{ font: '500 10px var(--font-mono)', letterSpacing: '0.1em', color: 'var(--ink-soft)', textAlign: 'right', minWidth: 44 }}>
        / ${cat.budget}
      </span>
    </div>
  );
}

// ── DayExpenseRow ─ inline editable
function DayExpenseRow({ expense, categories, isGhost, editing, onStartEdit, onCancelEdit, onUpdate, onDelete }) {
  const cat = categories.find(c => c.key === expense.cat) || categories[0];
  const [hover, setHover] = React.useState(false);
  const [draftAmount, setDraftAmount] = React.useState(expense.amount);
  const [draftLabel, setDraftLabel] = React.useState(expense.label);
  const [draftCat, setDraftCat] = React.useState(expense.cat);

  React.useEffect(() => {
    if (editing) {
      setDraftAmount(expense.amount); setDraftLabel(expense.label); setDraftCat(expense.cat);
    }
  }, [editing, expense]);

  const save = () => {
    const n = parseFloat(draftAmount);
    onUpdate({ amount: isNaN(n) ? expense.amount : n, label: draftLabel, cat: draftCat });
  };

  if (editing) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 100px', gap: 12,
        alignItems: 'center', padding: '14px 0', borderTop: '1px solid var(--rule)' }}>
        <select value={draftCat} onChange={e => setDraftCat(e.target.value)}
          style={{ font: '500 10px var(--font-mono)', letterSpacing: '0.18em',
            background: 'transparent', border: '1px solid var(--rule)',
            color: 'var(--ink)', padding: '4px 6px' }}>
          {categories.filter(c => c.enabled).map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
        </select>
        <input value={draftLabel} onChange={e => setDraftLabel(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') onCancelEdit(); }}
          autoFocus style={{ font: '400 15px var(--font-sans)', color: 'var(--ink)',
            background: 'transparent', border: 'none', borderBottom: '1px solid var(--ink)',
            padding: '4px 0', outline: 'none', width: '100%' }} />
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, justifyContent: 'flex-end' }}>
          <span style={{ font: 'italic 400 16px var(--font-display)', color: 'var(--ink-soft)' }}>$</span>
          <input type="number" value={draftAmount} onChange={e => setDraftAmount(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') onCancelEdit(); }}
            onBlur={save} style={{ width: 60, font: 'italic 400 22px var(--font-display)', textAlign: 'right',
              background: 'transparent', border: 'none', borderBottom: '1px solid var(--ink)',
              color: 'var(--ink)', outline: 'none', padding: '2px 0' }} />
        </div>
      </div>
    );
  }

  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      onClick={onStartEdit}
      style={{ display: 'grid', gridTemplateColumns: '14px 1fr auto', gap: 12,
        alignItems: 'center', padding: '14px 0', borderTop: '1px solid var(--rule)',
        cursor: 'pointer', transition: 'background 150ms ease',
        background: hover ? 'rgba(0,0,0,0.02)' : 'transparent',
        marginInline: hover ? -8 : 0, paddingInline: hover ? 8 : 0,
        animation: isGhost ? 'ghostIn 600ms cubic-bezier(0.22,1,0.36,1)' : undefined }}>
      <span style={{ width: 8, height: 8, borderRadius: 99, background: cat.color, justifySelf: 'center' }} />
      <div style={{ minWidth: 0 }}>
        <div style={{ font: '400 15px var(--font-sans)', color: 'var(--ink)', marginBottom: 2 }}>{expense.label}</div>
        <div style={{ font: '500 9px var(--font-mono)', letterSpacing: '0.18em', color: 'var(--ink-soft)' }}>{cat.label.toUpperCase()}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ font: 'italic 400 24px/1 var(--font-display)' }}>${expense.amount}</span>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
          style={{ opacity: hover ? 0.6 : 0, background: 'transparent', border: 'none',
            color: 'var(--ink-soft)', fontSize: 18, cursor: 'pointer', padding: 2, transition: 'opacity 150ms' }}
          title="Delete">×</button>
      </div>
    </div>
  );
}

// ── RecentRow ─ click row → jump to day; edit button → inline edit
function RecentRow({ expense, cat, year, month, onSelectDay, onUpdate, onDelete, categories }) {
  const date = new Date(year, month, expense.day);
  const dow = ['SUN','MON','TUE','WED','THU','FRI','SAT'][date.getDay()];
  const [hover, setHover] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [draftAmount, setDraftAmount] = React.useState(expense.amount);
  const [draftLabel, setDraftLabel] = React.useState(expense.label);
  const [draftCat, setDraftCat] = React.useState(expense.cat);

  const save = () => {
    const n = parseFloat(draftAmount);
    onUpdate({ amount: isNaN(n) ? expense.amount : n, label: draftLabel, cat: draftCat });
    setEditing(false);
  };
  const startEdit = () => { setDraftAmount(expense.amount); setDraftLabel(expense.label); setDraftCat(expense.cat); setEditing(true); };

  if (editing) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '12px 1fr auto', gap: 14,
        alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--rule)' }}>
        <span style={{ width: 6, height: 6, borderRadius: 99, background: (categories.find(c=>c.key===draftCat)||cat).color, justifySelf: 'center' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <input value={draftLabel} onChange={e => setDraftLabel(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && save()} autoFocus
            style={{ font: '400 14px var(--font-sans)', background: 'transparent',
              border: 'none', borderBottom: '1px solid var(--rule)', padding: '2px 0', outline: 'none' }} />
          <select value={draftCat} onChange={e => setDraftCat(e.target.value)}
            style={{ font: '500 9px var(--font-mono)', letterSpacing: '0.18em',
              background: 'transparent', border: '1px solid var(--rule)',
              color: 'var(--ink-soft)', padding: '4px 6px', alignSelf: 'flex-start' }}>
            {categories.filter(c => c.enabled).map(c => <option key={c.key} value={c.key}>{c.label.toUpperCase()}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ font: 'italic 400 16px var(--font-display)', color: 'var(--ink-soft)' }}>$</span>
          <input type="number" value={draftAmount} onChange={e => setDraftAmount(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && save()}
            style={{ width: 64, font: 'italic 400 22px var(--font-display)', textAlign: 'right',
              background: 'transparent', border: 'none', borderBottom: '1px solid var(--ink)',
              outline: 'none', padding: '2px 0' }} />
          <button onClick={save} style={{ background: 'var(--ink)', color: 'var(--bg)', border: 'none', cursor: 'pointer',
            font: '500 9px var(--font-mono)', letterSpacing: '0.18em', padding: '6px 8px', borderRadius: 2 }}>SAVE</button>
        </div>
      </div>
    );
  }

  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ display: 'grid', gridTemplateColumns: '12px 1fr auto', gap: 14,
        alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--rule)',
        cursor: 'pointer' }}
      onClick={() => onSelectDay(expense.day)}>
      <span style={{ width: 6, height: 6, borderRadius: 99, background: cat.color, justifySelf: 'center' }} />
      <div style={{ minWidth: 0 }}>
        <div style={{ font: '500 10px var(--font-mono)', letterSpacing: '0.18em', color: 'var(--ink)', marginBottom: 3 }}>{dow} {expense.day}</div>
        <div style={{ font: '500 9px var(--font-mono)', letterSpacing: '0.18em', color: 'var(--ink-soft)' }}>
          {cat.label.toUpperCase()} · {expense.label.toUpperCase()}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ font: 'italic 400 22px/1 var(--font-display)' }}>${expense.amount}</span>
        <button onClick={(e) => { e.stopPropagation(); startEdit(); }}
          style={{ opacity: hover ? 0.7 : 0, background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--ink-soft)', font: '500 9px var(--font-mono)', letterSpacing: '0.18em',
            transition: 'opacity 150ms', padding: 4 }}>EDIT</button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
          style={{ opacity: hover ? 0.7 : 0, background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--ink-soft)', fontSize: 16, transition: 'opacity 150ms', padding: 4 }}>×</button>
      </div>
    </div>
  );
}

function buildCells(year, month) {
  const dim = daysInMonth(year, month);
  const first = firstDayOfMonth(year, month);
  const cells = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push(d);
  while (cells.length < 42) cells.push(null);
  while (cells.length > 35 && cells.slice(-7).every(c => c === null)) cells.length -= 7;
  return cells;
}

Object.assign(window, { Dashboard, Calendar, CalCell, CatBudgetRow, CatPlainRow, DayExpenseRow, RecentRow, buildCells, pacingMessage, pillBtn });
