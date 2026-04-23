'use client';

import { useState } from 'react';
import type { ICD10Summary } from '@/lib/types';
import { Search, ExternalLink, Copy, Check } from 'lucide-react';

interface ICD10TabProps {
  data: ICD10Summary;
}

export function ICD10Tab({ data }: ICD10TabProps) {
  const [filter, setFilter] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const filteredCodes = data.related_codes.filter(r => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return r.code.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
  });

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Exact match highlight */}
      {data.exact_match && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Exact Match</span>
              <div className="mt-1 flex items-center gap-3">
                <span className="text-lg font-mono font-bold text-blue-900">{data.exact_match.code}</span>
                <span className="text-sm text-blue-800">{data.exact_match.description}</span>
              </div>
            </div>
            <button
              onClick={() => copyCode(data.exact_match!.code)}
              className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
              title="Copy code"
              aria-label="Copy code"
            >
              {copiedCode === data.exact_match.code ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-blue-600" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Search within results */}
      {data.related_codes.length > 3 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filter codes..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />
        </div>
      )}

      {/* Related codes table */}
      {filteredCodes.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Related ICD-10-CM Codes ({filteredCodes.length})
          </h4>
          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
            {filteredCodes.map((r) => (
              <div
                key={r.code}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors group"
              >
                <code className="text-sm font-mono font-bold text-[#007AFF] bg-blue-50 px-2 py-0.5 rounded shrink-0">
                  {r.code}
                </code>
                <span className="text-sm text-slate-700 flex-1 truncate">{r.description}</span>
                <button
                  onClick={() => copyCode(r.code)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-200 rounded-lg transition-all"
                  title="Copy code"
                  aria-label="Copy code"
                >
                  {copiedCode === r.code ? (
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>
                <a
                  href={`https://www.icd10data.com/ICD10CM/Codes/${r.code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-200 rounded-lg transition-all"
                  title="View on icd10data.com"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredCodes.length === 0 && filter && (
        <p className="text-center text-sm text-slate-400 py-6">No codes match &ldquo;{filter}&rdquo;</p>
      )}

      {!data.exact_match && data.related_codes.length === 0 && (
        <p className="text-center text-sm text-slate-400 py-6">No ICD-10 codes found for this query.</p>
      )}
    </div>
  );
}
