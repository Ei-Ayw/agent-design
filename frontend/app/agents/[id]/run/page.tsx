/**
 * 文件作用：Agent 运行页，订阅后端 SSE 输出。
 */

"use client"

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button, Card, Space, Typography } from 'antd'

const API = 'http://localhost:8000'

export default function AgentRunPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id as string
  const [log, setLog] = useState<string>("")
  const [running, setRunning] = useState(false)

  const start = () => {
    if (!id) return
    setRunning(true)
    const sse = new EventSource(`${API}/agents/${id}/run`)
    sse.onmessage = (e) => setLog(prev => prev + e.data + "\n")
    sse.onerror = () => { sse.close(); setRunning(false) }
  }

  return (
    <main style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Typography.Title level={4}>运行 Agent：{id}</Typography.Title>
        <Space>
          <Button type="primary" disabled={running} onClick={start}>开始</Button>
        </Space>
        <Card title="输出">
          <pre style={{ whiteSpace: 'pre-wrap' }}>{log}</pre>
        </Card>
      </Space>
    </main>
  )
}


