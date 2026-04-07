import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

export interface DrugSummary {
  indication: string;
  mechanism: string;
  adultDosing: string;
  renalDosing: string | null;
  hepaticDosing: string | null;
  blackBox: string | null;
  adverseEffects: string[];
  monitoring: string[];
  interactions: string[];
  pregnancy: string;
  notes: string | null;
}

export async function POST(req: NextRequest) {
  if (!ANTHROPIC_KEY) {
    return NextResponse.json(
      { error: 'AI features require an ANTHROPIC_API_KEY environment variable. Add it in your Vercel project settings.' },
      { status: 503 }
    );
  }

  let drug: string, snippets: string[];
  try {
    ({ drug, snippets } = await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!drug || !Array.isArray(snippets) || snippets.length === 0) {
    return NextResponse.json({ error: 'drug and snippets[] required.' }, { status: 400 });
  }

  const context = snippets.slice(0, 10).map((s, i) => `[${i + 1}] ${s}`).join('\n\n');

  const prompt = `You are a clinical pharmacist. Based ONLY on the following search result snippets about "${drug}", extract and summarize the key clinical data points.

SEARCH RESULTS:
${context}

Return ONLY valid JSON — no markdown fences, no prose — in this exact structure:
{
  "indication": "primary therapeutic indication(s)",
  "mechanism": "mechanism of action (1-2 sentences)",
  "adultDosing": "standard adult dosing regimen",
  "renalDosing": "renal dose adjustment, or null if not mentioned",
  "hepaticDosing": "hepatic dose adjustment, or null if not mentioned",
  "blackBox": "black box warning text, or null if none",
  "adverseEffects": ["adverse effect 1", "adverse effect 2", "adverse effect 3", "adverse effect 4", "adverse effect 5"],
  "monitoring": ["monitoring parameter 1", "monitoring parameter 2", "monitoring parameter 3"],
  "interactions": ["major interaction 1", "major interaction 2", "major interaction 3"],
  "pregnancy": "pregnancy safety category or notes",
  "notes": "any other clinically important information, or null"
}`;

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!resp.ok) {
      const err = await resp.text();
      return NextResponse.json({ error: `Anthropic API error: ${resp.status}`, detail: err }, { status: 502 });
    }

    const data = await resp.json();
    const text: string = data.content?.[0]?.text ?? '';

    try {
      const parsed = JSON.parse(text) as DrugSummary;
      return NextResponse.json({ drug, summary: parsed });
    } catch {
      // Try to extract JSON from the text
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          const parsed = JSON.parse(match[0]) as DrugSummary;
          return NextResponse.json({ drug, summary: parsed });
        } catch { /* fall through */ }
      }
      return NextResponse.json({ drug, summary: null, raw: text });
    }
  } catch (err) {
    return NextResponse.json({ error: 'AI summary request failed.', detail: String(err) }, { status: 502 });
  }
}
