import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import InquiryTabs from '@/components/InquiryTabs'

export const metadata = {
  title: '프로젝트 의뢰 — 루카이든',
}

export default async function ContactPage() {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div style={{ minHeight: '100vh', padding: '100px 24px 80px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 10 }}>
            의뢰하기
          </h1>
          <p style={{ color: 'var(--fg2)', fontSize: 14, lineHeight: 1.7 }}>
            검토 후 1~3 영업일 내에 이메일로 연락드립니다.
          </p>
        </div>
        <InquiryTabs user={session.user} />
      </div>
    </div>
  )
}
