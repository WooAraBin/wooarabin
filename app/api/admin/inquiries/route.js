import { auth } from '@/auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

async function isAdmin(email) {
  const { data } = await getSupabaseAdmin().from('users').select('role').eq('email', email).single()
  return data?.role === 'admin'
}

// 의뢰 전부 삭제 (연결된 메시지/파일/메모/전달물까지)
export async function DELETE() {
  const session = await auth()
  if (!session || !(await isAdmin(session.user.email))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const db = getSupabaseAdmin()
  // 자식 레코드 먼저 삭제 (FK 제약 회피)
  const children = ['customer_messages', 'project_files', 'inquiry_notes', 'deliveries']
  for (const table of children) {
    const { error } = await db.from(table).delete().not('id', 'is', null)
    // 테이블이 없거나 컬럼 구조가 다른 경우는 무시하고 진행
    if (error && !/does not exist|relation/i.test(error.message)) {
      return NextResponse.json({ error: `${table}: ${error.message}` }, { status: 500 })
    }
  }

  const { error } = await db.from('inquiries').delete().not('id', 'is', null)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
