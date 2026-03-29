import { requireAdmin } from '@/lib/auth/requireAdmin'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminAuth = await requireAdmin()
  if (!adminAuth.authorized) return adminAuth.response

  try {
    const { id: clientId } = await params

    const supabase = createAdminClient()

    // Fetch diet logs for this client, ordered by date (newest first)
    const { data: logs, error } = await supabase
      .from('diet_logs')
      .select(`
        id,
        logged_date,
        status,
        submitted_at,
        diet_log_items(
          id,
          diet_plan_item_id,
          completed,
          comment,
          diet_plan_items(*)
        )
      `)
      .eq('client_id', clientId)
      .order('logged_date', { ascending: false })

    if (error) {
      console.error('Error fetching diet logs:', error)
      return NextResponse.json(
        { error: 'Failed to fetch diet logs' },
        { status: 500 }
      )
    }

    return NextResponse.json(logs || [])
  } catch (error) {
    console.error('Error in diet logs API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
