'use client'

import { useState } from 'react'

export default function AdminCustomers({ customers, inquiries = [] }) {
  const [list, setList] = useState(customers)
  const [editing, setEditing] = useState(null) // 현재 remark 수정 중인 id
  const [remark, setRemark] = useState('')
  const [saving, setSaving] = useState(false)
  const [shownPhones, setShownPhones] = useState({}) // 전화번호 보기 토글 (id별)

  const maskPhone = (p) => {
    const digits = (p || '').replace(/\D/g, '')
    if (digits.length < 4) return '•'.repeat(p.length)
    // 앞 3자리만 노출, 나머지는 마스킹
    return p.replace(/\d/g, (d, i) => (i < 3 ? d : '•'))
  }

  const rows = list
  const ROLE_OPTIONS = [
    { value: 'user', label: '일반' },
    { value: 'trainer', label: '훈련사' },
    { value: 'admin', label: '관리자' },
  ]

  async function changeRole(id, role) {
    const prev = list.find(u => u.id === id)?.role
    setList(l => l.map(u => u.id === id ? { ...u, role } : u))
    const res = await fetch(`/api/admin/customers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })
    if (!res.ok) {
      setList(l => l.map(u => u.id === id ? { ...u, role: prev } : u))
      alert('권한 변경에 실패했습니다.')
    }
  }

  async function saveRemark(id) {
    setSaving(true)
    const res = await fetch(`/api/admin/customers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ remark }),
    })
    if (res.ok) {
      setList(l => l.map(u => u.id === id ? { ...u, remark } : u))
      setEditing(null)
    }
    setSaving(false)
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1040 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700 }}>가입 회원</h2>
        <span style={{ fontSize: 13, color: 'var(--fg2)' }}>총 {rows.length}명</span>
      </div>

      {rows.length === 0 ? (
        <p style={{ color: 'var(--fg2)', fontSize: 14 }}>가입한 회원이 없습니다.</p>
      ) : (
        <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
                {['이메일', '이름', '연락처', '권한', '가입일', 'Remark'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--fg2)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <a href={`mailto:${u.email}`} style={{ color: 'var(--accent)' }}>{u.email}</a>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--fg2)' }}>{u.name || '-'}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--fg2)' }}>
                    {(() => {
                      const phone = inquiries.find(i => i.user_email === u.email && i.phone_number)?.phone_number
                      if (!phone) return '-'
                      const shown = shownPhones[u.id]
                      return (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          {shown
                            ? <a href={`tel:${phone}`} style={{ color: 'var(--accent)' }}>{phone}</a>
                            : <span style={{ letterSpacing: 1, fontVariantNumeric: 'tabular-nums' }}>{maskPhone(phone)}</span>}
                          <button
                            onClick={() => setShownPhones(s => ({ ...s, [u.id]: !s[u.id] }))}
                            title={shown ? '숨기기' : '전화번호 보기'}
                            style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '2px 8px', fontSize: 11, color: 'var(--fg2)', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}
                          >{shown ? '숨기기' : '보기'}</button>
                        </span>
                      )
                    })()}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <select
                      value={u.role || 'user'}
                      onChange={e => changeRole(u.id, e.target.value)}
                      style={{
                        background: 'var(--bg)', color: 'var(--fg)', border: '1px solid var(--border)',
                        borderRadius: 6, padding: '5px 8px', fontSize: 12.5, fontFamily: 'inherit', cursor: 'pointer',
                      }}
                    >
                      {ROLE_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--fg2)', whiteSpace: 'nowrap' }}>
                    {new Date(u.created_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td style={{ padding: '12px 16px', minWidth: 200 }}>
                    {editing === u.id ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input
                          autoFocus
                          value={remark}
                          onChange={e => setRemark(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') saveRemark(u.id); if (e.key === 'Escape') setEditing(null) }}
                          style={{
                            flex: 1, padding: '5px 8px', background: 'var(--bg)',
                            border: '1px solid var(--border)', borderRadius: 6,
                            color: 'var(--fg)', fontSize: 13, fontFamily: 'inherit', outline: 'none',
                          }}
                          placeholder="메모 입력..."
                        />
                        <button onClick={() => saveRemark(u.id)} disabled={saving} style={{ padding: '4px 10px', background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                          {saving ? '...' : '저장'}
                        </button>
                        <button onClick={() => setEditing(null)} style={{ padding: '4px 8px', background: 'none', color: 'var(--fg2)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                          취소
                        </button>
                      </div>
                    ) : (
                      <div onClick={() => { setEditing(u.id); setRemark(u.remark || '') }}
                        style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: 6, color: u.remark ? 'var(--fg)' : 'var(--fg2)', border: '1px dashed transparent', minHeight: 28, display: 'flex', alignItems: 'center' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                      >
                        {u.remark || <span style={{ fontSize: 12 }}>+ 메모 추가</span>}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
