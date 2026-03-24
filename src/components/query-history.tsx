'use client';

import { useState } from 'react';
import { useHistory } from '@/hooks/use-history';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, X, Trash2, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const TYPE_COLORS: Record<string, string> = {
  drug_lookup: 'bg-blue-50 text-blue-700',
  disease_state: 'bg-emerald-50 text-emerald-700',
  drug_class: 'bg-violet-50 text-violet-700',
  icd10_code: 'bg-amber-50 text-amber-700',
};

interface QueryHistoryProps {
  visible: boolean;
}

export function QueryHistory({ visible }: QueryHistoryProps) {
  const { history, removeEntry, clearHistory } = useHistory();
  const [expanded, setExpanded] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  if (!visible || history.length === 0) return null;

  const displayEntries = expanded ? history : history.slice(0, 10);

  return (
    <div className="w-full bg-white rounded-xl border border-border/50 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30 bg-gray-50/50">
        <div className="flex items-center gap-2 text-sm font-medium text-[#1C1C1E]">
          <Clock className="w-4 h-4 text-muted-foreground" />
          Recent Searches
          <span className="text-xs text-muted-foreground">({history.length})</span>
        </div>
        <div className="flex items-center gap-1">
          {confirmClear ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Clear all?</span>
              <button
                onClick={() => { clearHistory(); setConfirmClear(false); }}
                className="text-[#FF3B30] font-medium hover:underline"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="text-muted-foreground hover:underline"
              >
                No
              </button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmClear(true)}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-[#FF3B30]"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Entries */}
      <div className="divide-y divide-border/20">
        {displayEntries.map((entry) => (
          <a
            key={entry.id}
            href={`/search?q=${encodeURIComponent(entry.query)}`}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50/80 transition-colors group"
          >
            <span className="text-sm font-medium text-[#1C1C1E] truncate flex-1">
              {entry.query}
            </span>

            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[entry.query_type] || 'bg-gray-100 text-gray-600'}`}>
              {entry.query_type.replace('_', ' ')}
            </span>

            {entry.result_summary.has_bbw && (
              <AlertTriangle className="w-3.5 h-3.5 text-[#FF3B30] shrink-0" />
            )}

            <span className="text-[11px] text-muted-foreground shrink-0 w-14 text-right">
              {relativeTime(entry.searched_at)}
            </span>

            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeEntry(entry.id); }}
              className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-200 rounded transition-opacity"
              aria-label="Remove from history"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </a>
        ))}
      </div>

      {/* View all / collapse toggle */}
      {history.length > 10 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1 py-2 text-xs text-[#007AFF] font-medium hover:bg-gray-50/80 transition-colors border-t border-border/20"
        >
          {expanded ? (
            <>Show less <ChevronUp className="w-3.5 h-3.5" /></>
          ) : (
            <>View all ({history.length}) <ChevronDown className="w-3.5 h-3.5" /></>
          )}
        </button>
      )}
    </div>
  );
}
