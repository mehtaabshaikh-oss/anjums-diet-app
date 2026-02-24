import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import { signJwt } from '@/lib/auth/jwt'
import { checkRateLimit } from '@/lib/auth/rateLimit'

export async function POST(req: Request) {
  try {
    const supabase = createAdminClient()

    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1'
    const limitCheck = checkRateLimit(ip, email)
    if (!limitCheck.allowed) return limitCheck.response

    // Find client by email
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, email, name, password_hash, password_changed')
      .eq('email', email)
      .single()

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    if (!client.password_hash) {
      return NextResponse.json(
        { error: 'Account not set up. Please contact admin.' },
        { status: 401 }
      )
    }

    const isPasswordValid = await compare(password, client.password_hash)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Update last login
    await supabase
      .from('clients')
      .update({ last_login: new Date().toISOString() })
      .eq('id', client.id)

    // Sign JWT token
    const token = await signJwt({ clientId: client.id })

    // Return client data (password_changed indicates if they need to change password)
    const response = NextResponse.json({
      success: true,
      client: {
        id: client.id,
        email: client.email,
        name: client.name,
        password_changed: client.password_changed,
      },
    })

    response.cookies.set('client_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Error in client login:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
