import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJwt } from '@/lib/auth/jwt'

export async function GET(req: Request) {
  try {
    const supabase = createAdminClient()

    // Verify JWT token
    const cookieStore = await cookies()
    const token = cookieStore.get('client_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyJwt(token)
    if (!payload?.clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clientId = payload.clientId

    // Get client details
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select(`
        id,
        name,
        email,
        phone,
        package,
        duration_months,
        nutritionist,
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
