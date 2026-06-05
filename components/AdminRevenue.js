'use client'

import { useState } from 'react'

const won = (n) => n ? `${Number(n).toLocaleString()}원` : '-'

export default function AdminRevenue({ inquiries }) {
  const [list, setList] = useState(inquiries)

  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()

  // 입금 확인된 금액만 매출로 계산
  let totalRevenue = 0
  let monthRevenue = 0
  let yearRevenue = 0
  let prepaid = 0      // 선수금: 선입금 확인됐지만 잔금 미확인
  let unpaid = 0       // 미납금: 완료인데 잔금 미확인

  list.forEach(inq => {
    const dep = inq.deposit_amount || 0
    const fin = inq.final_amount || 0
    const remain = fin - dep

    if (inq.deposit_confirmed) {
      totalRevenue += dep
      const d = new Date(inq.deposit_confirmed_at)
      if (d.getFullYear() === thisYear) yearRevenue += dep
      if (d.getFullYear() === thisYear && d.getMonth() === thisMonth) monthRevenue += dep
      if (!inq.final_confirmed) prepaid += dep
    }
    if (inq.final_confirmed) {
      totalRevenue += remain
      const d = new Date(inq.final_confirmed_at)
      if (d.getFullYear() === thisYear) yearRevenue += remain
      if (d.getFullYear() === thisYear && d.getMonth() === thisMonth) monthRevenue += remain
    }
    if (inq.status === 'completed' && !inq.final_confirmed && fin > 0) {
      unpaid += fin - (inq.deposit_confirmed ? dep : 0)
    }
  })

  // 입금 확인 처리
  async function confirm(id, type) {
    const res = await fetch(`/api/admin/inquiries/${id}/payment`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    })
    if (res.ok) {
      const now = new Date().toISOString()
      setList(l => l.map(i => i.id === id ? {
        ...i,
        ...(type === 'deposit' ? { deposit_confirmed: true, deposit_confirmed_at: now } : {}),
        ...(type === 'final'   ? { final_confirmed: true,   final_confirmed_at: now   } : {}),
      } : i))
    }
  }

  const payableList = list.filter(i => i.final_amount && (i.status === 'in_progress' || i.status === 'completed' || i.status === 'quoted'))

  return (
    <div style={{ padding: '28px 32px', maxWidth: 900 }}>

      {/* 요약 카드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
        <Card label="월 매출" value={won(monthRevenue)} color="#10b981" />
        <Card label="연 매출" value={won(yearRevenue)} color="#3b82f6" />
        <Card label="선수금" value={won(prepaid)} color="#f59e0b" sub="입금됐지만 진행중" />
        <Card label="미납금" value={won(unpaid)} color="#f87171" sub="완료 후 잔금 미수령" />
      </div>

      {/* 입금 현황 테이블 */}
      <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>프로젝트별 입금 현황</h2>

      {payableList.length === 0 ? (
        <p style={{ color: 'var(--fg2)', fontSize: 14 }}>금액이 확정된 프로젝트가 없습니다.</p>
      ) : (
        <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
                {['프로젝트', '의뢰인', '최종금액', '선입금', '잔금', '선입금 확인', '잔금 확인'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--fg2)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payableList.map(inq => {
                const dep = inq.deposit_amount || 0
                const fin = inq.final_amount || 0
                const remain = fin - dep
                return (
                  <tr key={inq.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 600, maxWidth: 180 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inq.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--fg2)', marginTop: 2 }}>{inq.user_name}</div>
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--fg2)' }}>{inq.user_email}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 700 }}>{won(fin)}</td>
                    <td style={{ padding: '12px 14px' }}>{dep ? won(dep) : '-'}</td>
                    <td style={{ padding: '12px 14px' }}>{dep ? won(remain) : won(fin)}</td>
                    <td style={{ padding: '12px 14px' }}>
                      {dep > 0 ? (
                        inq.deposit_confirmed
                          ? <Confirmed date={inq.deposit_confirmed_at} />
                          : <ConfirmBtn onClick={() => confirm(inq.id, 'deposit')}>선입금 확인</ConfirmBtn>
                      ) : <span style={{ color: 'var(--fg2)' }}>-</span>}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {inq.final_confirmed
                        ? <Confirmed date={inq.final_confirmed_at} />
                        : <ConfirmBtn onClick={() => confirm(inq.id, 'final')} color="#10b981">잔금 확인</ConfirmBtn>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Card({ label, value, color, sub }) {
  return (
    <div style={{ padding: '18px 20px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, borderTop: `3px solid ${color}` }}>
      <div style={{ fontSize: 12, color: 'var(--fg2)', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 900, color }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--fg2)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function ConfirmBtn({ onClick, children, color = '#3b82f6' }) {
  return (
    <button onClick={onClick} style={{
      padding: '5px 10px', background: color + '22', color, border: `1px solid ${color}44`,
      borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
    }}>{children}</button>
  )
}

function Confirmed({ date }) {
  return (
    <div style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>
      ✓ 확인됨<br />
      <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--fg2)' }}>
        {new Date(date).toLocaleDateString('ko-KR')}
      </span>
    </div>
  )
}
