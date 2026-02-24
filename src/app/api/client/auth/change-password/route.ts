import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { hash, compare } from 'bcryptjs'
import { cookies } from 'next/headers'
import { verifyJwt } from '@/lib/auth/jwt'

export async function POST(req: Request) {
  try {
    const supabase = createAdminClient()

    // Verify JWT token
    const cookieStore = await cookies()
    const token = cookieStore.get('client_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyJwt(token)
    if (!payload?.clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client_id = payload.clientId
    const { old_password, new_password } = await req.json()

    if (!old_password || !new_password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (new_password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Get client and verify old password
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, password_hash')
      .eq('id', client_id)
      .single()

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // For password changes, validate the old password
    const isOldPasswordValid = await compare(old_password, client.password_hash)

    if (!isOldPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      )
    }

    // Hash new password
    const newPasswordHash = await hash(new_password, 10)

    // Update password
    const { error: updateError } = await supabase
      .from('clients')
      .update({
        password_hash: newPasswordHash,
        password_changed: true,
      })
      .eq('id', client_id)

    if (updateError) {
      console.error('API Error:', updateError);
      return NextResponse.json({ error: 'Bad request' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error changing password:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
