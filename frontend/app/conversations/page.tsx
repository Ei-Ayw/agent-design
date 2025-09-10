/**
 * 文件作用：会话工作台（三栏布局：会话列表/消息区/上下文侧栏）
 */

"use client"

import React, { useEffect, useRef, useState } from 'react'
import { Table, Button, Form, Input, Space, message, Card, Modal, List, Typography, Collapse, Tag } from 'antd'

type Conversation = { id: string; agent_id: string; title?: string }
type Message = { id: string; role: string; content: string; function_call?: any; attachments?: any[] }
const API = 'http://localhost:8000'

export default function ConversationsPage() {
  const [data, setData] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(false)
  const [current, setCurrent] = useState<Conversation | null>(null)
  const [msgs, setMsgs] = useState<string[]>([])
  const evtRef = useRef<EventSource | null>(null)

  const fetchConvs = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/conversations`)
      setData(await res.json())
    } catch { message.error('加载失败') } finally { setLoading(false) }
  }
  useEffect(() => { fetchConvs() }, [])

  const onCreate = async (values: any) => {
    try {
      const res = await fetch(`${API}/conversations`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) })
      if (!res.ok) throw new Error('bad')
      message.success('创建成功'); fetchConvs()
    } catch { message.error('创建失败') }
  }

  const startStream = async (c: Conversation) => {
    if (evtRef.current) { evtRef.current.close(); evtRef.current = null }
    setMsgs([]); setCurrent(c)
    const sse = new EventSource(`${API}/conversations/${c.id}/messages`)
    sse.onmessage = (e) => setMsgs(prev => [...prev, e.data])
    sse.onerror = () => sse.close()
    evtRef.current = sse
  }

  return (
    <main style={{ padding: 0 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 320px', height: 'calc(100vh - 64px)' }}>
        <div style={{ borderRight: '1px solid rgba(0,0,0,0.06)', padding: 16, overflow: 'auto' }}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card size="small" title="创建会话">
              <Form layout="vertical" onFinish={onCreate}>
                <Form.Item name="agent_id" label="Agent ID" rules={[{ required: true }]}><Input /></Form.Item>
                <Form.Item name="title" label="标题"><Input /></Form.Item>
                <Button type="primary" htmlType="submit" block>创建</Button>
              </Form>
            </Card>
            <Card size="small" title="会话列表">
              <List
                dataSource={data}
                renderItem={(item) => (
                  <List.Item style={{ cursor:'pointer' }} onClick={() => startStream(item)}>
                    <Space direction="vertical" size={0}>
                      <Typography.Text strong>{item.title || item.id.slice(0,8)}</Typography.Text>
                      <Typography.Text type="secondary" style={{ fontSize:12 }}>Agent: {item.agent_id}</Typography.Text>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          </Space>
        </div>
        <div style={{ padding: 16, overflow: 'auto' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Typography.Title level={4} style={{ marginTop: 0 }}>{current?.title || '选择会话'}</Typography.Title>
            <Card>
              <pre style={{ whiteSpace: 'pre-wrap', minHeight: 300 }}>{msgs.join('\n')}</pre>
            </Card>
          </Space>
        </div>
        <div style={{ borderLeft: '1px solid rgba(0,0,0,0.06)', padding: 16, overflow: 'auto' }}>
          <Card size="small" title="上下文">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Typography.Text type="secondary">系统提示</Typography.Text>
                <Card size="small">（展示当前会话系统提示/Agent 快照）</Card>
              </div>
              <div>
                <Typography.Text type="secondary">证据清单</Typography.Text>
                <List dataSource={[{title:'示例证据 1', score:0.82},{title:'示例证据 2', score:0.77}]}
                  renderItem={(i:any) => <List.Item>{i.title} <Tag style={{ marginLeft: 8 }}>{i.score}</Tag></List.Item>}
                />
              </div>
            </Space>
          </Card>
        </div>
      </div>
    </main>
  )
}


