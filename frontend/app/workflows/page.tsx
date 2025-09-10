/**
 * 文件作用：工作流编排器（画布/节点库/属性抽屉/运行回放占位），对接后端 /workflows 与 /workflows/{id}/runs。
 */

"use client"

import React, { useEffect, useState } from 'react'
import { Table, Button, Form, Input, Space, message, Card, Modal, Drawer, List, Typography, Tabs } from 'antd'

type Workflow = { id: string; name?: string; nodes?: any[] }
type Run = { id: string; status: string }
const API = 'http://localhost:8000'

export default function WorkflowsPage() {
  const [data, setData] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(false)
  const [runs, setRuns] = useState<Run[]>([])
  const [visible, setVisible] = useState(false)
  const [current, setCurrent] = useState<string | null>(null)
  const [designerOpen, setDesignerOpen] = useState(false)
  const [selectedNode, setSelectedNode] = useState<any | null>(null)
  const [canvasNodes, setCanvasNodes] = useState<any[]>([])

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
    const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const headers: Record<string, string> = {}
    if (t) headers.Authorization = `Bearer ${t}`
    const res = await fetch(`${API}/workflows/${wid}/run`, { method: 'POST', headers })
    if (res.ok) { message.success('已触发运行'); showRuns(wid) } else { message.error('触发失败') }
  }

  const showRuns = async (wid: string) => {
    setCurrent(wid)
    const res = await fetch(`${API}/workflows/${wid}/runs`)
    setRuns(await res.json())
    setVisible(true)
  }

  const openDesigner = (wf?: Workflow) => {
    setDesignerOpen(true)
    setCanvasNodes(wf?.nodes || [])
  }

  const palette = [
    { type: 'llm', name: 'LLM 节点' },
    { type: 'tool', name: '工具节点' },
    { type: 'if', name: '条件分支' },
    { type: 'loop', name: '循环' },
    { type: 'merge', name: '汇聚' },
    { type: 'approval', name: '审批' }
  ]

  const addNodeToCanvas = (n:any) => {
    const node = { id: `${n.type}-${Date.now()}`, type: n.type, name: n.name, x: 40 + canvasNodes.length*24, y: 40 + canvasNodes.length*16 }
    setCanvasNodes(prev => [...prev, node])
    setSelectedNode(node)
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
                       <Button onClick={() => openDesigner(r)}>编排</Button>
                     </Space>
                   )}
                 ]}
          />
        </Card>
      </Space>

      {/* 运行历史 */}
      <Modal title={`运行历史 ${current || ''}`} open={visible} onCancel={() => setVisible(false)} footer={null} width={860}>
        <Table rowKey="id" dataSource={runs} pagination={false}
               columns={[
                 { title: 'Run ID', dataIndex: 'id' },
                 { title: '状态', dataIndex: 'status' },
                 { title: '操作', render: (_, r: Run) => <Button onClick={async () => {
                   const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null
                   const node = prompt('输入要审批的节点 ID')
                   if (!node) return
                   const headers: Record<string, string> = {}
                   if (t) headers.Authorization = `Bearer ${t}`
                   const res = await fetch(`${API}/workflows/runs/${r.id}/approve?node_id=${encodeURIComponent(node)}`, { method: 'POST', headers })
                   if (res.ok) { message.success('已审批'); showRuns(current!) } else { message.error('审批失败') }
                 }}>审批节点</Button> }
               ]} />
      </Modal>

      {/* 编排器抽屉（占位实现） */}
      <Drawer open={designerOpen} onClose={() => setDesignerOpen(false)} title="工作流编排器" width={1100}>
        <div style={{ display:'grid', gridTemplateColumns: '240px 1fr 320px', gap: 16, height: 'calc(100vh - 180px)' }}>
          {/* 节点库 */}
          <Card title="节点库" size="small" style={{ height: '100%', overflow:'auto' }}>
            <List dataSource={palette} renderItem={(n) => (
              <List.Item style={{ cursor:'pointer' }} onClick={() => addNodeToCanvas(n)}>{n.name}</List.Item>
            )} />
          </Card>
          {/* 画布占位 */}
          <Card title="画布" size="small" style={{ height: '100%' }}>
            <div style={{ position:'relative', height:'100%', background:'#fff' }}>
              {canvasNodes.map((n,index) => (
                <div key={n.id}
                     onClick={() => setSelectedNode(n)}
                     style={{ position:'absolute', left:n.x, top:n.y, padding:'8px 12px', border:'1px solid rgba(0,0,0,0.15)', borderRadius:8, background:'#fff', boxShadow:'0 1px 3px rgba(0,0,0,0.08)', cursor:'pointer' }}>
                  <Typography.Text>{n.name}</Typography.Text>
                </div>
              ))}
              {canvasNodes.length===0 && <div style={{ color:'#8E8E93', position:'absolute', top:'45%', left:'50%', transform:'translate(-50%,-50%)' }}>点击左侧节点库添加到画布</div>}
            </div>
          </Card>
          {/* 属性抽屉 */}
          <Card title="属性" size="small" style={{ height: '100%', overflow:'auto' }}>
            {selectedNode ? (
              <Tabs
                items={[
                  { key:'1', label:'配置', children:(
                    <Form layout="vertical">
                      <Form.Item label="节点名称"><Input defaultValue={selectedNode.name} /></Form.Item>
                      <Form.Item label="类型"><Input disabled defaultValue={selectedNode.type} /></Form.Item>
                      <Form.Item label="参数（JSON）"><Input.TextArea rows={6} placeholder="{}" /></Form.Item>
                      <Button type="primary">保存</Button>
                    </Form>
                  )},
                  { key:'2', label:'调试', children:(
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Button>示例调用</Button>
                      <Card size="small">输出占位</Card>
                    </Space>
                  )}
                ]}
              />
            ) : <Typography.Text type="secondary">选择画布中的节点查看属性</Typography.Text>}
          </Card>
        </div>
      </Drawer>
    </main>
  )
}


