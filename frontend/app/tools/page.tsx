/**
 * 文件作用：Tools 列表与创建页。
 */

"use client"

import React, { useEffect, useState } from 'react'
import { Table, Button, Form, Input, Space, message, Card } from 'antd'

type Tool = { id: string; name: string; description?: string }
const API = 'http://localhost:8000'

export default function ToolsPage() {
  const [data, setData] = useState<Tool[]>([])
  const [loading, setLoading] = useState(false)

  const fetchTools = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/tools`)
      setData(await res.json())
    } catch { message.error('加载失败') } finally { setLoading(false) }
  }
  useEffect(() => { fetchTools() }, [])

  const onCreate = async (values: any) => {
    try {
      const res = await fetch(`${API}/tools`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...values, schema: {} }) })
      if (!res.ok) throw new Error('bad')
      message.success('创建成功'); fetchTools()
    } catch { message.error('创建失败') }
  }

  return (
    <main style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="创建 Tool">
          <Form layout="vertical" onFinish={onCreate}>
            <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="description" label="描述"><Input /></Form.Item>
            <Button type="primary" htmlType="submit">创建</Button>
          </Form>
        </Card>
        <Card title="Tool 列表">
          <Table rowKey="id" loading={loading} dataSource={data} pagination={false}
                 columns={[
                   { title: 'ID', dataIndex: 'id' },
                   { title: '名称', dataIndex: 'name' },
                   { title: '描述', dataIndex: 'description' }
                 ]}
          />
        </Card>
      </Space>
    </main>
  )
}


