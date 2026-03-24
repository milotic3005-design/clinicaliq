'use client';

import { useState } from 'react';
import type { FAERSSummary } from '@/lib/types';
import { CitationFooter } from '@/components/citation-footer';

interface AdverseEventsTabProps {
  data: FAERSSummary;
}

export function AdverseEventsTab({ data }: AdverseEventsTabProps) {
  const [showAll, setShowAll] = useState(false);
  const reactions = showAll ? data.reactions : data.reactions.slice(0, 10);

  const staleMs = Date.now() - new Date(data.retrieved_at).getTime();
  const isStale = staleMs > 6 * 60 * 60 * 1000;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-[#1C1C1E]">Adverse Event Signals</h3>
          <p className="text-xs text-muted-foreground">
            Drug matched: <span className="font-medium">{data.drug_name_matched}</span>
            {' · '}Strategy: {data.match_strategy === 'exact_generic' ? 'Exact generic' : 'Fuzzy brand'}
          </p>
        </div>
        {isStale && (
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded bg-amber-100 text-amber-700">
            Stale data
          </span>
        )}
      </div>

      {/* Reaction frequency table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reaction (MedDRA PT)</th>
              <th className="text-right py-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reports</th>
              <th className="text-right py-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Serious</th>
              <th className="text-right py-2 pl-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fatal</th>
            </tr>
          </thead>
          <tbody>
            {reactions.map((r, i) => (
              <tr key={r.meddra_pt} className={`border-b border-border/50 ${i % 2 === 0 ? 'bg-gray-50/50' : ''}`}>
                <td className="py-2 pr-4 font-medium">{r.meddra_pt}</td>
                <td className="text-right py-2 px-4 tabular-nums">{r.report_count.toLocaleString()}</td>
                <td className="text-right py-2 px-4 tabular-nums">
                  {r.serious_count > 0 ? (
                    <span className="text-amber-600 font-medium">{r.serious_count.toLocaleString()}</span>
                  ) : '—'}
                </td>
                <td className="text-right py-2 pl-4 tabular-nums">
                  {r.fatal_count > 0 ? (
                    <span className="text-[#FF3B30] font-medium">{r.fatal_count.toLocaleString()}</span>
                  ) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.reactions.length > 10 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-[#007AFF] text-xs font-medium mt-3 hover:underline"
        >
          {showAll ? `Show top 10` : `Show all ${data.reactions.length} reactions`}
        </button>
      )}

      {/* FAERS Disclaimer */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-muted-foreground leading-relaxed">
        FAERS data represents voluntary reports and does not establish causation or incidence rate.
        Underreporting is known to occur.
      </div>

      <CitationFooter
        sourceName="OpenFDA FAERS"
        retrievedAt={data.retrieved_at}
        sourceUrl={data.source_url}
      />
    </div>
  );
}
