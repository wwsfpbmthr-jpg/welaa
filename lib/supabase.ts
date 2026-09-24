import {createClient} from '@supabase/supabase-js';

// Supabase publishable keys are intended for browser use. Keep provider secrets
// (including the Facebook App Secret) in Supabase Auth settings only.
export const supabase=createClient(
  'https://vhxcxsklfqbpncssoyfq.supabase.co',
  'sb_publishable_BW7cIDFRVLyl_oJJp9Zisw_HbHOqKDK',
);
