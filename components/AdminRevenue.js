'use client'

import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
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
const STATUS_LABELS_KO = {
  received: '접수', reviewing: '검토중', quoted: '견적발송',
  in_progress: '진행중', completed: '완료',
}

export default function AdminRevenue({ inquiries }) {
  const [list, setList] = useState(inquiries)
  const [selectedMonth, setSelectedMonth] = useState(null) // null = 전체

  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()

  // 매출 계산
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

  // 월별 데이터 (최근 6개월)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(thisYear, thisMonth - (5 - i), 1)
    const m = d.getMonth()
    const y = d.getFullYear()
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
    return { label: `${m + 1}월`, amount, month: m, year: y }
  })

  // 선택된 월의 프로젝트 필터링
  const filteredByMonth = selectedMonth
    ? list.filter(inq => {
        const dep = inq.deposit_amount || 0
        const fin = inq.final_amount || 0
        const depOk = inq.deposit_confirmed && (() => {
          const d = new Date(inq.deposit_confirmed_at)
          return d.getFullYear() === selectedMonth.year && d.getMonth() === selectedMonth.month
        })()
        const finOk = inq.final_confirmed && (() => {
          const d = new Date(inq.final_confirmed_at)
          return d.getFullYear() === selectedMonth.year && d.getMonth() === selectedMonth.month
        })()
        return depOk || finOk
      })
    : list.filter(i => i.final_amount)

  // 상태별 분포
  const statusCounts = Object.entries(STATUS_LABELS_KO).map(([key, name]) => ({
    name, value: list.filter(i => i.status === key).length, color: STATUS_COLORS[key],
  })).filter(d => d.value > 0)

  // 진행중 프로젝트
  const inProgressList = list.filter(i => i.status === 'in_progress')

  // 입금 확인
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

  return (
    <div style={{ padding: '24px 32px' }}>

      {/* 요약 카드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        <SummaryCard label="이번 달 매출" value={won(monthRevenue)} color="#10b981" />
        <SummaryCard label="연 매출" value={won(yearRevenue)} color="#3b82f6" />
        <SummaryCard label="선수금" value={won(prepaid)} color="#f59e0b" sub="입금됐지만 진행중" />
        <SummaryCard label="미납금" value={won(unpaid)} color="#f87171" sub="완료 후 잔금 미수령" />
      </div>

      {/* 그래프 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>

        {/* 월별 바 차트 */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingLeft: 8 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700 }}>월별 매출 (최근 6개월)</h3>
            {selectedMonth && (
              <button onClick={() => setSelectedMonth(null)} style={{ fontSize: 12, color: 'var(--fg2)', background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>
                전체 보기
              </button>
            )}
          </div>
          <p style={{ fontSize: 11, color: 'var(--fg2)', paddingLeft: 8, marginBottom: 8 }}>막대를 클릭하면 해당 월 내역을 확인할 수 있습니다</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
              onClick={(e) => {
                if (e?.activePayload?.[0]) {
                  const d = e.activePayload[0].payload
                  setSelectedMonth(selectedMonth?.month === d.month ? null : { month: d.month, year: d.year, label: d.label })
                }
              }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'var(--fg2)' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={shortWon} tick={{ fontSize: 11, fill: 'var(--fg2)' }} axisLine={false} tickLine={false} width={50} />
              <Tooltip
                formatter={(v) => [won(v), '매출']}
                contentStyle={{ background: '#1a1a1a', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: 'var(--fg2)' }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]} style={{ cursor: 'pointer' }}>
                {monthlyData.map((entry, i) => (
                  <Cell key={i} fill={selectedMonth?.month === entry.month ? '#60a5fa' : '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 상태별 파이 차트 */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 16px' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>프로젝트 현황</h3>
          {statusCounts.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--fg2)', fontSize: 13 }}>데이터 없음</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusCounts} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {statusCounts.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v + '건', n]} contentStyle={{ background: '#1a1a1a', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 진행중 프로젝트 */}
      {inProgressList.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
            <span style={{ color: '#10b981' }}>●</span> 현재 진행중 프로젝트 ({inProgressList.length}건)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {inProgressList.map(inq => (
              <div key={inq.id} style={{ padding: '12px 16px', background: 'var(--card)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{inq.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--fg2)', marginTop: 3 }}>
                    {inq.inquiry_number && <span style={{ fontFamily: 'monospace', marginRight: 8 }}>{inq.inquiry_number}</span>}
                    {inq.user_name}
                    {inq.work_started_at && <span> · 시작 {new Date(inq.work_started_at).toLocaleDateString('ko-KR')}</span>}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{won(inq.final_amount)}</div>
                  <div style={{ fontSize: 11, color: 'var(--fg2)' }}>선입금 {won(inq.deposit_amount)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 입금 현황 테이블 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700 }}>
          {selectedMonth ? `${selectedMonth.label} 입금 내역` : '프로젝트별 입금 현황'}
          {selectedMonth && <span style={{ fontSize: 12, color: 'var(--fg2)', fontWeight: 400, marginLeft: 8 }}>({filteredByMonth.length}건)</span>}
        </h3>
      </div>

      {filteredByMonth.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--fg2)', fontSize: 14, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10 }}>
          {selectedMonth ? `${selectedMonth.label}에 입금 확인된 내역이 없습니다.` : '금액이 확정된 프로젝트가 없습니다.'}
        </div>
      ) : (
        <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 860 }}>
            <thead>
              <tr style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
                {['접수번호', '프로젝트', '접수일', '작업시작일', '완료일', '최종금액', '선입금', '잔금'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--fg2)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredByMonth.map(inq => {
                const dep = inq.deposit_amount || 0
                const fin = inq.final_amount || 0
                const remain = fin - dep
                return (
                  <tr key={inq.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: 12, color: 'var(--fg2)', whiteSpace: 'nowrap' }}>{inq.inquiry_number || '-'}</td>
                    <td style={{ padding: '12px 14px', maxWidth: 160 }}>
                      <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inq.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--fg2)', marginTop: 2 }}>{inq.user_name}</div>
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--fg2)', fontSize: 12, whiteSpace: 'nowrap' }}>{new Date(inq.created_at).toLocaleDateString('ko-KR')}</td>
                    <td style={{ padding: '12px 14px', color: 'var(--fg2)', fontSize: 12, whiteSpace: 'nowrap' }}>{inq.work_started_at ? new Date(inq.work_started_at).toLocaleDateString('ko-KR') : '-'}</td>
                    <td style={{ padding: '12px 14px', color: 'var(--fg2)', fontSize: 12, whiteSpace: 'nowrap' }}>{inq.completed_at ? new Date(inq.completed_at).toLocaleDateString('ko-KR') : '-'}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 700 }}>{won(fin)}</td>
                    <td style={{ padding: '12px 14px' }}>
                      {dep > 0 ? (
                        inq.deposit_confirmed
                          ? <ConfirmedBadge amount={dep} date={inq.deposit_confirmed_at} />
                          : <ConfirmBtn onClick={() => confirm(inq.id, 'deposit')} color="#f59e0b">{won(dep)}</ConfirmBtn>
                      ) : <span style={{ color: 'var(--fg2)', fontSize: 12 }}>-</span>}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {inq.final_confirmed
                        ? <ConfirmedBadge amount={remain || fin} date={inq.final_confirmed_at} />
                        : <ConfirmBtn onClick={() => confirm(inq.id, 'final')} color="#8b5cf6">{won(remain || fin)}</ConfirmBtn>}
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

function ConfirmBtn({ onClick, children, color }) {
  return (
    <button onClick={onClick} style={{
      padding: '5px 10px', background: color + '22', color, border: `1px solid ${color}55`,
      borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
    }}>
      {children} 확인
    </button>
  )
}

function ConfirmedBadge({ amount, date }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', flexShrink: 0 }}>✓</span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#10b981' }}>{won(amount)}</div>
        <div style={{ fontSize: 11, color: 'var(--fg2)' }}>{new Date(date).toLocaleDateString('ko-KR')}</div>
      </div>
    </div>
  )
}
