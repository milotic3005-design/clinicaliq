// ClinicalIQ Dashboard -- Core Type Definitions

export type QueryType = 'drug_lookup' | 'disease_state' | 'drug_class' | 'icd10_code';

export type EvidenceTier = 1 | 2 | 3 | 4 | 5;

export interface SourcedField<T> {
  value: T;
  source_url: string;
  retrieved_at: string;
}

// -- FDA Label --

export interface FDALabelSummary {
  brand_name: string[];
  generic_name: string[];
  manufacturer: string;
  indications_and_usage: SourcedField<string>;
  dosage_and_administration: SourcedField<string>;
  boxed_warning: SourcedField<string> | null;
  contraindications: SourcedField<string> | null;
  warnings_and_precautions: SourcedField<string> | null;
  drug_interactions: SourcedField<string> | null;
  pregnancy: SourcedField<string> | null;
  nursing_mothers: SourcedField<string> | null;
  renal_impairment: SourcedField<string> | null;
  hepatic_impairment: SourcedField<string> | null;
  openfda_id: string;
}

// -- FAERS Adverse Events --

export interface FAERSReaction {
  meddra_pt: string;
  report_count: number;
  serious_count: number;
  fatal_count: number;
}

export interface FAERSSummary {
  drug_name_matched: string;
  match_strategy: 'exact_generic' | 'fuzzy_brand';
  reactions: FAERSReaction[];
  total_reports_queried: number;
  retrieved_at: string;
  source_url: string;
}

// -- Clinical Trials --

export type TrialStatus =
  | 'RECRUITING'
  | 'ACTIVE_NOT_RECRUITING'
  | 'COMPLETED'
  | 'TERMINATED'
  | 'WITHDRAWN';

export type TrialPhase = 'PHASE1' | 'PHASE2' | 'PHASE3' | 'PHASE4' | 'NA';

export interface ClinicalTrialSummary {
  nct_id: string;
  title: string;
  status: TrialStatus;
  phase: TrialPhase;
  enrollment_count: number | null;
  primary_completion_date: string | null;
  lead_sponsor: string;
  intervention_name: string[];
  primary_outcome: string;
  source_url: string;
  retrieved_at: string;
}

// -- PubMed Literature --

export interface PubMedResult {
  pmid: string;
  title: string;
  authors: string[];
  journal: string;
  pub_year: number;
  publication_types: string[];
  evidence_tier: EvidenceTier;
  abstract: string;
  doi: string | null;
  source_url: string;
  retrieved_at: string;
}

// -- MedlinePlus --

export interface MedlinePlusSummary {
  rxcui: string | null;
  drug_summary: SourcedField<string>;
  related_links: {
    label: string;
    url: string;
  }[];
  patient_summary: SourcedField<string> | null;
}

// -- ICD-10 --

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

// -- Guidelines --

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

// -- Root Schema --

export interface ClinicalBrief {
  id: string;
  query: string;
  query_type: QueryType;
  retrieved_at: string;
  fda_label: FDALabelSummary | null;
  adverse_events: FAERSSummary | null;
  trials: ClinicalTrialSummary[];
  literature: PubMedResult[];
  medlineplus: MedlinePlusSummary | null;
  icd10: ICD10Summary | null;
  guidelines: GuidelinesSummary | null;
  meta: {
    fetch_durations_ms: Record<string, number>;
    failed_sources: string[];
    cache_hit: boolean;
    cache_age_ms: number | null;
  };
}

// -- API Response Types --

export interface SearchResponse {
  brief: ClinicalBrief;
  cached: boolean;
  cache_age_ms: number | null;
}

export interface ClassifyResponse {
  query: string;
  query_type: QueryType;
  confidence: 'high' | 'medium' | 'low';
  alternatives?: QueryType[];
}

export interface SuggestResponse {
  suggestions: {
    label: string;
    query_type: QueryType;
    source: 'mesh' | 'openfda' | 'icd10';
  }[];
}

export interface RxCUIResponse {
  drug_name: string;
  rxcui: string;
  source_url: string;
}

export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  sources: Record<string, {
    reachable: boolean;
    latency_ms: number;
    last_success: string;
  }>;
  cache: {
    connected: boolean;
    type: 'memory' | 'redis' | 'isr' | 'none';
  };
  checked_at: string;
}

// -- Query History & Saved Briefs --

export interface QueryHistoryEntry {
  id: string;
  query: string;
  query_type: QueryType;
  searched_at: string;
  result_summary: {
    has_bbw: boolean;
    trial_count: number;
    pubmed_count: number;
  };
}

export interface SavedBrief {
  id: string;
  query: string;
  query_type: QueryType;
  saved_at: string;
  brief: ClinicalBrief;
  label?: string;
}
