'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  X, Search, ExternalLink, Sparkles, MessageSquare,
  ChevronDown, ChevronUp, Send, Loader2, AlertTriangle,
  BookOpen, Globe, Database, RotateCcw, Bot,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DrugSearchResult } from '@/app/api/v1/drug-search/route';
import type { DrugSummary } from '@/app/api/v1/drug-ai-summary/route';

// ── Types ──────────────────────────────────────────────────────────────────
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ── Source badge ───────────────────────────────────────────────────────────
const SOURCE_CONFIG = {
  google: { label: 'Google', icon: Globe, color: 'bg-blue-100 text-blue-700' },
  dailymed: { label: 'DailyMed', icon: Database, color: 'bg-emerald-100 text-emerald-700' },
  openfda: { label: 'OpenFDA', icon: BookOpen, color: 'bg-orange-100 text-orange-700' },
};

function SourceBadge({ source }: { source: DrugSearchResult['source'] }) {
  const cfg = SOURCE_CONFIG[source];
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold', cfg.color)}>
      <cfg.icon size={10} />
      {cfg.label}
    </span>
  );
}

// ── Summary card ───────────────────────────────────────────────────────────
function SummaryView({ summary }: { summary: DrugSummary }) {
  const sections: { label: string; value: string | string[] | null }[] = [
    { label: 'Indication', value: summary.indication },
    { label: 'Mechanism', value: summary.mechanism },
    { label: 'Adult Dosing', value: summary.adultDosing },
    { label: 'Renal Adjustment', value: summary.renalDosing },
    { label: 'Hepatic Adjustment', value: summary.hepaticDosing },
    { label: 'Black Box Warning', value: summary.blackBox },
    { label: 'Adverse Effects', value: summary.adverseEffects },
    { label: 'Monitoring', value: summary.monitoring },
    { label: 'Drug Interactions', value: summary.interactions },
    { label: 'Pregnancy', value: summary.pregnancy },
    { label: 'Notes', value: summary.notes },
  ];

  return (
    <div className="space-y-3">
      {summary.blackBox && (
        <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
          <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-red-700 uppercase tracking-wide mb-1">Black Box Warning</p>
            <p className="text-sm text-red-800">{summary.blackBox}</p>
          </div>
        </div>
      )}
      {sections.filter(s => s.label !== 'Black Box Warning' && s.value && (Array.isArray(s.value) ? s.value.length > 0 : true)).map(({ label, value }) => (
        <div key={label} className="border border-slate-100 rounded-xl p-3 bg-slate-50">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">{label}</p>
          {Array.isArray(value) ? (
            <ul className="space-y-1">
              {value.map((v, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-700">
                  <span className="text-slate-400 shrink-0 mt-0.5">•</span>
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-700">{value}</p>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Chat bubble ────────────────────────────────────────────────────────────
function ChatBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  return (
    <div className={cn('flex gap-2', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
          <Bot size={14} className="text-white" />
        </div>
      )}
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap',
          isUser
            ? 'bg-blue-600 text-white rounded-tr-sm'
            : 'bg-slate-100 text-slate-800 rounded-tl-sm'
        )}
      >
        {msg.content}
      </div>
    </div>
  );
}

// ── Main Panel ─────────────────────────────────────────────────────────────
interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function DrugResearchPanel({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<DrugSearchResult[]>([]);
  const [searchedDrug, setSearchedDrug] = useState('');
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [searchError, setSearchError] = useState('');

  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summary, setSummary] = useState<DrugSummary | null>(null);
  const [summaryError, setSummaryError] = useState('');

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Focus chat input when opened
  useEffect(() => {
    if (chatOpen) setTimeout(() => chatInputRef.current?.focus(), 100);
  }, [chatOpen]);

  // ── Search ───────────────────────────────────────────────────────
  const handleSearch = useCallback(async () => {
    const drug = query.trim();
    if (!drug || drug.length < 2) return;
    setSearching(true);
    setSearchError('');
    setResults([]);
    setSummary(null);
    setSummaryError('');
    setChatMessages([]);
    setChatError('');
    setSummaryOpen(false);
    setChatOpen(false);

    try {
      const resp = await fetch(`/api/v1/drug-search?q=${encodeURIComponent(drug)}`, {
        signal: AbortSignal.timeout(15000),
      });
      const data = await resp.json();
      if (!resp.ok) { setSearchError(data.error ?? 'Search failed.'); return; }
      setResults(data.results ?? []);
      setSearchedDrug(data.drug ?? drug);
      setGoogleEnabled(data.googleEnabled ?? false);
      if ((data.results ?? []).length === 0) setSearchError('No results found. Try a different drug name.');
    } catch {
      setSearchError('Search request timed out or failed. Check your connection.');
    } finally {
      setSearching(false);
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  // ── AI Summary ───────────────────────────────────────────────────
  const handleGenerateSummary = useCallback(async () => {
    if (!searchedDrug || results.length === 0) return;
    setSummaryLoading(true);
    setSummaryError('');
    setSummary(null);

    const snippets = results.map((r) => `${r.title}: ${r.snippet}`);

    try {
      const resp = await fetch('/api/v1/drug-ai-summary', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ drug: searchedDrug, snippets }),
        signal: AbortSignal.timeout(35000),
      });
      const data = await resp.json();
      if (!resp.ok) { setSummaryError(data.error ?? 'AI summary failed.'); return; }
      if (data.summary) {
        setSummary(data.summary as DrugSummary);
        setSummaryOpen(true);
      } else {
        setSummaryError('Could not parse AI summary. Try again.');
      }
    } catch {
      setSummaryError('AI summary timed out. Try again.');
    } finally {
      setSummaryLoading(false);
    }
  }, [searchedDrug, results]);

  // ── Streaming Chat ───────────────────────────────────────────────
  const handleSendChat = useCallback(async () => {
    const msg = chatInput.trim();
    if (!msg || chatLoading) return;
    setChatInput('');
    setChatError('');

    const newMessages: ChatMessage[] = [...chatMessages, { role: 'user', content: msg }];
    setChatMessages(newMessages);
    setChatLoading(true);

    // Prepare context from search results
    const context = results.map((r) => `${r.title}: ${r.snippet}`).join('\n\n');

    try {
      const resp = await fetch('/api/v1/drug-chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ drug: searchedDrug, messages: newMessages, context }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        setChatError((errData as { error?: string }).error ?? 'Chat request failed.');
        setChatLoading(false);
        return;
      }

      // Parse Anthropic SSE stream
      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantText = '';

      // Add empty assistant message to stream into
      setChatMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (!raw || raw === '[DONE]') continue;
          try {
            const parsed = JSON.parse(raw) as {
              type: string;
              delta?: { type: string; text: string };
            };
            if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
              assistantText += parsed.delta.text;
              const snapshot = assistantText;
              setChatMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: snapshot };
                return updated;
              });
            }
          } catch { /* skip malformed SSE line */ }
        }
      }
    } catch {
      setChatError('Chat stream failed. Try again.');
    } finally {
      setChatLoading(false);
    }
  }, [chatInput, chatLoading, chatMessages, results, searchedDrug]);

  const handleChatKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendChat(); }
  };

  const resetChat = () => {
    setChatMessages([]);
    setChatError('');
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
          aria-hidden
        />
      )}

      {/* Drawer */}
      <div
        role="dialog"
        aria-label="Drug Research Panel"
        aria-modal
        className={cn(
          'fixed top-0 right-0 h-full w-full sm:w-[520px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Search size={15} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Drug Research</h2>
              <p className="text-xs text-slate-500">Search · AI Summary · Chat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close panel"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* Search bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search any drug (e.g. vancomycin)…"
                autoComplete="off"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all shadow-sm"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searching || query.trim().length < 2}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold transition-all shadow-sm disabled:cursor-not-allowed"
            >
              {searching ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
              {searching ? 'Searching…' : 'Search'}
            </button>
          </div>

          {!googleEnabled && !searching && !searchError && results.length === 0 && (
            <div className="flex gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
              <AlertTriangle size={14} className="shrink-0 mt-0.5 text-amber-600" />
              <span>
                <strong>Google Knowledge Graph not configured.</strong> Results from DailyMed &amp; OpenFDA only.
                Add <code className="bg-amber-100 px-1 rounded">GOOGLE_CSE_KEY</code> (your Google API key) to enrich results with drug entity data.
              </span>
            </div>
          )}

          {searchError && (
            <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              {searchError}
            </div>
          )}

          {/* Search results */}
          {results.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{searchedDrug}&rdquo;
              </p>
              {results.map((r, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-3 hover:border-slate-200 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <SourceBadge source={r.source} />
                      <span className="text-sm font-semibold text-slate-800 leading-snug">{r.title}</span>
                    </div>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 p-1 text-slate-400 hover:text-blue-600 transition-colors"
                      aria-label="Open source"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{r.snippet}</p>
                </div>
              ))}
            </div>
          )}

          {/* AI Summary section */}
          {results.length > 0 && (
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <button
                onClick={() => summaryOpen ? setSummaryOpen(false) : (summary ? setSummaryOpen(true) : handleGenerateSummary())}
                className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {summaryLoading
                    ? <Loader2 size={16} className="text-purple-600 animate-spin" />
                    : <Sparkles size={16} className="text-purple-600" />}
                  <span className="text-sm font-bold text-slate-800">
                    {summaryLoading ? 'Generating AI Summary…' : summary ? 'AI Clinical Summary' : 'Generate AI Summary'}
                  </span>
                  {!summary && !summaryLoading && (
                    <span className="text-xs text-purple-600 font-medium">Requires ANTHROPIC_API_KEY</span>
                  )}
                </div>
                {summary && (summaryOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />)}
              </button>

              {summaryError && (
                <div className="px-4 py-3 bg-red-50 border-t border-red-100">
                  <p className="text-sm text-red-700 flex gap-2 items-start">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                    {summaryError}
                  </p>
                </div>
              )}

              {summary && summaryOpen && (
                <div className="px-4 py-4 border-t border-slate-100">
                  <SummaryView summary={summary} />
                  <p className="mt-3 text-xs text-slate-400 text-center">AI-generated from search results · Verify with authoritative sources</p>
                </div>
              )}
            </div>
          )}

          {/* Chat section */}
          {results.length > 0 && (
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <button
                onClick={() => setChatOpen((o) => !o)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-emerald-600" />
                  <span className="text-sm font-bold text-slate-800">Chat with AI</span>
                  <span className="text-xs text-emerald-600 font-medium">Ask about {searchedDrug}</span>
                </div>
                {chatOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
              </button>

              {chatOpen && (
                <div className="border-t border-slate-100 flex flex-col" style={{ maxHeight: '420px' }}>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[120px]">
                    {chatMessages.length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-4">
                        Ask anything about <strong>{searchedDrug}</strong> — dosing, interactions, monitoring, adverse effects…
                      </p>
                    )}
                    {chatMessages.map((msg, i) => <ChatBubble key={i} msg={msg} />)}
                    {chatLoading && chatMessages[chatMessages.length - 1]?.role === 'user' && (
                      <div className="flex gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                          <Bot size={14} className="text-white" />
                        </div>
                        <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-2.5">
                          <Loader2 size={14} className="text-slate-400 animate-spin" />
                        </div>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  {chatError && (
                    <div className="px-4 py-2 bg-red-50 border-t border-red-100">
                      <p className="text-xs text-red-600 flex gap-1.5 items-center">
                        <AlertTriangle size={12} />
                        {chatError}
                      </p>
                    </div>
                  )}

                  {/* Input bar */}
                  <div className="flex gap-2 px-3 py-3 border-t border-slate-100 bg-slate-50 items-center">
                    {chatMessages.length > 0 && (
                      <button
                        onClick={resetChat}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors shrink-0"
                        title="Clear chat"
                        aria-label="Clear chat"
                      >
                        <RotateCcw size={14} />
                      </button>
                    )}
                    <input
                      ref={chatInputRef}
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={handleChatKeyDown}
                      placeholder={`Ask about ${searchedDrug}…`}
                      disabled={chatLoading}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 disabled:opacity-50 transition-all"
                    />
                    <button
                      onClick={handleSendChat}
                      disabled={chatLoading || chatInput.trim().length === 0}
                      className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white disabled:text-slate-400 transition-all shrink-0"
                      aria-label="Send message"
                    >
                      <Send size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {!searching && results.length === 0 && !searchError && (
            <div className="py-12 text-center text-slate-400">
              <Search size={36} className="mx-auto mb-3 text-slate-200" />
              <p className="text-sm font-medium text-slate-500">Search any drug to get started</p>
              <p className="text-xs mt-1">Results from Google, DailyMed &amp; OpenFDA</p>
            </div>
          )}
        </div>

        {/* Footer disclaimer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 shrink-0">
          <p className="text-xs text-slate-400 text-center">
            For clinical reference only · Verify all information with authoritative sources · Not a substitute for clinical judgment
          </p>
        </div>
      </div>
    </>
  );
}
