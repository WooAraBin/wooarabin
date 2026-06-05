import { auth } from '@/auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

export async function POST(req) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { inquiryId, type } = await req.json() // type: 'deposit' | 'final'

  const { data: inquiry } = await getSupabaseAdmin()
    .from('inquiries')
    .select('id, user_email, user_name, title, inquiry_number, deposit_amount, final_amount')
    .eq('id', inquiryId)
    .single()

  if (!inquiry || inquiry.user_email !== session.user.email) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const label = type === 'deposit' ? '선입금' : '잔금'
  const amount = type === 'deposit' ? inquiry.deposit_amount : (inquiry.final_amount - (inquiry.deposit_amount || 0))

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: process.env.ADMIN_EMAIL,
    subject: `[우아라빈] ${label} 입금 알림 — ${inquiry.inquiry_number || inquiry.title}`,
    html: `
      <h2>${label} 입금 알림</h2>
      <p><strong>${inquiry.user_name}</strong>님이 ${label} 입금 완료를 알렸습니다.</p>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">접수번호</td><td style="padding:8px;border:1px solid #eee">${inquiry.inquiry_number || '-'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">프로젝트</td><td style="padding:8px;border:1px solid #eee">${inquiry.title}</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">구분</td><td style="padding:8px;border:1px solid #eee">${label}</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">금액</td><td style="padding:8px;border:1px solid #eee">${amount?.toLocaleString()}원</td></tr>
      </table>
      <p><a href="${process.env.NEXTAUTH_URL}/admin?tab=revenue">매출 현황에서 입금 확인하기 →</a></p>
    `,
  }).catch(e => console.error('Email error:', e))

  return NextResponse.json({ ok: true })
}
