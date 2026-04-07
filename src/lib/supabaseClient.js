import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lslevdcewgcpcegezerd.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'public-anon-key-placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log("Connection Test - URL:", import.meta.env.VITE_SUPABASE_URL);