import { NextRequest, NextResponse } from 'next/server';
import { classifyQuery } from '@/lib/classifier';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q');

  if (!q || q.trim().length < 2) {
    return NextResponse.json(
      { type: 'about:blank', title: 'Bad Request', status: 400, detail: 'Query parameter q is required (min 2 chars).' },
      { status: 400 }
    );
  }

  const result = classifyQuery(q.trim());
  return NextResponse.json(result);
}
