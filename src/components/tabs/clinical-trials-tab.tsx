'use client';

import { useState } from 'react';
import type { ClinicalTrialSummary, TrialPhase, TrialStatus } from '@/lib/types';
import { CitationFooter } from '@/components/citation-footer';
import { Badge } from '@/components/ui/badge';

interface ClinicalTrialsTabProps {
  data: ClinicalTrialSummary[];
}

const phaseColors: Record<TrialPhase, string> = {
  PHASE1: 'bg-gray-100 text-gray-700',
  PHASE2: 'bg-blue-100 text-blue-700',
  PHASE3: 'bg-emerald-100 text-emerald-700',
  PHASE4: 'bg-teal-100 text-teal-700',
  NA: 'bg-gray-50 text-gray-500',
};

const phaseLabels: Record<TrialPhase, string> = {
  PHASE1: 'Phase I', PHASE2: 'Phase II', PHASE3: 'Phase III', PHASE4: 'Phase IV', NA: 'N/A',
};

const statusColors: Record<TrialStatus, string> = {
  RECRUITING: 'bg-green-100 text-green-700',
  ACTIVE_NOT_RECRUITING: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-gray-100 text-gray-700',
  TERMINATED: 'bg-red-100 text-red-700',
  WITHDRAWN: 'bg-gray-100 text-gray-500',
};

const statusLabels: Record<TrialStatus, string> = {
  RECRUITING: 'Recruiting',
  ACTIVE_NOT_RECRUITING: 'Active',
  COMPLETED: 'Completed',
  TERMINATED: 'Terminated',
  WITHDRAWN: 'Withdrawn',
};

export function ClinicalTrialsTab({ data }: ClinicalTrialsTabProps) {
  const [visibleCount, setVisibleCount] = useState(10);
  const visible = data.slice(0, visibleCount);

  return (
    <div>
      <h3 className="text-lg font-semibold text-[#1C1C1E] mb-4">
        Clinical Trials
        <span className="text-sm font-normal text-muted-foreground ml-2">({data.length} results)</span>
      </h3>

      <div className="space-y-3">
        {visible.map((trial) => (
          <div key={trial.nct_id} className="p-4 border border-border rounded-xl">
            <div className="flex items-start justify-between gap-3 mb-2">
              <a
                href={trial.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono font-semibold text-[#007AFF] hover:underline"
              >
                {trial.nct_id}
              </a>
              <div className="flex items-center gap-1.5 shrink-0">
                <Badge variant="outline" className={`text-[10px] border-transparent ${phaseColors[trial.phase]}`}>
                  {phaseLabels[trial.phase]}
                </Badge>
                <Badge variant="outline" className={`text-[10px] border-transparent ${statusColors[trial.status]}`}>
                  {statusLabels[trial.status]}
                </Badge>
              </div>
            </div>

            <p className="text-sm font-medium text-[#1C1C1E] mb-2">{trial.title}</p>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <p><span className="font-medium">Sponsor:</span> {trial.lead_sponsor}</p>
              {trial.enrollment_count && (
                <p><span className="font-medium">Enrollment:</span> {trial.enrollment_count.toLocaleString()}</p>
              )}
              {trial.primary_completion_date && (
                <p><span className="font-medium">Completion:</span> {trial.primary_completion_date}</p>
              )}
              {trial.intervention_name.length > 0 && (
                <p><span className="font-medium">Intervention:</span> {trial.intervention_name.join(', ')}</p>
              )}
            </div>

            {trial.primary_outcome && (
              <p className="text-xs text-muted-foreground mt-2">
                <span className="font-medium">Primary outcome:</span>{' '}
                {trial.primary_outcome.length > 120
                  ? `${trial.primary_outcome.slice(0, 120)}...`
                  : trial.primary_outcome}
              </p>
            )}
          </div>
        ))}
      </div>

      {data.length > visibleCount && (
        <button
          onClick={() => setVisibleCount(prev => prev + 10)}
          className="w-full mt-4 py-2.5 text-sm font-medium text-[#007AFF] hover:bg-[#007AFF]/5 rounded-lg transition-colors"
        >
          Load more trials
        </button>
      )}

      <CitationFooter
        sourceName="ClinicalTrials.gov"
        retrievedAt={data[0]?.retrieved_at || new Date().toISOString()}
        sourceUrl="https://clinicaltrials.gov"
      />
    </div>
  );
}
