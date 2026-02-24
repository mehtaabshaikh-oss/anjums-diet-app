import { requireAdmin } from '@/lib/auth/requireAdmin'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminAuth = await requireAdmin()
  if (!adminAuth.authorized) return adminAuth.response

  const { id } = await params
  try {
    const supabase = createAdminClient()


    const { name, description, active, items } = await req.json()

    // Update diet plan
    const { data: dietPlan, error: updateError } = await supabase
      .from('diet_plans')
      .update({
        name,
        description,
        active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    // If items provided, update them
    if (items && Array.isArray(items)) {
      // Delete existing items
      await supabase
        .from('diet_plan_items')
        .delete()
        .eq('diet_plan_id', id)

      // Insert new items
      const itemsToInsert = items.map(
        (item: any, index: number) => ({
          diet_plan_id: id,
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
        return NextResponse.json(
          { error: `Failed to update items: ${itemsError.message}` },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(dietPlan)
  } catch (error) {
    console.error('Error updating diet plan:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminAuth = await requireAdmin()
  if (!adminAuth.authorized) return adminAuth.response

  const { id } = await params
  try {
    const supabase = createAdminClient()


    const { active } = await req.json()

    // Archive diet plan by setting active to false
    const { data: dietPlan, error } = await supabase
      .from('diet_plans')
      .update({
        active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(dietPlan)
  } catch (error) {
    console.error('Error archiving diet plan:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminAuth = await requireAdmin()
  if (!adminAuth.authorized) return adminAuth.response

  const { id } = await params
  try {
    const supabase = createAdminClient()


    // Delete will cascade to diet_plan_items
    const { error } = await supabase
      .from('diet_plans')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting diet plan:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
