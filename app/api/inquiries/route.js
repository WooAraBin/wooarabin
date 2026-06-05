import { auth } from '@/auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

export async function POST(req) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const body = await req.json()
  const { projectType, title, description, budget, deadline, referenceUrl, inquiryType, attachmentUrl } = body

  if (!title || !description) {
    return NextResponse.json({ error: '필수 항목을 입력해주세요.' }, { status: 400 })
  }

  const { data, error } = await getSupabaseAdmin()
    .from('inquiries')
    .insert({
      user_email: session.user.email,
      user_name: session.user.name,
      inquiry_type: inquiryType || 'new',
      project_type: projectType || 'AS',
      title,
      description,
      budget: budget || null,
      deadline: deadline || null,
      reference_url: referenceUrl || null,
      attachment_url: attachmentUrl || null,
      status: 'received',
    })
    .select()
    .single()

  if (error) {
    console.error('Supabase error:', error.message)
    return NextResponse.json({ error: '저장 중 오류가 발생했습니다.' }, { status: 500 })
  }

  // 관리자에게 알림 이메일
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: process.env.ADMIN_EMAIL,
    subject: `[우아라빈] 새 프로젝트 의뢰: ${title}`,
    html: `
      <h2>새 프로젝트 의뢰가 접수되었습니다</h2>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">의뢰인</td><td style="padding:8px;border:1px solid #eee">${session.user.name} (${session.user.email})</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">유형</td><td style="padding:8px;border:1px solid #eee">${projectType}</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">제목</td><td style="padding:8px;border:1px solid #eee">${title}</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">예산</td><td style="padding:8px;border:1px solid #eee">${budget || '미입력'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">희망 일정</td><td style="padding:8px;border:1px solid #eee">${deadline || '미입력'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">참고 사이트</td><td style="padding:8px;border:1px solid #eee">${referenceUrl || '없음'}</td></tr>
      </table>
      <h3>프로젝트 설명</h3>
      <p style="white-space:pre-wrap">${description}</p>
      <p><a href="${process.env.NEXTAUTH_URL}/admin">어드민에서 확인하기 →</a></p>
    `,
  }).catch(e => console.error('Admin email error:', e))

  // 의뢰인에게 접수 확인 이메일
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: session.user.email,
    subject: '[우아라빈] 프로젝트 의뢰가 접수되었습니다',
    html: `
      <h2>안녕하세요, ${session.user.name}님!</h2>
      <p>프로젝트 의뢰가 정상적으로 접수되었습니다.</p>
      <p>검토 후 <strong>${session.user.email}</strong>로 견적을 보내드리겠습니다.</p>
      <hr />
      <p><strong>의뢰 제목:</strong> ${title}</p>
      <p><strong>유형:</strong> ${projectType}</p>
      <p style="color:#888;font-size:13px">통상 1~3 영업일 내에 답변드립니다.</p>
    `,
  }).catch(e => console.error('User email error:', e))

  return NextResponse.json({ id: data.id }, { status: 201 })
}
