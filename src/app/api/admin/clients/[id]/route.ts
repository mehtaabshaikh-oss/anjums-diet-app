import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = createAdminClient()

    const body = await req.json()
    const {
      email,
      phone,
      package: clientPackage,
      duration_months,
      status,
      start_date,
      end_date,
      nutritionist,
      age,
      gender,
      height_cm,
      weight_kg,
      target_weight_kg,
      allergies,
      medical_conditions,
      dietary_preference,
      chest_cm,
      waist_cm,
      hip_cm,
      thigh_cm,
    } = body

    // Update clients table
    const { error: clientError } = await supabase
      .from('clients')
      .update({
        email,
        phone,
        package: clientPackage,
        duration_months: duration_months ? parseInt(duration_months) : undefined,
        status,
        start_date,
        end_date,
        nutritionist: nutritionist || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (clientError) {
      return NextResponse.json({ error: clientError.message }, { status: 400 })
    }

    // Update client_profiles table
    const { error: profileError } = await supabase
      .from('client_profiles')
      .update({
        age: age || null,
        gender: gender || null,
        height_cm: height_cm || null,
        weight_kg: weight_kg || null,
        target_weight_kg: target_weight_kg || null,
        allergies: allergies || null,
        medical_conditions: medical_conditions || null,
        dietary_preference: dietary_preference || null,
        chest_cm: chest_cm || null,
        waist_cm: waist_cm || null,
        hip_cm: hip_cm || null,
        thigh_cm: thigh_cm || null,
      })
      .eq('client_id', id)

    if (profileError) {
      console.error('Profile update error:', profileError)
      // Continue anyway - client was updated successfully
    }

    return NextResponse.json(
      { message: 'Client updated successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating client:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: clientId } = await params
    const supabase = createAdminClient()

    // Get client details
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select(`
        id,
        name,
        email,
        phone,
        package,
        duration_months,
        nutritionist,
        status,
        start_date,
        end_date,
        next_appointment_date,
        client_profiles(*)
      `)
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // Get weight logs for this client
    const { data: weightLogs } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('client_id', clientId)
      .order('logged_date', { ascending: true })

    // Get measurements logs for this client
    const { data: measurementsLogs } = await supabase
      .from('measurements_logs')
      .select('*')
      .eq('client_id', clientId)
      .order('logged_date', { ascending: true })

    const profile = client.client_profiles && Array.isArray(client.client_profiles)
      ? client.client_profiles[0]
      : client.client_profiles

    if (!profile) {
      console.warn(`No profile found for client ${clientId}. Client_profiles data:`, client.client_profiles)
    }

    return NextResponse.json({
      ...client,
      client_profiles: profile || null,
      weight_logs: weightLogs || [],
      measurements_logs: measurementsLogs || [],
    })
  } catch (error) {
    console.error('Error fetching client profile in admin list:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { createClient } from '@/lib/supabase/server'

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: clientId } = await params
    const supabaseServer = await createClient()

    // Verify authentication
    const { data: { user } } = await supabaseServer.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminSupabase = createAdminClient()

    // Verify user role is strictly 'admin'
    const { data: userData } = await adminSupabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden. Only administrators can delete clients.' },
        { status: 403 }
      )
    }

    // Since we may not have ON DELETE CASCADE setup on all foreign keys,
    // let's manually clean up relationships to be safe (they fail silently if missing table)
    await adminSupabase.from('client_profiles').delete().eq('client_id', clientId)
    await adminSupabase.from('appointments').delete().eq('client_id', clientId)
    await adminSupabase.from('payments').delete().eq('client_id', clientId)
    await adminSupabase.from('weight_logs').delete().eq('client_id', clientId)
    await adminSupabase.from('measurements_logs').delete().eq('client_id', clientId)
    await adminSupabase.from('notes').delete().eq('client_id', clientId)

    // For diet logs, we first need to delete the log items, then the logs themselves
    const { data: dietLogs } = await adminSupabase.from('diet_logs').select('id').eq('client_id', clientId)
    if (dietLogs && dietLogs.length > 0) {
      const dietLogIds = dietLogs.map(log => log.id)
      await adminSupabase.from('diet_log_items').delete().in('diet_log_id', dietLogIds)
      await adminSupabase.from('diet_logs').delete().eq('client_id', clientId)
    }

    // Now delete the client!
    const { error: deleteError } = await adminSupabase
      .from('clients')
      .delete()
      .eq('id', clientId)

    if (deleteError) {
      console.error('Client deletion error:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 400 })
    }

    return NextResponse.json({ message: 'Client deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting client:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
