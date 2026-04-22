// Treatment Guidelines — curated society links + PubMed Practice Guideline search

export interface GuidelineLink {
  title: string;
  organization: string;
  url: string;
  year?: number;
  type: 'society' | 'pubmed' | 'nice' | 'who';
}

export interface GuidelinesSummary {
  query: string;
  curated: GuidelineLink[];
  pubmed_guidelines: GuidelineLink[];
  search_links: { label: string; url: string }[];
  retrieved_at: string;
}

// ── Curated guideline database ──────────────────────────────────────────
// Maps lowercase keyword → guideline links from major medical societies.
// Each entry links directly to the relevant society's guideline page.

const CURATED_GUIDELINES: Record<string, GuidelineLink[]> = {
  'migraine': [
    { title: 'Acute Treatment of Migraine in Adults', organization: 'American Headache Society (AHS)', url: 'https://headachejournal.onlinelibrary.wiley.com/doi/10.1111/head.14019', year: 2021, type: 'society' },
    { title: 'Preventive Treatment of Migraine in Adults', organization: 'AAN / AHS', url: 'https://www.aan.com/Guidelines/home/GuidelineDetail/957', year: 2021, type: 'society' },
    { title: 'Migraine Management — NICE Guideline CG150', organization: 'NICE', url: 'https://www.nice.org.uk/guidance/cg150', year: 2021, type: 'nice' },
    { title: 'EHF Guideline on Migraine Treatment', organization: 'European Headache Federation', url: 'https://doi.org/10.1186/s10194-021-01369-y', year: 2022, type: 'society' },
  ],
  'headache': [
    { title: 'Acute Treatment of Migraine in Adults', organization: 'American Headache Society (AHS)', url: 'https://headachejournal.onlinelibrary.wiley.com/doi/10.1111/head.14019', year: 2021, type: 'society' },
    { title: 'Tension-type Headache — NICE CKS', organization: 'NICE', url: 'https://cks.nice.org.uk/topics/headache-tension-type/', year: 2023, type: 'nice' },
  ],
  'hypertension': [
    { title: 'ACC/AHA Guideline for High Blood Pressure in Adults', organization: 'ACC / AHA', url: 'https://www.ahajournals.org/doi/10.1161/HYP.0000000000000065', year: 2017, type: 'society' },
    { title: 'ESC/ESH Arterial Hypertension Guidelines', organization: 'ESC / ESH', url: 'https://doi.org/10.1093/eurheartj/ehy339', year: 2018, type: 'society' },
    { title: 'Hypertension in Adults — NICE NG136', organization: 'NICE', url: 'https://www.nice.org.uk/guidance/ng136', year: 2023, type: 'nice' },
    { title: 'ISH Global Hypertension Practice Guidelines', organization: 'ISH', url: 'https://doi.org/10.1097/HJH.0000000000002453', year: 2020, type: 'society' },
  ],
  'diabetes': [
    { title: 'Standards of Care in Diabetes', organization: 'American Diabetes Association (ADA)', url: 'https://diabetesjournals.org/care/issue/47/Supplement_1', year: 2024, type: 'society' },
    { title: 'Management of Hyperglycaemia in Type 2 Diabetes', organization: 'ADA / EASD', url: 'https://doi.org/10.1007/s00125-022-05787-2', year: 2022, type: 'society' },
    { title: 'Type 2 Diabetes in Adults — NICE NG28', organization: 'NICE', url: 'https://www.nice.org.uk/guidance/ng28', year: 2022, type: 'nice' },
    { title: 'WHO Package of Essential NCD Interventions — Diabetes', organization: 'WHO', url: 'https://www.who.int/publications/i/item/who-ucn-ncd-20.1', year: 2020, type: 'who' },
  ],
  'type 2 diabetes': [
    { title: 'Standards of Care in Diabetes', organization: 'ADA', url: 'https://diabetesjournals.org/care/issue/47/Supplement_1', year: 2024, type: 'society' },
    { title: 'ADA/EASD Consensus — Management of Hyperglycaemia in T2DM', organization: 'ADA / EASD', url: 'https://doi.org/10.1007/s00125-022-05787-2', year: 2022, type: 'society' },
  ],
  'type 1 diabetes': [
    { title: 'Standards of Care in Diabetes', organization: 'ADA', url: 'https://diabetesjournals.org/care/issue/47/Supplement_1', year: 2024, type: 'society' },
    { title: 'Type 1 Diabetes in Adults — NICE NG17', organization: 'NICE', url: 'https://www.nice.org.uk/guidance/ng17', year: 2022, type: 'nice' },
  ],
  'heart failure': [
    { title: 'AHA/ACC/HFSA Guideline for Heart Failure Management', organization: 'AHA / ACC / HFSA', url: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000001063', year: 2022, type: 'society' },
    { title: 'ESC Guidelines for Heart Failure', organization: 'ESC', url: 'https://doi.org/10.1093/eurheartj/ehab368', year: 2021, type: 'society' },
    { title: 'Chronic Heart Failure — NICE NG106', organization: 'NICE', url: 'https://www.nice.org.uk/guidance/ng106', year: 2023, type: 'nice' },
  ],
  'atrial fibrillation': [
    { title: 'ACC/AHA/ACCP/HRS Guideline for Atrial Fibrillation', organization: 'ACC / AHA', url: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000001193', year: 2023, type: 'society' },
    { title: 'ESC Guidelines for Atrial Fibrillation', organization: 'ESC', url: 'https://doi.org/10.1093/eurheartj/ehae176', year: 2024, type: 'society' },
    { title: 'Atrial Fibrillation — NICE NG196', organization: 'NICE', url: 'https://www.nice.org.uk/guidance/ng196', year: 2021, type: 'nice' },
  ],
  'afib': [
    { title: 'ACC/AHA/ACCP/HRS Guideline for Atrial Fibrillation', organization: 'ACC / AHA', url: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000001193', year: 2023, type: 'society' },
  ],
  'sepsis': [
    { title: 'Surviving Sepsis Campaign: International Guidelines 2021', organization: 'SCCM / ESICM', url: 'https://doi.org/10.1007/s00134-021-06506-y', year: 2021, type: 'society' },
    { title: 'IDSA Sepsis Guidance', organization: 'IDSA', url: 'https://www.idsociety.org/practice-guideline/sepsis/', year: 2023, type: 'society' },
    { title: 'Sepsis — NICE NG51', organization: 'NICE', url: 'https://www.nice.org.uk/guidance/ng51', year: 2017, type: 'nice' },
  ],
  'pneumonia': [
    { title: 'Community-Acquired Pneumonia in Adults (ATS/IDSA)', organization: 'ATS / IDSA', url: 'https://doi.org/10.1164/rccm.201908-1581ST', year: 2019, type: 'society' },
    { title: 'Hospital-Acquired/Ventilator-Associated Pneumonia (ATS/IDSA)', organization: 'ATS / IDSA', url: 'https://doi.org/10.1093/cid/ciw353', year: 2016, type: 'society' },
    { title: 'Pneumonia in Adults — NICE NG138', organization: 'NICE', url: 'https://www.nice.org.uk/guidance/ng138', year: 2019, type: 'nice' },
  ],
  'copd': [
    { title: 'GOLD Report — Global Strategy for COPD', organization: 'GOLD', url: 'https://goldcopd.org/2024-gold-report/', year: 2024, type: 'society' },
    { title: 'ATS/ERS COPD Guidelines', organization: 'ATS / ERS', url: 'https://www.thoracic.org/statements/copd.php', year: 2023, type: 'society' },
    { title: 'COPD — NICE NG115', organization: 'NICE', url: 'https://www.nice.org.uk/guidance/ng115', year: 2019, type: 'nice' },
  ],
  'asthma': [
    { title: 'GINA Global Strategy for Asthma Management', organization: 'GINA', url: 'https://ginasthma.org/gina-reports/', year: 2024, type: 'society' },
    { title: 'NAEPP Expert Panel Report 3 — Asthma', organization: 'NHLBI', url: 'https://www.nhlbi.nih.gov/health-topics/guidelines-for-diagnosis-management-of-asthma', year: 2020, type: 'society' },
    { title: 'Asthma — NICE NG80', organization: 'NICE', url: 'https://www.nice.org.uk/guidance/ng80', year: 2021, type: 'nice' },
  ],
  'uti': [
    { title: 'Uncomplicated UTI — IDSA/ESCMID', organization: 'IDSA / ESCMID', url: 'https://doi.org/10.1093/cid/ciq257', year: 2011, type: 'society' },
    { title: 'Catheter-Associated UTI — IDSA', organization: 'IDSA', url: 'https://doi.org/10.1093/cid/cir935', year: 2010, type: 'society' },
    { title: 'UTI in Adults — NICE NG109', organization: 'NICE', url: 'https://www.nice.org.uk/guidance/ng109', year: 2018, type: 'nice' },
  ],
  'mrsa': [
    { title: 'MRSA Infections Treatment — IDSA', organization: 'IDSA', url: 'https://doi.org/10.1093/cid/ciq146', year: 2011, type: 'society' },
    { title: 'IDSA Guidance on MRSA (updated)', organization: 'IDSA', url: 'https://www.idsociety.org/practice-guideline/mrsa/', year: 2023, type: 'society' },
  ],
  'vancomycin': [
    { title: 'Vancomycin Therapeutic Monitoring — ASHP/IDSA/SIDP (AUC-based)', organization: 'ASHP / IDSA / SIDP', url: 'https://doi.org/10.1093/ajhp/zxaa036', year: 2020, type: 'society' },
    { title: 'MRSA Infections Treatment — IDSA', organization: 'IDSA', url: 'https://doi.org/10.1093/cid/ciq146', year: 2011, type: 'society' },
  ],
  'anticoagulation': [
    { title: 'CHEST Guideline on Antithrombotic Therapy for VTE', organization: 'ACCP (CHEST)', url: 'https://doi.org/10.1016/j.chest.2021.07.056', year: 2021, type: 'society' },
    { title: 'ACC Expert Consensus on Anticoagulation', organization: 'ACC', url: 'https://doi.org/10.1016/j.jacc.2020.11.067', year: 2021, type: 'society' },
  ],
  'dvt': [
    { title: 'CHEST Guideline on VTE Treatment', organization: 'ACCP (CHEST)', url: 'https://doi.org/10.1016/j.chest.2021.07.056', year: 2021, type: 'society' },
    { title: 'VTE in Adults — NICE NG158', organization: 'NICE', url: 'https://www.nice.org.uk/guidance/ng158', year: 2020, type: 'nice' },
  ],
  'pulmonary embolism': [
    { title: 'ESC Guidelines for Pulmonary Embolism', organization: 'ESC / ERS', url: 'https://doi.org/10.1093/eurheartj/ehz405', year: 2019, type: 'society' },
    { title: 'CHEST Guideline on VTE Treatment', organization: 'ACCP (CHEST)', url: 'https://doi.org/10.1016/j.chest.2021.07.056', year: 2021, type: 'society' },
  ],
  'stroke': [
    { title: 'AHA/ASA Guideline for Acute Ischemic Stroke', organization: 'AHA / ASA', url: 'https://www.ahajournals.org/doi/10.1161/STR.0000000000000211', year: 2019, type: 'society' },
    { title: 'AHA/ASA Secondary Stroke Prevention', organization: 'AHA / ASA', url: 'https://doi.org/10.1161/STR.0000000000000375', year: 2021, type: 'society' },
    { title: 'Stroke — NICE NG128', organization: 'NICE', url: 'https://www.nice.org.uk/guidance/ng128', year: 2019, type: 'nice' },
  ],
  'depression': [
    { title: 'APA Practice Guideline for Major Depressive Disorder', organization: 'APA', url: 'https://psychiatryonline.org/doi/book/10.1176/appi.books.9780890424462', year: 2010, type: 'society' },
    { title: 'Depression in Adults — NICE NG222', organization: 'NICE', url: 'https://www.nice.org.uk/guidance/ng222', year: 2022, type: 'nice' },
    { title: 'CANMAT Guidelines for MDD', organization: 'CANMAT', url: 'https://doi.org/10.1177/0706743716659417', year: 2016, type: 'society' },
  ],
  'anxiety': [
    { title: 'CANMAT Clinical Guidelines for Anxiety Disorders', organization: 'CANMAT', url: 'https://doi.org/10.1177/0706743714548402', year: 2014, type: 'society' },
    { title: 'Generalized Anxiety Disorder — NICE CG113', organization: 'NICE', url: 'https://www.nice.org.uk/guidance/cg113', year: 2019, type: 'nice' },
    { title: 'APA Practice Guideline for Panic Disorder', organization: 'APA', url: 'https://psychiatryonline.org/doi/book/10.1176/appi.books.9780890423363', year: 2009, type: 'society' },
  ],
  'chronic kidney disease': [
    { title: 'KDIGO Clinical Practice Guideline for CKD', organization: 'KDIGO', url: 'https://kdigo.org/guidelines/ckd-evaluation-and-management/', year: 2024, type: 'society' },
    { title: 'CKD — NICE NG203', organization: 'NICE', url: 'https://www.nice.org.uk/guidance/ng203', year: 2021, type: 'nice' },
  ],
  'ckd': [
    { title: 'KDIGO Clinical Practice Guideline for CKD', organization: 'KDIGO', url: 'https://kdigo.org/guidelines/ckd-evaluation-and-management/', year: 2024, type: 'society' },
  ],
  'aki': [
    { title: 'KDIGO Clinical Practice Guideline for AKI', organization: 'KDIGO', url: 'https://kdigo.org/guidelines/acute-kidney-injury/', year: 2012, type: 'society' },
    { title: 'AKI — NICE NG148', organization: 'NICE', url: 'https://www.nice.org.uk/guidance/ng148', year: 2019, type: 'nice' },
  ],
  'pain': [
    { title: 'CDC Clinical Practice Guideline for Prescribing Opioids', organization: 'CDC', url: 'https://www.cdc.gov/mmwr/volumes/71/rr/rr7103a1.htm', year: 2022, type: 'society' },
    { title: 'APS Guideline on Acute Pain Management', organization: 'APS', url: 'https://doi.org/10.1016/j.jpain.2015.12.008', year: 2016, type: 'society' },
  ],
  'opioid': [
    { title: 'CDC Clinical Practice Guideline for Prescribing Opioids', organization: 'CDC', url: 'https://www.cdc.gov/mmwr/volumes/71/rr/rr7103a1.htm', year: 2022, type: 'society' },
  ],
  'c. diff': [
    { title: 'IDSA/SHEA C. difficile Infection Guidelines', organization: 'IDSA / SHEA', url: 'https://doi.org/10.1093/cid/cix1085', year: 2021, type: 'society' },
    { title: 'ACG Clinical Guideline — C. difficile Infection', organization: 'ACG', url: 'https://doi.org/10.14309/ajg.0000000000001278', year: 2021, type: 'society' },
  ],
  'clostridioides difficile': [
    { title: 'IDSA/SHEA C. difficile Infection Guidelines', organization: 'IDSA / SHEA', url: 'https://doi.org/10.1093/cid/cix1085', year: 2021, type: 'society' },
  ],
  'endocarditis': [
    { title: 'AHA/ACC Infective Endocarditis Guideline', organization: 'AHA / ACC', url: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000000296', year: 2015, type: 'society' },
    { title: 'ESC Guidelines on Endocarditis', organization: 'ESC', url: 'https://doi.org/10.1093/eurheartj/ehad193', year: 2023, type: 'society' },
  ],
  'osteomyelitis': [
    { title: 'IDSA Guideline for Diabetic Foot Infections', organization: 'IDSA', url: 'https://doi.org/10.1093/cid/cis346', year: 2012, type: 'society' },
  ],
  'skin and soft tissue infection': [
    { title: 'IDSA Guideline for SSTI', organization: 'IDSA', url: 'https://doi.org/10.1093/cid/ciu296', year: 2014, type: 'society' },
  ],
  'cellulitis': [
    { title: 'IDSA Guideline for SSTI', organization: 'IDSA', url: 'https://doi.org/10.1093/cid/ciu296', year: 2014, type: 'society' },
  ],
  'meningitis': [
    { title: 'IDSA Guideline for Bacterial Meningitis', organization: 'IDSA', url: 'https://doi.org/10.1093/cid/cix034', year: 2017, type: 'society' },
    { title: 'ESCMID Guideline on Bacterial Meningitis', organization: 'ESCMID', url: 'https://doi.org/10.1016/j.cmi.2016.01.007', year: 2016, type: 'society' },
  ],
  'gerd': [
    { title: 'ACG Clinical Guideline — GERD', organization: 'ACG', url: 'https://doi.org/10.14309/ajg.0000000000001538', year: 2022, type: 'society' },
    { title: 'GORD — NICE NG184', organization: 'NICE', url: 'https://www.nice.org.uk/guidance/ng184', year: 2020, type: 'nice' },
  ],
  'inflammatory bowel disease': [
    { title: 'ACG Clinical Guideline — Ulcerative Colitis', organization: 'ACG', url: 'https://doi.org/10.14309/ajg.0000000000001152', year: 2019, type: 'society' },
    { title: 'ACG Clinical Guideline — Crohn\'s Disease', organization: 'ACG', url: 'https://doi.org/10.14309/ajg.0000000000001058', year: 2018, type: 'society' },
  ],
  'crohn': [
    { title: 'ACG Clinical Guideline — Crohn\'s Disease', organization: 'ACG', url: 'https://doi.org/10.14309/ajg.0000000000001058', year: 2018, type: 'society' },
  ],
  'ulcerative colitis': [
    { title: 'ACG Clinical Guideline — Ulcerative Colitis', organization: 'ACG', url: 'https://doi.org/10.14309/ajg.0000000000001152', year: 2019, type: 'society' },
  ],
  'epilepsy': [
    { title: 'AAN/AES Guideline on Treatment of New-Onset Epilepsy', organization: 'AAN / AES', url: 'https://www.aan.com/Guidelines/home/GuidelineDetail/981', year: 2018, type: 'society' },
    { title: 'Epilepsies — NICE NG217', organization: 'NICE', url: 'https://www.nice.org.uk/guidance/ng217', year: 2022, type: 'nice' },
  ],
  'rheumatoid arthritis': [
    { title: 'ACR Guideline for RA Treatment', organization: 'ACR', url: 'https://doi.org/10.1002/art.41752', year: 2021, type: 'society' },
    { title: 'EULAR Recommendations for RA', organization: 'EULAR', url: 'https://doi.org/10.1136/ard-2022-223356', year: 2023, type: 'society' },
    { title: 'RA — NICE NG100', organization: 'NICE', url: 'https://www.nice.org.uk/guidance/ng100', year: 2018, type: 'nice' },
  ],
};

// ── PubMed Practice Guideline search ────────────────────────────────────

const PUBMED_SEARCH_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi';
const PUBMED_SUMMARY_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi';

async function fetchPubMedGuidelines(query: string, limit: number = 5): Promise<GuidelineLink[]> {
  try {
    // Search PubMed for Practice Guidelines
    const searchUrl = `${PUBMED_SEARCH_URL}?db=pubmed&term=${encodeURIComponent(query)}+AND+(Practice+Guideline[pt]+OR+Guideline[pt])&sort=date&retmax=${limit}&retmode=json`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) return [];

    const searchData = await searchRes.json();
    const ids: string[] = searchData?.esearchresult?.idlist || [];
    if (ids.length === 0) return [];

    // Fetch summaries for each PMID
    const summaryUrl = `${PUBMED_SUMMARY_URL}?db=pubmed&id=${ids.join(',')}&retmode=json`;
    const summaryRes = await fetch(summaryUrl);
    if (!summaryRes.ok) return [];

    const summaryData = await summaryRes.json();
    const results = summaryData?.result || {};

    const guidelineLinks: GuidelineLink[] = [];
    for (const id of ids) {
      const article = results[id];
      if (!article) continue;
      const year = parseInt(article.pubdate?.split(' ')[0] || '0', 10);
      guidelineLinks.push({
        title: article.title || 'Untitled',
        organization: article.source || 'PubMed',
        url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
        year: year > 2000 ? year : undefined,
        type: 'pubmed',
      });
    }
    return guidelineLinks;
  } catch {
    return [];
  }
}

// ── Main fetch function ─────────────────────────────────────────────────

export async function fetchGuidelines(query: string): Promise<GuidelinesSummary | null> {
  const lower = query.toLowerCase().trim();

  // Find curated guidelines by matching keywords
  const curated: GuidelineLink[] = [];
  for (const [keyword, links] of Object.entries(CURATED_GUIDELINES)) {
    if (lower.includes(keyword) || keyword.includes(lower)) {
      // Deduplicate by URL
      const existingUrls = new Set(curated.map(g => g.url));
      for (const link of links) {
        if (!existingUrls.has(link.url)) {
          curated.push(link);
          existingUrls.add(link.url);
        }
      }
    }
  }

  // Always fetch PubMed Practice Guidelines
  const pubmedGuidelines = await fetchPubMedGuidelines(query, 5);

  if (curated.length === 0 && pubmedGuidelines.length === 0) return null;

  // Always-available search links for the user to explore further
  const searchLinks = [
    { label: 'PubMed — Practice Guidelines', url: `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(query)}+AND+(Practice+Guideline%5Bpt%5D+OR+Guideline%5Bpt%5D)&sort=date` },
    { label: 'NICE Evidence Search', url: `https://www.evidence.nhs.uk/search?q=${encodeURIComponent(query)}&sp=on&ps=20` },
    { label: 'WHO Guidelines', url: `https://www.who.int/publications/search?query=${encodeURIComponent(query)}&publicationtypes=c828e6df-41e0-422d-bce9-1e0acb6e3437` },
    { label: 'Cochrane Library', url: `https://www.cochranelibrary.com/search?searchBy=6&searchText=${encodeURIComponent(query)}&isWordVariation=true` },
    { label: 'ECRI Guidelines Trust', url: `https://guidelines.ecri.org/search?query=${encodeURIComponent(query)}` },
  ];

  return {
    query,
    curated,
    pubmed_guidelines: pubmedGuidelines,
    search_links: searchLinks,
    retrieved_at: new Date().toISOString(),
  };
}
