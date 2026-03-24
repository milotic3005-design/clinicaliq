'use client';

import { useState } from 'react';
import { Activity, Clock } from 'lucide-react';

export function VancoCalculator() {
  const [sex, setSex] = useState('M');
  const [age, setAge] = useState('');
  const [wt, setWt] = useState('');
  const [ht, setHt] = useState('');
  const [scr, setScr] = useState('');
  const [cDose, setCDose] = useState('');
  const [cInterval, setCInterval] = useState('12');
  const [tdmMethod, setTdmMethod] = useState('single');
  const [troughSingle, setTroughSingle] = useState('');
  const [peak, setPeak] = useState('');
  const [troughTwo, setTroughTwo] = useState('');
  const [tInf, setTInf] = useState('');
  const [tToPeak, setTToPeak] = useState('');
  const [tBetween, setTBetween] = useState('');
  const [targetParam, setTargetParam] = useState('auc-500');

  const ageNum = parseFloat(age);
  const wtNum = parseFloat(wt);
  const htNum = parseFloat(ht);
  const scrNum = parseFloat(scr);

  let ibw = 0, dosingWeight = 0, crcl = 0, vdEmp = 0, empDose = 0;
  let empInterval = 'Awaiting Data...';

  if (ageNum >= 18 && wtNum > 0 && htNum > 0 && scrNum > 0) {
    const htIn = htNum / 2.54;
    ibw = wtNum;
    if (htIn > 60) ibw = (sex === 'M' ? 50 : 45.5) + 2.3 * (htIn - 60);
    dosingWeight = wtNum;
    if (wtNum > 1.2 * ibw && htIn > 60) dosingWeight = ibw + 0.4 * (wtNum - ibw);
    else if (wtNum < ibw) dosingWeight = wtNum;
    crcl = ((140 - ageNum) * dosingWeight) / (72 * scrNum);
    if (sex === 'F') crcl *= 0.85;
    vdEmp = 0.7 * wtNum;
    empDose = Math.round((wtNum * 15) / 250) * 250;
    if (empDose > 2000) empDose = 2000;
    if (crcl > 90) empInterval = 'q8h to q12h';
    else if (crcl >= 50) empInterval = 'q12h';
    else if (crcl >= 20) empInterval = 'q24h';
    else empInterval = 'per pharmacy/level based';
  }

  let currentAuc: number | null = null;
  let patientVd: number | null = null;
  let halfLife: number | null = null;
  let adjMsg = 'Awaiting TDM Data...';

  const cDoseNum = parseFloat(cDose);
  const cIntervalNum = parseInt(cInterval);

  if (cDoseNum > 0 && cIntervalNum > 0) {
    let relevantTrough: number | null = null;
    if (tdmMethod === 'single') {
      const troughSingleNum = parseFloat(troughSingle);
      if (troughSingleNum > 0 && wtNum > 0) {
        relevantTrough = troughSingleNum;
        const vd = 0.7 * parseFloat(wt);
        currentAuc = (cDoseNum * 24) / (vd * Math.log(1 + cDoseNum / (vd * relevantTrough)));
      }
    } else if (tdmMethod === 'two') {
      const peakNum = parseFloat(peak);
      const troughTwoNum = parseFloat(troughTwo);
      const tInfNum = parseFloat(tInf);
      const tToPeakNum = parseFloat(tToPeak);
      const tBetweenNum = parseFloat(tBetween);
      if (peakNum > 0 && troughTwoNum > 0 && tInfNum > 0 && tToPeakNum > 0 && tBetweenNum > 0) {
        relevantTrough = troughTwoNum;
        const ke = Math.log(peakNum / troughTwoNum) / tBetweenNum;
        halfLife = 0.693 / ke;
        const cMax = peakNum * Math.exp(ke * tToPeakNum);
        const cMin = troughTwoNum * Math.exp(-ke * (cIntervalNum - (tInfNum + tToPeakNum + tBetweenNum)));
        const vdNumerator = cDoseNum * (1 - Math.exp(-ke * tInfNum));
        const vdDenominator = tInfNum * ke * (cMax - cMin * Math.exp(-ke * tInfNum));
        patientVd = vdNumerator / vdDenominator;
        const cl = ke * patientVd;
        currentAuc = cDoseNum * (24 / cIntervalNum) / cl;
      }
    }
    if (relevantTrough && relevantTrough > 0 && currentAuc && currentAuc > 0) {
      let ratio = 1;
      if (targetParam.startsWith('trough')) ratio = parseFloat(targetParam.split('-')[1]) / relevantTrough;
      else ratio = parseFloat(targetParam.split('-')[1]) / currentAuc;
      let roundedNewDose = Math.round((cDoseNum * ratio) / 250) * 250;
      if (roundedNewDose < 250) roundedNewDose = 250;
      if (ratio > 2.0) adjMsg = `Caution (Ratio > 2): Consider freq increase (e.g., q${Math.max(8, cIntervalNum - 4)}h).`;
      else if (ratio < 0.5) adjMsg = `Caution (Ratio < 0.5): Hold dose. Consider interval extension.`;
      else adjMsg = `${roundedNewDose} mg IV q${cIntervalNum}h`;
    }
  }

  const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20";
  const bluInputCls = "w-full bg-blue-700 border border-blue-500 rounded-xl px-4 py-2 text-sm font-medium text-white placeholder:text-blue-300 focus:outline-none focus:ring-2 focus:ring-white/20";

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 p-1 h-full animate-in fade-in duration-300">
      <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex flex-col h-full">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Activity className="text-blue-500 w-5 h-5 flex-shrink-0" /> Empirical & Kinetics
        </h3>
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-4">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Biological Sex</label>
            <div className="flex gap-3">
              {['M', 'F'].map(s => (
                <label key={s} className="flex items-center gap-1.5 cursor-pointer text-sm font-semibold text-slate-700">
                  <input type="radio" name="vSex" value={s} checked={sex === s} onChange={e => setSex(e.target.value)} className="w-4 h-4 text-blue-500" /> {s === 'M' ? 'Male' : 'Female'}
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Age (yrs)</label><input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g., 45" className={inputCls} /></div>
            <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Weight (kg)</label><input type="number" value={wt} onChange={e => setWt(e.target.value)} placeholder="e.g., 75" className={inputCls} /></div>
            <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Height (cm)</label><input type="number" value={ht} onChange={e => setHt(e.target.value)} placeholder="e.g., 175" className={inputCls} /></div>
            <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">SCr (mg/dL)</label><input type="number" step="0.1" value={scr} onChange={e => setScr(e.target.value)} placeholder="e.g., 0.9" className={inputCls} /></div>
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex-1 space-y-3">
          <div className="flex justify-between items-center text-sm border-b border-slate-200/60 pb-2"><span className="text-slate-500 font-medium">Est. CrCl</span><span className="font-bold text-slate-800">{crcl > 0 ? crcl.toFixed(1) : '--'} mL/min</span></div>
          <div className="flex justify-between items-center text-sm border-b border-slate-200/60 pb-2"><span className="text-slate-500 font-medium">Est. Vd</span><span className="font-bold text-slate-800">{vdEmp > 0 ? vdEmp.toFixed(1) : '--'} L</span></div>
          <div className="flex justify-between items-center text-sm border-b border-slate-200/60 pb-2"><span className="text-slate-500 font-medium">Dosing Wt</span><span className="font-bold text-slate-800">{dosingWeight > 0 ? dosingWeight.toFixed(1) : '--'} kg</span></div>
          <div className="pt-2">
            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Empirical Initial Regimen</span>
            <div className="text-lg font-bold text-blue-600 leading-tight">{empDose > 0 ? `${empDose} mg IV ${empInterval}` : 'Awaiting Data...'}</div>
          </div>
        </div>
      </div>

      <div className="bg-blue-600 rounded-[24px] p-6 shadow-md border border-blue-500 flex flex-col h-full text-white">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-blue-500/50 pb-3">
          <Clock className="text-white w-5 h-5 flex-shrink-0" /> Steady State TDM
        </h3>
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-bold text-blue-200 uppercase tracking-wider mb-1.5">Curr Dose (mg)</label><input type="number" value={cDose} onChange={e => setCDose(e.target.value)} placeholder="e.g., 1250" className={bluInputCls} /></div>
            <div><label className="block text-xs font-bold text-blue-200 uppercase tracking-wider mb-1.5">Interval (h)</label>
              <select value={cInterval} onChange={e => setCInterval(e.target.value)} className={`${bluInputCls} appearance-none`}>
                <option value="8">q8h</option><option value="12">q12h</option><option value="24">q24h</option><option value="48">q48h</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4 bg-blue-700/50 p-1.5 rounded-xl border border-blue-500/50">
            <button onClick={() => setTdmMethod('single')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${tdmMethod === 'single' ? 'bg-white text-blue-700 shadow-sm' : 'text-blue-200 hover:text-white'}`}>Single Level</button>
            <button onClick={() => setTdmMethod('two')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${tdmMethod === 'two' ? 'bg-white text-blue-700 shadow-sm' : 'text-blue-200 hover:text-white'}`}>Two Level</button>
          </div>
          {tdmMethod === 'single' && (
            <div><label className="block text-xs font-bold text-blue-200 uppercase tracking-wider mb-1.5">Actual Trough (mg/L)</label><input type="number" step="0.1" value={troughSingle} onChange={e => setTroughSingle(e.target.value)} placeholder="e.g., 9.5" className={bluInputCls} /></div>
          )}
          {tdmMethod === 'two' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1.5">Act. Peak (mg/L)</label><input type="number" step="0.1" value={peak} onChange={e => setPeak(e.target.value)} placeholder="e.g., 35.0" className={bluInputCls} /></div>
                <div><label className="block text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1.5">Act. Trough (mg/L)</label><input type="number" step="0.1" value={troughTwo} onChange={e => setTroughTwo(e.target.value)} placeholder="e.g., 12.0" className={bluInputCls} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1.5">Inf. (h)</label><input type="number" step="0.5" value={tInf} onChange={e => setTInf(e.target.value)} placeholder="2" className={bluInputCls} /></div>
                <div><label className="block text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1.5">To Pk (h)</label><input type="number" step="0.5" value={tToPeak} onChange={e => setTToPeak(e.target.value)} placeholder="1.5" className={bluInputCls} /></div>
                <div><label className="block text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1.5">Btwn (h)</label><input type="number" step="0.5" value={tBetween} onChange={e => setTBetween(e.target.value)} placeholder="8.5" className={bluInputCls} /></div>
              </div>
            </div>
          )}
          <div><label className="block text-xs font-bold text-blue-200 uppercase tracking-wider mb-1.5">Target</label>
            <select value={targetParam} onChange={e => setTargetParam(e.target.value)} className={`${bluInputCls} appearance-none`}>
              <option value="auc-500">AUC24 (400 - 600 mg&middot;h/L)</option>
              <option value="trough-12.5">Trough (10 - 15 mg/L)</option>
              <option value="trough-17.5">Trough (15 - 20 mg/L)</option>
            </select>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 flex-1 flex flex-col justify-center space-y-3">
          <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2"><span className="text-slate-500 font-medium">Calc. AUC24</span><span className="font-bold text-slate-800">{currentAuc && currentAuc > 0 ? Math.round(currentAuc) : '--'} mg&middot;h/L</span></div>
          {tdmMethod === 'two' && patientVd && patientVd > 0 && (
            <>
              <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2"><span className="text-slate-500 font-medium">Patient Vd</span><span className="font-bold text-slate-800">{patientVd.toFixed(2)} L</span></div>
              <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2"><span className="text-slate-500 font-medium">Half-Life</span><span className="font-bold text-slate-800">{halfLife?.toFixed(1)} h</span></div>
            </>
          )}
          <div className="pt-1">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Recommended Adjustment</span>
            <div className="text-lg font-bold text-slate-900 leading-tight">{adjMsg}</div>
          </div>
        </div>
        <p className="text-[10px] text-blue-200 mt-4 text-center leading-tight">AUC/MIC target of 400-600 assumes an MIC of 1 mg/L per IDSA 2020 guidelines. Single-level utilizes a simplified 1-compartment estimation.</p>
      </div>
    </div>
  );
}
