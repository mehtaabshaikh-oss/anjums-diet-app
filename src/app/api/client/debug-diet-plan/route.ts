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

    const url = new URL(req.url)
    const clientId = url.searchParams.get('client_id')
    const email = url.searchParams.get('email')

    if (!clientId && !email) {
      return NextResponse.json(
        { error: 'client_id or email required' },
        { status: 400 }
      )
    }

    // Get client info
    let actualClientId = clientId
    if (email) {
      const { data: client } = await supabase
        .from('clients')
        .select('id, email')
        .eq('email', email)
        .single()
      actualClientId = client?.id
    }

    if (!actualClientId) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Get all diet plans for this client (active or not)
    const { data: clientDietPlans } = await supabase
      .from('diet_plans')
      .select('id, name, client_id, active, created_at')
      .eq('client_id', actualClientId)

    // Get ALL diet plans in the system to see what client_ids they're linked to
    const { data: allDietPlans } = await supabase
      .from('diet_plans')
      .select('id, name, client_id, active, created_at')
      .limit(20)

    // Get active diet plan with items
    const { data: activeDietPlan } = await supabase
      .from('diet_plans')
      .select(`
        id,
        name,
        client_id,
        active,
        diet_plan_items(id)
      `)
      .eq('client_id', actualClientId)
      .eq('active', true)
      .single()

    return NextResponse.json({
      debug: {
        client_id_param: clientId,
        actual_client_id: actualClientId,
        client_diet_plans_count: clientDietPlans?.length || 0,
        client_diet_plans: clientDietPlans || [],
        all_diet_plans_in_system: allDietPlans || [],
        active_diet_plan: activeDietPlan || null,
        active_diet_plan_item_count: activeDietPlan?.diet_plan_items?.length || 0,
      },
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
