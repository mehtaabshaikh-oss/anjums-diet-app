import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = createAdminClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { chest_cm, waist_cm, hip_cm, thigh_cm, logged_date, notes } = await req.json()

    // Insert into measurements_logs for historical tracking
    const { error: logError } = await supabase
      .from('measurements_logs')
      .insert({
        client_id: id,
        chest_cm: chest_cm || null,
        waist_cm: waist_cm || null,
        hip_cm: hip_cm || null,
        thigh_cm: thigh_cm || null,
        logged_date,
        notes: notes || null,
      })

    if (logError) {
      return NextResponse.json({ error: logError.message }, { status: 400 })
    }

    // Also update client profile with latest measurements (if these columns exist)
    const { error: updateError } = await supabase
      .from('client_profiles')
      .update({
        chest_cm: chest_cm || null,
        waist_cm: waist_cm || null,
        hip_cm: hip_cm || null,
        thigh_cm: thigh_cm || null,
        updated_at: new Date().toISOString(),
      })
      .eq('client_id', id)

    // Log update error but don't fail - measurements_logs is the source of truth
    if (updateError) {
      console.error('Note: Could not update client_profiles with measurements. Using measurements_logs for history.', updateError.message)
    }

    return NextResponse.json({
      success: true,
      message: 'Measurements recorded successfully',
    })
  } catch (error) {
    console.error('Error recording measurements:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
