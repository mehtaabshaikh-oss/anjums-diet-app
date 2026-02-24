import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const supabase = createAdminClient()

    // Get client_id from query params
    const url = new URL(req.url)
    const clientId = url.searchParams.get('client_id')

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
    }

    // Get active diet plan for client
    const { data: dietPlan, error: dietPlanError } = await supabase
      .from('diet_plans')
      .select(`
        id,
        name,
        description,
        diet_plan_items(
          id,
          meal_type,
          sequence,
          item_name,
          quantity,
          unit,
          time,
          notes
        )
      `)
      .eq('client_id', clientId)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (dietPlanError && dietPlanError.code !== 'PGRST116') {
      // PGRST116 = no rows found
      return NextResponse.json(
        { error: dietPlanError.message },
        { status: 400 }
      )
    }

    if (!dietPlan) {
      return NextResponse.json(
        { error: 'No active diet plan found' },
        { status: 404 }
      )
    }

    // Sort items by meal type and sequence
    const mealOrder = ['breakfast', 'brunch', 'lunch', 'snack', 'dinner', 'supper']
    const sortedItems = (dietPlan.diet_plan_items || []).sort((a: any, b: any) => {
      const mealDiff = mealOrder.indexOf(a.meal_type) - mealOrder.indexOf(b.meal_type)
      if (mealDiff !== 0) return mealDiff
      return a.sequence - b.sequence
    })

    return NextResponse.json({
      ...dietPlan,
      diet_plan_items: sortedItems,
    })
  } catch (error) {
    console.error('Error fetching diet plan:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
