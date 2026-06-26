'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

const MAX_MB = 10
const MAX_BYTES = MAX_MB * 1024 * 1024

const PROJECT_TYPES = ['웹사이트', '모바일 앱', 'AI 서비스', '디자인', '기타']
const BUDGETS = ['100만원 미만', '100 ~ 300만원', '300 ~ 500만원', '500 ~ 1000만원', '1000만원 이상', '협의']

const inputStyle = {
  width: '100%', padding: '12px 14px', background: 'var(--card)',
  border: '1px solid var(--border)', borderRadius: 8, color: 'var(--fg)',
  fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none',
}
const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--fg2)' }

export default function InquiryForm({ user, type = 'new' }) {
  const router = useRouter()
  const isAs = type === 'as'
  const fileRef = useRef()

  const [form, setForm] = useState({
    projectType: isAs ? 'AS' : '',
    title: '',
    description: '',
    budget: '',
    deadline: '',
    referenceUrl: '',
    phoneNumber: '',
  })
  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  function handleFileChange(e) {
    const f = e.target.files[0]
    if (!f) return
    if (f.size > MAX_BYTES) {
      setFileError(`파일 크기는 ${MAX_MB}MB 이하여야 합니다. (현재 ${(f.size / 1024 / 1024).toFixed(1)}MB)`)
      setFile(null)
      return
    }
    setFileError('')
    setFile(f)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.phoneNumber) {
      setError('연락처를 입력해주세요.')
      return
    }
    if (!form.title || !form.description) {
      setError('제목과 내용은 필수 항목입니다.')
      return
    }
    if (!isAs && !form.projectType) {
      setError('프로젝트 유형을 선택해주세요.')
      return
    }
    setLoading(true)
    setError('')

    // 파일 먼저 업로드
    let attachmentUrl = null
    if (file) {
      const fd = new FormData()
      fd.append('file', file)
      const uploadRes = await fetch('/api/inquiries/upload', { method: 'POST', body: fd })
      const uploadData = await uploadRes.json()
      if (!uploadRes.ok) {
        setError(uploadData.error || '파일 업로드에 실패했습니다.')
        setLoading(false)
        return
      }
      attachmentUrl = uploadData.url
    }

    const res = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, inquiryType: type, attachmentUrl }),
    })

    if (res.ok) {
      router.push('/contact/complete')
    } else {
      const data = await res.json()
      setError(data.error || '오류가 발생했습니다.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* 의뢰인 정보 */}
      <div style={{ padding: '14px 16px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--fg2)', display: 'flex', gap: 16 }}>
        <span>의뢰인</span>
        <strong style={{ color: 'var(--fg)' }}>{user.name}</strong>
        <span>{user.email}</span>
      </div>

      {/* 전화번호 */}
      <div>
        <label style={labelStyle}>연락처 <span style={{ color: '#f87171' }}>*</span></label>
        <input
          type="tel"
          placeholder="010-0000-0000"
          value={form.phoneNumber}
          onChange={set('phoneNumber')}
          style={inputStyle}
        />
      </div>

      {/* 신규: 프로젝트 유형 선택 */}
      {!isAs && (
        <div>
          <label style={labelStyle}>프로젝트 유형 <span style={{ color: '#f87171' }}>*</span></label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {PROJECT_TYPES.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setForm(f => ({ ...f, projectType: type }))}
                style={{
                  padding: '8px 16px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
                  fontFamily: 'inherit', transition: 'all .15s',
                  background: form.projectType === type ? 'var(--accent)' : 'var(--card)',
                  color: form.projectType === type ? '#000' : 'var(--fg2)',
                  border: form.projectType === type ? '1px solid var(--accent)' : '1px solid var(--border)',
                  fontWeight: form.projectType === type ? 700 : 400,
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* AS: 기존 프로젝트명 */}
      {isAs && (
        <div style={{ padding: '12px 16px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, fontSize: 13, color: '#f59e0b' }}>
          기존에 진행한 프로젝트에 대한 수정·유지보수 의뢰입니다.
        </div>
      )}

      {/* 제목 */}
      <div>
        <label style={labelStyle}>
          {isAs ? '기존 프로젝트명 / AS 제목' : '프로젝트 제목'}
          <span style={{ color: '#f87171' }}> *</span>
        </label>
        <input
          type="text"
          placeholder={isAs ? '예: 루카이든 홈페이지 — 메인 배너 수정' : '예: 반려동물 케어 서비스 앱'}
          value={form.title}
          onChange={set('title')}
          style={inputStyle}
          maxLength={100}
        />
      </div>

      {/* 설명 */}
      <div>
        <label style={labelStyle}>
          {isAs ? 'AS 요청 내용' : '프로젝트 설명'}
          <span style={{ color: '#f87171' }}> *</span>
        </label>
        <textarea
          placeholder={isAs
            ? '어떤 부분을 수정·보완하고 싶으신지 구체적으로 작성해주세요.'
            : '어떤 서비스를 만들고 싶으신지, 주요 기능, 타겟 사용자 등을 자유롭게 적어주세요.'
          }
          value={form.description}
          onChange={set('description')}
          rows={6}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }}
          maxLength={2000}
        />
        <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--fg2)', marginTop: 4 }}>
          {form.description.length} / 2000
        </div>
      </div>

      {/* 신규만: 예산 */}
      {!isAs && (
        <div>
          <label style={labelStyle}>예산 범위 <span style={{ color: 'var(--fg2)', fontWeight: 400 }}>(선택)</span></label>
          <select value={form.budget} onChange={set('budget')} style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="">선택 안 함</option>
            {BUDGETS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      )}

      {/* 희망 일정 */}
      <div>
        <label style={labelStyle}>
          {isAs ? '희망 처리 일정' : '희망 완료 일정'}
          <span style={{ color: 'var(--fg2)', fontWeight: 400 }}> (선택)</span>
        </label>
        <input
          type="text"
          placeholder="예: 가능한 빨리 / 2주 이내 / 미정"
          value={form.deadline}
          onChange={set('deadline')}
          style={inputStyle}
        />
      </div>

      {/* 참고 자료 */}
      <div>
        <label style={labelStyle}>참고 자료 <span style={{ color: 'var(--fg2)', fontWeight: 400 }}>(선택)</span></label>
        <input
          type="text"
          placeholder="참고 사이트 주소 또는 자료 설명"
          value={form.referenceUrl}
          onChange={set('referenceUrl')}
          style={inputStyle}
        />
      </div>

      {/* 첨부파일 */}
      <div>
        <label style={labelStyle}>첨부파일 <span style={{ color: 'var(--fg2)', fontWeight: 400 }}>(선택 · 최대 {MAX_MB}MB)</span></label>
        <div
          onClick={() => fileRef.current.click()}
          style={{
            padding: '14px 16px', border: '2px dashed var(--border)', borderRadius: 8,
            cursor: 'pointer', fontSize: 13, color: file ? 'var(--fg)' : 'var(--fg2)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}
        >
          <span style={{ fontSize: 18 }}>📎</span>
          <span>{file ? file.name : '클릭하여 파일 첨부'}</span>
          {file && (
            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--fg2)' }}>
              {(file.size / 1024 / 1024).toFixed(1)}MB
            </span>
          )}
        </div>
        <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={handleFileChange} />
        {file && (
          <button type="button" onClick={() => { setFile(null); fileRef.current.value = '' }}
            style={{ marginTop: 6, fontSize: 12, color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            파일 제거
          </button>
        )}
        {fileError && <p style={{ fontSize: 12, color: '#f87171', marginTop: 6 }}>{fileError}</p>}
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, color: '#f87171', fontSize: 13 }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: '14px 0', background: loading ? 'var(--border)' : 'var(--accent)',
          color: '#000', fontWeight: 700, fontSize: 15, borderRadius: 8,
          border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
        }}
      >
        {loading ? '제출 중...' : isAs ? 'AS 의뢰 접수하기' : '프로젝트 의뢰 접수하기'}
      </button>
    </form>
  )
}
