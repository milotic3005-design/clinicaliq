'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';

type Coverage = 'yes' | 'some' | 'no' | 'resistant';

interface Antibiotic {
  name: string;
  class: string;
  gramPos: Coverage;
  gramNeg: Coverage;
  anaerobes: Coverage;
  atypicals: Coverage;
  pseudomonas: Coverage;
  mrsa: Coverage;
  esbl: Coverage;
  notes: string;
}

const ANTIBIOTICS: Antibiotic[] = [
  // Penicillins
  { name: 'Amoxicillin', class: 'Penicillin', gramPos: 'yes', gramNeg: 'some', anaerobes: 'some', atypicals: 'no', pseudomonas: 'no', mrsa: 'no', esbl: 'no', notes: 'Good strep coverage; no staph aureus; some H. flu' },
  { name: 'Amoxicillin-Clavulanate', class: 'Penicillin + BLI', gramPos: 'yes', gramNeg: 'yes', anaerobes: 'yes', atypicals: 'no', pseudomonas: 'no', mrsa: 'no', esbl: 'no', notes: 'Broad oral option; covers MSSA, anaerobes; bite wounds' },
  { name: 'Ampicillin-Sulbactam', class: 'Penicillin + BLI', gramPos: 'yes', gramNeg: 'yes', anaerobes: 'yes', atypicals: 'no', pseudomonas: 'no', mrsa: 'no', esbl: 'no', notes: 'IV; good for diabetic foot, aspiration PNA, Acinetobacter (variable)' },
  { name: 'Piperacillin-Tazobactam', class: 'Penicillin + BLI', gramPos: 'yes', gramNeg: 'yes', anaerobes: 'yes', atypicals: 'no', pseudomonas: 'yes', mrsa: 'no', esbl: 'some', notes: 'Broadest penicillin; workhorse for empiric Pseudomonas + anaerobe coverage' },
  { name: 'Nafcillin/Oxacillin', class: 'Anti-staph Penicillin', gramPos: 'yes', gramNeg: 'no', anaerobes: 'no', atypicals: 'no', pseudomonas: 'no', mrsa: 'no', esbl: 'no', notes: 'MSSA drug of choice; no gram-neg coverage' },

  // Cephalosporins
  { name: 'Cefazolin', class: '1st Gen Ceph', gramPos: 'yes', gramNeg: 'some', anaerobes: 'no', atypicals: 'no', pseudomonas: 'no', mrsa: 'no', esbl: 'no', notes: 'Surgical prophylaxis; MSSA; simple UTI' },
  { name: 'Ceftriaxone', class: '3rd Gen Ceph', gramPos: 'yes', gramNeg: 'yes', anaerobes: 'no', atypicals: 'no', pseudomonas: 'no', mrsa: 'no', esbl: 'no', notes: 'CNS penetration; meningitis, CAP, UTI, gonorrhea' },
  { name: 'Cefepime', class: '4th Gen Ceph', gramPos: 'yes', gramNeg: 'yes', anaerobes: 'no', atypicals: 'no', pseudomonas: 'yes', mrsa: 'no', esbl: 'some', notes: 'Anti-pseudomonal; febrile neutropenia; nosocomial infections' },
  { name: 'Ceftazidime', class: '3rd Gen Ceph', gramPos: 'some', gramNeg: 'yes', anaerobes: 'no', atypicals: 'no', pseudomonas: 'yes', mrsa: 'no', esbl: 'no', notes: 'Anti-pseudomonal; weaker gram-pos than ceftriaxone' },
  { name: 'Ceftazidime-Avibactam', class: '3rd Gen Ceph + BLI', gramPos: 'some', gramNeg: 'yes', anaerobes: 'no', atypicals: 'no', pseudomonas: 'yes', mrsa: 'no', esbl: 'yes', notes: 'ESBL, KPC-producing CRE coverage; reserve agent' },
  { name: 'Ceftaroline', class: '5th Gen Ceph', gramPos: 'yes', gramNeg: 'yes', anaerobes: 'no', atypicals: 'no', pseudomonas: 'no', mrsa: 'yes', esbl: 'no', notes: 'Only ceph with MRSA activity; ABSSSI, CABP' },

  // Carbapenems
  { name: 'Meropenem', class: 'Carbapenem', gramPos: 'yes', gramNeg: 'yes', anaerobes: 'yes', atypicals: 'no', pseudomonas: 'yes', mrsa: 'no', esbl: 'yes', notes: 'Broadest beta-lactam; ESBL, multi-drug resistant; CNS penetration' },
  { name: 'Ertapenem', class: 'Carbapenem', gramPos: 'yes', gramNeg: 'yes', anaerobes: 'yes', atypicals: 'no', pseudomonas: 'no', mrsa: 'no', esbl: 'yes', notes: 'ESBL coverage; NO Pseudomonas or Acinetobacter; once-daily; OPAT-friendly' },
  { name: 'Imipenem-Cilastatin', class: 'Carbapenem', gramPos: 'yes', gramNeg: 'yes', anaerobes: 'yes', atypicals: 'no', pseudomonas: 'yes', mrsa: 'no', esbl: 'yes', notes: 'Broad; seizure risk at high doses; lower threshold than meropenem for CNS' },

  // Fluoroquinolones
  { name: 'Ciprofloxacin', class: 'Fluoroquinolone', gramPos: 'some', gramNeg: 'yes', anaerobes: 'no', atypicals: 'yes', pseudomonas: 'yes', mrsa: 'no', esbl: 'no', notes: 'Best FQ for Pseudomonas; UTI, travelers diarrhea; weak gram-pos' },
  { name: 'Levofloxacin', class: 'Fluoroquinolone', gramPos: 'yes', gramNeg: 'yes', anaerobes: 'no', atypicals: 'yes', pseudomonas: 'some', mrsa: 'no', esbl: 'no', notes: 'Respiratory FQ; CAP, sinusitis; moderate Pseudomonas coverage' },
  { name: 'Moxifloxacin', class: 'Fluoroquinolone', gramPos: 'yes', gramNeg: 'yes', anaerobes: 'yes', atypicals: 'yes', pseudomonas: 'no', mrsa: 'no', esbl: 'no', notes: 'Best anaerobe/gram-pos FQ; NO Pseudomonas; QTc prolongation' },

  // Glycopeptides / Anti-MRSA
  { name: 'Vancomycin (IV)', class: 'Glycopeptide', gramPos: 'yes', gramNeg: 'no', anaerobes: 'some', atypicals: 'no', pseudomonas: 'no', mrsa: 'yes', esbl: 'no', notes: 'MRSA drug of choice; AUC/MIC dosing (IDSA 2020); nephrotoxicity with pip/tazo' },
  { name: 'Daptomycin', class: 'Lipopeptide', gramPos: 'yes', gramNeg: 'no', anaerobes: 'no', atypicals: 'no', pseudomonas: 'no', mrsa: 'yes', esbl: 'no', notes: 'MRSA bacteremia/endocarditis; NOT for pneumonia (inactivated by surfactant)' },
  { name: 'Linezolid', class: 'Oxazolidinone', gramPos: 'yes', gramNeg: 'no', anaerobes: 'no', atypicals: 'no', pseudomonas: 'no', mrsa: 'yes', esbl: 'no', notes: 'Oral MRSA option; VRE; MRSA PNA; serotonin syndrome risk; thrombocytopenia >14d' },

  // Aminoglycosides
  { name: 'Gentamicin', class: 'Aminoglycoside', gramPos: 'some', gramNeg: 'yes', anaerobes: 'no', atypicals: 'no', pseudomonas: 'yes', mrsa: 'no', esbl: 'no', notes: 'Synergy for endocarditis (gram-pos); nephro/ototoxic; monitor levels' },
  { name: 'Tobramycin', class: 'Aminoglycoside', gramPos: 'some', gramNeg: 'yes', anaerobes: 'no', atypicals: 'no', pseudomonas: 'yes', mrsa: 'no', esbl: 'no', notes: 'Preferred aminoglycoside for Pseudomonas; inhaled for CF' },
  { name: 'Amikacin', class: 'Aminoglycoside', gramPos: 'some', gramNeg: 'yes', anaerobes: 'no', atypicals: 'no', pseudomonas: 'yes', mrsa: 'no', esbl: 'some', notes: 'Broadest aminoglycoside; some MDR gram-neg activity' },

  // Miscellaneous
  { name: 'Metronidazole', class: 'Nitroimidazole', gramPos: 'no', gramNeg: 'no', anaerobes: 'yes', atypicals: 'no', pseudomonas: 'no', mrsa: 'no', esbl: 'no', notes: 'Anaerobe-only including gram-positive anaerobes (Peptostreptococcus, Clostridium); C. diff (oral); CNS penetration; disulfiram reaction with EtOH' },
  { name: 'TMP-SMX', class: 'Sulfonamide', gramPos: 'yes', gramNeg: 'yes', anaerobes: 'no', atypicals: 'no', pseudomonas: 'no', mrsa: 'yes', esbl: 'no', notes: 'CA-MRSA (SSTI); UTI; PJP prophylaxis; hyperkalemia; rash' },
  { name: 'Doxycycline', class: 'Tetracycline', gramPos: 'some', gramNeg: 'some', anaerobes: 'no', atypicals: 'yes', pseudomonas: 'no', mrsa: 'some', esbl: 'no', notes: 'Atypicals, SSTI (CA-MRSA), tick-borne, STIs; photosensitivity' },
  { name: 'Azithromycin', class: 'Macrolide', gramPos: 'yes', gramNeg: 'some', anaerobes: 'no', atypicals: 'yes', pseudomonas: 'no', mrsa: 'no', esbl: 'no', notes: 'CAP (atypical coverage), STIs; QTc prolongation; increasing resistance' },
  { name: 'Clindamycin', class: 'Lincosamide', gramPos: 'yes', gramNeg: 'no', anaerobes: 'yes', atypicals: 'no', pseudomonas: 'no', mrsa: 'some', esbl: 'no', notes: 'Good for MSSA/some MRSA + anaerobes; C. diff risk; bone penetration' },
  { name: 'Nitrofurantoin', class: 'Nitrofuran', gramPos: 'yes', gramNeg: 'some', anaerobes: 'no', atypicals: 'no', pseudomonas: 'no', mrsa: 'no', esbl: 'some', notes: 'UTI only (no systemic); avoid if CrCl < 30; safe in pregnancy' },
  { name: 'Fosfomycin', class: 'Phosphonic acid', gramPos: 'yes', gramNeg: 'yes', anaerobes: 'no', atypicals: 'no', pseudomonas: 'no', mrsa: 'some', esbl: 'yes', notes: 'Single-dose uncomplicated UTI; some ESBL/VRE activity' },

  // Antifungals
  { name: 'Fluconazole', class: 'Azole Antifungal', gramPos: 'no', gramNeg: 'no', anaerobes: 'no', atypicals: 'no', pseudomonas: 'no', mrsa: 'no', esbl: 'no', notes: 'Candida albicans/tropicalis/parapsilosis; variable/SDD against Nakaseomyces glabrata (C. glabrata); intrinsic resistance in Pichia kudriavzevii (C. krusei); CNS penetration; many drug interactions' },
  { name: 'Micafungin', class: 'Echinocandin', gramPos: 'no', gramNeg: 'no', anaerobes: 'no', atypicals: 'no', pseudomonas: 'no', mrsa: 'no', esbl: 'no', notes: 'Empiric candidemia (covers most Candida spp); NO CNS penetration; NO mold activity' },
];

const COV_CELL: Record<Coverage, { bg: string; text: string; label: string }> = {
  yes: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: '✓' },
  some: { bg: 'bg-amber-100', text: 'text-amber-800', label: '±' },
  no: { bg: 'bg-slate-100', text: 'text-slate-400', label: '—' },
  resistant: { bg: 'bg-red-100', text: 'text-red-700', label: 'R' },
};

const COLUMNS = [
  { key: 'gramPos' as const, label: 'Gram+' },
  { key: 'gramNeg' as const, label: 'Gram-' },
  { key: 'anaerobes' as const, label: 'Anaer.' },
  { key: 'atypicals' as const, label: 'Atyp.' },
  { key: 'pseudomonas' as const, label: 'Pseudo.' },
  { key: 'mrsa' as const, label: 'MRSA' },
  { key: 'esbl' as const, label: 'ESBL' },
];

export function AntimicrobialSpectrum() {
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');

  const classes = [...new Set(ANTIBIOTICS.map(a => a.class))];

  const filtered = useMemo(() => {
    return ANTIBIOTICS.filter(a => {
      const q = search.toLowerCase();
      const matchSearch = !q || a.name.toLowerCase().includes(q) || a.class.toLowerCase().includes(q) || a.notes.toLowerCase().includes(q);
      const matchClass = selectedClass === 'All' || a.class === selectedClass;
      return matchSearch && matchClass;
    });
  }, [search, selectedClass]);

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        <span className="flex items-center gap-1"><span className="w-5 h-5 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">✓</span> Good coverage</span>
        <span className="flex items-center gap-1"><span className="w-5 h-5 rounded bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[10px]">±</span> Variable/partial</span>
        <span className="flex items-center gap-1"><span className="w-5 h-5 rounded bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-[10px]">—</span> No coverage</span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search antibiotics..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
        </div>
        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}
          className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer">
          <option value="All">All Classes ({ANTIBIOTICS.length})</option>
          {classes.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-3 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider sticky left-0 bg-slate-50 z-10">Antibiotic</th>
                {COLUMNS.map(c => (
                  <th key={c.key} className="text-center px-2 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{c.label}</th>
                ))}
                <th className="text-left px-3 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((abx, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-3 py-2 sticky left-0 bg-white z-10">
                    <span className="font-semibold text-slate-800 text-sm">{abx.name}</span>
                    <span className="text-[10px] text-slate-400 block">{abx.class}</span>
                  </td>
                  {COLUMNS.map(c => {
                    const cov = abx[c.key];
                    const style = COV_CELL[cov];
                    return (
                      <td key={c.key} className="px-2 py-2 text-center">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${style.bg} ${style.text}`}>
                          {style.label}
                        </span>
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-xs text-slate-500 max-w-xs hidden lg:table-cell">{abx.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="text-center py-8 text-sm text-slate-400">No antibiotics match your search.</div>}
      </div>

      <p className="text-[10px] text-slate-400">
        Spectrum data is generalized. Actual susceptibility depends on local antibiogram, patient factors, and infection site. Always check culture &amp; sensitivity results.
      </p>
    </div>
  );
}
