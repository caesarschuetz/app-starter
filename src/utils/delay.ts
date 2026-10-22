/** Resolves after `ms` milliseconds. Used by mocks to feel like a real network call. */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
