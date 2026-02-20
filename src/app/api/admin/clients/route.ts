import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

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

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all clients
    const { data: clients, error } = await supabase
      .from('clients')
      .select('id, name, email, phone, package, duration_months, nutritionist, status, start_date, end_date, next_appointment_date')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(clients || [])
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
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

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      name,
      email,
      phone,
      package: clientPackage,
      duration_months,
      nutritionist,
      start_date,
      end_date,
      password,
      gender,
      age,
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

    // Validate required fields
    if (!name || !email || !phone || !clientPackage || !password || !duration_months) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Hash the password
    const saltRounds = 10
    const password_hash = await bcrypt.hash(password, saltRounds)

    // Create client
    const { data: client, error: createError } = await supabase
      .from('clients')
      .insert({
        name,
        email,
        phone,
        package: clientPackage,
        duration_months,
        nutritionist,
        start_date,
        end_date,
        password_hash,
        password_changed: false,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (createError) {
      console.error('Client creation error:', createError)
      return NextResponse.json({ error: createError.message }, { status: 400 })
    }

    // Debug: Check if password_hash was actually stored
    if (!client.password_hash) {
      console.error('WARNING: password_hash was not stored in database for client', client.id)
      return NextResponse.json({
        error: 'Password storage failed. Please try again.'
      }, { status: 500 })
    }

    // Always create client profile (even if empty, so data can be populated later)
    const { data: profile, error: profileError } = await supabase
      .from('client_profiles')
      .insert({
        client_id: client.id,
        gender: gender || null,
        age: age || null,
        height_cm: height_cm || null,
        weight_kg: weight_kg || null,
        target_weight_kg: target_weight_kg || null,
        chest_cm: chest_cm || null,
        waist_cm: waist_cm || null,
        hip_cm: hip_cm || null,
        thigh_cm: thigh_cm || null,
        allergies: allergies || null,
        medical_conditions: medical_conditions || null,
        dietary_preference: dietary_preference || null,
        food_dislikes: null,
        activity_level: null,
        notes: null,
      })
      .select()
      .single()

    if (profileError) {
      console.error('Profile creation error for client', client.id, ':', profileError)
      // Still return success for client but include error in response for debugging
      return NextResponse.json(
        {
          ...client,
          client_profiles: null,
          _debug: {
            profile_created: false,
            profile_error: profileError.message,
          },
        },
        { status: 201 }
      )
    } else {
      console.log('Profile created successfully for client', client.id, 'Profile ID:', profile?.id)
    }

    return NextResponse.json(
      {
        ...client,
        client_profiles: profile || null,
        _debug: {
          profile_created: true,
          profile_id: profile?.id,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
