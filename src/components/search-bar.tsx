'use client';

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';
import { Input } from '@/components/ui/input';
import { Search, Loader2, Pill, Activity, Hash } from 'lucide-react';

interface Suggestion {
  label: string;
  query_type: string;
  source: string;
}

interface SearchBarProps {
  initialQuery?: string;
  autoFocus?: boolean;
  compact?: boolean;
}

const SOURCE_META: Record<string, { badge: string; badgeColor: string; icon: React.ReactNode }> = {
  openfda: {
    badge: 'Drug',
    badgeColor: 'bg-blue-50 text-blue-700 border border-blue-100',
    icon: <Pill className="w-3.5 h-3.5" />,
  },
  mesh: {
    badge: 'Condition',
    badgeColor: 'bg-green-50 text-green-700 border border-green-100',
    icon: <Activity className="w-3.5 h-3.5" />,
  },
  icd10: {
    badge: 'ICD-10',
    badgeColor: 'bg-purple-50 text-purple-700 border border-purple-100',
    icon: <Hash className="w-3.5 h-3.5" />,
  },
};

/** Bolds the part of `label` that starts with `query` (case-insensitive prefix match) */
const HighlightMatch = memo(function HighlightMatch({ label, query }: { label: string; query: string }) {
  if (!query) return <span>{label}</span>;
  const idx = label.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <span>{label}</span>;
  return (
    <span>
      {label.slice(0, idx)}
      <span className="font-bold text-[#1C1C1E]">{label.slice(idx, idx + query.length)}</span>
      {label.slice(idx + query.length)}
    </span>
  );
});

export function SearchBar({ initialQuery = '', autoFocus = false, compact = false }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cacheRef = useRef<Record<string, Suggestion[]>>({});
  const debouncedQuery = useDebounce(query, 220); // faster for perceived snappiness

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoading(false);
      return;
    }

    const cached = cacheRef.current[debouncedQuery];
    if (cached) {
      setSuggestions(cached);
      setShowSuggestions(true);
      setSelectedIndex(-1);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const controller = new AbortController();

    // ⚡ Bolt: Cache search suggestion requests to prevent duplicate network calls on backspace/re-type
    fetch(`/api/v1/suggest?q=${encodeURIComponent(debouncedQuery)}&limit=8`, {
      signal: controller.signal,
    })
      .then(res => res.json())
      .then(data => {
        const results = data.suggestions || [];
        cacheRef.current[debouncedQuery] = results;
        setSuggestions(results);
        setShowSuggestions(true);
        setSelectedIndex(-1);
        setIsLoading(false);
      })
      .catch((e) => {
        if (e.name !== 'AbortError') {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const executeSearch = useCallback((searchQuery: string) => {
    if (searchQuery.trim().length < 2) return;
    setShowSuggestions(false);
    setSuggestions([]);
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  }, [router]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        executeSearch(query);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Tab':
        // Tab-to-complete: fill in the top suggestion
        if (suggestions.length > 0) {
          e.preventDefault();
          const top = suggestions[selectedIndex >= 0 ? selectedIndex : 0];
          setQuery(top.label);
          setShowSuggestions(false);
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          const selected = suggestions[selectedIndex];
          setQuery(selected.label);
          executeSearch(selected.label);
        } else {
          executeSearch(query);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  }

  return (
    <div ref={containerRef} className={`relative w-full ${compact ? 'max-w-2xl' : 'max-w-3xl'}`}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            if (e.target.value.length >= 2) setIsLoading(true);
            else { setIsLoading(false); setShowSuggestions(false); }
          }}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search drug name, disease, or ICD-10 code..."
          autoFocus={autoFocus}
          className={`pl-12 pr-12 ${compact ? 'h-12 text-base' : 'h-14 text-lg'} rounded-xl border-border/50 bg-white shadow-sm focus-visible:ring-[#007AFF] focus-visible:ring-offset-0 focus-visible:border-[#007AFF]`}
          aria-label="Clinical search"
          aria-autocomplete="list"
          aria-controls="suggestion-list"
          aria-activedescendant={selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined}
          role="combobox"
          aria-expanded={showSuggestions}
          autoComplete="off"
          spellCheck={false}
        />
        {isLoading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <ul
          id="suggestion-list"
          role="listbox"
          className="absolute z-50 w-full mt-1.5 bg-white border border-border/50 rounded-xl shadow-xl overflow-hidden"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)' }}
        >
          {/* Hint row */}
          <li className="px-4 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium border-b border-gray-100 select-none">
            Suggestions
          </li>

          {suggestions.map((s, i) => {
            const meta = SOURCE_META[s.source] || SOURCE_META.mesh;
            const isSelected = i === selectedIndex;
            return (
              <li
                key={`${s.label}-${s.source}-${i}`}
                id={`suggestion-${i}`}
                role="option"
                aria-selected={isSelected}
                className={`px-4 py-2.5 cursor-pointer flex items-center gap-3 text-sm transition-colors ${
                  isSelected
                    ? 'bg-[#007AFF]/5 text-[#1C1C1E]'
                    : 'text-[#3C3C3E] hover:bg-gray-50'
                }`}
                onMouseEnter={() => setSelectedIndex(i)}
                onMouseDown={e => e.preventDefault()} // prevent blur before click
                onClick={() => {
                  setQuery(s.label);
                  executeSearch(s.label);
                }}
              >
                {/* Source icon */}
                <span className={`shrink-0 ${
                  s.source === 'openfda' ? 'text-blue-500' :
                  s.source === 'icd10' ? 'text-purple-500' : 'text-green-600'
                }`}>
                  {meta.icon}
                </span>

                {/* Label with match highlight */}
                <span className="flex-1 text-[#1C1C1E] font-medium truncate">
                  <HighlightMatch label={s.label} query={query} />
                </span>

                {/* Type badge */}
                <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.badgeColor}`}>
                  {meta.badge}
                </span>
              </li>
            );
          })}

          {/* Keyboard hint */}
          <li className="px-4 py-1.5 text-[10px] text-muted-foreground border-t border-gray-100 flex items-center gap-3 select-none">
            <span><kbd className="font-sans bg-gray-100 px-1 rounded">↑↓</kbd> navigate</span>
            <span><kbd className="font-sans bg-gray-100 px-1 rounded">↵</kbd> select</span>
            <span><kbd className="font-sans bg-gray-100 px-1 rounded">Tab</kbd> complete</span>
            <span><kbd className="font-sans bg-gray-100 px-1 rounded">Esc</kbd> close</span>
          </li>
        </ul>
      )}
    </div>
  );
}
