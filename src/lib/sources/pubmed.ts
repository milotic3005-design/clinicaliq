import type { PubMedResult, EvidenceTier, QueryType } from '../types';

const EUTILS_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

function buildSearchQuery(query: string, queryType: QueryType): string {
  if (queryType === 'drug_lookup' || queryType === 'drug_class') {
    return `${query}[MeSH Terms] AND (Clinical Trial[pt] OR Meta-Analysis[pt] OR Systematic Review[pt])`;
  }
  return `${query}[MeSH Major Topic] AND (Guideline[pt] OR Practice Guideline[pt] OR Clinical Trial[pt])`;
}

function getEvidenceTier(pubTypes: string[]): EvidenceTier {
  const types = pubTypes.map(t => t.toLowerCase());
  if (types.some(t => t.includes('meta-analysis') || t.includes('systematic review'))) return 1;
  if (types.some(t => t.includes('randomized controlled trial'))) return 2;
  if (types.some(t => t.includes('observational') || t.includes('cohort'))) return 3;
  if (types.some(t => t.includes('case report'))) return 4;
  if (types.some(t => t.includes('editorial') || t.includes('comment') || t.includes('review'))) return 5;
  // Default to tier 2 for clinical trials, tier 3 otherwise
  if (types.some(t => t.includes('clinical trial'))) return 2;
  return 3;
}

interface ESearchResult {
  esearchresult?: {
    idlist?: string[];
    count?: string;
  };
}

export async function fetchPubMed(
  query: string,
  queryType: QueryType,
  retmax: number = 15
): Promise<PubMedResult[]> {
  // Step 1: esearch to get PMIDs
  const searchQuery = buildSearchQuery(query, queryType);
  const searchUrl = `${EUTILS_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(searchQuery)}&retmax=${retmax}&datetype=pdat&reldate=1825&retmode=json&sort=relevance`;

  const searchRes = await fetch(searchUrl);
  if (!searchRes.ok) throw new Error(`PubMed esearch: ${searchRes.status}`);

  const searchData: ESearchResult = await searchRes.json();
  const pmids = searchData?.esearchresult?.idlist;
  if (!pmids || pmids.length === 0) return [];

  // Step 2: efetch to get article details
  const fetchUrl = `${EUTILS_BASE}/efetch.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=xml`;
  const fetchRes = await fetch(fetchUrl);
  if (!fetchRes.ok) throw new Error(`PubMed efetch: ${fetchRes.status}`);

  const xmlText = await fetchRes.text();
  return parsePubMedXML(xmlText);
}

function parsePubMedXML(xml: string): PubMedResult[] {
  const results: PubMedResult[] = [];
  const now = new Date().toISOString();

  // Simple regex-based XML parsing (works for PubMed's well-structured XML)
  const articleRegex = /<PubmedArticle>([\s\S]*?)<\/PubmedArticle>/g;
  let match;

  while ((match = articleRegex.exec(xml)) !== null) {
    const article = match[1];

    const pmid = extractTag(article, 'PMID') || '';
    const title = extractTag(article, 'ArticleTitle') || '';
    const journalTitle = extractTag(article, 'Title') || extractTag(article, 'ISOAbbreviation') || '';
    const abstractText = extractTag(article, 'AbstractText') || '';

    // Year
    const yearMatch = article.match(/<PubDate>[\s\S]*?<Year>(\d{4})<\/Year>/);
    const medlineDateMatch = article.match(/<PubDate>[\s\S]*?<MedlineDate>(\d{4})/);
    const pubYear = parseInt(yearMatch?.[1] || medlineDateMatch?.[1] || '0', 10);

    // Authors
    const authors: string[] = [];
    const authorRegex = /<Author[\s\S]*?<LastName>(.*?)<\/LastName>[\s\S]*?<ForeName>(.*?)<\/ForeName>/g;
    let authorMatch;
    while ((authorMatch = authorRegex.exec(article)) !== null) {
      authors.push(`${authorMatch[2]} ${authorMatch[1]}`);
    }

    // Publication types
    const pubTypes: string[] = [];
    const ptRegex = /<PublicationType>(.*?)<\/PublicationType>/g;
    let ptMatch;
    while ((ptMatch = ptRegex.exec(article)) !== null) {
      pubTypes.push(ptMatch[1]);
    }

    // DOI
    const doiMatch = article.match(/<ArticleId IdType="doi">(.*?)<\/ArticleId>/);
    const doi = doiMatch?.[1] || null;

    results.push({
      pmid,
      title: cleanXML(title),
      authors,
      journal: cleanXML(journalTitle),
      pub_year: pubYear,
      publication_types: pubTypes,
      evidence_tier: getEvidenceTier(pubTypes),
      abstract: cleanXML(abstractText),
      doi,
      source_url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}`,
      retrieved_at: now,
    });
  }

  return results;
}

function extractTag(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*>(.*?)<\/${tag}>`, 's');
  const match = xml.match(regex);
  return match ? match[1] : null;
}

function cleanXML(text: string): string {
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .trim();
}
