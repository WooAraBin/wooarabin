'use client'

import { useState } from 'react'
import Link from 'next/link'

const STATUS_LABELS = {
  received:    { label: '접수',    color: '#6b7280', step: 1 },
  reviewing:   { label: '검토중',  color: '#3b82f6', step: 2 },
  quoted:      { label: '견적발송', color: '#f59e0b', step: 3 },
  in_progress: { label: '진행중',  color: '#10b981', step: 4 },
  completed:   { label: '완료',    color: '#8b5cf6', step: 5 },
}
const STEPS = [
  { key: 'received',    label: '접수' },
  { key: 'reviewing',   label: '검토' },
  { key: 'quoted',      label: '견적' },
  { key: 'in_progress', label: '진행중' },
  { key: 'completed',   label: '완료' },
]

export default function CustomerPortal({ inquiries }) {
  const [selected, setSelected] = useState(inquiries[0] || null)

  if (inquiries.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <p style={{ color: 'var(--fg2)', fontSize: 15, marginBottom: 24 }}>아직 의뢰하신 프로젝트가 없습니다.</p>
        <Link href="/contact" style={{ padding: '12px 24px', background: 'var(--accent)', color: '#000', borderRadius: 8, fontWeight: 700, fontSize: 14 }}>
          프로젝트 의뢰하기
        </Link>
      </div>
    )
  }

  const st = STATUS_LABELS[selected?.status] || STATUS_LABELS.received
  const currentStep = st.step
  const files = selected?.project_files || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* 의뢰 목록 탭 */}
      {inquiries.length > 1 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {inquiries.map(inq => {
            const s = STATUS_LABELS[inq.status]
            const isActive = selected?.id === inq.id
            return (
              <button key={inq.id} onClick={() => setSelected(inq)} style={{
                padding: '8px 16px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
                fontFamily: 'inherit', fontWeight: isActive ? 700 : 400,
                background: isActive ? 'var(--accent)' : 'var(--card)',
                color: isActive ? '#000' : 'var(--fg2)',
                border: isActive ? '1px solid var(--accent)' : '1px solid var(--border)',
              }}>
                {inq.title}
                <span style={{ marginLeft: 6, fontSize: 11, color: isActive ? '#00000088' : s.color }}>
                  {s.label}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {selected && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>

          {/* 헤더 */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--fg2)', marginBottom: 6, display: 'flex', gap: 8 }}>
                <span style={{ background: selected.inquiry_type === 'as' ? '#f59e0b22' : '#3b82f622', color: selected.inquiry_type === 'as' ? '#f59e0b' : '#3b82f6', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>
                  {selected.inquiry_type === 'as' ? 'AS' : '신규'}
                </span>
                <span>{selected.project_type}</span>
                <span>·</span>
                <span>{new Date(selected.created_at).toLocaleDateString('ko-KR')} 접수</span>
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.3px' }}>{selected.title}</h2>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, padding: '6px 14px', borderRadius: 20, background: st.color + '22', color: st.color }}>
              {st.label}
            </span>
          </div>

          {/* 진행 단계 */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center' }}>
            {STEPS.map(({ key, label }, i) => {
              const done = i < currentStep - 1
              const current = i === currentStep - 1
              const color = STATUS_LABELS[key].color
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700,
                      background: current ? color : done ? color + '44' : 'var(--bg)',
                      color: current ? '#fff' : done ? color : 'var(--fg2)',
                      border: `2px solid ${current || done ? color : 'var(--border)'}`,
                    }}>
                      {done ? '✓' : i + 1}
                    </div>
                    <span style={{ fontSize: 10, whiteSpace: 'nowrap', color: current ? color : 'var(--fg2)', fontWeight: current ? 700 : 400 }}>{label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ flex: 1, height: 2, background: done ? color + '44' : 'var(--border)', margin: '0 4px', marginBottom: 18 }} />
                  )}
                </div>
              )
            })}
          </div>

          {/* 프로젝트 정보 */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Info label="희망 일정" value={selected.deadline || '미입력'} />
              <Info label="예산" value={selected.budget || '미입력'} />
              {selected.final_amount && <Info label="최종 금액" value={`${Number(selected.final_amount).toLocaleString()}원`} />}
              {selected.deposit_amount && <Info label="선입금" value={`${Number(selected.deposit_amount).toLocaleString()}원`} />}
            </div>
          </div>

          {/* 중간 전달 자료 */}
          {files.length > 0 && (
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>📁 전달받은 자료</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {files.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map(f => (
                  <div key={f.id} style={{ padding: '12px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: f.note ? 6 : 0 }}>
                      <a href={f.file_url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontSize: 14, fontWeight: 600 }}>
                        📎 {f.file_name}
                      </a>
                      <span style={{ fontSize: 12, color: 'var(--fg2)' }}>
                        {new Date(f.created_at).toLocaleString('ko-KR')}
                      </span>
                    </div>
                    {f.note && <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{f.note}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 완료 자료 */}
          {selected.status === 'completed' && selected.delivery_file_url && (
            <div style={{ padding: '20px 24px', background: 'rgba(139,92,246,0.04)' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: '#8b5cf6' }}>✓ 최종 납품 자료</h3>
              <a href={selected.delivery_file_url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontSize: 14, fontWeight: 600 }}>
                📎 최종 파일 다운로드
              </a>
              {selected.delivery_note && (
                <p style={{ fontSize: 13, color: 'var(--fg2)', marginTop: 8, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{selected.delivery_note}</p>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div style={{ padding: '10px 14px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)' }}>
      <div style={{ fontSize: 11, color: 'var(--fg2)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600 }}>{value}</div>
    </div>
  )
}
