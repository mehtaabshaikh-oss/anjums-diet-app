import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = createAdminClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all types of notes
    const [
      generalNotes,
      profileNotes,
      weightNotes,
      measurementNotes,
      leadNotes,
    ] = await Promise.all([
      // General notes from notes table
      supabase
        .from('notes')
        .select('id, content, created_at')
        .eq('client_id', id)
        .order('created_at', { ascending: false }),

      // Notes from client profile
      supabase
        .from('client_profiles')
        .select('notes, id')
        .eq('client_id', id)
        .single(),

      // Notes from weight logs
      supabase
        .from('weight_logs')
        .select('id, notes, logged_date, weight_kg, created_at')
        .eq('client_id', id)
        .not('notes', 'is', null)
        .order('created_at', { ascending: false }),

      // Notes from measurements logs
      supabase
        .from('measurements_logs')
        .select('id, notes, logged_date, created_at')
        .eq('client_id', id)
        .not('notes', 'is', null)
        .order('created_at', { ascending: false }),

      // Notes from lead (if converted from lead)
      supabase
        .from('clients')
        .select('lead_id, leads(notes, created_at)')
        .eq('id', id)
        .single(),
    ])

    // Aggregate all notes into a unified array
    const allNotes = []

    // Add general notes
    if (generalNotes.data) {
      generalNotes.data.forEach((note) => {
        allNotes.push({
          id: `note-${note.id}`,
          type: 'general',
          content: note.content,
          created_at: note.created_at,
          metadata: {},
        })
      })
    }

    // Add profile notes
    if (profileNotes.data?.notes) {
      allNotes.push({
        id: `profile-${profileNotes.data.id}`,
        type: 'profile',
        content: profileNotes.data.notes,
        created_at: null,
        metadata: {},
      })
    }

    // Add weight log notes
    if (weightNotes.data) {
      weightNotes.data.forEach((log) => {
        allNotes.push({
          id: `weight-${log.id}`,
          type: 'weight',
          content: log.notes,
          created_at: log.created_at,
          metadata: {
            logged_date: log.logged_date,
            weight_kg: log.weight_kg,
          },
        })
      })
    }

    // Add measurement log notes
    if (measurementNotes.data) {
      measurementNotes.data.forEach((log) => {
        allNotes.push({
          id: `measurement-${log.id}`,
          type: 'measurement',
          content: log.notes,
          created_at: log.created_at,
          metadata: {
            logged_date: log.logged_date,
          },
        })
      })
    }

    // Add lead notes
    if (leadNotes.data?.leads) {
      leadNotes.data.leads.forEach((lead: any) => {
        if (lead.notes) {
          allNotes.push({
            id: `lead-${lead.id}`,
            type: 'lead',
            content: lead.notes,
            created_at: lead.created_at,
            metadata: {},
          })
        }
      })
    }

    // Sort by created_at, nulls last
    allNotes.sort((a, b) => {
      if (!a.created_at) return 1
      if (!b.created_at) return -1
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    return NextResponse.json(allNotes)
  } catch (error) {
    console.error('Error fetching notes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = createAdminClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content } = await req.json()

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Note content is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('notes')
      .insert({
        client_id: id,
        content: content.trim(),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating note:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
