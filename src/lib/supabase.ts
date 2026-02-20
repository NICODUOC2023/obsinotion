// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las credenciales de Supabase en el archivo .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para TypeScript
export interface Folder {
  id: string;
  name: string;
  color: string;
  user_id: string;
  created_at?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  folder_id: string | null;
  user_id: string;
  created_at?: string;
  updated_at?: string;
  is_favorite?: boolean;
}
