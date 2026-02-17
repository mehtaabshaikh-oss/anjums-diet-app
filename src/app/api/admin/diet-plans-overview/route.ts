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

    // Get all active clients
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, name, email, phone, status')
      .eq('status', 'active')
      .order('name')

    if (clientsError) {
      return NextResponse.json({ error: clientsError.message }, { status: 400 })
    }

    // For each client, get their diet plans
    const clientsWithPlans = await Promise.all(
      (clients || []).map(async (client: any) => {
        const { data: dietPlans } = await supabase
          .from('diet_plans')
          .select('id, name, active')
          .eq('client_id', client.id)
          .order('active', { ascending: false })
          .order('name')

        return {
          client_id: client.id,
          client_name: client.name,
          email: client.email,
          phone: client.phone,
          status: client.status,
          diet_plans: dietPlans || [],
        }
      })
    )

    // Calculate stats
    const stats = {
      total_active_clients: clients?.length || 0,
      clients_with_active_plans: clientsWithPlans.filter((c) =>
        c.diet_plans.some((p) => p.active)
      ).length,
      clients_without_plans: clientsWithPlans.filter((c) => c.diet_plans.length === 0).length,
      total_diet_plans: clientsWithPlans.reduce((sum, c) => sum + c.diet_plans.length, 0),
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
