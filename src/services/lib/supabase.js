import { createClient } from '@supabase/supabase-js';

// O Vite expõe automaticamente variáveis do .env com o prefixo VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);