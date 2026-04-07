import { NextRequest, NextResponse } from 'next/server';

// Google Knowledge Graph API — requires only GOOGLE_API_KEY, no CSE ID
const GOOGLE_KEY = process.env.GOOGLE_CSE_KEY; // reuses same env var — just the API key

export interface DrugSearchResult {
  title: string;
  snippet: string;
  url: string;
  source: 'google' | 'dailymed' | 'openfda';
  setId?: string;
}

interface KgEntity {
  result: {
    name?: string;
    description?: string;
    detailedDescription?: {
      articleBody?: string;
      url?: string;
    };
    url?: string;
    '@type'?: string[];
  };
  resultScore?: number;
}

export async function GET(req: NextRequest) {
  const drug = req.nextUrl.searchParams.get('q')?.trim().slice(0, 120);
  if (!drug || drug.length < 2) {
    return NextResponse.json({ error: 'Drug name required (min 2 chars).' }, { status: 400 });
  }

  const results: DrugSearchResult[] = [];

  // ── Google Knowledge Graph API (API key only — no CSE ID required) ──
  if (GOOGLE_KEY) {
    try {
      const kgUrl = new URL('https://kgsearch.googleapis.com/v1/entities:search');
      kgUrl.searchParams.set('query', drug);
      kgUrl.searchParams.set('key', GOOGLE_KEY);
      kgUrl.searchParams.set('limit', '5');
      kgUrl.searchParams.set('indent', 'true');
      // Cast a wide net — Drug, Chemical, Medical therapy
      kgUrl.searchParams.append('types', 'Drug');
      kgUrl.searchParams.append('types', 'ChemicalSubstance');
      kgUrl.searchParams.append('types', 'MedicalTherapy');
      kgUrl.searchParams.append('types', 'MedicalCode');
      kgUrl.searchParams.append('types', 'Thing');

      const resp = await fetch(kgUrl.toString(), { signal: AbortSignal.timeout(8000) });
      if (resp.ok) {
        const data = await resp.json() as { itemListElement?: KgEntity[] };
        for (const item of (data.itemListElement ?? [])) {
          const entity = item.result;
          if (!entity?.name) continue;

          const name = entity.name;
          const typeLabel = entity['@type']?.find(t => t !== 'Thing') ?? 'Drug';
          const description = entity.description ?? typeLabel;
          const body = entity.detailedDescription?.articleBody?.slice(0, 400) ?? '';
          const wikiUrl = entity.detailedDescription?.url ?? entity.url ?? '';
          const snippet = body
            ? `${body}${body.length >= 400 ? '…' : ''}`
            : description;

          results.push({
            title: `${name} — ${description}`,
            snippet,
            url: wikiUrl || `https://en.wikipedia.org/wiki/${encodeURIComponent(name.replace(/ /g, '_'))}`,
            source: 'google',
          });
        }
      }
    } catch {
      // Knowledge Graph unavailable — fall through to free sources
    }
  }

  // ── DailyMed (always included — official FDA package inserts) ────
  try {
    const dmUrl = `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls.json?drug_name=${encodeURIComponent(drug)}&pagesize=6`;
    const dmResp = await fetch(dmUrl, { signal: AbortSignal.timeout(8000) });
    if (dmResp.ok) {
      const dmData = await dmResp.json() as { data?: { setId: string; title: string; published: string }[] };
      for (const item of (dmData.data ?? [])) {
        results.push({
          title: item.title,
          snippet: `Official FDA-approved package insert · Published: ${item.published?.slice(0, 10) ?? 'N/A'} · Source: DailyMed (National Library of Medicine)`,
          url: `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${item.setId}`,
          source: 'dailymed',
          setId: item.setId,
        });
      }
    }
  } catch {
    // DailyMed unavailable
  }

  // ── OpenFDA label (always attempted as additional context) ────────
  try {
    const fdaUrl = `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${encodeURIComponent(drug)}"&limit=3`;
    const fdaResp = await fetch(fdaUrl, { signal: AbortSignal.timeout(8000) });
    if (fdaResp.ok) {
      const fdaData = await fdaResp.json() as {
        results?: {
          openfda?: { brand_name?: string[]; generic_name?: string[]; manufacturer_name?: string[] };
          indications_and_usage?: string[];
          description?: string[];
        }[]
      };
      for (const label of (fdaData.results ?? [])) {
        const name = label.openfda?.brand_name?.[0] ?? label.openfda?.generic_name?.[0] ?? drug;
        const mfr = label.openfda?.manufacturer_name?.[0];
        const raw = label.indications_and_usage?.[0] ?? label.description?.[0] ?? '';
        const snippet = raw.slice(0, 380) + (raw.length > 380 ? '…' : '');
        results.push({
          title: `${name} — FDA Label${mfr ? ` (${mfr})` : ''}`,
          snippet: snippet || 'FDA label data available.',
          url: `https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=${encodeURIComponent(drug)}`,
          source: 'openfda',
        });
      }
    }
  } catch {
    // OpenFDA unavailable
  }

  return NextResponse.json({
    drug,
    results,
    googleEnabled: !!GOOGLE_KEY,
  });
}
