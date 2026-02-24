import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Find client by email
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, email, name, password_hash, password_changed')
      .eq('email', email)
      .single()

    if (clientError) {
      return NextResponse.json({
        found: false,
        error: clientError.message,
        email: email,
      })
    }

    return NextResponse.json({
      found: true,
      client: {
        id: client.id,
        email: client.email,
        name: client.name,
        has_password_hash: !!client.password_hash,
        password_hash_length: client.password_hash?.length || 0,
        password_changed: client.password_changed,
      },
    })
  } catch (error) {
    console.error('Error checking client:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
