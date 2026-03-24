import { NextRequest, NextResponse } from 'next/server';
import type { SuggestResponse } from '@/lib/types';
import { suggestICD10 } from '@/lib/sources/icd10';

const MESH_SUGGEST_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi';
const OPENFDA_SUGGEST_URL = 'https://api.fda.gov/drug/label.json';
// RxNorm approximate-term autocomplete — purpose-built for prefix drug matching
const RXNORM_APPROX_URL = 'https://rxnav.nlm.nih.gov/REST/approximateTerm.json';
// NLM Clinical Tables RxTerms — fast drug name prefix autocomplete
const NLM_RXTERMS_URL = 'https://clinicaltables.nlm.nih.gov/api/rxterms/v3/search';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q');
  const limitParam = request.nextUrl.searchParams.get('limit');
  const limit = Math.min(Math.max(parseInt(limitParam || '7', 10), 1), 10);

  if (!q || q.trim().length < 2) {
    return NextResponse.json(
      { type: 'about:blank', title: 'Bad Request', status: 400, detail: 'Query parameter q is required (min 2 chars).' },
      { status: 400 }
    );
  }

  const trimmed = q.trim();
  const suggestions: SuggestResponse['suggestions'] = [];

  // Parallel fetch from all sources
  const [nlmRxResults, rxnormResults, openfdaResults, meshResults, icd10Results] = await Promise.allSettled([
    fetchNLMRxTerms(trimmed, limit),
    fetchRxNormApprox(trimmed, limit),
    fetchOpenFDASuggestions(trimmed, limit),
    fetchMeSHSuggestions(trimmed, limit),
    fetchICD10Suggestions(trimmed, limit),
  ]);

  // Priority order: NLM RxTerms (best prefix drug autocomplete) → RxNorm → OpenFDA → MeSH → ICD-10
  if (nlmRxResults.status === 'fulfilled')  suggestions.push(...nlmRxResults.value);
  if (rxnormResults.status === 'fulfilled') suggestions.push(...rxnormResults.value);
  if (openfdaResults.status === 'fulfilled') suggestions.push(...openfdaResults.value);
  if (meshResults.status === 'fulfilled')   suggestions.push(...meshResults.value);
  if (icd10Results.status === 'fulfilled')  suggestions.push(...icd10Results.value);

  // Deduplicate by normalised label
  const seen = new Set<string>();
  const unique = suggestions.filter(s => {
    const key = s.label.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return NextResponse.json({ suggestions: unique.slice(0, limit) });
}

/* ── NLM Clinical Tables — RxTerms prefix autocomplete ──────────── */
// Returns drug display names extremely fast with prefix matching ("vanco" → "Vancomycin")
async function fetchNLMRxTerms(
  query: string,
  limit: number
): Promise<SuggestResponse['suggestions']> {
  try {
    const url = `${NLM_RXTERMS_URL}?terms=${encodeURIComponent(query)}&maxList=${limit}`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    // Response: [total, [display_names], null, [rxcuis]]
    const data = await res.json();
    const names: string[] = Array.isArray(data[1]) ? data[1] : [];
    return names.slice(0, limit).map(name => ({
      label: name,
      query_type: 'drug_lookup' as const,
      source: 'openfda' as const, // Shows "FDA" badge — drug source
    }));
  } catch {
    return [];
  }
}

/* ── RxNorm approximate term autocomplete ─────────────────────── */
async function fetchRxNormApprox(
  query: string,
  limit: number
): Promise<SuggestResponse['suggestions']> {
  try {
    const url = `${RXNORM_APPROX_URL}?term=${encodeURIComponent(query)}&maxEntries=${limit}&option=0`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    const candidates = data?.approximateGroup?.candidate || [];
    const seen = new Set<string>();
    const results: SuggestResponse['suggestions'] = [];
    for (const c of candidates) {
      const name = c.name as string;
      const lower = name?.toLowerCase();
      if (name && !seen.has(lower)) {
        seen.add(lower);
        results.push({
          label: name,
          query_type: 'drug_lookup' as const,
          source: 'openfda' as const,
        });
      }
    }
    return results.slice(0, limit);
  } catch {
    return [];
  }
}

/* ── OpenFDA wildcard prefix search ──────────────────────────── */
async function fetchOpenFDASuggestions(
  query: string,
  limit: number
): Promise<SuggestResponse['suggestions']> {
  try {
    // Use wildcard (*) for prefix matching: "vanco*" matches "vancomycin"
    const wildcard = encodeURIComponent(`${query}*`);
    const url = `${OPENFDA_SUGGEST_URL}?search=openfda.generic_name:${wildcard}&limit=${limit}`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    const results = data?.results || [];
    const suggestions: SuggestResponse['suggestions'] = [];
    const seen = new Set<string>();
    for (const result of results) {
      const names = result?.openfda?.generic_name || [];
      for (const name of names) {
        const lower = (name as string).toLowerCase();
        if (!seen.has(lower)) {
          seen.add(lower);
          suggestions.push({
            label: name as string,
            query_type: 'drug_lookup',
            source: 'openfda',
          });
        }
      }
    }
    return suggestions.slice(0, limit);
  } catch {
    return [];
  }
}

/* ── MeSH disease/condition suggestions ──────────────────────── */
async function fetchMeSHSuggestions(
  query: string,
  limit: number
): Promise<SuggestResponse['suggestions']> {
  try {
    const url = `${MESH_SUGGEST_URL}?db=pubmed&term=${encodeURIComponent(query)}[MeSH Terms]&retmode=json&retmax=${limit}`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    const translationStack = data?.esearchresult?.translationstack || [];
    const meshTerms: SuggestResponse['suggestions'] = [];
    for (const item of translationStack) {
      if (typeof item === 'object' && item.term) {
        const term = (item.term as string).replace(/\[.*?\]/g, '').replace(/"/g, '').trim();
        if (term && term.length > 1) {
          meshTerms.push({ label: term, query_type: 'disease_state', source: 'mesh' });
        }
      }
    }
    return meshTerms.slice(0, limit);
  } catch {
    return [];
  }
}

/* ── ICD-10 reverse lookup ────────────────────────────────────── */
async function fetchICD10Suggestions(
  query: string,
  limit: number
): Promise<SuggestResponse['suggestions']> {
  try {
    const results = await suggestICD10(query, limit);
    return results.map(r => ({
      label: `${r.code} - ${r.description}`,
      query_type: 'icd10_code' as const,
      source: 'icd10' as const,
    }));
  } catch {
    return [];
  }
}
