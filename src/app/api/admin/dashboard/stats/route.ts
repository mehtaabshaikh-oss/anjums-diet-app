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

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get total clients
    const { count: totalClients } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })

    // Get active clients (status = 'active')
    const { count: activeClients } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // Get logs submitted today
    const today = new Date().toISOString().split('T')[0]
    const { count: logsSubmittedToday } = await supabase
      .from('diet_logs')
      .select('*', { count: 'exact', head: true })
      .eq('logged_date', today)
      .eq('status', 'submitted')

    // Get upcoming appointments (next 7 days)
    const now = new Date()
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const { data: appointmentsData, count: upcomingAppointments } = await supabase
      .from('clients')
      .select('id, name, nutritionist, next_appointment_date', { count: 'exact' })
      .gte('next_appointment_date', now.toISOString())
      .lte('next_appointment_date', sevenDaysLater.toISOString())
      .order('next_appointment_date', { ascending: true })

    return NextResponse.json({
      totalClients: totalClients || 0,
      activeClients: activeClients || 0,
      logsSubmittedToday: logsSubmittedToday || 0,
      upcomingAppointments: upcomingAppointments || 0,
      appointments: appointmentsData || [],
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
