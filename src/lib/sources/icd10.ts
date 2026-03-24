// ICD-10-CM lookup via NLM Clinical Tables API (free, no auth required)

const NLM_ICD10_URL = 'https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search';

export interface ICD10Result {
  code: string;
  description: string;
}

export interface ICD10Summary {
  query: string;
  exact_match: ICD10Result | null;
  related_codes: ICD10Result[];
  source_url: string;
  retrieved_at: string;
}

/**
 * Search ICD-10-CM codes. Works for both:
 *  - Code lookup: "E11.65" → returns exact match + related codes
 *  - Reverse search: "diabetes" → returns all matching ICD-10 codes
 */
export async function fetchICD10(query: string): Promise<ICD10Summary | null> {
  try {
    const url = `${NLM_ICD10_URL}?sf=code,name&terms=${encodeURIComponent(query)}&maxList=25`;
    const res = await fetch(url, { next: { revalidate: 86400 } }); // Cache 24h
    if (!res.ok) return null;

    // NLM returns: [totalCount, codeArray, extraFieldsObj, displayStringsArray]
    const data = await res.json();
    const total: number = data[0] || 0;
    const codes: string[] = data[1] || [];
    const displayPairs: string[][] = data[3] || [];

    if (total === 0 || codes.length === 0) return null;

    const results: ICD10Result[] = codes.map((code, i) => ({
      code,
      description: displayPairs[i]?.[1] || displayPairs[i]?.[0] || code,
    }));

    // Determine if query matches a specific code exactly
    const upperQuery = query.trim().toUpperCase();
    const exactMatch = results.find(r => r.code === upperQuery) || null;

    return {
      query,
      exact_match: exactMatch,
      related_codes: exactMatch ? results.filter(r => r.code !== upperQuery) : results,
      source_url: `https://www.icd10data.com/ICD10CM/Codes/${upperQuery}`,
      retrieved_at: new Date().toISOString(),
    };
  } catch (err) {
    console.error('ICD-10 fetch error:', err);
    return null;
  }
}

/**
 * Suggest ICD-10 codes for autocomplete (both code and description search)
 */
export async function suggestICD10(query: string, limit: number = 5): Promise<ICD10Result[]> {
  try {
    const url = `${NLM_ICD10_URL}?sf=code,name&terms=${encodeURIComponent(query)}&maxList=${limit}`;
    const res = await fetch(url);
    if (!res.ok) return [];

    const data = await res.json();
    const codes: string[] = data[1] || [];
    const displayPairs: string[][] = data[3] || [];

    return codes.map((code, i) => ({
      code,
      description: displayPairs[i]?.[1] || displayPairs[i]?.[0] || code,
    }));
  } catch {
    return [];
  }
}
