import type { ClinicalBrief } from '../types';

export function briefToJSON(brief: ClinicalBrief): string {
  return JSON.stringify(brief, null, 2);
}

export function downloadJSON(brief: ClinicalBrief): void {
  const json = briefToJSON(brief);
  const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const safeName = brief.query.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 50);
  const filename = `clinicaliq_${safeName}_${dateStr}.json`;

  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
