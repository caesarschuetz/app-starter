import { createMockAi, mockAnswer } from '../ai/mock';
import { createMockAuth } from '../auth/mock';
import { createMockPurchases, MOCK_PACKAGES } from '../purchases/mock';
import { createMockStorage } from '../storage/mock';

describe('mock auth', () => {
  it('signs in, persists, notifies listeners and signs out', async () => {
    const storage = createMockStorage();
    const auth = createMockAuth(storage);
    const seen: (string | null)[] = [];
    auth.onChange((s) => seen.push(s?.user.email ?? null));

    const session = await auth.signInWithEmail(' User@Example.com ', 'secret1');
    expect(session.user.email).toBe('user@example.com');
    // A fresh instance with the same storage restores the session (like an app reload).
    expect((await createMockAuth(storage).getSession())?.user.id).toBe('mock-user');

    await auth.signOut();
    expect(await auth.getSession()).toBeNull();
    expect(seen).toEqual(['user@example.com', null]);
  });

  it('rejects short passwords', async () => {
    await expect(
      createMockAuth(createMockStorage()).signInWithEmail('a@example.com', '123')
    ).rejects.toThrow();
  });

  it('supports continue without account', async () => {
    const session = await createMockAuth(createMockStorage()).continueAsGuest();
    expect(session.user.isAnonymous).toBe(true);
  });
});

describe('mock purchases', () => {
  it('unlocks pro on purchase and notifies listeners', async () => {
    const purchases = createMockPurchases();
    const listener = jest.fn();
    purchases.onChange(listener);
    expect(await purchases.isPro()).toBe(false);
    expect(await purchases.purchase(MOCK_PACKAGES[0].id)).toBe(true);
    expect(await purchases.isPro()).toBe(true);
    expect(await purchases.restore()).toBe(true);
    expect(listener).toHaveBeenCalledWith(true);
  });

  it('rejects unknown packages', async () => {
    await expect(createMockPurchases().purchase('nope')).rejects.toThrow();
  });
});

describe('mock ai', () => {
  it('returns a canned answer after a short delay', async () => {
    jest.useFakeTimers();
    const promise = createMockAi().ask('  Hello?  ');
    jest.runAllTimers();
    await expect(promise).resolves.toEqual({ text: mockAnswer('Hello?') });
    jest.useRealTimers();
  });

  it('rejects an empty prompt', async () => {
    await expect(createMockAi().ask('   ')).rejects.toThrow('Prompt is empty');
  });
});
