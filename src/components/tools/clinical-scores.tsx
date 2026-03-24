'use client';

import { useState } from 'react';

// ══════════════════════════════════════════════════════════════════════════
// Generic helpers
// ══════════════════════════════════════════════════════════════════════════

interface CheckItem { label: string; points: number; }

function CheckScore({ title, items, interpret }: {
  title: string;
  items: CheckItem[];
  interpret: (score: number) => { label: string; color: string; detail: string };
}) {
  const [checked, setChecked] = useState<boolean[]>(new Array(items.length).fill(false));
  const score = checked.reduce((sum, c, i) => sum + (c ? items[i].points : 0), 0);
  const result = interpret(score);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        {items.map((item, i) => (
          <label key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={checked[i]}
              onChange={(e) => { const u = [...checked]; u[i] = e.target.checked; setChecked(u); }}
              className="w-4 h-4 rounded text-[#007AFF] focus:ring-[#007AFF]/20 border-slate-300"
            />
            <span className="text-sm text-slate-700 flex-1">{item.label}</span>
            <span className="text-xs font-bold text-slate-400">+{item.points}</span>
          </label>
        ))}
      </div>
      <div className={`p-4 rounded-2xl border ${result.color}`}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Score</span>
          <span className="text-2xl font-black text-slate-900">{score}</span>
        </div>
        <p className="text-sm font-bold text-slate-800">{result.label}</p>
        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{result.detail}</p>
      </div>
      <button onClick={() => setChecked(new Array(items.length).fill(false))} className="text-xs text-slate-400 hover:text-[#007AFF] transition-colors">
        Reset
      </button>
    </div>
  );
}

function NumberInput({ label, value, onChange, unit, step = 1, min = 0, max = 999 }: {
  label: string; value: string; onChange: (v: string) => void; unit: string; step?: number; min?: number; max?: number;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-600 block mb-1">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          step={step}
          min={min}
          max={max}
          className="w-24 px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
        />
        <span className="text-xs text-slate-400 ml-1">{unit}</span>
      </div>
    </div>
  );
}

function SelectInput({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-600 block mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// CURB-65 (Pneumonia Severity)
// ══════════════════════════════════════════════════════════════════════════

function CURB65() {
  return (
    <CheckScore
      title="CURB-65"
      items={[
        { label: 'Confusion (new-onset disorientation)', points: 1 },
        { label: 'BUN > 19 mg/dL (Urea > 7 mmol/L)', points: 1 },
        { label: 'Respiratory Rate ≥ 30/min', points: 1 },
        { label: 'Blood Pressure: SBP < 90 or DBP ≤ 60 mmHg', points: 1 },
        { label: 'Age ≥ 65 years', points: 1 },
      ]}
      interpret={(score) => {
        if (score <= 1) return { label: 'Low Risk', color: 'bg-emerald-50 border-emerald-200', detail: '0.6–2.7% 30-day mortality. Consider outpatient treatment.' };
        if (score === 2) return { label: 'Moderate Risk', color: 'bg-amber-50 border-amber-200', detail: '6.8% 30-day mortality. Consider short inpatient or closely supervised outpatient.' };
        return { label: 'High Risk — Consider ICU', color: 'bg-red-50 border-red-200', detail: `${score >= 4 ? '27.8' : '14.0'}% 30-day mortality. Inpatient with ICU consideration.` };
      }}
    />
  );
}

// ══════════════════════════════════════════════════════════════════════════
// qSOFA (Quick Sepsis-Related Organ Failure Assessment)
// ══════════════════════════════════════════════════════════════════════════

function QSOFA() {
  return (
    <CheckScore
      title="qSOFA"
      items={[
        { label: 'Altered mental status (GCS < 15)', points: 1 },
        { label: 'Respiratory Rate ≥ 22/min', points: 1 },
        { label: 'Systolic Blood Pressure ≤ 100 mmHg', points: 1 },
      ]}
      interpret={(score) => {
        if (score < 2) return { label: 'Low Risk', color: 'bg-emerald-50 border-emerald-200', detail: 'qSOFA < 2: Low risk of poor outcome. Continue monitoring. Not a diagnostic tool — reassess if clinical picture changes.' };
        return { label: 'High Risk — Assess for Organ Dysfunction', color: 'bg-red-50 border-red-200', detail: 'qSOFA ≥ 2: Increased risk of in-hospital mortality. Assess for sepsis with full SOFA scoring. Consider lactate, cultures, and early resuscitation per SSC guidelines.' };
      }}
    />
  );
}

// ══════════════════════════════════════════════════════════════════════════
// CHA₂DS₂-VASc (AFib Stroke Risk)
// ══════════════════════════════════════════════════════════════════════════

function CHA2DS2VASc() {
  return (
    <CheckScore
      title="CHA₂DS₂-VASc"
      items={[
        { label: 'Congestive Heart Failure (or LVEF ≤ 40%)', points: 1 },
        { label: 'Hypertension', points: 1 },
        { label: 'Age ≥ 75 years', points: 2 },
        { label: 'Diabetes Mellitus', points: 1 },
        { label: 'Stroke / TIA / Thromboembolism history', points: 2 },
        { label: 'Vascular disease (prior MI, PAD, aortic plaque)', points: 1 },
        { label: 'Age 65–74 years', points: 1 },
        { label: 'Sex category: Female', points: 1 },
      ]}
      interpret={(score) => {
        if (score === 0) return { label: 'Low Risk', color: 'bg-emerald-50 border-emerald-200', detail: '~0.2% annual stroke risk. Anticoagulation generally not recommended.' };
        if (score === 1) return { label: 'Low–Moderate Risk', color: 'bg-amber-50 border-amber-200', detail: '~0.6% annual stroke risk. If score of 1 is due solely to female sex, do NOT anticoagulate (ACC/AHA 2023 — female sex alone does not independently justify anticoagulation). Consider anticoagulation only if score 1 comes from another risk factor.' };
        const riskMap: Record<number, string> = { 2: '2.2', 3: '3.2', 4: '4.0', 5: '6.7', 6: '9.8', 7: '9.6', 8: '12.5', 9: '15.2' };
        return { label: 'Moderate–High Risk — Anticoagulate', color: 'bg-red-50 border-red-200', detail: `~${riskMap[score] || '>6'}% annual stroke risk. Oral anticoagulation recommended (DOAC preferred over warfarin per ACC/AHA).` };
      }}
    />
  );
}

// ══════════════════════════════════════════════════════════════════════════
// Wells DVT — custom component to support the -2 "alternative diagnosis" criterion
// ══════════════════════════════════════════════════════════════════════════

function WellsDVT() {
  const items = [
    { label: 'Active cancer (treatment within 6 months or palliative)', points: 1 },
    { label: 'Paralysis, paresis, or recent cast of lower extremity', points: 1 },
    { label: 'Bedridden > 3 days or major surgery within 12 weeks', points: 1 },
    { label: 'Localized tenderness along deep venous system', points: 1 },
    { label: 'Entire leg swollen', points: 1 },
    { label: 'Calf swelling > 3 cm vs. asymptomatic side (10 cm below tibial tuberosity)', points: 1 },
    { label: 'Pitting edema confined to symptomatic leg', points: 1 },
    { label: 'Collateral superficial veins (non-varicose)', points: 1 },
    { label: 'Previously documented DVT', points: 1 },
    { label: 'Alternative diagnosis at least as likely as DVT', points: -2 },
  ];

  const [checks, setChecks] = useState(new Array(items.length).fill(false));

  const score = checks.reduce((sum, c, i) => sum + (c ? items[i].points : 0), 0);

  const toggle = (i: number) => setChecks(prev => prev.map((v, idx) => idx === i ? !v : v));
  const reset = () => setChecks(new Array(items.length).fill(false));

  let result: { label: string; color: string; detail: string };
  if (score <= 0) {
    result = { label: 'DVT Unlikely', color: 'bg-emerald-50 border-emerald-200', detail: '~5% prevalence. Check D-dimer → if negative, DVT excluded. If positive, proceed to compression ultrasound.' };
  } else if (score <= 2) {
    result = { label: 'Moderate Probability', color: 'bg-amber-50 border-amber-200', detail: '~17% prevalence. Check D-dimer → if negative, DVT unlikely. If positive, proceed to compression ultrasound.' };
  } else {
    result = { label: 'DVT Likely', color: 'bg-red-50 border-red-200', detail: '~53% prevalence. Proceed directly to compression ultrasound. Consider empiric anticoagulation while awaiting imaging.' };
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-800">Wells DVT</h3>
        <button onClick={reset} className="text-xs text-slate-400 hover:text-slate-600">Reset</button>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <label key={i} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${checks[i] ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
            <input type="checkbox" checked={checks[i]} onChange={() => toggle(i)} className="mt-0.5 w-4 h-4 rounded text-[#007AFF] focus:ring-[#007AFF]/20 border-slate-300" />
            <span className="text-sm text-slate-700 flex-1">{item.label}</span>
            <span className={`text-xs font-bold shrink-0 ${item.points < 0 ? 'text-red-600' : 'text-slate-500'}`}>
              {item.points > 0 ? `+${item.points}` : item.points}
            </span>
          </label>
        ))}
      </div>
      <div className={`p-4 rounded-2xl border ${result.color}`}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Score</span>
          <span className="text-2xl font-black text-slate-900">{score}</span>
        </div>
        <p className="text-sm font-bold text-slate-800">{result.label}</p>
        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{result.detail}</p>
      </div>
      <p className="text-[10px] text-slate-400">Wells et al. 1997/2003. Score ≤0: unlikely; 1–2: moderate; ≥3: likely. The −2 criterion ("alternative diagnosis") is essential and may push score below 0.</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// Wells PE
// ══════════════════════════════════════════════════════════════════════════

function WellsPE() {
  const [checks, setChecks] = useState([false, false, false, false, false, false, false]);
  const items = [
    { label: 'Clinical signs/symptoms of DVT (leg swelling, pain with palpation)', points: 3 },
    { label: 'PE is #1 diagnosis, or equally likely', points: 3 },
    { label: 'Heart Rate > 100 bpm', points: 1.5 },
    { label: 'Immobilization (≥ 3 days) or surgery in past 4 weeks', points: 1.5 },
    { label: 'Previous DVT/PE', points: 1.5 },
    { label: 'Hemoptysis', points: 1 },
    { label: 'Malignancy (treatment within 6 months or palliative)', points: 1 },
  ];

  const score = checks.reduce((sum, c, i) => sum + (c ? items[i].points : 0), 0);

  let result: { label: string; color: string; detail: string };
  if (score <= 4) {
    result = { label: 'PE Unlikely', color: 'bg-emerald-50 border-emerald-200', detail: '~8% prevalence. Check D-dimer (high sensitivity) → if negative, PE effectively excluded. If positive, proceed to CTPA.' };
  } else {
    result = { label: 'PE Likely', color: 'bg-red-50 border-red-200', detail: '~34% prevalence. Proceed directly to CTPA. Consider empiric anticoagulation while awaiting imaging.' };
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        {items.map((item, i) => (
          <label key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
            <input type="checkbox" checked={checks[i]} onChange={(e) => { const u = [...checks]; u[i] = e.target.checked; setChecks(u); }}
              className="w-4 h-4 rounded text-[#007AFF] focus:ring-[#007AFF]/20 border-slate-300" />
            <span className="text-sm text-slate-700 flex-1">{item.label}</span>
            <span className="text-xs font-bold text-slate-400">+{item.points}</span>
          </label>
        ))}
      </div>
      <div className={`p-4 rounded-2xl border ${result.color}`}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Score</span>
          <span className="text-2xl font-black text-slate-900">{score}</span>
        </div>
        <p className="text-sm font-bold text-slate-800">{result.label}</p>
        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{result.detail}</p>
      </div>
      <button onClick={() => setChecks(new Array(7).fill(false))} className="text-xs text-slate-400 hover:text-[#007AFF] transition-colors">Reset</button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// Child-Pugh (Hepatic Function Classification)
// ══════════════════════════════════════════════════════════════════════════

function ChildPugh() {
  const [bilirubin, setBilirubin] = useState('1');
  const [albumin, setAlbumin] = useState('1');
  const [inr, setINR] = useState('1');
  const [ascites, setAscites] = useState('1');
  const [encephalopathy, setEncephalopathy] = useState('1');

  const score = [bilirubin, albumin, inr, ascites, encephalopathy].reduce((s, v) => s + parseInt(v || '1'), 0);

  let cls: string, label: string, detail: string, color: string;
  if (score <= 6) { cls = 'A'; label = 'Well-compensated'; color = 'bg-emerald-50 border-emerald-200'; detail = '100% 1-year survival. Minimal hepatic dysfunction. Good surgical candidate.'; }
  else if (score <= 9) { cls = 'B'; label = 'Significant Compromise'; color = 'bg-amber-50 border-amber-200'; detail = '80% 1-year survival. Consider dose adjustments for hepatically-metabolized drugs. Moderate surgical risk.'; }
  else { cls = 'C'; label = 'Decompensated'; color = 'bg-red-50 border-red-200'; detail = '45% 1-year survival. Major dose reductions needed. Consider MELD for transplant evaluation. Poor surgical candidate.'; }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SelectInput label="Total Bilirubin" value={bilirubin} onChange={setBilirubin} options={[
          { value: '1', label: '< 2 mg/dL (1 point)' },
          { value: '2', label: '2–3 mg/dL (2 points)' },
          { value: '3', label: '> 3 mg/dL (3 points)' },
        ]} />
        <SelectInput label="Serum Albumin" value={albumin} onChange={setAlbumin} options={[
          { value: '1', label: '> 3.5 g/dL (1 point)' },
          { value: '2', label: '2.8–3.5 g/dL (2 points)' },
          { value: '3', label: '< 2.8 g/dL (3 points)' },
        ]} />
        <SelectInput label="INR" value={inr} onChange={setINR} options={[
          { value: '1', label: '< 1.7 (1 point)' },
          { value: '2', label: '1.7–2.3 (2 points)' },
          { value: '3', label: '> 2.3 (3 points)' },
        ]} />
        <SelectInput label="Ascites" value={ascites} onChange={setAscites} options={[
          { value: '1', label: 'None (1 point)' },
          { value: '2', label: 'Mild / controlled (2 points)' },
          { value: '3', label: 'Moderate–Severe / refractory (3 points)' },
        ]} />
        <SelectInput label="Hepatic Encephalopathy" value={encephalopathy} onChange={setEncephalopathy} options={[
          { value: '1', label: 'None (1 point)' },
          { value: '2', label: 'Grade I–II (2 points)' },
          { value: '3', label: 'Grade III–IV (3 points)' },
        ]} />
      </div>
      <div className={`p-4 rounded-2xl border ${color}`}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Score</span>
          <span className="text-2xl font-black text-slate-900">{score} <span className="text-lg">(Class {cls})</span></span>
        </div>
        <p className="text-sm font-bold text-slate-800">{label}</p>
        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{detail}</p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// MELD Score (Model for End-Stage Liver Disease)
// ══════════════════════════════════════════════════════════════════════════

function MELDScore() {
  const [bilirubin, setBilirubin] = useState('');
  const [inr, setINR] = useState('');
  const [creatinine, setCreatinine] = useState('');
  const [dialysis, setDialysis] = useState(false);

  const bil = Math.max(parseFloat(bilirubin) || 0, 1);
  const inrVal = Math.max(parseFloat(inr) || 0, 1);
  let cr = Math.max(parseFloat(creatinine) || 0, 1);
  if (dialysis) cr = 4.0;
  cr = Math.min(cr, 4.0);

  const canCalc = bilirubin && inr && creatinine;
  const meld = canCalc
    ? Math.round(3.78 * Math.log(bil) + 11.2 * Math.log(inrVal) + 9.57 * Math.log(cr) + 6.43)
    : null;
  const clamped = meld !== null ? Math.max(6, Math.min(40, meld)) : null;

  let color = 'bg-slate-50 border-slate-200';
  let label = '';
  let detail = '';
  if (clamped !== null) {
    if (clamped < 10) { color = 'bg-emerald-50 border-emerald-200'; label = 'Low severity'; detail = '~1.9% 3-month mortality.'; }
    else if (clamped < 20) { color = 'bg-amber-50 border-amber-200'; label = 'Moderate severity'; detail = '~6% 3-month mortality. Monitor closely.'; }
    else if (clamped < 30) { color = 'bg-orange-50 border-orange-200'; label = 'Severe'; detail = '~19.6% 3-month mortality. Transplant evaluation recommended.'; }
    else { color = 'bg-red-50 border-red-200'; label = 'Very Severe'; detail = '~52.6% 3-month mortality. Priority transplant listing.'; }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <NumberInput label="Bilirubin" value={bilirubin} onChange={setBilirubin} unit="mg/dL" step={0.1} min={0} max={50} />
        <NumberInput label="INR" value={inr} onChange={setINR} unit="" step={0.1} min={0} max={10} />
        <NumberInput label="Creatinine" value={creatinine} onChange={setCreatinine} unit="mg/dL" step={0.1} min={0} max={15} />
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
        <input type="checkbox" checked={dialysis} onChange={(e) => setDialysis(e.target.checked)} className="w-4 h-4 rounded text-[#007AFF] focus:ring-[#007AFF]/20 border-slate-300" />
        Dialysis (≥ 2×/week) — sets Cr to 4.0
      </label>
      {clamped !== null && (
        <div className={`p-4 rounded-2xl border ${color}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">MELD Score</span>
            <span className="text-2xl font-black text-slate-900">{clamped}</span>
          </div>
          <p className="text-sm font-bold text-slate-800">{label}</p>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{detail}</p>
        </div>
      )}
      <p className="text-[10px] text-slate-400">Original MELD (2001) formula: 3.78×ln(Bili) + 11.2×ln(INR) + 9.57×ln(Cr) + 6.43. Clamped 6–40. Note: UNOS uses MELD-Na for organ allocation; MELD 3.0 (2022) is the current AASLD-recommended version. This calculator computes original MELD only — not MELD-Na or MELD 3.0.</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// SOFA Score (Sequential Organ Failure Assessment)
// ══════════════════════════════════════════════════════════════════════════

function SOFAScore() {
  const [pf, setPF] = useState('0');
  const [plt, setPlt] = useState('0');
  const [bil, setBil] = useState('0');
  const [cvs, setCVS] = useState('0');
  const [gcs, setGCS] = useState('0');
  const [renal, setRenal] = useState('0');

  const score = [pf, plt, bil, cvs, gcs, renal].reduce((s, v) => s + parseInt(v || '0'), 0);

  let color: string, label: string, detail: string;
  if (score < 2) { color = 'bg-emerald-50 border-emerald-200'; label = 'Low risk'; detail = '<3.3% mortality. Organ dysfunction unlikely.'; }
  else if (score < 7) { color = 'bg-amber-50 border-amber-200'; label = 'Moderate risk'; detail = '~10–20% mortality. Evolving organ dysfunction — reassess and intervene.'; }
  else if (score < 12) { color = 'bg-orange-50 border-orange-200'; label = 'High risk'; detail = '~30–50% mortality. Multiple organ dysfunction. ICU management indicated.'; }
  else { color = 'bg-red-50 border-red-200'; label = 'Very High risk'; detail = '>50% mortality. Severe multi-organ failure.'; }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SelectInput label="Respiration: PaO₂/FiO₂" value={pf} onChange={setPF} options={[
          { value: '0', label: '≥ 400 (0 pts)' },
          { value: '1', label: '300–399 (1 pt)' },
          { value: '2', label: '200–299 (2 pts)' },
          { value: '3', label: '100–199 + ventilated (3 pts)' },
          { value: '4', label: '< 100 + ventilated (4 pts)' },
        ]} />
        <SelectInput label="Coagulation: Platelets (×10³/μL)" value={plt} onChange={setPlt} options={[
          { value: '0', label: '≥ 150 (0 pts)' },
          { value: '1', label: '100–149 (1 pt)' },
          { value: '2', label: '50–99 (2 pts)' },
          { value: '3', label: '20–49 (3 pts)' },
          { value: '4', label: '< 20 (4 pts)' },
        ]} />
        <SelectInput label="Liver: Bilirubin (mg/dL)" value={bil} onChange={setBil} options={[
          { value: '0', label: '< 1.2 (0 pts)' },
          { value: '1', label: '1.2–1.9 (1 pt)' },
          { value: '2', label: '2.0–5.9 (2 pts)' },
          { value: '3', label: '6.0–11.9 (3 pts)' },
          { value: '4', label: '≥ 12.0 (4 pts)' },
        ]} />
        <SelectInput label="Cardiovascular" value={cvs} onChange={setCVS} options={[
          { value: '0', label: 'MAP ≥ 70 (0 pts)' },
          { value: '1', label: 'MAP < 70 (1 pt)' },
          { value: '2', label: 'Dopamine ≤ 5 or dobutamine (2 pts)' },
          { value: '3', label: 'Dopamine > 5 or epi/norepi ≤ 0.1 (3 pts)' },
          { value: '4', label: 'Dopamine > 15 or epi/norepi > 0.1 (4 pts)' },
        ]} />
        <SelectInput label="CNS: Glasgow Coma Scale" value={gcs} onChange={setGCS} options={[
          { value: '0', label: '15 (0 pts)' },
          { value: '1', label: '13–14 (1 pt)' },
          { value: '2', label: '10–12 (2 pts)' },
          { value: '3', label: '6–9 (3 pts)' },
          { value: '4', label: '< 6 (4 pts)' },
        ]} />
        <SelectInput label="Renal: Creatinine (mg/dL) or UOP" value={renal} onChange={setRenal} options={[
          { value: '0', label: 'Cr < 1.2 (0 pts)' },
          { value: '1', label: 'Cr 1.2–1.9 (1 pt)' },
          { value: '2', label: 'Cr 2.0–3.4 (2 pts)' },
          { value: '3', label: 'Cr 3.5–4.9 or UOP < 500 mL/d (3 pts)' },
          { value: '4', label: 'Cr ≥ 5.0 or UOP < 200 mL/d (4 pts)' },
        ]} />
      </div>
      <div className={`p-4 rounded-2xl border ${color}`}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">SOFA Score</span>
          <span className="text-2xl font-black text-slate-900">{score} <span className="text-sm text-slate-500">/ 24</span></span>
        </div>
        <p className="text-sm font-bold text-slate-800">{label}</p>
        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{detail}</p>
      </div>
      <p className="text-[10px] text-slate-400">SOFA ≥ 2 point increase = organ dysfunction (Sepsis-3 definition when infection suspected).</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// Main Container
// ══════════════════════════════════════════════════════════════════════════

const SCORES = [
  { id: 'curb65', name: 'CURB-65', desc: 'Pneumonia severity', component: CURB65 },
  { id: 'qsofa', name: 'qSOFA', desc: 'Sepsis screening', component: QSOFA },
  { id: 'sofa', name: 'SOFA', desc: 'Organ failure assessment', component: SOFAScore },
  { id: 'cha2ds2', name: 'CHA₂DS₂-VASc', desc: 'AFib stroke risk', component: CHA2DS2VASc },
  { id: 'wellsdvt', name: 'Wells DVT', desc: 'DVT probability', component: WellsDVT },
  { id: 'wellspe', name: 'Wells PE', desc: 'PE probability', component: WellsPE },
  { id: 'childpugh', name: 'Child-Pugh', desc: 'Hepatic function', component: ChildPugh },
  { id: 'meld', name: 'MELD', desc: 'End-stage liver disease', component: MELDScore },
] as const;

export function ClinicalScores() {
  const [activeScore, setActiveScore] = useState('curb65');
  const ActiveComponent = SCORES.find(s => s.id === activeScore)?.component || CURB65;

  return (
    <div className="space-y-4">
      {/* Score selector */}
      <div className="flex flex-wrap gap-1.5">
        {SCORES.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveScore(s.id)}
            className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeScore === s.id
                ? 'bg-[#007AFF] text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Score description */}
      <p className="text-xs text-slate-500">
        {SCORES.find(s => s.id === activeScore)?.desc}
      </p>

      {/* Active calculator */}
      <ActiveComponent />
    </div>
  );
}
