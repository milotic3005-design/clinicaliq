import { NextRequest } from 'next/server';

const GOOGLE_KEY = process.env.GOOGLE_CSE_KEY;

interface Message { role: 'user' | 'assistant'; content: string; }

/** Fetch Gemini streaming with up to `maxRetries` retries on 429. */
async function fetchGeminiStream(body: string, maxRetries = 3): Promise<Response> {
  let lastResp: Response | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?key=${GOOGLE_KEY}&alt=sse`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body,
      }
    );
    if (resp.status !== 429) return resp;
    lastResp = resp;
    if (attempt < maxRetries) {
      const retryAfter = resp.headers.get('Retry-After');
      const waitMs = retryAfter ? parseFloat(retryAfter) * 1000 : 2000 * Math.pow(2, attempt);
      await new Promise(r => setTimeout(r, waitMs));
    }
  }
  return lastResp!;
}

export async function POST(req: NextRequest) {
  if (!GOOGLE_KEY) {
    return new Response(
      JSON.stringify({ error: 'AI features require a GOOGLE_CSE_KEY environment variable.' }),
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

  // Convert messages to Gemini format (role: "user" | "model")
  const geminiContents = messages.slice(-20).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  try {
    const geminiResp = await fetchGeminiStream(JSON.stringify({
      systemInstruction: { parts: [{ text: systemText }] },
      contents: geminiContents,
      generationConfig: { maxOutputTokens: 1500, temperature: 0.3 },
    }));

    if (geminiResp.status === 429) {
      return new Response(
        JSON.stringify({ error: 'Gemini rate limit reached. Please wait a moment and try again.' }),
        { status: 429, headers: { 'content-type': 'application/json' } }
      );
    }

    if (!geminiResp.ok) {
      const errText = await geminiResp.text();
      return new Response(JSON.stringify({ error: `Gemini error ${geminiResp.status}`, detail: errText }), {
        status: 502, headers: { 'content-type': 'application/json' },
      });
    }

    // Normalize Gemini SSE → Anthropic-compatible SSE so the client parser is unchanged
    const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
    const writer = writable.getWriter();
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
              const parsed = JSON.parse(raw) as {
                candidates?: { content?: { parts?: { text?: string }[] } }[];
              };
              const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
              if (text) {
                // Emit in Anthropic content_block_delta format (client already parses this)
                const out = JSON.stringify({
                  type: 'content_block_delta',
                  delta: { type: 'text_delta', text },
                });
                await writer.write(encoder.encode(`data: ${out}\n\n`));
              }
            } catch { /* skip malformed line */ }
          }
        }
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: {
        'content-type': 'text/event-stream',
        'cache-control': 'no-cache, no-transform',
        'x-accel-buffering': 'no',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Chat request failed.', detail: String(err) }), {
      status: 502, headers: { 'content-type': 'application/json' },
    });
  }
}
