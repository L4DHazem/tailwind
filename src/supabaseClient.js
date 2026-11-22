import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://auzpjjtsgxlplcpeduvr.supabase.co'
const supabaseAnonKey = 'sb_publishable_bbzd947Z2ivs_nLXN-6sVA_6ORNTuTi'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
