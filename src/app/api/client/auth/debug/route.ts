import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const supabase = createAdminClient()

    const { email } = await req.json()

    // First, get ALL clients to see what's in the database
    const { data: allClients, error: allClientsError } = await supabase
      .from('clients')
      .select('id, email, name, password_hash, password_changed')
      .limit(10)

    if (allClientsError) {
      return NextResponse.json(
        {
          error: 'Failed to fetch clients',
          details: allClientsError.message,
        },
        { status: 500 }
      )
    }

    // If no email specified, return all clients
    if (!email) {
      return NextResponse.json({
        success: true,
        total_clients: allClients?.length || 0,
        all_clients: (allClients || []).map((c: any) => ({
          client_id: c.id,
          email: c.email,
          name: c.name,
          has_password_hash: !!c.password_hash,
          password_hash_starts_with: c.password_hash ? c.password_hash.substring(0, 20) : 'N/A',
          password_changed: c.password_changed,
        })),
      })
    }

    // Query specific client and check password_hash
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
          all_clients_count: allClients?.length || 0,
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
