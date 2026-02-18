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

    // 1. Average Weight Loss - Get all clients with their weight logs
    const { data: clientsData } = await supabase
      .from('clients')
      .select('id, name, weight_logs(logged_date, weight_kg)')

    let totalWeightLoss = 0
    let clientsWithLoss = 0
    const topPerformers: Array<{ name: string; weightLoss: number }> = []

    if (clientsData) {
      for (const client of clientsData) {
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
      }
    }

    const averageWeightLoss =
      clientsWithLoss > 0 ? (totalWeightLoss / clientsWithLoss).toFixed(1) : '0'
    const topPerformersList = topPerformers
      .sort((a, b) => b.weightLoss - a.weightLoss)
      .slice(0, 5)

    // 2. Diet Plan Adherence - Get diet logs for last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: dietLogsData } = await supabase
      .from('diet_logs')
      .select('logged_date, status')
      .gte('logged_date', sevenDaysAgo.toISOString().split('T')[0])

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

    // 3. Revenue by Package - Get actual revenue from payments grouped by client package (ACTIVE clients only)
    const { data: clientsWithPayments } = await supabase
      .from('clients')
      .select('id, package, status, payments(amount, status)')
      .eq('status', 'active')

    const revenueByPackage = {
      Gold: 0,
      Hybrid: 0,
      Platinum: 0,
    }

    const packageCountMap = {
      Gold: 0,
      Hybrid: 0,
      Platinum: 0,
    }

    // Get current month boundaries for revenue filtering
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

    if (clientsWithPayments) {
      for (const client of clientsWithPayments) {
        const pkgKey = (client.package || 'Gold').charAt(0).toUpperCase() +
                       (client.package || 'Gold').slice(1).toLowerCase()

        if (packageCountMap.hasOwnProperty(pkgKey)) {
          packageCountMap[pkgKey as keyof typeof packageCountMap]++

          // Sum up paid payments for this client (all time for now - we'll filter by month later if needed)
          const payments = (client.payments as any[]) || []
          const totalPaid = payments
            .filter(p => p.status === 'paid')
            .reduce((sum, p) => sum + parseFloat(p.amount), 0)

          revenueByPackage[pkgKey as keyof typeof revenueByPackage] += totalPaid
        }
      }
    }

    const revenueData = Object.entries(revenueByPackage).map(([pkg, revenue]) => ({
      name: pkg,
      revenue: Math.round(revenue),
      clients: packageCountMap[pkg as keyof typeof packageCountMap],
    }))

    // Calculate revenue for THIS MONTH ONLY (for the monthly card)
    // We need to query ALL clients (not just active) to get historical payments for current month
    const { data: allClientsForMonthly } = await supabase
      .from('clients')
      .select('id, payments(amount, status, date)')

    let monthlyRevenue = 0
    if (allClientsForMonthly) {
      for (const client of allClientsForMonthly) {
        const payments = (client.payments as any[]) || []
        const monthlyPaid = payments
          .filter(p => {
            if (p.status !== 'paid') return false
            if (!p.date) return false
            // Format payment date as YYYY-MM-DD string
            const paymentDateStr = typeof p.date === 'string' ? p.date : p.date
            return paymentDateStr >= firstDayOfMonth && paymentDateStr <= lastDayOfMonth
          })
          .reduce((sum, p) => sum + (parseFloat(String(p.amount)) || 0), 0)
        monthlyRevenue += monthlyPaid
      }
    }

    // 4. New Clients This Month - Get clients created in current calendar month
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const monthStart = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0]
    const monthEnd = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0]

    const { data: newClientsData } = await supabase
      .from('clients')
      .select('created_at')
      .gte('created_at', monthStart + 'T00:00:00')
      .lte('created_at', monthEnd + 'T23:59:59')

    const newClientsByDay: { [key: string]: number } = {}

    // Initialize last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      newClientsByDay[dateStr] = 0
    }

    if (newClientsData) {
      for (const client of newClientsData) {
        const dateStr = client.created_at.split('T')[0]
        if (newClientsByDay.hasOwnProperty(dateStr)) {
          newClientsByDay[dateStr]++
        }
      }
    }

    // Group by week for 30-day view
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

    // 5. New Leads This Week - Get leads created in last 7 days
    const sevenDaysAgoDate = new Date()
    sevenDaysAgoDate.setDate(sevenDaysAgoDate.getDate() - 7)

    const { data: newLeadsData } = await supabase
      .from('leads')
      .select('id')
      .gte('created_at', sevenDaysAgoDate.toISOString())

    const newLeadsThisWeek = newLeadsData ? newLeadsData.length : 0

    // 6. Clients by Nutritionist - Get client count per nutritionist
    const { data: allClientsData } = await supabase
      .from('clients')
      .select('nutritionist')

    const clientsByNutritionistMap: { [key: string]: number } = {}

    if (allClientsData) {
      for (const client of allClientsData) {
        const nutritionist = client.nutritionist || 'anjum'
        clientsByNutritionistMap[nutritionist] = (clientsByNutritionistMap[nutritionist] || 0) + 1
      }
    }

    const clientsByNutritionist = Object.entries(clientsByNutritionistMap).map(
      ([nutritionist, clients]) => ({
        nutritionist: nutritionist.charAt(0).toUpperCase() + nutritionist.slice(1).replace(/_/g, ' '),
        clients,
      })
    )

    // 7. Revenue by Nutritionist - Get revenue per nutritionist
    const { data: clientsWithNutritionistAndPayments } = await supabase
      .from('clients')
      .select('nutritionist, payments(amount, status)')

    const revenueByNutritionistMap: { [key: string]: number } = {}

    if (clientsWithNutritionistAndPayments) {
      for (const client of clientsWithNutritionistAndPayments) {
        const nutritionist = client.nutritionist || 'anjum'
        const payments = (client.payments as any[]) || []
        const totalPaid = payments
          .filter(p => p.status === 'paid')
          .reduce((sum, p) => sum + parseFloat(p.amount), 0)

        revenueByNutritionistMap[nutritionist] =
          (revenueByNutritionistMap[nutritionist] || 0) + totalPaid
      }
    }

    const revenueByNutritionist = Object.entries(revenueByNutritionistMap).map(
      ([nutritionist, revenue]) => ({
        nutritionist: nutritionist.charAt(0).toUpperCase() + nutritionist.slice(1).replace(/_/g, ' '),
        revenue: Math.round(revenue),
      })
    )

    return NextResponse.json({
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
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
