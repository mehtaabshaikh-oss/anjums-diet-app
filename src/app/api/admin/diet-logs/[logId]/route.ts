import { requireAdmin } from '@/lib/auth/requireAdmin'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ logId: string }> }
) {
  const adminAuth = await requireAdmin()
  if (!adminAuth.authorized) return adminAuth.response

  try {
    const supabase = createAdminClient()


    const { logId } = await params

    // Get diet log with client info
    const { data: dietLog, error: logError } = await supabase
      .from('diet_logs')
      .select('id, logged_date, submitted_at, status, client_id')
      .eq('id', logId)
      .single()

    if (logError || !dietLog) {
      return NextResponse.json({ error: 'Diet log not found' }, { status: 404 })
    }

    // Get client info separately
    const { data: client } = await supabase
      .from('clients')
      .select('id, name, email')
      .eq('id', dietLog.client_id)
      .single()

    // Get all log items
    const { data: logItems, error: itemsError } = await supabase
      .from('diet_log_items')
      .select('id, completed, comment, diet_plan_item_id')
      .eq('diet_log_id', logId)

    if (itemsError) {
      console.error('API Error:', itemsError);
      return NextResponse.json({ error: 'Bad request' }, { status: 400 })
    }

    // Get all unique diet plan item IDs
    const planItemIds = logItems
      .map((item: any) => item.diet_plan_item_id)
      .filter((id: string | null) => id != null)

    // Fetch all plan items in one query (Eliminate N+1)
    let planItemsMap = new Map()
    if (planItemIds.length > 0) {
      const { data: planItemsData, error: planItemsError } = await supabase
        .from('diet_plan_items')
        .select('id, meal_type, sequence, item_name, quantity, unit, notes')
        .in('id', planItemIds)

      if (!planItemsError && planItemsData) {
        planItemsData.forEach((item: any) => planItemsMap.set(item.id, item))
      }
    }

    // Map log items with their plan details in memory
    const itemsWithDetails = (logItems || []).map((logItem: any) => {
      const planItem = logItem.diet_plan_item_id ? planItemsMap.get(logItem.diet_plan_item_id) : null

      return {
        id: logItem.id,
        completed: logItem.completed,
        comment: logItem.comment,
        meal_type: planItem?.meal_type || 'other',
        sequence: planItem?.sequence || 0,
        item_name: planItem?.item_name || 'Unknown Item',
        quantity: planItem?.quantity || 0,
        unit: planItem?.unit || '',
        notes: planItem?.notes || null,
      }
    })

    // Sort by meal type and sequence
    itemsWithDetails.sort((a, b) => {
      if (a.meal_type !== b.meal_type) {
        return a.meal_type.localeCompare(b.meal_type)
      }
      return a.sequence - b.sequence
    })

    // Group items by meal type
    const itemsByMeal = itemsWithDetails.reduce((acc: any, item: any) => {
      const mealType = item.meal_type
      if (!acc[mealType]) {
        acc[mealType] = []
      }
      acc[mealType].push({
        id: item.id,
        completed: item.completed,
        comment: item.comment,
        item_name: item.item_name,
        quantity: item.quantity,
        unit: item.unit,
        notes: item.notes,
      })
      return acc
    }, {})

    // Calculate adherence
    const totalItems = itemsWithDetails.length
    const completedItems = itemsWithDetails.filter((item: any) => item.completed).length
    const adherencePercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

    return NextResponse.json({
      log: {
        id: dietLog.id,
        logged_date: dietLog.logged_date,
        submitted_at: dietLog.submitted_at,
        status: dietLog.status,
        client: client,
      },
      items_by_meal: itemsByMeal,
      stats: {
        total_items: totalItems,
        completed_items: completedItems,
        adherence_percentage: adherencePercentage,
      },
    })
  } catch (error) {
    console.error('Error fetching diet log details:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
