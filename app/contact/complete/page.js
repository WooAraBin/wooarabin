import Link from 'next/link'

export const metadata = {
  title: '의뢰 접수 완료 — 우아라빈',
}

export default function ContactCompletePage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ fontSize: 48, marginBottom: 24 }}>✓</div>
        <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 12 }}>
          의뢰가 접수되었습니다
        </h1>
        <p style={{ color: 'var(--fg2)', fontSize: 14, lineHeight: 1.8, marginBottom: 36 }}>
          검토 후 <strong style={{ color: 'var(--fg)' }}>1~3 영업일 내</strong>에 이메일로 연락드리겠습니다.<br />
          문의사항은 이메일로 보내주세요.
        </p>
        <Link href="/" style={{
          display: 'inline-block', padding: '12px 28px',
          background: 'var(--accent)', color: '#000',
          borderRadius: 8, fontWeight: 700, fontSize: 14,
        }}>
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  )
}
