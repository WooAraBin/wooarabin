'use client'

import { useState } from 'react'
import InquiryForm from './InquiryForm'

export default function InquiryTabs({ user }) {
  const [tab, setTab] = useState('new')

  const tabStyle = (active) => ({
    padding: '10px 24px', fontSize: 14, fontWeight: active ? 700 : 400,
    cursor: 'pointer', border: 'none', fontFamily: 'inherit',
    background: 'none', color: active ? 'var(--fg)' : 'var(--fg2)',
    borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
    transition: 'all .15s',
  })

  return (
    <div>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 32 }}>
        <button style={tabStyle(tab === 'new')} onClick={() => setTab('new')}>신규 의뢰</button>
        <button style={tabStyle(tab === 'as')} onClick={() => setTab('as')}>AS 의뢰</button>
      </div>
      <InquiryForm user={user} type={tab} />
    </div>
  )
}
