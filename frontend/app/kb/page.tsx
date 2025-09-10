/**
 * 文件作用：KB 列表与创建、文本 Ingest 占位调用。
 */

"use client"

import React, { useEffect, useState } from 'react'
import { Table, Button, Form, Input, Space, message, Card } from 'antd'

type KB = { id: string; name?: string }
const API = 'http://localhost:8000'

export default function KBPage() {
  const [data, setData] = useState<KB[]>([])
  const [loading, setLoading] = useState(false)
  const [ingestPreview, setIngestPreview] = useState('')

  const fetchKB = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/kb`)
      setData(await res.json())
    } catch {
      message.error('加载失败')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchKB() }, [])

  const onCreate = async (values: any) => {
    try {
      const res = await fetch(`${API}/kb`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) })
      if (!res.ok) throw new Error('bad')
      message.success('创建成功'); fetchKB()
    } catch { message.error('创建失败') }
  }

  const ingest = async (kid: string, text: string) => {
    const res = await fetch(`${API}/kb/${kid}/documents/ingest`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) })
    const json = await res.json(); setIngestPreview(json.preview || '')
  }

  return (
    <main style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="创建 KB">
          <Form layout="vertical" onFinish={onCreate}>
            <Form.Item name="name" label="名称"><Input /></Form.Item>
            <Button type="primary" htmlType="submit">创建</Button>
          </Form>
        </Card>
        <Card title="KB 列表">
          <Table rowKey="id" loading={loading} dataSource={data} pagination={false}
                 columns={[
                   { title: 'ID', dataIndex: 'id' },
                   { title: '名称', dataIndex: 'name' },
                   { title: '操作', render: (_, r: KB) => (
                     <Space>
                       <Button onClick={() => ingest(r.id, '示例文本 Example text for ingest.')}>Ingest 文本</Button>
                     </Space>
                   )}
                 ]}
          />
          {ingestPreview && <pre style={{ whiteSpace: 'pre-wrap', marginTop: 16 }}>{ingestPreview}</pre>}
        </Card>
      </Space>
    </main>
  )
}


