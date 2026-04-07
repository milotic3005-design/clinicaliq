'use client';

import { useEffect, useRef } from 'react';

interface Feature {
  id: string;
  title: string;
  desc: string;
  icon: string;
  accent: string;
  accentBg: string;
}

const FEATURES: Feature[] = [
  {
    id: 'hero',
    title: 'AI-Powered Clinical Search',
    desc: 'Search any drug, disease, or ICD-10 code. Instantly aggregates FDA labels, PubMed evidence, clinical trials, treatment guidelines, and MedlinePlus — structured into one actionable brief.',
    icon: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z',
    accent: '#1b61c9',
    accentBg: 'rgba(27,97,201,0.06)',
  },
  {
    id: 'interactions',
    title: 'Drug Interaction Checker',
    desc: 'Check multi-drug interactions powered by NLM RxNorm with severity-coded results and clinical guidance.',
    icon: 'M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5',
    accent: '#254fad',
    accentBg: 'rgba(37,79,173,0.05)',
  },
  {
    id: 'scores',
    title: 'Clinical Scoring',
    desc: 'CURB-65, qSOFA, SOFA, CHA₂DS₂-VASc, Wells DVT/PE, Child-Pugh, and MELD — validated and point-of-care ready.',
    icon: 'M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007v-.008zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008v-.008zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008v-.008zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z',
    accent: '#006400',
    accentBg: 'rgba(0,100,0,0.05)',
  },
  {
    id: 'spectrum',
    title: 'Antibiotic Spectrum',
    desc: '31 antibiotics with Gram+/−, anaerobe, MRSA, Pseudomonas, and ESBL coverage grids.',
    icon: 'M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
    accent: '#b45309',
    accentBg: 'rgba(180,83,9,0.05)',
  },
  {
    id: 'pregnancy',
    title: 'Pregnancy & Lactation',
    desc: 'Drug safety classifications with live NIH LactMed integration.',
    icon: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z',
    accent: '#6b21a8',
    accentBg: 'rgba(107,33,168,0.05)',
  },
  {
    id: 'ddx',
    title: 'Differential Diagnosis',
    desc: 'Symptom-based DDx engine with red flag detection and ranked workup guidance.',
    icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z',
    accent: '#0369a1',
    accentBg: 'rgba(3,105,161,0.05)',
  },
];

const STATS = [
  { value: '7', label: 'Clinical Tools' },
  { value: '178+', label: 'IV Medications' },
  { value: '70+', label: 'Lab References' },
  { value: '35+', label: 'Diagnoses' },
];

const DATA_SOURCES = ['FDA', 'PubMed', 'ClinicalTrials.gov', 'NLM'];

export function FeaturesBento() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('bento-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    const tiles = sectionRef.current?.querySelectorAll('.bento-tile');
    tiles?.forEach((tile) => observer.observe(tile));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full"
      style={{ background: '#f8fafc', borderTop: '1px solid #e0e2e6' }}
    >
      <style jsx>{`
        .bento-grid {
          display: grid;
          gap: 16px;
          grid-template-columns: 1fr;
          grid-template-areas:
            "hero" "f1" "f2" "f3" "f4" "f5";
        }
        @media (min-width: 640px) {
          .bento-grid {
            grid-template-columns: 1fr 1fr;
            grid-template-areas:
              "hero hero"
              "f1   f2"
              "f3   f4"
              "f5   f5";
          }
        }
        @media (min-width: 1024px) {
          .bento-grid {
            grid-template-columns: 1fr 1fr 1fr;
            grid-template-areas:
              "hero hero f1"
              "hero hero f2"
              "f3   f4   f5";
          }
        }
        .bento-tile {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .bento-tile.bento-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .bento-tile:nth-child(1) { transition-delay: 0ms; }
        .bento-tile:nth-child(2) { transition-delay: 70ms; }
        .bento-tile:nth-child(3) { transition-delay: 140ms; }
        .bento-tile:nth-child(4) { transition-delay: 210ms; }
        .bento-tile:nth-child(5) { transition-delay: 280ms; }
        .bento-tile:nth-child(6) { transition-delay: 350ms; }
        .feature-card {
          transition: transform 0.25s ease,
                      box-shadow 0.25s ease,
                      border-color 0.25s ease;
        }
        .feature-card:hover {
          transform: translateY(-2px);
          border-color: #1b61c9 !important;
          box-shadow: rgba(0,0,0,0.32) 0px 0px 1px,
                      rgba(0,0,0,0.08) 0px 0px 2px,
                      rgba(45,127,249,0.28) 0px 4px 12px,
                      rgba(0,0,0,0.06) 0px 0px 0px 0.5px inset;
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
        {/* Section header */}
        <div className="text-center mb-14">
          <p
            className="text-xs font-semibold uppercase mb-3"
            style={{ color: '#1b61c9', letterSpacing: '0.12em' }}
          >
            Clinical Tools Suite
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold mb-4"
            style={{ color: '#181d26', letterSpacing: '-0.3px', lineHeight: 1.2 }}
          >
            Everything a clinician needs.
          </h2>
          <p
            className="text-base max-w-lg mx-auto"
            style={{ color: 'rgba(4,14,32,0.69)', letterSpacing: '0.18px', lineHeight: 1.55 }}
          >
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
              <a
                key={feature.id}
                href={feature.id === 'hero' ? '/search' : '/tools'}
                className="bento-tile feature-card block no-underline"
                style={{
                  gridArea,
                  background: '#ffffff',
                  border: '1px solid #e0e2e6',
                  borderRadius: isHero ? '24px' : '16px',
                  padding: isHero ? '32px' : isSecondary ? '24px' : '20px',
                  minHeight: isHero ? '260px' : undefined,
                  boxShadow: 'rgba(15,48,106,0.05) 0px 0px 20px',
                  textDecoration: 'none',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {/* Subtle accent fill top-right */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '160px',
                    height: '160px',
                    background: `radial-gradient(circle at top right, ${feature.accentBg}, transparent 70%)`,
                    pointerEvents: 'none',
                  }}
                />

                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  {/* Icon */}
                  <div
                    style={{
                      width: isHero ? 48 : 36,
                      height: isHero ? 48 : 36,
                      borderRadius: isHero ? '14px' : '10px',
                      background: feature.accentBg,
                      border: `1px solid ${feature.accent}22`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: isHero ? '20px' : '14px',
                      flexShrink: 0,
                    }}
                  >
                    <svg
                      width={isHero ? 22 : 17}
                      height={isHero ? 22 : 17}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={feature.accent}
                      strokeWidth={1.75}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d={feature.icon} />
                    </svg>
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      color: '#181d26',
                      fontSize: isHero ? '1.2rem' : isSecondary ? '0.9375rem' : '0.875rem',
                      fontWeight: 600,
                      lineHeight: 1.25,
                      letterSpacing: isHero ? '0.12px' : '0.1px',
                      marginBottom: isHero ? '10px' : isSecondary ? '8px' : '6px',
                    }}
                  >
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p
                    style={{
                      color: 'rgba(4,14,32,0.69)',
                      fontSize: isHero ? '0.875rem' : '0.8125rem',
                      lineHeight: 1.55,
                      letterSpacing: '0.07px',
                      maxWidth: isHero ? '400px' : undefined,
                      marginTop: isHero ? 'auto' : undefined,
                    }}
                  >
                    {feature.desc}
                  </p>

                  {/* Hero: data sources footer */}
                  {isHero && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        marginTop: '20px',
                        paddingTop: '16px',
                        borderTop: '1px solid #e0e2e6',
                        flexWrap: 'wrap',
                      }}
                    >
                      {DATA_SOURCES.map((src) => (
                        <span
                          key={src}
                          style={{
                            fontSize: '11px',
                            fontWeight: 500,
                            color: 'rgba(4,14,32,0.69)',
                            letterSpacing: '0.07px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                          }}
                        >
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: '#1b61c9',
                              display: 'inline-block',
                            }}
                          />
                          {src}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Arrow */}
                  <div
                    style={{
                      position: 'absolute',
                      top: isHero ? '32px' : isSecondary ? '24px' : '20px',
                      right: isHero ? '32px' : isSecondary ? '24px' : '20px',
                      color: '#1b61c9',
                      opacity: 0.4,
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 17L17 7M17 7H7M17 7v10" />
                    </svg>
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        {/* Stats bar */}
        <div
          className="mt-14 py-8 px-6 rounded-2xl flex flex-wrap items-center justify-center gap-8 sm:gap-16"
          style={{
            background: '#ffffff',
            border: '1px solid #e0e2e6',
            boxShadow: 'rgba(15,48,106,0.05) 0px 0px 20px',
          }}
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p
                className="text-2xl sm:text-3xl font-bold"
                style={{ color: '#1b61c9', letterSpacing: '-0.5px' }}
              >
                {stat.value}
              </p>
              <p
                className="text-xs font-medium mt-1"
                style={{ color: 'rgba(4,14,32,0.69)', letterSpacing: '0.07px' }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
