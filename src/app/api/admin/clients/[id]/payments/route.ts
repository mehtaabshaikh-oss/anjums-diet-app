import { requireAdmin } from '@/lib/auth/requireAdmin'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminAuth = await requireAdmin()
  if (!adminAuth.authorized) return adminAuth.response

  try {
    const { id } = await params
    const supabase = createAdminClient()


    // Fetch all payments for this client
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('client_id', id)
      .order('date', { ascending: false })

    if (error) {
      console.error('API Error:', error);
      return NextResponse.json({ error: 'Bad request' }, { status: 400 })
    }

    return NextResponse.json(payments || [])
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminAuth = await requireAdmin()
  if (!adminAuth.authorized) return adminAuth.response

  try {
    const { id } = await params
    const supabase = createAdminClient()


    const body = await req.json()
    const { amount, date, method, status, notes } = body

    // Validate required fields
    if (!amount || !date || !method || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create payment
    const { data: payment, error: createError } = await supabase
      .from('payments')
      .insert({
        client_id: id,
        amount,
        date,
        method,
        status,
        notes: notes || null,
      })
      .select()
      .single()

    if (createError) {
      console.error('API Error:', createError);
      return NextResponse.json({ error: 'Bad request' }, { status: 400 })
    }

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
