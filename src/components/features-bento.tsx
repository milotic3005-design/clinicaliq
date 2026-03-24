'use client';

import { useEffect, useRef } from 'react';

/* ───────────────────────────────────────────────────────────
   Feature definitions — 6 bento tiles in hierarchy
   ─────────────────────────────────────────────────────────── */

interface Feature {
  id: string;
  title: string;
  desc: string;
  icon: string; // SVG path data
  iconAnim: 'pulse' | 'rotate' | 'flash' | 'bounce' | 'scale' | 'shake';
  accent: string; // radial glow color
}

const FEATURES: Feature[] = [
  {
    id: 'hero',
    title: 'AI-Powered Clinical Search',
    desc: 'Search any drug, disease, or ICD-10 code. Instantly aggregates FDA labels, PubMed evidence, clinical trials, treatment guidelines, and MedlinePlus — structured into one actionable brief.',
    icon: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z',
    iconAnim: 'rotate',
    accent: 'rgba(99, 102, 241, 0.15)',
  },
  {
    id: 'interactions',
    title: 'Drug Interaction Checker',
    desc: 'Check multi-drug interactions powered by NLM RxNorm with severity-coded results and clinical guidance.',
    icon: 'M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5',
    iconAnim: 'shake',
    accent: 'rgba(236, 72, 153, 0.12)',
  },
  {
    id: 'scores',
    title: 'Clinical Scoring Calculators',
    desc: 'CURB-65, qSOFA, SOFA, CHA₂DS₂-VASc, Wells DVT/PE, Child-Pugh, and MELD — validated and point-of-care ready.',
    icon: 'M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007v-.008zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008v-.008zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008v-.008zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z',
    iconAnim: 'pulse',
    accent: 'rgba(34, 197, 94, 0.12)',
  },
  {
    id: 'spectrum',
    title: 'Antibiotic Spectrum',
    desc: '31 antibiotics with Gram+/−, anaerobe, MRSA, Pseudomonas, and ESBL coverage grids.',
    icon: 'M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
    iconAnim: 'scale',
    accent: 'rgba(251, 191, 36, 0.12)',
  },
  {
    id: 'pregnancy',
    title: 'Pregnancy & Lactation',
    desc: 'Drug safety classifications with live NIH LactMed integration.',
    icon: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z',
    iconAnim: 'bounce',
    accent: 'rgba(168, 85, 247, 0.12)',
  },
  {
    id: 'ddx',
    title: 'Differential Diagnosis',
    desc: 'Symptom-based DDx engine with red flag detection and ranked workup guidance.',
    icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z',
    iconAnim: 'flash',
    accent: 'rgba(56, 189, 248, 0.12)',
  },
];

/* ───────────────────────────────────────────────────────────
   Component
   ─────────────────────────────────────────────────────────── */

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
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    const tiles = sectionRef.current?.querySelectorAll('.bento-tile');
    tiles?.forEach((tile) => observer.observe(tile));

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #08080D 0%, #0D0D14 40%, #10101A 100%)',
      }}
    >
      {/* Ambient background meshes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }}
        />
        <div
          className="absolute bottom-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #ec4899, transparent 70%)' }}
        />
        <div
          className="absolute top-[30%] right-[20%] w-[300px] h-[300px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #22d3ee, transparent 70%)' }}
        />
      </div>

      {/* Dot grid pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
        {/* Section header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-[#007AFF] animate-pulse" />
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.12em]"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              Clinical Tools Suite
            </span>
          </div>
          <h2
            className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold leading-[1.1] mb-4"
            style={{
              fontFamily: '-apple-system, "Inter", sans-serif',
              letterSpacing: '-0.03em',
              color: 'rgba(255,255,255,0.95)',
            }}
          >
            Everything a clinician needs.
            <br />
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>Nothing they don&apos;t.</span>
          </h2>
          <p
            className="text-sm sm:text-base max-w-lg mx-auto leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            Seven point-of-care tools powered by FDA, NLM, PubMed, and ClinicalTrials.gov — all in one interface.
          </p>
        </div>

        {/* Bento Grid */}
        <div
          className="grid gap-3 sm:gap-3.5"
          style={{
            gridTemplateColumns: 'repeat(1, 1fr)',
          }}
        >
          {/* We use explicit responsive classes via CSS below */}
          <style jsx>{`
            .bento-grid {
              display: grid;
              gap: 14px;
              grid-template-columns: 1fr;
              grid-template-rows: auto;
              grid-template-areas:
                "hero"
                "f1"
                "f2"
                "f3"
                "f4"
                "f5";
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
                grid-template-rows: auto auto auto;
                grid-template-areas:
                  "hero hero f1"
                  "hero hero f2"
                  "f3   f4   f5";
              }
            }

            .bento-tile {
              opacity: 0;
              transform: translateY(24px);
              transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
                          transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
            }

            .bento-tile.bento-visible {
              opacity: 1;
              transform: translateY(0);
            }

            .bento-tile:nth-child(1) { transition-delay: 0ms; }
            .bento-tile:nth-child(2) { transition-delay: 80ms; }
            .bento-tile:nth-child(3) { transition-delay: 160ms; }
            .bento-tile:nth-child(4) { transition-delay: 240ms; }
            .bento-tile:nth-child(5) { transition-delay: 320ms; }
            .bento-tile:nth-child(6) { transition-delay: 400ms; }

            /* Icon animations on tile entry */
            .bento-visible .icon-rotate {
              animation: iconRotate 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
            }
            .bento-visible .icon-pulse {
              animation: iconPulse 0.5s ease 0.3s both;
            }
            .bento-visible .icon-flash {
              animation: iconFlash 0.6s ease 0.3s both;
            }
            .bento-visible .icon-bounce {
              animation: iconBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
            }
            .bento-visible .icon-scale {
              animation: iconScale 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
            }
            .bento-visible .icon-shake {
              animation: iconShake 0.5s ease 0.3s both;
            }

            @keyframes iconRotate {
              0% { transform: rotate(-15deg) scale(0.9); opacity: 0; }
              100% { transform: rotate(0deg) scale(1); opacity: 1; }
            }
            @keyframes iconPulse {
              0% { transform: scaleY(0.7); opacity: 0; }
              60% { transform: scaleY(1.1); }
              100% { transform: scaleY(1); opacity: 1; }
            }
            @keyframes iconFlash {
              0% { opacity: 0; filter: brightness(1); }
              50% { opacity: 1; filter: brightness(2); }
              100% { opacity: 1; filter: brightness(1); }
            }
            @keyframes iconBounce {
              0% { transform: translateY(8px); opacity: 0; }
              60% { transform: translateY(-3px); }
              100% { transform: translateY(0); opacity: 1; }
            }
            @keyframes iconScale {
              0% { transform: scale(0.5); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
            }
            @keyframes iconShake {
              0% { transform: translateX(-4px); opacity: 0; }
              25% { transform: translateX(3px); }
              50% { transform: translateX(-2px); }
              75% { transform: translateX(1px); }
              100% { transform: translateX(0); opacity: 1; }
            }

            /* Hover lift */
            .glass-tile {
              transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                          box-shadow 0.3s ease,
                          background 0.3s ease;
            }
            .glass-tile:hover {
              transform: translateY(-4px);
              box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4),
                          inset 0 1px 0 rgba(255, 255, 255, 0.1);
              background: rgba(255, 255, 255, 0.06) !important;
            }

            /* Tertiary tile description reveal */
            .tertiary-desc {
              opacity: 0;
              max-height: 0;
              transition: opacity 0.3s ease, max-height 0.3s ease;
            }
            .glass-tile:hover .tertiary-desc {
              opacity: 1;
              max-height: 60px;
            }

            /* Hero animated mesh */
            .hero-mesh {
              background-image:
                linear-gradient(rgba(99, 102, 241, 0.06) 1px, transparent 1px),
                linear-gradient(90deg, rgba(99, 102, 241, 0.06) 1px, transparent 1px);
              background-size: 40px 40px;
              animation: meshDrift 20s linear infinite;
            }
            @keyframes meshDrift {
              0% { background-position: 0 0; }
              100% { background-position: 40px 40px; }
            }
          `}</style>

          <div className="bento-grid">
            {FEATURES.map((feature, index) => {
              const isHero = index === 0;
              const isSecondary = index === 1 || index === 2;
              const gridArea = index === 0 ? 'hero' : `f${index}`;

              return (
                <a
                  key={feature.id}
                  href={feature.id === 'hero' ? '/search' : '/tools'}
                  className="bento-tile glass-tile relative group block cursor-pointer no-underline"
                  style={{
                    gridArea,
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.07)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    borderRadius: '16px',
                    boxShadow: '0 4px 32px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                    padding: isHero ? '32px' : isSecondary ? '24px' : '20px',
                    minHeight: isHero ? '280px' : isSecondary ? '140px' : undefined,
                    overflow: 'hidden',
                  }}
                >
                  {/* Accent radial glow */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse at ${isHero ? '30% 40%' : '50% 0%'}, ${feature.accent}, transparent 70%)`,
                      borderRadius: '16px',
                    }}
                  />

                  {/* Hero: animated mesh pattern */}
                  {isHero && (
                    <div className="hero-mesh absolute inset-0 pointer-events-none" style={{ borderRadius: '16px' }} />
                  )}

                  {/* Content */}
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Icon */}
                    <div
                      className={`icon-${feature.iconAnim} flex items-center justify-center shrink-0`}
                      style={{
                        width: isHero ? 48 : 36,
                        height: isHero ? 48 : 36,
                        borderRadius: isHero ? 14 : 10,
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        marginBottom: isHero ? 20 : 14,
                      }}
                    >
                      <svg
                        width={isHero ? 24 : 18}
                        height={isHero ? 24 : 18}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="rgba(255,255,255,0.7)"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d={feature.icon} />
                      </svg>
                    </div>

                    {/* Title */}
                    <h3
                      style={{
                        fontFamily: '-apple-system, "Inter", sans-serif',
                        letterSpacing: '-0.02em',
                        color: 'rgba(255,255,255,0.92)',
                        fontSize: isHero ? '1.25rem' : isSecondary ? '0.9375rem' : '0.875rem',
                        fontWeight: 650,
                        lineHeight: 1.25,
                        marginBottom: isHero ? 10 : isSecondary ? 8 : 0,
                      }}
                    >
                      {feature.title}
                    </h3>

                    {/* Description */}
                    {(isHero || isSecondary) ? (
                      <p
                        style={{
                          color: 'rgba(255,255,255,0.35)',
                          fontSize: isHero ? '0.875rem' : '0.8125rem',
                          lineHeight: 1.55,
                          maxWidth: isHero ? '420px' : undefined,
                          marginTop: 'auto',
                        }}
                      >
                        {feature.desc}
                      </p>
                    ) : (
                      <div className="tertiary-desc mt-2">
                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', lineHeight: 1.5 }}>
                          {feature.desc}
                        </p>
                      </div>
                    )}

                    {/* Hero: bottom accent bar */}
                    {isHero && (
                      <div className="flex items-center gap-3 mt-6 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <span
                          className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide"
                          style={{ color: 'rgba(255,255,255,0.4)' }}
                        >
                          <span className="w-1 h-1 rounded-full bg-emerald-400" />
                          FDA
                        </span>
                        <span
                          className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide"
                          style={{ color: 'rgba(255,255,255,0.4)' }}
                        >
                          <span className="w-1 h-1 rounded-full bg-blue-400" />
                          PubMed
                        </span>
                        <span
                          className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide"
                          style={{ color: 'rgba(255,255,255,0.4)' }}
                        >
                          <span className="w-1 h-1 rounded-full bg-purple-400" />
                          ClinicalTrials.gov
                        </span>
                        <span
                          className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide"
                          style={{ color: 'rgba(255,255,255,0.4)' }}
                        >
                          <span className="w-1 h-1 rounded-full bg-amber-400" />
                          NLM
                        </span>
                      </div>
                    )}

                    {/* Arrow indicator */}
                    <div
                      className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ color: 'rgba(255,255,255,0.3)' }}
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
        </div>

        {/* Bottom stats bar */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 sm:gap-12">
          {[
            { value: '7', label: 'Clinical Tools' },
            { value: '178+', label: 'IV Medications' },
            { value: '70+', label: 'Lab References' },
            { value: '35+', label: 'Diagnoses' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p
                className="text-2xl sm:text-3xl font-bold"
                style={{
                  fontFamily: '-apple-system, "Inter", sans-serif',
                  letterSpacing: '-0.04em',
                  color: 'rgba(255,255,255,0.85)',
                }}
              >
                {stat.value}
              </p>
              <p className="text-[11px] font-medium mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
