'use client';

import { useState } from 'react';
import type { PubMedResult } from '@/lib/types';
import { CitationFooter } from '@/components/citation-footer';
import { EvidenceBadge } from '@/components/evidence-badge';
import { Badge } from '@/components/ui/badge';

interface LiteratureTabProps {
  data: PubMedResult[];
}

function formatAuthors(authors: string[]): string {
  if (authors.length === 0) return 'Unknown authors';
  if (authors.length <= 3) return authors.join(', ');
  return `${authors[0]} et al.`;
}

export function LiteratureTab({ data }: LiteratureTabProps) {
  const [visibleCount, setVisibleCount] = useState(15);
  const visible = data.slice(0, visibleCount);

  return (
    <div>
      <h3 className="text-lg font-semibold text-[#1C1C1E] mb-4">
        Literature
        <span className="text-sm font-normal text-muted-foreground ml-2">({data.length} results)</span>
      </h3>

      <div className="space-y-4">
        {visible.map((article) => (
          <ArticleCard key={article.pmid} article={article} />
        ))}
      </div>

      {data.length > visibleCount && (
        <button
          onClick={() => setVisibleCount(prev => prev + 15)}
          className="w-full mt-4 py-2.5 text-sm font-medium text-[#007AFF] hover:bg-[#007AFF]/5 rounded-lg transition-colors"
        >
          Load more articles
        </button>
      )}

      <CitationFooter
        sourceName="PubMed / NCBI"
        retrievedAt={data[0]?.retrieved_at || new Date().toISOString()}
        sourceUrl="https://pubmed.ncbi.nlm.nih.gov"
      />
    </div>
  );
}

function ArticleCard({ article }: { article: PubMedResult }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="p-4 border border-border rounded-xl">
      <div className="flex items-start justify-between gap-3 mb-1">
        <a
          href={article.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono text-[#007AFF] hover:underline"
        >
          PMID: {article.pmid}
        </a>
        <div className="flex items-center gap-1.5 shrink-0">
          <EvidenceBadge tier={article.evidence_tier} />
          {article.publication_types.slice(0, 2).map(pt => (
            <Badge key={pt} variant="outline" className="text-[10px] bg-gray-50">
              {pt}
            </Badge>
          ))}
        </div>
      </div>

      <p className="text-sm font-medium text-[#1C1C1E] mb-1">{article.title}</p>

      <p className="text-xs text-muted-foreground mb-2">
        {formatAuthors(article.authors)} · <span className="italic">{article.journal}</span> ({article.pub_year})
        {article.doi && (
          <>
            {' · '}
            <a
              href={`https://doi.org/${article.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#007AFF] hover:underline"
            >
              DOI
            </a>
          </>
        )}
      </p>

      {article.abstract && (
        <div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {expanded
              ? article.abstract
              : article.abstract.length > 250
                ? `${article.abstract.slice(0, 250)}...`
                : article.abstract}
          </p>
          {article.abstract.length > 250 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[#007AFF] text-xs font-medium mt-1 hover:underline"
            >
              {expanded ? 'Collapse' : 'Expand abstract'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
