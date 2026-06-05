'use client'

import { useState } from 'react'
import Link from 'next/link'

const STATUS_CONFIG = {
  received:        { label: '접수',         color: '#6b7280', step: 1 },
  reviewing:       { label: '검토중',        color: '#3b82f6', step: 2 },
  quoted:          { label: '견적발송',      color: '#f59e0b', step: 3 },
  in_progress:     { label: '진행중',        color: '#10b981', step: 4 },
  pending_payment: { label: '완료·입금대기', color: '#f97316', step: 5 },
  completed:       { label: '최종완료',      color: '#8b5cf6', step: 6 },
}

const STEPS = [
  { key: 'received',        label: '접수' },
  { key: 'reviewing',       label: '검토' },
  { key: 'quoted',          label: '견적' },
  { key: 'in_progress',     label: '진행중' },
  { key: 'pending_payment', label: '완료확인' },
  { key: 'completed',       label: '최종완료' },
]

export default function CustomerPortal({ inquiries }) {
  const [selected, setSelected] = useState(inquiries[0] || null)
  const [selectedInq, setSelectedInq] = useState(inquiries[0] || null)

  function selectInquiry(inq) {
    setSelected(inq)
    setSelectedInq(inq)
  }

  function onStatusChange(newStatus) {
    const updated = { ...selectedInq, status: newStatus, completed_at: new Date().toISOString() }
    setSelected(updated)
    setSelectedInq(updated)
  }

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

  const st = STATUS_CONFIG[selectedInq?.status] || STATUS_CONFIG.received
  const currentStep = st.step
  const files = selectedInq?.project_files || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* 탭 */}
      {inquiries.length > 1 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {inquiries.map(inq => {
            const s = STATUS_CONFIG[inq.status]
            const isActive = selectedInq?.id === inq.id
            return (
              <button key={inq.id} onClick={() => selectInquiry(inq)} style={{
                padding: '8px 16px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
                fontFamily: 'inherit', fontWeight: isActive ? 700 : 400,
                background: isActive ? 'var(--accent)' : 'var(--card)',
                color: isActive ? '#000' : 'var(--fg2)',
                border: isActive ? '1px solid var(--accent)' : '1px solid var(--border)',
              }}>
                {inq.title}
                <span style={{ marginLeft: 6, fontSize: 11, color: isActive ? '#00000088' : s?.color }}>{s?.label}</span>
              </button>
            )
          })}
        </div>
      )}

      {selectedInq && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>

          {/* 헤더 */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--fg2)', marginBottom: 6, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ background: selectedInq.inquiry_type === 'as' ? '#f59e0b22' : '#3b82f622', color: selectedInq.inquiry_type === 'as' ? '#f59e0b' : '#3b82f6', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>
                  {selectedInq.inquiry_type === 'as' ? 'AS' : '신규'}
                </span>
                <span>{selectedInq.project_type}</span>
                {selectedInq.inquiry_number && <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--fg)' }}>{selectedInq.inquiry_number}</span>}
                <span>{new Date(selectedInq.created_at).toLocaleDateString('ko-KR')} 접수</span>
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.3px' }}>{selectedInq.title}</h2>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, padding: '6px 14px', borderRadius: 20, background: st.color + '22', color: st.color, whiteSpace: 'nowrap' }}>
              {st.label}
            </span>
          </div>

          {/* 단계 진행 바 */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center' }}>
            {STEPS.map(({ key, label }, i) => {
              const done = i < currentStep - 1
              const current = i === currentStep - 1
              const color = STATUS_CONFIG[key].color
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700,
                      background: current ? color : done ? color + '44' : 'var(--bg)',
                      color: current ? '#fff' : done ? color : 'var(--fg2)',
                      border: `2px solid ${current || done ? color : 'var(--border)'}`,
                    }}>
                      {done ? '✓' : i + 1}
                    </div>
                    <span style={{ fontSize: 10, whiteSpace: 'nowrap', color: current ? color : 'var(--fg2)', fontWeight: current ? 700 : 400 }}>{label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ flex: 1, height: 2, background: done ? color + '44' : 'var(--border)', margin: '0 2px', marginBottom: 18 }} />
                  )}
                </div>
              )
            })}
          </div>

          {/* 프로젝트 정보 */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Info label="희망 일정" value={selectedInq.deadline || '미입력'} />
              <Info label="예산" value={selectedInq.budget || '미입력'} />
              {selectedInq.final_amount && <Info label="최종 금액" value={`${Number(selectedInq.final_amount).toLocaleString()}원`} />}
              {selectedInq.deposit_amount && <Info label="선입금" value={`${Number(selectedInq.deposit_amount).toLocaleString()}원`} />}
            </div>
          </div>

          {/* 견적 내용 */}
          {selectedInq.quote_note && ['quoted', 'in_progress', 'pending_payment', 'completed'].includes(selectedInq.status) && (
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'rgba(245,158,11,0.04)' }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>견적 내용</h3>
              <p style={{ fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap', margin: 0, color: 'var(--fg)' }}>{selectedInq.quote_note}</p>
            </div>
          )}

          {/* 진행 현황 타임라인 */}
          {selectedInq.status !== 'received' && (
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>진행 현황</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <TimelineItem label="작업 시작" date={selectedInq.work_started_at} color="#10b981" />
                {files.length > 0 && (
                  <TimelineItem label={`중간 자료 전달 (${files.length}건)`} date={files[files.length - 1]?.created_at} color="#3b82f6" />
                )}
                {selectedInq.delivery_file_url && (
                  <TimelineItem label="결과물 납품 완료" date={selectedInq.completed_at} color="#f97316" />
                )}
                {selectedInq.status === 'completed' && (
                  <TimelineItem label="최종 완료" date={selectedInq.completed_at} color="#8b5cf6" />
                )}
              </div>
            </div>
          )}

          {/* 금액 안내 + 선입금 버튼 */}
          {selectedInq.status === 'in_progress' && selectedInq.final_amount && (
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'rgba(16,185,129,0.04)' }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>결제 안내</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <Info label="최종 금액" value={`${Number(selectedInq.final_amount).toLocaleString()}원`} />
                {selectedInq.deposit_amount && <Info label="선입금" value={`${Number(selectedInq.deposit_amount).toLocaleString()}원`} />}
              </div>
              {!selectedInq.deposit_confirmed && selectedInq.deposit_amount && (
                <PaymentNotifyButton inquiryId={selectedInq.id} type="deposit" label={`선입금 ${Number(selectedInq.deposit_amount).toLocaleString()}원 입금 완료 알리기`} color="#10b981" />
              )}
              {selectedInq.deposit_confirmed && !selectedInq.final_confirmed && (
                <p style={{ fontSize: 13, color: '#10b981', fontWeight: 600 }}>✓ 선입금 확인되었습니다.</p>
              )}
            </div>
          )}

          {/* pending_payment 상태: 잔금 안내 */}
          {selectedInq.status === 'pending_payment' && selectedInq.final_amount && (
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'rgba(249,115,22,0.04)' }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>잔금 안내</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <Info label="최종 금액" value={`${Number(selectedInq.final_amount).toLocaleString()}원`} />
                <Info label="잔금" value={`${Number(selectedInq.final_amount - (selectedInq.deposit_amount || 0)).toLocaleString()}원`} />
              </div>
              {!selectedInq.final_confirmed && (
                <PaymentNotifyButton inquiryId={selectedInq.id} type="final" label={`잔금 ${Number(selectedInq.final_amount - (selectedInq.deposit_amount || 0)).toLocaleString()}원 입금 완료 알리기`} color="#f97316" />
              )}
              {selectedInq.final_confirmed && (
                <p style={{ fontSize: 13, color: '#10b981', fontWeight: 600 }}>✓ 잔금 확인되었습니다. 최종 완료 처리 중입니다.</p>
              )}
            </div>
          )}

          {/* 중간 전달 자료 */}
          {files.length > 0 && (
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>전달받은 자료</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[...files].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map(f => (
                  <div key={f.id} style={{ padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <a href={f.file_url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 600 }}>📎 {f.file_name}</a>
                      <span style={{ fontSize: 11, color: 'var(--fg2)' }}>{new Date(f.created_at).toLocaleString('ko-KR')}</span>
                    </div>
                    {f.note && <p style={{ fontSize: 12, color: 'var(--fg2)', margin: '4px 0 0', whiteSpace: 'pre-wrap' }}>{f.note}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 결과물 납품 + 완료 버튼 */}
          {selectedInq.delivery_file_url && selectedInq.status === 'in_progress' && (
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'rgba(249,115,22,0.04)' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: '#f97316' }}>📦 결과물 확인</h3>
              <a href={selectedInq.delivery_file_url} target="_blank" rel="noreferrer"
                style={{ display: 'inline-block', padding: '8px 16px', background: 'rgba(249,115,22,0.12)', color: '#f97316', borderRadius: 8, fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
                📎 결과물 다운로드
              </a>
              {selectedInq.delivery_note && (
                <p style={{ fontSize: 13, color: 'var(--fg2)', marginBottom: 14, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{selectedInq.delivery_note}</p>
              )}
              <CompleteButton inquiryId={selectedInq.id} onComplete={() => onStatusChange('pending_payment')} />
            </div>
          )}

          {/* 최종 완료 납품 */}
          {selectedInq.status === 'completed' && selectedInq.delivery_file_url && (
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'rgba(139,92,246,0.04)' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: '#8b5cf6' }}>✓ 최종 납품 자료</h3>
              <a href={selectedInq.delivery_file_url} target="_blank" rel="noreferrer"
                style={{ color: 'var(--accent)', fontSize: 14, fontWeight: 600 }}>
                📎 최종 파일 다운로드
              </a>
            </div>
          )}

          {/* 고객 문의 */}
          {['in_progress', 'pending_payment', 'quoted'].includes(selectedInq.status) && (
            <CustomerMessage
              inquiryId={selectedInq.id}
              messages={[...(selectedInq.customer_messages || [])].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))}
            />
          )}

        </div>
      )}
    </div>
  )
}

function CompleteButton({ inquiryId, onComplete }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handle() {
    if (!confirm('결과물을 확인하셨나요? 완료 처리하면 입금 대기 상태로 변경됩니다.')) return
    setLoading(true)
    const res = await fetch('/api/portal/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inquiryId }),
    })
    if (res.ok) { setDone(true); onComplete() }
    setLoading(false)
  }

  if (done) return <p style={{ color: '#f97316', fontWeight: 700, fontSize: 14 }}>✓ 완료 확인되었습니다. 입금 후 최종 완료됩니다.</p>

  return (
    <button onClick={handle} disabled={loading} style={{
      padding: '11px 24px', background: '#f97316', color: '#fff',
      fontWeight: 700, fontSize: 14, borderRadius: 8,
      border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
    }}>
      {loading ? '처리 중...' : '✓ 결과물 확인 완료 — 완료 처리하기'}
    </button>
  )
}

function CustomerMessage({ inquiryId, messages: initialMessages }) {
  const [messages, setMessages] = useState(initialMessages || [])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function send() {
    if (!message.trim()) return
    setLoading(true)
    const res = await fetch('/api/portal/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inquiryId, message }),
    })
    if (res.ok) {
      const data = await res.json()
      setMessages(ms => [...ms, data])
      setMessage('')
    }
    setLoading(false)
  }

  return (
    <div style={{ padding: '16px 24px' }}>
      <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>문의 내역</h3>

      {messages.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {messages.map(m => (
            <div key={m.id}>
              <div style={{ padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8 }}>
                <p style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>{m.message}</p>
                <p style={{ fontSize: 11, color: 'var(--fg2)', margin: '4px 0 0' }}>{new Date(m.created_at).toLocaleString('ko-KR')}</p>
              </div>
              {m.reply && (
                <div style={{ marginLeft: 16, marginTop: 4, padding: '8px 12px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8 }}>
                  <p style={{ fontSize: 11, color: '#3b82f6', fontWeight: 600, margin: '0 0 4px' }}>우아라빈 답변</p>
                  <p style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>{m.reply}</p>
                  <p style={{ fontSize: 11, color: 'var(--fg2)', margin: '4px 0 0' }}>{new Date(m.replied_at).toLocaleString('ko-KR')}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="궁금하신 점이나 피드백을 남겨주세요."
        rows={3}
        style={{
          width: '100%', padding: '10px 14px', background: 'var(--bg)',
          border: '1px solid var(--border)', borderRadius: 8, color: 'var(--fg)',
          fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box',
          resize: 'vertical', lineHeight: 1.7, outline: 'none', marginBottom: 8,
        }}
      />
      <button onClick={send} disabled={loading || !message.trim()} style={{
        padding: '8px 18px', background: message.trim() ? 'var(--accent)' : 'var(--border)',
        color: message.trim() ? '#000' : 'var(--fg2)', fontWeight: 700, fontSize: 13,
        borderRadius: 8, border: 'none', cursor: message.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
      }}>
        {loading ? '전송 중...' : '문의 보내기'}
      </button>
    </div>
  )
}

function TimelineItem({ label, date, color }) {
  if (!date) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span style={{ fontSize: 13, color: 'var(--fg)' }}>{label}</span>
      <span style={{ fontSize: 12, color: 'var(--fg2)', marginLeft: 'auto' }}>{new Date(date).toLocaleDateString('ko-KR')}</span>
    </div>
  )
}

function PaymentNotifyButton({ inquiryId, type, label, color }) {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function notify() {
    setLoading(true)
    const res = await fetch('/api/portal/notify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inquiryId, type }),
    })
    if (res.ok) setSent(true)
    setLoading(false)
  }

  if (sent) return <p style={{ fontSize: 13, color, fontWeight: 600 }}>✓ 입금 알림을 보냈습니다. 확인 후 처리해드리겠습니다.</p>

  return (
    <button onClick={notify} disabled={loading} style={{
      padding: '10px 20px', background: color + '22', color,
      border: `1px solid ${color}66`, borderRadius: 8,
      fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
    }}>
      {loading ? '전송 중...' : `💸 ${label}`}
    </button>
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
