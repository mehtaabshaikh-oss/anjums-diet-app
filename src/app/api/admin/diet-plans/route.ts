import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const supabase = createAdminClient()

    const { client_id, name, description, items } = await req.json()

    // Create diet plan
    const { data: dietPlan, error: dietPlanError } = await supabase
      .from('diet_plans')
      .insert({
        client_id,
        name,
        description,
        active: true,
      })
      .select()
      .single()

    if (dietPlanError) {
      return NextResponse.json({ error: dietPlanError.message }, { status: 400 })
    }

    // Insert diet plan items if provided
    if (items && items.length > 0) {
      const itemsToInsert = items.map(
        (item: any, index: number) => ({
          diet_plan_id: dietPlan.id,
          meal_type: item.meal_type,
          sequence: item.sequence || index + 1,
          item_name: item.item_name,
          quantity: item.quantity,
          unit: item.unit,
          time: item.time || null,
          notes: item.notes || null,
        })
      )

      const { error: itemsError } = await supabase
        .from('diet_plan_items')
        .insert(itemsToInsert)

      if (itemsError) {
        // Rollback: delete the diet plan
        await supabase.from('diet_plans').delete().eq('id', dietPlan.id)
        return NextResponse.json(
          { error: `Failed to add items: ${itemsError.message}` },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(dietPlan, { status: 201 })
  } catch (error) {
    console.error('Error creating diet plan:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const supabase = createAdminClient()


    // Get query parameter for filtering by client_id
    const url = new URL(req.url)
    const clientId = url.searchParams.get('client_id')

    let query = supabase
      .from('diet_plans')
      .select('*')

    if (clientId) {
      query = query.eq('client_id', clientId)
    }

    const { data: dietPlans, error } = await query.order('created_at', {
      ascending: false,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(dietPlans)
  } catch (error) {
    console.error('Error fetching diet plans:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
