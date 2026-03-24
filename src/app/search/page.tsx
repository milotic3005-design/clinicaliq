'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { SearchBar } from '@/components/search-bar';
import { ClinicalCard } from '@/components/clinical-card';
import { Skeleton } from '@/components/ui/skeleton';
import type { ClinicalBrief } from '@/lib/types';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [brief, setBrief] = useState<ClinicalBrief | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query || query.length < 2) return;

    setLoading(true);
    setError(null);
    setBrief(null);

    fetch('/api/v1/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({ detail: 'Search failed' }));
          throw new Error(err.detail || `Error ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setBrief(data.brief);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [query]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header with search bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-border/50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <a href="/" className="text-xl font-bold tracking-tight text-[#1C1C1E] shrink-0">
            Clinical<span className="text-[#007AFF]">IQ</span>
          </a>
          <SearchBar initialQuery={query} compact />
        </div>
      </header>

      {/* Results */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {!query && (
          <p className="text-center text-muted-foreground py-12">Enter a search query to begin.</p>
        )}

        {loading && <SearchSkeleton />}

        {error && (
          <div className="text-center py-12">
            <p className="text-[#FF3B30] font-medium mb-2">Search Error</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 text-sm font-medium text-[#007AFF] hover:bg-[#007AFF]/5 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {brief && <ClinicalCard brief={brief} />}
      </div>
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-border/50 p-6">
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-9 w-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-5 w-48 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-6" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchResults />
    </Suspense>
  );
}
