import { createClient } from '@supabase/supabase-js';

// Esses valores você pega no painel do Supabase (Settings → API)
const SUPABASE_URL = "https://htjzdscrdqoojyeioafy.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_tjiTzz1EGbZ5wOiT9sbjVg_XQxW4STK";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
