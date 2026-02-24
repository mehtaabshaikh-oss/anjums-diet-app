import { requireAdmin } from '@/lib/auth/requireAdmin'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const adminAuth = await requireAdmin()
  if (!adminAuth.authorized) return adminAuth.response

  try {
    const startTime = Date.now()
    console.log('[STATS] Starting stats fetch...')

    const supabase = createAdminClient()

    // Get total clients
    console.time('[STATS-Q1] Total Clients Count')
    const { count: totalClients } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
    console.timeEnd('[STATS-Q1] Total Clients Count')
    console.log(`[STATS-Q1] Total clients: ${totalClients}`)

    // Get active clients (status = 'active')
    console.time('[STATS-Q2] Active Clients Count')
    const { count: activeClients } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
    console.timeEnd('[STATS-Q2] Active Clients Count')
    console.log(`[STATS-Q2] Active clients: ${activeClients}`)

    // Get logs submitted today
    console.time('[STATS-Q3] Diet Logs Today')
    const today = new Date().toISOString().split('T')[0]
    const { count: logsSubmittedToday } = await supabase
      .from('diet_logs')
      .select('*', { count: 'exact', head: true })
      .eq('logged_date', today)
      .eq('status', 'submitted')
    console.timeEnd('[STATS-Q3] Diet Logs Today')
    console.log(`[STATS-Q3] Logs submitted today: ${logsSubmittedToday}`)

    // Get upcoming appointments (next 7 days)
    console.time('[STATS-Q4] Upcoming Appointments')
    const now = new Date()
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const { data: appointmentsData, count: upcomingAppointments } = await supabase
      .from('clients')
      .select('id, name, nutritionist, next_appointment_date', { count: 'exact' })
      .gte('next_appointment_date', now.toISOString())
      .lte('next_appointment_date', sevenDaysLater.toISOString())
      .order('next_appointment_date', { ascending: true })
    console.timeEnd('[STATS-Q4] Upcoming Appointments')
    console.log(`[STATS-Q4] Fetched ${appointmentsData?.length || 0} upcoming appointments`)

    const response = {
      totalClients: totalClients || 0,
      activeClients: activeClients || 0,
      logsSubmittedToday: logsSubmittedToday || 0,
      upcomingAppointments: upcomingAppointments || 0,
      appointments: appointmentsData || [],
    }

    const totalTime = Date.now() - startTime
    const payloadSize = JSON.stringify(response).length
    console.log(`[STATS] Total time: ${totalTime}ms`)
    console.log(`[STATS] Payload size: ${payloadSize} bytes (~${(payloadSize / 1024).toFixed(1)}KB)`)

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
