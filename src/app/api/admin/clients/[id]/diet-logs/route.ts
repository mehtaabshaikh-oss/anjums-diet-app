import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clientId } = await params

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

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
        { error: 'Failed to fetch diet logs', details: error.message },
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
