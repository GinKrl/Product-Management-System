import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://localhost:54321'
const supabaseAnonKey = 'test-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
