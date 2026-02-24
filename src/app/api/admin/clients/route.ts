import { requireAdmin } from '@/lib/auth/requireAdmin'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function GET(req: Request) {
  const adminAuth = await requireAdmin()
  if (!adminAuth.authorized) return adminAuth.response

  try {
    const supabase = createAdminClient()


    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    let limit = parseInt(url.searchParams.get('limit') || '50')
    if (limit > 100) limit = 100
    const q = url.searchParams.get('q') || ''
    const status = url.searchParams.get('status') || ''

    let query = supabase
      .from('clients')
      .select('id, name, email, phone, package, duration_months, nutritionist, status, start_date, end_date, next_appointment_date', { count: 'exact' })

    if (q) {
      query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`)
    }
    if (status) {
      query = query.eq('status', status)
    }

    // Fetch paginated clients
    const { data: clients, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (error) {
      console.error('API Error:', error);
      return NextResponse.json({ error: 'Bad request' }, { status: 400 })
    }

    return NextResponse.json({
      items: clients || [],
      total: count || 0,
      page,
      limit,
      totalPages: count ? Math.ceil(count / limit) : 0,
    })
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  const adminAuth = await requireAdmin()
  if (!adminAuth.authorized) return adminAuth.response

  try {
    const supabase = createAdminClient()


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
      console.error('API Error:', createError);
      return NextResponse.json({ error: 'Bad request' }, { status: 400 })
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
      // Still return success for client but include basic object
      return NextResponse.json(
        {
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          package: client.package,
          client_profiles: null,
        },
        { status: 201 }
      )
    }

    return NextResponse.json(
      {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        package: client.package,
        client_profiles: profile || null,
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
