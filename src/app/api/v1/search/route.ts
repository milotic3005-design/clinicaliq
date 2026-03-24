import { NextRequest, NextResponse } from 'next/server';
import { classifyQuery } from '@/lib/classifier';
import { aggregateSearch } from '@/lib/aggregator';
import type { QueryType } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, query_type, force_refresh } = body as {
      query?: string;
      query_type?: QueryType;
      force_refresh?: boolean;
    };

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { type: 'about:blank', title: 'Bad Request', status: 400, detail: 'Query must be at least 2 characters.' },
        { status: 400 }
      );
    }

    if (query.trim().length > 120) {
      return NextResponse.json(
        { type: 'about:blank', title: 'Bad Request', status: 400, detail: 'Query must not exceed 120 characters.' },
        { status: 400 }
      );
    }

    const trimmedQuery = query.trim();

    // Auto-classify if not provided
    const classification = query_type || classifyQuery(trimmedQuery).query_type;

    const result = await aggregateSearch(trimmedQuery, classification, force_refresh ?? false);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { type: 'about:blank', title: 'Internal Server Error', status: 500, detail: 'Search aggregation failed.' },
      { status: 500 }
    );
  }
}
