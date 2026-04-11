'use client';

import { useState, useMemo } from 'react';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import {
  Search01Icon, FilterIcon, Home01Icon, Calculator01Icon,
  ArrowRight01Icon, Shield01Icon, PillIcon, InjectionIcon,
  Activity01Icon, MedicalFileIcon, AiSearchIcon,
} from '@hugeicons/core-free-icons';
import { DRUG_DB } from '@/data/drug-database';
import { DrugCard } from '@/components/iv-reference/drug-card';
import { DrugDetailModal } from '@/components/iv-reference/drug-detail-modal';
import { CaddModal } from '@/components/iv-reference/cadd-calculator';
import { ClinicalCalculatorContainer } from '@/components/iv-reference/clinical-calculators';
import { YSiteCompatibilityChecker } from '@/components/iv-reference/ysite-compatibility';
import { DrugResearchPanel } from '@/components/iv-reference/drug-research-panel';
import type { Drug } from '@/lib/iv-reference-types';

function CategoryJumpButton({ icon, title, desc, accent, onClick }: { icon: IconSvgElement; title: string; desc: string; accent: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="bg-white rounded-[20px] p-5 text-left border transition-all duration-250 group flex items-start gap-4"
      style={{ border: '1px solid #e8eaf0', boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = accent; el.style.boxShadow = `0 4px 20px ${accent}18, 0 1px 4px rgba(15,23,42,0.06)`; el.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#e8eaf0'; el.style.boxShadow = '0 1px 4px rgba(15,23,42,0.04)'; el.style.transform = 'translateY(0)'; }}
    >
      <div className="p-3 rounded-xl shrink-0" style={{ background: `${accent}12`, border: `1px solid ${accent}22` }}>
        <HugeiconsIcon icon={icon} size={22} color={accent} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-bold mb-1 flex items-center gap-2" style={{ color: '#0f172a', fontFamily: 'var(--font-display)' }}>
          {title}
          <HugeiconsIcon icon={ArrowRight01Icon} size={14} color={accent} />
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(15,23,42,0.58)' }}>{desc}</p>
      </div>
    </button>
  );
}

export default function IVReferencePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAntibiotics, setShowAntibiotics] = useState(false);
  const [showOncology, setShowOncology] = useState(false);
  const [showBiologics, setShowBiologics] = useState(false);
  const [showSupportive, setShowSupportive] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [isCaddOpen, setIsCaddOpen] = useState(false);
  const [isResearchOpen, setIsResearchOpen] = useState(false);

  const totalCount = DRUG_DB.length;
  const oncologyCount = DRUG_DB.filter(d => d.category === 'Oncology').length;
  const antibioticCount = DRUG_DB.filter(d => d.category === 'Antibiotic').length;
  const biologicCount = DRUG_DB.filter(d => d.category === 'Biologic').length;
  const supportiveCount = DRUG_DB.filter(d => d.category === 'Supportive Care').length;

  const isLandingPage = searchTerm === '' && selectedCategory === 'All' && !showAntibiotics && !showOncology && !showBiologics && !showSupportive;

  const handleGoHome = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setShowAntibiotics(false);
    setShowOncology(false);
    setShowBiologics(false);
    setShowSupportive(false);
    setSelectedDrug(null);
    setIsCaddOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryJump = (category: string) => {
    setSelectedCategory(category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredDrugs = useMemo(() => {
    return DRUG_DB.filter(drug => {
      const searchMatch = `${drug.genericName} ${drug.brandName}`.toLowerCase().includes(searchTerm.toLowerCase());
      const catMatch = selectedCategory === 'All' || drug.category === selectedCategory;
      const quickFilterMatch =
        (!showAntibiotics && !showOncology && !showBiologics && !showSupportive) ||
        (showAntibiotics && drug.category === 'Antibiotic') ||
        (showOncology && drug.category === 'Oncology') ||
        (showBiologics && drug.category === 'Biologic') ||
        (showSupportive && drug.category === 'Supportive Care');
      return searchMatch && catMatch && quickFilterMatch;
    });
  }, [searchTerm, selectedCategory, showAntibiotics, showOncology, showBiologics, showSupportive]);

  return (
    <div className="min-h-screen pb-12" style={{ background: '#f4f6fb', color: '#0f172a' }}>

      {/* Header */}
      <header className="sticky top-0 z-40" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid #e8eaf0' }}>
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div style={{ background: '#1b61c9', borderRadius: '10px', padding: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 6px rgba(27,97,201,0.35)' }}>
              <HugeiconsIcon icon={InjectionIcon} size={16} color="#ffffff" />
            </div>
            <div>
              <h1 className="text-base font-extrabold cursor-pointer leading-tight" style={{ color: '#0f172a', letterSpacing: '-0.2px', fontFamily: 'var(--font-display)' }} onClick={handleGoHome}>
                IV Infusion Reference
              </h1>
              <p className="text-xs" style={{ color: 'rgba(15,23,42,0.5)' }}>
                {DRUG_DB.length} medications &bull; Clinical Decision Support
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {[
              { href: '/', icon: Home01Icon, label: 'Home', isLink: true },
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
            <button onClick={() => setIsResearchOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: '#f0f4ff', color: '#1b61c9', border: '1px solid rgba(27,97,201,0.18)' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#e0eaff'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#f0f4ff'; }}
            >
              <HugeiconsIcon icon={AiSearchIcon} size={15} color="currentColor" />
              Drug Research
            </button>
            <button onClick={() => setIsCaddOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: '#1b61c9', color: '#ffffff', boxShadow: '0 1px 6px rgba(27,97,201,0.35)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#254fad'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#1b61c9'}
            >
              <HugeiconsIcon icon={Calculator01Icon} size={15} color="currentColor" />
              CADD Calculator
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-8">

        {/* Search + Filters */}
        <div className="flex flex-col xl:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <HugeiconsIcon icon={Search01Icon} size={16} color="rgba(15,23,42,0.35)" />
            </div>
            <input
              type="text"
              placeholder="Search medications..."
              className="w-full pl-10 pr-4 py-2.5 text-sm font-medium rounded-xl transition-all focus:outline-none"
              style={{ background: '#ffffff', border: '1px solid #e8eaf0', color: '#0f172a', boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}
              onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = '#1b61c9'}
              onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = '#e8eaf0'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 px-3 py-2 rounded-xl" style={{ background: '#ffffff', border: '1px solid #e8eaf0', boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
            <HugeiconsIcon icon={FilterIcon} size={14} color="rgba(15,23,42,0.4)" />
            <select
              className="rounded-lg px-2.5 py-1.5 text-sm font-medium appearance-none cursor-pointer focus:outline-none"
              style={{ background: '#f4f6fb', border: '1px solid #e8eaf0', color: '#0f172a' }}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Classes ({totalCount})</option>
              <option value="Oncology">Oncology ({oncologyCount})</option>
              <option value="Antibiotic">Antibiotics ({antibioticCount})</option>
              <option value="Biologic">Biologics ({biologicCount})</option>
              <option value="Supportive Care">Supportive Care ({supportiveCount})</option>
            </select>
            <div className="h-5 w-px mx-1" style={{ background: '#e8eaf0' }} />
            {[
              { label: 'Antibiotics', state: showAntibiotics, set: setShowAntibiotics },
              { label: 'Oncology', state: showOncology, set: setShowOncology },
              { label: 'Biologics', state: showBiologics, set: setShowBiologics },
              { label: 'Supportive Care', state: showSupportive, set: setShowSupportive },
            ].map(f => (
              <label key={f.label} className="flex items-center gap-1.5 cursor-pointer px-2 py-1.5 rounded-lg transition-colors"
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f4f6fb'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                <input type="checkbox" className="w-3.5 h-3.5 rounded" style={{ accentColor: '#1b61c9' }} checked={f.state} onChange={e => f.set(e.target.checked)} />
                <span className="text-sm font-medium" style={{ color: '#0f172a' }}>{f.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Landing page */}
        {isLandingPage ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-base font-bold mb-4 px-1" style={{ color: '#0f172a', fontFamily: 'var(--font-display)', letterSpacing: '-0.1px' }}>Drug Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <CategoryJumpButton icon={Shield01Icon} accent="#4f46e5" title={`Oncology (${oncologyCount})`} desc="Chemotherapy agents, alkylators, and targeted therapies." onClick={() => handleCategoryJump('Oncology')} />
                <CategoryJumpButton icon={PillIcon} accent="#1b61c9" title={`Antibiotics (${antibioticCount})`} desc="Penicillins, cephalosporins, and antimicrobials." onClick={() => handleCategoryJump('Antibiotic')} />
                <CategoryJumpButton icon={InjectionIcon} accent="#7c3aed" title={`Biologics (${biologicCount})`} desc="Monoclonal antibodies, immune globulins, and ADCs." onClick={() => handleCategoryJump('Biologic')} />
                <CategoryJumpButton icon={Activity01Icon} accent="#d97706" title={`Supportive Care (${supportiveCount})`} desc="Iron replacements, colony stimulating factors, etc." onClick={() => handleCategoryJump('Supportive Care')} />
              </div>
            </div>
            <div>
              <h2 className="text-base font-bold mb-4 px-1" style={{ color: '#0f172a', fontFamily: 'var(--font-display)', letterSpacing: '-0.1px' }}>Clinical Utilities</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ClinicalCalculatorContainer />
                <YSiteCompatibilityChecker />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-in fade-in duration-300">
            {filteredDrugs.map(drug => (
              <DrugCard key={drug.id} drug={drug} onClick={() => setSelectedDrug(drug)} />
            ))}
            {filteredDrugs.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center rounded-2xl border border-dashed" style={{ background: '#ffffff', borderColor: '#e8eaf0' }}>
                <HugeiconsIcon icon={Search01Icon} size={36} color="rgba(15,23,42,0.18)" />
                <p className="text-base font-semibold mt-3" style={{ color: 'rgba(15,23,42,0.6)' }}>No medications found</p>
                <p className="text-sm mt-1" style={{ color: 'rgba(15,23,42,0.4)' }}>Try adjusting your filters or search term.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {selectedDrug && <DrugDetailModal drug={selectedDrug} onClose={() => setSelectedDrug(null)} />}
      <CaddModal isOpen={isCaddOpen} onClose={() => setIsCaddOpen(false)} drugDb={DRUG_DB} />
      <DrugResearchPanel isOpen={isResearchOpen} onClose={() => setIsResearchOpen(false)} />
    </div>
  );
}
