import type { ServiceMode } from '@/config/services';

export type AiAnswer = { text: string };

export const MAX_PROMPT_LENGTH = 4000;

export interface AiService {
  readonly mode: ServiceMode;
  /** Sends a prompt to the LLM and resolves with its answer. Throws on empty prompt or error. */
  ask(prompt: string): Promise<AiAnswer>;
}
