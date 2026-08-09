import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export interface AuthResult {
  error: string | null;
}

/**
 * Redirects to Google's consent screen once Supabase is configured with a Google
 * provider (see https://supabase.com/docs/guides/auth/social-login/auth-google).
 * That redirect means this promise only resolves on the *current* page in demo
 * mode (no Supabase configured) or if the OAuth call itself fails before redirecting —
 * a real deployment will need an `/auth/callback` route to complete the round trip.
 */
export async function signInWithGoogle(): Promise<AuthResult> {
  if (!supabase) return { error: null };

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });

  return { error: error?.message ?? null };
}

/** Sends a one-time SMS code via Supabase's configured SMS provider. */
export async function requestPhoneOtp(phone: string): Promise<AuthResult> {
  if (!supabase) return { error: null };

  const { error } = await supabase.auth.signInWithOtp({ phone });

  return { error: error?.message ?? null };
}

/** Verifies the SMS code entered by the user and completes sign-in. */
export async function verifyPhoneOtp(phone: string, token: string): Promise<AuthResult> {
  if (!supabase) return { error: null };

  const { error } = await supabase.auth.verifyOtp({ phone, token, type: "sms" });

  return { error: error?.message ?? null };
}

export { isSupabaseConfigured };
