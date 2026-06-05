import { auth } from '@/auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

async function isAdmin(email) {
  const { data } = await getSupabaseAdmin()
    .from('users')
    .select('role')
    .eq('email', email)
    .single()
  return data?.role === 'admin'
}

export async function POST(req, { params }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!(await isAdmin(session.user.email))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const formData = await req.formData()
  const file = formData.get('file')

  if (!file) return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const ext = file.name.split('.').pop()
  const path = `${id}/${Date.now()}.${ext}`

  const { error } = await getSupabaseAdmin()
    .storage
    .from('deliveries')
    .upload(path, buffer, { contentType: file.type, upsert: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = getSupabaseAdmin()
    .storage
    .from('deliveries')
    .getPublicUrl(path)

  return NextResponse.json({ url: publicUrl })
}
