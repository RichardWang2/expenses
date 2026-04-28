// Shared expense data + helpers.

const CATEGORIES_INIT = [
  { key: 'groceries', label: 'Groceries', color: '#7d8a4a', budget: 280, enabled: true },
  { key: 'food',      label: 'Food',      color: '#9b3c3c', budget: 220, enabled: true },
  { key: 'gas',       label: 'Gas',       color: '#5b6b85', budget: 160, enabled: true },
  { key: 'shopping',  label: 'Shopping',  color: '#7a4a6b', budget: 160, enabled: true },
  { key: 'other',     label: 'Other',     color: '#b8853a', budget:  80, enabled: true },
];

const PALETTE_POOL = [
  '#7d8a4a', '#9b3c3c', '#5b6b85', '#7a4a6b', '#b8853a',
  '#3f6b62', '#a8632b', '#4f5a78', '#8a5a8a', '#5a7a4d',
];

const SEED_EXPENSES = [
  { id: 'e1',  day: 5,  cat: 'groceries', label: 'Whole Foods',         amount: 65 },
  { id: 'e2',  day: 5,  cat: 'food',      label: 'Brunch \u2014 cafe',  amount: 10 },
  { id: 'e3',  day: 8,  cat: 'shopping',  label: 'Bookstore',           amount: 25 },
  { id: 'e4',  day: 12, cat: 'other',     label: 'Pharmacy',            amount: 8  },
  { id: 'e5',  day: 12, cat: 'gas',       label: 'Shell station',       amount: 22 },
  { id: 'e6',  day: 15, cat: 'groceries', label: 'Trader Joe\u2019s',   amount: 30 },
  { id: 'e7',  day: 15, cat: 'food',      label: 'Dinner \u2014 Lupa',  amount: 20 },
  { id: 'e8',  day: 20, cat: 'gas',       label: 'BP',                  amount: 38 },
  { id: 'e9',  day: 20, cat: 'food',      label: 'Lunch \u2014 sushi',  amount: 22 },
  { id: 'e10', day: 23, cat: 'food',      label: 'Coffee + pastry',     amount: 14 },
  { id: 'e11', day: 27, cat: 'food',      label: 'Coffee + bagel',      amount: 15 },
  { id: 'e12', day: 27, cat: 'shopping',  label: 'Shoes',               amount: 32 },
];

const TODAY = { year: 2026, month: 3, day: 27 };
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DOW_SHORT  = ['S','M','T','W','T','F','S'];
const DOW_FULL   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function fmtMoney(n) { if (n == null) return ''; return `$${Math.round(n).toLocaleString('en-US')}`; }
function daysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function firstDayOfMonth(year, month) { return new Date(year, month, 1).getDay(); }

function expensesByDay(expenses, enabledKeys) {
  const byDay = {};
  for (const e of expenses) {
    if (enabledKeys && !enabledKeys.has(e.cat)) continue;
    (byDay[e.day] ||= []).push(e);
  }
  return byDay;
}

function totalsByCategory(expenses, categories) {
  const enabled = categories.filter(c => c.enabled);
  const totals = Object.fromEntries(enabled.map(c => [c.key, 0]));
  for (const e of expenses) if (totals[e.cat] != null) totals[e.cat] += e.amount;
  const total = Object.values(totals).reduce((a, b) => a + b, 0);
  return enabled.map(c => ({
    ...c,
    amount: totals[c.key] || 0,
    pct: total ? (totals[c.key] || 0) / total : 0,
  }));
}

function dominantCatForDay(dayExpenses, byKey) {
  if (!dayExpenses?.length) return null;
  const acc = {};
  for (const e of dayExpenses) acc[e.cat] = (acc[e.cat] || 0) + e.amount;
  let best = null, bestAmt = -1;
  for (const [k, v] of Object.entries(acc)) if (v > bestAmt) { best = k; bestAmt = v; }
  return byKey[best];
}

// Effective budget after subtracting closed days (per-day rate × #closed)
function effectiveBudget(totalBudget, dim, closedDays) {
  const rate = totalBudget / dim;
  return totalBudget - rate * (closedDays?.length || 0);
}

Object.assign(window, {
  CATEGORIES_INIT, PALETTE_POOL, SEED_EXPENSES, TODAY,
  MONTH_NAMES, DOW_SHORT, DOW_FULL,
  fmtMoney, daysInMonth, firstDayOfMonth, expensesByDay, totalsByCategory, dominantCatForDay,
  effectiveBudget,
});
