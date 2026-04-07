import { NextRequest } from 'next/server';

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  if (!ANTHROPIC_KEY) {
    return new Response(
      JSON.stringify({ error: 'AI features require an ANTHROPIC_API_KEY environment variable.' }),
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

  const systemPrompt = [
    `You are an expert clinical pharmacist AI assistant specializing in ${drug}.`,
    `Answer questions accurately using evidence-based clinical data from FDA package inserts, clinical guidelines, and pharmacology references.`,
    `Be concise and clinically precise. Use bullet points for lists. Always note when information is dose- or patient-specific.`,
    `End every response with: "⚕️ Always verify with a licensed pharmacist or prescriber for patient-specific decisions."`,
    context ? `\nContext from search results about ${drug}:\n${context.slice(0, 3000)}` : '',
  ].filter(Boolean).join('\n');

  try {
    const anthropicResp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        stream: true,
        system: systemPrompt,
        messages: messages.slice(-20).map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!anthropicResp.ok) {
      const errText = await anthropicResp.text();
      return new Response(JSON.stringify({ error: `Anthropic error ${anthropicResp.status}`, detail: errText }), {
        status: 502, headers: { 'content-type': 'application/json' },
      });
    }

    // Stream Anthropic SSE → client
    return new Response(anthropicResp.body, {
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
