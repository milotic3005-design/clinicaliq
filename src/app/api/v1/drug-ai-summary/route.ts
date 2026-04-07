import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_KEY = process.env.GOOGLE_CSE_KEY;

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

/** Fetch from Gemini with up to `maxRetries` retries on 429. */
async function fetchGemini(body: string, maxRetries = 3): Promise<Response> {
  let lastResp: Response | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_KEY}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body,
        signal: AbortSignal.timeout(30000),
      }
    );
    if (resp.status !== 429) return resp;
    lastResp = resp;
    if (attempt < maxRetries) {
      // Honour Retry-After header, fallback to exponential backoff (2s, 4s, 8s)
      const retryAfter = resp.headers.get('Retry-After');
      const waitMs = retryAfter ? parseFloat(retryAfter) * 1000 : 2000 * Math.pow(2, attempt);
      await new Promise(r => setTimeout(r, waitMs));
    }
  }
  return lastResp!;
}

export async function POST(req: NextRequest) {
  if (!GOOGLE_KEY) {
    return NextResponse.json(
      { error: 'AI features require a GOOGLE_CSE_KEY environment variable.' },
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
    const resp = await fetchGemini(JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 1500, temperature: 0.2 },
    }));

    if (resp.status === 429) {
      return NextResponse.json(
        { error: 'Gemini rate limit reached. Please wait a moment and try again.' },
        { status: 429 }
      );
    }

    if (!resp.ok) {
      const err = await resp.text();
      return NextResponse.json({ error: `Gemini API error: ${resp.status}`, detail: err }, { status: 502 });
    }

    const data = await resp.json() as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    // Strip markdown fences if present
    const stripped = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    try {
      const parsed = JSON.parse(stripped) as DrugSummary;
      return NextResponse.json({ drug, summary: parsed });
    } catch {
      const match = stripped.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          return NextResponse.json({ drug, summary: JSON.parse(match[0]) as DrugSummary });
        } catch { /* fall through */ }
      }
      return NextResponse.json({ drug, summary: null, raw: text });
    }
  } catch (err) {
    return NextResponse.json({ error: 'AI summary request failed.', detail: String(err) }, { status: 502 });
  }
}
