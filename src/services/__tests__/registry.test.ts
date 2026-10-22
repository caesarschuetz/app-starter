import { SERVICE_MODE, type ServiceName } from '@/config/services';
import type { Env } from '@/lib/env';
import { activeModes, buildServices, liveBlocker, services } from '@/services';

const NAMES: ServiceName[] = ['auth', 'purchases', 'ai', 'monitoring', 'analytics'];

const EMPTY_ENV: Env = {
  supabaseUrl: undefined,
  supabaseAnonKey: undefined,
  aiFunctionName: 'ai',
  revenueCatIosKey: undefined,
  revenueCatAndroidKey: undefined,
  revenueCatEntitlement: 'pro',
  sentryDsn: undefined,
  amplitudeApiKey: undefined,
};

const ALL_LIVE = Object.fromEntries(NAMES.map((n) => [n, 'live'])) as Record<ServiceName, 'live'>;

describe('service registry', () => {
  it('ships with every service set to mock', () => {
    for (const name of NAMES) expect(SERVICE_MODE[name]).toBe('mock');
  });

  it('resolves every service to its mock with no env vars', () => {
    expect(activeModes(services)).toEqual({
      auth: 'mock',
      purchases: 'mock',
      ai: 'mock',
      monitoring: 'mock',
      analytics: 'mock',
    });
  });

  it("falls back to mock with one warning per service when 'live' has no keys", () => {
    const warn = jest.fn();
    const built = buildServices({
      modes: ALL_LIVE,
      env: EMPTY_ENV,
      platform: 'ios',
      expoGo: false,
      warn,
    });
    for (const name of NAMES) expect(built[name].mode).toBe('mock');
    expect(warn).toHaveBeenCalledTimes(NAMES.length);
    for (const name of NAMES) {
      expect(warn).toHaveBeenCalledWith(expect.stringContaining(`"${name}" is set to 'live'`));
    }
  });

  it('keeps RevenueCat on mock in Expo Go even with keys', () => {
    const env = { ...EMPTY_ENV, revenueCatIosKey: 'test_key' };
    expect(liveBlocker('purchases', { env, platform: 'ios', expoGo: true })).toMatch(/Expo Go/);
    expect(liveBlocker('purchases', { env, platform: 'ios', expoGo: false })).toBeNull();
    expect(liveBlocker('purchases', { env, platform: 'android', expoGo: false })).toMatch(
      /ANDROID/
    );
  });

  it('allows live auth and ai once Supabase keys exist', () => {
    const env = { ...EMPTY_ENV, supabaseUrl: 'https://example.test', supabaseAnonKey: 'anon' };
    expect(liveBlocker('auth', { env, platform: 'ios', expoGo: true })).toBeNull();
    expect(liveBlocker('ai', { env, platform: 'ios', expoGo: true })).toBeNull();
  });

  it('falls back to mock when a live implementation throws on start', () => {
    jest.doMock('../analytics/live', () => ({
      createLiveAnalytics: () => {
        throw new Error('boom');
      },
    }));
    const warn = jest.fn();
    const built = buildServices({
      modes: { ...SERVICE_MODE, analytics: 'live' },
      env: { ...EMPTY_ENV, amplitudeApiKey: 'key' },
      warn,
    });
    expect(built.analytics.mode).toBe('mock');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('failed to start live'));
    jest.dontMock('../analytics/live');
  });
});
