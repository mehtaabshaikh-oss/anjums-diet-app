import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const supabaseServer = await createClient()

    // 1. Get user securely from server session
    const { data: { user }, error: userError } = await supabaseServer.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminSupabase = createAdminClient()

    // 2. Fetch role from users table securely
    const { data: userData, error: roleError } = await adminSupabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (roleError || !userData) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 3. Output only minimal clean role response (No debug variables)
    return NextResponse.json({ role: userData.role }, { status: 200 })
  } catch (error) {
    console.error('Error verifying admin:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
