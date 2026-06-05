import Link from 'next/link'
import { auth, signOut } from '@/auth'

export default async function Header() {
  const session = await auth()

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      borderBottom: '1px solid var(--border)',
      background: 'rgba(10,10,10,0.92)',
      backdropFilter: 'blur(12px)'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
        <Link href="/" style={{ fontWeight: 900, fontSize: 18, letterSpacing: '-0.5px' }}>우아라빈</Link>

        <div style={{ display: 'flex', gap: 24, fontSize: 13, color: 'var(--fg2)', alignItems: 'center' }}>
          <Link href="/#work">작업물</Link>
          <Link href="/#services">서비스</Link>

          {session ? (
            // 로그인 상태
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {session.user?.role === 'admin' && (
                <Link href="/admin" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700 }}>관리자</Link>
              )}
              <Link href="/portal" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {session.user?.image && (
                  <img src={session.user.image} alt="" width={28} height={28}
                    style={{ borderRadius: '50%', border: '2px solid var(--border)' }} />
                )}
                <span style={{ fontSize: 13, color: 'var(--fg2)' }}>{session.user?.name}</span>
              </Link>
              <form action={async () => { 'use server'; await signOut({ redirectTo: '/' }) }}>
                <button type="submit" style={{
                  background: 'none', border: '1px solid var(--border)',
                  color: 'var(--fg2)', padding: '6px 14px', borderRadius: 6,
                  fontSize: 12, cursor: 'pointer', fontFamily: 'inherit'
                }}>로그아웃</button>
              </form>
            </div>
          ) : (
            // 비로그인 상태
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <Link href="/login" style={{
                border: '1px solid var(--border)', padding: '7px 16px',
                borderRadius: 6, fontSize: 13, color: 'var(--fg2)'
              }}>로그인</Link>
              <Link href="/contact" style={{
                background: 'var(--accent)', color: '#000',
                padding: '7px 16px', borderRadius: 6,
                fontWeight: 700, fontSize: 13
              }}>의뢰하기</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
