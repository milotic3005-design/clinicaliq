import { nanoid } from 'nanoid';
import type { ClinicalBrief, QueryType } from './types';
import { fetchFDALabel } from './sources/openfda-label';
import { fetchFAERS } from './sources/openfda-faers';
import { fetchClinicalTrials } from './sources/clinicaltrials';
import { fetchPubMed } from './sources/pubmed';
import { fetchMedlinePlus } from './sources/medlineplus';
import { fetchICD10 } from './sources/icd10';
import { fetchGuidelines } from './sources/guidelines';
import { cache, getCacheKey, DEFAULT_TTL_MS, SAFETY_TTL_MS } from './cache';

interface TimedResult<T> {
  result: T | null;
  duration_ms: number;
  error?: string;
}

async function timed<T>(
  name: string,
  fn: () => Promise<T | null>
): Promise<TimedResult<T>> {
  const start = Date.now();
  try {
    const result = await fn();
    return { result, duration_ms: Date.now() - start };
  } catch (err) {
    return {
      result: null,
      duration_ms: Date.now() - start,
      error: `${name}: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

export async function aggregateSearch(
  query: string,
  queryType: QueryType,
  forceRefresh: boolean = false
): Promise<{ brief: ClinicalBrief; cached: boolean; cache_age_ms: number | null }> {
  // Check cache
  if (!forceRefresh) {
    const cacheKey = getCacheKey(`${query}:${queryType}`);
    const cached = cache.get<ClinicalBrief>(cacheKey);
    if (cached) {
      return {
        brief: cached.value,
        cached: true,
        cache_age_ms: cached.age_ms,
      };
    }
  }

  const isDrugQuery = queryType === 'drug_lookup' || queryType === 'drug_class';
  const isICD10Query = queryType === 'icd10_code';

  // Fan out to all sources in parallel (guidelines fetched for ALL query types)
  const [fdaLabel, faers, trials, literature, medlineplus, icd10, guidelines] = await Promise.allSettled([
    timed('fda_label', () => isDrugQuery ? fetchFDALabel(query) : Promise.resolve(null)),
    timed('faers', () => isDrugQuery ? fetchFAERS(query) : Promise.resolve(null)),
    timed('trials', () => fetchClinicalTrials(query, queryType)),
    timed('literature', () => fetchPubMed(query, queryType)),
    timed('medlineplus', () => isDrugQuery ? fetchMedlinePlus(query) : Promise.resolve(null)),
    timed('icd10', () => (isICD10Query || queryType === 'disease_state') ? fetchICD10(query) : Promise.resolve(null)),
    timed('guidelines', () => fetchGuidelines(query)),
  ]);

  const extract = <T>(result: PromiseSettledResult<TimedResult<T>>): TimedResult<T> => {
    if (result.status === 'fulfilled') return result.value;
    return { result: null, duration_ms: 0, error: String(result.reason) };
  };

  const fdaResult = extract(fdaLabel);
  const faersResult = extract(faers);
  const trialsResult = extract(trials);
  const litResult = extract(literature);
  const mlpResult = extract(medlineplus);
  const icd10Result = extract(icd10);
  const guidelinesResult = extract(guidelines);

  const fetchDurations: Record<string, number> = {
    fda_label: fdaResult.duration_ms,
    faers: faersResult.duration_ms,
    trials: trialsResult.duration_ms,
    literature: litResult.duration_ms,
    medlineplus: mlpResult.duration_ms,
    icd10: icd10Result.duration_ms,
    guidelines: guidelinesResult.duration_ms,
  };

  const failedSources: string[] = [];
  if (fdaResult.error) failedSources.push('fda_label');
  if (faersResult.error) failedSources.push('faers');
  if (trialsResult.error) failedSources.push('trials');
  if (litResult.error) failedSources.push('literature');
  if (mlpResult.error) failedSources.push('medlineplus');
  if (icd10Result.error) failedSources.push('icd10');
  if (guidelinesResult.error) failedSources.push('guidelines');

  const brief: ClinicalBrief = {
    id: nanoid(12),
    query,
    query_type: queryType,
    retrieved_at: new Date().toISOString(),
    fda_label: fdaResult.result || null,
    adverse_events: faersResult.result || null,
    trials: (trialsResult.result as unknown[]) as ClinicalBrief['trials'] || [],
    literature: (litResult.result as unknown[]) as ClinicalBrief['literature'] || [],
    medlineplus: mlpResult.result || null,
    icd10: icd10Result.result || null,
    guidelines: guidelinesResult.result || null,
    meta: {
      fetch_durations_ms: fetchDurations,
      failed_sources: failedSources,
      cache_hit: false,
      cache_age_ms: null,
    },
  };

  // Cache the result (use shorter TTL for safety-critical data)
  const cacheKey = getCacheKey(`${query}:${queryType}`);
  const ttl = isDrugQuery ? SAFETY_TTL_MS : DEFAULT_TTL_MS;
  cache.set(cacheKey, brief, ttl);

  return { brief, cached: false, cache_age_ms: null };
}
