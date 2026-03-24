'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ClinicalBrief, QueryHistoryEntry } from '@/lib/types';
import {
  getHistory,
  addHistoryEntry,
  removeHistoryEntry,
  clearHistory as clearAll,
} from '@/lib/history';

export function useHistory() {
  const [history, setHistory] = useState<QueryHistoryEntry[]>([]);

  // Load on mount
  useEffect(() => {
    setHistory(getHistory());
  }, []);

  // Cross-tab sync
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'clinicaliq_history') {
        setHistory(getHistory());
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const addEntry = useCallback((brief: ClinicalBrief) => {
    addHistoryEntry(brief);
    setHistory(getHistory());
  }, []);

  const removeEntry = useCallback((id: string) => {
    removeHistoryEntry(id);
    setHistory(getHistory());
  }, []);

  const clearHistory = useCallback(() => {
    clearAll();
    setHistory([]);
  }, []);

  return { history, addEntry, removeEntry, clearHistory };
}
