// Onboarding — first-run welcome → category setup → ready.
// 3 steps; modal-feel within the artboard frame.

function Onboarding({ width = 1000, height = 1100, mobile = false }) {
  const [s, dispatch] = useStore();
  const [step, setStep] = React.useState(0);
  const [name, setName] = React.useState('');

  const next = () => setStep(v => Math.min(2, v + 1));
  const prev = () => setStep(v => Math.max(0, v - 1));
  const finish = () => dispatch({ type: 'SET_ROUTE', route: 'dashboard' });

  const pad = mobile ? '38px 22px' : '64px 80px';
  const titleSize = mobile ? 40 : 84;

  return (
    <div style={{
      width, minHeight: height, background: 'var(--bg)', color: 'var(--ink)',
      fontFamily: 'var(--font-sans)', position: 'relative',
      padding: pad, boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: mobile ? 28 : 56 }}>
        <div style={{ font: 'italic 400 16px var(--font-display)', letterSpacing: '0.02em' }}>Lumen</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0,1,2].map(i => (
            <span key={i} style={{
              width: i === step ? 18 : 6, height: 6, borderRadius: 99,
              background: i <= step ? 'var(--ink)' : 'var(--rule)',
              transition: 'all 250ms cubic-bezier(0.22,1,0.36,1)',
            }} />
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 720 }}>
        {step === 0 && (
          <div style={{ animation: 'fadeIn 320ms ease' }}>
            <div style={{ font: '500 10px var(--font-mono)', letterSpacing: '0.28em', color: 'var(--ink-soft)', marginBottom: 18 }}>
              WELCOME
            </div>
            <h1 style={{ font: `400 ${titleSize}px/1.02 var(--font-display)`, margin: 0, letterSpacing: '-0.015em', marginBottom: 28 }}>
              A quieter way<br/>to spend.
            </h1>
            <p style={{ font: 'italic 400 20px/1.5 var(--font-display)', color: 'var(--ink-soft)',
              maxWidth: 520, marginBottom: 44 }}>
              Lumen tracks the rhythm of your money — not the panic of it. Log expenses as they happen, watch the month breathe in and out.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: mobile ? 12 : 14, maxWidth: 360, marginBottom: 40 }}>
              <div style={{ font: '500 10px var(--font-mono)', letterSpacing: '0.22em', color: 'var(--ink-soft)' }}>WHAT SHOULD WE CALL YOU?</div>
              <input value={name} onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && next()}
                placeholder="your name"
                style={{ font: '400 28px var(--font-display)', color: 'var(--ink)',
                  background: 'transparent', border: 'none', borderBottom: '1px solid var(--ink)',
                  outline: 'none', padding: '6px 0' }} />
            </div>
          </div>
        )}

        {step === 1 && (
          <div style={{ animation: 'fadeIn 320ms ease' }}>
            <div style={{ font: '500 10px var(--font-mono)', letterSpacing: '0.28em', color: 'var(--ink-soft)', marginBottom: 18 }}>
              STEP 02 · CATEGORIES
            </div>
            <h1 style={{ font: `400 ${mobile ? 32 : 64}px/1.02 var(--font-display)`, margin: 0, letterSpacing: '-0.01em', marginBottom: 18 }}>
              Set your monthly<br/>budget by category.
            </h1>
            <p style={{ font: 'italic 400 16px/1.5 var(--font-display)', color: 'var(--ink-soft)',
              maxWidth: 480, marginBottom: 28 }}>
              These are starter values — toggle off what you don't need, change anything later in Settings.
            </p>
            <div style={{ borderTop: '1px solid var(--rule)', maxWidth: 560 }}>
              {s.categories.map(c => (
                <div key={c.key} style={{
                  display: 'grid', gridTemplateColumns: '14px 1fr 90px 36px',
                  gap: 14, alignItems: 'center', padding: '14px 0',
                  borderBottom: '1px solid var(--rule)', opacity: c.enabled ? 1 : 0.5,
                }}>
                  <span style={{ width: 10, height: 10, borderRadius: 99, background: c.color }} />
                  <span style={{ font: '400 16px var(--font-sans)' }}>{c.label}</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, justifyContent: 'flex-end' }}>
                    <span style={{ font: 'italic 400 14px var(--font-display)', color: 'var(--ink-soft)' }}>$</span>
                    <input type="number" value={c.budget}
                      onChange={e => dispatch({ type: 'UPDATE_CATEGORY', key: c.key, patch: { budget: parseInt(e.target.value) || 0 } })}
                      style={{ width: 60, font: 'italic 400 22px var(--font-display)', textAlign: 'right',
                        color: 'var(--ink)',
                        background: 'transparent', border: 'none', borderBottom: '1px solid var(--rule)',
                        outline: 'none', padding: '2px 0' }} />
                  </div>
                  <ToggleSwitch on={c.enabled}
                    onChange={v => dispatch({ type: 'UPDATE_CATEGORY', key: c.key, patch: { enabled: v } })} />
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, font: '500 10px var(--font-mono)', letterSpacing: '0.2em', color: 'var(--ink-soft)' }}>
              MONTHLY TOTAL · ${s.categories.filter(c => c.enabled).reduce((a, b) => a + (b.budget || 0), 0)}
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ animation: 'fadeIn 320ms ease' }}>
            <div style={{ font: '500 10px var(--font-mono)', letterSpacing: '0.28em', color: 'var(--ink-soft)', marginBottom: 18 }}>
              STEP 03 · READY
            </div>
            <h1 style={{ font: `400 ${titleSize}px/1.02 var(--font-display)`, margin: 0, letterSpacing: '-0.015em', marginBottom: 28 }}>
              {name ? `Hello, ${name}.` : 'You\u2019re all set.'}
            </h1>
            <p style={{ font: 'italic 400 20px/1.5 var(--font-display)', color: 'var(--ink-soft)',
              maxWidth: 540, marginBottom: 36 }}>
              Tap the <span style={{ display: 'inline-flex', width: 24, height: 24, borderRadius: 99,
                background: 'var(--ink)', color: 'var(--bg)', alignItems: 'center', justifyContent: 'center',
                fontStyle: 'normal', fontSize: 16, verticalAlign: 'middle' }}>+</span> in the corner whenever
              you spend. Days you forget can be marked as <em>closed</em> — Lumen quietly trims your budget so the
              missing days don't haunt the math.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 460 }}>
              <OnbTip number="01" text="Click any day in the calendar to inspect or log to it." />
              <OnbTip number="02" text="Hover a calendar day → × to mark it closed." />
              <OnbTip number="03" text="Edit categories and budgets anytime in Settings." />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 32, borderTop: '1px solid var(--rule)' }}>
        <button onClick={step === 0 ? finish : prev} style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          font: '500 10px var(--font-mono)', letterSpacing: '0.24em', color: 'var(--ink-soft)',
          padding: '10px 0',
        }}>{step === 0 ? 'SKIP' : '← BACK'}</button>
        <button onClick={step === 2 ? finish : next} style={{
          background: 'var(--ink)', color: 'var(--bg)', border: 'none', cursor: 'pointer',
          font: '500 10px var(--font-mono)', letterSpacing: '0.24em',
          padding: '12px 22px', borderRadius: 999,
        }}>{step === 2 ? 'BEGIN' : 'CONTINUE →'}</button>
      </div>
    </div>
  );
}

function OnbTip({ number, text }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr', gap: 14, alignItems: 'baseline',
      padding: '10px 0', borderBottom: '1px solid var(--rule)' }}>
      <span style={{ font: '500 10px var(--font-mono)', letterSpacing: '0.2em', color: 'var(--ink-soft)' }}>{number}</span>
      <span style={{ font: '400 15px/1.5 var(--font-sans)', color: 'var(--ink)' }}>{text}</span>
    </div>
  );
}

Object.assign(window, { Onboarding });
