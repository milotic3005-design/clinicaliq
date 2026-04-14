'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, AlertTriangle, Search } from 'lucide-react';
import type { FDALabelSummary, SourcedField } from '@/lib/types';
import { CitationFooter } from '@/components/citation-footer';

interface FDALabelTabProps {
  data: FDALabelSummary;
}

/* ── Text → bullet parser ─────────────────────────────────
   FDA label text is dense paragraphs. We split into logical
   bullet points by:
   1. Numbered lists (1., 2., etc.)
   2. Bullet markers (•, -, *)
   3. Sentence-level headers (UPPERCASE: ...)
   4. Long sentences split on periods (fallback)
   ──────────────────────────────────────────────────────── */

interface ParsedItem {
  heading?: string;
  text: string;
}

function parseIntoBullets(raw: string): ParsedItem[] {
  if (!raw || raw.trim().length === 0) return [];

  // Strip leading section title if it duplicates the section header
  // e.g., "CONTRAINDICATIONS Vancomycin..." → "Vancomycin..."
  const sectionTitles = [
    'INDICATIONS AND USAGE',
    'DOSAGE AND ADMINISTRATION',
    'CONTRAINDICATIONS',
    'WARNINGS AND PRECAUTIONS',
    'WARNINGS',
    'DRUG INTERACTIONS',
    'PREGNANCY',
    'NURSING MOTHERS',
    'USE IN SPECIFIC POPULATIONS',
  ];
  let text = raw.trim();
  for (const title of sectionTitles) {
    if (text.toUpperCase().startsWith(title)) {
      text = text.slice(title.length).trim();
      break;
    }
  }

  // Try numbered list split on new-line-anchored "1. ... 2. ..."
  // Use \n anchor (not ^) to avoid splitting on mid-sentence decimals like "2.5 mg/kg"
  const numberedParts = text.split(/\n\s*(\d+)\.\s+/);
  if (numberedParts.length >= 5) {
    const items: ParsedItem[] = [];
    // First element is text before "1."
    if (numberedParts[0].trim()) {
      items.push({ text: cleanSentence(numberedParts[0]) });
    }
    for (let i = 1; i < numberedParts.length; i += 2) {
      const content = numberedParts[i + 1];
      if (content?.trim()) {
        items.push({ text: cleanSentence(content) });
      }
    }
    if (items.length >= 3) return items;
  }

  // Try splitting on inline sub-headers: "SubHeader — text" or "SubHeader: text"
  // FDA labels often have patterns like "Patients with Normal Renal Function" as sub-sections
  const subHeaderPattern = /(?:^|\n)([A-Z][A-Za-z\s,\/\-]+(?:Function|Population|Patients|Use|Dosage|Administration|Impairment|Interactions|Effects|Reactions|Precautions|Information))\s*[:\-–—]?\s*/g;
  const subParts = text.split(subHeaderPattern);
  if (subParts.length >= 3) {
    const items: ParsedItem[] = [];
    if (subParts[0].trim()) {
      items.push({ text: cleanSentence(subParts[0]) });
    }
    for (let i = 1; i < subParts.length; i += 2) {
      const heading = subParts[i]?.trim();
      const content = subParts[i + 1]?.trim();
      if (heading && content) {
        items.push({ heading, text: cleanSentence(content) });
      }
    }
    if (items.length >= 2) return items;
  }

  // Fallback: split on sentence boundaries, grouping short related sentences
  const sentences = text.split(/(?<=\.)\s+(?=[A-Z])/);
  if (sentences.length <= 2) {
    return [{ text: cleanSentence(text) }];
  }

  // Group sentences into meaningful chunks (2-3 sentences per bullet)
  const items: ParsedItem[] = [];
  let buffer = '';
  for (const sentence of sentences) {
    const s = sentence.trim();
    if (!s) continue;

    if (buffer.length === 0) {
      buffer = s;
    } else if (buffer.length + s.length < 200) {
      buffer += ' ' + s;
    } else {
      items.push({ text: cleanSentence(buffer) });
      buffer = s;
    }
  }
  if (buffer) {
    items.push({ text: cleanSentence(buffer) });
  }

  return items;
}

function cleanSentence(s: string): string {
  return s.replace(/\s+/g, ' ').trim().replace(/^[,;:\s]+/, '').trim();
}

/* ── Highlight search matches ────────────────────────── */

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query || query.length < 2) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Use split regex with capturing group to get alternating [non-match, match, non-match, ...]
  const splitRegex = new RegExp(`(${escaped})`, 'gi');
  // Use a separate non-global regex for the .test() check to avoid lastIndex state bug
  const testRegex = new RegExp(escaped, 'i');
  const parts = text.split(splitRegex);
  return (
    <>
      {parts.map((part, i) =>
        testRegex.test(part) ? (
          <mark key={i} className="bg-yellow-200/70 text-inherit rounded-sm px-0.5">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

/* ── Collapsible Section ─────────────────────────────── */

const INITIAL_BULLET_LIMIT = 5;

function Section({
  title,
  field,
  defaultOpen = false,
  searchQuery = '',
  variant = 'default',
}: {
  title: string;
  field: SourcedField<string> | null;
  defaultOpen?: boolean;
  searchQuery?: string;
  variant?: 'default' | 'warning' | 'danger';
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [showAll, setShowAll] = useState(false);

  const bullets = useMemo(() => field ? parseIntoBullets(field.value) : [], [field]);

  const isSearching = searchQuery.length >= 2;

  const visibleBullets = useMemo(() => {
    if (isSearching) {
      const q = searchQuery.toLowerCase();
      return bullets.filter(b =>
        b.text.toLowerCase().includes(q) || b.heading?.toLowerCase().includes(q)
      );
    }
    return showAll ? bullets : bullets.slice(0, INITIAL_BULLET_LIMIT);
  }, [bullets, isSearching, searchQuery, showAll]);

  if (!field) return null;

  if (isSearching && visibleBullets.length === 0) return null;

  const hasMore = !isSearching && bullets.length > INITIAL_BULLET_LIMIT;

  const borderColor = variant === 'danger' ? 'border-red-200' :
    variant === 'warning' ? 'border-amber-200' : 'border-slate-200';
  const headerBg = variant === 'danger' ? 'hover:bg-red-50/50' :
    variant === 'warning' ? 'hover:bg-amber-50/50' : 'hover:bg-slate-50/50';

  return (
    <div className={`border ${borderColor} rounded-xl overflow-hidden`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-2 px-4 py-3 text-left transition-colors ${headerBg}`}
      >
        {isOpen
          ? <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          : <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        }
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex-1">
          {title}
        </span>
        <span className="text-[10px] text-slate-400">
          {bullets.length} {bullets.length === 1 ? 'item' : 'items'}
        </span>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-1">
          <ul className="space-y-2">
            {visibleBullets.map((item, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-slate-700 leading-relaxed">
                <span className="text-blue-400 mt-1 shrink-0 text-xs">●</span>
                <div>
                  {item.heading && (
                    <span className="font-semibold text-slate-900 mr-1">
                      <HighlightText text={item.heading} query={searchQuery} />:
                    </span>
                  )}
                  <HighlightText text={item.text} query={searchQuery} />
                </div>
              </li>
            ))}
          </ul>
          {hasMore && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="mt-3 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              Show {bullets.length - INITIAL_BULLET_LIMIT} more items
            </button>
          )}
          {hasMore && showAll && (
            <button
              onClick={() => setShowAll(false)}
              className="mt-3 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              Show less
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main Component ──────────────────────────────────── */

export function FDALabelTab({ data }: FDALabelTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const sourceUrl = `https://api.fda.gov/drug/label.json?search=set_id:${data.openfda_id}`;
  const retrievedAt = data.indications_and_usage?.retrieved_at || new Date().toISOString();

  const boxedWarningBullets = useMemo(() =>
    data.boxed_warning ? parseIntoBullets(data.boxed_warning.value) : [],
    [data.boxed_warning]
  );

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-[#1C1C1E]">
            {data.brand_name?.[0] || 'Unknown Brand'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {data.generic_name.join(', ')} · {data.manufacturer}
          </p>
        </div>
      </div>

      {/* Search within label */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search within FDA label..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
        />
      </div>

      {/* Black Box Warning — always visible, not collapsible */}
      {data.boxed_warning && (
        <div className="p-4 border-2 border-red-300 bg-red-50 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-sm font-bold text-red-700">BLACK BOX WARNING</span>
          </div>
          <ul className="space-y-1.5">
            {boxedWarningBullets.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm text-red-900 leading-relaxed">
                <span className="text-red-400 mt-1 shrink-0 text-xs">●</span>
                <span><HighlightText text={item.text} query={searchQuery} /></span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sections — key ones default open */}
      <Section title="Indications & Usage" field={data.indications_and_usage} defaultOpen searchQuery={searchQuery} />
      <Section title="Dosage & Administration" field={data.dosage_and_administration} defaultOpen searchQuery={searchQuery} />
      <Section title="Contraindications" field={data.contraindications} defaultOpen searchQuery={searchQuery} variant="warning" />
      <Section title="Warnings & Precautions" field={data.warnings_and_precautions} searchQuery={searchQuery} variant="warning" />
      <Section title="Drug Interactions" field={data.drug_interactions} searchQuery={searchQuery} />
      <Section title="Pregnancy" field={data.pregnancy} searchQuery={searchQuery} />
      <Section title="Nursing Mothers" field={data.nursing_mothers} searchQuery={searchQuery} />
      <Section title="Renal Impairment" field={data.renal_impairment} searchQuery={searchQuery} />
      <Section title="Hepatic Impairment" field={data.hepatic_impairment} searchQuery={searchQuery} />

      <CitationFooter sourceName="OpenFDA Drug Labels" retrievedAt={retrievedAt} sourceUrl={sourceUrl} />
    </div>
  );
}
