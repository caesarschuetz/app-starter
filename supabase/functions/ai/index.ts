// AI proxy: the app sends { prompt }, this function asks Gemini and returns { text }.
// The Gemini key stays on the server. Only signed-in users (incl. anonymous) may call it.
//
// Secrets:  supabase secrets set GEMINI_API_KEY=... [GEMINI_MODEL=gemini-3.6-flash]
// Deploy:   supabase functions deploy ai
import { getUser } from '../_shared/auth.ts';
import { handleCors } from '../_shared/cors.ts';
import { json, requireEnv } from '../_shared/http.ts';

const DEFAULT_MODEL = 'gemini-3.6-flash';
const MAX_PROMPT_LENGTH = 4000;

// Change this to give your app its own personality / rules.
const SYSTEM_PROMPT = 'You are a helpful assistant inside a mobile app. Answer briefly and clearly.';

Deno.serve(async (req) => {
  const preflight = handleCors(req);
  if (preflight) return preflight;
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const user = await getUser(req);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  let prompt: unknown;
  try {
    ({ prompt } = await req.json());
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }
  if (typeof prompt !== 'string' || !prompt.trim()) return json({ error: 'prompt is required' }, 400);
  if (prompt.length > MAX_PROMPT_LENGTH) return json({ error: 'prompt is too long' }, 400);

  try {
    const apiKey = requireEnv('GEMINI_API_KEY');
    const model = Deno.env.get('GEMINI_MODEL') || DEFAULT_MODEL;
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text: prompt.trim() }] }],
        }),
      }
    );
    if (!res.ok) {
      console.error('[ai] Gemini error', res.status, await res.text());
      return json({ error: 'Upstream model error' }, 502);
    }
    const data = await res.json();
    const text: string =
      data?.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p.text ?? '')
        .join('') ?? '';
    return json({ text });
  } catch (error) {
    console.error('[ai] failed', error);
    return json({ error: 'Internal error' }, 500);
  }
});
