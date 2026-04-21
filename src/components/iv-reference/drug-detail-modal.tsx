'use client';

import { useState, useMemo } from 'react';
import { X, Search, AlertTriangle, ShieldAlert, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';
import type { Drug } from '@/lib/iv-reference-types';
import { IVBadge } from './drug-card';

/* ── Collapsible section ──────────────────────────────────────── */
function Section({ title, icon, defaultOpen = true, children, accent }: {
  title: string; icon: string; defaultOpen?: boolean; children: React.ReactNode; accent?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`rounded-2xl border ${accent || 'border-slate-200/80 bg-white'} overflow-hidden`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-slate-50/50 transition-colors"
      >
        <span className="text-base">{icon}</span>
        <span className="text-sm font-bold text-slate-800 flex-1">{title}</span>
        {open ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="px-4 pb-4 pt-0">{children}</div>}
    </div>
  );
}

/* ── Bullet item ──────────────────────────────────────────────── */
function Bullet({ label, value, warn }: { label: string; value?: string; warn?: boolean }) {
  if (!value || value === 'N/A' || value === 'None') return null;
  return (
    <li className="flex items-start gap-2 text-sm leading-relaxed">
      <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${warn ? 'bg-amber-500' : 'bg-slate-400'}`} />
      <span>
        <span className="font-semibold text-slate-700">{label}:</span>{' '}
        <span className={warn ? 'text-amber-700 font-medium' : 'text-slate-600'}>{value}</span>
      </span>
    </li>
  );
}

/* ── Highlight matching text ──────────────────────────────────── */
function highlightText(text: string, query: string): React.ReactNode {
  if (!query || query.length < 2) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? <mark key={i} className="bg-yellow-200/80 rounded px-0.5">{part}</mark> : part
  );
}

/* ── Main Modal ───────────────────────────────────────────────── */
export function DrugDetailModal({ drug, onClose }: { drug: Drug; onClose: () => void }) {
  const [modalSearch, setModalSearch] = useState('');
  const q = modalSearch.toLowerCase();

  // Check if a section has matching content
  const matches = (text?: string) => !q || (text || '').toLowerCase().includes(q);
  const hl = (text?: string) => text ? highlightText(text, modalSearch) : 'N/A';

  // Determine which sections to show based on search
  const showPrep = useMemo(() => !q || [
    drug.vialSizes?.join(', '), drug.storageIntact,
    drug.reconstitution?.diluent, drug.reconstitution?.volume, drug.reconstitution?.concentration,
    drug.dilution?.preferredDiluent, drug.dilution?.volumeRange, drug.dilution?.finalConcentrationRange,
  ].some(v => matches(v)), [q, drug]);

  const showInfusion = useMemo(() => !q || [
    drug.infusion?.rate, drug.infusion?.duration, drug.infusion?.filterRequired,
    drug.infusion?.lightProtection, drug.infusion?.pvtFreeLinRequired,
  ].some(v => matches(v)), [q, drug]);

  const showBUD = useMemo(() => !q || [
    drug.bud?.roomTemp, drug.bud?.refrigerated, drug.bud?.frozen,
    drug.bud?.usp797Category, drug.bud?.basisNote,
  ].some(v => matches(v)), [q, drug]);

  const showClinical = useMemo(() => !q || [
    drug.summary?.pearls, drug.summary?.dosing, drug.summary?.monitoring,
    drug.emetogenic?.risk, drug.emetogenic?.premeds,
    drug.toxicities?.limits, drug.toxicities?.adjustments,
    drug.sequencing?.order, drug.sequencing?.ySite,
  ].some(v => matches(v)), [q, drug]);

  const showSafety = useMemo(() => !q || [
    drug.hazardous?.niosh, drug.hazardous?.cstd, drug.hazardous?.disposal,
    drug.extravasation?.risk, drug.extravasation?.compress,
    drug.extravasation?.antidote, drug.extravasation?.management,
  ].some(v => matches(v)), [q, drug]);

  const hasFilter = drug.infusion?.filterRequired && drug.infusion.filterRequired !== 'No' && drug.infusion.filterRequired !== 'N/A';
  const hasLight = drug.infusion?.lightProtection && drug.infusion.lightProtection !== 'No' && drug.infusion.lightProtection !== 'N/A';
  const hasPVC = drug.infusion?.pvtFreeLinRequired && drug.infusion.pvtFreeLinRequired !== 'No' && drug.infusion.pvtFreeLinRequired !== 'N/A';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-[#f8f8fa] rounded-[24px] w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-white/20 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="bg-white px-5 py-4 border-b border-slate-200/50 flex-shrink-0">
          <div className="flex justify-between items-start gap-3">
            <div className="min-w-0">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight truncate">{drug.genericName}</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {drug.brandName} · {drug.drugClass}
              </p>
            </div>
            <button onClick={onClose} className="bg-slate-100 hover:bg-slate-200 text-slate-500 p-2 rounded-full transition-colors flex-shrink-0" aria-label="Close drug details" title="Close">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Alert badges */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {drug.vesicant && <IVBadge type="vesicant"><AlertTriangle className="w-3 h-3" /> Vesicant</IVBadge>}
            {drug.highAlert && <IVBadge type="highAlert"><ShieldAlert className="w-3 h-3" /> High-Alert</IVBadge>}
            {drug.hazardous?.niosh?.includes("Group 1") && <IVBadge type="niosh">NIOSH Group 1</IVBadge>}
            <IVBadge type={drug.bud?.usp797Category === "Category 1" ? "cat1" : "cat2"}>
              {drug.bud?.usp797Category || "N/A"}
            </IVBadge>
          </div>

          {/* In-modal search */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search within this drug..."
              value={modalSearch}
              onChange={(e) => setModalSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>
        </div>

        {/* ── Scrollable Content ── */}
        <div className="overflow-y-auto flex-1 p-4 space-y-3">

          {/* PREPARATION */}
          {showPrep && (
            <Section title="Preparation" icon="💉">
              <ul className="space-y-1.5">
                <Bullet label="Vials" value={drug.vialSizes?.join(', ')} />
                <Bullet label="Storage (intact)" value={drug.storageIntact} />
                <Bullet label="Reconstitute with" value={drug.reconstitution?.diluent} />
                <Bullet label="Recon volume" value={drug.reconstitution?.volume} />
                <Bullet label="Recon conc" value={drug.reconstitution?.concentration} />
                <Bullet label="Diluent" value={drug.dilution?.preferredDiluent} />
                <Bullet label="Volume range" value={drug.dilution?.volumeRange} />
                <Bullet label="Final conc range" value={drug.dilution?.finalConcentrationRange} />
              </ul>
            </Section>
          )}

          {/* INFUSION */}
          {showInfusion && (
            <Section title="Infusion" icon="⏱️">
              <ul className="space-y-1.5">
                <Bullet label="Rate" value={drug.infusion?.rate} />
                <Bullet label="Duration" value={drug.infusion?.duration} />
                <Bullet label="In-line filter" value={drug.infusion?.filterRequired} warn={!!hasFilter} />
                <Bullet label="Light protection" value={drug.infusion?.lightProtection} warn={!!hasLight} />
                <Bullet label="PVC/DEHP-free" value={drug.infusion?.pvtFreeLinRequired} warn={!!hasPVC} />
              </ul>
            </Section>
          )}

          {/* BUD */}
          {showBUD && (
            <Section title="Beyond-Use Dating" icon="🌡️">
              <div className="grid grid-cols-3 gap-2 mb-2">
                {[
                  { label: 'Room Temp', val: drug.bud?.roomTemp },
                  { label: 'Refrigerated', val: drug.bud?.refrigerated },
                  { label: 'Frozen', val: drug.bud?.frozen },
                ].map(b => (
                  <div key={b.label} className="bg-slate-50 rounded-xl p-2.5 text-center">
                    <p className="text-[11px] text-slate-500 font-medium">{b.label}</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{b.val || 'N/A'}</p>
                  </div>
                ))}
              </div>
              {drug.bud?.basisNote && drug.bud.basisNote !== 'N/A' && (
                <p className="text-xs text-slate-500 flex items-start gap-1.5 mt-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  {hl(drug.bud.basisNote)}
                </p>
              )}
            </Section>
          )}

          {/* CLINICAL */}
          {showClinical && (
            <Section title="Clinical Notes" icon="📋">
              <ul className="space-y-1.5">
                <Bullet label="Pearls" value={drug.summary?.pearls} />
                <Bullet label="Dosing" value={drug.summary?.dosing} />
                <Bullet label="Monitoring" value={drug.summary?.monitoring} />
                <Bullet label="Emetogenic risk" value={drug.emetogenic?.risk}
                  warn={drug.emetogenic?.risk?.includes('High')} />
                <Bullet label="Pre-meds" value={drug.emetogenic?.premeds} />
                <Bullet label="Dose limits" value={drug.toxicities?.limits} warn />
                <Bullet label="Organ adjustments" value={drug.toxicities?.adjustments} />
                <Bullet label="Sequencing" value={drug.sequencing?.order} />
                <Bullet label="Y-site warnings" value={drug.sequencing?.ySite} warn />
              </ul>
            </Section>
          )}

          {/* SAFETY */}
          {showSafety && (
            <Section title="Safety & Handling" icon="🛡️" accent={drug.vesicant ? 'border-red-200 bg-red-50/30' : undefined}>
              <ul className="space-y-1.5">
                <Bullet label="NIOSH" value={drug.hazardous?.niosh}
                  warn={drug.hazardous?.niosh?.includes('Group 1')} />
                <Bullet label="CSTD" value={drug.hazardous?.cstd}
                  warn={drug.hazardous?.cstd?.includes('Required')} />
                <Bullet label="Waste" value={drug.hazardous?.disposal} />
                <Bullet label="Extravasation risk" value={drug.extravasation?.risk}
                  warn={drug.extravasation?.risk?.includes('Vesicant')} />
                <Bullet label="Compress" value={drug.extravasation?.compress}
                  warn={drug.extravasation?.compress?.includes('WARM')} />
                <Bullet label="Antidote" value={drug.extravasation?.antidote}
                  warn={drug.extravasation?.antidote !== 'None required' && drug.extravasation?.antidote !== 'None' && drug.extravasation?.antidote !== 'N/A'} />
              </ul>
              {drug.extravasation?.management && drug.extravasation.management !== 'N/A' && (
                <div className="mt-2 bg-red-50 border border-red-100 rounded-xl p-3">
                  <p className="text-xs font-bold text-red-800 mb-1">⚠️ Extravasation Protocol</p>
                  <p className="text-xs text-red-700 leading-relaxed">{hl(drug.extravasation.management)}</p>
                </div>
              )}
            </Section>
          )}

          {/* No results */}
          {modalSearch && !showPrep && !showInfusion && !showBUD && !showClinical && !showSafety && (
            <div className="text-center py-8 text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">No matching content for &ldquo;{modalSearch}&rdquo;</p>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="bg-white px-5 py-3 border-t border-slate-200/50 flex justify-between items-center flex-shrink-0">
          <a href={drug.sourceUrl || "#"} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium text-xs transition-colors">
            DailyMed <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button onClick={onClose}
            className="px-6 py-2 bg-slate-900 text-white rounded-full text-sm font-semibold hover:bg-slate-800 transition-all">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
