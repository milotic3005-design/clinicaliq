'use client';

import { AlertTriangle, ShieldAlert, Droplet, Thermometer } from 'lucide-react';
import type { Drug } from '@/lib/iv-reference-types';

export function IVBadge({ type, children }: { type: string; children: React.ReactNode }) {
  const styles: Record<string, string> = {
    vesicant: "bg-red-50 text-red-600 border-red-100",
    highAlert: "bg-orange-50 text-orange-600 border-orange-100",
    cat1: "bg-blue-50 text-blue-600 border-blue-100",
    cat2: "bg-emerald-50 text-emerald-600 border-emerald-100",
    niosh: "bg-purple-50 text-purple-600 border-purple-100",
    default: "bg-slate-100 text-slate-600 border-slate-200"
  };
  return (
    <span className={`px-2.5 py-1.5 rounded-lg text-[11px] uppercase tracking-wider font-bold border ${styles[type] || styles.default} flex items-center gap-1.5 w-fit leading-none shadow-sm`}>
      {children}
    </span>
  );
}

export function DrugCard({ drug, onClick }: { drug: Drug; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-[24px] p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.1)] border border-slate-100/50 hover:border-blue-100 transition-all duration-300 cursor-pointer flex flex-col h-full group transform hover:-translate-y-1"
    >
      <div className="flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
            {drug.genericName}
          </h3>
          <IVBadge type={drug.bud?.usp797Category === "Category 1" ? "cat1" : "cat2"}>
            {drug.bud?.usp797Category === "Category 1" ? "Cat 1" : (drug.bud?.usp797Category === "N/A" ? "N/A" : "Cat 2")}
          </IVBadge>
        </div>
        <p className="text-sm font-medium text-slate-500 mb-5">{drug.brandName} <span className="text-slate-300 px-1">&bull;</span> {drug.category}</p>

        <div className="flex flex-wrap gap-2 mb-6">
          {drug.vesicant && <IVBadge type="vesicant"><AlertTriangle className="w-3 h-3" /> Vesicant</IVBadge>}
          {drug.highAlert && <IVBadge type="highAlert"><ShieldAlert className="w-3 h-3" /> High-Alert</IVBadge>}
          {drug.hazardous?.niosh?.includes("Group 1") && <IVBadge type="niosh">NIOSH G1</IVBadge>}
        </div>

        <div className="space-y-3">
          <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
            <Droplet className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <div className="text-sm text-slate-700 truncate font-medium">
              {drug.dilution?.preferredDiluent || "N/A"}
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
            <Thermometer className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <div className="text-sm font-medium text-slate-700 truncate" title={`RT: ${drug.bud?.roomTemp} | Ref: ${drug.bud?.refrigerated}`}>
              BUD: {drug.bud?.roomTemp} (RT)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
