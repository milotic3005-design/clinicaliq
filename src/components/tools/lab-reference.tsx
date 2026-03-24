'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';

interface LabTest {
  name: string;
  specimen: string;
  conventional: string;
  si?: string;
  critical?: string;
  notes?: string;
  category: string;
}

const LAB_DATA: LabTest[] = [
  // ── Chemistry (BMP/CMP) ──
  { name: 'Sodium (Na)', specimen: 'Serum', conventional: '136–145 mEq/L', si: '136–145 mmol/L', critical: '<120 or >160 mEq/L', category: 'Chemistry' },
  { name: 'Potassium (K)', specimen: 'Serum', conventional: '3.5–5.0 mEq/L', si: '3.5–5.0 mmol/L', critical: '<2.5 or >6.5 mEq/L', category: 'Chemistry' },
  { name: 'Chloride (Cl)', specimen: 'Serum', conventional: '98–106 mEq/L', si: '98–106 mmol/L', category: 'Chemistry' },
  { name: 'Bicarbonate (CO₂)', specimen: 'Serum', conventional: '22–28 mEq/L', si: '22–28 mmol/L', critical: '<10 or >40 mEq/L', category: 'Chemistry' },
  { name: 'BUN', specimen: 'Serum', conventional: '7–20 mg/dL', si: '2.5–7.1 mmol/L', category: 'Chemistry' },
  { name: 'Creatinine', specimen: 'Serum', conventional: 'M: 0.7–1.3 mg/dL  F: 0.6–1.1 mg/dL', si: 'M: 62–115 μmol/L', critical: '>10 mg/dL', category: 'Chemistry' },
  { name: 'Glucose (fasting)', specimen: 'Serum', conventional: '70–100 mg/dL', si: '3.9–5.6 mmol/L', critical: '<40 or >500 mg/dL', category: 'Chemistry' },
  { name: 'Calcium (total)', specimen: 'Serum', conventional: '8.5–10.5 mg/dL', si: '2.12–2.62 mmol/L', critical: '<6.0 or >13.0 mg/dL', category: 'Chemistry' },
  { name: 'Calcium (ionized)', specimen: 'Serum', conventional: '4.64–5.28 mg/dL', si: '1.16–1.32 mmol/L', critical: '<3.2 or >6.5 mg/dL', category: 'Chemistry' },
  { name: 'Magnesium', specimen: 'Serum', conventional: '1.7–2.2 mg/dL', si: '0.70–0.91 mmol/L', critical: '<1.0 or >4.9 mg/dL', category: 'Chemistry' },
  { name: 'Phosphorus', specimen: 'Serum', conventional: '2.5–4.5 mg/dL', si: '0.81–1.45 mmol/L', category: 'Chemistry' },
  { name: 'Uric Acid', specimen: 'Serum', conventional: 'M: 3.5–7.2 mg/dL  F: 2.6–6.0 mg/dL', category: 'Chemistry' },

  // ── LFTs ──
  { name: 'AST (SGOT)', specimen: 'Serum', conventional: '10–40 U/L', category: 'Liver' },
  { name: 'ALT (SGPT)', specimen: 'Serum', conventional: '7–56 U/L', category: 'Liver' },
  { name: 'ALP (Alk Phos)', specimen: 'Serum', conventional: '44–147 U/L', category: 'Liver' },
  { name: 'Total Bilirubin', specimen: 'Serum', conventional: '0.1–1.2 mg/dL', si: '1.7–20.5 μmol/L', category: 'Liver' },
  { name: 'Direct Bilirubin', specimen: 'Serum', conventional: '0.0–0.3 mg/dL', category: 'Liver' },
  { name: 'Albumin', specimen: 'Serum', conventional: '3.5–5.5 g/dL', si: '35–55 g/L', category: 'Liver' },
  { name: 'Total Protein', specimen: 'Serum', conventional: '6.0–8.3 g/dL', category: 'Liver' },
  { name: 'GGT', specimen: 'Serum', conventional: 'M: 8–61 U/L  F: 5–36 U/L', category: 'Liver' },
  { name: 'LDH', specimen: 'Serum', conventional: '140–280 U/L', category: 'Liver' },

  // ── CBC ──
  { name: 'WBC', specimen: 'Blood', conventional: '4.5–11.0 × 10³/μL', critical: '<2.0 or >30.0 × 10³/μL', category: 'Hematology' },
  { name: 'Hemoglobin', specimen: 'Blood', conventional: 'M: 13.5–17.5 g/dL  F: 12.0–16.0 g/dL', critical: '<7.0 or >20.0 g/dL', category: 'Hematology' },
  { name: 'Hematocrit', specimen: 'Blood', conventional: 'M: 38.3–48.6%  F: 35.5–44.9%', critical: '<20% or >60%', category: 'Hematology' },
  { name: 'Platelets', specimen: 'Blood', conventional: '150–400 × 10³/μL', critical: '<50 or >1000 × 10³/μL', category: 'Hematology' },
  { name: 'MCV', specimen: 'Blood', conventional: '80–100 fL', category: 'Hematology' },
  { name: 'MCH', specimen: 'Blood', conventional: '27–31 pg', category: 'Hematology' },
  { name: 'MCHC', specimen: 'Blood', conventional: '32–36 g/dL', category: 'Hematology' },
  { name: 'RDW', specimen: 'Blood', conventional: '11.5–14.5%', category: 'Hematology' },
  { name: 'Neutrophils (ANC)', specimen: 'Blood', conventional: '1.5–8.0 × 10³/μL', critical: '<0.5 × 10³/μL (neutropenia)', notes: 'ANC < 500 = severe neutropenia', category: 'Hematology' },
  { name: 'Reticulocyte Count', specimen: 'Blood', conventional: '0.5–1.5%', category: 'Hematology' },

  // ── Coagulation ──
  { name: 'PT', specimen: 'Plasma', conventional: '11.0–13.5 sec', critical: '>30 sec', category: 'Coagulation' },
  { name: 'INR', specimen: 'Plasma', conventional: '0.9–1.1 (no anticoagulation)', notes: 'Warfarin target: 2.0–3.0 (mechanical valve: 2.5–3.5)', critical: '>5.0', category: 'Coagulation' },
  { name: 'aPTT', specimen: 'Plasma', conventional: '25–35 sec', notes: 'Heparin target: 1.5–2.5× control', critical: '>100 sec', category: 'Coagulation' },
  { name: 'Fibrinogen', specimen: 'Plasma', conventional: '200–400 mg/dL', critical: '<100 mg/dL', category: 'Coagulation' },
  { name: 'D-dimer', specimen: 'Plasma', conventional: '< 0.50 μg/mL FEU', notes: 'High sensitivity for VTE exclusion', category: 'Coagulation' },
  { name: 'Anti-Xa (heparin)', specimen: 'Plasma', conventional: 'UFH: 0.3–0.7 IU/mL  LMWH: 0.5–1.0 IU/mL', category: 'Coagulation' },

  // ── Cardiac ──
  { name: 'Troponin I (hs)', specimen: 'Serum', conventional: '< 0.04 ng/mL', critical: '>0.4 ng/mL', notes: 'Serial q3–6h; rising pattern diagnostic', category: 'Cardiac' },
  { name: 'BNP', specimen: 'Plasma', conventional: '< 100 pg/mL', notes: '>400 pg/mL suggests HF; 100–400 = gray zone', category: 'Cardiac' },
  { name: 'NT-proBNP', specimen: 'Plasma', conventional: '< 125 pg/mL (< 75 yr)', notes: 'Age-dependent: >450 (<50yr), >900 (50-75), >1800 (>75)', category: 'Cardiac' },
  { name: 'CK (total)', specimen: 'Serum', conventional: 'M: 55–170 U/L  F: 30–135 U/L', category: 'Cardiac' },
  { name: 'CK-MB', specimen: 'Serum', conventional: '< 5% of total CK', category: 'Cardiac' },

  // ── Endocrine / Metabolic ──
  { name: 'TSH', specimen: 'Serum', conventional: '0.4–4.0 mIU/L', category: 'Endocrine' },
  { name: 'Free T4', specimen: 'Serum', conventional: '0.8–1.8 ng/dL', category: 'Endocrine' },
  { name: 'Free T3', specimen: 'Serum', conventional: '2.3–4.2 pg/mL', category: 'Endocrine' },
  { name: 'HbA1c', specimen: 'Blood', conventional: '< 5.7% (normal)', notes: '5.7–6.4% = prediabetes; ≥6.5% = diabetes; ADA target <7% for most adults', category: 'Endocrine' },
  { name: 'Cortisol (AM)', specimen: 'Serum', conventional: '6–23 μg/dL', category: 'Endocrine' },
  { name: 'Vitamin D (25-OH)', specimen: 'Serum', conventional: '30–100 ng/mL', notes: '<20 = deficiency; 20–29 = insufficiency', category: 'Endocrine' },

  // ── Iron Studies ──
  { name: 'Iron (serum)', specimen: 'Serum', conventional: '60–170 μg/dL', category: 'Iron' },
  { name: 'TIBC', specimen: 'Serum', conventional: '250–370 μg/dL', category: 'Iron' },
  { name: 'Ferritin', specimen: 'Serum', conventional: 'M: 20–250 ng/mL  F: 10–120 ng/mL', notes: 'Acute phase reactant — elevated in inflammation', category: 'Iron' },
  { name: 'Transferrin Sat.', specimen: 'Serum', conventional: '20–50%', notes: '<20% suggests iron deficiency', category: 'Iron' },

  // ── Inflammatory ──
  { name: 'CRP', specimen: 'Serum', conventional: '< 1.0 mg/dL', notes: '>10 mg/dL suggests significant inflammation/infection', category: 'Inflammatory' },
  { name: 'ESR', specimen: 'Blood', conventional: 'M: 0–22 mm/hr  F: 0–29 mm/hr', category: 'Inflammatory' },
  { name: 'Procalcitonin', specimen: 'Serum', conventional: '< 0.05 ng/mL', notes: '>0.25 = bacterial infection likely; >2.0 = severe sepsis/shock', category: 'Inflammatory' },
  { name: 'Lactate', specimen: 'Plasma', conventional: '0.5–2.0 mmol/L', critical: '>4.0 mmol/L', notes: '>2.0 suggests tissue hypoperfusion; trend serially', category: 'Inflammatory' },

  // ── Renal ──
  { name: 'eGFR (CKD-EPI)', specimen: 'Calculated', conventional: '≥ 90 mL/min/1.73m²', notes: 'Stage 3: 30–59; Stage 4: 15–29; Stage 5: <15', category: 'Renal' },
  { name: 'Urine Albumin/Cr Ratio', specimen: 'Urine', conventional: '< 30 mg/g', notes: '30–300 = moderately increased (microalbuminuria); >300 = severely increased', category: 'Renal' },

  // ── ABG / VBG ──
  { name: 'pH (arterial)', specimen: 'Arterial', conventional: '7.35–7.45', critical: '<7.20 or >7.60', category: 'Blood Gas' },
  { name: 'pCO₂', specimen: 'Arterial', conventional: '35–45 mmHg', critical: '<20 or >70 mmHg', category: 'Blood Gas' },
  { name: 'pO₂', specimen: 'Arterial', conventional: '80–100 mmHg', critical: '<40 mmHg', category: 'Blood Gas' },
  { name: 'HCO₃⁻', specimen: 'Arterial', conventional: '22–26 mEq/L', category: 'Blood Gas' },
  { name: 'Base Excess', specimen: 'Arterial', conventional: '-2 to +2 mEq/L', category: 'Blood Gas' },

  // ── Drug Levels ──
  { name: 'Vancomycin (trough)', specimen: 'Serum', conventional: 'AUC/MIC 400–600 (IDSA 2020)', notes: 'Trough 15–20 no longer recommended; AUC-based monitoring preferred', critical: 'Trough >20 = nephrotoxicity risk', category: 'Drug Levels' },
  { name: 'Gentamicin (trough)', specimen: 'Serum', conventional: '< 2.0 μg/mL (traditional)', critical: '>2.0 μg/mL', category: 'Drug Levels' },
  { name: 'Phenytoin (total)', specimen: 'Serum', conventional: '10–20 μg/mL', critical: '>25 μg/mL', notes: 'Check free level if albumin low', category: 'Drug Levels' },
  { name: 'Valproic Acid', specimen: 'Serum', conventional: '50–100 μg/mL', critical: '>150 μg/mL', category: 'Drug Levels' },
  { name: 'Lithium', specimen: 'Serum', conventional: '0.6–1.2 mEq/L', critical: '>1.5 mEq/L', category: 'Drug Levels' },
  { name: 'Digoxin', specimen: 'Serum', conventional: '0.8–2.0 ng/mL', critical: '>2.4 ng/mL', notes: 'Draw ≥6h post-dose; lower target (0.5–0.9) for HF', category: 'Drug Levels' },
  { name: 'Theophylline', specimen: 'Serum', conventional: '10–20 μg/mL', critical: '>20 μg/mL', category: 'Drug Levels' },
  { name: 'Tacrolimus', specimen: 'Blood', conventional: '5–15 ng/mL (varies by indication)', notes: 'Target varies by transplant type and time post-transplant', category: 'Drug Levels' },
  { name: 'Cyclosporine', specimen: 'Blood', conventional: '100–400 ng/mL (varies)', category: 'Drug Levels' },
];

const CATEGORIES = [...new Set(LAB_DATA.map(l => l.category))];

export function LabReference() {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');

  const filtered = useMemo(() => {
    return LAB_DATA.filter(lab => {
      const q = search.toLowerCase();
      const matchSearch = !q || lab.name.toLowerCase().includes(q) || (lab.notes || '').toLowerCase().includes(q);
      const matchCat = selectedCat === 'All' || lab.category === selectedCat;
      return matchSearch && matchCat;
    });
  }, [search, selectedCat]);

  return (
    <div className="space-y-4">
      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search labs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />
        </div>
        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
        >
          <option value="All">All Categories ({LAB_DATA.length})</option>
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c} ({LAB_DATA.filter(l => l.category === c).length})</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Test</th>
                <th className="text-left px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Normal Range</th>
                <th className="text-left px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Critical</th>
                <th className="text-left px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((lab, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-2.5">
                    <span className="font-semibold text-slate-800">{lab.name}</span>
                    <span className="text-[10px] text-slate-400 block">{lab.specimen}</span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-700 font-medium">{lab.conventional}</td>
                  <td className="px-4 py-2.5 hidden sm:table-cell">
                    {lab.critical ? (
                      <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">{lab.critical}</span>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-slate-500 hidden md:table-cell max-w-xs">{lab.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-8 text-sm text-slate-400">No labs match your search.</div>
        )}
      </div>

      <p className="text-[10px] text-slate-400">
        Reference ranges may vary by laboratory and method. Critical values require immediate clinical action. Always verify against your institution&apos;s reference ranges.
      </p>
    </div>
  );
}
