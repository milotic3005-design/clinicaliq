// Query type classifier — regex-first for ICD-10, then heuristics

import type { QueryType, ClassifyResponse } from './types';

const ICD10_REGEX = /^[A-Z]\d{2}(\.\d{1,4})?$/;
// Matches suggestions like "E11.65 - Type 2 diabetes..."
const ICD10_WITH_DESC_REGEX = /^([A-Z]\d{2}(\.\d{1,4})?)\s*-/i;

// Common drug class keywords
const DRUG_CLASS_KEYWORDS = [
  'inhibitor', 'blocker', 'agonist', 'antagonist', 'antibiotic', 'antifungal',
  'antiviral', 'antihypertensive', 'anticoagulant', 'antiplatelet', 'statin',
  'ssri', 'snri', 'nsaid', 'ace inhibitor', 'arb', 'beta-blocker', 'beta blocker',
  'calcium channel blocker', 'diuretic', 'benzodiazepine', 'opioid', 'fluoroquinolone',
  'cephalosporin', 'penicillin', 'macrolide', 'tetracycline', 'aminoglycoside',
  'carbapenem', 'sulfonamide', 'thiazolidinedione', 'sulfonylurea', 'biguanide',
  'glp-1', 'sglt2', 'dpp-4', 'ppi', 'h2 blocker', 'proton pump inhibitor',
];

// Common disease state keywords/patterns
const DISEASE_KEYWORDS = [
  'disease', 'syndrome', 'disorder', 'infection', 'cancer', 'carcinoma',
  'failure', 'insufficiency', 'sepsis', 'pneumonia', 'diabetes', 'hypertension',
  'asthma', 'copd', 'stroke', 'infarction', 'fibrillation', 'embolism',
  'thrombosis', 'anemia', 'leukemia', 'lymphoma', 'melanoma', 'hepatitis',
  'cirrhosis', 'pancreatitis', 'colitis', 'arthritis', 'lupus', 'psoriasis',
  'eczema', 'epilepsy', 'migraine', 'depression', 'anxiety', 'schizophrenia',
  'bipolar', 'alzheimer', 'parkinson', 'mrsa', 'uti', 'covid', 'influenza',
  'hiv', 'aids', 'tuberculosis', 'malaria', 'meningitis', 'endocarditis',
  'osteomyelitis', 'cellulitis', 'abscess', 'bacteremia', 'fungemia',
];

export function classifyQuery(query: string): ClassifyResponse {
  const trimmed = query.trim();
  const lower = trimmed.toLowerCase();

  // 1. ICD-10 code check (highest confidence)
  // Also match "E11.65 - Type 2 diabetes..." from suggestion dropdown
  const icd10Match = trimmed.toUpperCase().match(ICD10_WITH_DESC_REGEX);
  if (ICD10_REGEX.test(trimmed.toUpperCase()) || icd10Match) {
    return {
      query: icd10Match ? icd10Match[1] : trimmed,
      query_type: 'icd10_code',
      confidence: 'high',
    };
  }

  // 2. Drug class check
  const isDrugClass = DRUG_CLASS_KEYWORDS.some(kw => lower.includes(kw));
  if (isDrugClass) {
    return {
      query: trimmed,
      query_type: 'drug_class',
      confidence: 'medium',
      alternatives: ['drug_lookup', 'disease_state'],
    };
  }

  // 3. Disease state check
  const isDisease = DISEASE_KEYWORDS.some(kw => lower.includes(kw));
  if (isDisease) {
    return {
      query: trimmed,
      query_type: 'disease_state',
      confidence: 'high',
    };
  }

  // 4. Default: assume drug lookup (most common clinical search)
  // Single words or short phrases without disease markers are likely drug names
  return {
    query: trimmed,
    query_type: 'drug_lookup',
    confidence: 'medium',
    alternatives: ['disease_state'],
  };
}
