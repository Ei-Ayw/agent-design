/**
 * 文件作用：Agents 列表与创建页（直连后端），支持跳转运行页。
 */

"use client"

import React, { useEffect, useState } from 'react'
import { Table, Button, Form, Input, Space, message, Card } from 'antd'
import Link from 'next/link'

type Agent = {
  id: string
  name: string
  description?: string
  system_prompt?: string
  model?: string
}

const API = 'http://localhost:8000'

export default function AgentsPage() {
  const [data, setData] = useState<Agent[]>([])
  const [loading, setLoading] = useState(false)

  const authHeaders = (): HeadersInit => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const headers: Record<string, string> = {}
    if (t) headers.Authorization = `Bearer ${t}`
    return headers
  }

  const fetchAgents = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/agents`, { headers: authHeaders() })
      const json = await res.json()
      setData(json)
    } catch (e) {
      message.error('加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAgents() }, [])

  const onCreate = async (values: any) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      Object.assign(headers, authHeaders() as Record<string, string>)
      const res = await fetch(`${API}/agents`, { method: 'POST', headers, body: JSON.stringify(values) })
      if (!res.ok) throw new Error('bad')
      message.success('创建成功')
      fetchAgents()
    } catch {
      message.error('创建失败')
    }
  }

  const bindTool = async (agentId: string) => {
    const toolId = prompt('输入要绑定的 Tool ID')
    if (!toolId) return
    const res = await fetch(`${API}/agents/${agentId}/tools?tool_id=${encodeURIComponent(toolId)}`, { method: 'POST', headers: authHeaders() })
    if (res.ok) { message.success('已绑定'); fetchAgents() } else { message.error('绑定失败') }
  }

  return (
    <main style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="创建 Agent">
          <Form layout="vertical" onFinish={onCreate}>
            <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input placeholder="如：默认助手" /></Form.Item>
            <Form.Item name="description" label="描述"><Input /></Form.Item>
            <Form.Item name="system_prompt" label="系统提示"><Input.TextArea rows={3} /></Form.Item>
            <Form.Item name="model" label="模型"><Input placeholder="deepseek-r1" /></Form.Item>
            <Button type="primary" htmlType="submit">创建</Button>
          </Form>
        </Card>
        <Card title="Agent 列表">
          <Table rowKey="id" loading={loading} dataSource={data} pagination={false}
                 columns={[
                   { title: 'ID', dataIndex: 'id' },
                   { title: '名称', dataIndex: 'name' },
                   { title: '模型', dataIndex: 'model' },
                   { title: '操作', render: (_, r: Agent) => (
                     <Space>
                       <Link href={`/agents/${r.id}/run`}><Button type="link">运行</Button></Link>
                       <Button onClick={() => bindTool(r.id)}>绑定工具</Button>
                     </Space>
                   )}
                 ]}
          />
        </Card>
      </Space>
    </main>
  )
}


