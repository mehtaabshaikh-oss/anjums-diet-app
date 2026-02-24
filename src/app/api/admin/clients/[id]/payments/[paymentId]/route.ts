import { requireAdmin } from '@/lib/auth/requireAdmin'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; paymentId: string }> }
) {
  const adminAuth = await requireAdmin()
  if (!adminAuth.authorized) return adminAuth.response

  try {
    const { id, paymentId } = await params
    const supabase = createAdminClient()


    const body = await req.json()
    const { amount, date, method, status, notes } = body

    // Update payment
    const { data: payment, error: updateError } = await supabase
      .from('payments')
      .update({
        amount,
        date,
        method,
        status,
        notes: notes || null,
      })
      .eq('id', paymentId)
      .eq('client_id', id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    return NextResponse.json(payment)
  } catch (error) {
    console.error('Error updating payment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; paymentId: string }> }
) {
  const adminAuth = await requireAdmin()
  if (!adminAuth.authorized) return adminAuth.response

  try {
    const { id, paymentId } = await params
    const supabase = createAdminClient()


    // Delete payment
    const { error: deleteError } = await supabase
      .from('payments')
      .delete()
      .eq('id', paymentId)
      .eq('client_id', id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting payment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
