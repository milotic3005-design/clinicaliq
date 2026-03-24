// LactMed (NLM) — Drug safety during breastfeeding
// Free via NCBI eUtils — same API as PubMed

const EUTILS_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

export interface LactMedSummary {
  title: string;
  summary: string;
  url: string;
  retrieved_at: string;
}

/**
 * Fetch LactMed summary for a drug name.
 * LactMed is a database within NCBI Bookshelf (book ID: lactmed).
 */
export async function fetchLactMed(drugName: string): Promise<LactMedSummary | null> {
  try {
    // Search LactMed bookshelf
    const searchUrl = `${EUTILS_BASE}/esearch.fcgi?db=books&term=${encodeURIComponent(drugName)}+AND+lactmed[book]&retmode=json&retmax=1`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) return null;

    const searchData = await searchRes.json();
    const ids: string[] = searchData?.esearchresult?.idlist || [];
    if (ids.length === 0) return null;

    // Fetch summary
    const summaryUrl = `${EUTILS_BASE}/esummary.fcgi?db=books&id=${ids[0]}&retmode=json`;
    const summaryRes = await fetch(summaryUrl);
    if (!summaryRes.ok) return null;

    const summaryData = await summaryRes.json();
    const result = summaryData?.result?.[ids[0]];
    if (!result) return null;

    const title = result.title || drugName;
    // The BookShelf API returns a chapter summary in the "excerpt" or we construct one
    const excerpt = result.excerpt || result.description || '';

    return {
      title,
      summary: excerpt || `LactMed entry available for "${drugName}". Click the link below for the full NIH monograph on breastfeeding safety.`,
      url: `https://www.ncbi.nlm.nih.gov/books/${ids[0]}/`,
      retrieved_at: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
