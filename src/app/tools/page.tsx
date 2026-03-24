'use client';

import { useState } from 'react';
import { Activity, FlaskConical, Calculator, TestTubes, Home, Shield, Pill, Baby, Stethoscope } from 'lucide-react';
import { DrugInteractionChecker } from '@/components/tools/drug-interaction-checker';
import { ClinicalScores } from '@/components/tools/clinical-scores';
import { LabReference } from '@/components/tools/lab-reference';
import { AntimicrobialSpectrum } from '@/components/tools/antimicrobial-spectrum';
import { DoseAdjustments } from '@/components/tools/dose-adjustments';
import { PregnancyLactation } from '@/components/tools/pregnancy-lactation';
import { DifferentialDiagnosis } from '@/components/tools/differential-diagnosis';

type ToolTab = 'interactions' | 'scores' | 'labs' | 'spectrum' | 'dosing' | 'pregnancy' | 'ddx';

const TABS: { id: ToolTab; label: string; icon: typeof FlaskConical; desc: string }[] = [
  { id: 'interactions', label: 'Drug Interactions', icon: FlaskConical, desc: 'Check drug-drug interactions via NLM RxNorm' },
  { id: 'scores', label: 'Clinical Scores', icon: Calculator, desc: 'CURB-65, qSOFA, SOFA, CHA₂DS₂-VASc, Wells, Child-Pugh, MELD' },
  { id: 'labs', label: 'Lab Reference', icon: TestTubes, desc: 'Normal ranges, critical values, and clinical notes' },
  { id: 'spectrum', label: 'Antibiotic Spectrum', icon: Shield, desc: 'Antimicrobial coverage grid — Gram+, Gram−, anaerobes, atypicals, Pseudomonas, MRSA, ESBL' },
  { id: 'dosing', label: 'Dose Adjustments', icon: Pill, desc: 'Renal & hepatic dose adjustments for commonly used medications' },
  { id: 'pregnancy', label: 'Pregnancy & Lactation', icon: Baby, desc: 'Drug safety in pregnancy & breastfeeding with NIH LactMed integration' },
  { id: 'ddx', label: 'Differential Dx', icon: Stethoscope, desc: 'Symptom-based differential diagnosis helper for common ED & primary care presentations' },
];

export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState<ToolTab>('interactions');

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-border/50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <a href="/" className="text-xl font-bold tracking-tight text-[#1C1C1E] shrink-0">
            Clinical<span className="text-[#007AFF]">IQ</span>
          </a>
          <div className="flex-1" />
          <a href="/" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-[#007AFF] transition-colors">
            <Home className="w-3.5 h-3.5" /> Search
          </a>
          <a href="/iv-reference" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-[#007AFF] transition-colors">
            <Activity className="w-3.5 h-3.5" /> IV Reference
          </a>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1C1C1E]">Clinical Tools</h1>
          <p className="text-sm text-muted-foreground mt-1">Point-of-care calculators, interaction checks, and lab references.</p>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-[#007AFF] text-white shadow-md shadow-blue-500/20'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-200 hover:text-[#007AFF]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground mb-4">
          {TABS.find(t => t.id === activeTab)?.desc}
        </p>

        {/* Content */}
        <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6">
          {activeTab === 'interactions' && <DrugInteractionChecker />}
          {activeTab === 'scores' && <ClinicalScores />}
          {activeTab === 'labs' && <LabReference />}
          {activeTab === 'spectrum' && <AntimicrobialSpectrum />}
          {activeTab === 'dosing' && <DoseAdjustments />}
          {activeTab === 'pregnancy' && <PregnancyLactation />}
          {activeTab === 'ddx' && <DifferentialDiagnosis />}
        </div>
      </div>
    </div>
  );
}
