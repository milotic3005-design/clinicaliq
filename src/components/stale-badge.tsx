'use client';

import { AlertCircle } from 'lucide-react';

interface StaleBadgeProps {
  retrievedAt: string;
  thresholdMs?: number; // default 24h
}

export function StaleBadge({ retrievedAt, thresholdMs = 24 * 60 * 60 * 1000 }: StaleBadgeProps) {
  const age = Date.now() - new Date(retrievedAt).getTime();

  if (age < thresholdMs) return null;

  const hours = Math.floor(age / (60 * 60 * 1000));
  const label = hours >= 24 ? `${Math.floor(hours / 24)}d old` : `${hours}h old`;

  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
      <AlertCircle className="w-3 h-3" />
      Data {label} — may be stale
    </span>
  );
}
