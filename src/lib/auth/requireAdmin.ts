import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function requireAdmin() {
    const supabase = await createClient()

    // 1. Verify Authentication
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
        return {
            authorized: false,
            response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
        }
    }

    // 2. Verify Authorization (Role Check)
    const adminClient = createAdminClient()
    const { data: userData, error: roleError } = await adminClient
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (roleError || !userData || userData.role !== 'admin') {
        return {
            authorized: false,
            response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
        }
    }

    // 3. Return user for handlers to use
    return {
        authorized: true,
        user,
        adminClient,
    }
}
