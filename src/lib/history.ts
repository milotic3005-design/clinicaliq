import { nanoid } from 'nanoid';
import type { ClinicalBrief, QueryHistoryEntry } from './types';

const STORAGE_KEY = 'clinicaliq_history';
const MAX_ENTRIES = 50;

export function getHistory(): QueryHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(entries: QueryHistoryEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function addHistoryEntry(brief: ClinicalBrief): QueryHistoryEntry {
  const entry: QueryHistoryEntry = {
    id: nanoid(8),
    query: brief.query,
    query_type: brief.query_type,
    searched_at: new Date().toISOString(),
    result_summary: {
      has_bbw: brief.fda_label?.boxed_warning !== null && brief.fda_label?.boxed_warning !== undefined,
      trial_count: brief.trials.length,
      pubmed_count: brief.literature.length,
    },
  };

  const history = getHistory();

  // Deduplicate: remove previous entry for same query
  const filtered = history.filter(
    (h) => h.query.toLowerCase().trim() !== brief.query.toLowerCase().trim()
  );

  // Prepend new entry, FIFO evict
  const updated = [entry, ...filtered].slice(0, MAX_ENTRIES);
  persist(updated);
  return entry;
}

export function removeHistoryEntry(id: string): void {
  const updated = getHistory().filter((e) => e.id !== id);
  persist(updated);
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
