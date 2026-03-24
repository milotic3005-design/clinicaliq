// RxNorm Drug-Drug Interaction API (NLM — free, no auth required)

const RXNORM_BASE = 'https://rxnav.nlm.nih.gov/REST';

export interface RxDrug {
  rxcui: string;
  name: string;
}

export interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: 'high' | 'moderate' | 'low' | 'N/A';
  description: string;
  source: string;
}

/**
 * Resolve a drug name to its RxCUI (RxNorm Concept Unique Identifier)
 */
export async function resolveRxCUI(drugName: string): Promise<RxDrug | null> {
  try {
    // Try exact match first
    const exactUrl = `${RXNORM_BASE}/rxcui.json?name=${encodeURIComponent(drugName)}&search=2`;
    const exactRes = await fetch(exactUrl, { signal: AbortSignal.timeout(8000) });
    if (exactRes.ok) {
      const data = await exactRes.json();
      const rxcui = data?.idGroup?.rxnormId?.[0];
      if (rxcui) return { rxcui, name: data.idGroup.name || drugName };
    }

    // Fall back to approximate match
    const approxUrl = `${RXNORM_BASE}/approximateTerm.json?term=${encodeURIComponent(drugName)}&maxEntries=1`;
    const approxRes = await fetch(approxUrl, { signal: AbortSignal.timeout(8000) });
    if (approxRes.ok) {
      const data = await approxRes.json();
      const candidate = data?.approximateGroup?.candidate?.[0];
      if (candidate?.rxcui) return { rxcui: candidate.rxcui, name: candidate.name || drugName };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Autocomplete drug name suggestions using RxNorm approximate-term endpoint.
 * approximateTerm supports prefix matching ("vanco" → "Vancomycin"),
 * unlike spellingsuggestions which only corrects complete misspellings.
 */
export async function suggestDrugNames(term: string): Promise<string[]> {
  try {
    const url = `${RXNORM_BASE}/approximateTerm.json?term=${encodeURIComponent(term)}&maxEntries=8&option=0`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];
    const data = await res.json();
    const candidates = data?.approximateGroup?.candidate || [];
    const seen = new Set<string>();
    const results: string[] = [];
    for (const c of candidates) {
      const name = c.name as string;
      if (name && !seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        results.push(name);
      }
    }
    return results.slice(0, 8);
  } catch {
    return [];
  }
}

/**
 * Check interactions between a list of RxCUIs
 */
export async function checkInteractions(rxcuis: string[]): Promise<DrugInteraction[]> {
  if (rxcuis.length < 2) return [];

  try {
    const url = `${RXNORM_BASE}/interaction/list.json?rxcuis=${rxcuis.join('+')}`;
    const res = await fetch(url);
    if (!res.ok) return [];

    const data = await res.json();
    const interactions: DrugInteraction[] = [];
    const seen = new Set<string>();

    const fullInteractions = data?.fullInteractionTypeGroup || [];
    for (const group of fullInteractions) {
      const source = group.sourceName || 'Unknown';
      for (const interaction of group.fullInteractionType || []) {
        for (const pair of interaction.interactionPair || []) {
          const concepts = pair.interactionConcept || [];
          if (concepts.length < 2) continue;

          const drug1 = concepts[0]?.minConceptItem?.name || 'Unknown';
          const drug2 = concepts[1]?.minConceptItem?.name || 'Unknown';
          const key = [drug1, drug2].sort().join('|');

          if (seen.has(key)) continue;
          seen.add(key);

          const desc = pair.description || 'No description available';
          const severity = parseSeverity(pair.severity || desc);

          interactions.push({ drug1, drug2, severity, description: desc, source });
        }
      }
    }

    return interactions;
  } catch {
    return [];
  }
}

function parseSeverity(text: string): DrugInteraction['severity'] {
  const lower = text.toLowerCase();
  if (lower.includes('high') || lower.includes('serious') || lower.includes('major') || lower.includes('contraindicated')) return 'high';
  if (lower.includes('moderate') || lower.includes('significant')) return 'moderate';
  if (lower.includes('low') || lower.includes('minor') || lower.includes('mild')) return 'low';
  return 'N/A';
}
