import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const initialAuthRedirectError =
  typeof window === 'undefined'
    ? null
    : new URLSearchParams(window.location.hash.slice(1)).get('error_description') ??
      new URLSearchParams(window.location.search).get('error_description');

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabasePublishableKey!, {
      auth: {
        detectSessionInUrl: true,
        flowType: 'implicit',
        persistSession: true,
      },
    })
  : null;
