import { auth } from '@/auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

async function isAdmin(email) {
  const { data } = await getSupabaseAdmin().from('users').select('role').eq('email', email).single()
  return data?.role === 'admin'
}

export async function POST(req) {
  const session = await auth()
  if (!session || !(await isAdmin(session.user.email))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { messageId, reply } = await req.json()
  if (!messageId || !reply?.trim()) {
    return NextResponse.json({ error: '답변 내용을 입력해주세요.' }, { status: 400 })
  }

  // 문의 정보 + 의뢰 정보 가져오기
  const { data: msg } = await getSupabaseAdmin()
    .from('customer_messages')
    .select('*, inquiries(title, user_email, user_name)')
    .eq('id', messageId)
    .single()

  if (!msg) return NextResponse.json({ error: '문의를 찾을 수 없습니다.' }, { status: 404 })

  const { error } = await getSupabaseAdmin()
    .from('customer_messages')
    .update({ reply: reply.trim(), replied_at: new Date().toISOString(), is_read: true })
    .eq('id', messageId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // 고객에게 답변 이메일
  const inq = msg.inquiries
  if (inq) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: inq.user_email,
      subject: `[루카이든] 문의 답변 — ${inq.title}`,
      html: `
        <h2>안녕하세요, ${inq.user_name}님!</h2>
        <p>문의하신 내용에 대한 답변을 보내드립니다.</p>
        <div style="background:#f5f5f5;padding:12px 16px;border-radius:8px;margin:12px 0">
          <p style="font-size:13px;color:#666;margin:0 0 4px">고객님 문의</p>
          <p style="white-space:pre-wrap;margin:0">${msg.message}</p>
        </div>
        <div style="background:#e8f4fd;padding:12px 16px;border-radius:8px;margin:12px 0">
          <p style="font-size:13px;color:#0ea5e9;margin:0 0 4px">답변</p>
          <p style="white-space:pre-wrap;margin:0">${reply}</p>
        </div>
        <p><a href="${process.env.NEXTAUTH_URL}/portal">포털에서 확인하기 →</a></p>
      `,
    }).catch(e => console.error('Email error:', e))
  }

  return NextResponse.json({ ok: true, replied_at: new Date().toISOString() })
}
