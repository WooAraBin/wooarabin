import Link from 'next/link'
import { notFound } from 'next/navigation'
import { works, getWork } from '@/lib/works'

export function generateStaticParams() {
  return works.map((w) => ({ slug: w.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const w = getWork(slug)
  return { title: w ? `${w.title} — 우아라빈` : '작업물 — 우아라빈' }
}

export default async function WorkDetail({ params }) {
  const { slug } = await params
  const w = getWork(slug)
  if (!w) notFound()

  return (
    <div style={{ minHeight: '100vh', paddingTop: 100, paddingBottom: 120 }}>
      <div className="container" style={{ maxWidth: 880 }}>
        <Link href="/#work" style={{ fontSize: 13, color: 'var(--fg2)' }}>← 작업물</Link>

        {/* Header */}
        <div style={{ marginTop: 24, marginBottom: 40 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {w.tags.map((t, i) => (
              <span key={i} style={{ fontSize: 11, color: 'var(--accent)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: 99 }}>{t}</span>
            ))}
            <span style={{ fontSize: 12, color: 'var(--fg2)', alignSelf: 'center' }}>{w.year}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: 14 }}>{w.title}</h1>
          <p style={{ fontSize: 18, color: 'var(--fg2)', lineHeight: 1.6 }}>{w.tagline}</p>
        </div>

        {/* Overview */}
        <p style={{ fontSize: 15.5, lineHeight: 1.9, color: 'var(--fg)', opacity: 0.92, marginBottom: 48 }}>{w.overview}</p>

        {/* Features + Tech */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 32, marginBottom: 56 }}>
          <div>
            <p style={{ fontSize: 12, color: 'var(--fg2)', letterSpacing: '.1em', fontWeight: 700, marginBottom: 16 }}>주요 기능</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {w.features.map((f, i) => (
                <li key={i} style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--fg)', display: 'flex', gap: 10 }}>
                  <span style={{ color: 'var(--accent)', flexShrink: 0 }}>—</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p style={{ fontSize: 12, color: 'var(--fg2)', letterSpacing: '.1em', fontWeight: 700, marginBottom: 16 }}>기술 스택</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {w.tech.map((t, i) => (
                <span key={i} style={{ fontSize: 12.5, color: 'var(--fg2)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: 8 }}>{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Screenshots */}
        <p style={{ fontSize: 12, color: 'var(--fg2)', letterSpacing: '.1em', fontWeight: 700, marginBottom: 20 }}>화면</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {w.gallery.map((g, i) => (
            <figure key={i} style={{ margin: 0 }}>
              <div style={{ border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', background: '#fff' }}>
                <img src={g.src} alt={g.caption || w.title} style={{ width: '100%', display: 'block' }} />
              </div>
              {g.caption && (
                <figcaption style={{ fontSize: 13, color: 'var(--fg2)', marginTop: 10, textAlign: 'center' }}>{g.caption}</figcaption>
              )}
            </figure>
          ))}
        </div>

        {/* CTA */}
        <div style={{ marginTop: 72, paddingTop: 40, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <p style={{ fontSize: 16, color: 'var(--fg2)', marginBottom: 24 }}>비슷한 프로젝트가 필요하신가요?</p>
          <Link href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--accent)', color: '#000', padding: '14px 28px', borderRadius: 8, fontWeight: 800, fontSize: 15 }}>
            프로젝트 의뢰하기 →
          </Link>
        </div>
      </div>
    </div>
  )
}
