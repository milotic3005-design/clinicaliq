'use client';

import { useState } from 'react';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import {
  Activity01Icon,
  Calculator01Icon,
  TestTubesIcon,
  Shield01Icon,
  PillIcon,
  Baby01Icon,
  AiBrain01Icon,
  Home01Icon,
  InjectionIcon,
} from '@hugeicons/core-free-icons';
import { DrugInteractionChecker } from '@/components/tools/drug-interaction-checker';
import { ClinicalScores } from '@/components/tools/clinical-scores';
import { LabReference } from '@/components/tools/lab-reference';
import { AntimicrobialSpectrum } from '@/components/tools/antimicrobial-spectrum';
import { DoseAdjustments } from '@/components/tools/dose-adjustments';
import { PregnancyLactation } from '@/components/tools/pregnancy-lactation';
import { DifferentialDiagnosis } from '@/components/tools/differential-diagnosis';

type ToolTab = 'interactions' | 'scores' | 'labs' | 'spectrum' | 'dosing' | 'pregnancy' | 'ddx';

const TABS: { id: ToolTab; label: string; icon: IconSvgElement; desc: string }[] = [
  { id: 'interactions', label: 'Drug Interactions', icon: Activity01Icon, desc: 'Check drug-drug interactions via NLM RxNorm' },
  { id: 'scores',       label: 'Clinical Scores',   icon: Calculator01Icon, desc: 'CURB-65, qSOFA, SOFA, CHA₂DS₂-VASc, Wells, Child-Pugh, MELD' },
  { id: 'labs',         label: 'Lab Reference',      icon: TestTubesIcon,    desc: 'Normal ranges, critical values, and clinical notes' },
  { id: 'spectrum',     label: 'Antibiotic Spectrum', icon: Shield01Icon,    desc: 'Antimicrobial coverage grid — Gram+, Gram−, anaerobes, Pseudomonas, MRSA, ESBL' },
  { id: 'dosing',       label: 'Dose Adjustments',   icon: PillIcon,         desc: 'Renal & hepatic dose adjustments for commonly used medications' },
  { id: 'pregnancy',    label: 'Pregnancy & Lactation', icon: Baby01Icon,    desc: 'Drug safety in pregnancy & breastfeeding with NIH LactMed integration' },
  { id: 'ddx',          label: 'Differential Dx',    icon: AiBrain01Icon,    desc: 'Symptom-based differential diagnosis helper for common ED & primary care presentations' },
];

export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState<ToolTab>('interactions');
  const activeTabData = TABS.find(t => t.id === activeTab)!;

  return (
    <div className="min-h-screen" style={{ background: '#f4f6fb' }}>

      {/* Header */}
      <header className="sticky top-0 z-40" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid #e8eaf0' }}>
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/" className="text-base font-extrabold shrink-0" style={{ color: '#0f172a', letterSpacing: '-0.2px', textDecoration: 'none', fontFamily: 'var(--font-display)' }}>
            Clinical<span style={{ color: '#1b61c9' }}>IQ</span>
          </a>
          <div className="flex items-center gap-1">
            {[
              { href: '/',            icon: Home01Icon,    label: 'Home' },
              { href: '/iv-reference', icon: InjectionIcon, label: 'IV Reference' },
            ].map(({ href, icon, label }) => (
              <a key={href} href={href}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all"
                style={{ color: 'rgba(15,23,42,0.6)', textDecoration: 'none' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = '#1b61c9'; el.style.background = '#f0f4ff'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = 'rgba(15,23,42,0.6)'; el.style.background = 'transparent'; }}
              >
                <HugeiconsIcon icon={icon} size={15} color="currentColor" />
                {label}
              </a>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">

        {/* Title */}
        <div className="mb-7">
          <h1 className="text-2xl font-extrabold mb-1.5" style={{ color: '#0f172a', letterSpacing: '-0.4px', fontFamily: 'var(--font-display)' }}>
            Clinical Tools
          </h1>
          <p className="text-sm" style={{ color: 'rgba(15,23,42,0.58)' }}>
            Point-of-care calculators, interaction checks, and lab references.
          </p>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-2 mb-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold shrink-0 transition-all"
                style={isActive ? {
                  background: '#1b61c9',
                  color: '#ffffff',
                  boxShadow: '0 2px 8px rgba(27,97,201,0.35), 0 0 0 1px rgba(27,97,201,0.2)',
                  fontFamily: 'var(--font-display)',
                } : {
                  background: '#ffffff',
                  color: 'rgba(15,23,42,0.7)',
                  border: '1px solid #e8eaf0',
                  boxShadow: '0 1px 3px rgba(15,23,42,0.05)',
                  fontFamily: 'var(--font-display)',
                }}
                onMouseEnter={e => { if (!isActive) { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#1b61c9'; el.style.color = '#1b61c9'; el.style.background = '#f0f4ff'; } }}
                onMouseLeave={e => { if (!isActive) { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#e8eaf0'; el.style.color = 'rgba(15,23,42,0.7)'; el.style.background = '#ffffff'; } }}
              >
                <HugeiconsIcon icon={tab.icon} size={15} color="currentColor" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Active tab description */}
        <p className="text-sm mb-5" style={{ color: 'rgba(15,23,42,0.55)', paddingLeft: '2px' }}>
          {activeTabData.desc}
        </p>

        {/* Content */}
        <div className="rounded-2xl p-6" style={{ background: '#ffffff', border: '1px solid #e8eaf0', boxShadow: '0 1px 8px rgba(15,23,42,0.05), 0 0 0 1px rgba(15,23,42,0.02)' }}>
          {activeTab === 'interactions' && <DrugInteractionChecker />}
          {activeTab === 'scores'       && <ClinicalScores />}
          {activeTab === 'labs'         && <LabReference />}
          {activeTab === 'spectrum'     && <AntimicrobialSpectrum />}
          {activeTab === 'dosing'       && <DoseAdjustments />}
          {activeTab === 'pregnancy'    && <PregnancyLactation />}
          {activeTab === 'ddx'          && <DifferentialDiagnosis />}
        </div>
      </div>
    </div>
  );
}
