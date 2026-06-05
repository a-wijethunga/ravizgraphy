import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient as createJSClient } from '@supabase/supabase-js'

export async function getSupabaseClient() {
  try {
    const cookieStore = await cookies()
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore cookie setting errors when called from Server Components
            }
          },
        },
      }
    )
  } catch (error) {
    // Graceful fallback to stateless client for static builds or environments without request context
    return createJSClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
}
