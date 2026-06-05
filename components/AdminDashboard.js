'use client'

import { useState, useRef } from 'react'

const STATUS_LABELS = {
  received:    { label: '접수',    color: '#6b7280' },
  reviewing:   { label: '검토중',  color: '#3b82f6' },
  quoted:      { label: '견적발송', color: '#f59e0b' },
  in_progress: { label: '진행중',  color: '#10b981' },
  completed:   { label: '완료',    color: '#8b5cf6' },
}
const STATUS_ORDER = ['received', 'reviewing', 'quoted', 'in_progress', 'completed']

export default function AdminDashboard({ initialInquiries }) {
  const [inquiries, setInquiries] = useState(initialInquiries)
  const [selected, setSelected] = useState(null)

  function updateInquiry(updated) {
    setInquiries(list => list.map(i => i.id === updated.id ? updated : i))
    setSelected(updated)
  }

  const counts = STATUS_ORDER.reduce((acc, key) => {
    acc[key] = inquiries.filter(i => i.status === key).length
    return acc
  }, {})

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', marginTop: 60 }}>

      {/* 상태 현황 */}
      <div style={{ borderBottom: '1px solid var(--border)', padding: '14px 24px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        {STATUS_ORDER.map(key => {
          const { label, color } = STATUS_LABELS[key]
          return (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
              <span style={{ fontSize: 12, color: 'var(--fg2)' }}>{label}</span>
              <span style={{ fontSize: 17, fontWeight: 900, color }}>{counts[key]}</span>
            </div>
          )
        })}
        <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--fg2)' }}>
          총 <strong style={{ color: 'var(--fg)' }}>{inquiries.length}</strong>건
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* 목록 */}
        <div style={{ width: 360, borderRight: '1px solid var(--border)', overflowY: 'auto', flexShrink: 0 }}>
          {inquiries.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--fg2)', fontSize: 14 }}>접수된 의뢰가 없습니다.</div>
          ) : (
            inquiries.map(inq => {
              const { label, color } = STATUS_LABELS[inq.status]
              const isActive = selected?.id === inq.id
              return (
                <div key={inq.id} onClick={() => setSelected(inq)} style={{
                  padding: '14px 18px', cursor: 'pointer', borderBottom: '1px solid var(--border)',
                  background: isActive ? 'rgba(255,255,255,0.04)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, flex: 1, marginRight: 8, lineHeight: 1.4 }}>{inq.title}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 12, background: color + '22', color, whiteSpace: 'nowrap' }}>{label}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--fg2)', display: 'flex', gap: 6 }}>
                    <span style={{ background: inq.inquiry_type === 'as' ? '#f59e0b22' : '#3b82f622', color: inq.inquiry_type === 'as' ? '#f59e0b' : '#3b82f6', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>
                      {inq.inquiry_type === 'as' ? 'AS' : '신규'}
                    </span>
                    <span>{inq.user_name}</span>
                    <span>·</span>
                    <span>{inq.project_type}</span>
                    <span>·</span>
                    <span>{new Date(inq.created_at).toLocaleDateString('ko-KR')}</span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* 상세 + 액션 */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {!selected ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--fg2)', fontSize: 14 }}>
              의뢰를 선택하면 상세 내용이 표시됩니다.
            </div>
          ) : (
            <div style={{ padding: '28px 36px', maxWidth: 700 }}>

              {/* 헤더 */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 11, color: 'var(--fg2)', marginBottom: 6, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span>{new Date(selected.created_at).toLocaleString('ko-KR')}</span>
                  <span>·</span>
                  <span style={{ background: selected.inquiry_type === 'as' ? '#f59e0b22' : '#3b82f622', color: selected.inquiry_type === 'as' ? '#f59e0b' : '#3b82f6', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>
                    {selected.inquiry_type === 'as' ? 'AS 의뢰' : '신규 의뢰'}
                  </span>
                  <span>{selected.project_type}</span>
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.5px' }}>{selected.title}</h2>
              </div>

              {/* 진행 단계 표시 */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28, gap: 0 }}>
                {STATUS_ORDER.map((key, i) => {
                  const { label, color } = STATUS_LABELS[key]
                  const currentIdx = STATUS_ORDER.indexOf(selected.status)
                  const isDone = i < currentIdx
                  const isCurrent = i === currentIdx
                  return (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 700,
                          background: isCurrent ? color : isDone ? color + '44' : 'var(--card)',
                          color: isCurrent ? '#fff' : isDone ? color : 'var(--fg2)',
                          border: `2px solid ${isCurrent || isDone ? color : 'var(--border)'}`,
                        }}>
                          {isDone ? '✓' : i + 1}
                        </div>
                        <span style={{ fontSize: 10, color: isCurrent ? color : 'var(--fg2)', fontWeight: isCurrent ? 700 : 400, whiteSpace: 'nowrap' }}>{label}</span>
                      </div>
                      {i < STATUS_ORDER.length - 1 && (
                        <div style={{ flex: 1, height: 2, background: isDone ? STATUS_LABELS[STATUS_ORDER[i]].color + '44' : 'var(--border)', margin: '0 4px', marginBottom: 20 }} />
                      )}
                    </div>
                  )
                })}
              </div>

              {/* 고객 이력 */}
              <ClientHistory inquiries={inquiries} selected={selected} onSelect={setSelected} />

              {/* 의뢰 기본 정보 */}
              <Section title="의뢰인">
                <Row label="이름" value={selected.user_name} />
                <Row label="이메일" value={<a href={`mailto:${selected.user_email}`} style={{ color: 'var(--accent)' }}>{selected.user_email}</a>} />
              </Section>

              <Section title="프로젝트 정보">
                <Row label="예산" value={selected.budget || '미입력'} />
                <Row label="희망 일정" value={selected.deadline || '미입력'} />
                {selected.reference_url && <Row label="참고 사이트" value={selected.reference_url} />}
                {selected.attachment_url && (
                  <Row label="첨부파일" value={
                    <a href={selected.attachment_url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>
                      📎 파일 열기
                    </a>
                  } />
                )}
                {selected.final_amount && (
                  <Row label="최종 금액" value={`${Number(selected.final_amount).toLocaleString()}원`} />
                )}
                {selected.deposit_amount && (
                  <Row label="선입금" value={`${Number(selected.deposit_amount).toLocaleString()}원`} />
                )}
              </Section>

              <Section title="프로젝트 설명">
                <p style={{ fontSize: 14, lineHeight: 1.8, whiteSpace: 'pre-wrap', margin: 0, padding: '12px 16px' }}>{selected.description}</p>
              </Section>

              {selected.review_note && (
                <Section title="검토/견적 내용">
                  <p style={{ fontSize: 14, lineHeight: 1.8, whiteSpace: 'pre-wrap', margin: 0, padding: '12px 16px' }}>{selected.review_note}</p>
                </Section>
              )}

              {/* 단계별 액션 패널 */}
              <ActionPanel inquiry={selected} onUpdate={updateInquiry} />

              {/* 내부 메모 */}
              <InquiryNotes inquiryId={selected.id} />

            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ActionPanel({ inquiry, onUpdate }) {
  const id = inquiry.id

  async function patch(body) {
    const res = await fetch(`/api/admin/inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return res.json()
  }

  if (inquiry.status === 'received') {
    return <StartReviewPanel id={id} inquiry={inquiry} patch={patch} onUpdate={onUpdate} />
  }
  if (inquiry.status === 'reviewing') {
    return <SendQuotePanel id={id} inquiry={inquiry} patch={patch} onUpdate={onUpdate} />
  }
  if (inquiry.status === 'quoted') {
    return <StartWorkPanel id={id} inquiry={inquiry} patch={patch} onUpdate={onUpdate} />
  }
  if (inquiry.status === 'in_progress') {
    return <DeliveryPanel id={id} inquiry={inquiry} patch={patch} onUpdate={onUpdate} />
  }
  if (inquiry.status === 'completed') {
    return (
      <div style={{ padding: '20px 0', color: '#8b5cf6', fontWeight: 700, fontSize: 15 }}>
        ✓ 완료된 프로젝트입니다.
        {inquiry.delivery_file_url && (
          <div style={{ marginTop: 8 }}>
            <a href={inquiry.delivery_file_url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 400 }}>결과물 파일 보기 →</a>
          </div>
        )}
      </div>
    )
  }
  return null
}

function StartReviewPanel({ inquiry, patch, onUpdate }) {
  const [note, setNote] = useState(
    `안녕하세요, ${inquiry.user_name}님.\n\n의뢰하신 프로젝트 "${inquiry.title}"를 검토 중입니다.\n검토 완료 후 견적을 별도 메일로 보내드리겠습니다.\n\n감사합니다.\n우아라빈 드림`
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handle() {
    if (!note.trim()) { setError('메일 본문을 입력해주세요.'); return }
    setLoading(true); setError('')
    const res = await patch({ action: 'start_review', reviewNote: note })
    if (res.ok) {
      onUpdate({ ...inquiry, status: 'reviewing', review_note: note })
    } else {
      setError(res.error || '오류가 발생했습니다.')
    }
    setLoading(false)
  }

  return (
    <ActionBox title="검토 시작" description="고객에게 검토 시작 알림 메일을 발송하고 '검토중'으로 전환합니다.">
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder={`안녕하세요, ${inquiry.user_name}님.\n의뢰하신 프로젝트를 검토 중입니다. 검토 완료 후 견적을 보내드리겠습니다.`}
        rows={5}
        style={textareaStyle}
      />
      {error && <ErrorMsg>{error}</ErrorMsg>}
      <ActionBtn loading={loading} color="#3b82f6" onClick={handle}>
        메일 발송하고 검토중으로 전환
      </ActionBtn>
    </ActionBox>
  )
}

function SendQuotePanel({ inquiry, patch, onUpdate }) {
  const [note, setNote] = useState(
    inquiry.review_note ||
    `안녕하세요, ${inquiry.user_name}님.\n\n프로젝트 "${inquiry.title}"에 대한 견적을 안내드립니다.\n\n[견적 내용을 여기에 작성해주세요]\n\n문의사항은 이 메일에 회신해 주세요.\n감사합니다.\n우아라빈 드림`
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handle() {
    if (!note.trim()) { setError('견적 내용을 입력해주세요.'); return }
    setLoading(true); setError('')
    const res = await patch({ action: 'send_quote', quoteNote: note })
    if (res.ok) {
      onUpdate({ ...inquiry, status: 'quoted', review_note: note })
    } else {
      setError(res.error || '오류가 발생했습니다.')
    }
    setLoading(false)
  }

  return (
    <ActionBox title="견적 발송" description="견적서 내용을 작성하고 고객에게 발송합니다. '견적발송'으로 전환됩니다.">
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="견적 내용, 금액 안내, 일정 등을 작성해주세요."
        rows={6}
        style={textareaStyle}
      />
      {error && <ErrorMsg>{error}</ErrorMsg>}
      <ActionBtn loading={loading} color="#f59e0b" onClick={handle}>
        견적 메일 발송하고 견적발송으로 전환
      </ActionBtn>
    </ActionBox>
  )
}

function StartWorkPanel({ inquiry, patch, onUpdate }) {
  const [finalAmount, setFinalAmount] = useState('')
  const [depositAmount, setDepositAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handle() {
    if (!finalAmount) { setError('최종 금액을 입력해주세요.'); return }
    setLoading(true); setError('')
    const res = await patch({ action: 'start_work', finalAmount, depositAmount })
    if (res.ok) {
      onUpdate({ ...inquiry, status: 'in_progress', final_amount: parseInt(finalAmount), deposit_amount: depositAmount ? parseInt(depositAmount) : null })
    } else {
      setError(res.error || '오류가 발생했습니다.')
    }
    setLoading(false)
  }

  return (
    <ActionBox title="작업 시작" description="고객이 견적을 확인했습니다. 최종 금액을 확정하고 '진행중'으로 전환합니다.">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={labelStyle}>최종 금액 (원) *</label>
          <input type="number" value={finalAmount} onChange={e => setFinalAmount(e.target.value)} placeholder="1500000" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>선입금 (원)</label>
          <input type="number" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} placeholder="750000" style={inputStyle} />
        </div>
      </div>
      {error && <ErrorMsg>{error}</ErrorMsg>}
      <ActionBtn loading={loading} color="#10b981" onClick={handle}>
        작업 시작 — 진행중으로 전환
      </ActionBtn>
    </ActionBox>
  )
}

function DeliveryPanel({ inquiry, patch, onUpdate }) {
  const [note, setNote] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef()

  async function handle() {
    setLoading(true); setError('')
    let fileUrl = null

    if (file) {
      setUploading(true)
      const form = new FormData()
      form.append('file', file)
      const res = await fetch(`/api/admin/inquiries/${inquiry.id}/upload`, { method: 'POST', body: form })
      const data = await res.json()
      setUploading(false)
      if (!res.ok) { setError(data.error || '파일 업로드 실패'); setLoading(false); return }
      fileUrl = data.url
    }

    const res = await patch({ action: 'complete', deliveryNote: note, deliveryFileUrl: fileUrl })
    if (res.ok) {
      onUpdate({ ...inquiry, status: 'completed', delivery_note: note, delivery_file_url: fileUrl })
    } else {
      setError(res.error || '오류가 발생했습니다.')
    }
    setLoading(false)
  }

  return (
    <ActionBox title="결과물 납품" description="완성 파일을 업로드하고 고객에게 발송합니다. '완료'로 전환됩니다.">
      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>결과물 파일 (선택)</label>
        <div
          onClick={() => fileRef.current.click()}
          style={{ padding: '14px', border: '2px dashed var(--border)', borderRadius: 8, cursor: 'pointer', textAlign: 'center', fontSize: 13, color: 'var(--fg2)' }}
        >
          {file ? file.name : '클릭하여 파일 선택'}
        </div>
        <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>전달 메모 (선택 — 고객 메일에 포함)</label>
        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="작업 완료 안내, 사용 방법 등을 작성해주세요." rows={4} style={textareaStyle} />
      </div>
      {error && <ErrorMsg>{error}</ErrorMsg>}
      <ActionBtn loading={loading || uploading} color="#8b5cf6" onClick={handle}>
        {uploading ? '파일 업로드 중...' : '발송하고 완료로 전환'}
      </ActionBtn>
    </ActionBox>
  )
}

function ActionBox({ title, description, children }) {
  return (
    <div style={{ marginTop: 24, padding: '20px 24px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12 }}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{title}</h3>
        <p style={{ fontSize: 12, color: 'var(--fg2)' }}>{description}</p>
      </div>
      {children}
    </div>
  )
}

function ActionBtn({ loading, color, onClick, children }) {
  return (
    <button onClick={onClick} disabled={loading} style={{
      width: '100%', padding: '12px 0', background: loading ? 'var(--border)' : color,
      color: '#fff', fontWeight: 700, fontSize: 14, borderRadius: 8,
      border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
    }}>
      {loading ? '처리 중...' : children}
    </button>
  )
}

function ErrorMsg({ children }) {
  return <div style={{ padding: '10px 14px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, color: '#f87171', fontSize: 13, marginBottom: 12 }}>{children}</div>
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h3 style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>{title}</h3>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>{children}</div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', padding: '11px 16px', borderBottom: '1px solid var(--border)' }}>
      <span style={{ width: 90, fontSize: 13, color: 'var(--fg2)', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13 }}>{value}</span>
    </div>
  )
}

const textareaStyle = {
  width: '100%', padding: '12px 14px', background: 'var(--bg)',
  border: '1px solid var(--border)', borderRadius: 8, color: 'var(--fg)',
  fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box',
  resize: 'vertical', lineHeight: 1.7, outline: 'none', marginBottom: 12,
}
const inputStyle = {
  width: '100%', padding: '10px 12px', background: 'var(--bg)',
  border: '1px solid var(--border)', borderRadius: 8, color: 'var(--fg)',
  fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none',
}
const labelStyle = {
  display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--fg2)', marginBottom: 6,
}

// 고객 이력 — 같은 이메일의 다른 의뢰 목록
function ClientHistory({ inquiries, selected, onSelect }) {
  const history = inquiries.filter(i => i.user_email === selected.user_email && i.id !== selected.id)
  if (history.length === 0) return null

  return (
    <div style={{ marginBottom: 20, padding: '14px 16px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
        고객 이력 — {history.length}건
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {history.map(inq => {
          const { label, color } = STATUS_LABELS[inq.status]
          return (
            <div key={inq.id} onClick={() => onSelect(inq)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'var(--card)', borderRadius: 6, cursor: 'pointer', border: '1px solid var(--border)' }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{inq.title}</span>
                <span style={{ fontSize: 11, color: 'var(--fg2)', marginLeft: 8 }}>{new Date(inq.created_at).toLocaleDateString('ko-KR')}</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: color + '22', color }}>{label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// 내부 메모 — 어드민 전용
function InquiryNotes({ inquiryId }) {
  const [notes, setNotes] = useState(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  async function load() {
    if (notes !== null) return
    const res = await fetch(`/api/admin/notes?inquiryId=${inquiryId}`)
    const data = await res.json()
    setNotes(Array.isArray(data) ? data : [])
  }

  async function toggle() {
    if (!open) await load()
    setOpen(o => !o)
  }

  async function addNote() {
    if (!content.trim()) return
    setLoading(true)
    const res = await fetch('/api/admin/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inquiryId, content }),
    })
    if (res.ok) {
      const note = await res.json()
      setNotes(n => [...n, note])
      setContent('')
    }
    setLoading(false)
  }

  async function deleteNote(id) {
    await fetch(`/api/admin/notes?id=${id}`, { method: 'DELETE' })
    setNotes(n => n.filter(note => note.id !== id))
  }

  return (
    <div style={{ marginTop: 24, border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      <button onClick={toggle} style={{
        width: '100%', padding: '14px 20px', background: 'var(--card)', border: 'none',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        cursor: 'pointer', fontFamily: 'inherit',
      }}>
        <span style={{ fontSize: 13, fontWeight: 700 }}>🔒 내부 메모 {notes !== null ? `(${notes.length})` : ''}</span>
        <span style={{ fontSize: 11, color: 'var(--fg2)' }}>{open ? '닫기 ▲' : '열기 ▼'}</span>
      </button>

      {open && (
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
          {notes === null ? (
            <p style={{ fontSize: 13, color: 'var(--fg2)' }}>로딩 중...</p>
          ) : (
            <>
              {notes.length === 0 && (
                <p style={{ fontSize: 13, color: 'var(--fg2)', marginBottom: 12 }}>저장된 메모가 없습니다.</p>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                {notes.map(note => (
                  <div key={note.id} style={{ padding: '10px 14px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, position: 'relative' }}>
                    <p style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0, paddingRight: 24 }}>{note.content}</p>
                    <div style={{ fontSize: 11, color: 'var(--fg2)', marginTop: 6 }}>
                      {new Date(note.created_at).toLocaleString('ko-KR')}
                    </div>
                    <button onClick={() => deleteNote(note.id)} style={{
                      position: 'absolute', top: 10, right: 10, background: 'none', border: 'none',
                      color: 'var(--fg2)', cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1,
                    }}>×</button>
                  </div>
                ))}
              </div>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="검토 사항, 추가 문의 내용 등을 기록하세요. 고객에게 보이지 않습니다."
                rows={3}
                style={{ ...textareaStyle, marginBottom: 8 }}
              />
              <button onClick={addNote} disabled={loading || !content.trim()} style={{
                padding: '9px 18px', background: loading ? 'var(--border)' : '#f59e0b',
                color: '#000', fontWeight: 700, fontSize: 13, borderRadius: 8,
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              }}>
                {loading ? '저장 중...' : '메모 저장'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
