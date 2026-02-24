import { requireAdmin } from '@/lib/auth/requireAdmin'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const adminAuth = await requireAdmin()
  if (!adminAuth.authorized) return adminAuth.response

  try {
    const supabase = createAdminClient()

    // Check if user is authenticated

    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    let limit = parseInt(url.searchParams.get('limit') || '50')
    if (limit > 100) limit = 100
    const q = url.searchParams.get('q') || ''
    const status = url.searchParams.get('status') || ''
    const source = url.searchParams.get('source') || ''

    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' })

    if (q) {
      query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`)
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (source) {
      query = query.eq('source', source)
    }

    // Fetch all leads
    const { data: leads, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (error) throw error

    return NextResponse.json({
      items: leads || [],
      total: count || 0,
      page,
      limit,
      totalPages: count ? Math.ceil(count / limit) : 0,
    })
  } catch (error) {
    console.error('Error fetching leads:', error)
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
