import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://kaveesimezonkgvhcbln.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_jMkylJ63HYD0eOus9ADuJg_6y-33Up_';

/** Token sesi LapakQ (dibuat database saat login; hanya hash-nya yang disimpan di server). */
export const SESSION_TOKEN_KEY = 'lapakq_session_token';

export const getSessionToken = (): string | null => {
  try {
    return localStorage.getItem(SESSION_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setSessionToken = (token: string | null | undefined): void => {
  try {
    if (token) localStorage.setItem(SESSION_TOKEN_KEY, token);
    else localStorage.removeItem(SESSION_TOKEN_KEY);
  } catch {}
};

/**
 * Kirim token sesi di header `x-lapakq-session` pada setiap permintaan database (PostgREST).
 * Database memakainya untuk mengenali pemanggil (app_private.session_user_id) pada aturan RLS.
 * Tidak dikirim ke layanan Auth/Storage agar tidak mengganggu aturan CORS mereka.
 */
const fetchWithSession: typeof fetch = (input: RequestInfo | URL, init: RequestInit = {}) => {
  const token = getSessionToken();
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  if (!token || !url.includes('/rest/v1/')) return fetch(input, init);
  const headers = new Headers(init.headers || (input instanceof Request ? input.headers : undefined));
  headers.set('x-lapakq-session', token);
  return fetch(input, { ...init, headers });
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { fetch: fetchWithSession },
});

/**
 * Sign In / Sign Up with real Google OAuth via Supabase
 */
export const signInWithGoogleOAuth = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) throw error;
    return data;
  } catch (err: any) {
    console.error('Google OAuth error:', err);
    throw err;
  }
};
