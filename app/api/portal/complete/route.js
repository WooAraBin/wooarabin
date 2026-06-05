import { auth } from '@/auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { inquiryId } = await req.json()

  const { data: inquiry } = await getSupabaseAdmin()
    .from('inquiries').select('id, user_email, status').eq('id', inquiryId).single()

  if (!inquiry || inquiry.user_email !== session.user.email) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (inquiry.status !== 'in_progress') {
    return NextResponse.json({ error: '진행중 상태에서만 완료 처리 가능합니다.' }, { status: 400 })
  }

  const { error } = await getSupabaseAdmin()
    .from('inquiries')
    .update({ status: 'pending_payment', completed_at: new Date().toISOString() })
    .eq('id', inquiryId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
