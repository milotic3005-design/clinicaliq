import { NextResponse } from 'next/server';
import type { HealthResponse } from '@/lib/types';

const SOURCES = [
  { name: 'openfda_labels', url: 'https://api.fda.gov/drug/label.json?limit=1' },
  { name: 'openfda_faers', url: 'https://api.fda.gov/drug/event.json?limit=1' },
  { name: 'openfda_enforcement', url: 'https://api.fda.gov/drug/enforcement.json?limit=1' },
  { name: 'clinicaltrials', url: 'https://clinicaltrials.gov/api/v2/studies?pageSize=1' },
  { name: 'pubmed', url: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=test&retmode=json&retmax=1' },
  { name: 'medlineplus', url: 'https://connect.medlineplus.gov/application?mainSearchCriteria.v.dn=aspirin&knowledgeResponseType=application/json' },
];

async function checkSource(name: string, url: string): Promise<{
  reachable: boolean;
  latency_ms: number;
  last_success: string;
}> {
  const start = Date.now();
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const latency = Date.now() - start;
    return {
      reachable: res.ok,
      latency_ms: latency,
      last_success: res.ok ? new Date().toISOString() : '',
    };
  } catch {
    return {
      reachable: false,
      latency_ms: Date.now() - start,
      last_success: '',
    };
  }
}

export async function GET() {
  const results = await Promise.all(
    SOURCES.map(s => checkSource(s.name, s.url).then(r => ({ name: s.name, ...r })))
  );

  const sources: HealthResponse['sources'] = {};
  let reachableCount = 0;

  for (const r of results) {
    sources[r.name] = {
      reachable: r.reachable,
      latency_ms: r.latency_ms,
      last_success: r.last_success,
    };
    if (r.reachable) reachableCount++;
  }

  let status: HealthResponse['status'] = 'healthy';
  if (reachableCount === 0) status = 'unhealthy';
  else if (reachableCount < SOURCES.length) status = 'degraded';

  const response: HealthResponse = {
    status,
    sources,
    cache: {
      connected: true,
      type: 'memory',
    },
    checked_at: new Date().toISOString(),
  };

  return NextResponse.json(response, {
    status: status === 'unhealthy' ? 503 : 200,
  });
}
