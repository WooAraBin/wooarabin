'use client'

import { useState } from 'react'

export default function AdminCustomers({ customers }) {
  const [list, setList] = useState(customers)
  const [editing, setEditing] = useState(null) // 현재 remark 수정 중인 id
  const [remark, setRemark] = useState('')
  const [saving, setSaving] = useState(false)

  const nonAdmins = list.filter(u => u.role !== 'admin')

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
    <div style={{ padding: '28px 32px', maxWidth: 900 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700 }}>가입 고객</h2>
        <span style={{ fontSize: 13, color: 'var(--fg2)' }}>총 {nonAdmins.length}명</span>
      </div>

      {nonAdmins.length === 0 ? (
        <p style={{ color: 'var(--fg2)', fontSize: 14 }}>가입한 고객이 없습니다.</p>
      ) : (
        <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
                {['이메일', '이름', '연락처', '가입일', 'Remark'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--fg2)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {nonAdmins.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <a href={`mailto:${u.email}`} style={{ color: 'var(--accent)' }}>{u.email}</a>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--fg2)' }}>{u.name || '-'}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--fg2)' }}>
                    {(() => {
                      const phone = u.inquiries?.find(i => i.phone_number)?.phone_number
                      return phone ? <a href={`tel:${phone}`} style={{ color: 'var(--accent)' }}>{phone}</a> : '-'
                    })()}
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
