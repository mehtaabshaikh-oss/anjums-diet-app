import { requireAdmin } from '@/lib/auth/requireAdmin'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { appCache } from '@/lib/cache'

export async function GET(req: Request) {
  const adminAuth = await requireAdmin()
  if (!adminAuth.authorized) return adminAuth.response

  try {
    const startTime = Date.now()
    const enableLogs = process.env.ENABLE_PERF_LOGS === 'true'
    if (enableLogs) console.log('[STATS] Starting stats fetch...')

    const cacheKey = 'admin_stats_dashboard'
    const cachedStats = appCache.get(cacheKey)
    if (cachedStats) {
      if (enableLogs) console.log(`[STATS] Cache hit! Time: ${Date.now() - startTime}ms`)
      return NextResponse.json(cachedStats)
    }

    const supabase = createAdminClient()

    const today = new Date().toISOString().split('T')[0]
    const now = new Date()
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    if (enableLogs) console.time('[STATS] DB Queries')
    // Run all Q1-Q4 queries in parallel
    const [
      { count: totalClients },
      { count: activeClients },
      { count: logsSubmittedToday },
      { data: appointmentsData, count: upcomingAppointments }
    ] = await Promise.all([
      supabase.from('clients').select('*', { count: 'exact', head: true }),
      supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('diet_logs').select('*', { count: 'exact', head: true }).eq('logged_date', today).eq('status', 'submitted'),
      supabase.from('clients').select('id, name, nutritionist, next_appointment_date', { count: 'exact' })
        .gte('next_appointment_date', now.toISOString())
        .lte('next_appointment_date', sevenDaysLater.toISOString())
        .order('next_appointment_date', { ascending: true })
    ])
    if (enableLogs) console.timeEnd('[STATS] DB Queries')

    if (enableLogs) {
      console.log(`[STATS-Q1] Total clients: ${totalClients}`)
      console.log(`[STATS-Q2] Active clients: ${activeClients}`)
      console.log(`[STATS-Q3] Logs submitted today: ${logsSubmittedToday}`)
      console.log(`[STATS-Q4] Fetched ${appointmentsData?.length || 0} upcoming appointments`)
    }

    const response = {
      totalClients: totalClients || 0,
      activeClients: activeClients || 0,
      logsSubmittedToday: logsSubmittedToday || 0,
      upcomingAppointments: upcomingAppointments || 0,
      appointments: appointmentsData || [],
    }

    appCache.set(cacheKey, response, 30 * 1000)

    if (enableLogs) {
      const totalTime = Date.now() - startTime
      console.log(`[STATS] Total time: ${totalTime}ms`)
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
