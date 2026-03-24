'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ClinicalBrief, SavedBrief } from '@/lib/types';
import {
  getSavedBriefs,
  saveBrief as save,
  unsaveBrief as unsave,
  unsaveByBriefId,
  updateLabel as updateLbl,
  refreshBrief as refresh,
  isSaved as checkSaved,
} from '@/lib/saved-briefs';

export function useSavedBriefs() {
  const [savedBriefs, setSavedBriefs] = useState<SavedBrief[]>([]);

  const reload = useCallback(() => {
    setSavedBriefs(getSavedBriefs());
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  // Cross-tab sync
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'clinicaliq_saved') reload();
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [reload]);

  const saveBrief = useCallback((brief: ClinicalBrief, label?: string) => {
    save(brief, label);
    reload();
  }, [reload]);

  const unsaveBrief = useCallback((id: string) => {
    unsave(id);
    reload();
  }, [reload]);

  const toggleSave = useCallback((brief: ClinicalBrief) => {
    if (checkSaved(brief.id)) {
      unsaveByBriefId(brief.id);
    } else {
      save(brief);
    }
    reload();
  }, [reload]);

  const updateLabel = useCallback((id: string, label: string) => {
    updateLbl(id, label);
    reload();
  }, [reload]);

  const refreshBrief = useCallback((id: string, newBrief: ClinicalBrief) => {
    refresh(id, newBrief);
    reload();
  }, [reload]);

  const isSaved = useCallback((briefId: string) => {
    return checkSaved(briefId);
  }, []);

  return { savedBriefs, saveBrief, unsaveBrief, toggleSave, updateLabel, refreshBrief, isSaved };
}
