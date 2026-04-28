// Central app store — shared between Dashboard, Settings, Onboarding.
// Backed by React.useReducer so all artboards on the same page render in lockstep.

const StoreCtx = React.createContext(null);

const initialStore = () => ({
  expenses: SEED_EXPENSES,
  categories: CATEGORIES_INIT,
  closedDays: [], // day-of-month numbers in current month
  year: TODAY.year,
  month: TODAY.month,
  selectedDay: TODAY.day,
  // settings
  budgetsEnabled: true,            // when false: no category budgets, single monthly cap
  monthlyCap: 900,                 // used when budgetsEnabled = false
  darkMode: false,                 // overrides palette via class
  // routing
  route: 'dashboard', // 'dashboard' | 'settings' | 'onboarding'
});

function storeReducer(s, a) {
  switch (a.type) {
    case 'SET_ROUTE':       return { ...s, route: a.route };
    case 'SET_DAY':         return { ...s, selectedDay: a.day };
    case 'GO_TODAY':        return { ...s, selectedDay: TODAY.day, year: TODAY.year, month: TODAY.month };
    case 'TOGGLE_BUDGETS':  return { ...s, budgetsEnabled: !s.budgetsEnabled };
    case 'SET_BUDGETS':     return { ...s, budgetsEnabled: a.value };
    case 'SET_MONTHLY_CAP': return { ...s, monthlyCap: a.value };
    case 'TOGGLE_DARK':     return { ...s, darkMode: !s.darkMode };
    case 'PREV_MONTH':      return s.month === 0 ? { ...s, month: 11, year: s.year - 1 } : { ...s, month: s.month - 1 };
    case 'NEXT_MONTH':      return s.month === 11 ? { ...s, month: 0, year: s.year + 1 } : { ...s, month: s.month + 1 };
    case 'ADD_EXPENSE':     return { ...s, expenses: [{ id: 'e' + Math.random().toString(36).slice(2,8), ...a.expense }, ...s.expenses] };
    case 'UPDATE_EXPENSE':  return { ...s, expenses: s.expenses.map(e => e.id === a.id ? { ...e, ...a.patch } : e) };
    case 'DELETE_EXPENSE':  return { ...s, expenses: s.expenses.filter(e => e.id !== a.id) };
    case 'TOGGLE_CLOSED':   {
      const has = s.closedDays.includes(a.day);
      return { ...s, closedDays: has ? s.closedDays.filter(d => d !== a.day) : [...s.closedDays, a.day].sort((x,y)=>x-y) };
    }
    case 'CLOSE_GAPS': {
      // Close all past days (≤ today) that have no expenses and aren't already closed
      const byDay = expensesByDay(s.expenses);
      const toClose = [];
      for (let d = 1; d <= TODAY.day; d++) {
        if (!byDay[d] && !s.closedDays.includes(d)) toClose.push(d);
      }
      return { ...s, closedDays: [...new Set([...s.closedDays, ...toClose])].sort((x,y)=>x-y) };
    }
    case 'ADD_CATEGORY':    return { ...s, categories: [...s.categories, a.category] };
    case 'UPDATE_CATEGORY': return { ...s, categories: s.categories.map(c => c.key === a.key ? { ...c, ...a.patch } : c) };
    case 'REMOVE_CATEGORY': return { ...s, categories: s.categories.filter(c => c.key !== a.key) };
    case 'REORDER_CATS':    return { ...s, categories: a.categories };
    default: return s;
  }
}

function StoreProvider({ children }) {
  const [state, dispatch] = React.useReducer(storeReducer, undefined, initialStore);
  return <StoreCtx.Provider value={[state, dispatch]}>{children}</StoreCtx.Provider>;
}

function useStore() { return React.useContext(StoreCtx); }

// Derived helpers
function useDerived() {
  const [s] = useStore();
  const enabledKeys = React.useMemo(() => new Set(s.categories.filter(c => c.enabled).map(c => c.key)), [s.categories]);
  const visibleExpenses = React.useMemo(() => s.expenses.filter(e => enabledKeys.has(e.cat)), [s.expenses, enabledKeys]);
  const byDay = React.useMemo(() => expensesByDay(s.expenses, enabledKeys), [s.expenses, enabledKeys]);
  const totals = React.useMemo(() => totalsByCategory(s.expenses, s.categories), [s.expenses, s.categories]);
  const monthTotal = totals.reduce((a, b) => a + b.amount, 0);
  const sumOfCats = s.categories.filter(c => c.enabled).reduce((a, b) => a + (b.budget || 0), 0);
  const totalBudget = s.budgetsEnabled ? sumOfCats : (s.monthlyCap || 0);
  const dim = daysInMonth(s.year, s.month);
  const dayRate = totalBudget / dim;
  const effBudget = totalBudget - dayRate * s.closedDays.length;
  const trackedDays = TODAY.day - s.closedDays.filter(d => d <= TODAY.day).length;
  const expectedSoFar = dayRate * Math.max(0, trackedDays);
  // Today-only spend
  const selDayExpenses = (byDay[s.selectedDay] || []);
  const selDayTotal    = selDayExpenses.reduce((a, b) => a + b.amount, 0);
  const dailyDelta     = selDayTotal - dayRate; // positive = over today
  const monthDelta     = monthTotal - expectedSoFar; // positive = over pace
  const catByKey = Object.fromEntries(s.categories.map(c => [c.key, c]));
  return { ...s, byDay, totals, monthTotal, totalBudget, effBudget, dim, dayRate,
    expectedSoFar, trackedDays, catByKey, enabledKeys, visibleExpenses,
    selDayTotal, dailyDelta, monthDelta };
}

Object.assign(window, { StoreCtx, StoreProvider, useStore, useDerived, initialStore });
