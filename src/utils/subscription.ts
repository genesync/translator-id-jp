import { supabase } from '../lib/supabaseClient';

export async function checkUserAccess() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { isPro: false, reason: 'not_logged_in' };

  const meta = data.user.user_metadata || {};
  const plan = meta.plan || 'free';
  const expiresAt = meta.expires_at ? new Date(meta.expires_at) : null;

  const now = new Date();
  const isExpired = expiresAt && expiresAt < now;

  const isPro = plan === 'lifetime' || (!isExpired && (plan === 'monthly' || plan === 'annual'));

  return { isPro, plan, expiresAt, isExpired };
}