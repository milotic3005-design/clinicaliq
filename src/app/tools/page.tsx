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
    <div className="min-h-screen" style={{ background: '#f8fafc' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40"
        style={{ background: '#ffffff', borderBottom: '1px solid #e0e2e6' }}
      >
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <a
            href="/"
            className="text-base font-semibold shrink-0"
            style={{ color: '#181d26', letterSpacing: '0.08px' }}
          >
            Clinical<span style={{ color: '#1b61c9' }}>IQ</span>
          </a>
          <div className="flex items-center gap-1">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-xl transition-colors"
              style={{ color: 'rgba(4,14,32,0.69)', letterSpacing: '0.08px' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#1b61c9'; (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(4,14,32,0.69)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <Home className="w-4 h-4" />
              Search
            </a>
            <a
              href="/iv-reference"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-xl transition-colors"
              style={{ color: 'rgba(4,14,32,0.69)', letterSpacing: '0.08px' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#1b61c9'; (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(4,14,32,0.69)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <Activity className="w-4 h-4" />
              IV Reference
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        {/* Title */}
        <div className="mb-6">
          <h1
            className="text-2xl font-bold mb-1"
            style={{ color: '#181d26', letterSpacing: '-0.2px' }}
          >
            Clinical Tools
          </h1>
          <p
            className="text-sm font-medium"
            style={{ color: 'rgba(4,14,32,0.69)', letterSpacing: '0.07px' }}
          >
            Point-of-care calculators, interaction checks, and lab references.
          </p>
        </div>

        {/* Tab navigation */}
        <div
          className="flex gap-2 mb-6 overflow-x-auto pb-1"
        >
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all shrink-0"
                style={isActive ? {
                  background: '#1b61c9',
                  color: '#ffffff',
                  letterSpacing: '0.08px',
                  boxShadow: 'rgba(0,0,0,0.32) 0px 0px 1px, rgba(0,0,0,0.08) 0px 0px 2px, rgba(45,127,249,0.28) 0px 1px 3px',
                } : {
                  background: '#ffffff',
                  color: '#181d26',
                  border: '1px solid #e0e2e6',
                  letterSpacing: '0.08px',
                  boxShadow: 'rgba(15,48,106,0.05) 0px 0px 20px',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.borderColor = '#1b61c9';
                    (e.currentTarget as HTMLElement).style.color = '#1b61c9';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.borderColor = '#e0e2e6';
                    (e.currentTarget as HTMLElement).style.color = '#181d26';
                  }
                }}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Description */}
        <p
          className="text-sm font-medium mb-5"
          style={{ color: 'rgba(4,14,32,0.69)', letterSpacing: '0.07px' }}
        >
          {TABS.find(t => t.id === activeTab)?.desc}
        </p>

        {/* Content */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: '#ffffff',
            border: '1px solid #e0e2e6',
            boxShadow: 'rgba(15,48,106,0.05) 0px 0px 20px',
          }}
        >
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
