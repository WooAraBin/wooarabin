'use client'

import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

const won = (n) => n ? `${Number(n).toLocaleString()}원` : '-'
const shortWon = (n) => {
  if (!n) return '0'
  if (n >= 10000000) return `${(n / 10000000).toFixed(1)}천만`
  if (n >= 1000000) return `${(n / 1000000).toFixed(0)}백만`
  if (n >= 10000) return `${(n / 10000).toFixed(0)}만`
  return `${n.toLocaleString()}`
}

const STATUS_COLORS = {
  received: '#6b7280', reviewing: '#3b82f6', quoted: '#f59e0b',
  in_progress: '#10b981', completed: '#8b5cf6',
}
const STATUS_LABELS = {
  received: '접수', reviewing: '검토중', quoted: '견적발송',
  in_progress: '진행중', completed: '완료',
}

export default function AdminRevenue({ inquiries }) {
  const [list, setList] = useState(inquiries)

  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()

  // 매출 계산 (입금 확인된 것만)
  let totalRevenue = 0, monthRevenue = 0, yearRevenue = 0
  let prepaid = 0, unpaid = 0

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

  // 월별 매출 데이터 (최근 6개월)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(thisYear, thisMonth - (5 - i), 1)
    const m = d.getMonth()
    const y = d.getFullYear()
    const label = `${m + 1}월`
    let amount = 0
    list.forEach(inq => {
      const dep = inq.deposit_amount || 0
      const fin = inq.final_amount || 0
      if (inq.deposit_confirmed) {
        const cd = new Date(inq.deposit_confirmed_at)
        if (cd.getFullYear() === y && cd.getMonth() === m) amount += dep
      }
      if (inq.final_confirmed) {
        const cd = new Date(inq.final_confirmed_at)
        if (cd.getFullYear() === y && cd.getMonth() === m) amount += fin - dep
      }
    })
    return { label, amount }
  })

  // 상태별 분포
  const statusCounts = Object.entries(STATUS_LABELS).map(([key, label]) => ({
    name: label,
    value: list.filter(i => i.status === key).length,
    color: STATUS_COLORS[key],
  })).filter(d => d.value > 0)

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
        ...(type === 'final'   ? { final_confirmed: true, final_confirmed_at: now } : {}),
      } : i))
    }
  }

  const payableList = list.filter(i => i.final_amount)

  return (
    <div style={{ padding: '24px 32px' }}>

      {/* 요약 카드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
        <SummaryCard label="이번 달 매출" value={won(monthRevenue)} color="#10b981" />
        <SummaryCard label="연 매출" value={won(yearRevenue)} color="#3b82f6" />
        <SummaryCard label="선수금" value={won(prepaid)} color="#f59e0b" sub="입금됐지만 진행중" />
        <SummaryCard label="미납금" value={won(unpaid)} color="#f87171" sub="완료 후 잔금 미수령" />
      </div>

      {/* 그래프 영역 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 36 }}>

        {/* 월별 매출 바 차트 */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 16px' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, paddingLeft: 8 }}>월별 매출 (최근 6개월)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'var(--fg2)' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={shortWon} tick={{ fontSize: 11, fill: 'var(--fg2)' }} axisLine={false} tickLine={false} width={50} />
              <Tooltip
                formatter={(v) => [won(v), '매출']}
                contentStyle={{ background: '#1a1a1a', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: 'var(--fg2)' }}
              />
              <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 상태별 파이 차트 */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 16px' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>프로젝트 현황</h3>
          {statusCounts.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--fg2)', fontSize: 13 }}>데이터 없음</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusCounts} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {statusCounts.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip
                  formatter={(v, n) => [v + '건', n]}
                  contentStyle={{ background: '#1a1a1a', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 프로젝트별 입금 현황 테이블 */}
      <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>프로젝트별 입금 현황</h3>
      {payableList.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--fg2)', fontSize: 14, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10 }}>
          금액이 확정된 프로젝트가 없습니다.
        </div>
      ) : (
        <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 900 }}>
            <thead>
              <tr style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
                {['접수번호', '프로젝트', '접수일', '작업시작일', '완료일', '최종금액', '선입금 확인', '잔금 확인'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--fg2)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payableList.map(inq => {
                const dep = inq.deposit_amount || 0
                const fin = inq.final_amount || 0
                return (
                  <tr key={inq.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: 12, color: 'var(--fg2)', whiteSpace: 'nowrap' }}>
                      {inq.inquiry_number || '-'}
                    </td>
                    <td style={{ padding: '12px 14px', maxWidth: 180 }}>
                      <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inq.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--fg2)', marginTop: 2 }}>{inq.user_name}</div>
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--fg2)', whiteSpace: 'nowrap', fontSize: 12 }}>
                      {new Date(inq.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--fg2)', whiteSpace: 'nowrap', fontSize: 12 }}>
                      {inq.work_started_at ? new Date(inq.work_started_at).toLocaleDateString('ko-KR') : '-'}
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--fg2)', whiteSpace: 'nowrap', fontSize: 12 }}>
                      {inq.completed_at ? new Date(inq.completed_at).toLocaleDateString('ko-KR') : '-'}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 700 }}>{won(fin)}</td>
                    <td style={{ padding: '12px 14px' }}>
                      {dep > 0 ? (
                        inq.deposit_confirmed
                          ? <Confirmed date={inq.deposit_confirmed_at} />
                          : <ConfirmBtn onClick={() => confirm(inq.id, 'deposit')}>선입금 {won(dep)}<br/>입금 확인</ConfirmBtn>
                      ) : <span style={{ color: 'var(--fg2)', fontSize: 12 }}>-</span>}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {inq.final_confirmed
                        ? <Confirmed date={inq.final_confirmed_at} />
                        : <ConfirmBtn onClick={() => confirm(inq.id, 'final')} color="#8b5cf6">잔금 {won(fin - dep)}<br/>입금 확인</ConfirmBtn>}
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

function SummaryCard({ label, value, color, sub }) {
  return (
    <div style={{ padding: '18px 20px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, borderTop: `3px solid ${color}` }}>
      <div style={{ fontSize: 12, color: 'var(--fg2)', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 900, color }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--fg2)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function ConfirmBtn({ onClick, children, color = '#3b82f6' }) {
  return (
    <button onClick={onClick} style={{
      padding: '5px 10px', background: color + '22', color, border: `1px solid ${color}44`,
      borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
      lineHeight: 1.5, textAlign: 'center',
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
