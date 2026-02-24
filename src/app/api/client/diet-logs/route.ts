import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJwt } from '@/lib/auth/jwt'

export async function POST(req: Request) {
  try {
    const supabase = createAdminClient()

    // Verify JWT token
    const cookieStore = await cookies()
    const token = cookieStore.get('client_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyJwt(token)
    if (!payload?.clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client_id = payload.clientId
    const { logged_date, items } = await req.json()

    if (!client_id || !logged_date || !items) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create or get diet log for this date
    let { data: dietLog } = await supabase
      .from('diet_logs')
      .select('id')
      .eq('client_id', client_id)
      .eq('logged_date', logged_date)
      .single()

    if (!dietLog) {
      // Create new diet log
      const { data: newLog, error: createError } = await supabase
        .from('diet_logs')
        .insert({
          client_id,
          logged_date,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (createError) {
        console.error('API Error:', createError);
      return NextResponse.json({ error: 'Bad request' }, { status: 400 })
      }

      dietLog = newLog
    } else {
      // Update existing log status to submitted
      await supabase
        .from('diet_logs')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
        })
        .eq('id', dietLog.id)
    }

    // Ensure dietLog is not null
    if (!dietLog) {
      return NextResponse.json(
        { error: 'Failed to create or retrieve diet log' },
        { status: 400 }
      )
    }

    // Delete existing log items for this log
    await supabase.from('diet_log_items').delete().eq('diet_log_id', dietLog.id)

    // Insert new log items
    const logItems = items.map((item: any) => ({
      diet_log_id: dietLog.id,
      diet_plan_item_id: item.diet_plan_item_id,
      completed: item.completed,
      comment: item.comment || null,
    }))

    const { error: itemsError } = await supabase
      .from('diet_log_items')
      .insert(logItems)

    if (itemsError) {
      console.error('API Error:', itemsError);
      return NextResponse.json({ error: 'Bad request' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      diet_log_id: dietLog.id,
    })
  } catch (error) {
    console.error('Error submitting diet log:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const supabase = createAdminClient()

    // Verify JWT token
    const cookieStore = await cookies()
    const token = cookieStore.get('client_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyJwt(token)
    if (!payload?.clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clientId = payload.clientId
    const url = new URL(req.url)
    const loggedDate = url.searchParams.get('logged_date')

    let query = supabase
      .from('diet_logs')
      .select(`
        id,
        logged_date,
        status,
        submitted_at,
        diet_log_items(
          id,
          diet_plan_item_id,
          completed,
          comment,
          diet_plan_items(*)
        )
      `)
      .eq('client_id', clientId)

    if (loggedDate) {
      query = query.eq('logged_date', loggedDate)
    }

    const { data: dietLogs, error } = await query.order('logged_date', {
      ascending: false,
    })

    if (error) {
      console.error('API Error:', error);
      return NextResponse.json({ error: 'Bad request' }, { status: 400 })
    }

    return NextResponse.json(dietLogs)
  } catch (error) {
    console.error('Error fetching diet logs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
