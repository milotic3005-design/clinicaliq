import { NextRequest, NextResponse } from 'next/server';
import { fetchLactMed } from '@/lib/sources/lactmed';

// GET /api/v1/lactmed?drug=aspirin
export async function GET(request: NextRequest) {
  const drug = request.nextUrl.searchParams.get('drug');

  if (!drug || drug.trim().length < 2) {
    return NextResponse.json({ error: 'Drug name required (min 2 chars)' }, { status: 400 });
  }

  try {
    const result = await fetchLactMed(drug.trim());
    return NextResponse.json({ result });
  } catch (error) {
    console.error('LactMed fetch error:', error);
    return NextResponse.json({ error: 'LactMed lookup failed' }, { status: 500 });
  }
}
