import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_KEY = process.env.GOOGLE_CSE_KEY;
const GROQ_KEY   = process.env.GROQ_API_KEY;
const GROQ_MODEL = 'llama-3.3-70b-versatile';

export interface YSiteResult {
  drugA: string;
  drugB: string;
  result: 'C' | 'I' | 'U' | 'N';
  concentrationA: string;
  concentrationB: string;
  diluent: string;
  notes: string;
  references: string[];
  source: 'ai-gemini' | 'ai-groq' | 'no-data';
  confidence: 'high' | 'moderate' | 'low';
}

const PROMPT = (drugA: string, drugB: string) =>
  `You are a clinical pharmacist expert in IV drug compatibility. Based on established pharmaceutical literature (Trissel's Handbook on Injectable Drugs, King Guide to Parenteral Admixtures, Micromedex, and peer-reviewed studies), provide the Y-site IV compatibility between:

Drug A: ${drugA}
Drug B: ${drugB}

Return ONLY valid JSON, no markdown, no prose:
{
  "result": "C" | "I" | "U" | "N",
  "concentrationA": "typical concentration of ${drugA} used in compatibility studies",
  "concentrationB": "typical concentration of ${drugB} used in compatibility studies",
  "diluent": "primary diluent (NS, D5W, etc.)",
  "notes": "clinical summary including mechanism of incompatibility if applicable, time stability, visual changes, or special conditions",
  "references": ["source 1", "source 2"],
  "confidence": "high" | "moderate" | "low"
}

Classification:
- C = Compatible (physically and chemically stable for ≥1 hour at room temperature)
- I = Incompatible (precipitation, turbidity, color change, or significant degradation observed)
- U = Conditional (compatible only under specific conditions — specify in notes)
- N = No Data (insufficient published data; state this explicitly)

Confidence:
- high = well-documented in major references
- moderate = limited studies or extrapolated data
- low = theoretical assessment only`;

async function callGemini(prompt: string): Promise<{ text: string } | { rateLimited: true } | { error: string }> {
  if (!GOOGLE_KEY) return { error: 'No GOOGLE_CSE_KEY' };
  for (let attempt = 0; attempt < 3; attempt++) {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GOOGLE_KEY}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 800, temperature: 0.1 },
        }),
        signal: AbortSignal.timeout(25000),
      }
    );
    if (resp.status === 429) {
      if (attempt < 2) { await new Promise(r => setTimeout(r, 2000 * Math.pow(2, attempt))); continue; }
      return { rateLimited: true };
    }
    if (!resp.ok) return { error: `Gemini ${resp.status}` };
    const data = await resp.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    return { text: data.candidates?.[0]?.content?.parts?.[0]?.text ?? '' };
  }
  return { rateLimited: true };
}

async function callGroq(prompt: string): Promise<{ text: string } | { error: string }> {
  if (!GROQ_KEY) return { error: 'No GROQ_API_KEY' };
  const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${GROQ_KEY}` },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800,
      temperature: 0.1,
    }),
    signal: AbortSignal.timeout(25000),
  });
  if (!resp.ok) return { error: `Groq ${resp.status}` };
  const data = await resp.json() as { choices?: { message?: { content?: string } }[] };
  return { text: data.choices?.[0]?.message?.content ?? '' };
}

function parseResult(raw: string, drugA: string, drugB: string, source: YSiteResult['source']): YSiteResult {
  const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  let parsed: Partial<YSiteResult> = {};
  try { parsed = JSON.parse(stripped); } catch {
    const match = stripped.match(/\{[\s\S]*\}/);
    if (match) { try { parsed = JSON.parse(match[0]); } catch { /* fall through */ } }
  }
  return {
    drugA,
    drugB,
    result: (['C','I','U','N'].includes(parsed.result as string) ? parsed.result : 'N') as YSiteResult['result'],
    concentrationA: parsed.concentrationA || '—',
    concentrationB: parsed.concentrationB || '—',
    diluent: parsed.diluent || '—',
    notes: parsed.notes || 'Unable to parse response. Consult pharmacist.',
    references: Array.isArray(parsed.references) ? parsed.references : [],
    source,
    confidence: (['high','moderate','low'].includes(parsed.confidence as string) ? parsed.confidence : 'low') as YSiteResult['confidence'],
  };
}

export async function POST(req: NextRequest) {
  let drugA: string, drugB: string;
  try {
    ({ drugA, drugB } = await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!drugA?.trim() || !drugB?.trim()) {
    return NextResponse.json({ error: 'drugA and drugB are required.' }, { status: 400 });
  }

  if (!GOOGLE_KEY && !GROQ_KEY) {
    return NextResponse.json({ error: 'No AI API key configured.' }, { status: 503 });
  }

  const prompt = PROMPT(drugA.trim(), drugB.trim());

  // Try Gemini first
  if (GOOGLE_KEY) {
    const r = await callGemini(prompt);
    if ('text' in r) {
      return NextResponse.json(parseResult(r.text, drugA, drugB, 'ai-gemini'));
    }
    if ('error' in r) {
      return NextResponse.json({ error: r.error }, { status: 502 });
    }
    // rate-limited → fall through to Groq
  }

  // Groq fallback
  if (GROQ_KEY) {
    const r = await callGroq(prompt);
    if ('text' in r) {
      return NextResponse.json(parseResult(r.text, drugA, drugB, 'ai-groq'));
    }
    return NextResponse.json({ error: r.error }, { status: 502 });
  }

  return NextResponse.json({ error: 'Gemini rate-limited and no Groq fallback configured.' }, { status: 429 });
}
