import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase'
import AdminDashboard from '@/components/AdminDashboard'
import AdminRevenue from '@/components/AdminRevenue'
import AdminCustomers from '@/components/AdminCustomers'

export const metadata = { title: '어드민 — 우아라빈' }

export default async function AdminPage({ searchParams }) {
  const session = await auth()
  if (!session) redirect('/login')

  const { data: userRecord } = await getSupabaseAdmin()
    .from('users').select('role').eq('email', session.user.email).single()
  if (!userRecord || userRecord.role !== 'admin') redirect('/')

  const params = await searchParams
  const tab = params.tab || 'inquiries'

  const [{ data: inquiries }, { data: customers }] = await Promise.all([
    getSupabaseAdmin().from('inquiries').select('*').order('created_at', { ascending: false }),
    getSupabaseAdmin().from('users').select('*, inquiries(phone_number, created_at)').order('created_at', { ascending: false }),
  ])

  return (
    <div style={{ marginTop: 60 }}>
      {/* 탭 */}
      <div style={{ borderBottom: '1px solid var(--border)', display: 'flex', paddingLeft: 24 }}>
        {[
          { key: 'inquiries', label: '의뢰 관리' },
          { key: 'revenue',   label: '매출 현황' },
          { key: 'customers', label: '고객 현황' },
        ].map(({ key, label }) => (
          <a key={key} href={`/admin?tab=${key}`} style={{
            padding: '14px 20px', fontSize: 14, fontWeight: tab === key ? 700 : 400,
            color: tab === key ? 'var(--fg)' : 'var(--fg2)',
            borderBottom: tab === key ? '2px solid var(--accent)' : '2px solid transparent',
            textDecoration: 'none', transition: 'all .15s',
          }}>{label}</a>
        ))}
      </div>

      {tab === 'inquiries' && <AdminDashboard initialInquiries={inquiries ?? []} />}
      {tab === 'revenue'   && <AdminRevenue inquiries={inquiries ?? []} />}
      {tab === 'customers' && <AdminCustomers customers={customers ?? []} />}
    </div>
  )
}
