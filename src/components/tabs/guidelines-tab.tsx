'use client';

import type { GuidelinesSummary, GuidelineLink } from '@/lib/sources/guidelines';
import { ExternalLink, BookOpen, Search, Globe, Building2 } from 'lucide-react';

const TYPE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  society: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Society' },
  pubmed: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'PubMed' },
  nice: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'NICE' },
  who: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'WHO' },
};

function GuidelineCard({ g }: { g: GuidelineLink }) {
  const style = TYPE_STYLES[g.type] || TYPE_STYLES.society;
  return (
    <a
      href={g.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 p-4 rounded-xl border border-slate-200/80 hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
    >
      <div className="mt-0.5 p-2 bg-slate-100 group-hover:bg-blue-100 rounded-lg transition-colors flex-shrink-0">
        <BookOpen className="w-4 h-4 text-slate-600 group-hover:text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#1C1C1E] group-hover:text-blue-700 leading-snug transition-colors">
          {g.title}
        </p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Building2 className="w-3 h-3" />
            {g.organization}
          </span>
          {g.year && (
            <span className="text-xs text-muted-foreground">
              ({g.year})
            </span>
          )}
          <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${style.bg} ${style.text}`}>
            {style.label}
          </span>
        </div>
      </div>
      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-500 flex-shrink-0 mt-1 transition-colors" />
    </a>
  );
}

export function GuidelinesTab({ data }: { data: GuidelinesSummary }) {
  const hasCurated = data.curated.length > 0;
  const hasPubmed = data.pubmed_guidelines.length > 0;

  return (
    <div className="space-y-6">
      {/* Curated society guidelines */}
      {hasCurated && (
        <div>
          <h4 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            <Globe className="w-3.5 h-3.5" />
            Society & Organization Guidelines
          </h4>
          <div className="space-y-2">
            {data.curated.map((g, i) => (
              <GuidelineCard key={`curated-${i}`} g={g} />
            ))}
          </div>
        </div>
      )}

      {/* PubMed practice guidelines */}
      {hasPubmed && (
        <div>
          <h4 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            PubMed Practice Guidelines
          </h4>
          <div className="space-y-2">
            {data.pubmed_guidelines.map((g, i) => (
              <GuidelineCard key={`pubmed-${i}`} g={g} />
            ))}
          </div>
        </div>
      )}

      {/* Search other guideline sources */}
      <div className="border-t border-slate-200/60 pt-4">
        <h4 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          <Search className="w-3.5 h-3.5" />
          Search Guideline Databases
        </h4>
        <div className="flex flex-wrap gap-2">
          {data.search_links.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-[#007AFF]/5 hover:text-[#007AFF] hover:border-[#007AFF]/30 transition-colors"
            >
              {link.label}
              <ExternalLink className="w-3 h-3" />
            </a>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground pt-2">
        Guidelines are linked to their original publisher. Always verify against the latest version before clinical application.
      </p>
    </div>
  );
}
