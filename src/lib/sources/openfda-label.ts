import type { FDALabelSummary, SourcedField } from '../types';

const BASE_URL = 'https://api.fda.gov/drug/label.json';

function makeSourcedField(value: string | undefined, sourceUrl: string): SourcedField<string> | null {
  if (!value) return null;
  return {
    value,
    source_url: sourceUrl,
    retrieved_at: new Date().toISOString(),
  };
}

function extractText(arr: string[] | string | undefined): string | undefined {
  if (!arr) return undefined;
  if (Array.isArray(arr)) return arr.join('\n');
  return arr;
}

function extractRenalHepatic(
  warningsText: string | undefined,
  field: 'renal' | 'hepatic'
): string | undefined {
  if (!warningsText) return undefined;
  const keywords = field === 'renal'
    ? ['renal impairment', 'renal insufficiency', 'kidney', 'creatinine clearance', 'clcr', 'gfr', 'dialysis']
    : ['hepatic impairment', 'hepatic insufficiency', 'liver', 'child-pugh', 'ast', 'alt', 'cirrhosis'];

  const lower = warningsText.toLowerCase();
  for (const kw of keywords) {
    const idx = lower.indexOf(kw);
    if (idx !== -1) {
      // Extract surrounding sentence(s)
      const start = Math.max(0, warningsText.lastIndexOf('.', idx) + 1);
      const end = warningsText.indexOf('.', idx + kw.length);
      return warningsText.slice(start, end !== -1 ? end + 1 : undefined).trim();
    }
  }
  return undefined;
}

export async function fetchFDALabel(query: string): Promise<FDALabelSummary | null> {
  const searchParam = encodeURIComponent(`"${query}"`);
  const url = `${BASE_URL}?search=openfda.generic_name:${searchParam}+openfda.brand_name:${searchParam}&limit=1`;

  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`OpenFDA label: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const results = data?.results;
  if (!results || results.length === 0) return null;

  const label = results[0];
  const openfda = label.openfda || {};
  const docId = label.id || label.set_id || 'unknown';
  const sourceUrl = `https://api.fda.gov/drug/label.json?search=set_id:${docId}`;

  const warningsText = extractText(label.warnings_and_precautions) || extractText(label.warnings);

  return {
    brand_name: openfda.brand_name || [],
    generic_name: openfda.generic_name || [],
    manufacturer: openfda.manufacturer_name?.[0] || 'Unknown',
    indications_and_usage: makeSourcedField(extractText(label.indications_and_usage), sourceUrl)!,
    dosage_and_administration: makeSourcedField(extractText(label.dosage_and_administration), sourceUrl)!,
    boxed_warning: makeSourcedField(extractText(label.boxed_warning), sourceUrl),
    contraindications: makeSourcedField(extractText(label.contraindications), sourceUrl),
    warnings_and_precautions: makeSourcedField(warningsText, sourceUrl),
    drug_interactions: makeSourcedField(extractText(label.drug_interactions), sourceUrl),
    pregnancy: makeSourcedField(extractText(label.pregnancy) || extractText(label.pregnancy_or_breast_feeding), sourceUrl),
    nursing_mothers: makeSourcedField(extractText(label.nursing_mothers), sourceUrl),
    renal_impairment: makeSourcedField(extractRenalHepatic(warningsText, 'renal'), sourceUrl),
    hepatic_impairment: makeSourcedField(extractRenalHepatic(warningsText, 'hepatic'), sourceUrl),
    openfda_id: docId,
  };
}
