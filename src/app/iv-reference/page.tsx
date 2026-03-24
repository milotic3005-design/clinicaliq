'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, Home, Calculator, ChevronRight, ShieldPlus, Pill, Syringe, HeartPulse, Activity } from 'lucide-react';
import { DRUG_DB } from '@/data/drug-database';
import { DrugCard } from '@/components/iv-reference/drug-card';
import { DrugDetailModal } from '@/components/iv-reference/drug-detail-modal';
import { CaddModal } from '@/components/iv-reference/cadd-calculator';
import { ClinicalCalculatorContainer } from '@/components/iv-reference/clinical-calculators';
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
    <div className="min-h-screen bg-[#f5f5f7] font-sans text-slate-900 pb-12 selection:bg-blue-200">
      <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-sm"><Activity className="w-5 h-5" /></div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 cursor-pointer" onClick={handleGoHome}>IV Infusion Reference</h1>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Clinical Decision Support Dashboard &bull; {DRUG_DB.length} Medications</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm">
              <Home className="w-4 h-4" /> ClinicalIQ
            </a>
            <button onClick={handleGoHome} className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm">
              <Home className="w-4 h-4" /> Home
            </button>
            <button onClick={() => setIsCaddOpen(true)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm transform hover:-translate-y-0.5">
              <Calculator className="w-4 h-4" /> CADD Calculator
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-8">
        <div className="flex flex-col xl:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search medications..."
              className="w-full bg-white border border-transparent shadow-sm hover:shadow-md pl-12 pr-4 py-3.5 rounded-2xl text-[15px] font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl shadow-sm">
            <div className="pl-3 pr-1 text-slate-400"><Filter className="w-4 h-4" /></div>
            <select className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer appearance-none pr-8" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="All">All Classes ({totalCount})</option>
              <option value="Oncology">Oncology ({oncologyCount})</option>
              <option value="Antibiotic">Antibiotics ({antibioticCount})</option>
              <option value="Biologic">Biologics ({biologicCount})</option>
              <option value="Supportive Care">Supportive Care ({supportiveCount})</option>
            </select>
            <div className="h-6 w-px bg-slate-200 mx-1" />
            {[
              { label: 'Antibiotics', state: showAntibiotics, set: setShowAntibiotics, color: 'blue' },
              { label: 'Oncology', state: showOncology, set: setShowOncology, color: 'indigo' },
              { label: 'Biologics', state: showBiologics, set: setShowBiologics, color: 'purple' },
              { label: 'Supportive Care', state: showSupportive, set: setShowSupportive, color: 'amber' },
            ].map(f => (
              <label key={f.label} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 px-3 py-2 rounded-xl transition-colors">
                <input type="checkbox" className={`w-4 h-4 rounded text-${f.color}-500 focus:ring-${f.color}-500/20 border-slate-300 transition-all`} checked={f.state} onChange={e => f.set(e.target.checked)} />
                <span className="text-sm font-semibold text-slate-700">{f.label}</span>
              </label>
            ))}
          </div>
        </div>

        {isLandingPage ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4 px-2">Drug Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <CategoryJumpButton icon={ShieldPlus} title={`Oncology (${oncologyCount})`} desc="Chemotherapy agents, alkylators, and therapies." colorClass="hover:border-indigo-300" onClick={() => handleCategoryJump('Oncology')} />
                <CategoryJumpButton icon={Pill} title={`Antibiotics (${antibioticCount})`} desc="Penicillins, cephalosporins, and antimicrobials." colorClass="hover:border-blue-300" onClick={() => handleCategoryJump('Antibiotic')} />
                <CategoryJumpButton icon={Syringe} title={`Biologics (${biologicCount})`} desc="Monoclonal antibodies, immune globulins, and ADCs." colorClass="hover:border-purple-300" onClick={() => handleCategoryJump('Biologic')} />
                <CategoryJumpButton icon={HeartPulse} title={`Supportive Care (${supportiveCount})`} desc="Iron replacements, colony stimulating factors, etc." colorClass="hover:border-amber-300" onClick={() => handleCategoryJump('Supportive Care')} />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4 px-2">Clinical Utilities</h2>
              <div className="grid grid-cols-1 gap-6">
                <ClinicalCalculatorContainer />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-300">
            {filteredDrugs.map(drug => (
              <DrugCard key={drug.id} drug={drug} onClick={() => setSelectedDrug(drug)} />
            ))}
            {filteredDrugs.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 bg-white rounded-[32px] border border-slate-100 border-dashed">
                <Search className="w-12 h-12 mb-4 text-slate-300" />
                <p className="text-lg font-medium text-slate-600">No medications found</p>
                <p className="text-sm mt-1">Try adjusting your filters or search term.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {selectedDrug && <DrugDetailModal drug={selectedDrug} onClose={() => setSelectedDrug(null)} />}
      <CaddModal isOpen={isCaddOpen} onClose={() => setIsCaddOpen(false)} drugDb={DRUG_DB} />
    </div>
  );
}
