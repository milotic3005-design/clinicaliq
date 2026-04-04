'use client';

import { SearchBar } from '@/components/search-bar';
import { FeaturesBento } from '@/components/features-bento';
import { Activity, FlaskConical } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* ── Navigation ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 bg-white border-b"
        style={{ borderColor: '#e0e2e6' }}
      >
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <span
            className="text-base font-semibold"
            style={{ color: '#181d26', letterSpacing: '0.08px' }}
          >
            Clinical<span style={{ color: '#1b61c9' }}>IQ</span>
          </span>
          <div className="flex items-center gap-1">
            <a
              href="/tools"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-xl transition-colors"
              style={{ color: 'rgba(4,14,32,0.69)', letterSpacing: '0.08px' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#1b61c9'; (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(4,14,32,0.69)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <FlaskConical className="w-4 h-4" />
              Tools
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
      </nav>

      {/* ── Hero Section ── */}
      <section className="pt-14 min-h-screen flex flex-col items-center justify-center px-4">
        <div className="flex flex-col items-center gap-8 w-full max-w-2xl">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
            style={{
              background: '#f8fafc',
              border: '1px solid #e0e2e6',
              color: '#1b61c9',
              letterSpacing: '0.12px',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#1b61c9] animate-pulse" />
            Evidence-grounded clinical intelligence
          </div>

          {/* Heading */}
          <div className="text-center">
            <h1
              className="text-5xl sm:text-6xl font-bold mb-4"
              style={{
                color: '#181d26',
                letterSpacing: '-0.5px',
                lineHeight: 1.1,
              }}
            >
              Clinical<span style={{ color: '#1b61c9' }}>IQ</span>
            </h1>
            <p
              className="text-lg max-w-md mx-auto"
              style={{
                color: 'rgba(4,14,32,0.69)',
                letterSpacing: '0.18px',
                lineHeight: 1.55,
              }}
            >
              Search any drug, disease, or ICD-10 code. Powered by FDA, PubMed, and ClinicalTrials.gov.
            </p>
          </div>

          {/* Search Bar */}
          <div className="w-full">
            <SearchBar autoFocus />
          </div>

          {/* Quick examples */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span
              className="text-xs font-medium"
              style={{ color: 'rgba(4,14,32,0.69)', letterSpacing: '0.07px' }}
            >
              Try:
            </span>
            {['vancomycin', 'migraine', 'diabetes', 'E11.65', 'sepsis'].map((term) => (
              <a
                key={term}
                href={`/search?q=${encodeURIComponent(term)}`}
                className="px-3 py-1 text-xs font-medium rounded-xl transition-all"
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e0e2e6',
                  color: '#181d26',
                  letterSpacing: '0.07px',
                  boxShadow: 'rgba(0,0,0,0.32) 0px 0px 1px, rgba(0,0,0,0.08) 0px 0px 2px, rgba(45,127,249,0.28) 0px 1px 3px',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.color = '#1b61c9';
                  (e.currentTarget as HTMLElement).style.borderColor = '#1b61c9';
                  (e.currentTarget as HTMLElement).style.background = 'rgba(27,97,201,0.04)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.color = '#181d26';
                  (e.currentTarget as HTMLElement).style.borderColor = '#e0e2e6';
                  (e.currentTarget as HTMLElement).style.background = '#f8fafc';
                }}
              >
                {term}
              </a>
            ))}
          </div>

          {/* CTA row */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <a
              href="/tools"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl transition-all"
              style={{
                background: '#1b61c9',
                color: '#ffffff',
                letterSpacing: '0.08px',
                boxShadow: 'rgba(0,0,0,0.32) 0px 0px 1px, rgba(0,0,0,0.08) 0px 0px 2px, rgba(45,127,249,0.28) 0px 1px 3px',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#254fad')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#1b61c9')}
            >
              <FlaskConical className="w-4 h-4" />
              Clinical Tools
            </a>
            <a
              href="/iv-reference"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl transition-all"
              style={{
                background: '#ffffff',
                color: '#181d26',
                border: '1px solid #e0e2e6',
                letterSpacing: '0.08px',
                boxShadow: 'rgba(15,48,106,0.05) 0px 0px 20px',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = '#1b61c9')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = '#e0e2e6')}
            >
              <Activity className="w-4 h-4" />
              IV Reference
            </a>
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <FeaturesBento />

      {/* ── Footer ── */}
      <footer
        className="border-t py-10 px-4"
        style={{ borderColor: '#e0e2e6', background: '#f8fafc' }}
      >
        <div className="max-w-5xl mx-auto text-center">
          <p
            className="text-base font-semibold mb-2"
            style={{ color: '#181d26', letterSpacing: '0.08px' }}
          >
            Clinical<span style={{ color: '#1b61c9' }}>IQ</span>
          </p>
          <p
            className="text-xs leading-relaxed max-w-lg mx-auto"
            style={{ color: 'rgba(4,14,32,0.69)', letterSpacing: '0.07px' }}
          >
            ClinicalIQ retrieves data from FDA, PubMed, ClinicalTrials.gov, MedlinePlus, and NLM.
            All content must be verified against current prescribing information before clinical application.
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            {['Tools:/tools', 'IV Reference:/iv-reference', 'Search:/search?q=vancomycin'].map(link => {
              const [label, href] = link.split(':');
              return (
                <a
                  key={label}
                  href={href}
                  className="text-xs font-medium transition-colors"
                  style={{ color: 'rgba(4,14,32,0.69)', letterSpacing: '0.07px' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#1b61c9')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(4,14,32,0.69)')}
                >
                  {label}
                </a>
              );
            })}
          </div>
        </div>
      </footer>
    </main>
  );
}
