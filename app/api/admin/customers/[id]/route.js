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
  const body = await req.json()

  const update = {}
  if (typeof body.remark === 'string') update.remark = body.remark
  if (body.role !== undefined) {
    const allowed = ['user', 'admin', 'trainer']
    if (!allowed.includes(body.role)) {
      return NextResponse.json({ error: 'invalid role' }, { status: 400 })
    }
    update.role = body.role
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'nothing to update' }, { status: 400 })
  }

  const { error } = await getSupabaseAdmin().from('users').update(update).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
