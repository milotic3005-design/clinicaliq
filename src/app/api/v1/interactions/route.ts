import { NextRequest, NextResponse } from 'next/server';
import { resolveRxCUI, checkInteractions, suggestDrugNames } from '@/lib/sources/rxnorm-interactions';

// POST /api/v1/interactions — check interactions between drug names
export async function POST(request: NextRequest) {
  try {
    const { drugs } = (await request.json()) as { drugs: string[] };

    if (!Array.isArray(drugs) || drugs.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 drugs required' },
        { status: 400 }
      );
    }

    if (drugs.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 drugs at a time' },
        { status: 400 }
      );
    }

    // Sanitize: ensure each element is a non-empty string of reasonable length
    const sanitized = drugs
      .map((d: unknown) => String(d).trim())
      .filter((d: string) => d.length >= 2 && d.length <= 120);

    if (sanitized.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 valid drug names required' },
        { status: 400 }
      );
    }

    // Resolve all drug names to RxCUIs in parallel
    const resolved = await Promise.all(
      sanitized.map(async (name) => {
        const result = await resolveRxCUI(name);
        return { input: name, resolved: result };
      })
    );

    const resolvedDrugs = resolved.filter(r => r.resolved !== null);
    const unresolved = resolved.filter(r => r.resolved === null).map(r => r.input);

    if (resolvedDrugs.length < 2) {
      return NextResponse.json({
        interactions: [],
        resolved_drugs: resolvedDrugs.map(r => ({ input: r.input, ...r.resolved })),
        unresolved_drugs: unresolved,
        error: 'Could not resolve enough drugs to check interactions',
      });
    }

    const rxcuis = resolvedDrugs.map(r => r.resolved!.rxcui);
    const interactions = await checkInteractions(rxcuis);

    return NextResponse.json({
      interactions,
      resolved_drugs: resolvedDrugs.map(r => ({ input: r.input, ...r.resolved })),
      unresolved_drugs: unresolved,
    });
  } catch {
    return NextResponse.json(
      { error: 'Interaction check failed' },
      { status: 500 }
    );
  }
}

// GET /api/v1/interactions?suggest=term — autocomplete drug names
export async function GET(request: NextRequest) {
  const term = request.nextUrl.searchParams.get('suggest');
  if (!term || term.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const suggestions = await suggestDrugNames(term);
  return NextResponse.json({ suggestions });
}
