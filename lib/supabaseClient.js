import { createClient } from '@supabase/supabase-js';

// O Next.js usa process.env.NEXT_PUBLIC_
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Verifica se as variáveis estão no teu ficheiro .env.local
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("!!! Erro: Variáveis do Supabase não encontradas.");
  console.error("Verifique se NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY estão no seu .env.local");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);