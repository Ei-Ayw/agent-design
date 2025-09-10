/**
 * 文件作用：工具调用面板，输入 Tool ID 与 JSON 参数，调用后端进行 Schema 校验与执行占位。
 */

"use client"

import React, { useState } from 'react'
import { Card, Input, Space, Button, message } from 'antd'

const API = 'http://localhost:8000'

export default function ToolInvokePage() {
  const [toolId, setToolId] = useState('')
  const [params, setParams] = useState('{}')
  const [out, setOut] = useState('')

  const authHeaders = () => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    return t ? { Authorization: `Bearer ${t}` } : {}
  }

  const invoke = async () => {
    try {
      const body = JSON.parse(params)
      const res = await fetch(`${API}/tools/${encodeURIComponent(toolId)}/invoke`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(body) })
      const json = await res.json()
      if (!res.ok) throw new Error(json.detail || '调用失败')
      setOut(JSON.stringify(json, null, 2))
    } catch (e: any) {
      message.error(e.message)
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="工具调用">
          <Space direction="vertical" style={{ width: 600 }}>
            <Input placeholder="Tool ID" value={toolId} onChange={e => setToolId(e.target.value)} />
            <Input.TextArea rows={10} value={params} onChange={e => setParams(e.target.value)} />
            <Button type="primary" onClick={invoke}>调用</Button>
          </Space>
        </Card>
        {out && <Card title="输出"><pre>{out}</pre></Card>}
      </Space>
    </main>
  )
}


