import { auth } from '@/auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

async function isAdmin(email) {
  const { data } = await getSupabaseAdmin().from('users').select('role').eq('email', email).single()
  return data?.role === 'admin'
}

export async function GET(req) {
  const session = await auth()
  if (!session || !(await isAdmin(session.user.email))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const inquiryId = searchParams.get('inquiryId')
  if (!inquiryId) return NextResponse.json({ error: 'inquiryId 필요' }, { status: 400 })

  const { data, error } = await getSupabaseAdmin()
    .from('customer_messages')
    .select('*')
    .eq('inquiry_id', inquiryId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
