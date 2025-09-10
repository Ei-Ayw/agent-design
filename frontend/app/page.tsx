/**
 * 文件作用：主页，提供 SSE 订阅演示与基本导航。
 */

"use client"

import React, { useEffect, useState } from 'react'
import { Button, Space, Typography, Card } from 'antd'

export default function HomePage() {
  const [messages, setMessages] = useState<string[]>([])
  const [running, setRunning] = useState(false)

  const startSse = () => {
    setRunning(true)
    const sse = new EventSource('http://localhost:8000/sse/demo')
    sse.onmessage = (e) => {
      setMessages(prev => [...prev, e.data])
    }
    sse.onerror = () => {
      sse.close()
      setRunning(false)
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Typography.Title level={3}>AI Agent 控制台（SSE 演示）</Typography.Title>
        <Space>
          <Button type="primary" onClick={startSse} disabled={running}>开始订阅 SSE</Button>
          <Button onClick={() => { setMessages([]); setRunning(false) }}>清空</Button>
        </Space>
        <Card title="SSE 消息">
          <pre style={{ whiteSpace: 'pre-wrap' }}>{messages.join('\n')}</pre>
        </Card>
      </Space>
    </main>
  )
}


