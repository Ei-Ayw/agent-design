/**
 * 文件作用：KB 检索页，选择 KB 并输入查询，展示混检结果。
 */

"use client"

import React, { useEffect, useState } from 'react'
import { Select, Input, Button, Card, Space, message } from 'antd'

const API = 'http://localhost:8000'

export default function KBSearchPage() {
  const [kbs, setKbs] = useState<any[]>([])
  const [kid, setKid] = useState<string>()
  const [q, setQ] = useState('')
  const [items, setItems] = useState<string[]>([])

  useEffect(() => { fetch(`${API}/kb`).then(r => r.json()).then(setKbs) }, [])

  const search = async () => {
    if (!kid || !q) { message.warning('请选择 KB 并输入查询'); return }
    const res = await fetch(`${API}/kb/${kid}/search?q=${encodeURIComponent(q)}`)
    const json = await res.json()
    setItems(json.items || [])
  }

  return (
    <main style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="KB 检索">
          <Space>
            <Select style={{ width: 240 }} placeholder="选择 KB" options={kbs.map(k => ({ value: k.id, label: k.name || k.id }))} onChange={setKid} />
            <Input style={{ width: 360 }} placeholder="输入查询" value={q} onChange={e => setQ(e.target.value)} />
            <Button type="primary" onClick={search}>搜索</Button>
          </Space>
        </Card>
        <Card title="结果">
          <pre style={{ whiteSpace: 'pre-wrap' }}>{items.join('\n\n')}</pre>
        </Card>
      </Space>
    </main>
  )
}


