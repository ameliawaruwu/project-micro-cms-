import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://kaveesimezonkgvhcbln.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_jMkylJ63HYD0eOus9ADuJg_6y-33Up_';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
