import { auth } from '@/auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

const MAX_BYTES = 10 * 1024 * 1024 // 10MB

export async function POST(req) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file')

  if (!file) return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 })
  if (file.size > MAX_BYTES) return NextResponse.json({ error: '파일 크기는 10MB 이하여야 합니다.' }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const ext = file.name.split('.').pop()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `${session.user.email}/${Date.now()}_${safeName}`

  const { error } = await getSupabaseAdmin()
    .storage
    .from('inquiry-attachments')
    .upload(path, buffer, { contentType: file.type, upsert: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // signed URL (24시간) — private 버킷이므로 signed URL로 접근
  const { data } = await getSupabaseAdmin()
    .storage
    .from('inquiry-attachments')
    .createSignedUrl(path, 60 * 60 * 24 * 365) // 1년

  return NextResponse.json({ url: data.signedUrl, path, name: file.name })
}
