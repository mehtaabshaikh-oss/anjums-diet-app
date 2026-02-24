import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const supabase = createAdminClient()

    // Get all diet logs
    const { data: logs, error } = await supabase
      .from('diet_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      total_logs: logs?.length || 0,
      today_date: new Date().toISOString().split('T')[0],
      logs: logs,
    })
  } catch (error) {
    console.error('Error checking diet logs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
