import { auth } from '@/auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

async function isAdmin(email) {
  const { data } = await getSupabaseAdmin().from('users').select('role').eq('email', email).single()
  return data?.role === 'admin'
}

export async function GET(req, { params }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { data, error } = await getSupabaseAdmin()
    .from('project_files')
    .select('*')
    .eq('inquiry_id', id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req, { params }) {
  const session = await auth()
  if (!session || !(await isAdmin(session.user.email))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const formData = await req.formData()
  const file = formData.get('file')
  const note = formData.get('note') || ''

  if (!file) return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `${id}/${Date.now()}_${safeName}`

  const { error: uploadError } = await getSupabaseAdmin()
    .storage.from('deliveries').upload(path, buffer, { contentType: file.type, upsert: false })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: { signedUrl } } = await getSupabaseAdmin()
    .storage.from('deliveries').createSignedUrl(path, 60 * 60 * 24 * 365)

  const { data: fileRecord, error: dbError } = await getSupabaseAdmin()
    .from('project_files')
    .insert({ inquiry_id: id, file_url: signedUrl, file_name: file.name, note })
    .select().single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  // 고객에게 알림 이메일
  const { data: inquiry } = await getSupabaseAdmin()
    .from('inquiries').select('title, user_email, user_name').eq('id', id).single()

  if (inquiry) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: inquiry.user_email,
      subject: `[우아라빈] 중간 자료가 전달되었습니다 — ${inquiry.title}`,
      html: `
        <h2>안녕하세요, ${inquiry.user_name}님!</h2>
        <p>프로젝트 <strong>${inquiry.title}</strong>의 중간 자료를 전달드립니다.</p>
        ${note ? `<p style="white-space:pre-wrap">${note}</p>` : ''}
        <p><a href="${signedUrl}" style="color:#0ea5e9">📎 ${file.name} 다운로드 →</a></p>
        <p style="color:#888;font-size:13px">문의사항은 이 메일에 회신해 주세요.</p>
      `,
    }).catch(e => console.error('Email error:', e))
  }

  return NextResponse.json(fileRecord, { status: 201 })
}
