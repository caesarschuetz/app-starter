// RevenueCat webhook: keeps public.profiles.is_pro in sync with the user's subscription.
// The app uses the Supabase user id as RevenueCat app_user_id (services.purchases.identify).
//
// RevenueCat dashboard -> Integrations -> Webhooks: URL = <SUPABASE_URL>/functions/v1/revenuecat-webhook,
// Authorization header = the same value as REVENUECAT_WEBHOOK_SECRET.
// Secrets:  supabase secrets set REVENUECAT_WEBHOOK_SECRET=...
// Deploy:   supabase functions deploy revenuecat-webhook --no-verify-jwt
//           (RevenueCat sends its own secret, not a Supabase JWT.)
import { createClient } from 'npm:@supabase/supabase-js@2';
import { json, requireEnv } from '../_shared/http.ts';

const ENTITLEMENT_ID = Deno.env.get('REVENUECAT_ENTITLEMENT') || 'pro';

// Events that grant / remove access. Others (e.g. TEST, TRANSFER) are acknowledged only.
const GRANT = new Set(['INITIAL_PURCHASE', 'RENEWAL', 'UNCANCELLATION', 'PRODUCT_CHANGE', 'NON_RENEWING_PURCHASE']);
const REVOKE = new Set(['EXPIRATION']);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const secret = requireEnv('REVENUECAT_WEBHOOK_SECRET');
  const header = req.headers.get('Authorization') ?? '';
  if (header !== secret && header !== `Bearer ${secret}`) return json({ error: 'Unauthorized' }, 401);

  const body = await req.json().catch(() => null);
  const event = body?.event;
  if (!event?.type) return json({ error: 'Invalid payload' }, 400);

  const userId: string | undefined = event.app_user_id;
  const entitlements: string[] = event.entitlement_ids ?? [];
  const relevant = entitlements.length === 0 || entitlements.includes(ENTITLEMENT_ID);
  const isPro = GRANT.has(event.type) ? true : REVOKE.has(event.type) ? false : null;

  // Anonymous RevenueCat ids ($RCAnonymousID:...) cannot be mapped to a profile.
  if (isPro === null || !relevant || !userId || !UUID.test(userId)) {
    return json({ ok: true, skipped: true });
  }

  const admin = createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'));
  const { error } = await admin.from('profiles').update({ is_pro: isPro }).eq('id', userId);
  if (error) {
    console.error('[revenuecat-webhook] update failed', error);
    return json({ error: 'Database error' }, 500);
  }
  return json({ ok: true, is_pro: isPro });
});
