import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://amainooe-krpqncbkxfuc.supabase.co'
const supabaseAnonKey = 'sb_publishable_jM2CIvvU68L6fjjNh3Dlzw_8JjQR0nu'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
