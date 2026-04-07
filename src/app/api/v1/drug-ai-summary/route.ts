import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_KEY = process.env.GOOGLE_CSE_KEY;
const GROQ_KEY   = process.env.GROQ_API_KEY;

// Groq is OpenAI-compatible — llama-3.3-70b is fast and accurate for clinical Q&A
const GROQ_MODEL = 'llama-3.3-70b-versatile';

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

/* ── Helpers ────────────────────────────────────────────────────────────── */

function parseJsonSummary(text: string): DrugSummary | null {
  const stripped = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  try { return JSON.parse(stripped) as DrugSummary; } catch { /* fall through */ }
  const match = stripped.match(/\{[\s\S]*\}/);
  if (match) { try { return JSON.parse(match[0]) as DrugSummary; } catch { /* fall through */ } }
  return null;
}

/** Gemini — retries up to maxRetries times on 429. Returns null on persistent 429. */
async function summaryViaGemini(prompt: string, maxRetries = 2): Promise<{ text: string } | { rateLimited: true } | { error: string }> {
  let lastStatus = 0;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GOOGLE_KEY}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 1500, temperature: 0.2 },
        }),
        signal: AbortSignal.timeout(30000),
      }
    );
    lastStatus = resp.status;
    if (resp.status === 429) {
      if (attempt < maxRetries) {
        const retryAfter = resp.headers.get('Retry-After');
        await new Promise(r => setTimeout(r, retryAfter ? parseFloat(retryAfter) * 1000 : 2000 * Math.pow(2, attempt)));
        continue;
      }
      return { rateLimited: true };
    }
    if (!resp.ok) {
      const err = await resp.text();
      return { error: `Gemini ${resp.status}: ${err}` };
    }
    const data = await resp.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    return { text: data.candidates?.[0]?.content?.parts?.[0]?.text ?? '' };
  }
  return { rateLimited: true };
}

/** Groq (OpenAI-compatible) — no streaming needed for summary. */
async function summaryViaGroq(prompt: string): Promise<{ text: string } | { error: string }> {
  if (!GROQ_KEY) return { error: 'GROQ_API_KEY not set' };
  const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'authorization': `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
      temperature: 0.2,
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!resp.ok) {
    const err = await resp.text();
    return { error: `Groq ${resp.status}: ${err}` };
  }
  const data = await resp.json() as { choices?: { message?: { content?: string } }[] };
  return { text: data.choices?.[0]?.message?.content ?? '' };
}

/* ── Route ──────────────────────────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  if (!GOOGLE_KEY && !GROQ_KEY) {
    return NextResponse.json(
      { error: 'AI features require GOOGLE_CSE_KEY or GROQ_API_KEY to be set.' },
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
    let rawText: string | null = null;
    let usedProvider = 'gemini';

    // 1. Try Gemini first
    if (GOOGLE_KEY) {
      const result = await summaryViaGemini(prompt);
      if ('text' in result) {
        rawText = result.text;
      } else if ('rateLimited' in result) {
        // Gemini rate-limited — fall through to Groq
        usedProvider = 'groq (gemini rate-limited)';
      } else {
        return NextResponse.json({ error: result.error }, { status: 502 });
      }
    }

    // 2. Fall back to Groq if Gemini was rate-limited or not configured
    if (rawText === null) {
      if (!GROQ_KEY) {
        return NextResponse.json(
          { error: 'Gemini rate limit reached and no GROQ_API_KEY fallback is configured.' },
          { status: 429 }
        );
      }
      usedProvider = usedProvider.startsWith('groq') ? usedProvider : 'groq';
      const result = await summaryViaGroq(prompt);
      if ('error' in result) {
        return NextResponse.json({ error: result.error }, { status: 502 });
      }
      rawText = result.text;
    }

    const summary = parseJsonSummary(rawText);
    return NextResponse.json({ drug, summary, provider: usedProvider, raw: summary ? undefined : rawText });

  } catch (err) {
    return NextResponse.json({ error: 'AI summary request failed.', detail: String(err) }, { status: 502 });
  }
}
