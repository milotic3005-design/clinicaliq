import type { MedlinePlusSummary, SourcedField } from '../types';

const RXNAV_BASE = 'https://rxnav.nlm.nih.gov/REST';
const MEDLINEPLUS_BASE = 'https://connect.medlineplus.gov/application';

export async function resolveRxCUI(drugName: string): Promise<string | null> {
  const url = `${RXNAV_BASE}/rxcui.json?name=${encodeURIComponent(drugName)}&search=1`;
  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  const ids = data?.idGroup?.rxnormId;
  if (!ids || ids.length === 0) return null;
  return ids[0];
}

export async function fetchMedlinePlus(query: string): Promise<MedlinePlusSummary | null> {
  // First resolve to RxCUI
  const rxcui = await resolveRxCUI(query);

  // Try drug-based query if we have rxcui
  if (rxcui) {
    const url = `${MEDLINEPLUS_BASE}?mainSearchCriteria.v.cs=2.16.840.1.113883.6.88&mainSearchCriteria.v.c=${rxcui}&knowledgeResponseType=application/json&informationRecipient.languageCode.c=en`;

    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      return parseMedlinePlusResponse(data, rxcui);
    }
  }

  // Fallback: try keyword search
  const keywordUrl = `${MEDLINEPLUS_BASE}?mainSearchCriteria.v.dn=${encodeURIComponent(query)}&knowledgeResponseType=application/json&informationRecipient.languageCode.c=en`;

  const keywordRes = await fetch(keywordUrl);
  if (!keywordRes.ok) return null;

  const keywordData = await keywordRes.json();
  return parseMedlinePlusResponse(keywordData, rxcui);
}

interface MedlinePlusEntry {
  title?: { _value?: string };
  summary?: { _value?: string };
  link?: Array<{ href?: string; title?: string }>;
}

function parseMedlinePlusResponse(data: Record<string, unknown>, rxcui: string | null): MedlinePlusSummary | null {
  const feed = data?.feed as Record<string, unknown>;
  if (!feed) return null;

  const entries = (feed.entry as MedlinePlusEntry[]) || [];
  if (entries.length === 0) return null;

  const now = new Date().toISOString();
  const firstEntry = entries[0];
  const summaryText = firstEntry.summary?._value || '';
  const title = firstEntry.title?._value || '';

  const relatedLinks = entries.flatMap((entry) => {
    const links = entry.link || [];
    return links
      .filter((l) => l.href)
      .map((l) => ({
        label: l.title || title || 'MedlinePlus',
        url: l.href!,
      }));
  });

  // Remove duplicate links
  const seen = new Set<string>();
  const uniqueLinks = relatedLinks.filter(l => {
    if (seen.has(l.url)) return false;
    seen.add(l.url);
    return true;
  });

  const drugSummary: SourcedField<string> = {
    value: stripHTML(summaryText),
    source_url: uniqueLinks[0]?.url || 'https://medlineplus.gov',
    retrieved_at: now,
  };

  return {
    rxcui,
    drug_summary: drugSummary,
    related_links: uniqueLinks.slice(0, 5),
    patient_summary: null, // Would need separate patient-facing endpoint
  };
}

function stripHTML(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}
