import { createClient } from '@supabase/supabase-js'

// Configuración de ejemplo para desarrollo local
// Estas variables serán reemplazadas cuando se conecte con Supabase real
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)