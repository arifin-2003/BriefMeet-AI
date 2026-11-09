import { createClient } from '@supabase/supabase-js';

function initializeSupabase() {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

  try {
    const parsedUrl = new URL(url);
    if (
      !['https:', 'http:'].includes(parsedUrl.protocol) ||
      parsedUrl.username || parsedUrl.password || parsedUrl.search || parsedUrl.hash ||
      !/^sb_publishable_[A-Za-z0-9_-]+$/.test(publishableKey || '')
    ) {
      return null;
    }

    return createClient(url, publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'implicit',
      },
    });
  } catch {
    // Never expose configuration values or SDK errors to the console or UI.
    return null;
  }
}

// Consumers must check availability before calling Supabase APIs.
// Valid syntax does not verify credentials or connectivity to the project.
export const supabase = initializeSupabase();
export const isSupabaseConfigured = supabase !== null;

if (import.meta.env.DEV && !isSupabaseConfigured) {
  console.warn('Supabase is unavailable: check VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
}
