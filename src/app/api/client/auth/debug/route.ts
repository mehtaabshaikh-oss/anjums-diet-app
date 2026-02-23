import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
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

    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Query client and check password_hash
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, email, name, password_hash, password_changed')
      .eq('email', email)
      .single()

    if (clientError) {
      return NextResponse.json(
        {
          error: 'Client not found',
          details: clientError.message,
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      debug: {
        client_id: client.id,
        email: client.email,
        name: client.name,
        has_password_hash: !!client.password_hash,
        password_hash_length: client.password_hash ? client.password_hash.length : 0,
        password_hash_starts_with: client.password_hash ? client.password_hash.substring(0, 20) : 'N/A',
        password_changed: client.password_changed,
      },
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
