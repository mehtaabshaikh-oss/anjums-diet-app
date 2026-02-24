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
    if (enableLogs) console.log('[ANALYTICS] Starting analytics fetch...')

    const cacheKey = 'admin_analytics_dashboard'
    const cachedData = appCache.get(cacheKey)
    if (cachedData) {
      if (enableLogs) console.log(`[ANALYTICS] Cache hit! Time: ${Date.now() - startTime}ms`)
      return NextResponse.json(cachedData)
    }

    const supabase = createAdminClient()

    // Get date boundaries for filtering
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0]
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0]

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    if (enableLogs) console.time('[ANALYTICS] Parallel DB Queries')
    // Run Q1, Q2, Q3 in parallel
    const [
      { data: allClientsData },
      { data: dietLogsData },
      { data: newLeadsData }
    ] = await Promise.all([
      // Q1
      supabase.from('clients').select('id, name, package, status, nutritionist, created_at, payments(amount, status, date), weight_logs(logged_date, weight_kg)'),
      // Q2
      supabase.from('diet_logs').select('logged_date, status').gte('logged_date', sevenDaysAgo.toISOString().split('T')[0]),
      // Q3
      supabase.from('leads').select('id').gte('created_at', sevenDaysAgo.toISOString())
    ])
    if (enableLogs) console.timeEnd('[ANALYTICS] Parallel DB Queries')

    if (enableLogs) {
      console.log(`[Q1] Fetched ${allClientsData?.length || 0} clients with all relations`)
      console.log(`[Q2] Fetched ${dietLogsData?.length || 0} diet logs`)
      console.log(`[Q3] Fetched ${newLeadsData?.length || 0} new leads`)
    }

    // Process all calculations from single query
    if (enableLogs) console.time('[P1] Client Data Processing')

    // 1. Weight Loss Calculations
    let totalWeightLoss = 0
    let clientsWithLoss = 0
    const topPerformers: Array<{ name: string; weightLoss: number }> = []

    // 3. Revenue by Package (active clients)
    const revenueByPackage = { Gold: 0, Hybrid: 0, Platinum: 0 }
    const packageCountMap = { Gold: 0, Hybrid: 0, Platinum: 0 }
    let monthlyRevenue = 0

    // 4. New Clients This Month (and last 6 months for trends)
    const newClientsByDay: { [key: string]: number } = {}

    // 6. Clients by Nutritionist
    const clientsByNutritionistMap: { [key: string]: number } = {}

    // 7. Revenue by Nutritionist
    const revenueByNutritionistMap: { [key: string]: number } = {}

    // Initialize last 6 months worth of days for new clients tracking
    const sixMonthsAgo = new Date(currentYear, currentMonth - 5, 1)
    const todayEnd = new Date(currentYear, currentMonth + 1, 0)
    for (let d = new Date(sixMonthsAgo); d <= todayEnd; d.setDate(d.getDate() + 1)) {
      const dateStr = new Date(d).toISOString().split('T')[0]
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

    if (enableLogs) {
      console.timeEnd('[P1] Client Data Processing')
      console.log(`[P1] Clients with progress: ${clientsWithLoss}`)
    }

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

    // Group new clients by month (last 6 months)
    const newClientsTrend = []

    // We already have newClientsByDay filled. We need to aggregate it correctly into month buckets.
    const monthBuckets: { [key: string]: number } = {}
    for (const [dateStr, count] of Object.entries(newClientsByDay)) {
      if (count > 0) {
        const d = new Date(dateStr)
        const bucketKey = d.toLocaleDateString('en-US', { month: 'short' })
        monthBuckets[bucketKey] = (monthBuckets[bucketKey] || 0) + count
      }
    }

    // Reconstruct last 6 months list safely based on simple loop instead of complex day search
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(currentYear, currentMonth - i, 1)
      const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' })
      newClientsTrend.push({
        month: monthName,
        newClients: monthBuckets[monthName] || 0,
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

    appCache.set(cacheKey, response, 60 * 1000)

    if (enableLogs) {
      const totalTime = Date.now() - startTime
      console.log(`[ANALYTICS] Total time: ${totalTime}ms`)
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
