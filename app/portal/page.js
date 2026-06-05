import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase'
import CustomerPortal from '@/components/CustomerPortal'

export const metadata = { title: '내 프로젝트 — 우아라빈' }

export default async function PortalPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const { data: inquiries } = await getSupabaseAdmin()
    .from('inquiries')
    .select('*, project_files(*)')
    .eq('user_email', session.user.email)
    .order('created_at', { ascending: false })

  return (
    <div style={{ minHeight: '100vh', padding: '100px 24px 80px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 8 }}>내 프로젝트</h1>
          <p style={{ color: 'var(--fg2)', fontSize: 14 }}>의뢰하신 프로젝트의 진행 현황을 확인하세요.</p>
        </div>
        <CustomerPortal inquiries={inquiries ?? []} />
      </div>
    </div>
  )
}
