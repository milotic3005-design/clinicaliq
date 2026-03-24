'use client';

import { useState } from 'react';
import { Calculator } from 'lucide-react';
import { VancoCalculator } from './vancomycin-calculator';

export function ClinicalCalculatorContainer() {
  const [activeCalc, setActiveCalc] = useState('crcl');
  const [wtUnit, setWtUnit] = useState('kg');
  const [htUnit, setHtUnit] = useState('cm');
  const [crclAge, setCrclAge] = useState('');
  const [crclWt, setCrclWt] = useState('');
  const [crclScr, setCrclScr] = useState('');
  const [crclFemale, setCrclFemale] = useState(false);
  const [adjHt, setAdjHt] = useState('');
  const [adjWt, setAdjWt] = useState('');
  const [adjFemale, setAdjFemale] = useState(false);
  const [ironWt, setIronWt] = useState('');
  const [ironHgb, setIronHgb] = useState('');
  const targetHgb = 15;
  const [ca, setCa] = useState('');
  const [alb, setAlb] = useState('');

  const toggleWt = () => setWtUnit(w => w === 'kg' ? 'lb' : 'kg');
  const toggleHt = () => setHtUnit(h => h === 'cm' ? 'in' : 'cm');

  const calculateCrCl = () => {
    const wtKg = wtUnit === 'lb' ? parseFloat(crclWt) / 2.20462 : parseFloat(crclWt);
    if (parseFloat(crclAge) > 0 && wtKg > 0 && parseFloat(crclScr) > 0) {
      let val = ((140 - parseFloat(crclAge)) * wtKg) / (72 * parseFloat(crclScr));
      if (crclFemale) val *= 0.85;
      return val.toFixed(1);
    }
    return '0.0';
  };

  const calculateAdjBW = () => {
    const htIn = htUnit === 'cm' ? parseFloat(adjHt) / 2.54 : parseFloat(adjHt);
    const wtKg = wtUnit === 'lb' ? parseFloat(adjWt) / 2.20462 : parseFloat(adjWt);
    if (htIn > 0 && wtKg > 0) {
      const inchesOver5Ft = htIn - 60;
      const baseWeight = adjFemale ? 45.5 : 50;
      let ibw = baseWeight + (2.3 * inchesOver5Ft);
      if (inchesOver5Ft < 0) ibw = baseWeight;
      if (wtKg <= ibw) return wtKg.toFixed(1);
      return (ibw + 0.4 * (wtKg - ibw)).toFixed(1);
    }
    return '0.0';
  };

  const calculateIron = () => {
    const wtKg = wtUnit === 'lb' ? parseFloat(ironWt) / 2.20462 : parseFloat(ironWt);
    if (wtKg > 0 && parseFloat(ironHgb) > 0) {
      const deficit = (wtKg * (targetHgb - parseFloat(ironHgb)) * 2.4) + 500;
      return deficit > 0 ? Math.round(deficit) : 0;
    }
    return '0';
  };

  const calculateCa = () => {
    if (parseFloat(ca) > 0 && parseFloat(alb) > 0) return (parseFloat(ca) + 0.8 * (4.0 - parseFloat(alb))).toFixed(2);
    return '0.00';
  };

  const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2";

  const UnitToggle = ({ unit, onClick }: { unit: string; onClick: () => void }) => (
    <button type="button" onClick={onClick} className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-200/80 hover:bg-slate-300 text-slate-700 text-[10px] font-bold rounded-lg transition-colors uppercase">{unit}</button>
  );

  return (
    <div className={`bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex flex-col h-full ${activeCalc === 'vanco' ? 'col-span-1 xl:col-span-2' : 'col-span-1 lg:col-span-2 xl:col-span-1'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 border-b border-slate-100 pb-4 gap-3">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Calculator className="text-blue-500 w-5 h-5 flex-shrink-0" /> Clinical Utilities
        </h3>
        <select className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer appearance-none pr-8" value={activeCalc} onChange={e => setActiveCalc(e.target.value)}>
          <option value="crcl">CrCl (Cockcroft-Gault)</option>
          <option value="adjbw">Adjusted Body Weight</option>
          <option value="iron">Iron Deficit (Ganzoni)</option>
          <option value="calcium">Corrected Calcium</option>
          <option value="vanco">Vancomycin Dosing & PK</option>
        </select>
      </div>

      <div className="flex-1">
        {activeCalc === 'vanco' && <VancoCalculator />}

        {activeCalc === 'crcl' && (
          <div className="space-y-4 animate-in fade-in duration-300 max-w-sm">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Age (yrs)</label><input type="number" value={crclAge} onChange={e => setCrclAge(e.target.value)} placeholder="e.g., 65" className={`${inputCls} focus:ring-blue-500/20 focus:border-blue-500`} /></div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Weight</label><div className="relative"><input type="number" value={crclWt} onChange={e => setCrclWt(e.target.value)} placeholder={wtUnit === 'kg' ? "70" : "154"} className={`${inputCls} focus:ring-blue-500/20 focus:border-blue-500 pr-12`} /><UnitToggle unit={wtUnit} onClick={toggleWt} /></div></div>
            </div>
            <div className="grid grid-cols-2 gap-4 items-end">
              <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">SCr (mg/dL)</label><input type="number" step="0.1" value={crclScr} onChange={e => setCrclScr(e.target.value)} placeholder="e.g., 1.2" className={`${inputCls} focus:ring-blue-500/20 focus:border-blue-500`} /></div>
              <div className="pb-1"><label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors"><input type="checkbox" checked={crclFemale} onChange={e => setCrclFemale(e.target.checked)} className="w-4 h-4 rounded text-blue-500" /><span className="text-sm font-semibold text-slate-700">Female</span></label></div>
            </div>
            <div className="mt-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 flex justify-between items-center"><span className="text-sm font-semibold text-blue-800">Est. CrCl</span><span className="text-xl font-bold text-blue-600">{calculateCrCl()} <span className="text-sm text-blue-500/70">mL/min</span></span></div>
          </div>
        )}

        {activeCalc === 'adjbw' && (
          <div className="space-y-4 animate-in fade-in duration-300 max-w-sm">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Height</label><div className="relative"><input type="number" value={adjHt} onChange={e => setAdjHt(e.target.value)} placeholder={htUnit === 'cm' ? "170" : "67"} className={`${inputCls} focus:ring-emerald-500/20 focus:border-emerald-500 pr-12`} /><UnitToggle unit={htUnit} onClick={toggleHt} /></div></div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Actual Wt</label><div className="relative"><input type="number" value={adjWt} onChange={e => setAdjWt(e.target.value)} placeholder={wtUnit === 'kg' ? "90" : "198"} className={`${inputCls} focus:ring-emerald-500/20 focus:border-emerald-500 pr-12`} /><UnitToggle unit={wtUnit} onClick={toggleWt} /></div></div>
            </div>
            <div className="pb-1 pt-2"><label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors w-fit"><input type="checkbox" checked={adjFemale} onChange={e => setAdjFemale(e.target.checked)} className="w-4 h-4 rounded text-emerald-500" /><span className="text-sm font-semibold text-slate-700">Female Patient</span></label></div>
            <div className="mt-4 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50 flex justify-between items-center"><span className="text-sm font-semibold text-emerald-800">Adjusted BW</span><span className="text-xl font-bold text-emerald-600">{calculateAdjBW()} <span className="text-sm text-emerald-500/70">kg</span></span></div>
          </div>
        )}

        {activeCalc === 'iron' && (
          <div className="space-y-4 animate-in fade-in duration-300 max-w-sm">
            <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Weight</label><div className="relative"><input type="number" value={ironWt} onChange={e => setIronWt(e.target.value)} placeholder={wtUnit === 'kg' ? "75" : "165"} className={`${inputCls} focus:ring-amber-500/20 focus:border-amber-500 pr-12`} /><UnitToggle unit={wtUnit} onClick={toggleWt} /></div></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Actual Hgb</label><input type="number" step="0.1" value={ironHgb} onChange={e => setIronHgb(e.target.value)} placeholder="e.g., 9.5" className={`${inputCls} focus:ring-amber-500/20 focus:border-amber-500`} /></div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Target Hgb</label><input type="number" value={targetHgb} disabled className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 cursor-not-allowed" /></div>
            </div>
            <div className="mt-4 bg-amber-50/50 p-4 rounded-xl border border-amber-100/50 flex justify-between items-center"><span className="text-sm font-semibold text-amber-800">Total Deficit</span><span className="text-xl font-bold text-amber-600">{calculateIron()} <span className="text-sm text-amber-500/70">mg</span></span></div>
          </div>
        )}

        {activeCalc === 'calcium' && (
          <div className="space-y-4 animate-in fade-in duration-300 max-w-sm">
            <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Serum Calcium (mg/dL)</label><input type="number" step="0.1" value={ca} onChange={e => setCa(e.target.value)} placeholder="e.g., 8.2" className={`${inputCls} focus:ring-rose-500/20 focus:border-rose-500`} /></div>
            <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Serum Albumin (g/dL)</label><input type="number" step="0.1" value={alb} onChange={e => setAlb(e.target.value)} placeholder="e.g., 2.8" className={`${inputCls} focus:ring-rose-500/20 focus:border-rose-500`} /></div>
            <div className="mt-4 bg-rose-50/50 p-4 rounded-xl border border-rose-100/50 flex justify-between items-center"><span className="text-sm font-semibold text-rose-800">Corrected Ca</span><span className="text-xl font-bold text-rose-600">{calculateCa()} <span className="text-sm text-rose-500/70">mg/dL</span></span></div>
          </div>
        )}
      </div>
    </div>
  );
}
