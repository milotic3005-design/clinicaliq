import { NextRequest } from 'next/server';

const GOOGLE_KEY = process.env.GOOGLE_CSE_KEY;
const GROQ_KEY   = process.env.GROQ_API_KEY;
const GROQ_MODEL = 'llama-3.3-70b-versatile';

interface Message { role: 'user' | 'assistant'; content: string; }

/* ── Gemini streaming (retries on 429) ──────────────────────────────────── */
async function fetchGeminiStream(body: string, maxRetries = 2): Promise<Response | null> {
  let lastResp: Response | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:streamGenerateContent?key=${GOOGLE_KEY}&alt=sse`,
      { method: 'POST', headers: { 'content-type': 'application/json' }, body }
    );
    if (resp.status !== 429) return resp;
    lastResp = resp;
    if (attempt < maxRetries) {
      const retryAfter = resp.headers.get('Retry-After');
      await new Promise(r => setTimeout(r, retryAfter ? parseFloat(retryAfter) * 1000 : 2000 * Math.pow(2, attempt)));
    }
  }
  // All retries exhausted — return the last 429 response so caller can fall back
  return lastResp;
}

/* ── Gemini SSE → Anthropic-compatible SSE transform ───────────────────── */
function geminiToAnthropicStream(geminiResp: Response): Response {
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer  = writable.getWriter();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  (async () => {
    const reader = geminiResp.body!.getReader();
    let buffer = '';
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (!raw || raw === '[DONE]') continue;
          try {
            const parsed = JSON.parse(raw) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
            const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
            if (text) {
              const out = JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text } });
              await writer.write(encoder.encode(`data: ${out}\n\n`));
            }
          } catch { /* skip malformed chunk */ }
        }
      }
    } finally { await writer.close(); }
  })();

  return new Response(readable, {
    headers: { 'content-type': 'text/event-stream', 'cache-control': 'no-cache, no-transform', 'x-accel-buffering': 'no' },
  });
}

/* ── Groq streaming (OpenAI SSE) → Anthropic-compatible SSE ────────────── */
function groqToAnthropicStream(groqResp: Response): Response {
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer  = writable.getWriter();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  (async () => {
    const reader = groqResp.body!.getReader();
    let buffer = '';
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (!raw || raw === '[DONE]') continue;
          try {
            const parsed = JSON.parse(raw) as { choices?: { delta?: { content?: string } }[] };
            const text = parsed.choices?.[0]?.delta?.content ?? '';
            if (text) {
              const out = JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text } });
              await writer.write(encoder.encode(`data: ${out}\n\n`));
            }
          } catch { /* skip malformed chunk */ }
        }
      }
    } finally { await writer.close(); }
  })();

  return new Response(readable, {
    headers: { 'content-type': 'text/event-stream', 'cache-control': 'no-cache, no-transform', 'x-accel-buffering': 'no' },
  });
}

/* ── Route ──────────────────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  if (!GOOGLE_KEY && !GROQ_KEY) {
    return new Response(
      JSON.stringify({ error: 'AI chat requires GOOGLE_CSE_KEY or GROQ_API_KEY to be set.' }),
      { status: 503, headers: { 'content-type': 'application/json' } }
    );
  }

  let drug: string, messages: Message[], context: string;
  try {
    ({ drug, messages, context } = await req.json());
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body.' }), {
      status: 400, headers: { 'content-type': 'application/json' },
    });
  }

  if (!drug || !Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: 'drug and messages[] required.' }), {
      status: 400, headers: { 'content-type': 'application/json' },
    });
  }

  const systemText = [
    `You are an expert clinical pharmacist AI assistant specializing in ${drug}.`,
    `Answer questions accurately using evidence-based clinical data from FDA package inserts, clinical guidelines, and pharmacology references.`,
    `Be concise and clinically precise. Use bullet points for lists.`,
    `End every response with: "⚕️ Always verify with a licensed pharmacist or prescriber for patient-specific decisions."`,
    context ? `\nContext from search results about ${drug}:\n${context.slice(0, 3000)}` : '',
  ].filter(Boolean).join('\n');

  try {
    // ── 1. Try Gemini first ──────────────────────────────────────────────
    if (GOOGLE_KEY) {
      const geminiContents = messages.slice(-20).map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const geminiResp = await fetchGeminiStream(JSON.stringify({
        systemInstruction: { parts: [{ text: systemText }] },
        contents: geminiContents,
        generationConfig: { maxOutputTokens: 1500, temperature: 0.3 },
      }));

      if (geminiResp && geminiResp.status !== 429) {
        if (!geminiResp.ok) {
          const errText = await geminiResp.text();
          return new Response(JSON.stringify({ error: `Gemini error ${geminiResp.status}`, detail: errText }), {
            status: 502, headers: { 'content-type': 'application/json' },
          });
        }
        return geminiToAnthropicStream(geminiResp);
      }
      // 429 — fall through to Groq
    }

    // ── 2. Groq fallback ─────────────────────────────────────────────────
    if (!GROQ_KEY) {
      return new Response(
        JSON.stringify({ error: 'Gemini rate limit reached. No GROQ_API_KEY fallback configured.' }),
        { status: 429, headers: { 'content-type': 'application/json' } }
      );
    }

    const groqMessages = [
      { role: 'system', content: systemText },
      ...messages.slice(-20).map((m) => ({ role: m.role, content: m.content })),
    ];

    const groqResp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'authorization': `Bearer ${GROQ_KEY}` },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: groqMessages,
        max_tokens: 1500,
        temperature: 0.3,
        stream: true,
      }),
    });

    if (!groqResp.ok) {
      const errText = await groqResp.text();
      return new Response(JSON.stringify({ error: `Groq error ${groqResp.status}`, detail: errText }), {
        status: 502, headers: { 'content-type': 'application/json' },
      });
    }

    return groqToAnthropicStream(groqResp);

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Chat request failed.', detail: String(err) }), {
      status: 502, headers: { 'content-type': 'application/json' },
    });
  }
}
