'use client';

import { useState } from 'react';
import { X, Calculator, SlidersHorizontal, ListChecks, Info } from 'lucide-react';
import type { Drug } from '@/lib/iv-reference-types';
import { CADD_DEFAULTS } from '@/data/drug-database';

export function CaddModal({ isOpen, onClose, drugDb }: { isOpen: boolean; onClose: () => void; drugDb: Drug[] }) {
  const [selectedId, setSelectedId] = useState('');
  const [dose, setDose] = useState(4500);
  const [freq, setFreq] = useState(8);
  const [conc, setConc] = useState(33.75);
  const [kvo, setKvo] = useState(2);
  const [lineVol, setLineVol] = useState(20);

  if (!isOpen) return null;

  const abxList = drugDb.filter(d => d.category === 'Antibiotic').sort((a, b) => a.genericName.localeCompare(b.genericName));
  const selectedDrug = drugDb.find(d => d.id === selectedId);

  const handleDrugChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedId(id);
    const drug = drugDb.find(d => d.id === id);
    if (drug && CADD_DEFAULTS[drug.genericName]) {
      const def = CADD_DEFAULTS[drug.genericName];
      setDose(def.dose);
      setFreq(def.freq);
      setConc(def.conc);
      setKvo(def.kvo);
    }
  };

  const freqPerDay = freq > 0 ? (24 / freq) : 0;

  const getPracticalBagVol = (days: number) => {
    const drugV = conc > 0 ? ((dose * freqPerDay * days) / conc) : 0;
    const kvoV = kvo * 24 * days;
    const exactTotal = drugV + kvoV + lineVol;
    return Math.ceil(exactTotal / 10) * 10;
  };

  const getVialInstructions = (finalDoseMg: number) => {
    if (!selectedDrug || !finalDoseMg) return [];
    if (selectedDrug.vialSizes.some(v => v.toLowerCase().includes('premix'))) return [{ text: "Premixed Bag", cls: "text-blue-600 bg-blue-50" }];

    const sizes: { orig: string; mg: number }[] = [];
    selectedDrug.vialSizes.forEach(v => {
      const str = v.toLowerCase();
      const match = str.match(/([\d.]+)\s*(mg|g|million units)/);
      if (match) {
        let val = parseFloat(match[1]);
        if (match[2] === 'g') val *= 1000;
        if (match[2] === 'million units') val *= 1000000;
        sizes.push({ orig: v, mg: val });
      }
    });
    if (sizes.length === 0) return [{ text: "Use std vials", cls: "text-slate-700 bg-slate-200" }];
    sizes.sort((a, b) => b.mg - a.mg);

    let remaining = finalDoseMg;
    const combo: Record<string, number> = {};
    for (const v of sizes) {
      if (remaining <= 0) break;
      const count = Math.floor(remaining / v.mg);
      if (count > 0) { combo[v.orig] = count; remaining -= count * v.mg; }
    }
    if (remaining > 0.01) {
      let added = false;
      for (let i = sizes.length - 1; i >= 0; i--) {
        if (sizes[i].mg >= remaining) { combo[sizes[i].orig] = (combo[sizes[i].orig] || 0) + 1; added = true; break; }
      }
      if (!added) combo[sizes[0].orig] = (combo[sizes[0].orig] || 0) + 1;
    }
    return Object.entries(combo).map(([k, count]) => ({ text: `${count} x ${k}`, cls: "bg-slate-200 text-slate-800" }));
  };

  const daysArr = [1, 2, 3, 4, 5];
  const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}>
      <div className="bg-sky-50 rounded-[32px] w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white/20 relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="bg-white/80 backdrop-blur-xl px-8 py-6 border-b border-slate-200/50 flex justify-between items-start sticky top-0 z-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl"><Calculator className="w-6 h-6" /></div>
              CADD Bag Calculator
            </h2>
            <p className="text-base font-semibold text-slate-500 mt-2">Continuous Ambulatory Delivery Device compounding calculator</p>
          </div>
          <button onClick={onClose} className="bg-slate-100 hover:bg-slate-200 text-slate-500 p-2.5 rounded-full transition-colors flex-shrink-0" aria-label="Close calculator"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-sky-50/50 flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/3 space-y-6">
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
              <h4 className="font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2"><SlidersHorizontal className="w-5 h-5 text-emerald-500" /> Parameters</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Antibiotic</label>
                  <select value={selectedId} onChange={handleDrugChange} className={`${inputCls} appearance-none pr-10`}>
                    <option value="">Select Drug...</option>
                    {abxList.map(d => <option key={d.id} value={d.id}>{d.genericName} ({d.brandName})</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Dose (mg)</label><input type="number" value={dose} onChange={e => setDose(parseFloat(e.target.value) || 0)} className={inputCls} /></div>
                  <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Freq (q _ hr)</label><input type="number" value={freq} onChange={e => setFreq(parseFloat(e.target.value) || 0)} className={inputCls} /></div>
                </div>
                <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Concentration (mg/mL)</label><input type="number" step="0.01" value={conc} onChange={e => setConc(parseFloat(e.target.value) || 0)} className={inputCls} /></div>
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">KVO (mL/hr)</label><input type="number" step="0.1" value={kvo} onChange={e => setKvo(parseFloat(e.target.value) || 0)} className={inputCls} /></div>
                  <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Line Vol (mL)</label><input type="number" value={lineVol} onChange={e => setLineVol(parseFloat(e.target.value) || 0)} className={inputCls} /></div>
                </div>
              </div>
            </div>
            {selectedDrug && (
              <div className="bg-blue-50/50 rounded-[24px] p-6 border border-blue-100/50 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2 border-b border-blue-100/60 pb-3"><Info className="w-5 h-5" /> Drug Reference</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-start gap-4"><span className="text-blue-700 font-medium">Reconst. Conc:</span><span className="text-slate-900 font-semibold text-right">{selectedDrug.reconstitution?.concentration || "N/A"}</span></div>
                  <div className="flex justify-between items-start gap-4"><span className="text-blue-700 font-medium">Pref. Diluent:</span><span className="text-slate-900 font-semibold text-right">{selectedDrug.dilution?.preferredDiluent || "N/A"}</span></div>
                  <div className="flex justify-between items-start gap-4"><span className="text-blue-700 font-medium">BUD (RT):</span><span className="text-slate-900 font-semibold text-right">{selectedDrug.bud?.roomTemp || "N/A"}</span></div>
                  <div className="flex justify-between items-start gap-4"><span className="text-blue-700 font-medium">BUD (Ref):</span><span className="text-slate-900 font-semibold text-right">{selectedDrug.bud?.refrigerated || "N/A"}</span></div>
                </div>
              </div>
            )}
          </div>

          <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden h-full flex flex-col">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h4 className="font-bold text-slate-900 flex items-center gap-2"><ListChecks className="w-5 h-5 text-emerald-500" /> Calculated Requirements by Duration</h4>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-100/50 border-b border-slate-200/60 text-slate-500 text-xs uppercase tracking-wider font-bold">
                      <th className="p-4 pl-6 whitespace-nowrap">Metric</th>
                      {daysArr.map(d => <th key={d} className="p-4 text-center border-l border-slate-200/30">{d} Day</th>)}
                    </tr>
                  </thead>
                  <tbody className="text-sm font-medium">
                    <tr className="bg-white border-b border-slate-100">
                      <td className="p-4 pl-6 text-slate-500 text-xs align-top">Calculated Drug Vol (mL)</td>
                      {daysArr.map(d => <td key={d} className="p-4 text-center border-l border-slate-100 align-top text-slate-500 text-xs">{conc > 0 ? ((dose * freqPerDay * d) / conc).toFixed(1) : '0'}</td>)}
                    </tr>
                    <tr className="bg-white border-b border-slate-100">
                      <td className="p-4 pl-6 text-slate-500 text-xs align-top">Calculated KVO Vol (mL)</td>
                      {daysArr.map(d => <td key={d} className="p-4 text-center border-l border-slate-100 align-top text-slate-500 text-xs">{(kvo * 24 * d).toFixed(1)}</td>)}
                    </tr>
                    <tr className="bg-white border-b border-slate-100">
                      <td className="p-4 pl-6 text-slate-500 text-xs align-top">Line Volume (mL)</td>
                      {daysArr.map(d => <td key={d} className="p-4 text-center border-l border-slate-100 align-top text-slate-500 text-xs">{lineVol}</td>)}
                    </tr>
                    <tr className="bg-emerald-50/50 border-b border-slate-100">
                      <td className="p-4 pl-6 align-top"><span className="text-slate-900 font-bold block">Practical Bag Volume (mL)</span><span className="text-[10px] text-emerald-600 font-normal leading-none uppercase">Rounded up to nearest 10mL</span></td>
                      {daysArr.map(d => <td key={d} className="p-4 text-center border-l border-slate-100 align-top text-slate-900 font-bold text-lg">{getPracticalBagVol(d)}</td>)}
                    </tr>
                    <tr className="bg-white border-b border-slate-100">
                      <td className="p-4 pl-6 align-top"><span className="text-emerald-700 font-bold block">Final Bag Dose</span><span className="text-[10px] text-emerald-600/70 font-normal leading-none uppercase">Adjusted for volume</span></td>
                      {daysArr.map(d => {
                        const mg = getPracticalBagVol(d) * conc;
                        const displayStr = mg >= 1000 ? (mg / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 }) + ' g' : Math.round(mg) + ' mg';
                        return (
                          <td key={d} className="p-4 text-center border-l border-slate-100 align-top">
                            <span className="text-emerald-700 font-bold block text-base">{displayStr}</span>
                            <div className="text-[10px] text-slate-400 font-normal mt-0.5">{Math.round(mg).toLocaleString()} mg</div>
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="p-4 pl-6 text-slate-700 text-xs align-top">Vials to Draw Up</td>
                      {daysArr.map(d => {
                        const mg = getPracticalBagVol(d) * conc;
                        const instructions = getVialInstructions(mg);
                        return (
                          <td key={d} className="p-4 text-center border-l border-slate-100 align-top">
                            <div className="flex flex-col items-center gap-1">
                              {instructions.map((inst, idx) => (
                                <span key={idx} className={`inline-block px-1.5 py-0.5 rounded whitespace-nowrap text-[11px] uppercase tracking-wide font-bold ${inst.cls}`}>{inst.text}</span>
                              ))}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl px-8 py-5 border-t border-slate-200/50 flex justify-end items-center gap-4">
          <button onClick={onClose} className="w-full sm:w-auto px-8 py-3 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition-all shadow-sm">Close Calculator</button>
        </div>
      </div>
    </div>
  );
}
