import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vhxcxsklfqbpncssoyfq.supabase.co';
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_BW7cIDFRVLyl_oJJp9Zisw_HbHOqKDK';

export const supabase = createClient<Database>(projectUrl, publishableKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
