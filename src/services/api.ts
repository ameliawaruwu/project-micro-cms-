// Central Data Service & Supabase Connector for Kroombox Frontend
import { supabase } from './supabaseClient';

export { supabase };

/**
 * Kroombox Client-Side Architecture
 * - Database & Auth: Supabase (BaaS)
 * - Local Caching: LocalStorage Fallback & Realtime Sync
 */
export const isSupabaseConfigured = (): boolean => {
  const url = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const key = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
  return Boolean(url && key && !url.includes('example'));
};
