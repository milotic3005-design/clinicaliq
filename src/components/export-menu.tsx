'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileJson, File, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ClinicalBrief } from '@/lib/types';
import { downloadMarkdown } from '@/lib/export/export-markdown';
import { downloadJSON } from '@/lib/export/export-json';

interface ExportMenuProps {
  brief: ClinicalBrief;
}

export function ExportMenu({ brief }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }
  }, [open]);

  const handlePDF = async () => {
    setGenerating(true);
    setOpen(false);
    try {
      // Dynamic import to avoid SSR issues with @react-pdf/renderer
      const { downloadPDF } = await import('@/lib/export/export-pdf');
      await downloadPDF(brief);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkdown = () => {
    downloadMarkdown(brief);
    setOpen(false);
  };

  const handleJSON = () => {
    downloadJSON(brief);
    setOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
        disabled={generating}
        className="h-8 px-2.5 gap-1.5 text-xs font-medium text-muted-foreground hover:text-[#1C1C1E]"
        aria-label="Export brief"
      >
        {generating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        Export
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg border border-border/50 shadow-lg z-50 py-1 animate-in fade-in-0 zoom-in-95 duration-150">
          <button
            onClick={handlePDF}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[#1C1C1E] hover:bg-gray-50 transition-colors"
          >
            <File className="w-4 h-4 text-red-500" />
            Export as PDF
          </button>
          <button
            onClick={handleMarkdown}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[#1C1C1E] hover:bg-gray-50 transition-colors"
          >
            <FileText className="w-4 h-4 text-blue-500" />
            Export as Markdown
          </button>
          <button
            onClick={handleJSON}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[#1C1C1E] hover:bg-gray-50 transition-colors"
          >
            <FileJson className="w-4 h-4 text-emerald-500" />
            Export as JSON
          </button>
        </div>
      )}
    </div>
  );
}
