import { signIn, auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const session = await auth()
  if (session) redirect('/')

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontWeight: 900, fontSize: 24, letterSpacing: '-0.5px', marginBottom: 8 }}>우아라빈</div>
          <p style={{ color: 'var(--fg2)', fontSize: 14 }}>로그인하고 프로젝트 현황을 확인하세요</p>
        </div>

        {/* 소셜 로그인 버튼들 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* 카카오 */}
          <form action={async () => { 'use server'; await signIn('kakao', { redirectTo: '/' }) }}>
            <button type="submit" style={{
              width: '100%', padding: '14px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: '#FEE500', color: '#000', fontWeight: 700, fontSize: 15,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              fontFamily: 'inherit',
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2C5.582 2 2 4.91 2 8.5c0 2.29 1.452 4.3 3.652 5.51L4.8 17.1a.25.25 0 00.36.28l4.02-2.68c.27.03.54.05.82.05 4.418 0 8-2.91 8-6.5S14.418 2 10 2z" fill="#000" fillOpacity=".85"/>
              </svg>
              카카오로 로그인
            </button>
          </form>

          {/* 네이버 */}
          <form action={async () => { 'use server'; await signIn('naver', { redirectTo: '/' }) }}>
            <button type="submit" style={{
              width: '100%', padding: '14px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: '#03C75A', color: '#fff', fontWeight: 700, fontSize: 15,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              fontFamily: 'inherit',
            }}>
              <span style={{ fontWeight: 900, fontSize: 18, lineHeight: 1 }}>N</span>
              네이버로 로그인
            </button>
          </form>

          {/* 구글 */}
          <form action={async () => { 'use server'; await signIn('google', { redirectTo: '/' }) }}>
            <button type="submit" style={{
              width: '100%', padding: '14px 20px', borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer',
              background: '#fff', color: '#000', fontWeight: 700, fontSize: 15,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              fontFamily: 'inherit',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google로 로그인
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--fg2)', marginTop: 32, lineHeight: 1.7 }}>
          로그인 시 <a href="#" style={{ color: 'var(--fg2)', textDecoration: 'underline' }}>이용약관</a> 및{' '}
          <a href="#" style={{ color: 'var(--fg2)', textDecoration: 'underline' }}>개인정보처리방침</a>에 동의하게 됩니다.
        </p>
      </div>
    </div>
  )
}
