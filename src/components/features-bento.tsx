'use client';

import { useEffect, useRef } from 'react';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import {
  Search01Icon,
  Activity01Icon,
  Calculator01Icon,
  Shield01Icon,
  Baby01Icon,
  AiBrain01Icon,
  InjectionIcon,
  TestTubesIcon,
  StethoscopeIcon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons';

interface Feature {
  id: string; title: string; desc: string;
  icon: IconSvgElement; accent: string; accentBg: string;
  href: string;
}

const FEATURES: Feature[] = [
  {
    id: 'hero', title: 'AI-Powered Clinical Search', href: '/search',
    desc: 'Search any drug, disease, or ICD-10 code. Instantly aggregates FDA labels, PubMed evidence, clinical trials, treatment guidelines, and MedlinePlus — structured into one actionable brief.',
    icon: Search01Icon, accent: '#1b61c9', accentBg: 'rgba(27,97,201,0.07)',
  },
  {
    id: 'interactions', title: 'Drug Interaction Checker', href: '/tools',
    desc: 'Check multi-drug interactions powered by NLM RxNorm with severity-coded results and clinical guidance.',
    icon: Activity01Icon, accent: '#254fad', accentBg: 'rgba(37,79,173,0.06)',
  },
  {
    id: 'scores', title: 'Clinical Scoring', href: '/tools',
    desc: 'CURB-65, qSOFA, SOFA, CHA₂DS₂-VASc, Wells DVT/PE, Child-Pugh, and MELD — validated and point-of-care ready.',
    icon: Calculator01Icon, accent: '#006400', accentBg: 'rgba(0,100,0,0.06)',
  },
  {
    id: 'spectrum', title: 'Antibiotic Spectrum', href: '/tools',
    desc: '31 antibiotics with Gram+/−, anaerobe, MRSA, Pseudomonas, and ESBL coverage grids.',
    icon: Shield01Icon, accent: '#b45309', accentBg: 'rgba(180,83,9,0.06)',
  },
  {
    id: 'pregnancy', title: 'Pregnancy & Lactation', href: '/tools',
    desc: 'Drug safety classifications with live NIH LactMed integration.',
    icon: Baby01Icon, accent: '#6b21a8', accentBg: 'rgba(107,33,168,0.06)',
  },
  {
    id: 'ddx', title: 'Differential Diagnosis', href: '/tools',
    desc: 'Symptom-based DDx engine with red flag detection and ranked workup guidance.',
    icon: AiBrain01Icon, accent: '#0369a1', accentBg: 'rgba(3,105,161,0.06)',
  },
];

const STATS: { value: string; label: string; icon: IconSvgElement }[] = [
  { value: '7', label: 'Clinical Tools', icon: TestTubesIcon },
  { value: '178+', label: 'IV Medications', icon: InjectionIcon },
  { value: '70+', label: 'Lab References', icon: StethoscopeIcon },
  { value: '35+', label: 'Diagnoses', icon: AiBrain01Icon },
];

const DATA_SOURCES = ['FDA', 'PubMed', 'ClinicalTrials.gov', 'NLM'];

export function FeaturesBento() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('bento-visible'); observer.unobserve(entry.target); } }); },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    const tiles = sectionRef.current?.querySelectorAll('.bento-tile');
    tiles?.forEach((tile) => observer.observe(tile));
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="w-full" style={{ background: '#f8fafc', borderTop: '1px solid #e8eaf0' }}>
      <style jsx>{`
        .bento-grid {
          display: grid; gap: 14px;
          grid-template-columns: 1fr;
          grid-template-areas: "hero" "f1" "f2" "f3" "f4" "f5";
        }
        @media (min-width: 640px) {
          .bento-grid { grid-template-columns: 1fr 1fr; grid-template-areas: "hero hero" "f1 f2" "f3 f4" "f5 f5"; }
        }
        @media (min-width: 1024px) {
          .bento-grid { grid-template-columns: 1fr 1fr 1fr; grid-template-areas: "hero hero f1" "hero hero f2" "f3 f4 f5"; }
        }
        .bento-tile { opacity: 0; transform: translateY(22px); transition: opacity 0.65s cubic-bezier(0.16,1,0.3,1), transform 0.65s cubic-bezier(0.16,1,0.3,1); }
        .bento-tile.bento-visible { opacity: 1; transform: translateY(0); }
        .bento-tile:nth-child(1) { transition-delay: 0ms; }
        .bento-tile:nth-child(2) { transition-delay: 60ms; }
        .bento-tile:nth-child(3) { transition-delay: 120ms; }
        .bento-tile:nth-child(4) { transition-delay: 180ms; }
        .bento-tile:nth-child(5) { transition-delay: 240ms; }
        .bento-tile:nth-child(6) { transition-delay: 300ms; }
        .feature-card {
          transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.28s ease, border-color 0.2s ease;
          will-change: transform;
        }
        .feature-card:hover {
          transform: translateY(-4px) scale(1.005);
          border-color: #1b61c9 !important;
          box-shadow: 0 0 0 1px rgba(27,97,201,0.1), 0 8px 32px rgba(27,97,201,0.12), 0 2px 8px rgba(0,0,0,0.06);
        }
        .stats-card {
          transition: transform 0.25s ease, background 0.2s ease, box-shadow 0.25s ease;
        }
        .stats-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(27,97,201,0.1);
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
        {/* Section header */}
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase mb-3" style={{ color: '#1b61c9', letterSpacing: '0.14em', fontFamily: 'var(--font-display)' }}>
            Clinical Tools Suite
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#0f172a', letterSpacing: '-0.5px', lineHeight: 1.15, fontFamily: 'var(--font-display)' }}>
            Everything a clinician needs.
          </h2>
          <p className="text-base max-w-lg mx-auto" style={{ color: 'rgba(15,23,42,0.6)', lineHeight: 1.6 }}>
            Seven point-of-care tools powered by FDA, NLM, PubMed, and ClinicalTrials.gov — all in one interface.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="bento-grid">
          {FEATURES.map((feature, index) => {
            const isHero = index === 0;
            const isSecondary = index === 1 || index === 2;
            const gridArea = index === 0 ? 'hero' : `f${index}`;

            return (
              <a key={feature.id} href={feature.href}
                className="bento-tile feature-card block no-underline"
                style={{ gridArea, background: '#ffffff', border: '1px solid #e8eaf0', borderRadius: isHero ? '24px' : '18px', padding: isHero ? '36px' : isSecondary ? '26px' : '22px', minHeight: isHero ? '280px' : undefined, boxShadow: '0 1px 4px rgba(15,23,42,0.04), 0 0 0 1px rgba(15,23,42,0.03)', textDecoration: 'none', overflow: 'hidden', position: 'relative' }}
              >
                {/* Accent gradient */}
                <div style={{ position: 'absolute', top: 0, right: 0, width: '180px', height: '180px', background: `radial-gradient(circle at top right, ${feature.accentBg}, transparent 68%)`, pointerEvents: 'none' }} />

                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  {/* Icon */}
                  <div style={{ width: isHero ? 52 : 38, height: isHero ? 52 : 38, borderRadius: isHero ? '15px' : '11px', background: feature.accentBg, border: `1px solid ${feature.accent}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: isHero ? '22px' : '16px', flexShrink: 0 }}>
                    <HugeiconsIcon icon={feature.icon} size={isHero ? 24 : 18} color={feature.accent} strokeWidth={1.8} />
                  </div>

                  {/* Title */}
                  <h3 style={{ color: '#0f172a', fontSize: isHero ? '1.25rem' : isSecondary ? '0.9375rem' : '0.875rem', fontWeight: 700, lineHeight: 1.25, letterSpacing: isHero ? '-0.2px' : '0px', marginBottom: isHero ? '12px' : isSecondary ? '8px' : '6px', fontFamily: 'var(--font-display)' }}>
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p style={{ color: 'rgba(15,23,42,0.62)', fontSize: isHero ? '0.875rem' : '0.8125rem', lineHeight: 1.6, maxWidth: isHero ? '420px' : undefined, marginTop: isHero ? 'auto' : undefined }}>
                    {feature.desc}
                  </p>

                  {/* Hero footer: data sources */}
                  {isHero && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '22px', paddingTop: '18px', borderTop: '1px solid #e8eaf0', flexWrap: 'wrap' }}>
                      {DATA_SOURCES.map((src) => (
                        <span key={src} style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', gap: '5px', letterSpacing: '0.04em' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1b61c9', display: 'inline-block', flexShrink: 0 }} />
                          {src}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Arrow */}
                  <div style={{ position: 'absolute', top: isHero ? '36px' : isSecondary ? '26px' : '22px', right: isHero ? '36px' : isSecondary ? '26px' : '22px', color: feature.accent, opacity: 0.35 }}>
                    <HugeiconsIcon icon={ArrowRight01Icon} size={14} color="currentColor" />
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        {/* Stats bar */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STATS.map((stat) => (
            <div key={stat.label} className="stats-card text-center py-6 px-4 rounded-2xl"
              style={{ background: '#ffffff', border: '1px solid #e8eaf0', boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                <HugeiconsIcon icon={stat.icon} size={20} color="#1b61c9" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold" style={{ color: '#1b61c9', letterSpacing: '-0.5px', fontFamily: 'var(--font-display)' }}>{stat.value}</p>
              <p className="text-xs font-semibold mt-1" style={{ color: 'rgba(15,23,42,0.55)', letterSpacing: '0.04em' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
