import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
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
