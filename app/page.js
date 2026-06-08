import Link from 'next/link'

const services = [
  { icon: '🌐', title: '웹 개발', desc: '반응형 웹사이트, 랜딩 페이지, 관리자 대시보드' },
  { icon: '📱', title: '앱 개발', desc: 'iOS · Android 크로스플랫폼 앱 (React Native)' },
  { icon: '🤖', title: 'AI 서비스', desc: 'RAG 챗봇, 영상 분석, LLM 기반 자동화' },
  { icon: '🔗', title: '시스템 연동', desc: '결제, 알림, 외부 API 통합' },
]

const works = [
  { title: 'LENZ', desc: '글로벌 시장 실시간 분석 에이전트 — AI 기반 시장 데이터 분석 PWA', tag: 'Web · AI', year: '2026', img: '/works/lenz.png' },
  { title: 'MeetLog', desc: 'AI 회의록 자동 정리 — 녹음·음성 파일을 Gemini가 요약하고 결정사항 추출', tag: 'Web · AI', year: '2026', img: '/works/meetlog.png' },
  { title: '미식록', desc: '우리집 맛집 아카이브 — 지도에 맛집을 기록하고 평점·리뷰로 정리', tag: 'Web · App', year: '2026', img: '/works/misikrok.png' },
  { title: 'Quick Note', desc: 'Notion 연동 빠른 메모 앱 — 한 번에 캡처해 노션에 자동 저장', tag: 'Web · App', year: '2026', img: '/works/quicknote.png' },
]

export default function Home() {
  return (
    <div style={{ minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{ paddingTop: 160, paddingBottom: 120 }}>
        <div className="container">
          <p style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700, letterSpacing: '.1em', marginBottom: 20 }}>WEB · APP · AI DEVELOPMENT</p>
          <h1 style={{ fontSize: 'clamp(48px, 8vw, 96px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-2px', marginBottom: 32 }}>
            아이디어를<br />현실로 만듭니다
          </h1>
          <p style={{ fontSize: 18, color: 'var(--fg2)', maxWidth: 480, lineHeight: 1.7, marginBottom: 48 }}>
            웹·앱 개발부터 AI 서비스 구축까지.<br />
            기술로 비즈니스 문제를 해결합니다.
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--accent)', color: '#000', padding: '14px 28px', borderRadius: 8, fontWeight: 800, fontSize: 15 }}>
              프로젝트 의뢰하기 →
            </Link>
            <Link href="#work" style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--border)', padding: '14px 28px', borderRadius: 8, fontSize: 15 }}>
              작업물 보기
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '48px 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 32 }}>
          {[
            { n: 'AI 협업', label: 'Claude와 함께 개발' },
            { n: '빠른 납기', label: '일정 준수' },
            { n: '직접 소통', label: '중간 과정 없음' },
            { n: '합리적', label: '투명한 가격' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--accent)' }}>{s.n}</div>
              <div style={{ fontSize: 13, color: 'var(--fg2)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="services" style={{ padding: '100px 0' }}>
        <div className="container">
          <p style={{ fontSize: 12, color: 'var(--fg2)', letterSpacing: '.1em', fontWeight: 700, marginBottom: 12 }}>SERVICES</p>
          <h2 style={{ fontSize: 40, fontWeight: 900, letterSpacing: '-1px', marginBottom: 48 }}>무엇을 만들어드리나요</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 2 }}>
            {services.map((s, i) => (
              <div key={i} style={{ padding: 32, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>{s.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Work */}
      <section id="work" style={{ padding: '100px 0', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <p style={{ fontSize: 12, color: 'var(--fg2)', letterSpacing: '.1em', fontWeight: 700, marginBottom: 12 }}>WORK</p>
          <h2 style={{ fontSize: 40, fontWeight: 900, letterSpacing: '-1px', marginBottom: 48 }}>최근 작업물</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {works.map((w, i) => (
              <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', background: '#111' }}>
                <div style={{ aspectRatio: '16 / 10', overflow: 'hidden', borderBottom: '1px solid var(--border)', background: '#fff' }}>
                  <img src={w.img} alt={w.title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }} />
                </div>
                <div style={{ padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <h3 style={{ fontSize: 19, fontWeight: 800 }}>{w.title}</h3>
                    <span style={{ fontSize: 12, color: 'var(--fg2)' }}>{w.year}</span>
                  </div>
                  <p style={{ fontSize: 13.5, color: 'var(--fg2)', lineHeight: 1.65, marginBottom: 14 }}>{w.desc}</p>
                  <span style={{ fontSize: 11, color: 'var(--fg2)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: 99 }}>{w.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '120px 0', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 900, letterSpacing: '-2px', marginBottom: 24 }}>
            함께 만들어봐요
          </h2>
          <p style={{ fontSize: 16, color: 'var(--fg2)', marginBottom: 40 }}>
            아이디어가 있다면 지금 바로 문의해주세요.<br />빠르게 검토 후 연락드립니다.
          </p>
          <Link href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--accent)', color: '#000', padding: '18px 40px', borderRadius: 8, fontWeight: 900, fontSize: 16 }}>
            프로젝트 의뢰하기 →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '40px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <span style={{ fontWeight: 900, fontSize: 16 }}>우아라빈</span>
          <span style={{ fontSize: 13, color: 'var(--fg2)' }}>© 2026 WooAraBin. All rights reserved.</span>
        </div>
      </footer>

    </div>
  )
}
