/**
 * Calls the `ai` Supabase edge function (supabase/functions/ai), which forwards the prompt
 * to the LLM. The LLM key lives only on the server, never in the app.
 * The function checks the user's login, so the auth service must be live too.
 */
import { env } from '@/lib/env';
import { getSupabase } from '@/lib/supabase';
import { MAX_PROMPT_LENGTH, type AiService } from './types';

export function createLiveAi(): AiService {
  const supabase = getSupabase();
  return {
    mode: 'live',
    async ask(prompt) {
      const trimmed = prompt.trim();
      if (!trimmed) throw new Error('Prompt is empty');
      if (trimmed.length > MAX_PROMPT_LENGTH) throw new Error('Prompt is too long');
      const { data, error } = await supabase.functions.invoke<{ text: string }>(
        env.aiFunctionName,
        { body: { prompt: trimmed } }
      );
      if (error) throw error;
      return { text: data?.text ?? '' };
    },
  };
}
