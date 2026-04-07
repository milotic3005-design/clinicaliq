'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, Home, Calculator, ChevronRight, ShieldPlus, Pill, Syringe, HeartPulse, Activity, BookSearch } from 'lucide-react';
import { DRUG_DB } from '@/data/drug-database';
import { DrugCard } from '@/components/iv-reference/drug-card';
import { DrugDetailModal } from '@/components/iv-reference/drug-detail-modal';
import { CaddModal } from '@/components/iv-reference/cadd-calculator';
import { ClinicalCalculatorContainer } from '@/components/iv-reference/clinical-calculators';
import { YSiteCompatibilityChecker } from '@/components/iv-reference/ysite-compatibility';
import { DrugResearchPanel } from '@/components/iv-reference/drug-research-panel';
import type { Drug } from '@/lib/iv-reference-types';
import type { LucideIcon } from 'lucide-react';

function CategoryJumpButton({ icon: Icon, title, desc, colorClass, onClick }: { icon: LucideIcon; title: string; desc: string; colorClass: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`bg-white rounded-[24px] p-6 text-left shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 group flex items-start gap-4 ${colorClass}`}>
      <div className={`p-3 rounded-xl ${colorClass.replace('hover:border-', 'bg-').replace('-500', '-50').replace('-600', '-50')} transition-colors`}>
        <Icon className={`w-6 h-6 ${colorClass.replace('hover:border-', 'text-').replace('-500', '-600')}`} />
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-slate-700 transition-colors flex items-center gap-2">
          {title} <ChevronRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all text-slate-400" />
        </h3>
        <p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
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
    <div className="min-h-screen pb-12" style={{ background: '#f8fafc', color: '#181d26' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-20"
        style={{ background: '#ffffff', borderBottom: '1px solid #e0e2e6' }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div
              style={{
                background: '#1b61c9',
                borderRadius: '12px',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'rgba(45,127,249,0.28) 0px 1px 3px',
              }}
            >
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1
                className="text-lg font-semibold cursor-pointer"
                style={{ color: '#181d26', letterSpacing: '0.08px' }}
                onClick={handleGoHome}
              >
                IV Infusion Reference
              </h1>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(4,14,32,0.69)', letterSpacing: '0.07px' }}>
                Clinical Decision Support Dashboard &bull; {DRUG_DB.length} Medications
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all"
              style={{
                background: '#ffffff',
                border: '1px solid #e0e2e6',
                color: '#181d26',
                letterSpacing: '0.08px',
                boxShadow: 'rgba(15,48,106,0.05) 0px 0px 20px',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#1b61c9'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#e0e2e6'}
            >
              <Home className="w-4 h-4" /> ClinicalIQ
            </a>
            <button
              onClick={handleGoHome}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all"
              style={{
                background: '#ffffff',
                border: '1px solid #e0e2e6',
                color: '#181d26',
                letterSpacing: '0.08px',
                boxShadow: 'rgba(15,48,106,0.05) 0px 0px 20px',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#1b61c9'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#e0e2e6'}
            >
              <Home className="w-4 h-4" /> Home
            </button>
            <button
              onClick={() => setIsResearchOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all"
              style={{
                background: '#1b61c9',
                color: '#ffffff',
                letterSpacing: '0.08px',
                boxShadow: 'rgba(0,0,0,0.32) 0px 0px 1px, rgba(0,0,0,0.08) 0px 0px 2px, rgba(45,127,249,0.28) 0px 1px 3px',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#254fad'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#1b61c9'}
            >
              <BookSearch className="w-4 h-4" /> Drug Research
            </button>
            <button
              onClick={() => setIsCaddOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all"
              style={{
                background: '#1b61c9',
                color: '#ffffff',
                letterSpacing: '0.08px',
                boxShadow: 'rgba(0,0,0,0.32) 0px 0px 1px, rgba(0,0,0,0.08) 0px 0px 2px, rgba(45,127,249,0.28) 0px 1px 3px',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#254fad'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#1b61c9'}
            >
              <Calculator className="w-4 h-4" /> CADD Calculator
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-8">
        {/* Search + Filters */}
        <div className="flex flex-col xl:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(4,14,32,0.4)' }} />
            <input
              type="text"
              placeholder="Search medications..."
              className="w-full pl-11 pr-4 py-3 text-sm font-medium rounded-xl transition-all focus:outline-none"
              style={{
                background: '#ffffff',
                border: '1px solid #e0e2e6',
                color: '#181d26',
                letterSpacing: '0.08px',
                boxShadow: 'rgba(15,48,106,0.05) 0px 0px 20px',
              }}
              onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = '#1b61c9'}
              onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = '#e0e2e6'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div
            className="flex flex-wrap items-center gap-2 p-2 rounded-xl"
            style={{ background: '#ffffff', border: '1px solid #e0e2e6', boxShadow: 'rgba(15,48,106,0.05) 0px 0px 20px' }}
          >
            <div className="pl-2 pr-1" style={{ color: 'rgba(4,14,32,0.4)' }}><Filter className="w-4 h-4" /></div>
            <select
              className="rounded-lg px-3 py-1.5 text-sm font-medium appearance-none cursor-pointer focus:outline-none"
              style={{
                background: '#f8fafc',
                border: '1px solid #e0e2e6',
                color: '#181d26',
                letterSpacing: '0.08px',
              }}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Classes ({totalCount})</option>
              <option value="Oncology">Oncology ({oncologyCount})</option>
              <option value="Antibiotic">Antibiotics ({antibioticCount})</option>
              <option value="Biologic">Biologics ({biologicCount})</option>
              <option value="Supportive Care">Supportive Care ({supportiveCount})</option>
            </select>
            <div className="h-5 w-px mx-1" style={{ background: '#e0e2e6' }} />
            {[
              { label: 'Antibiotics', state: showAntibiotics, set: setShowAntibiotics },
              { label: 'Oncology', state: showOncology, set: setShowOncology },
              { label: 'Biologics', state: showBiologics, set: setShowBiologics },
              { label: 'Supportive Care', state: showSupportive, set: setShowSupportive },
            ].map(f => (
              <label key={f.label} className="flex items-center gap-1.5 cursor-pointer px-2 py-1.5 rounded-lg transition-colors" style={{ letterSpacing: '0.07px' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded"
                  style={{ accentColor: '#1b61c9' }}
                  checked={f.state}
                  onChange={e => f.set(e.target.checked)}
                />
                <span className="text-sm font-medium" style={{ color: '#181d26' }}>{f.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Landing page */}
        {isLandingPage ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-lg font-semibold mb-4 px-1" style={{ color: '#181d26', letterSpacing: '0.12px' }}>Drug Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <CategoryJumpButton icon={ShieldPlus} title={`Oncology (${oncologyCount})`} desc="Chemotherapy agents, alkylators, and therapies." colorClass="hover:border-indigo-300" onClick={() => handleCategoryJump('Oncology')} />
                <CategoryJumpButton icon={Pill} title={`Antibiotics (${antibioticCount})`} desc="Penicillins, cephalosporins, and antimicrobials." colorClass="hover:border-blue-300" onClick={() => handleCategoryJump('Antibiotic')} />
                <CategoryJumpButton icon={Syringe} title={`Biologics (${biologicCount})`} desc="Monoclonal antibodies, immune globulins, and ADCs." colorClass="hover:border-purple-300" onClick={() => handleCategoryJump('Biologic')} />
                <CategoryJumpButton icon={HeartPulse} title={`Supportive Care (${supportiveCount})`} desc="Iron replacements, colony stimulating factors, etc." colorClass="hover:border-amber-300" onClick={() => handleCategoryJump('Supportive Care')} />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-4 px-1" style={{ color: '#181d26', letterSpacing: '0.12px' }}>Clinical Utilities</h2>
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
              <div
                className="col-span-full py-20 flex flex-col items-center justify-center rounded-2xl border border-dashed"
                style={{ background: '#ffffff', borderColor: '#e0e2e6' }}
              >
                <Search className="w-10 h-10 mb-3" style={{ color: 'rgba(4,14,32,0.2)' }} />
                <p className="text-base font-medium" style={{ color: 'rgba(4,14,32,0.69)' }}>No medications found</p>
                <p className="text-sm mt-1" style={{ color: 'rgba(4,14,32,0.4)' }}>Try adjusting your filters or search term.</p>
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
