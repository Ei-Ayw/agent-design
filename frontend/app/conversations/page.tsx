/**
 * 文件作用：会话列表与消息展示页，对接 /conversations 与 /conversations/{id}/messages。
 */

"use client"

import React, { useEffect, useState } from 'react'
import { Table, Button, Form, Input, Space, message, Card, Modal } from 'antd'

type Conversation = { id: string; agent_id: string; title?: string }
type Message = { id: string; role: string; content: string }
const API = 'http://localhost:8000'

export default function ConversationsPage() {
  const [data, setData] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(false)
  const [msgs, setMsgs] = useState<string[]>([])
  const [visible, setVisible] = useState(false)
  const [current, setCurrent] = useState<string | null>(null)

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

  const showStream = async (cid: string) => {
    setMsgs([]); setVisible(true); setCurrent(cid)
    const sse = new EventSource(`${API}/conversations/${cid}/messages`)
    sse.onmessage = (e) => setMsgs(prev => [...prev, e.data])
    sse.onerror = () => sse.close()
  }

  return (
    <main style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="创建会话">
          <Form layout="vertical" onFinish={onCreate}>
            <Form.Item name="agent_id" label="Agent ID" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="title" label="标题"><Input /></Form.Item>
            <Button type="primary" htmlType="submit">创建</Button>
          </Form>
        </Card>
        <Card title="会话列表">
          <Table rowKey="id" loading={loading} dataSource={data} pagination={false}
                 columns={[
                   { title: 'ID', dataIndex: 'id' },
                   { title: 'Agent', dataIndex: 'agent_id' },
                   { title: '标题', dataIndex: 'title' },
                   { title: '操作', render: (_, r: Conversation) => (
                     <Space>
                       <Button onClick={() => showStream(r.id)}>查看消息流</Button>
                     </Space>
                   )}
                 ]}
          />
      </Card>
      </Space>

      <Modal title={`消息流 ${current || ''}`} open={visible} onCancel={() => setVisible(false)} footer={null} width={800}>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{msgs.join('\n')}</pre>
      </Modal>
    </main>
  )
}


