import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase'
import AdminDashboard from '@/components/AdminDashboard'

export const metadata = {
  title: '어드민 — 우아라빈',
}

export default async function AdminPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const { data: userRecord } = await getSupabaseAdmin()
    .from('users')
    .select('role')
    .eq('email', session.user.email)
    .single()

  if (!userRecord || userRecord.role !== 'admin') redirect('/')

  const { data: inquiries } = await getSupabaseAdmin()
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false })

  return <AdminDashboard initialInquiries={inquiries ?? []} />
}
