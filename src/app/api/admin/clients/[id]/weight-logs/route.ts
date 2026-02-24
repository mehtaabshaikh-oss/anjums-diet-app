import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const supabase = createAdminClient()

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { weight_kg, logged_date, notes } = body

    if (!weight_kg || !logged_date) {
      return NextResponse.json(
        { error: 'Missing required fields: weight_kg, logged_date' },
        { status: 400 }
      )
    }

    // Insert weight log
    const { data, error } = await supabase
      .from('weight_logs')
      .insert([
        {
          client_id: parseInt(id),
          weight_kg: parseFloat(weight_kg),
          logged_date,
          notes: notes || null,
        },
      ])
      .select()

    if (error) throw error

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('Error creating weight log:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
