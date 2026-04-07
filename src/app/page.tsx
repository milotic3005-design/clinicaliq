'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FeaturesBento } from '@/components/features-bento';
import { Activity, FlaskConical, ArrowRight, Syringe, BookOpen } from 'lucide-react';

/* ─── Animated Network Canvas ───────────────────────────────────────────── */
function NetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let W = 0, H = 0;

    interface Node {
      x: number; y: number;
      vx: number; vy: number;
      r: number;
      pulse: number;
      pulseSpeed: number;
    }

    const NODES = 52;
    const MAX_DIST = 160;
    const nodes: Node[] = [];

    const resize = () => {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };

    const initNodes = () => {
      nodes.length = 0;
      for (let i = 0; i < NODES; i++) {
        nodes.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.8 + 1,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.02 + 0.008,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Update positions
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += n.pulseSpeed;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      }

      // Draw edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.18;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(75,140,255,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const n of nodes) {
        const glow = 0.55 + Math.sin(n.pulse) * 0.45;
        // Outer glow
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 6);
        grad.addColorStop(0, `rgba(59,130,246,${glow * 0.3})`);
        grad.addColorStop(1, 'rgba(59,130,246,0)');
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 6, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        // Core dot
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(120,180,255,${glow * 0.9 + 0.1})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    resize();
    initNodes();
    draw();

    const ro = new ResizeObserver(() => { resize(); initNodes(); });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  );
}

/* ─── Stat Pill ─────────────────────────────────────────────────────────── */
function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2px',
        padding: '10px 20px',
        borderRadius: '12px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#93c5fd', letterSpacing: '-0.3px' }}>
        {value}
      </span>
      <span style={{ fontSize: '0.7rem', fontWeight: 500, color: 'rgba(186,216,255,0.65)', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
        {label}
      </span>
    </div>
  );
}

/* ─── Home Page ─────────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <main style={{ minHeight: '100vh', background: '#f8fafc' }}>

      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: 'rgba(3,11,24,0.82)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div
          style={{
            maxWidth: '1152px',
            margin: '0 auto',
            padding: '0 24px',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#f0f6ff', letterSpacing: '0.05px' }}>
            Clinical<span style={{ color: '#60a5fa' }}>IQ</span>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {[
              { href: '/tools', icon: FlaskConical, label: 'Tools' },
              { href: '/iv-reference', icon: Activity, label: 'IV Reference' },
            ].map(({ href, icon: Icon, label }) => (
              <a
                key={href}
                href={href}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '10px',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  color: 'rgba(186,216,255,0.75)',
                  letterSpacing: '0.04em',
                  transition: 'color 0.2s, background 0.2s',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.color = '#93c5fd';
                  (e.currentTarget as HTMLElement).style.background = 'rgba(96,165,250,0.1)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.color = 'rgba(186,216,255,0.75)';
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                <Icon style={{ width: '15px', height: '15px' }} />
                {label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section
        style={{
          position: 'relative',
          minHeight: '100vh',
          background: 'linear-gradient(160deg, #030b18 0%, #051530 40%, #071d3e 70%, #030b18 100%)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: '56px',
        }}
      >
        {/* Canvas background */}
        <NetworkCanvas />

        {/* Blue radial glow behind content */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -55%)',
            width: '700px',
            height: '700px',
            background: 'radial-gradient(ellipse at center, rgba(27,97,201,0.22) 0%, rgba(27,97,201,0.06) 45%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Hero content */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '0 24px',
            maxWidth: '780px',
            width: '100%',
          }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '99px',
                background: 'rgba(27,97,201,0.15)',
                border: '1px solid rgba(96,165,250,0.25)',
                marginBottom: '28px',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#60a5fa',
                  boxShadow: '0 0 8px #60a5fa',
                  animation: 'pulse-dot 2s ease-in-out infinite',
                }}
              />
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#93c5fd', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Evidence-Grounded Clinical Intelligence
              </span>
            </div>
          </motion.div>

          {/* Main heading */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1
              style={{
                fontSize: 'clamp(3rem, 8vw, 5.5rem)',
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: '-1.5px',
                marginBottom: '6px',
                color: '#f0f6ff',
              }}
            >
              Clinical
              <span
                style={{
                  color: 'transparent',
                  backgroundImage: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 40%, #818cf8 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                }}
              >
                IQ
              </span>
            </h1>
          </motion.div>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
              color: 'rgba(186,216,255,0.72)',
              lineHeight: 1.6,
              maxWidth: '560px',
              marginBottom: '40px',
              letterSpacing: '0.01em',
            }}
          >
            Clinical decision support powered by FDA, PubMed, ClinicalTrials.gov,
            and NLM — aggregated into instant, evidence-grounded answers.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '48px' }}
          >
            <a
              href="/tools"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '13px 26px',
                borderRadius: '14px',
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: '#ffffff',
                background: 'linear-gradient(135deg, #1b61c9 0%, #2563eb 100%)',
                boxShadow: '0 0 0 1px rgba(0,0,0,0.3), 0 4px 20px rgba(37,99,235,0.45), 0 1px 2px rgba(0,0,0,0.4)',
                textDecoration: 'none',
                transition: 'transform 0.2s, box-shadow 0.2s',
                letterSpacing: '0.01em',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 1px rgba(0,0,0,0.3), 0 8px 30px rgba(37,99,235,0.55), 0 2px 4px rgba(0,0,0,0.4)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 1px rgba(0,0,0,0.3), 0 4px 20px rgba(37,99,235,0.45), 0 1px 2px rgba(0,0,0,0.4)';
              }}
            >
              <FlaskConical style={{ width: '17px', height: '17px' }} />
              Explore Clinical Tools
              <ArrowRight style={{ width: '15px', height: '15px' }} />
            </a>
            <a
              href="/iv-reference"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '13px 26px',
                borderRadius: '14px',
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: '#93c5fd',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(96,165,250,0.25)',
                boxShadow: '0 0 0 1px rgba(0,0,0,0.2)',
                textDecoration: 'none',
                transition: 'transform 0.2s, background 0.2s, border-color 0.2s',
                letterSpacing: '0.01em',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLElement).style.background = 'rgba(96,165,250,0.1)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(96,165,250,0.45)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(96,165,250,0.25)';
              }}
            >
              <Syringe style={{ width: '17px', height: '17px' }} />
              IV Infusion Reference
            </a>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}
          >
            <StatPill value="178+" label="IV Medications" />
            <StatPill value="7" label="Clinical Tools" />
            <StatPill value="70+" label="Lab References" />
            <StatPill value="4" label="Data Sources" />
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          style={{
            position: 'absolute',
            bottom: '32px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span style={{ fontSize: '0.65rem', fontWeight: 500, color: 'rgba(186,216,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Explore
          </span>
          <div
            style={{
              width: '22px',
              height: '36px',
              borderRadius: '11px',
              border: '1.5px solid rgba(96,165,250,0.25)',
              display: 'flex',
              justifyContent: 'center',
              paddingTop: '6px',
            }}
          >
            <div
              style={{
                width: '3px',
                height: '7px',
                borderRadius: '2px',
                background: 'rgba(96,165,250,0.5)',
                animation: 'scroll-dot 1.8s ease-in-out infinite',
              }}
            />
          </div>
        </motion.div>

        {/* Keyframes */}
        <style>{`
          @keyframes pulse-dot {
            0%, 100% { opacity: 1; box-shadow: 0 0 8px #60a5fa; }
            50% { opacity: 0.5; box-shadow: 0 0 4px #60a5fa; }
          }
          @keyframes scroll-dot {
            0% { opacity: 1; transform: translateY(0); }
            80% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 0; transform: translateY(0); }
          }
        `}</style>
      </section>

      {/* ── Feature Cards Section ───────────────────────────────────────── */}
      <FeaturesBento />

      {/* ── Quick Access Strip ──────────────────────────────────────────── */}
      <section style={{ background: '#0a1628', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '56px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 600, color: '#60a5fa', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>
            Quick Access
          </p>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.4rem, 3.5vw, 2rem)', fontWeight: 700, color: '#f0f6ff', letterSpacing: '-0.3px', marginBottom: '36px' }}>
            Point-of-care, instantly.
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
            }}
          >
            {[
              { href: '/tools', icon: FlaskConical, label: 'Clinical Tools', sub: 'Calculators & scoring' },
              { href: '/iv-reference', icon: Syringe, label: 'IV Reference', sub: '178+ medications' },
              { href: '/search?q=vancomycin', icon: BookOpen, label: 'Drug Search', sub: 'FDA-sourced data' },
              { href: '/iv-reference', icon: Activity, label: 'Drug Research', sub: 'AI-powered insights' },
            ].map(({ href, icon: Icon, label, sub }) => (
              <a
                key={label}
                href={href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '16px 20px',
                  borderRadius: '14px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  textDecoration: 'none',
                  transition: 'background 0.2s, border-color 0.2s, transform 0.2s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(96,165,250,0.08)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(96,165,250,0.25)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'rgba(27,97,201,0.2)',
                    border: '1px solid rgba(96,165,250,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon style={{ width: '17px', height: '17px', color: '#60a5fa' }} />
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e0eeff', marginBottom: '2px', letterSpacing: '0.02em' }}>{label}</p>
                  <p style={{ fontSize: '0.72rem', color: 'rgba(186,216,255,0.5)', letterSpacing: '0.02em' }}>{sub}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer
        style={{
          background: '#040e20',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          padding: '36px 24px',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#e0eeff', marginBottom: '8px', letterSpacing: '0.02em' }}>
            Clinical<span style={{ color: '#60a5fa' }}>IQ</span>
          </p>
          <p style={{ fontSize: '0.72rem', color: 'rgba(186,216,255,0.45)', lineHeight: 1.6, maxWidth: '520px', margin: '0 auto 16px', letterSpacing: '0.02em' }}>
            ClinicalIQ aggregates data from FDA, PubMed, ClinicalTrials.gov, MedlinePlus, and NLM.
            All content must be verified against current prescribing information before clinical application.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {[
              { label: 'Tools', href: '/tools' },
              { label: 'IV Reference', href: '/iv-reference' },
              { label: 'Search', href: '/search?q=vancomycin' },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 500,
                  color: 'rgba(186,216,255,0.45)',
                  textDecoration: 'none',
                  letterSpacing: '0.04em',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#60a5fa')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(186,216,255,0.45)')}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}
