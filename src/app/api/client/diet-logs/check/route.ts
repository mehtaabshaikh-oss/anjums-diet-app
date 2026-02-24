import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const supabase = createAdminClient()

    const url = new URL(req.url)
    const clientId = url.searchParams.get('client_id')
    const date = url.searchParams.get('date')

    if (!clientId || !date) {
      return NextResponse.json(
        { error: 'Missing client_id or date' },
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
      return NextResponse.json({ error: error.message }, { status: 400 })
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
