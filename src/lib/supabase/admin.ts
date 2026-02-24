import { createClient } from '@supabase/supabase-js'

/**
 * Server-side only Supabase admin client.
 * Uses the service role key — bypasses RLS entirely.
 * NEVER import this in client components or expose to the browser.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
