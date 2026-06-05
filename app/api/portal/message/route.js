import { auth } from '@/auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { inquiryId, message } = await req.json()
  if (!inquiryId || !message?.trim()) {
    return NextResponse.json({ error: '내용을 입력해주세요.' }, { status: 400 })
  }

  // 본인 의뢰인지 확인
  const { data: inquiry } = await getSupabaseAdmin()
    .from('inquiries').select('id, user_email').eq('id', inquiryId).single()
  if (!inquiry || inquiry.user_email !== session.user.email) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await getSupabaseAdmin()
    .from('customer_messages')
    .insert({ inquiry_id: inquiryId, message: message.trim() })
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
