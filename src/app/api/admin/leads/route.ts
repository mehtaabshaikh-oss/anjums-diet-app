import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const supabase = createAdminClient()

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all leads
    const { data: leads, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(leads)
  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createAdminClient()

    const body = await req.json()
    const { name, email, phone, message, source = 'contact_form' } = body

    if (!name || !phone || !message) {
      return NextResponse.json(
        { error: 'Missing required fields (name, phone, message)' },
        { status: 400 }
      )
    }

    // Insert lead into database
    const { data, error } = await supabase
      .from('leads')
      .insert([
        {
          name,
          email: email || null,
          phone,
          message,
          source,
          status: 'new',
        },
      ])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('Error creating lead:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
