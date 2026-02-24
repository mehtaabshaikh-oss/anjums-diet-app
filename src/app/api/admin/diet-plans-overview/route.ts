import { requireAdmin } from '@/lib/auth/requireAdmin'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const adminAuth = await requireAdmin()
  if (!adminAuth.authorized) return adminAuth.response

  try {
    const supabase = createAdminClient()


    // Get all active clients
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, name, email, phone, status')
      .eq('status', 'active')
      .order('name')

    if (clientsError) {
      console.error('API Error:', clientsError);
      return NextResponse.json({ error: 'Bad request' }, { status: 400 })
    }

    // Fetch all active clients
    const clientIds = (clients || []).map((c: any) => c.id)

    let allDietPlans: any[] = []
    if (clientIds.length > 0) {
      const { data: dietPlansData } = await supabase
        .from('diet_plans')
        .select('id, name, active, client_id')
        .in('client_id', clientIds)
        .order('active', { ascending: false })
        .order('name')

      allDietPlans = dietPlansData || []
    }

    const plansByClientId = new Map()
    allDietPlans.forEach(plan => {
      if (!plansByClientId.has(plan.client_id)) {
        plansByClientId.set(plan.client_id, [])
      }
      plansByClientId.get(plan.client_id).push({
        id: plan.id,
        name: plan.name,
        active: plan.active,
      })
    })

    const clientsWithPlans = (clients || []).map((client: any) => {
      return {
        client_id: client.id,
        client_name: client.name,
        email: client.email,
        phone: client.phone,
        status: client.status,
        diet_plans: plansByClientId.get(client.id) || [],
      }
    })

    // Calculate stats
    const stats = {
      total_active_clients: clients?.length || 0,
      clients_with_active_plans: clientsWithPlans.filter((c: any) =>
        c.diet_plans.some((p: any) => p.active)
      ).length,
      clients_without_plans: clientsWithPlans.filter((c: any) => c.diet_plans.length === 0).length,
      total_diet_plans: clientsWithPlans.reduce((sum: number, c: any) => sum + c.diet_plans.length, 0),
    }

    return NextResponse.json({
      stats,
      clients: clientsWithPlans,
    })
  } catch (error) {
    console.error('Error fetching diet plans overview:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
