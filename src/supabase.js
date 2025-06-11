// src/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// ✅ 변수 정의 이후에 console.log() 실행해야 함
console.log('✅ Supabase URL:', supabaseUrl)
console.log('✅ Supabase Key:', supabaseAnonKey)

export const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_KEY
  );
