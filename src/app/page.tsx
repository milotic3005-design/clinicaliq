'use client';

import { SearchBar } from '@/components/search-bar';
import { FeaturesBento } from '@/components/features-bento';
import { Activity, FlaskConical, ChevronDown } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* ── Hero Section ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4">
        {/* Top nav */}
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
          <span className="text-lg font-bold tracking-tight text-[#1C1C1E]">
            Clinical<span className="text-[#007AFF]">IQ</span>
          </span>
          <div className="flex items-center gap-1">
            <a
              href="/tools"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-[#007AFF] transition-colors rounded-lg hover:bg-gray-50"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              Tools
            </a>
            <a
              href="/iv-reference"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-[#007AFF] transition-colors rounded-lg hover:bg-gray-50"
            >
              <Activity className="w-3.5 h-3.5" />
              IV Reference
            </a>
          </div>
        </nav>

        <div className="flex flex-col items-center gap-8 w-full max-w-3xl">
          {/* Logo & Title */}
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#1C1C1E] mb-3">
              Clinical<span className="text-[#007AFF]">IQ</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
              Evidence-grounded clinical intelligence. Search any drug, disease, or ICD-10 code.
            </p>
          </div>

          {/* Search Bar */}
          <div className="w-full">
            <SearchBar autoFocus />
          </div>

          {/* Quick examples */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-muted-foreground">Try:</span>
            {['vancomycin', 'migraine', 'diabetes', 'E11.65', 'sepsis'].map((term) => (
              <a
                key={term}
                href={`/search?q=${encodeURIComponent(term)}`}
                className="px-3 py-1.5 text-xs font-medium rounded-full bg-gray-100 text-[#1C1C1E] hover:bg-[#007AFF]/10 hover:text-[#007AFF] transition-colors"
              >
                {term}
              </a>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce">
          <span className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-widest">Explore</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground/30" />
        </div>
      </section>

      {/* ── Features Bento Section ── */}
      <FeaturesBento />

      {/* ── Footer ── */}
      <footer className="bg-[#08080D] border-t border-white/[0.05] py-10 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-lg font-bold tracking-tight mb-2" style={{ color: 'rgba(255,255,255,0.85)', fontFamily: '-apple-system, "Inter", sans-serif', letterSpacing: '-0.02em' }}>
            Clinical<span style={{ color: '#007AFF' }}>IQ</span>
          </p>
          <p className="text-[11px] leading-relaxed max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.3)' }}>
            ClinicalIQ retrieves data from FDA, PubMed, ClinicalTrials.gov, MedlinePlus, and NLM.
            All content must be verified against current prescribing information before clinical application.
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <a href="/tools" className="text-[11px] font-medium transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>Tools</a>
            <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
            <a href="/iv-reference" className="text-[11px] font-medium transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>IV Reference</a>
            <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
            <a href="/search?q=vancomycin" className="text-[11px] font-medium transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>Search</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
