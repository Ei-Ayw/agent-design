/**
 * 文件作用：工作流列表/创建与运行展示页，对接后端 /workflows 与 /workflows/{id}/runs。
 */

"use client"

import React, { useEffect, useState } from 'react'
import { Table, Button, Form, Input, Space, message, Card, Modal } from 'antd'

type Workflow = { id: string; name?: string; nodes?: any[] }
type Run = { id: string; status: string }
const API = 'http://localhost:8000'

export default function WorkflowsPage() {
  const [data, setData] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(false)
  const [runs, setRuns] = useState<Run[]>([])
  const [visible, setVisible] = useState(false)
  const [current, setCurrent] = useState<string | null>(null)

  const fetchWF = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/workflows`)
      setData(await res.json())
    } catch { message.error('加载失败') } finally { setLoading(false) }
  }
  useEffect(() => { fetchWF() }, [])

  const onCreate = async (values: any) => {
    try {
      const res = await fetch(`${API}/workflows`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: values.name, nodes: [] }) })
      if (!res.ok) throw new Error('bad')
      message.success('创建成功'); fetchWF()
    } catch { message.error('创建失败') }
  }

  const run = async (wid: string) => {
    const res = await fetch(`${API}/workflows/${wid}/run`, { method: 'POST' })
    if (res.ok) { message.success('已触发运行'); showRuns(wid) } else { message.error('触发失败') }
  }

  const showRuns = async (wid: string) => {
    setCurrent(wid)
    const res = await fetch(`${API}/workflows/${wid}/runs`)
    setRuns(await res.json())
    setVisible(true)
  }

  return (
    <main style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="创建 Workflow">
          <Form layout="vertical" onFinish={onCreate}>
            <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
            <Button type="primary" htmlType="submit">创建</Button>
          </Form>
        </Card>
        <Card title="Workflow 列表">
          <Table rowKey="id" loading={loading} dataSource={data} pagination={false}
                 columns={[
                   { title: 'ID', dataIndex: 'id' },
                   { title: '名称', dataIndex: 'name' },
                   { title: '操作', render: (_, r: Workflow) => (
                     <Space>
                       <Button onClick={() => run(r.id)}>运行</Button>
                       <Button onClick={() => showRuns(r.id)}>查看运行</Button>
                     </Space>
                   )}
                 ]}
          />
        </Card>
      </Space>

      <Modal title={`运行历史 ${current || ''}`} open={visible} onCancel={() => setVisible(false)} footer={null} width={800}>
        <Table rowKey="id" dataSource={runs} pagination={false}
               columns={[{ title: 'Run ID', dataIndex: 'id' }, { title: '状态', dataIndex: 'status' }]} />
      </Modal>
    </main>
  )
}


