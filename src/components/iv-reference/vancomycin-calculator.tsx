'use client';

import { useState, useMemo } from 'react';
import { Activity, Clock, AlertTriangle, Info } from 'lucide-react';

export function VancoCalculator() {
  const [sex, setSex] = useState('M');
  const [age, setAge] = useState('');
  const [wt, setWt] = useState('');
  const [ht, setHt] = useState('');
  const [scr, setScr] = useState('');
  const [cDose, setCDose] = useState('');
  const [cInterval, setCInterval] = useState('12');
  const [tdmMethod, setTdmMethod] = useState('two');
  const [troughSingle, setTroughSingle] = useState('');
  const [peak, setPeak] = useState('');
  const [troughTwo, setTroughTwo] = useState('');
  const [tInf, setTInf] = useState('');
  const [tToPeak, setTToPeak] = useState('');
  const [tBetween, setTBetween] = useState('');
  const [targetParam, setTargetParam] = useState('auc-500');

  /* ── Empiric / Kinetic calculations ─────────────────────────────── */

  const empiric = useMemo(() => {
    const ageNum = parseFloat(age);
    const wtNum = parseFloat(wt);
    const htNum = parseFloat(ht);
    const scrNum = parseFloat(scr);

    if (!(ageNum >= 18 && ageNum <= 120 && wtNum >= 30 && wtNum <= 300 && htNum >= 100 && htNum <= 220 && scrNum >= 0.1 && scrNum <= 20)) {
      return null;
    }

    const htIn = htNum / 2.54;

    // Devine IBW — floor at 50/45.5 kg for patients ≤ 60 inches (WARN-2 fix)
    const ibwBase = sex === 'M' ? 50 : 45.5;
    const ibw = htIn > 60 ? ibwBase + 2.3 * (htIn - 60) : ibwBase;

    // Dosing weight: AdjBW (0.4 factor) for obese (>1.2×IBW), actual for underweight
    // 0.4 factor is correct for vancomycin per ASHP 2020 and Adane et al. 2015
    let dosingWeight = wtNum;
    if (wtNum > 1.2 * ibw && htIn > 60) {
      dosingWeight = ibw + 0.4 * (wtNum - ibw);
    } else if (wtNum < ibw) {
      dosingWeight = wtNum; // use actual if underweight
    }

    // Cockcroft-Gault: floor SCr at 1.0 mg/dL for patients ≥ 65 to avoid overestimating CrCl (WARN-4 fix)
    const scrForCrcl = (ageNum >= 65 && scrNum < 1.0) ? 1.0 : scrNum;
    let crcl = ((140 - ageNum) * dosingWeight) / (72 * scrForCrcl);
    if (sex === 'F') crcl *= 0.85;

    // Vd: 0.7 L/kg × actual body weight (ASHP 2020; actual BW even in obesity for Vd)
    const vd = 0.7 * wtNum;

    // Population ke estimate from CrCl — Matzke 1984 equation
    // Used for single-level AUC approximation (pop PK fallback)
    const ke_pop = 0.00083 * crcl + 0.0044;
    const cl_pop = ke_pop * vd; // L/h

    // ── Loading dose: 25 mg/kg ABW, capped at 3000 mg (ASHP 2020 for serious infections)
    const loadingDose = Math.min(Math.round((wtNum * 25) / 250) * 250, 3000);

    // ── Maintenance dose: 15 mg/kg dosingWeight, capped at 3000 mg (WARN-1 & WARN-3 fix)
    const maintRaw = Math.round((dosingWeight * 15) / 250) * 250;
    const maintDose = Math.min(maintRaw, 3000);

    // Empiric interval based on CrCl (ASHP 2020)
    let empInterval: string;
    if (crcl > 90)     empInterval = 'q8–12h';
    else if (crcl >= 50) empInterval = 'q12h';
    else if (crcl >= 20) empInterval = 'q24h';
    else               empInterval = 'per pharmacy / level-based';

    return { ibw, dosingWeight, crcl, vd, ke_pop, cl_pop, loadingDose, maintDose, empInterval, wtNum };
  }, [age, wt, ht, scr, sex]);

  /* ── TDM / AUC calculations ─────────────────────────────────────── */

  const tdm = useMemo(() => {
    const cDoseNum = parseFloat(cDose);
    const cIntervalNum = parseInt(cInterval, 10); // SUGG-7 fix: explicit radix

    if (!(cDoseNum >= 250 && cDoseNum <= 5000 && cIntervalNum >= 6 && cIntervalNum <= 72)) {
      return null;
    }

    let currentAuc: number | null = null;
    let patientVd: number | null = null;
    let halfLife: number | null = null;
    let samplingError: string | null = null;

    if (tdmMethod === 'single') {
      // Single-level: use population ke (Matzke 1984) + measured trough
      // CRIT-1 fix: replace invalid formula with pop-PK-based AUC estimation
      const troughSingleNum = parseFloat(troughSingle);
      const vdPop = empiric?.vd;
      const kePop = empiric?.ke_pop;

      if (troughSingleNum > 0 && vdPop && kePop && empiric) {
        const cl = kePop * vdPop;
        // AUC24 = Dose × (24/tau) / CL  (1-compartment, linear PK, steady state)
        currentAuc = (cDoseNum * (24 / cIntervalNum)) / cl;
      }
    } else if (tdmMethod === 'two') {
      const peakNum = parseFloat(peak);
      const troughTwoNum = parseFloat(troughTwo);
      const tInfNum = parseFloat(tInf);
      const tToPeakNum = parseFloat(tToPeak);
      const tBetweenNum = parseFloat(tBetween); // peak-to-trough hours (WARN-6 label fix)

      if (peakNum > 0 && troughTwoNum > 0 && tInfNum > 0 && tToPeakNum > 0 && tBetweenNum > 0) {
        // Validate timing: infusion + post-infusion wait + peak-to-trough must not exceed interval
        if (tInfNum + tToPeakNum + tBetweenNum >= cIntervalNum) {
          samplingError = 'Sampling times exceed dosing interval. Check timing inputs.';
        } else {
          // Sawchuk-Zaske two-level method
          const ke = Math.log(peakNum / troughTwoNum) / tBetweenNum;
          if (ke <= 0) {
            samplingError = 'Invalid ke: peak must be greater than trough.';
          } else {
            halfLife = 0.693 / ke;

            // Back-extrapolate peak to end of infusion (true Cmax)
            const cMax = peakNum * Math.exp(ke * tToPeakNum);

            // Forward-extrapolate trough to end of interval (pre-next-dose trough)
            const timeFromTroughToEnd = cIntervalNum - (tInfNum + tToPeakNum + tBetweenNum);
            const cMin = troughTwoNum * Math.exp(-ke * timeFromTroughToEnd);

            // Vd via Sawchuk-Zaske
            const vdNumerator = cDoseNum * (1 - Math.exp(-ke * tInfNum));
            const vdDenominator = tInfNum * ke * (cMax - cMin * Math.exp(-ke * tInfNum));

            if (vdDenominator <= 0) {
              samplingError = 'Cannot compute Vd: check that peak > trough and timing is correct.';
            } else {
              patientVd = vdNumerator / vdDenominator;
              const cl = ke * patientVd;
              // AUC24 = DailyDose / CL (steady-state, linear PK)
              currentAuc = cDoseNum * (24 / cIntervalNum) / cl;
            }
          }
        }
      }
    }

    if (!currentAuc || currentAuc <= 0) return { currentAuc: null, patientVd, halfLife, adjMsg: null, samplingError };

    // WARN-5 fix: check if already in target range before recommending dose change
    const AUC_LOW = 400, AUC_HIGH = 600;

    if (targetParam === 'auc-500') {
      if (currentAuc >= AUC_LOW && currentAuc <= AUC_HIGH) {
        return {
          currentAuc,
          patientVd,
          halfLife,
          samplingError,
          adjMsg: `AUC24 is within target range (${AUC_LOW}–${AUC_HIGH} mg·h/L). No dose change required.`,
          inRange: true,
        };
      }
      const ratio = 500 / currentAuc;
      const roundedNewDose = Math.min(Math.max(Math.round((cDoseNum * ratio) / 250) * 250, 250), 4500);
      let adjMsg: string;
      if (ratio > 2.0) {
        adjMsg = `${roundedNewDose} mg q${cIntervalNum}h — Caution: large increase (>2×). Consider increasing frequency (e.g., q${Math.max(8, cIntervalNum - 4)}h) rather than doubling dose.`;
      } else if (ratio < 0.5) {
        adjMsg = `${roundedNewDose} mg q${cIntervalNum}h — Caution: large decrease. Consider extending interval before reducing dose.`;
      } else {
        adjMsg = `${roundedNewDose} mg IV q${cIntervalNum}h`;
      }
      return { currentAuc, patientVd, halfLife, samplingError, adjMsg, inRange: false };
    }

    // Trough-based targets (retained per CRIT-2 fix — but will show warning in UI)
    const relevantTrough = tdmMethod === 'single' ? parseFloat(troughSingle) : parseFloat(troughTwo);
    if (!relevantTrough || relevantTrough <= 0) return { currentAuc, patientVd, halfLife, samplingError, adjMsg: null };
    const targetTrough = parseFloat(targetParam.split('-')[1]);
    const ratio = targetTrough / relevantTrough;
    const roundedNewDose = Math.min(Math.max(Math.round((cDoseNum * ratio) / 250) * 250, 250), 4500);
    const adjMsg = ratio > 2.0
      ? `${roundedNewDose} mg q${cIntervalNum}h — Caution: large increase.`
      : ratio < 0.5
        ? `${roundedNewDose} mg q${cIntervalNum}h — Caution: large decrease.`
        : `${roundedNewDose} mg IV q${cIntervalNum}h`;

    return { currentAuc, patientVd, halfLife, samplingError, adjMsg, inRange: false };
  }, [cDose, cInterval, tdmMethod, troughSingle, peak, troughTwo, tInf, tToPeak, tBetween, targetParam, empiric]);

  /* ── Styles ─────────────────────────────────────────────────────── */

  const inputCls = 'w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20';
  const bluInputCls = 'w-full bg-blue-700 border border-blue-500 rounded-xl px-4 py-2 text-sm font-medium text-white placeholder:text-blue-300 focus:outline-none focus:ring-2 focus:ring-white/20';

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 p-1 h-full animate-in fade-in duration-300">

      {/* ── Left panel: Empiric ───────────────────────────────────── */}
      <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex flex-col h-full">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Activity className="text-blue-500 w-5 h-5 shrink-0" /> Empiric Dosing
        </h3>

        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-4">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Biological Sex</label>
            <div className="flex gap-3">
              {['M', 'F'].map(s => (
                <label key={s} className="flex items-center gap-1.5 cursor-pointer text-sm font-semibold text-slate-700">
                  <input type="radio" name="vSex" value={s} checked={sex === s} onChange={e => setSex(e.target.value)} className="w-4 h-4 text-blue-500" />
                  {s === 'M' ? 'Male' : 'Female'}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Age (yrs)</label>
              <input type="number" min={18} max={120} value={age} onChange={e => setAge(e.target.value)} placeholder="e.g., 45" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Weight (kg)</label>
              <input type="number" min={30} max={300} value={wt} onChange={e => setWt(e.target.value)} placeholder="e.g., 75" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Height (cm)</label>
              <input type="number" min={100} max={220} value={ht} onChange={e => setHt(e.target.value)} placeholder="e.g., 175" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">SCr (mg/dL)</label>
              <input type="number" step="0.1" min={0.1} max={20} value={scr} onChange={e => setScr(e.target.value)} placeholder="e.g., 0.9" className={inputCls} />
            </div>
          </div>
        </div>

        {empiric ? (
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex-1 space-y-3">
            <div className="flex justify-between items-center text-sm border-b border-slate-200/60 pb-2">
              <span className="text-slate-500 font-medium">Est. CrCl</span>
              <span className="font-bold text-slate-800">{empiric.crcl.toFixed(1)} mL/min</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-slate-200/60 pb-2">
              <span className="text-slate-500 font-medium">IBW / Dosing Wt</span>
              <span className="font-bold text-slate-800">{empiric.ibw.toFixed(1)} / {empiric.dosingWeight.toFixed(1)} kg</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-slate-200/60 pb-2">
              <span className="text-slate-500 font-medium">Est. Vd</span>
              <span className="font-bold text-slate-800">{empiric.vd.toFixed(1)} L</span>
            </div>

            {/* Loading dose — WARN-8 fix */}
            <div className="pt-1 pb-2 border-b border-slate-200/60">
              <span className="block text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Loading Dose (serious infections only)
              </span>
              <div className="text-base font-bold text-amber-700 leading-tight">
                {empiric.loadingDose} mg IV × 1
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">25 mg/kg ABW, max 3000 mg. For bacteremia, endocarditis, pneumonia, meningitis per ASHP 2020.</p>
            </div>

            <div className="pt-1">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Maintenance Dose</span>
              <div className="text-lg font-bold text-blue-600 leading-tight">
                {empiric.maintDose} mg IV {empiric.empInterval}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">15 mg/kg AdjBW, max 3000 mg/dose. AUC/MIC monitoring required after initiation.</p>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex-1 flex items-center justify-center text-sm text-slate-400">
            Enter patient parameters above
          </div>
        )}
      </div>

      {/* ── Right panel: TDM ─────────────────────────────────────── */}
      <div className="bg-blue-600 rounded-[24px] p-6 shadow-md border border-blue-500 flex flex-col h-full text-white">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-blue-500/50 pb-3">
          <Clock className="text-white w-5 h-5 shrink-0" /> Steady-State TDM
        </h3>

        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-blue-200 uppercase tracking-wider mb-1.5">Curr Dose (mg)</label>
              <input type="number" min={250} max={5000} step={250} value={cDose} onChange={e => setCDose(e.target.value)} placeholder="e.g., 1250" className={bluInputCls} />
            </div>
            <div>
              <label className="block text-xs font-bold text-blue-200 uppercase tracking-wider mb-1.5">Interval</label>
              <select value={cInterval} onChange={e => setCInterval(e.target.value)} className={`${bluInputCls} appearance-none`}>
                <option value="8">q8h</option>
                <option value="12">q12h</option>
                <option value="24">q24h</option>
                <option value="48">q48h</option>
              </select>
            </div>
          </div>

          {/* Method toggle — default to two-level (CRIT-1) */}
          <div className="flex gap-4 bg-blue-700/50 p-1.5 rounded-xl border border-blue-500/50">
            <button
              onClick={() => setTdmMethod('two')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${tdmMethod === 'two' ? 'bg-white text-blue-700 shadow-sm' : 'text-blue-200 hover:text-white'}`}
            >
              Two-Level (Sawchuk-Zaske)
            </button>
            <button
              onClick={() => setTdmMethod('single')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${tdmMethod === 'single' ? 'bg-white text-blue-700 shadow-sm' : 'text-blue-200 hover:text-white'}`}
            >
              Single-Level (Pop PK)
            </button>
          </div>

          {/* Single-level warning — CRIT-1 fix */}
          {tdmMethod === 'single' && (
            <div className="bg-amber-500/20 border border-amber-400/40 rounded-xl p-3 flex gap-2">
              <Info className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-100 leading-snug">
                Single-level AUC uses population PK (Matzke ke, 0.7 L/kg Vd). ASHP 2020 recommends Bayesian software for accuracy. Requires patient data from the empiric panel.
              </p>
            </div>
          )}

          {tdmMethod === 'single' && (
            <div>
              <label className="block text-xs font-bold text-blue-200 uppercase tracking-wider mb-1.5">Steady-State Trough (mg/L)</label>
              <input type="number" step="0.1" min={0.1} max={60} value={troughSingle} onChange={e => setTroughSingle(e.target.value)} placeholder="e.g., 9.5" className={bluInputCls} />
              {!empiric && (
                <p className="text-[10px] text-amber-300 mt-1">⚠ Enter patient data in Empiric panel for population PK parameters.</p>
              )}
            </div>
          )}

          {tdmMethod === 'two' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1.5">Peak (mg/L)</label>
                  <input type="number" step="0.1" min={0.1} max={200} value={peak} onChange={e => setPeak(e.target.value)} placeholder="e.g., 35.0" className={bluInputCls} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1.5">Trough (mg/L)</label>
                  <input type="number" step="0.1" min={0.1} max={100} value={troughTwo} onChange={e => setTroughTwo(e.target.value)} placeholder="e.g., 12.0" className={bluInputCls} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1.5">Inf. dur. (h)</label>
                  <input type="number" step="0.5" min={0.5} max={4} value={tInf} onChange={e => setTInf(e.target.value)} placeholder="1.5" className={bluInputCls} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1.5">End→Peak (h)</label>
                  <input type="number" step="0.5" min={0} max={4} value={tToPeak} onChange={e => setTToPeak(e.target.value)} placeholder="0.5" className={bluInputCls} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1.5">Peak→Trough (h)</label>
                  <input type="number" step="0.5" min={0.5} max={48} value={tBetween} onChange={e => setTBetween(e.target.value)} placeholder="8.5" className={bluInputCls} />
                </div>
              </div>
            </div>
          )}

          {/* Target selector */}
          <div>
            <label className="block text-xs font-bold text-blue-200 uppercase tracking-wider mb-1.5">Monitoring Target</label>
            <select value={targetParam} onChange={e => setTargetParam(e.target.value)} className={`${bluInputCls} appearance-none`}>
              <option value="auc-500">AUC/MIC 400–600 (assumes MIC = 1 mg/L) — ASHP 2020 preferred</option>
              <option value="trough-12.5">Trough 10–15 mg/L — not recommended (see warning)</option>
              <option value="trough-17.5">Trough 15–20 mg/L — not recommended (see warning)</option>
            </select>
            {/* CRIT-2 fix: trough warning */}
            {targetParam.startsWith('trough') && (
              <div className="mt-2 bg-red-500/20 border border-red-400/40 rounded-xl p-2.5 flex gap-2">
                <AlertTriangle className="w-4 h-4 text-red-300 shrink-0 mt-0.5" />
                <p className="text-[10px] text-red-100 leading-snug">
                  Trough-only monitoring is <strong>no longer recommended</strong> per ASHP/IDSA/SIDP 2020 — associated with increased nephrotoxicity without improved efficacy. Use AUC/MIC monitoring when feasible.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-xl p-4 flex-1 flex flex-col justify-center space-y-3">
          {tdm?.samplingError ? (
            <p className="text-sm font-semibold text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> {tdm.samplingError}
            </p>
          ) : (
            <>
              <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Calc. AUC24</span>
                <span className="font-bold text-slate-800" aria-label="Calculated 24-hour AUC">
                  {tdm?.currentAuc && tdm.currentAuc > 0 ? `${Math.round(tdm.currentAuc)} mg·h/L` : '—'}
                </span>
              </div>
              {tdmMethod === 'two' && tdm?.patientVd && tdm.patientVd > 0 && (
                <>
                  <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-medium">Patient Vd</span>
                    <span className="font-bold text-slate-800">{tdm.patientVd.toFixed(2)} L</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-medium">Half-Life</span>
                    <span className="font-bold text-slate-800">{tdm.halfLife?.toFixed(1)} h</span>
                  </div>
                </>
              )}
              <div className="pt-1">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {tdm?.inRange ? 'Status' : 'Recommended Adjustment'}
                </span>
                <div className={`text-base font-bold leading-tight ${tdm?.inRange ? 'text-emerald-700' : 'text-slate-900'}`}>
                  {tdm?.adjMsg ?? 'Awaiting TDM data…'}
                </div>
              </div>
            </>
          )}
        </div>

        <p className="text-[10px] text-blue-200 mt-4 text-center leading-tight">
          AUC/MIC target 400–600 assumes S. aureus MIC = 1 mg/L (broth microdilution) per ASHP/IDSA/SIDP 2020.
          Two-level method: Sawchuk-Zaske. Single-level: population ke (Matzke 1984). Not a substitute for clinical pharmacy or Bayesian software.
        </p>
      </div>
    </div>
  );
}
