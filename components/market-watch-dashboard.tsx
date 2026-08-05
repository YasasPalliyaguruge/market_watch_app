'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Info,
  Plus,
  RefreshCcw,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from 'lucide-react';

type WatchItem = {
  id: string;
  symbol: string;
  name: string;
  entryPrice: number;
  currentPrice: number;
  shares: number;
  targetPrice: number;
  note: string;
  updatedAt: string;
};

type DraftItem = {
  symbol: string;
  name: string;
  entryPrice: string;
  currentPrice: string;
  shares: string;
  targetPrice: string;
  note: string;
};

const STORAGE_KEY = 'market-watch-local-watchlist-v1';
const EMPTY_DRAFT: DraftItem = {
  symbol: '',
  name: '',
  entryPrice: '',
  currentPrice: '',
  shares: '0',
  targetPrice: '',
  note: '',
};

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

const percent = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function isWatchItem(value: unknown): value is WatchItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<WatchItem>;
  return (
    typeof item.id === 'string' &&
    typeof item.symbol === 'string' &&
    typeof item.name === 'string' &&
    typeof item.entryPrice === 'number' &&
    Number.isFinite(item.entryPrice) &&
    typeof item.currentPrice === 'number' &&
    Number.isFinite(item.currentPrice) &&
    typeof item.shares === 'number' &&
    Number.isFinite(item.shares) &&
    typeof item.targetPrice === 'number' &&
    Number.isFinite(item.targetPrice) &&
    typeof item.note === 'string' &&
    typeof item.updatedAt === 'string'
  );
}

function readNumber(value: string, label: string, allowZero = false): number {
  const parsed = Number(value);
  const valid = Number.isFinite(parsed) && (allowZero ? parsed >= 0 : parsed > 0);
  if (!valid) {
    throw new Error(`${label} must be ${allowZero ? 'zero or greater' : 'greater than zero'}.`);
  }
  return parsed;
}

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `watch-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function MarketWatchDashboard() {
  const [items, setItems] = useState<WatchItem[]>([]);
  const [draft, setDraft] = useState<DraftItem>(EMPTY_DRAFT);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.every(isWatchItem)) {
          setItems(parsed);
        } else {
          setNotice('Saved watchlist data was invalid, so the app opened with a clean list.');
        }
      }
    } catch {
      setNotice('The saved watchlist could not be read. Your browser may be blocking local storage.');
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      setNotice('Changes are visible now but could not be saved in this browser.');
    }
  }, [items, ready]);

  const totals = useMemo(() => {
    return items.reduce(
      (summary, item) => {
        const cost = item.entryPrice * item.shares;
        const value = item.currentPrice * item.shares;
        const targetValue = item.targetPrice * item.shares;
        summary.cost += cost;
        summary.value += value;
        summary.targetValue += targetValue;
        return summary;
      },
      { cost: 0, value: 0, targetValue: 0 },
    );
  }, [items]);

  const totalProfit = totals.value - totals.cost;
  const totalProfitPercent = totals.cost > 0 ? totalProfit / totals.cost : 0;

  const addItem = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setNotice('');

    try {
      const symbol = draft.symbol.trim().toUpperCase();
      if (!symbol || !/^[A-Z0-9.-]{1,12}$/.test(symbol)) {
        throw new Error('Enter a symbol using letters, numbers, dots or hyphens.');
      }
      if (items.some((item) => item.symbol === symbol)) {
        throw new Error(`${symbol} is already in the watchlist.`);
      }

      const item: WatchItem = {
        id: createId(),
        symbol,
        name: draft.name.trim() || symbol,
        entryPrice: readNumber(draft.entryPrice, 'Entry price'),
        currentPrice: readNumber(draft.currentPrice, 'Current price'),
        shares: readNumber(draft.shares, 'Quantity', true),
        targetPrice: readNumber(draft.targetPrice, 'Target price'),
        note: draft.note.trim(),
        updatedAt: new Date().toISOString(),
      };

      setItems((current) => [item, ...current]);
      setDraft(EMPTY_DRAFT);
      setNotice(`${symbol} was added. Values are stored only in this browser.`);
    } catch (addError) {
      setError(addError instanceof Error ? addError.message : 'Unable to add this item.');
    }
  };

  const updateItem = (id: string, field: 'currentPrice' | 'targetPrice' | 'shares', value: string) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return;
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, [field]: parsed, updatedAt: new Date().toISOString() }
          : item,
      ),
    );
  };

  const removeItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const clearWatchlist = () => {
    if (!window.confirm('Clear every locally saved watchlist item?')) return;
    setItems([]);
    setNotice('The local watchlist was cleared.');
  };

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container py-10 md:py-16">
        <header className="mb-10 flex flex-col gap-6 border-b border-gray-700 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-yellow-400">
              Local portfolio workspace
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl">Market Watch</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-400 md:text-lg">
              Record your own reference prices, quantities and targets. The calculations update instantly and stay in this browser.
            </p>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-sm text-yellow-100 lg:max-w-sm">
            <Info className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <p>No live market feed is connected. Prices are entered manually and are not investment advice.</p>
          </div>
        </header>

        <section aria-label="Portfolio summary" className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard icon={WalletCards} label="Tracked assets" value={String(items.length)} />
          <SummaryCard icon={Target} label="Current value" value={money.format(totals.value)} />
          <SummaryCard
            icon={totalProfit >= 0 ? TrendingUp : TrendingDown}
            label="Unrealized result"
            value={`${money.format(totalProfit)} (${percent.format(totalProfitPercent)})`}
            positive={totalProfit >= 0}
          />
          <SummaryCard icon={Target} label="Value at targets" value={money.format(totals.targetValue)} />
        </section>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.8fr)]">
          <section aria-labelledby="watchlist-heading" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 id="watchlist-heading" className="text-2xl font-bold text-white">Watchlist</h2>
                <p className="mt-1 text-sm text-gray-500">All amounts are displayed in USD without currency conversion.</p>
              </div>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clearWatchlist}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-600 px-3 py-2 text-sm text-gray-300 transition hover:border-red-500/60 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                >
                  <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                  Clear list
                </button>
              )}
            </div>

            {!ready ? (
              <div className="rounded-2xl border border-gray-700 bg-gray-800 p-8 text-center text-gray-400">Loading local watchlist…</div>
            ) : items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-600 bg-gray-800/70 p-10 text-center">
                <WalletCards className="mx-auto h-12 w-12 text-gray-500" aria-hidden="true" />
                <h3 className="mt-4 text-xl font-semibold text-white">No assets added</h3>
                <p className="mx-auto mt-2 max-w-md text-gray-400">Use the form to create a private, manually maintained watchlist.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => {
                  const cost = item.entryPrice * item.shares;
                  const value = item.currentPrice * item.shares;
                  const result = value - cost;
                  const resultPercent = cost > 0 ? result / cost : 0;
                  const targetUpside = item.currentPrice > 0 ? item.targetPrice / item.currentPrice - 1 : 0;

                  return (
                    <article key={item.id} className="rounded-2xl border border-gray-700 bg-gray-800 p-5 shadow-xl shadow-black/10">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="rounded-lg bg-yellow-400 px-2.5 py-1 text-sm font-bold text-gray-950">{item.symbol}</span>
                            <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                          </div>
                          <p className="mt-2 text-sm text-gray-500">Entry {money.format(item.entryPrice)} · Cost {money.format(cost)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.symbol}`}
                          className="rounded-lg p-2 text-gray-500 transition hover:bg-red-500/10 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                        >
                          <Trash2 className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </div>

                      <div className="mt-5 grid gap-4 sm:grid-cols-3">
                        <EditableMetric label="Current price" value={item.currentPrice} onChange={(value) => updateItem(item.id, 'currentPrice', value)} />
                        <EditableMetric label="Quantity" value={item.shares} onChange={(value) => updateItem(item.id, 'shares', value)} step="0.001" />
                        <EditableMetric label="Target price" value={item.targetPrice} onChange={(value) => updateItem(item.id, 'targetPrice', value)} />
                      </div>

                      <div className="mt-5 grid gap-3 rounded-xl bg-gray-900/70 p-4 sm:grid-cols-3">
                        <ResultMetric label="Position value" value={money.format(value)} />
                        <ResultMetric
                          label="Unrealized result"
                          value={`${money.format(result)} · ${percent.format(resultPercent)}`}
                          tone={result >= 0 ? 'positive' : 'negative'}
                        />
                        <ResultMetric
                          label="Target distance"
                          value={percent.format(targetUpside)}
                          tone={targetUpside >= 0 ? 'positive' : 'negative'}
                        />
                      </div>

                      {item.note && <p className="mt-4 border-l-2 border-yellow-400/50 pl-3 text-sm text-gray-400">{item.note}</p>}
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <aside className="h-fit rounded-2xl border border-gray-700 bg-gray-800 p-6 shadow-2xl shadow-black/20 xl:sticky xl:top-6">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-yellow-400">Add asset</p>
              <h2 className="mt-2 text-2xl font-bold text-white">New watchlist item</h2>
              <p className="mt-2 text-sm leading-6 text-gray-400">Enter your own reference values. They can be edited later from the watchlist.</p>
            </div>

            <form onSubmit={addItem} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                <Field label="Symbol" value={draft.symbol} onChange={(value) => setDraft((current) => ({ ...current, symbol: value }))} placeholder="AAPL" required />
                <Field label="Name" value={draft.name} onChange={(value) => setDraft((current) => ({ ...current, name: value }))} placeholder="Apple" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                <Field label="Entry price" type="number" value={draft.entryPrice} onChange={(value) => setDraft((current) => ({ ...current, entryPrice: value }))} placeholder="100.00" required />
                <Field label="Current price" type="number" value={draft.currentPrice} onChange={(value) => setDraft((current) => ({ ...current, currentPrice: value }))} placeholder="108.50" required />
                <Field label="Quantity" type="number" value={draft.shares} onChange={(value) => setDraft((current) => ({ ...current, shares: value }))} placeholder="0" />
                <Field label="Target price" type="number" value={draft.targetPrice} onChange={(value) => setDraft((current) => ({ ...current, targetPrice: value }))} placeholder="120.00" required />
              </div>
              <label className="block text-sm font-medium text-gray-300">
                Note
                <textarea
                  value={draft.note}
                  onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value.slice(0, 240) }))}
                  rows={3}
                  placeholder="Why this asset is being watched"
                  className="mt-2 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white placeholder:text-gray-600 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20"
                />
              </label>

              {error && <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
              {notice && <p role="status" className="rounded-lg bg-teal-400/10 px-3 py-2 text-sm text-teal-300">{notice}</p>}

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-400 px-4 py-3 font-semibold text-gray-950 transition hover:bg-yellow-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800"
              >
                <Plus className="h-5 w-5" aria-hidden="true" />
                Add to watchlist
              </button>
            </form>
          </aside>
        </div>
      </div>
    </main>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  positive,
}: {
  icon: typeof WalletCards;
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-gray-700 bg-gray-800 p-5">
      <div className="flex items-center gap-3 text-gray-400">
        <Icon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className={`mt-4 break-words text-2xl font-bold ${positive === false ? 'text-red-300' : positive === true ? 'text-teal-300' : 'text-white'}`}>{value}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: 'text' | 'number';
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-gray-300">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        min={type === 'number' ? 0 : undefined}
        step={type === 'number' ? '0.01' : undefined}
        className="mt-2 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white placeholder:text-gray-600 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20"
      />
    </label>
  );
}

function EditableMetric({
  label,
  value,
  onChange,
  step = '0.01',
}: {
  label: string;
  value: number;
  onChange: (value: string) => void;
  step?: string;
}) {
  return (
    <label className="text-sm font-medium text-gray-400">
      {label}
      <input
        type="number"
        min="0"
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20"
      />
    </label>
  );
}

function ResultMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'positive' | 'negative';
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-1 font-semibold ${tone === 'positive' ? 'text-teal-300' : tone === 'negative' ? 'text-red-300' : 'text-white'}`}>{value}</p>
    </div>
  );
}
