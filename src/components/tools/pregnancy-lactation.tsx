'use client';

import { useState } from 'react';
import { Search, ExternalLink, Loader2, Baby, Heart } from 'lucide-react';

interface SafetyEntry {
  drug: string;
  pregnancy: 'safe' | 'caution' | 'avoid' | 'contraindicated';
  pregnancyNotes: string;
  lactation: 'safe' | 'caution' | 'avoid' | 'unknown';
  lactationNotes: string;
  alternatives?: string;
}

const SAFETY_STYLES: Record<string, { bg: string; border: string; text: string; label: string }> = {
  safe: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', label: 'Generally Safe' },
  caution: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', label: 'Use with Caution' },
  avoid: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', label: 'Avoid if Possible' },
  contraindicated: { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-800', label: 'Contraindicated' },
  unknown: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-600', label: 'Insufficient Data' },
};

const SAFETY_DATA: SafetyEntry[] = [
  // Antibiotics
  { drug: 'Amoxicillin', pregnancy: 'safe', pregnancyNotes: 'No known teratogenic risk. Widely used in pregnancy.', lactation: 'safe', lactationNotes: 'Excreted in breast milk in small amounts. Compatible with breastfeeding.', alternatives: '' },
  { drug: 'Cephalexin', pregnancy: 'safe', pregnancyNotes: 'No teratogenic risk. First-line for UTI in pregnancy.', lactation: 'safe', lactationNotes: 'Low levels in milk. Compatible.', alternatives: '' },
  { drug: 'Azithromycin', pregnancy: 'safe', pregnancyNotes: 'No evidence of harm. Used for STI treatment in pregnancy.', lactation: 'safe', lactationNotes: 'Low levels in breast milk. Compatible.', alternatives: '' },
  { drug: 'Nitrofurantoin', pregnancy: 'caution', pregnancyNotes: 'Avoid in 1st trimester (meta-analyses show signal for cardiac malformations and neural tube defects). Safe in 2nd trimester. Avoid at ≥ 36 weeks — neonatal hemolytic anemia risk. Use alternatives if available in 1st trimester.', lactation: 'safe', lactationNotes: 'Compatible. Avoid if infant has G6PD deficiency.', alternatives: 'Cephalexin, Amoxicillin-Clavulanate' },
  { drug: 'TMP-SMX', pregnancy: 'avoid', pregnancyNotes: 'Folate antagonist — neural tube defects in 1st trimester. Kernicterus risk near term. Avoid throughout pregnancy if possible.', lactation: 'caution', lactationNotes: 'Avoid in jaundiced, premature, or G6PD-deficient infants.', alternatives: 'Amoxicillin, Cephalexin, Nitrofurantoin (2nd tri)' },
  { drug: 'Doxycycline', pregnancy: 'contraindicated', pregnancyNotes: 'Tooth discoloration, enamel hypoplasia, bone growth inhibition after 15 weeks. Contraindicated after 1st trimester.', lactation: 'avoid', lactationNotes: 'AAP suggests compatible for short courses; most experts recommend avoidance.', alternatives: 'Azithromycin, Amoxicillin' },
  { drug: 'Ciprofloxacin', pregnancy: 'avoid', pregnancyNotes: 'Cartilage damage in animal studies. Avoid unless no alternatives.', lactation: 'caution', lactationNotes: 'Excreted in milk. Consider alternatives; if used, monitor infant.', alternatives: 'Cephalosporins, Azithromycin' },
  { drug: 'Metronidazole', pregnancy: 'caution', pregnancyNotes: 'Avoid in 1st trimester if possible (animal mutagenicity). Safe in 2nd/3rd trimester for BV, trichomoniasis.', lactation: 'caution', lactationNotes: 'Significant milk levels. Withhold breastfeeding for 12–24h after single dose; compatible with standard dosing per AAP.', alternatives: '' },
  { drug: 'Vancomycin', pregnancy: 'caution', pregnancyNotes: 'Limited data. Use if benefits outweigh risks. Auditory and renal monitoring recommended.', lactation: 'safe', lactationNotes: 'Poorly absorbed orally. Very low bioavailability to infant.', alternatives: '' },

  // Cardiovascular
  { drug: 'Labetalol', pregnancy: 'safe', pregnancyNotes: 'First-line antihypertensive in pregnancy. Safe throughout.', lactation: 'safe', lactationNotes: 'Small amounts in milk. Compatible.', alternatives: '' },
  { drug: 'Nifedipine', pregnancy: 'safe', pregnancyNotes: 'Second-line antihypertensive. Also used as tocolytic.', lactation: 'safe', lactationNotes: 'Low milk levels. Compatible.', alternatives: '' },
  { drug: 'Methyldopa', pregnancy: 'safe', pregnancyNotes: 'Longest safety record in pregnancy hypertension.', lactation: 'safe', lactationNotes: 'Compatible.', alternatives: '' },
  { drug: 'ACE Inhibitors (e.g., lisinopril)', pregnancy: 'contraindicated', pregnancyNotes: 'CONTRAINDICATED in all trimesters. Renal agenesis, oligohydramnios, fetal death in 2nd/3rd tri. Skull ossification defects.', lactation: 'caution', lactationNotes: 'Enalapril/captopril compatible per AAP; avoid others.', alternatives: 'Labetalol, Nifedipine, Methyldopa' },
  { drug: 'ARBs (e.g., losartan)', pregnancy: 'contraindicated', pregnancyNotes: 'Same fetotoxicity as ACEi. Contraindicated in all trimesters.', lactation: 'avoid', lactationNotes: 'Insufficient data. Avoid.', alternatives: 'Labetalol, Nifedipine, Methyldopa' },
  { drug: 'Warfarin', pregnancy: 'contraindicated', pregnancyNotes: 'Warfarin embryopathy (1st tri). CNS defects throughout. Use LMWH instead.', lactation: 'safe', lactationNotes: 'Does not pass into breast milk in active form. Compatible.', alternatives: 'Enoxaparin, Dalteparin (LMWH)' },
  { drug: 'Enoxaparin', pregnancy: 'safe', pregnancyNotes: 'Does not cross placenta. Safe for VTE treatment/prophylaxis.', lactation: 'safe', lactationNotes: 'Not absorbed orally. Compatible.', alternatives: '' },
  { drug: 'Statins', pregnancy: 'contraindicated', pregnancyNotes: 'Cholesterol needed for fetal development. Teratogenic in animals. Discontinue before conception.', lactation: 'avoid', lactationNotes: 'Limited data. Avoid during lactation.', alternatives: 'Discontinue; manage with diet/lifestyle' },

  // Pain
  { drug: 'Acetaminophen', pregnancy: 'safe', pregnancyNotes: 'Analgesic of choice in pregnancy. Use lowest effective dose.', lactation: 'safe', lactationNotes: 'Compatible. Standard doses safe.', alternatives: '' },
  { drug: 'Ibuprofen', pregnancy: 'avoid', pregnancyNotes: 'Avoid after 20 weeks — oligohydramnios, premature DA closure. Short use ok in 1st/early 2nd tri.', lactation: 'safe', lactationNotes: 'Preferred NSAID in lactation. Minimal milk transfer.', alternatives: 'Acetaminophen' },
  { drug: 'Aspirin (low-dose)', pregnancy: 'safe', pregnancyNotes: 'Low-dose (81mg) recommended for preeclampsia prevention in high-risk patients starting 12-16 wks.', lactation: 'caution', lactationNotes: 'Low-dose likely safe. Avoid high-dose (Reye syndrome risk).', alternatives: '' },

  // Psych
  { drug: 'Sertraline', pregnancy: 'safe', pregnancyNotes: 'Preferred SSRI in pregnancy. No major teratogenic risk. Neonatal adaptation syndrome possible.', lactation: 'safe', lactationNotes: 'Lowest milk levels of SSRIs. First-line antidepressant in breastfeeding.', alternatives: '' },
  { drug: 'Fluoxetine', pregnancy: 'caution', pregnancyNotes: 'Widely studied. Some concern for neonatal adaptation; long half-life. Consider sertraline.', lactation: 'caution', lactationNotes: 'Higher milk levels than sertraline. Active metabolite accumulates in infant. Monitor.', alternatives: 'Sertraline' },
  { drug: 'Valproic Acid', pregnancy: 'contraindicated', pregnancyNotes: 'Neural tube defects (~6%), cognitive impairment, craniofacial defects. Contraindicated. Switch before conception.', lactation: 'caution', lactationNotes: 'Low milk levels. Generally compatible but monitor infant.', alternatives: 'Lamotrigine, Levetiracetam' },
  { drug: 'Lamotrigine', pregnancy: 'safe', pregnancyNotes: 'Preferred mood stabilizer/AED in pregnancy. Levels decrease — may need dose increase.', lactation: 'caution', lactationNotes: 'Significant milk levels. Monitor infant for rash, feeding changes.', alternatives: '' },

  // Endocrine
  { drug: 'Levothyroxine', pregnancy: 'safe', pregnancyNotes: 'Essential. Increase dose 25-50% early in pregnancy. Monitor TSH q4 weeks.', lactation: 'safe', lactationNotes: 'Minimal milk transfer. Compatible.', alternatives: '' },
  { drug: 'Insulin', pregnancy: 'safe', pregnancyNotes: 'Does not cross placenta. Dose requirements increase 2nd/3rd tri.', lactation: 'safe', lactationNotes: 'Destroyed in GI tract. Safe.', alternatives: '' },
  { drug: 'Metformin', pregnancy: 'caution', pregnancyNotes: 'Crosses placenta. Used for GDM if insulin refused; no teratogenic risk. Insulin preferred.', lactation: 'safe', lactationNotes: 'Low milk levels. Compatible.', alternatives: 'Insulin (preferred)' },
];

export function PregnancyLactation() {
  const [search, setSearch] = useState('');
  const [lactmedQuery, setLactmedQuery] = useState('');
  const [lactmedResult, setLactmedResult] = useState<{ title: string; summary: string; url: string } | null>(null);
  const [lactmedLoading, setLactmedLoading] = useState(false);

  const filtered = SAFETY_DATA.filter(d => {
    const q = search.toLowerCase();
    return !q || d.drug.toLowerCase().includes(q) || d.pregnancyNotes.toLowerCase().includes(q) || d.lactationNotes.toLowerCase().includes(q);
  });

  const searchLactMed = async () => {
    if (!lactmedQuery.trim()) return;
    setLactmedLoading(true);
    setLactmedResult(null);
    try {
      // Use our own API to avoid CORS
      const res = await fetch(`/api/v1/lactmed?drug=${encodeURIComponent(lactmedQuery.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setLactmedResult(data.result || null);
      }
    } catch { /* ignore */ }
    setLactmedLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* LactMed live search */}
      <div className="bg-purple-50/50 border border-purple-200 rounded-2xl p-4">
        <h4 className="flex items-center gap-2 text-sm font-bold text-purple-900 mb-2">
          <Baby className="w-4 h-4" /> LactMed Live Search (NIH)
        </h4>
        <p className="text-xs text-purple-700 mb-3">Search any drug for NIH breastfeeding safety data from the LactMed database.</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter drug name..."
            value={lactmedQuery}
            onChange={(e) => setLactmedQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchLactMed()}
            className="flex-1 px-3 py-2 text-sm bg-white border border-purple-200 rounded-xl placeholder:text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400"
          />
          <button onClick={searchLactMed} disabled={lactmedLoading || !lactmedQuery.trim()}
            className="px-4 py-2 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl transition-colors flex items-center gap-1.5">
            {lactmedLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            Search
          </button>
        </div>
        {lactmedResult && (
          <div className="mt-3 bg-white border border-purple-100 rounded-xl p-3">
            <p className="text-sm font-bold text-slate-900">{lactmedResult.title}</p>
            <p className="text-xs text-slate-600 mt-1 line-clamp-4">{lactmedResult.summary}</p>
            <a href={lactmedResult.url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-700 mt-2">
              Full NIH LactMed Monograph <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
        {lactmedLoading === false && lactmedResult === null && lactmedQuery && (
          <p className="text-xs text-purple-400 mt-2">No LactMed entry found. Try the generic drug name.</p>
        )}
      </div>

      {/* Quick reference table */}
      <div>
        <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3">
          <Heart className="w-4 h-4 text-pink-500" /> Quick Reference — Common Drugs
        </h4>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Filter drugs..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>

        <div className="space-y-2">
          {filtered.map((d, i) => {
            const pregStyle = SAFETY_STYLES[d.pregnancy];
            const lacStyle = SAFETY_STYLES[d.lactation];
            return (
              <div key={i} className="border border-slate-200 rounded-2xl p-4 hover:border-blue-200 transition-colors">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="font-bold text-slate-900 text-sm">{d.drug}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${pregStyle.bg} ${pregStyle.text} ${pregStyle.border} border`}>
                    🤰 {pregStyle.label}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${lacStyle.bg} ${lacStyle.text} ${lacStyle.border} border`}>
                    🤱 {lacStyle.label}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-500">Pregnancy:</span>
                    <p className="text-slate-700 mt-0.5">{d.pregnancyNotes}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500">Lactation:</span>
                    <p className="text-slate-700 mt-0.5">{d.lactationNotes}</p>
                  </div>
                </div>
                {d.alternatives && (
                  <p className="text-[10px] text-blue-600 mt-2 font-medium">
                    Alternatives: {d.alternatives}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        {filtered.length === 0 && <div className="text-center py-8 text-sm text-slate-400">No drugs match your search.</div>}
      </div>

      <p className="text-[10px] text-slate-400">
        Safety classifications are general guidance based on current evidence. Always consult LactMed, FDA labeling, and maternal-fetal medicine for individual patient decisions. The FDA no longer uses letter categories (A/B/C/D/X) — the PLLR (Pregnancy and Lactation Labeling Rule) requires descriptive labeling.
      </p>
    </div>
  );
}
