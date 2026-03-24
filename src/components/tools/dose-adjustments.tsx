'use client';

import { useState, useMemo } from 'react';
import { Search, AlertTriangle } from 'lucide-react';

interface DoseAdjustment {
  drug: string;
  class: string;
  normalDose: string;
  renalMild: string;   // CrCl 30-59
  renalModerate: string; // CrCl 15-29
  renalSevere: string;  // CrCl < 15 or HD
  hepaticMild: string;  // Child-Pugh A
  hepaticSevere: string; // Child-Pugh B-C
  notes: string;
}

const DOSE_DATA: DoseAdjustment[] = [
  // Antibiotics
  { drug: 'Vancomycin', class: 'Antibiotic', normalDose: '15-20 mg/kg IV q8-12h', renalMild: 'q12-24h; adjust by AUC', renalModerate: 'q24-48h; AUC monitoring', renalSevere: 'Load then level-based; HD: redose post-HD', hepaticMild: 'No adjustment', hepaticSevere: 'No adjustment', notes: 'AUC/MIC 400-600 target; use actual body weight' },
  { drug: 'Piperacillin-Tazobactam', class: 'Antibiotic', normalDose: '3.375g q6h or 4.5g q6h (severe/Pseudomonas); EI over 4h recommended', renalMild: '3.375g q6h', renalModerate: '2.25g q6h', renalSevere: '2.25g q8h; HD: 2.25g q8h + extra dose post-HD', hepaticMild: 'No adjustment', hepaticSevere: 'No adjustment', notes: 'Extended infusion (4h) recommended for critically ill; use 4.5g q6h for Pseudomonas or severe infections' },
  { drug: 'Cefepime', class: 'Antibiotic', normalDose: '2g IV q8h', renalMild: '2g q12h', renalModerate: '1g q12h', renalSevere: '1g q24h; HD: 1g post-HD', hepaticMild: 'No adjustment', hepaticSevere: 'No adjustment', notes: 'Neurotoxicity risk increases with renal impairment' },
  { drug: 'Meropenem', class: 'Antibiotic', normalDose: '1-2g IV q8h', renalMild: '1g q12h', renalModerate: '500mg q12h', renalSevere: '500mg q24h; HD: dose post-HD', hepaticMild: 'No adjustment', hepaticSevere: 'No adjustment', notes: 'Seizure risk lower than imipenem; ok for CNS infections' },
  { drug: 'Levofloxacin', class: 'Antibiotic', normalDose: '750mg IV/PO daily', renalMild: 'CrCl 50–59: no adjustment. CrCl 20–49: 750mg × 1, then 500mg q24h', renalModerate: '500mg q48h', renalSevere: '500mg q48h', hepaticMild: 'No adjustment', hepaticSevere: 'No adjustment', notes: 'Tendon rupture risk; avoid with steroids; CrCl threshold for dose change is 50 mL/min' },
  { drug: 'Ciprofloxacin', class: 'Antibiotic', normalDose: '400mg IV q12h or 500mg PO q12h', renalMild: 'Reduce PO to 250-500mg q12h', renalModerate: '200mg IV or 250mg PO q12h', renalSevere: '200mg IV or 250mg PO q12h', hepaticMild: 'No adjustment', hepaticSevere: 'Use with caution', notes: 'Many drug interactions (CYP1A2)' },
  { drug: 'Metronidazole', class: 'Antibiotic', normalDose: '500mg IV/PO q8h', renalMild: 'No adjustment', renalModerate: 'No adjustment', renalSevere: 'Reduce by 50%; HD: give post-HD', hepaticMild: 'No adjustment', hepaticSevere: 'Reduce dose by 50%; avoid if severe', notes: 'Accumulates in hepatic impairment; disulfiram reaction' },
  { drug: 'TMP-SMX', class: 'Antibiotic', normalDose: '1 DS tab PO q12h (UTI)', renalMild: 'Full dose if CrCl > 30', renalModerate: '50% dose', renalSevere: 'Avoid; hyperkalemia risk', hepaticMild: 'Use with caution', hepaticSevere: 'Avoid', notes: 'Monitor potassium; avoid with ACEi/ARB if CrCl low' },
  { drug: 'Daptomycin', class: 'Antibiotic', normalDose: '6-10 mg/kg IV daily', renalMild: 'No adjustment', renalModerate: 'q48h (dose reduction threshold is CrCl < 30, not < 15)', renalSevere: 'q48h; HD: dose post-HD', hepaticMild: 'No adjustment', hepaticSevere: 'No data; use with caution', notes: 'NOT for pneumonia; check CPK weekly; q48h applies to CrCl < 30 (spans moderate and severe columns)' },
  { drug: 'Fluconazole', class: 'Antifungal', normalDose: '200-400mg IV/PO daily', renalMild: 'No adjustment', renalModerate: '50% dose', renalSevere: '50% dose; HD: full dose post-HD', hepaticMild: 'Use with caution', hepaticSevere: 'Use with extreme caution', notes: 'Many drug interactions; hepatotoxic; check LFTs' },

  // Cardiovascular
  { drug: 'Enoxaparin (treatment)', class: 'Anticoagulant', normalDose: '1 mg/kg SubQ q12h', renalMild: 'No adjustment', renalModerate: '1 mg/kg SubQ daily', renalSevere: '1 mg/kg SubQ daily; monitor anti-Xa', hepaticMild: 'Use with caution', hepaticSevere: 'Use with caution; monitor anti-Xa', notes: 'CrCl < 30: dose reduction critical; monitor anti-Xa levels' },
  { drug: 'Apixaban', class: 'DOAC', normalDose: '5mg PO BID (AFib)', renalMild: 'No adjustment', renalModerate: '2.5mg BID if ≥2 of: age≥80, wt≤60kg, Cr≥1.5 (AFib only — VTE dosing unaffected by these criteria)', renalSevere: 'Not recommended if CrCl < 15', hepaticMild: 'No adjustment', hepaticSevere: 'Avoid if Child-Pugh C', notes: 'Least renal elimination of DOACs (~27%); dose reduction criteria apply to AF stroke prevention only, not VTE treatment' },
  { drug: 'Rivaroxaban', class: 'DOAC', normalDose: '20mg PO daily with food (AFib)', renalMild: '15mg daily', renalModerate: '15mg daily', renalSevere: 'Avoid if CrCl < 15', hepaticMild: 'No adjustment', hepaticSevere: 'Avoid if Child-Pugh B-C', notes: 'Must take with food for absorption; 36% renal elimination' },
  { drug: 'Digoxin', class: 'Cardiac glycoside', normalDose: '0.125-0.25mg PO daily', renalMild: '0.125mg daily', renalModerate: '0.0625-0.125mg daily', renalSevere: '0.0625mg daily or q48h', hepaticMild: 'No adjustment', hepaticSevere: 'No adjustment', notes: 'Target 0.5-0.9 ng/mL for HF; narrow therapeutic index' },

  // Pain / Neuro
  { drug: 'Gabapentin', class: 'Anticonvulsant', normalDose: '300-1200mg PO TID', renalMild: '200-700mg BID', renalModerate: '100-300mg daily', renalSevere: '100-300mg post-HD', hepaticMild: 'No adjustment', hepaticSevere: 'No adjustment (not hepatically cleared)', notes: '100% renal elimination; dose proportional to CrCl' },
  { drug: 'Pregabalin', class: 'Anticonvulsant', normalDose: '75-300mg PO BID', renalMild: '75mg BID or 150mg daily', renalModerate: '25-75mg daily', renalSevere: '25-75mg daily or post-HD', hepaticMild: 'No adjustment', hepaticSevere: 'No adjustment', notes: '98% renal elimination' },
  { drug: 'Morphine', class: 'Opioid', normalDose: 'Varies', renalMild: 'Reduce dose 25%', renalModerate: 'Reduce dose 50%; extend interval', renalSevere: 'AVOID — active metabolite (M6G) accumulates', hepaticMild: 'Reduce dose 50%', hepaticSevere: 'Avoid if possible', notes: 'M6G neurotoxicity in renal failure; use hydromorphone instead' },
  { drug: 'Hydromorphone', class: 'Opioid', normalDose: 'Varies', renalMild: 'Reduce dose 25-50%', renalModerate: 'Reduce dose 50-75%', renalSevere: 'Reduce 50-75%; start low, go slow', hepaticMild: 'Reduce dose 50%', hepaticSevere: 'Reduce dose 50-75%', notes: 'Preferred opioid in renal impairment over morphine' },

  // Diabetes
  { drug: 'Metformin', class: 'Biguanide', normalDose: '500-1000mg PO BID', renalMild: 'Max 1000mg BID', renalModerate: 'Max 500mg BID', renalSevere: 'CONTRAINDICATED (lactic acidosis)', hepaticMild: 'Use with caution — hepatic impairment may reduce lactate clearance', hepaticSevere: 'CONTRAINDICATED', notes: 'Stop if eGFR < 30; hold for contrast procedures; contraindicated in severe hepatic impairment (Child-Pugh C) only' },

  // Other
  { drug: 'Allopurinol', class: 'XO Inhibitor', normalDose: '100-300mg PO daily', renalMild: '200mg daily', renalModerate: '100mg daily', renalSevere: '100mg q48h', hepaticMild: 'No adjustment', hepaticSevere: 'Use with caution', notes: 'Start low (100mg); titrate to uric acid <6; SJS risk (HLA-B*5801)' },
  { drug: 'Colchicine', class: 'Anti-inflammatory', normalDose: '0.6mg BID', renalMild: '0.6mg daily', renalModerate: '0.3mg daily', renalSevere: 'AVOID with P-gp/CYP3A4 inhibitors', hepaticMild: 'Reduce dose', hepaticSevere: 'AVOID', notes: 'Fatal toxicity risk with renal/hepatic impairment + interacting drugs' },
];

export function DoseAdjustments() {
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');

  const classes = [...new Set(DOSE_DATA.map(d => d.class))];

  const filtered = useMemo(() => {
    return DOSE_DATA.filter(d => {
      const q = search.toLowerCase();
      const matchSearch = !q || d.drug.toLowerCase().includes(q) || d.class.toLowerCase().includes(q) || d.notes.toLowerCase().includes(q);
      const matchClass = selectedClass === 'All' || d.class === selectedClass;
      return matchSearch && matchClass;
    });
  }, [search, selectedClass]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search drugs..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
        </div>
        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}
          className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer">
          <option value="All">All Classes ({DOSE_DATA.length})</option>
          {classes.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {filtered.map((d, i) => (
          <div key={i} className="border border-slate-200 rounded-2xl overflow-hidden hover:border-blue-200 transition-colors">
            {/* Header */}
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900">{d.drug}</span>
                <span className="text-xs text-slate-400 ml-2">{d.class}</span>
              </div>
              <span className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">{d.normalDose}</span>
            </div>

            {/* Adjustment grid */}
            <div className="p-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                {/* Renal columns */}
                <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100">
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">CrCl 30–59</p>
                  <p className="text-xs text-slate-700 font-medium">{d.renalMild}</p>
                </div>
                <div className="bg-amber-50/50 rounded-xl p-3 border border-amber-100">
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">CrCl 15–29</p>
                  <p className="text-xs text-slate-700 font-medium">{d.renalModerate}</p>
                </div>
                <div className={`rounded-xl p-3 border ${d.renalSevere.includes('AVOID') || d.renalSevere.includes('CONTRAINDICATED') ? 'bg-red-50 border-red-200' : 'bg-red-50/50 border-red-100'}`}>
                  <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1">CrCl &lt;15 / HD</p>
                  <p className={`text-xs font-medium ${d.renalSevere.includes('AVOID') || d.renalSevere.includes('CONTRAINDICATED') ? 'text-red-700 font-bold' : 'text-slate-700'}`}>{d.renalSevere}</p>
                </div>
                {/* Hepatic */}
                <div className={`rounded-xl p-3 border ${d.hepaticSevere.includes('AVOID') || d.hepaticSevere.includes('CONTRAINDICATED') ? 'bg-purple-50 border-purple-200' : 'bg-purple-50/50 border-purple-100'}`}>
                  <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-1">Hepatic (B/C)</p>
                  <p className={`text-xs font-medium ${d.hepaticSevere.includes('AVOID') || d.hepaticSevere.includes('CONTRAINDICATED') ? 'text-purple-700 font-bold' : 'text-slate-700'}`}>{d.hepaticSevere}</p>
                </div>
              </div>

              {d.notes && (
                <div className="flex items-start gap-2 text-xs text-slate-500">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  {d.notes}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && <div className="text-center py-8 text-sm text-slate-400">No drugs match your search.</div>}

      <p className="text-[10px] text-slate-400">
        Dose adjustments are general guidance. Always verify with FDA labeling, your institution&apos;s protocols, and clinical pharmacist review. CrCl = Cockcroft-Gault; Child-Pugh for hepatic classification.
      </p>
    </div>
  );
}
