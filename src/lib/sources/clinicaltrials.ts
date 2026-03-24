import type { ClinicalTrialSummary, TrialPhase, TrialStatus, QueryType } from '../types';

const BASE_URL = 'https://clinicaltrials.gov/api/v2/studies';

function mapPhase(phases: string[] | undefined): TrialPhase {
  if (!phases || phases.length === 0) return 'NA';
  const p = phases[0];
  if (p.includes('4') || p === 'PHASE4') return 'PHASE4';
  if (p.includes('3') || p === 'PHASE3') return 'PHASE3';
  if (p.includes('2') || p === 'PHASE2') return 'PHASE2';
  if (p.includes('1') || p === 'PHASE1') return 'PHASE1';
  return 'NA';
}

function mapStatus(s: string): TrialStatus {
  const upper = s.toUpperCase().replace(/ /g, '_');
  const valid: TrialStatus[] = ['RECRUITING', 'ACTIVE_NOT_RECRUITING', 'COMPLETED', 'TERMINATED', 'WITHDRAWN'];
  return valid.includes(upper as TrialStatus) ? (upper as TrialStatus) : 'COMPLETED';
}

function trialSortKey(trial: ClinicalTrialSummary): number {
  const phaseOrder: Record<TrialPhase, number> = {
    PHASE4: 0, PHASE3: 1, PHASE2: 2, PHASE1: 3, NA: 4,
  };
  const statusOrder: Record<TrialStatus, number> = {
    COMPLETED: 0, RECRUITING: 1, ACTIVE_NOT_RECRUITING: 2, TERMINATED: 3, WITHDRAWN: 4,
  };
  return (phaseOrder[trial.phase] ?? 4) * 10 + (statusOrder[trial.status] ?? 4);
}

export async function fetchClinicalTrials(
  query: string,
  queryType: QueryType,
  pageSize: number = 10
): Promise<ClinicalTrialSummary[]> {
  const params = new URLSearchParams({
    'format': 'json',
    'pageSize': String(pageSize),
    'filter.overallStatus': 'RECRUITING|ACTIVE_NOT_RECRUITING|COMPLETED',
  });

  if (queryType === 'drug_lookup' || queryType === 'drug_class') {
    params.set('query.intr', query);
  } else {
    params.set('query.cond', query);
  }

  const url = `${BASE_URL}?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 404) return [];
    throw new Error(`ClinicalTrials.gov: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const studies = data?.studies;
  if (!studies || studies.length === 0) return [];

  const now = new Date().toISOString();

  const trials: ClinicalTrialSummary[] = studies.map((study: Record<string, unknown>): ClinicalTrialSummary => {
    const proto = study.protocolSection as Record<string, unknown> || {};
    const id = (proto.identificationModule as Record<string, unknown>) || {};
    const status = (proto.statusModule as Record<string, unknown>) || {};
    const design = (proto.designModule as Record<string, unknown>) || {};
    const sponsor = (proto.sponsorCollaboratorsModule as Record<string, unknown>) || {};
    const arms = (proto.armsInterventionsModule as Record<string, unknown>) || {};
    const outcomes = (proto.outcomesModule as Record<string, unknown>) || {};

    const nctId = (id.nctId as string) || '';
    const interventions = (arms.interventions as Array<Record<string, unknown>>) || [];
    const primaryOutcomes = (outcomes.primaryOutcomes as Array<Record<string, unknown>>) || [];
    const leadSponsor = (sponsor.leadSponsor as Record<string, unknown>) || {};
    const phases = (design.phases as string[]) || [];
    const enrollment = (design.enrollmentInfo as Record<string, unknown>) || {};

    return {
      nct_id: nctId,
      title: (id.briefTitle as string) || '',
      status: mapStatus((status.overallStatus as string) || 'COMPLETED'),
      phase: mapPhase(phases),
      enrollment_count: (enrollment.count as number) || null,
      primary_completion_date: (status.primaryCompletionDateStruct as Record<string, unknown>)?.date as string || null,
      lead_sponsor: (leadSponsor.name as string) || 'Unknown',
      intervention_name: interventions.map((i) => (i.name as string) || '').filter(Boolean),
      primary_outcome: primaryOutcomes[0]?.measure as string || '',
      source_url: `https://clinicaltrials.gov/study/${nctId}`,
      retrieved_at: now,
    };
  });

  // Sort: Phase III/IV completed first, then recruiting, then earlier phases
  trials.sort((a, b) => trialSortKey(a) - trialSortKey(b));

  return trials;
}
