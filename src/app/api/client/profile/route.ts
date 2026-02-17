import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
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

    // Get client_id from query params
    const url = new URL(req.url)
    const clientId = url.searchParams.get('client_id')

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
    }

    // Get client details
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select(`
        id,
        name,
        email,
        phone,
        package,
        status,
        start_date,
        end_date,
        next_appointment_date,
        client_profiles(*)
      `)
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // Get weight logs for this client
    const { data: weightLogs } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('client_id', clientId)
      .order('logged_date', { ascending: true })

    // Get measurements logs for this client
    const { data: measurementsLogs } = await supabase
      .from('measurements_logs')
      .select('*')
      .eq('client_id', clientId)
      .order('logged_date', { ascending: true })

    const profile = client.client_profiles && Array.isArray(client.client_profiles)
      ? client.client_profiles[0]
      : client.client_profiles

    if (!profile) {
      console.warn(`No profile found for client ${clientId}. Client_profiles data:`, client.client_profiles)
    }

    return NextResponse.json({
      ...client,
      client_profiles: profile || null,
      weight_logs: weightLogs || [],
      measurements_logs: measurementsLogs || [],
    })
  } catch (error) {
    console.error('Error fetching client profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
