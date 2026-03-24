import type { FAERSSummary, FAERSReaction } from '../types';

const BASE_URL = 'https://api.fda.gov/drug/event.json';

async function fetchReactionCounts(
  drugQuery: string,
  matchField: string,
  additionalFilter?: string
): Promise<{ term: string; count: number }[]> {
  const filter = additionalFilter
    ? `${matchField}:"${drugQuery}"+AND+${additionalFilter}`
    : `${matchField}:"${drugQuery}"`;

  const url = `${BASE_URL}?search=${encodeURIComponent(filter)}&count=patient.reaction.reactionmeddrapt.exact&limit=50`;

  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 404) return [];
    throw new Error(`FAERS: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data?.results || [];
}

export async function fetchFAERS(query: string): Promise<FAERSSummary | null> {
  const drugName = query.trim();
  let matchStrategy: 'exact_generic' | 'fuzzy_brand' = 'exact_generic';
  let matchField = 'patient.drug.openfda.generic_name.exact';

  // Try exact generic name first
  let allReactions = await fetchReactionCounts(drugName, matchField);

  // Fallback to brand/medicinal product
  if (allReactions.length === 0) {
    matchField = 'patient.drug.medicinalproduct';
    matchStrategy = 'fuzzy_brand';
    allReactions = await fetchReactionCounts(drugName, matchField);
  }

  if (allReactions.length === 0) return null;

  // Fetch serious and fatal counts separately
  const [seriousReactions, fatalReactions] = await Promise.all([
    fetchReactionCounts(drugName, matchField, 'serious:1'),
    fetchReactionCounts(drugName, matchField, 'seriousnessdeath:1'),
  ]);

  const seriousMap = new Map(seriousReactions.map(r => [r.term, r.count]));
  const fatalMap = new Map(fatalReactions.map(r => [r.term, r.count]));

  const reactions: FAERSReaction[] = allReactions.map(r => ({
    meddra_pt: r.term,
    report_count: r.count,
    serious_count: seriousMap.get(r.term) || 0,
    fatal_count: fatalMap.get(r.term) || 0,
  }));

  const totalReports = reactions.reduce((sum, r) => sum + r.report_count, 0);
  const sourceUrl = `${BASE_URL}?search=${encodeURIComponent(`${matchField}:"${drugName}"`)}`;

  return {
    drug_name_matched: drugName,
    match_strategy: matchStrategy,
    reactions,
    total_reports_queried: totalReports,
    retrieved_at: new Date().toISOString(),
    source_url: sourceUrl,
  };
}
