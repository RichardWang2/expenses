// Settings page — desktop and mobile.
// Manage categories (CRUD, color, budget, on/off), close-gaps action, palette/type.

function Settings({ width = 1000, height = 1100, mobile = false }) {
  const [s, dispatch] = useStore();
  const totalBudget = s.budgetsEnabled
    ? s.categories.filter(c => c.enabled).reduce((a, b) => a + (b.budget || 0), 0)
    : (s.monthlyCap || 0);
  const [newName, setNewName] = React.useState('');

  const back = () => dispatch({ type: 'SET_ROUTE', route: 'dashboard' });
  const updateCat = (key, patch) => dispatch({ type: 'UPDATE_CATEGORY', key, patch });
  const removeCat = (key) => dispatch({ type: 'REMOVE_CATEGORY', key });
  const addCat = () => {
    const name = newName.trim(); if (!name) return;
    const key = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).slice(2, 5);
    const usedColors = new Set(s.categories.map(c => c.color));
    const color = PALETTE_POOL.find(c => !usedColors.has(c)) || PALETTE_POOL[s.categories.length % PALETTE_POOL.length];
    dispatch({ type: 'ADD_CATEGORY', category: { key, label: name, color, budget: 50, enabled: true } });
    setNewName('');
  };

  const pad = mobile ? '36px 22px 24px' : '52px 60px 56px';
  const titleSize = mobile ? 38 : 64;

  return (
    <div style={{
      width, minHeight: height, background: 'var(--bg)', color: 'var(--ink)',
      fontFamily: 'var(--font-sans)', position: 'relative',
      padding: pad, boxSizing: 'border-box',
      animation: 'slideInRight 360ms cubic-bezier(0.22,1,0.36,1)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: mobile ? 22 : 40 }}>
        <button onClick={back} style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          font: '500 10px var(--font-mono)', letterSpacing: '0.24em', color: 'var(--ink-soft)',
          padding: 0, display: 'flex', alignItems: 'center', gap: 8,
        }}>← BACK</button>
        <div style={{ font: '500 10px var(--font-mono)', letterSpacing: '0.24em', color: 'var(--ink-soft)' }}>SETTINGS</div>
      </div>

      <div style={{ font: 'italic 400 15px var(--font-display)', color: 'var(--ink-soft)', marginBottom: 6 }}>
        Adjust your
      </div>
      <h1 style={{ font: `400 ${titleSize}px/1 var(--font-display)`, margin: 0, letterSpacing: '-0.01em', marginBottom: mobile ? 28 : 48 }}>
        Categories &amp; budget.
      </h1>

      {/* Summary strip */}
      <div style={{
        display: 'grid', gridTemplateColumns: mobile ? '1fr 1fr' : 'repeat(3, 1fr)',
        borderTop: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)',
        marginBottom: mobile ? 24 : 36,
      }}>
        <SettingStat label="MONTHLY BUDGET" value={`$${totalBudget}`} sub={s.budgetsEnabled ? 'sum of categories' : 'monthly cap'} mobile={mobile} />
        <SettingStat label="ACTIVE CATEGORIES" value={s.categories.filter(c => c.enabled).length} sub={`of ${s.categories.length}`} mobile={mobile} />
        {!mobile && <SettingStat label="DAYS CLOSED" value={s.closedDays.length} sub="this month" mobile={mobile} last />}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr', gap: 36 }}>
        {/* Budget mode */}
        <section>
          <div style={{ font: '500 10px var(--font-mono)', letterSpacing: '0.24em', color: 'var(--ink-soft)', marginBottom: 14 }}>
            BUDGET MODE
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 14,
            alignItems: 'center', padding: '14px 0', borderTop: '1px solid var(--rule)' }}>
            <div>
              <div style={{ font: '400 16px var(--font-sans)', color: 'var(--ink)', marginBottom: 4 }}>
                Per-category budgets
              </div>
              <div style={{ font: 'italic 400 14px/1.4 var(--font-display)', color: 'var(--ink-soft)' }}>
                {s.budgetsEnabled
                  ? 'Each category has its own budget. Monthly total is the sum.'
                  : 'Single monthly cap only — categories track spend but no per-category limits.'}
              </div>
            </div>
            <ToggleSwitch on={s.budgetsEnabled} onChange={v => dispatch({ type: 'SET_BUDGETS', value: v })} />
          </div>
          {!s.budgetsEnabled && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 14,
              alignItems: 'center', padding: '14px 0', borderTop: '1px solid var(--rule)' }}>
              <div style={{ font: '400 16px var(--font-sans)' }}>Monthly cap</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ font: 'italic 400 14px var(--font-display)', color: 'var(--ink-soft)' }}>$</span>
                <input type="number" value={s.monthlyCap}
                  onChange={e => dispatch({ type: 'SET_MONTHLY_CAP', value: parseInt(e.target.value) || 0 })}
                  style={{ width: 90, font: 'italic 400 22px var(--font-display)', textAlign: 'right',
                    color: 'var(--ink)',
                    background: 'transparent', border: 'none', borderBottom: '1px solid var(--rule)',
                    outline: 'none', padding: '2px 0' }} />
              </div>
            </div>
          )}
        </section>

        {/* Appearance */}
        <section>
          <div style={{ font: '500 10px var(--font-mono)', letterSpacing: '0.24em', color: 'var(--ink-soft)', marginBottom: 14 }}>
            APPEARANCE
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 14,
            alignItems: 'center', padding: '14px 0', borderTop: '1px solid var(--rule)' }}>
            <div>
              <div style={{ font: '400 16px var(--font-sans)', color: 'var(--ink)', marginBottom: 4 }}>Dark mode</div>
              <div style={{ font: 'italic 400 14px/1.4 var(--font-display)', color: 'var(--ink-soft)' }}>
                Switches the canvas to a warm-night palette.
              </div>
            </div>
            <ToggleSwitch on={s.darkMode} onChange={() => dispatch({ type: 'TOGGLE_DARK' })} />
          </div>
        </section>

        {/* Categories list */}
        <section>
          <div style={{ font: '500 10px var(--font-mono)', letterSpacing: '0.24em', color: 'var(--ink-soft)', marginBottom: 14 }}>
            CATEGORIES
          </div>
          <div>
            {s.categories.map(c => (
              <CategoryRow key={c.key} cat={c}
                onUpdate={patch => updateCat(c.key, patch)}
                onRemove={() => removeCat(c.key)}
                mobile={mobile}
                showBudget={s.budgetsEnabled} />
            ))}
          </div>
          {/* Add new */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr auto', gap: 12,
            padding: '14px 0', borderTop: '1px dotted var(--rule)', alignItems: 'center', marginTop: 6,
          }}>
            <input value={newName} onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCat()}
              placeholder="New category…"
              style={{ font: '400 15px var(--font-sans)', color: 'var(--ink)',
                background: 'transparent', border: 'none', borderBottom: '1px solid var(--rule)',
                padding: '6px 0', outline: 'none' }} />
            <button onClick={addCat} disabled={!newName.trim()} style={{
              background: newName.trim() ? 'var(--ink)' : 'transparent',
              color: newName.trim() ? 'var(--bg)' : 'var(--ink-soft)',
              border: `1px solid ${newName.trim() ? 'var(--ink)' : 'var(--rule)'}`,
              cursor: newName.trim() ? 'pointer' : 'default',
              font: '500 10px var(--font-mono)', letterSpacing: '0.2em',
              padding: '8px 14px', borderRadius: 999,
            }}>+ ADD</button>
          </div>
        </section>

        {/* Closed days section */}
        <section style={{ marginTop: mobile ? 12 : 24 }}>
          <div style={{ font: '500 10px var(--font-mono)', letterSpacing: '0.24em', color: 'var(--ink-soft)', marginBottom: 14 }}>
            CLOSED DAYS
          </div>
          <div style={{ font: 'italic 400 15px/1.5 var(--font-display)', color: 'var(--ink-soft)', marginBottom: 14, maxWidth: 520 }}>
            Closing a day skips it from pacing — your monthly budget is reduced by one day's share.
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {s.closedDays.length === 0 ? (
              <span style={{ font: 'italic 400 14px var(--font-display)', color: 'var(--ink-soft)' }}>None this month.</span>
            ) : s.closedDays.map(d => (
              <button key={d} onClick={() => dispatch({ type: 'TOGGLE_CLOSED', day: d })}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'transparent', border: '1px solid var(--rule)',
                  color: 'var(--ink)', cursor: 'pointer',
                  font: '500 10px var(--font-mono)', letterSpacing: '0.18em',
                  padding: '6px 10px', borderRadius: 999 }}>
                {MONTH_NAMES[s.month].slice(0,3).toUpperCase()} {d}
                <span style={{ color: 'var(--ink-soft)' }}>×</span>
              </button>
            ))}
          </div>
          <button onClick={() => dispatch({ type: 'CLOSE_GAPS' })} style={{
            background: 'transparent', border: '1px solid var(--ink)',
            color: 'var(--ink)', cursor: 'pointer',
            font: '500 10px var(--font-mono)', letterSpacing: '0.2em',
            padding: '10px 16px', borderRadius: 999,
          }}>CLOSE PAST UNTRACKED DAYS</button>
        </section>
      </div>
    </div>
  );
}

function SettingStat({ label, value, sub, last, mobile }) {
  return (
    <div style={{
      padding: mobile ? '14px 16px' : '20px 24px',
      borderRight: last ? 'none' : '1px solid var(--rule)',
    }}>
      <div style={{ font: '500 9px var(--font-mono)', letterSpacing: '0.22em', color: 'var(--ink-soft)', marginBottom: 8 }}>{label}</div>
      <div style={{ font: `400 ${mobile ? 26 : 36}px/1 var(--font-display)`, letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ font: 'italic 400 12px var(--font-display)', color: 'var(--ink-soft)', marginTop: 4 }}>{sub}</div>
    </div>
  );
}

function CategoryRow({ cat, onUpdate, onRemove, mobile, showBudget = true }) {
  const [showColors, setShowColors] = React.useState(false);
  const cols = showBudget
    ? (mobile ? '20px 1fr auto auto' : '20px 1fr 100px 80px auto')
    : (mobile ? '20px 1fr auto' : '20px 1fr 80px auto');
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: cols,
      gap: 14, alignItems: 'center', padding: '14px 0',
      borderTop: '1px solid var(--rule)',
      opacity: cat.enabled ? 1 : 0.55,
    }}>
      <div style={{ position: 'relative' }}>
        <button onClick={() => setShowColors(v => !v)} style={{
          width: 14, height: 14, borderRadius: 99, background: cat.color,
          border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer', padding: 0,
        }} title="Change color" />
        {showColors && (
          <div style={{
            position: 'absolute', top: 22, left: -4, zIndex: 5,
            background: 'var(--bg)', border: '1px solid var(--rule)', padding: 8,
            display: 'grid', gridTemplateColumns: 'repeat(5, 18px)', gap: 6,
            boxShadow: '0 8px 22px rgba(0,0,0,0.12)',
          }}>
            {PALETTE_POOL.map(c => (
              <button key={c} onClick={() => { onUpdate({ color: c }); setShowColors(false); }}
                style={{ width: 18, height: 18, borderRadius: 99, background: c,
                  border: c === cat.color ? '2px solid var(--ink)' : '1px solid rgba(0,0,0,0.1)',
                  cursor: 'pointer', padding: 0 }} />
            ))}
          </div>
        )}
      </div>
      <input value={cat.label} onChange={e => onUpdate({ label: e.target.value })}
        style={{ font: '400 15px var(--font-sans)', color: 'var(--ink)',
          background: 'transparent', border: 'none', outline: 'none', padding: '4px 0' }} />
      {showBudget && !mobile && (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, justifyContent: 'flex-end' }}>
          <span style={{ font: 'italic 400 14px var(--font-display)', color: 'var(--ink-soft)' }}>$</span>
          <input type="number" value={cat.budget}
            onChange={e => onUpdate({ budget: parseInt(e.target.value) || 0 })}
            style={{ width: 70, font: 'italic 400 22px var(--font-display)', textAlign: 'right',
              color: 'var(--ink)',
              background: 'transparent', border: 'none', borderBottom: '1px solid var(--rule)',
              outline: 'none', padding: '2px 0' }} />
        </div>
      )}
      {showBudget && mobile && (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
          <span style={{ font: 'italic 400 12px var(--font-display)', color: 'var(--ink-soft)' }}>$</span>
          <input type="number" value={cat.budget}
            onChange={e => onUpdate({ budget: parseInt(e.target.value) || 0 })}
            style={{ width: 50, font: 'italic 400 18px var(--font-display)', textAlign: 'right',
              color: 'var(--ink)',
              background: 'transparent', border: 'none', borderBottom: '1px solid var(--rule)',
              outline: 'none', padding: '2px 0' }} />
        </div>
      )}
      <ToggleSwitch on={cat.enabled} onChange={v => onUpdate({ enabled: v })} />
      {!mobile && (
        <button onClick={onRemove} title="Delete category" style={{
          background: 'transparent', border: 'none', color: 'var(--ink-soft)',
          fontSize: 18, cursor: 'pointer', padding: 4,
        }}>×</button>
      )}
    </div>
  );
}

function ToggleSwitch({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} style={{
      width: 36, height: 20, borderRadius: 999,
      background: on ? 'var(--ink)' : 'var(--rule)',
      border: 'none', cursor: 'pointer', padding: 2,
      transition: 'background 200ms ease',
      position: 'relative',
    }}>
      <div style={{
        width: 14, height: 14, borderRadius: 99, background: 'var(--bg)',
        transform: `translateX(${on ? 16 : 0}px)`,
        transition: 'transform 200ms cubic-bezier(0.22,1,0.36,1)',
      }} />
    </button>
  );
}

Object.assign(window, { Settings, CategoryRow, ToggleSwitch, SettingStat });
