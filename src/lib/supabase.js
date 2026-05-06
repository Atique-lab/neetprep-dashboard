import { createClient } from '@supabase/supabase-js'

// Using the keys provided by the user
const supabaseUrl = 'https://amainooe-krpqncbkxfuc.supabase.co'
const supabaseAnonKey = 'sb_publishable_jM2CIvvU68L6fjjNh3Dlzw_8JjQR0nu'

console.log("Initializing Supabase with URL:", supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Diagnostic check
supabase.from('tasks').select('count', { count: 'exact', head: true })
  .then(({ error }) => {
    if (error) {
      console.error("Supabase Connection Error:", error.message);
      console.error("Error Code:", error.code);
      console.error("Full Error:", error);
    } else {
      console.log("Supabase Connected Successfully!");
    }
  });
