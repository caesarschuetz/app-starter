/** Canned answers after a short delay, so the AI screen works offline. */
import { delay } from '@/utils/delay';
import { MAX_PROMPT_LENGTH, type AiService } from './types';

export const MOCK_AI_DELAY_MS = 600;

export function mockAnswer(prompt: string): string {
  const preview = prompt.trim().slice(0, 80);
  return (
    `This is a mock answer. Turn on the AI service in src/config/services.ts to get real responses.\n\n` +
    `You asked: "${preview}"`
  );
}

export function createMockAi(): AiService {
  return {
    mode: 'mock',
    async ask(prompt) {
      const trimmed = prompt.trim();
      if (!trimmed) throw new Error('Prompt is empty');
      if (trimmed.length > MAX_PROMPT_LENGTH) throw new Error('Prompt is too long');
      await delay(MOCK_AI_DELAY_MS);
      return { text: mockAnswer(trimmed) };
    },
  };
}
