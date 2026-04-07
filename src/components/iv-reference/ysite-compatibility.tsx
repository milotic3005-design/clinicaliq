'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Search, X, ArrowRightLeft, CheckCircle, XCircle, AlertTriangle, HelpCircle, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import compatibilityData from '@/data/compatibility-pairs.json';

// ── Types ──────────────────────────────────────────────────────────────────
interface CompatibilityDrug {
  id: string;
  name: string;
  genericName: string;
  aliases: string[];
}

type CompatibilityResult = 'C' | 'I' | 'U' | 'N';

interface CompatibilityPair {
  drugA: string;
  drugB: string;
  result: CompatibilityResult;
  concentrationA: string;
  concentrationB: string;
  diluent: string;
  method: string;
  notes: string;
  references: string[];
}

// ── Constants ──────────────────────────────────────────────────────────────
const RESULT_COLORS: Record<CompatibilityResult, { bg: string; text: string; label: string; description: string }> = {
  C: { bg: 'bg-emerald-700', text: 'text-white', label: 'Compatible', description: 'These drugs may be co-administered via Y-site at the tested concentrations.' },
  I: { bg: 'bg-red-700', text: 'text-white', label: 'Incompatible', description: 'Do NOT co-administer via Y-site. Precipitation, color change, or degradation observed.' },
  U: { bg: 'bg-yellow-500', text: 'text-black', label: 'Conditional', description: 'Compatibility depends on specific conditions. Review notes carefully before administration.' },
  N: { bg: 'bg-slate-500', text: 'text-white', label: 'No Data', description: 'No compatibility data found for this pair. Consult pharmacist before Y-site administration.' },
};

const RESULT_ICONS: Record<CompatibilityResult, typeof CheckCircle> = {
  C: CheckCircle,
  I: XCircle,
  U: AlertTriangle,
  N: HelpCircle,
};

const drugs = compatibilityData.drugs as CompatibilityDrug[];
const pairs = compatibilityData.pairs as CompatibilityPair[];

// ── Helpers ────────────────────────────────────────────────────────────────
function lookupCompatibility(idA: string, idB: string): CompatibilityPair[] {
  const matches = pairs.filter(
    (p) => (p.drugA === idA && p.drugB === idB) || (p.drugB === idA && p.drugA === idB)
  );
  if (matches.length === 0) {
    return [{ drugA: idA, drugB: idB, result: 'N', concentrationA: '—', concentrationB: '—', diluent: '—', method: 'Y-site', notes: 'No compatibility data found for this pair. Consult pharmacist before Y-site administration.', references: [] }];
  }
  return matches;
}

// ── Drug Autocomplete Input ────────────────────────────────────────────────
function DrugAutocomplete({ label, id, selected, onSelect, onClear }: {
  label: string; id: string;
  selected: CompatibilityDrug | null;
  onSelect: (d: CompatibilityDrug) => void;
  onClear: () => void;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [suggestions, setSuggestions] = useState<CompatibilityDrug[]>([]);

  const search = useCallback((term: string) => {
    const lower = term.toLowerCase();
    setSuggestions(
      drugs.filter((d) =>
        d.name.toLowerCase().startsWith(lower) ||
        d.genericName.toLowerCase().startsWith(lower) ||
        d.aliases.some((a) => a.toLowerCase().startsWith(lower)) ||
        d.name.toLowerCase().includes(lower) ||
        d.genericName.toLowerCase().includes(lower)
      )
    );
  }, []);

  const handleChange = (val: string) => {
    const sanitized = val.replace(/[<>{}[\]\\]/g, '').slice(0, 100);
    setQuery(sanitized);
    setOpen(true);
    setActiveIdx(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (sanitized.length >= 2) {
      debounceRef.current = setTimeout(() => search(sanitized), 220);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelect = useCallback((drug: CompatibilityDrug) => {
    onSelect(drug);
    setQuery('');
    setSuggestions([]);
    setOpen(false);
    setActiveIdx(-1);
  }, [onSelect]);

  const handleClear = () => {
    onClear();
    setQuery('');
    setSuggestions([]);
    setOpen(false);
    setActiveIdx(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((p) => (p < suggestions.length - 1 ? p + 1 : 0)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx((p) => (p > 0 ? p - 1 : suggestions.length - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (activeIdx >= 0 && suggestions[activeIdx]) handleSelect(suggestions[activeIdx]); }
    else if (e.key === 'Escape') { e.preventDefault(); setOpen(false); setActiveIdx(-1); }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (activeIdx >= 0 && listRef.current) {
      listRef.current.children[activeIdx]?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIdx]);

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  if (selected) {
    return (
      <div className="w-full">
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>
        <div className="flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl border border-emerald-400 bg-emerald-50">
          <span className="flex-1 text-base font-semibold text-emerald-900 truncate">{selected.name}</span>
          <span className="text-xs text-emerald-700 hidden sm:inline truncate max-w-[130px]">{selected.genericName}</span>
          <button onClick={handleClear} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-emerald-700 hover:text-red-600 transition-colors" aria-label={`Remove ${selected.name}`}>
            <X size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative">
        <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden />
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-expanded={open && suggestions.length > 0}
          aria-autocomplete="list"
          aria-controls={`${id}-listbox`}
          aria-activedescendant={activeIdx >= 0 ? `${id}-opt-${activeIdx}` : undefined}
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
          placeholder="Type drug name…"
          className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-[15px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all shadow-sm"
        />
      </div>
      {open && suggestions.length > 0 && (
        <ul ref={listRef} id={`${id}-listbox`} role="listbox" aria-label={`${label} suggestions`} className="absolute z-30 mt-1 w-full max-h-60 overflow-auto rounded-xl border border-slate-200 bg-white shadow-xl">
          {suggestions.map((drug, i) => (
            <li
              key={drug.id}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={i === activeIdx}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(drug)}
              className={cn(
                'min-h-[44px] px-4 py-3 cursor-pointer flex items-center gap-2 text-sm transition-colors',
                i === activeIdx ? 'bg-blue-50 text-blue-900' : 'text-slate-800 hover:bg-slate-50'
              )}
            >
              <span className="font-semibold">{drug.name}</span>
              <span className="text-slate-400 text-xs">{drug.genericName}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export function YSiteCompatibilityChecker() {
  const [drugA, setDrugA] = useState<CompatibilityDrug | null>(null);
  const [drugB, setDrugB] = useState<CompatibilityDrug | null>(null);
  const [results, setResults] = useState<CompatibilityPair[] | null>(null);
  const [sameError, setSameError] = useState(false);

  const check = () => {
    if (!drugA || !drugB) return;
    if (drugA.id === drugB.id) { setSameError(true); setResults(null); return; }
    setResults(lookupCompatibility(drugA.id, drugB.id));
    setSameError(false);
  };

  const swap = () => {
    setDrugA(drugB);
    setDrugB(drugA);
    setResults(null);
    setSameError(false);
  };

  const clearA = () => { setDrugA(null); setResults(null); setSameError(false); };
  const clearB = () => { setDrugB(null); setResults(null); setSameError(false); };

  const primaryResult = results?.[0]?.result as CompatibilityResult | undefined;
  const colorCfg = primaryResult ? RESULT_COLORS[primaryResult] : null;
  const ResultIcon = primaryResult ? RESULT_ICONS[primaryResult] : null;

  const drugCount = useMemo(() => drugs.length, []);

  return (
    <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
        <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-sm">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Y-Site IV Compatibility Checker</h3>
          <p className="text-xs text-slate-500 mt-0.5">{drugCount} IV agents · Trissel&apos;s classification</p>
        </div>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Drug selectors + swap */}
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="flex-1">
            <DrugAutocomplete label="Drug A (Line 1)" id="compat-a" selected={drugA} onSelect={(d) => { setDrugA(d); setResults(null); setSameError(false); }} onClear={clearA} />
          </div>
          <div className="flex items-end justify-center pb-0.5">
            <button
              onClick={swap}
              disabled={!drugA && !drugB}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Swap drugs"
            >
              <ArrowRightLeft size={20} />
            </button>
          </div>
          <div className="flex-1">
            <DrugAutocomplete label="Drug B (Line 2)" id="compat-b" selected={drugB} onSelect={(d) => { setDrugB(d); setResults(null); setSameError(false); }} onClear={clearB} />
          </div>
        </div>

        {sameError && (
          <p role="alert" className="text-sm font-medium text-red-600 text-center">Cannot check a drug against itself. Select two different drugs.</p>
        )}

        <button
          onClick={check}
          disabled={!drugA || !drugB}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm transition-all shadow-sm disabled:cursor-not-allowed"
        >
          Check Y-Site Compatibility
        </button>

        {/* Results */}
        <div aria-live="polite">
          {!results ? (
            <div className="border border-dashed border-slate-200 rounded-xl py-8 text-center text-slate-400 text-sm">
              Select two drugs above and tap Check to see compatibility results.
            </div>
          ) : (
            <div className="space-y-3">
              {/* Primary result banner */}
              {colorCfg && ResultIcon && primaryResult && (
                <div className={cn('rounded-2xl p-5', colorCfg.bg, colorCfg.text)}>
                  <div className="flex items-center gap-3 mb-2">
                    <ResultIcon size={30} className="shrink-0" />
                    <div>
                      <p className="text-base font-bold">{drugA?.name} + {drugB?.name}</p>
                      <span className={cn('inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold mt-1', primaryResult === 'U' ? 'bg-yellow-700 text-white' : 'bg-white/20')}>
                        {colorCfg.label}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm opacity-90">{colorCfg.description}</p>
                </div>
              )}

              {/* Detail cards */}
              {results.map((entry, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      { label: `${drugA?.name} Conc.`, val: entry.concentrationA },
                      { label: `${drugB?.name} Conc.`, val: entry.concentrationB },
                      { label: 'Diluent', val: entry.diluent },
                      { label: 'Method', val: entry.method },
                    ].map(({ label, val }) => (
                      <div key={label}>
                        <span className="block text-xs text-slate-500 font-semibold uppercase tracking-wide">{label}</span>
                        <span className="block text-slate-800 font-medium mt-0.5">{val || '—'}</span>
                      </div>
                    ))}
                  </div>
                  {entry.notes && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <p className="text-xs font-semibold text-slate-600 mb-1">Clinical Notes</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{entry.notes}</p>
                    </div>
                  )}
                  {entry.references.length > 0 && (
                    <p className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-400">{entry.references.join('; ')}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-xs text-slate-400 text-center">
          Data modeled after Trissel&apos;s Handbook on Injectable Drugs · Educational use only
        </p>
      </div>
    </div>
  );
}
