import type { MedlinePlusSummary } from '@/lib/types';
import { CitationFooter } from '@/components/citation-footer';

interface DrugSummaryTabProps {
  data: MedlinePlusSummary;
}

export function DrugSummaryTab({ data }: DrugSummaryTabProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-[#1C1C1E] mb-4">Drug Summary</h3>

      {data.rxcui && (
        <p className="text-xs text-muted-foreground mb-3">
          RxCUI: <span className="font-mono font-medium">{data.rxcui}</span>
        </p>
      )}

      {/* NLM-authored summary */}
      <div className="text-sm leading-relaxed text-[#1C1C1E] mb-6">
        {data.drug_summary.value}
      </div>

      {/* Related links */}
      {data.related_links.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Related Resources
          </h4>
          <ul className="space-y-1.5">
            {data.related_links.map((link, i) => (
              <li key={i}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#007AFF] hover:underline"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <CitationFooter
        sourceName="NIH MedlinePlus"
        retrievedAt={data.drug_summary.retrieved_at}
        sourceUrl={data.drug_summary.source_url}
      />
    </div>
  );
}
