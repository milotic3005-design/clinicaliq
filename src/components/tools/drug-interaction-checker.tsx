'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Plus, X, AlertTriangle, ShieldAlert, Info, Search, Loader2, Trash2 } from 'lucide-react';

interface Interaction {
  drug1: string;
  drug2: string;
  severity: 'high' | 'moderate' | 'low' | 'N/A';
  description: string;
  source: string;
}

interface ResolvedDrug {
  input: string;
  rxcui: string;
  name: string;
}

const SEVERITY_STYLES: Record<string, { bg: string; border: string; text: string; icon: typeof AlertTriangle }> = {
  high: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: ShieldAlert },
  moderate: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: AlertTriangle },
  low: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', icon: Info },
  'N/A': { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-600', icon: Info },
};

export function DrugInteractionChecker() {
  const [drugs, setDrugs] = useState<string[]>(['', '']);
  const [inputValue, setInputValue] = useState('');
  const [activeInput, setActiveInput] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [interactions, setInteractions] = useState<Interaction[] | null>(null);
  const [resolvedDrugs, setResolvedDrugs] = useState<ResolvedDrug[]>([]);
  const [unresolvedDrugs, setUnresolvedDrugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const suggestTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchSuggestions = useCallback((term: string) => {
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    if (term.length < 2) { setSuggestions([]); return; }

    suggestTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/v1/interactions?suggest=${encodeURIComponent(term)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
        }
      } catch { /* ignore */ }
    }, 250);
  }, []);

  const updateDrug = (index: number, value: string) => {
    const updated = [...drugs];
    updated[index] = value;
    setDrugs(updated);
    setActiveInput(index);
    fetchSuggestions(value);
  };

  const selectSuggestion = (index: number, value: string) => {
    const updated = [...drugs];
    updated[index] = value;
    setDrugs(updated);
    setSuggestions([]);
    setActiveInput(null);
  };

  const addDrug = () => {
    if (drugs.length >= 10) return;
    setDrugs([...drugs, '']);
  };

  const removeDrug = (index: number) => {
    if (drugs.length <= 2) return;
    setDrugs(drugs.filter((_, i) => i !== index));
  };

  const checkInteractions = async () => {
    const validDrugs = drugs.filter(d => d.trim().length >= 2);
    if (validDrugs.length < 2) {
      setError('Enter at least 2 drug names');
      return;
    }

    setLoading(true);
    setError(null);
    setInteractions(null);
    setResolvedDrugs([]);
    setUnresolvedDrugs([]);

    try {
      const res = await fetch('/api/v1/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drugs: validDrugs }),
      });

      const data = await res.json();

      if (data.error && !data.interactions) {
        setError(data.error);
        return;
      }

      setInteractions(data.interactions || []);
      setResolvedDrugs(data.resolved_drugs || []);
      setUnresolvedDrugs(data.unresolved_drugs || []);

      if (data.error) setError(data.error);
    } catch {
      setError('Failed to check interactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setDrugs(['', '']);
    setInteractions(null);
    setResolvedDrugs([]);
    setUnresolvedDrugs([]);
    setError(null);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handler = () => { setSuggestions([]); setActiveInput(null); };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  return (
    <div className="space-y-6">
      {/* Drug Input List */}
      <div className="space-y-3">
        {drugs.map((drug, i) => (
          <div key={i} className="relative flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 w-6 text-right shrink-0">{i + 1}.</span>
            <div className="relative flex-1" onClick={(e) => e.stopPropagation()}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={drug}
                onChange={(e) => updateDrug(i, e.target.value)}
                onFocus={() => { setActiveInput(i); if (drug.length >= 2) fetchSuggestions(drug); }}
                placeholder={`Drug ${i + 1} name...`}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); checkInteractions(); } }}
              />
              {/* Autocomplete dropdown */}
              {activeInput === i && suggestions.length > 0 && (
                <ul className="absolute z-30 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                  {suggestions.map((s, si) => (
                    <li
                      key={si}
                      onClick={() => selectSuggestion(i, s)}
                      className="px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 cursor-pointer transition-colors capitalize"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {drugs.length > 2 && (
              <button onClick={() => removeDrug(i)} aria-label="Remove drug" className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {drugs.length < 10 && (
          <button onClick={addDrug} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Drug
          </button>
        )}
        <button
          onClick={checkInteractions}
          disabled={loading || drugs.filter(d => d.trim().length >= 2).length < 2}
          className="flex items-center gap-1.5 px-5 py-2 text-sm font-bold text-white bg-[#007AFF] hover:bg-[#0066DD] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-sm"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
          Check Interactions
        </button>
        {interactions !== null && (
          <button onClick={clearAll} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Resolved / Unresolved */}
      {resolvedDrugs.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {resolvedDrugs.map((d, i) => (
            <span key={i} className="px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg capitalize">
              ✓ {d.name}
            </span>
          ))}
          {unresolvedDrugs.map((d, i) => (
            <span key={i} className="px-2.5 py-1 text-xs font-medium bg-red-50 text-red-600 border border-red-200 rounded-lg">
              ✗ {d} (not found)
            </span>
          ))}
        </div>
      )}

      {/* Results */}
      {interactions !== null && (
        <div className="space-y-3">
          {interactions.length === 0 ? (
            <div className="text-center py-8 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-sm font-semibold text-emerald-800">No known interactions found</p>
              <p className="text-xs text-emerald-600 mt-1">Always verify with pharmacist for patient-specific considerations.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 px-1">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h4 className="text-sm font-bold text-slate-800">
                  {interactions.length} interaction{interactions.length !== 1 ? 's' : ''} found
                </h4>
              </div>
              {interactions
                .sort((a, b) => {
                  const order = { high: 0, moderate: 1, low: 2, 'N/A': 3 };
                  return (order[a.severity] ?? 3) - (order[b.severity] ?? 3);
                })
                .map((ix, i) => {
                  const style = SEVERITY_STYLES[ix.severity] || SEVERITY_STYLES['N/A'];
                  const Icon = style.icon;
                  return (
                    <div key={i} className={`${style.bg} ${style.border} border rounded-2xl p-4`}>
                      <div className="flex items-start gap-3">
                        <Icon className={`w-5 h-5 ${style.text} flex-shrink-0 mt-0.5`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-sm font-bold text-slate-900 capitalize">{ix.drug1}</span>
                            <span className="text-xs text-slate-400">×</span>
                            <span className="text-sm font-bold text-slate-900 capitalize">{ix.drug2}</span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${style.bg} ${style.text} border ${style.border}`}>
                              {ix.severity}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed">{ix.description}</p>
                          <p className="text-[10px] text-slate-400 mt-1">Source: {ix.source}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </>
          )}
        </div>
      )}

      <p className="text-[10px] text-slate-400 leading-relaxed">
        Data from NLM RxNorm Interaction API (DrugBank, ONCHigh). Not all interactions are cataloged — always verify with clinical pharmacist.
      </p>
    </div>
  );
}
