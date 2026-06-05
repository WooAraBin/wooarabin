import { auth } from '@/auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

async function isAdmin(email) {
  const { data } = await getSupabaseAdmin().from('users').select('role').eq('email', email).single()
  return data?.role === 'admin'
}

export async function PATCH(req, { params }) {
  const session = await auth()
  if (!session || !(await isAdmin(session.user.email))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const { type } = await req.json()
  const now = new Date().toISOString()

  const update = type === 'deposit'
    ? { deposit_confirmed: true, deposit_confirmed_at: now }
    : { final_confirmed: true, final_confirmed_at: now }

  const { error } = await getSupabaseAdmin().from('inquiries').update(update).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
