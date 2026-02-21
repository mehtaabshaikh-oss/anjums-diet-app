import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const startTime = Date.now()
    console.log('[ANALYTICS] Starting analytics fetch...')

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

    // OPTIMIZED: Fetch all clients once with all related data (replaces Q1, Q3-Q5, Q7-Q8)
    console.time('[Q1] OPTIMIZED: All Clients + Weight Logs + Payments')
    const { data: allClientsData } = await supabase
      .from('clients')
      .select('id, name, package, status, nutritionist, created_at, payments(amount, status, date), weight_logs(logged_date, weight_kg)')
    console.timeEnd('[Q1] OPTIMIZED: All Clients + Weight Logs + Payments')
    console.log(`[Q1] Fetched ${allClientsData?.length || 0} clients with all relations`)

    // Get date boundaries for filtering
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0]
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0]
    const monthStart = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0]
    const monthEnd = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0]

    // Process all calculations from single query
    console.time('[P1] Client Data Processing')

    // 1. Weight Loss Calculations
    let totalWeightLoss = 0
    let clientsWithLoss = 0
    const topPerformers: Array<{ name: string; weightLoss: number }> = []

    // 3. Revenue by Package (active clients)
    const revenueByPackage = { Gold: 0, Hybrid: 0, Platinum: 0 }
    const packageCountMap = { Gold: 0, Hybrid: 0, Platinum: 0 }
    let monthlyRevenue = 0

    // 4. New Clients This Month
    const newClientsByDay: { [key: string]: number } = {}

    // 6. Clients by Nutritionist
    const clientsByNutritionistMap: { [key: string]: number } = {}

    // 7. Revenue by Nutritionist
    const revenueByNutritionistMap: { [key: string]: number } = {}

    // Initialize last 30 days for new clients tracking
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      newClientsByDay[dateStr] = 0
    }

    if (allClientsData) {
      for (const client of allClientsData) {
        // 1. Weight Loss Processing
        const logs = (client.weight_logs as any[]) || []
        if (logs.length > 1) {
          const sortedLogs = logs.sort(
            (a, b) =>
              new Date(a.logged_date).getTime() - new Date(b.logged_date).getTime()
          )
          const firstWeight = sortedLogs[0].weight_kg
          const lastWeight = sortedLogs[sortedLogs.length - 1].weight_kg
          const weightLoss = firstWeight - lastWeight

          if (weightLoss > 0) {
            totalWeightLoss += weightLoss
            clientsWithLoss++
            topPerformers.push({ name: client.name, weightLoss })
          }
        }

        // 3. Revenue by Package (active clients only)
        if (client.status === 'active') {
          const pkgKey = (client.package || 'Gold').charAt(0).toUpperCase() +
                         (client.package || 'Gold').slice(1).toLowerCase()

          if (packageCountMap.hasOwnProperty(pkgKey)) {
            packageCountMap[pkgKey as keyof typeof packageCountMap]++

            const payments = (client.payments as any[]) || []
            const totalPaid = payments
              .filter(p => p.status === 'paid')
              .reduce((sum, p) => sum + parseFloat(p.amount), 0)

            revenueByPackage[pkgKey as keyof typeof revenueByPackage] += totalPaid
          }
        }

        // Calculate monthly revenue (all clients, filtered by payment date)
        const payments = (client.payments as any[]) || []
        const monthlyPaid = payments
          .filter(p => {
            if (p.status !== 'paid') return false
            if (!p.date) return false
            const paymentDateStr = typeof p.date === 'string' ? p.date : p.date
            return paymentDateStr >= firstDayOfMonth && paymentDateStr <= lastDayOfMonth
          })
          .reduce((sum, p) => sum + (parseFloat(String(p.amount)) || 0), 0)
        monthlyRevenue += monthlyPaid

        // 4. New Clients This Month
        const dateStr = client.created_at.split('T')[0]
        if (newClientsByDay.hasOwnProperty(dateStr)) {
          newClientsByDay[dateStr]++
        }

        // 6. Clients by Nutritionist
        const nutritionist = client.nutritionist || 'anjum'
        clientsByNutritionistMap[nutritionist] = (clientsByNutritionistMap[nutritionist] || 0) + 1

        // 7. Revenue by Nutritionist
        const totalNutritionistRevenue = payments
          .filter(p => p.status === 'paid')
          .reduce((sum, p) => sum + parseFloat(p.amount), 0)

        revenueByNutritionistMap[nutritionist] =
          (revenueByNutritionistMap[nutritionist] || 0) + totalNutritionistRevenue
      }
    }

    console.timeEnd('[P1] Client Data Processing')
    console.log(`[P1] Clients with progress: ${clientsWithLoss}`)

    // Format outputs
    const averageWeightLoss =
      clientsWithLoss > 0 ? (totalWeightLoss / clientsWithLoss).toFixed(1) : '0'
    const topPerformersList = topPerformers
      .sort((a, b) => b.weightLoss - a.weightLoss)
      .slice(0, 5)

    const revenueData = Object.entries(revenueByPackage).map(([pkg, revenue]) => ({
      name: pkg,
      revenue: Math.round(revenue),
      clients: packageCountMap[pkg as keyof typeof packageCountMap],
    }))

    // Group new clients by week
    const newClientsTrend = []
    for (let i = 4; i >= 0; i--) {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - 7 * i - 6)
      const weekEnd = new Date()
      weekEnd.setDate(weekEnd.getDate() - 7 * i)

      let weekCount = 0
      for (const [dateStr, count] of Object.entries(newClientsByDay)) {
        const date = new Date(dateStr)
        if (date >= weekStart && date <= weekEnd) {
          weekCount += count
        }
      }

      newClientsTrend.push({
        week: `Week ${5 - i}`,
        newClients: weekCount,
      })
    }

    const clientsByNutritionist = Object.entries(clientsByNutritionistMap).map(
      ([nutritionist, clients]) => ({
        nutritionist: nutritionist.charAt(0).toUpperCase() + nutritionist.slice(1).replace(/_/g, ' '),
        clients,
      })
    )

    const revenueByNutritionist = Object.entries(revenueByNutritionistMap).map(
      ([nutritionist, revenue]) => ({
        nutritionist: nutritionist.charAt(0).toUpperCase() + nutritionist.slice(1).replace(/_/g, ' '),
        revenue: Math.round(revenue),
      })
    )

    // 2. Diet Plan Adherence - Get diet logs for last 7 days (independent query)
    console.time('[Q2] Diet Logs')
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: dietLogsData } = await supabase
      .from('diet_logs')
      .select('logged_date, status')
      .gte('logged_date', sevenDaysAgo.toISOString().split('T')[0])
    console.timeEnd('[Q2] Diet Logs')
    console.log(`[Q2] Fetched ${dietLogsData?.length || 0} diet logs`)

    const adherenceByDay: { [key: string]: { submitted: number; total: number } } = {}

    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      adherenceByDay[dateStr] = { submitted: 0, total: 0 }
    }

    if (dietLogsData) {
      for (const log of dietLogsData) {
        if (adherenceByDay[log.logged_date]) {
          adherenceByDay[log.logged_date].total++
          if (log.status === 'submitted') {
            adherenceByDay[log.logged_date].submitted++
          }
        }
      }
    }

    const adherenceTrend = Object.entries(adherenceByDay).map(([date, data]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: date,
      adherenceRate:
        data.total > 0 ? Math.round((data.submitted / data.total) * 100) : 0,
    }))

    // 5. New Leads This Week - Get leads created in last 7 days (independent query)
    console.time('[Q3] New Leads This Week')
    const sevenDaysAgoDate = new Date()
    sevenDaysAgoDate.setDate(sevenDaysAgoDate.getDate() - 7)

    const { data: newLeadsData } = await supabase
      .from('leads')
      .select('id')
      .gte('created_at', sevenDaysAgoDate.toISOString())
    console.timeEnd('[Q3] New Leads This Week')
    console.log(`[Q3] Fetched ${newLeadsData?.length || 0} new leads`)

    const newLeadsThisWeek = newLeadsData ? newLeadsData.length : 0

    const response = {
      averageWeightLoss: parseFloat(averageWeightLoss as string),
      clientsWithProgressData: clientsWithLoss,
      topPerformers: topPerformersList,
      adherenceTrend,
      revenueByPackage: revenueData,
      newClientsTrend,
      newLeadsThisWeek,
      monthlyRevenue: Math.round(monthlyRevenue),
      clientsByNutritionist,
      revenueByNutritionist,
    }

    const totalTime = Date.now() - startTime
    const payloadSize = JSON.stringify(response).length
    console.log(`[ANALYTICS] Total time: ${totalTime}ms`)
    console.log(`[ANALYTICS] Payload size: ${payloadSize} bytes (~${(payloadSize / 1024).toFixed(1)}KB)`)
    console.log(`[ANALYTICS] ---- Performance Summary ----`)
    console.log(`[ANALYTICS] 3 database queries executed (OPTIMIZED from 8 queries)`)
    console.log(`[ANALYTICS] Q1: Consolidated clients + weight_logs + payments`)
    console.log(`[ANALYTICS] Q2: Diet logs (independent)`)
    console.log(`[ANALYTICS] Q3: Leads (independent)`)
    console.log(`[ANALYTICS] Response time: ${totalTime}ms`)
    console.log(`[ANALYTICS] ================================`)

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
