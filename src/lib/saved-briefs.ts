import { nanoid } from 'nanoid';
import type { ClinicalBrief, SavedBrief } from './types';

const STORAGE_KEY = 'clinicaliq_saved';
const MAX_SAVED = 25;

export function getSavedBriefs(): SavedBrief[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(briefs: SavedBrief[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(briefs));
}

export function saveBrief(brief: ClinicalBrief, label?: string): SavedBrief {
  const saved: SavedBrief = {
    id: nanoid(8),
    query: brief.query,
    query_type: brief.query_type,
    saved_at: new Date().toISOString(),
    brief,
    label,
  };

  const existing = getSavedBriefs();

  // Don't duplicate same brief id
  const filtered = existing.filter((s) => s.brief.id !== brief.id);
  const updated = [saved, ...filtered].slice(0, MAX_SAVED);
  persist(updated);
  return saved;
}

export function unsaveBrief(id: string): void {
  const updated = getSavedBriefs().filter((s) => s.id !== id);
  persist(updated);
}

export function unsaveByBriefId(briefId: string): void {
  const updated = getSavedBriefs().filter((s) => s.brief.id !== briefId);
  persist(updated);
}

export function updateLabel(id: string, label: string): void {
  const briefs = getSavedBriefs();
  const idx = briefs.findIndex((s) => s.id === id);
  if (idx !== -1) {
    briefs[idx].label = label.slice(0, 60);
    persist(briefs);
  }
}

export function refreshBrief(id: string, newBrief: ClinicalBrief): void {
  const briefs = getSavedBriefs();
  const idx = briefs.findIndex((s) => s.id === id);
  if (idx !== -1) {
    briefs[idx].brief = newBrief;
    briefs[idx].saved_at = new Date().toISOString();
    persist(briefs);
  }
}

export function isSaved(briefId: string): boolean {
  return getSavedBriefs().some((s) => s.brief.id === briefId);
}
