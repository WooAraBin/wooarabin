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
  // 자식 레코드 먼저 삭제 (FK 제약 회피). 자식 삭제 오류는 무시(없는 테이블 등) 후 부모 시도.
  const children = ['customer_messages', 'project_files', 'inquiry_notes', 'deliveries']
  for (const table of children) {
    await db.from(table).delete().not('id', 'is', null)
  }

  const { error } = await db.from('inquiries').delete().not('id', 'is', null)
  if (error) {
    // 정확한 원인을 그대로 노출 (FK 위반 테이블명 등)
    return NextResponse.json({ error: `${error.message}${error.details ? ` (${error.details})` : ''}` }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
