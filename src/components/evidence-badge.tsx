import type { EvidenceTier } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

const tierConfig: Record<EvidenceTier, { label: string; className: string }> = {
  1: { label: 'Tier 1', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  2: { label: 'Tier 2', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  3: { label: 'Tier 3', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  4: { label: 'Tier 4', className: 'bg-gray-50 text-gray-500 border-gray-200' },
  5: { label: 'Tier 5', className: 'bg-transparent text-gray-400 border-gray-300' },
};

const tierTooltips: Record<EvidenceTier, string> = {
  1: 'Meta-Analysis / Systematic Review',
  2: 'Randomized Controlled Trial',
  3: 'Cohort / Observational Study',
  4: 'Case Report / Series',
  5: 'Expert Opinion / Editorial',
};

interface EvidenceBadgeProps {
  tier: EvidenceTier;
}

export function EvidenceBadge({ tier }: EvidenceBadgeProps) {
  const config = tierConfig[tier];
  return (
    <Badge
      variant="outline"
      className={`text-[10px] font-semibold ${config.className}`}
      title={tierTooltips[tier]}
    >
      {config.label}
    </Badge>
  );
}
