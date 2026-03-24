import { NextRequest, NextResponse } from 'next/server';
import { resolveRxCUI } from '@/lib/sources/medlineplus';

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get('name');

  if (!name || name.trim().length < 2) {
    return NextResponse.json(
      { type: 'about:blank', title: 'Bad Request', status: 400, detail: 'Query parameter name is required.' },
      { status: 400 }
    );
  }

  const rxcui = await resolveRxCUI(name.trim());

  if (!rxcui) {
    return NextResponse.json(
      { type: 'about:blank', title: 'Not Found', status: 404, detail: `No RxCUI found for "${name.trim()}"` },
      { status: 404 }
    );
  }

  return NextResponse.json({
    drug_name: name.trim(),
    rxcui,
    source_url: `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(name.trim())}`,
  });
}
