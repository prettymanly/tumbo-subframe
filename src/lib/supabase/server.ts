import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export const createServer = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
