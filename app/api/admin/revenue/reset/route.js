import { auth } from '@/auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

async function isAdmin(email) {
  const { data } = await getSupabaseAdmin().from('users').select('role').eq('email', email).single()
  return data?.role === 'admin'
}

// 매출 기록 전부 초기화 (입금확인 해제 + 금액 비움, 의뢰 자체는 유지)
export async function POST() {
  const session = await auth()
  if (!session || !(await isAdmin(session.user.email))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await getSupabaseAdmin()
    .from('inquiries')
    .update({
      deposit_confirmed: false,
      deposit_confirmed_at: null,
      final_confirmed: false,
      final_confirmed_at: null,
      deposit_amount: null,
      final_amount: null,
    })
    .not('id', 'is', null)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
