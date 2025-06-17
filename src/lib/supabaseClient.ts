import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL // ganti dengan URL Supabase
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY // ambil dari Supabase dashboard

export const supabase = createClient(supabaseUrl, supabaseKey)
