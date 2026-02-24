import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJwt } from '@/lib/auth/jwt'

export async function GET(req: Request) {
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

    const clientId = payload.clientId

    const url = new URL(req.url)
    const date = url.searchParams.get('date')

    if (!clientId || !date) {
      return NextResponse.json(
        { error: 'Missing date' },
        { status: 400 }
      )
    }

    // Check if a log exists for this client on this date
    const { data: existingLog, error } = await supabase
      .from('diet_logs')
      .select('id')
      .eq('client_id', clientId)
      .eq('logged_date', date)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is expected
      console.error('API Error:', error);
      return NextResponse.json({ error: 'Bad request' }, { status: 400 })
    }

    return NextResponse.json({
      submitted: !!existingLog,
    })
  } catch (error) {
    console.error('Error checking diet log:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
