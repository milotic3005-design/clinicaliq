'use client';

import { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ClinicalBrief } from '@/lib/types';
import { isSaved as checkSaved } from '@/lib/saved-briefs';

interface SaveButtonProps {
  brief: ClinicalBrief;
  onToggle: (brief: ClinicalBrief) => void;
}

export function SaveButton({ brief, onToggle }: SaveButtonProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(checkSaved(brief.id));
  }, [brief.id]);

  const handleClick = () => {
    onToggle(brief);
    setSaved(!saved);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={`h-8 px-2.5 gap-1.5 text-xs font-medium transition-colors ${
        saved
          ? 'text-[#007AFF] hover:text-[#007AFF]/80'
          : 'text-muted-foreground hover:text-[#1C1C1E]'
      }`}
      aria-label={saved ? 'Unsave brief' : 'Save brief'}
    >
      {saved ? (
        <BookmarkCheck className="w-4 h-4 fill-current" />
      ) : (
        <Bookmark className="w-4 h-4" />
      )}
      {saved ? 'Saved' : 'Save'}
    </Button>
  );
}
