'use client';

import { useMemo } from 'react';
import type { ClinicalBrief } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FDALabelTab } from '@/components/tabs/fda-label-tab';
import { AdverseEventsTab } from '@/components/tabs/adverse-events-tab';
import { ClinicalTrialsTab } from '@/components/tabs/clinical-trials-tab';
import { LiteratureTab } from '@/components/tabs/literature-tab';
import { DrugSummaryTab } from '@/components/tabs/drug-summary-tab';
import { ICD10Tab } from '@/components/tabs/icd10-tab';
import { GuidelinesTab } from '@/components/tabs/guidelines-tab';

interface ClinicalCardProps {
  brief: ClinicalBrief;
}

interface TabDef {
  id: string;
  label: string;
  available: boolean;
  content: React.ReactNode;
}

export function ClinicalCard({ brief }: ClinicalCardProps) {
  const tabs = useMemo<TabDef[]>(() => {
    const t: TabDef[] = [
      {
        id: 'guidelines',
        label: 'Guidelines',
        available: brief.guidelines !== null,
        content: brief.guidelines ? <GuidelinesTab data={brief.guidelines} /> : null,
      },
      {
        id: 'fda_label',
        label: 'FDA Label',
        available: brief.fda_label !== null,
        content: brief.fda_label ? <FDALabelTab data={brief.fda_label} /> : null,
      },
      {
        id: 'adverse_events',
        label: 'Adverse Events',
        available: brief.adverse_events !== null && brief.adverse_events.reactions.length > 0,
        content: brief.adverse_events ? <AdverseEventsTab data={brief.adverse_events} /> : null,
      },
      {
        id: 'trials',
        label: 'Trials',
        available: brief.trials.length > 0,
        content: <ClinicalTrialsTab data={brief.trials} />,
      },
      {
        id: 'literature',
        label: 'Literature',
        available: brief.literature.length > 0,
        content: <LiteratureTab data={brief.literature} />,
      },
      {
        id: 'medlineplus',
        label: 'Drug Summary',
        available: brief.medlineplus !== null,
        content: brief.medlineplus ? <DrugSummaryTab data={brief.medlineplus} /> : null,
      },
      {
        id: 'icd10',
        label: 'ICD-10 Codes',
        available: brief.icd10 !== null,
        content: brief.icd10 ? <ICD10Tab data={brief.icd10} /> : null,
      },
    ];
    return t;
  }, [brief]);

  const availableTabs = tabs.filter(t => t.available);

  if (availableTabs.length === 0) {
    return (
      <Card className="rounded-xl shadow-sm border-border/50">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No results found for &ldquo;{brief.query}&rdquo;</p>
          {brief.meta.failed_sources.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              Failed sources: {brief.meta.failed_sources.join(', ')}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  const defaultTab = availableTabs[0].id;

  return (
    <Card className="rounded-xl shadow-sm border-border/50 overflow-hidden">
      <Tabs defaultValue={defaultTab} className="w-full">
        <div className="border-b border-border bg-gray-50/50 px-2 pt-2">
          <TabsList className="bg-transparent h-auto p-0 gap-0">
            {availableTabs.map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-[#007AFF] data-[state=active]:bg-white data-[state=active]:shadow-none px-4 py-2.5 text-sm font-medium text-muted-foreground data-[state=active]:text-[#007AFF]"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <CardContent className="p-6">
          {/* Meta info bar */}
          <div className="flex items-center gap-3 mb-4 text-xs text-muted-foreground">
            <span>Query: <span className="font-medium text-[#1C1C1E]">{brief.query}</span></span>
            <span>·</span>
            <span className="capitalize">{brief.query_type.replace('_', ' ')}</span>
            {brief.meta.cache_hit && (
              <>
                <span>·</span>
                <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-medium">Cached</span>
              </>
            )}
            {brief.meta.failed_sources.length > 0 && (
              <>
                <span>·</span>
                <span className="text-amber-600">{brief.meta.failed_sources.length} source(s) unavailable</span>
              </>
            )}
          </div>

          {availableTabs.map(tab => (
            <TabsContent key={tab.id} value={tab.id} className="mt-0">
              {tab.content}
            </TabsContent>
          ))}
        </CardContent>
      </Tabs>
    </Card>
  );
}
