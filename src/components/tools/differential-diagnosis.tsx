'use client';

import { useState, useMemo } from 'react';
import { Search, AlertTriangle, ChevronDown, ChevronRight, X, RotateCcw, Stethoscope } from 'lucide-react';
import {
  SYMPTOMS,
  DIAGNOSES,
  BODY_SYSTEM_LABELS,
  type BodySystem,
  type Symptom,
  type Diagnosis,
} from '@/data/differential-diagnosis-data';

// -- Helpers --

function computeRanking(selected: Set<string>, diagnoses: Diagnosis[]) {
  if (selected.size === 0) return [];

  const scored = diagnoses
    .map(dx => {
      const matchCount = dx.symptoms.filter(s => selected.has(s)).length;
      if (matchCount === 0) return null;
      const score = matchCount / dx.symptoms.length;
      return { dx, matchCount, total: dx.symptoms.length, score };
    })
    .filter(Boolean) as { dx: Diagnosis; matchCount: number; total: number; score: number }[];

  scored.sort((a, b) => {
    // Primary: score descending
    if (b.score !== a.score) return b.score - a.score;
    // Secondary: match count descending
    if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
    // Tertiary: acuity (emergent first)
    const acuityOrder = { emergent: 0, urgent: 1, routine: 2 };
    return acuityOrder[a.dx.acuity] - acuityOrder[b.dx.acuity];
  });

  return scored;
}

const ACUITY_STYLES = {
  emergent: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', label: 'Emergent' },
  urgent: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', label: 'Urgent' },
  routine: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', label: 'Routine' },
};

// -- Symptom group by body system --

const GROUPED_SYMPTOMS: { system: BodySystem; symptoms: Symptom[] }[] = (() => {
  const systemOrder: BodySystem[] = [
    'constitutional', 'cardiovascular', 'respiratory', 'gastrointestinal',
    'neurological', 'musculoskeletal', 'genitourinary', 'dermatologic',
  ];
  return systemOrder.map(system => ({
    system,
    symptoms: SYMPTOMS.filter(s => s.bodySystem === system),
  }));
})();

const SYMPTOM_MAP = new Map(SYMPTOMS.map(s => [s.id, s]));

// -- Component --

export function DifferentialDiagnosis() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSystems, setExpandedSystems] = useState<Set<BodySystem>>(new Set(['constitutional', 'cardiovascular']));
  const [expandedDx, setExpandedDx] = useState<string | null>(null);

  const ranked = useMemo(() => computeRanking(selected, DIAGNOSES), [selected]);

  const activeRedFlags = useMemo(() => {
    const flags: typeof SYMPTOMS = [];
    for (const sid of selected) {
      const sym = SYMPTOM_MAP.get(sid);
      if (sym && sym.isRedFlag) {
        flags.push(sym);
      }
    }
    return flags;
  }, [selected]);

  const toggleSymptom = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSystem = (system: BodySystem) => {
    setExpandedSystems(prev => {
      const next = new Set(prev);
      if (next.has(system)) next.delete(system);
      else next.add(system);
      return next;
    });
  };

  const clearAll = () => {
    setSelected(new Set());
    setExpandedDx(null);
  };

  const filteredGroups = useMemo(() => {
    if (!searchQuery) return GROUPED_SYMPTOMS;
    const lowerQuery = searchQuery.toLowerCase();
    return GROUPED_SYMPTOMS.map(g => ({
      ...g,
      symptoms: g.symptoms.filter(s => s.name.toLowerCase().includes(lowerQuery)),
    })).filter(g => g.symptoms.length > 0);
  }, [searchQuery]);

  const systemCounts = useMemo(() => {
    const counts = {} as Record<BodySystem, number>;
    for (const sid of selected) {
      const sym = SYMPTOM_MAP.get(sid);
      if (sym) {
        counts[sym.bodySystem] = (counts[sym.bodySystem] || 0) + 1;
      }
    }
    return counts;
  }, [selected]);

  const selectedCount = (system: BodySystem) => systemCounts[system] || 0;

  return (
    <div className="space-y-4">
      {/* Selected symptoms chips */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pb-3 border-b border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Selected ({selected.size}):</span>
          {Array.from(selected).map(sid => SYMPTOM_MAP.get(sid)!).filter(Boolean).map(s => (
            <button
              key={s.id}
              onClick={() => toggleSymptom(s.id)}
              className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-full border transition-colors ${
                s.isRedFlag
                  ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                  : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
              }`}
            >
              {s.name}
              <X className="w-2.5 h-2.5" />
            </button>
          ))}
          <button onClick={clearAll} className="ml-2 text-[10px] text-slate-400 hover:text-[#007AFF] font-medium flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Clear all
          </button>
        </div>
      )}

      {/* Red flag banner */}
      {activeRedFlags.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-sm font-bold text-red-800">Red Flag Symptoms Identified</span>
          </div>
          <ul className="space-y-1">
            {activeRedFlags.map(rf => (
              <li key={rf.id} className="text-xs text-red-700">
                <span className="font-bold">{rf.name}:</span> {rf.redFlagReason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Left: Symptom Selector */}
        <div className="space-y-2">
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter symptoms..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
            {filteredGroups.map(({ system, symptoms }) => {
              const meta = BODY_SYSTEM_LABELS[system];
              const isOpen = expandedSystems.has(system);
              const count = selectedCount(system);
              return (
                <div key={system} className="border border-slate-100 rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleSystem(system)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{meta.emoji}</span>
                    <span className="flex-1">{meta.label}</span>
                    {count > 0 && (
                      <span className="text-[10px] font-bold text-white bg-[#007AFF] rounded-full w-5 h-5 flex items-center justify-center">{count}</span>
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-2 pb-2 space-y-0.5">
                      {symptoms.map(symptom => (
                        <label
                          key={symptom.id}
                          className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-xs transition-colors ${
                            selected.has(symptom.id)
                              ? symptom.isRedFlag ? 'bg-red-50' : 'bg-blue-50'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selected.has(symptom.id)}
                            onChange={() => toggleSymptom(symptom.id)}
                            className="rounded border-slate-300 text-[#007AFF] focus:ring-blue-500/20 w-3.5 h-3.5"
                          />
                          <span className={`flex-1 ${selected.has(symptom.id) ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                            {symptom.name}
                          </span>
                          {symptom.isRedFlag && (
                            <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">RED FLAG</span>
                          )}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Results */}
        <div className="space-y-3">
          {selected.size === 0 ? (
            <div className="text-center py-16">
              <Stethoscope className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-400">Select symptoms to generate differential diagnoses</p>
              <p className="text-xs text-slate-300 mt-1">Choose from the symptom list on the left</p>
            </div>
          ) : ranked.length === 0 ? (
            <div className="text-center py-12 text-sm text-slate-400">No matching diagnoses found for the selected symptoms.</div>
          ) : (
            <>
              <p className="text-xs text-slate-500 font-medium">
                {ranked.length} possible {ranked.length === 1 ? 'diagnosis' : 'diagnoses'} — ranked by symptom match
              </p>
              {ranked.map(({ dx, matchCount, total, score }) => {
                const acuity = ACUITY_STYLES[dx.acuity];
                const isExpanded = expandedDx === dx.id;
                const pct = Math.round(score * 100);

                return (
                  <div
                    key={dx.id}
                    className={`border rounded-2xl overflow-hidden transition-colors ${
                      isExpanded ? 'border-blue-200 shadow-sm' : 'border-slate-200 hover:border-blue-100'
                    }`}
                  >
                    {/* Header */}
                    <button
                      onClick={() => setExpandedDx(isExpanded ? null : dx.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left"
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-900">{dx.name}</span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${acuity.bg} ${acuity.text} ${acuity.border}`}>
                            {acuity.label}
                          </span>
                          <span className="text-[10px] text-slate-400">{dx.category}</span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="text-xs font-bold text-[#007AFF]">{matchCount}/{total}</span>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-400' : 'bg-slate-300'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </button>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-3">
                        {/* Distinguishing features */}
                        <div>
                          <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Key Distinguishing Features</h5>
                          <ul className="space-y-1">
                            {dx.distinguishingFeatures.map((f, i) => (
                              <li key={i} className="text-xs text-slate-700 flex gap-2">
                                <span className="text-blue-400 mt-0.5">•</span>
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Workup */}
                        <div>
                          <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Recommended Workup</h5>
                          <ul className="space-y-1">
                            {dx.workup.map((w, i) => (
                              <li key={i} className="text-xs text-slate-700 flex gap-2">
                                <span className="text-emerald-400 mt-0.5">•</span>
                                <span>{w}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Clinical pearl */}
                        {dx.pearl && (
                          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-1">Clinical Pearl</p>
                            <p className="text-xs text-amber-900">{dx.pearl}</p>
                          </div>
                        )}

                        {/* Matching symptoms */}
                        <div>
                          <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Matching Symptoms</h5>
                          <div className="flex flex-wrap gap-1">
                            {dx.symptoms.map(sid => {
                              const sym = SYMPTOM_MAP.get(sid);
                              if (!sym) return null;
                              const isMatch = selected.has(sid);
                              return (
                                <span
                                  key={sid}
                                  className={`text-[10px] px-2 py-0.5 rounded-full border ${
                                    isMatch
                                      ? 'bg-blue-50 text-blue-700 border-blue-200 font-semibold'
                                      : 'bg-slate-50 text-slate-400 border-slate-100'
                                  }`}
                                >
                                  {isMatch ? '✓ ' : ''}{sym.name}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      <p className="text-[10px] text-slate-400">
        This tool is for educational reference only. Differential diagnoses are generated from a curated static database and do not replace clinical judgment.
        Always correlate with patient history, physical examination, and diagnostic testing.
      </p>
    </div>
  );
}
