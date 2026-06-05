import { auth } from '@/auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

async function isAdmin(email) {
  const { data } = await getSupabaseAdmin()
    .from('users')
    .select('role')
    .eq('email', email)
    .single()
  return data?.role === 'admin'
}

export async function PATCH(req, { params }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!(await isAdmin(session.user.email))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const { action } = body

  const resend = new Resend(process.env.RESEND_API_KEY)

  const { data: inquiry } = await getSupabaseAdmin()
    .from('inquiries')
    .select('*')
    .eq('id', id)
    .single()

  if (!inquiry) return NextResponse.json({ error: '의뢰를 찾을 수 없습니다.' }, { status: 404 })

  // 검토 시작 → 고객에게 검토 시작 메일 + 검토중으로 변경
  if (action === 'start_review') {
    const { reviewNote } = body
    if (!reviewNote?.trim()) return NextResponse.json({ error: '메일 본문을 입력해주세요.' }, { status: 400 })

    const { error } = await getSupabaseAdmin()
      .from('inquiries')
      .update({ status: 'reviewing', review_note: reviewNote })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: inquiry.user_email,
      subject: `[우아라빈] 프로젝트 검토가 시작되었습니다`,
      html: `
        <h2>안녕하세요, ${inquiry.user_name}님!</h2>
        <p>의뢰하신 프로젝트 <strong>${inquiry.title}</strong> 검토를 시작하였습니다.</p>
        <hr/>
        <p style="white-space:pre-wrap">${reviewNote}</p>
        <p style="color:#888;font-size:13px">견적은 별도 메일로 발송됩니다.</p>
      `,
    }).catch(e => console.error('Email error:', e))

    return NextResponse.json({ ok: true, status: 'reviewing' })
  }

  // 견적 발송 → 고객에게 견적 메일 + 견적발송으로 변경
  if (action === 'send_quote') {
    const { quoteNote } = body
    if (!quoteNote?.trim()) return NextResponse.json({ error: '견적 내용을 입력해주세요.' }, { status: 400 })

    const { error } = await getSupabaseAdmin()
      .from('inquiries')
      .update({ status: 'quoted', review_note: quoteNote })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: inquiry.user_email,
      subject: `[우아라빈] 견적서가 도착했습니다 — ${inquiry.title}`,
      html: `
        <h2>안녕하세요, ${inquiry.user_name}님!</h2>
        <p>고객님께서 의뢰하신 프로젝트의 견적은 아래와 같으며,${inquiry.deadline ? ` 일정은 요청하신 기한(<strong>${inquiry.deadline}</strong>) 내에 완료될 예정입니다.` : ' 일정은 아래 내용을 참고해 주세요.'}</p>
        <hr/>
        <p style="white-space:pre-wrap">${quoteNote}</p>
        <p>문의사항은 이 메일에 회신해 주세요.</p>
      `,
    }).catch(e => console.error('Email error:', e))

    return NextResponse.json({ ok: true, status: 'quoted' })
  }

  // 작업 시작 → 금액 기록 + 진행중으로 변경
  if (action === 'start_work') {
    const { finalAmount, depositAmount } = body
    if (!finalAmount) return NextResponse.json({ error: '최종 금액을 입력해주세요.' }, { status: 400 })

    const { error } = await getSupabaseAdmin()
      .from('inquiries')
      .update({
        status: 'in_progress',
        final_amount: parseInt(finalAmount),
        deposit_amount: depositAmount ? parseInt(depositAmount) : null,
        work_started_at: new Date().toISOString(),
      })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true, status: 'in_progress' })
  }

  // 결과물 납품 → 고객 검토 요청 (in_progress 유지, 파일/메모만 저장)
  if (action === 'complete') {
    const { deliveryNote, deliveryFileUrl } = body

    const { error } = await getSupabaseAdmin()
      .from('inquiries')
      .update({
        delivery_note: deliveryNote || null,
        delivery_file_url: deliveryFileUrl || null,
      })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: inquiry.user_email,
      subject: `[우아라빈] 결과물을 확인해주세요 — ${inquiry.title}`,
      html: `
        <h2>안녕하세요, ${inquiry.user_name}님!</h2>
        <p>프로젝트 <strong>${inquiry.title}</strong>의 결과물이 준비되었습니다. 확인 후 포털에서 완료 버튼을 눌러주세요.</p>
        ${deliveryNote ? `<hr/><p style="white-space:pre-wrap">${deliveryNote}</p>` : ''}
        ${deliveryFileUrl ? `<p><a href="${deliveryFileUrl}" style="color:#0ea5e9">결과물 다운로드 →</a></p>` : ''}
        <p><a href="${process.env.NEXTAUTH_URL}/portal" style="color:#0ea5e9">포털에서 확인하기 →</a></p>
      `,
    }).catch(e => console.error('Email error:', e))

    return NextResponse.json({ ok: true, status: 'in_progress' })
  }

  // 최종 완료 (어드민이 입금 확인 후 처리)
  if (action === 'final_complete') {
    const { error } = await getSupabaseAdmin()
      .from('inquiries')
      .update({ status: 'completed' })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, status: 'completed' })
  }

  return NextResponse.json({ error: '알 수 없는 액션입니다.' }, { status: 400 })
}
