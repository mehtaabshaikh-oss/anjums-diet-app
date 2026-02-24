import { requireAdmin } from '@/lib/auth/requireAdmin'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const adminAuth = await requireAdmin()
  if (!adminAuth.authorized) return adminAuth.response

  try {
    const supabase = createAdminClient()


    // Get query parameters
    const url = new URL(req.url)
    const loggedDate = url.searchParams.get('logged_date') || new Date().toISOString().split('T')[0]
    const clientId = url.searchParams.get('client_id')

    // Get all active clients with diet plans
    let clientsQuery = supabase
      .from('clients')
      .select(`
        id,
        name,
        email,
        package,
        next_appointment_date,
        diet_plans(id),
        diet_logs(
          id,
          logged_date,
          status,
          submitted_at
        )
      `)
      .eq('status', 'active')

    if (clientId) {
      clientsQuery = clientsQuery.eq('id', clientId)
    }

    const { data: clients, error: clientsError } = await clientsQuery

    if (clientsError) {
      return NextResponse.json({ error: clientsError.message }, { status: 400 })
    }

    // Process the data to create summary
    const summary = {
      date: loggedDate,
      total_clients_with_plans: 0,
      submitted_today: 0,
      pending_today: 0,
      not_submitted_today: 0,
      adherence_percentage: 0,
      clients: [] as any[],
    }

    if (clients) {
      // Filter clients that have diet plans
      const clientsWithPlans = clients.filter(
        (c: any) => c.diet_plans && c.diet_plans.length > 0
      )
      summary.total_clients_with_plans = clientsWithPlans.length

      for (const client of clientsWithPlans) {
        // Find log for today
        const todayLog = client.diet_logs?.find(
          (log: any) => log.logged_date === loggedDate
        )

        let status = 'PENDING'
        let submissionTime = null

        if (todayLog) {
          status = todayLog.status === 'submitted' ? 'SUBMITTED' : 'NOT_SUBMITTED'
          submissionTime = todayLog.submitted_at
        }

        // Calculate adherence if submitted
        let adherencePercentage = 0
        let totalItems = 0
        let completedItems = 0
        if (todayLog && todayLog.status === 'submitted') {
          // Get log items and calculate adherence
          const { data: logItems } = await supabase
            .from('diet_log_items')
            .select('completed')
            .eq('diet_log_id', todayLog.id)

          if (logItems && logItems.length > 0) {
            totalItems = logItems.length
            completedItems = logItems.filter((item: any) => item.completed).length
            adherencePercentage = Math.round((completedItems / totalItems) * 100)
          }
        }

        summary.clients.push({
          client_id: client.id,
          name: client.name,
          email: client.email,
          package: client.package,
          next_appointment_date: client.next_appointment_date,
          status,
          submission_time: submissionTime,
          adherence_percentage: adherencePercentage,
          log_id: todayLog?.id || null,
          total_items: totalItems,
          completed_items: completedItems,
        })

        // Update summary counts
        if (status === 'SUBMITTED') {
          summary.submitted_today++
        } else if (status === 'NOT_SUBMITTED') {
          summary.not_submitted_today++
        } else {
          summary.pending_today++
        }
      }

      // Calculate overall adherence
      if (summary.submitted_today > 0) {
        const totalAdherence = summary.clients.reduce(
          (sum: number, c: any) => sum + c.adherence_percentage,
          0
        )
        summary.adherence_percentage = Math.round(
          totalAdherence / summary.submitted_today
        )
      }
    }

    return NextResponse.json({
      stats: {
        total_clients_with_plans: summary.total_clients_with_plans,
        logs_submitted_today: summary.submitted_today,
        logs_pending: summary.pending_today,
        adherence_percentage_today: summary.adherence_percentage,
        average_adherence_week: 0, // TODO: Calculate weekly average
      },
      adherence: summary.clients.map((client: any) => ({
        client_id: client.client_id,
        client_name: client.name,
        package: client.package,
        submitted_today: client.status === 'SUBMITTED',
        submission_time: client.submission_time,
        total_items: client.total_items,
        completed_items: client.completed_items,
        adherence_percentage: client.adherence_percentage,
        status: client.status,
        log_id: client.log_id,
      })),
    })
  } catch (error) {
    console.error('Error fetching diet logs summary:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
