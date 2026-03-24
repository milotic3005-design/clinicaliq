interface CitationFooterProps {
  sourceName: string;
  retrievedAt: string;
  sourceUrl: string;
}

export function CitationFooter({ sourceName, retrievedAt, sourceUrl }: CitationFooterProps) {
  const formattedTime = new Date(retrievedAt).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="mt-4 pt-3 border-t border-border text-xs text-muted-foreground flex flex-wrap items-center gap-1">
      <span>Data sourced from</span>
      <span className="font-medium">{sourceName}</span>
      <span>·</span>
      <span>Retrieved {formattedTime}</span>
      <span>·</span>
      <a
        href={sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#007AFF] hover:underline"
      >
        View source
      </a>
    </div>
  );
}
