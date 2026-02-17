import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * DEBUG ENDPOINT - Check what profiles exist in database
 * GET /api/admin/debug/profiles
 */
export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
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
            } catch {}
          },
        },
      }
    )

    // Get all clients and their profiles
    const { data: clients, error: clientError } = await supabase
      .from('clients')
      .select('id, name, email')
      .limit(10)

    if (clientError) {
      return NextResponse.json(
        { error: 'Failed to fetch clients', details: clientError.message },
        { status: 400 }
      )
    }

    // Get all profiles
    const { data: profiles, error: profileError } = await supabase
      .from('client_profiles')
      .select('*')
      .limit(10)

    if (profileError) {
      return NextResponse.json(
        { error: 'Failed to fetch profiles', details: profileError.message },
        { status: 400 }
      )
    }

    // For each client, show if profile exists
    const clientsWithProfiles = clients?.map((client) => {
      const profile = profiles?.find((p) => p.client_id === client.id)
      return {
        client_id: client.id,
        client_name: client.name,
        client_email: client.email,
        has_profile: !!profile,
        profile_data: profile || null,
      }
    })

    return NextResponse.json({
      total_clients: clients?.length || 0,
      total_profiles: profiles?.length || 0,
      clients_with_profiles: clientsWithProfiles,
      raw_profiles: profiles,
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
