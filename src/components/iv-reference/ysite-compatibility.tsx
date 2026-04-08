'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  Search, X, ArrowRightLeft, CheckCircle, XCircle,
  AlertTriangle, HelpCircle, ShieldCheck, Globe, Sparkles, Database,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import compatibilityData from '@/data/compatibility-pairs.json';
import type { YSiteResult } from '@/app/api/v1/ysite-search/route';

// ── Types ──────────────────────────────────────────────────────────────────
interface CompatibilityDrug {
  id: string;
  name: string;
  genericName: string;
  aliases: string[];
  isCustom?: false;
}

interface CustomDrug {
  id: string;       // same as name, lowercased
  name: string;
  isCustom: true;
}

type DrugInput = CompatibilityDrug | CustomDrug;

type CompatibilityResult = 'C' | 'I' | 'U' | 'N';

interface CompatibilityPair {
  drugA: string; drugB: string;
  result: CompatibilityResult;
  concentrationA: string; concentrationB: string;
  diluent: string; method: string;
  notes: string; references: string[];
}

// ── Constants ──────────────────────────────────────────────────────────────
const RESULT_COLORS: Record<CompatibilityResult, { bg: string; text: string; label: string; description: string }> = {
  C: { bg: 'bg-emerald-700', text: 'text-white', label: 'Compatible', description: 'These drugs may be co-administered via Y-site at the tested concentrations.' },
  I: { bg: 'bg-red-700', text: 'text-white', label: 'Incompatible', description: 'Do NOT co-administer via Y-site. Precipitation, color change, or degradation observed.' },
  U: { bg: 'bg-yellow-500', text: 'text-black', label: 'Conditional', description: 'Compatibility depends on specific conditions. Review notes carefully before administration.' },
  N: { bg: 'bg-slate-500', text: 'text-white', label: 'No Data', description: 'No compatibility data found for this pair. Consult pharmacist before Y-site administration.' },
};

const RESULT_ICONS: Record<CompatibilityResult, typeof CheckCircle> = {
  C: CheckCircle, I: XCircle, U: AlertTriangle, N: HelpCircle,
};

const drugs = compatibilityData.drugs as CompatibilityDrug[];
const pairs = compatibilityData.pairs as CompatibilityPair[];

// ── Helpers ────────────────────────────────────────────────────────────────
function lookupCompatibility(idA: string, idB: string): CompatibilityPair[] {
  const matches = pairs.filter(
    (p) => (p.drugA === idA && p.drugB === idB) || (p.drugB === idA && p.drugA === idB)
  );
  if (matches.length === 0) {
    return [{ drugA: idA, drugB: idB, result: 'N', concentrationA: '—', concentrationB: '—', diluent: '—', method: 'Y-site', notes: 'No compatibility data in local database. Use AI Search for online lookup.', references: [] }];
  }
  return matches;
}

function isLocalDrug(d: DrugInput): d is CompatibilityDrug { return !d.isCustom; }

// ── Drug Autocomplete Input ────────────────────────────────────────────────
function DrugAutocomplete({ label, id, selected, onSelect, onClear }: {
  label: string; id: string;
  selected: DrugInput | null;
  onSelect: (d: DrugInput) => void;
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
      ).slice(0, 8)
    );
  }, []);

  const handleChange = (val: string) => {
    const sanitized = val.replace(/[<>{}[\]\\]/g, '').slice(0, 100);
    setQuery(sanitized);
    setOpen(true);
    setActiveIdx(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (sanitized.length >= 2) {
      debounceRef.current = setTimeout(() => search(sanitized), 200);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelect = useCallback((drug: DrugInput) => {
    onSelect(drug);
    setQuery('');
    setSuggestions([]);
    setOpen(false);
    setActiveIdx(-1);
  }, [onSelect]);

  const handleUseCustom = () => {
    if (!query.trim()) return;
    handleSelect({ id: query.trim().toLowerCase(), name: query.trim(), isCustom: true });
  };

  const handleClear = () => {
    onClear();
    setQuery('');
    setSuggestions([]);
    setOpen(false);
    setActiveIdx(-1);
    inputRef.current?.focus();
  };

  // Total list items: suggestions + (maybe) custom option
  const showCustom = query.trim().length >= 2;
  const totalItems = suggestions.length + (showCustom ? 1 : 0);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || totalItems === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((p) => (p < totalItems - 1 ? p + 1 : 0)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx((p) => (p > 0 ? p - 1 : totalItems - 1)); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0 && activeIdx < suggestions.length) handleSelect(suggestions[activeIdx]);
      else if (activeIdx === suggestions.length && showCustom) handleUseCustom();
      else if (showCustom) handleUseCustom(); // Enter with no selection uses custom
    }
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
        <div className={cn(
          'flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl border',
          isLocalDrug(selected)
            ? 'border-emerald-400 bg-emerald-50'
            : 'border-blue-400 bg-blue-50'
        )}>
          <span className={cn('flex-1 text-base font-semibold truncate', isLocalDrug(selected) ? 'text-emerald-900' : 'text-blue-900')}>
            {selected.name}
          </span>
          {isLocalDrug(selected)
            ? <span className="text-xs text-emerald-700 hidden sm:inline truncate max-w-[120px] flex items-center gap-1"><Database size={10} className="inline" /> Local DB</span>
            : <span className="text-xs text-blue-600 hidden sm:inline flex items-center gap-1"><Globe size={10} className="inline" /> AI Search</span>
          }
          <button onClick={handleClear} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-500 hover:text-red-600 transition-colors" aria-label={`Remove ${selected.name}`}>
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
          aria-expanded={open && totalItems > 0}
          aria-autocomplete="list"
          aria-controls={`${id}-listbox`}
          aria-activedescendant={activeIdx >= 0 ? `${id}-opt-${activeIdx}` : undefined}
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (totalItems > 0) setOpen(true); }}
          placeholder="Any drug name…"
          className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-[15px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all shadow-sm"
        />
      </div>
      {open && totalItems > 0 && (
        <ul ref={listRef} id={`${id}-listbox`} role="listbox" aria-label={`${label} suggestions`}
          className="absolute z-30 mt-1 w-full max-h-64 overflow-auto rounded-xl border border-slate-200 bg-white shadow-xl"
        >
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
              <Database size={12} className="text-emerald-500 shrink-0" />
              <span className="font-semibold">{drug.name}</span>
              <span className="text-slate-400 text-xs">{drug.genericName}</span>
            </li>
          ))}
          {showCustom && (
            <li
              id={`${id}-opt-${suggestions.length}`}
              role="option"
              aria-selected={activeIdx === suggestions.length}
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleUseCustom}
              className={cn(
                'min-h-[44px] px-4 py-3 cursor-pointer flex items-center gap-2 text-sm transition-colors border-t border-slate-100',
                activeIdx === suggestions.length ? 'bg-blue-50 text-blue-900' : 'text-blue-700 hover:bg-blue-50'
              )}
            >
              <Globe size={13} className="shrink-0 text-blue-500" />
              <span className="font-semibold">Use &ldquo;{query.trim()}&rdquo;</span>
              <span className="text-xs text-blue-400 ml-auto">AI Search</span>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

// ── Confidence Badge ───────────────────────────────────────────────────────
function ConfidenceBadge({ confidence }: { confidence: string }) {
  const cfg = {
    high:     { color: 'text-emerald-700 bg-emerald-50 border-emerald-200', label: 'High confidence' },
    moderate: { color: 'text-yellow-700 bg-yellow-50 border-yellow-200',   label: 'Moderate confidence' },
    low:      { color: 'text-slate-500  bg-slate-50  border-slate-200',    label: 'Low confidence — verify' },
  }[confidence] ?? { color: 'text-slate-500 bg-slate-50 border-slate-200', label: confidence };
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border', cfg.color)}>
      {cfg.label}
    </span>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export function YSiteCompatibilityChecker() {
  const [drugA, setDrugA] = useState<DrugInput | null>(null);
  const [drugB, setDrugB] = useState<DrugInput | null>(null);
  const [localResults, setLocalResults]   = useState<CompatibilityPair[] | null>(null);
  const [aiResult, setAiResult]           = useState<YSiteResult | null>(null);
  const [aiLoading, setAiLoading]         = useState(false);
  const [aiError, setAiError]             = useState<string | null>(null);
  const [sameError, setSameError]         = useState(false);

  const needsAiSearch = useMemo(() => {
    if (!drugA || !drugB) return false;
    if (drugA.isCustom || drugB?.isCustom) return true;
    // Both local but pair has no data
    if (localResults && localResults[0]?.result === 'N') return true;
    return false;
  }, [drugA, drugB, localResults]);

  const check = () => {
    if (!drugA || !drugB) return;
    if (drugA.name.toLowerCase() === drugB.name.toLowerCase()) { setSameError(true); setLocalResults(null); setAiResult(null); return; }
    setSameError(false);
    setAiResult(null);
    setAiError(null);

    if (!drugA.isCustom && !drugB.isCustom) {
      // Both are in local DB — do local lookup
      const res = lookupCompatibility(drugA.id, drugB.id);
      setLocalResults(res);
    } else {
      // At least one is custom — skip local, go straight to AI
      setLocalResults(null);
      runAiSearch(drugA.name, drugB.name);
    }
  };

  const runAiSearch = async (nameA: string, nameB: string) => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch('/api/v1/ysite-search', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ drugA: nameA, drugB: nameB }),
      });
      const data = await res.json() as YSiteResult & { error?: string };
      if (!res.ok || data.error) {
        setAiError(data.error ?? 'AI search failed. Try again.');
      } else {
        setAiResult(data);
      }
    } catch {
      setAiError('Network error. Check your connection and try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const swap = () => {
    setDrugA(drugB);
    setDrugB(drugA);
    setLocalResults(null);
    setAiResult(null);
    setAiError(null);
    setSameError(false);
  };

  const clearA = () => { setDrugA(null); setLocalResults(null); setAiResult(null); setAiError(null); setSameError(false); };
  const clearB = () => { setDrugB(null); setLocalResults(null); setAiResult(null); setAiError(null); setSameError(false); };

  // Determine active result to display
  const displayResult: CompatibilityResult | undefined =
    aiResult?.result ?? (localResults?.[0]?.result as CompatibilityResult | undefined);
  const colorCfg  = displayResult ? RESULT_COLORS[displayResult] : null;
  const ResultIcon = displayResult ? RESULT_ICONS[displayResult] : null;

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
          <p className="text-xs text-slate-500 mt-0.5">
            {drugCount} drugs local · <span className="text-blue-600 font-medium">Any drug via AI Search</span>
          </p>
        </div>
      </div>

      <div className="px-6 py-5 space-y-4">
        {/* Drug selectors + swap */}
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="flex-1">
            <DrugAutocomplete label="Drug A (Line 1)" id="compat-a"
              selected={drugA}
              onSelect={(d) => { setDrugA(d); setLocalResults(null); setAiResult(null); setAiError(null); setSameError(false); }}
              onClear={clearA}
            />
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
            <DrugAutocomplete label="Drug B (Line 2)" id="compat-b"
              selected={drugB}
              onSelect={(d) => { setDrugB(d); setLocalResults(null); setAiResult(null); setAiError(null); setSameError(false); }}
              onClear={clearB}
            />
          </div>
        </div>

        {/* Hint */}
        <p className="text-xs text-slate-400 text-center">
          Select from local database or type any drug name and choose &ldquo;Use … (AI Search)&rdquo;
        </p>

        {sameError && (
          <p role="alert" className="text-sm font-medium text-red-600 text-center">
            Cannot check a drug against itself. Select two different drugs.
          </p>
        )}

        <button
          onClick={check}
          disabled={!drugA || !drugB || aiLoading}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm transition-all shadow-sm disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {aiLoading
            ? <><span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Searching AI…</>
            : 'Check Y-Site Compatibility'
          }
        </button>

        {/* Results area */}
        <div aria-live="polite">
          {/* Empty state */}
          {!localResults && !aiResult && !aiLoading && !aiError && (
            <div className="border border-dashed border-slate-200 rounded-xl py-8 text-center text-slate-400 text-sm">
              Select two drugs above and tap Check to see compatibility results.
            </div>
          )}

          {/* AI loading */}
          {aiLoading && (
            <div className="border border-blue-100 bg-blue-50 rounded-xl py-8 text-center">
              <Sparkles size={22} className="mx-auto text-blue-400 mb-2 animate-pulse" />
              <p className="text-sm text-blue-700 font-medium">Searching pharmaceutical literature…</p>
              <p className="text-xs text-blue-400 mt-1">Powered by Gemini 3 · Trissel&apos;s / King Guide data</p>
            </div>
          )}

          {/* AI error */}
          {aiError && !aiLoading && (
            <div className="border border-red-200 bg-red-50 rounded-xl p-4 text-center space-y-2">
              <p className="text-sm text-red-700 font-medium">{aiError}</p>
              <button
                onClick={() => runAiSearch(drugA!.name, drugB!.name)}
                className="text-xs text-blue-600 underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* Local DB results */}
          {localResults && !aiResult && !aiLoading && (
            <div className="space-y-3">
              {colorCfg && ResultIcon && displayResult && (
                <div className={cn('rounded-2xl p-5', colorCfg.bg, colorCfg.text)}>
                  <div className="flex items-center gap-3 mb-2">
                    <ResultIcon size={30} className="shrink-0" />
                    <div>
                      <p className="text-base font-bold">{drugA?.name} + {drugB?.name}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={cn('inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold', displayResult === 'U' ? 'bg-yellow-700 text-white' : 'bg-white/20')}>
                          {colorCfg.label}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-white/15">
                          <Database size={10} /> Local Database
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm opacity-90">{colorCfg.description}</p>
                </div>
              )}

              {localResults.map((entry, i) => (
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

              {/* Offer AI search if result is N */}
              {needsAiSearch && (
                <button
                  onClick={() => runAiSearch(drugA!.name, drugB!.name)}
                  className="w-full py-2.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles size={15} />
                  Not in local database — Search with AI
                </button>
              )}
            </div>
          )}

          {/* AI result */}
          {aiResult && !aiLoading && (
            <div className="space-y-3">
              {colorCfg && ResultIcon && displayResult && (
                <div className={cn('rounded-2xl p-5', colorCfg.bg, colorCfg.text)}>
                  <div className="flex items-center gap-3 mb-2">
                    <ResultIcon size={30} className="shrink-0" />
                    <div>
                      <p className="text-base font-bold">{aiResult.drugA} + {aiResult.drugB}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={cn('inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold', displayResult === 'U' ? 'bg-yellow-700 text-white' : 'bg-white/20')}>
                          {colorCfg.label}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-white/15">
                          <Sparkles size={10} /> AI-sourced
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm opacity-90">{colorCfg.description}</p>
                </div>
              )}

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    { label: `${aiResult.drugA} Conc.`, val: aiResult.concentrationA },
                    { label: `${aiResult.drugB} Conc.`, val: aiResult.concentrationB },
                    { label: 'Diluent', val: aiResult.diluent },
                  ].map(({ label, val }) => (
                    <div key={label}>
                      <span className="block text-xs text-slate-500 font-semibold uppercase tracking-wide">{label}</span>
                      <span className="block text-slate-800 font-medium mt-0.5">{val || '—'}</span>
                    </div>
                  ))}
                </div>

                {aiResult.notes && (
                  <div className="pt-3 border-t border-slate-200">
                    <p className="text-xs font-semibold text-slate-600 mb-1">Clinical Notes</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{aiResult.notes}</p>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2">
                  <ConfidenceBadge confidence={aiResult.confidence} />
                  <span className="text-xs text-slate-400">
                    {aiResult.source === 'ai-gemini' ? 'Gemini 3' : 'Groq / Llama-3.3'}
                  </span>
                </div>

                {aiResult.references.length > 0 && (
                  <p className="text-xs text-slate-400">{aiResult.references.join(' · ')}</p>
                )}
              </div>

              {/* AI disclaimer */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
                <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  AI-generated data. Always verify against a current pharmacopoeial reference (Trissel&apos;s, Micromedex) and consult a clinical pharmacist before Y-site administration.
                </p>
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-400 text-center">
          Local data: Trissel&apos;s Handbook · AI data: Gemini 3 / Groq · Educational use only
        </p>
      </div>
    </div>
  );
}
