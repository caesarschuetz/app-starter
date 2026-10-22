import { createClient, type User } from 'npm:@supabase/supabase-js@2';

/**
 * Returns the signed-in user for this request, or null.
 * Verifies the JWT from the Authorization header against Supabase Auth.
 * SUPABASE_URL and SUPABASE_ANON_KEY are provided automatically in deployed functions.
 */
export async function getUser(req: Request): Promise<User | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data, error } = await supabase.auth.getUser(authHeader.slice('Bearer '.length));
  if (error) return null;
  return data.user;
}
