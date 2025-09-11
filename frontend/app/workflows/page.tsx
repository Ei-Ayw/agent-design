/**
 * 文件作用：工作流编排器（画布/节点库/属性抽屉/运行回放占位），对接后端 /workflows 与 /workflows/{id}/runs。
 */

"use client"

import React, { useEffect, useState } from 'react'
import { Table, Button, Form, Input, Space, message, Card, Modal, Drawer, List, Typography, Tabs, Select } from 'antd'
import { PageLayout } from '../../components/ui/Layout'
import { Card as UICard, CardHeader, CardContent } from '../../components/ui/Card'
import { Title, Text, NumberDisplay } from '../../components/ui/Typography'
import { StatusIndicator } from '../../components/ui/Status'
import { StatChart, AreaChartComponent, LineChartComponent } from '../../components/ui/Charts'
import { formatNumber, formatTime } from '../../lib/utils'

type Workflow = { 
  id: string
  name?: string
  nodes?: any[]
  status?: 'active' | 'inactive' | 'error'
  runs_count?: number
  success_rate?: number
  avg_duration?: number
  last_run?: string
}
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
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // 模拟数据
  const workflowStats = [
    {
      title: '总工作流数',
      value: formatNumber(data.length),
      change: { value: 12.3, type: 'increase' as const },
    },
    {
      title: '活跃工作流',
      value: formatNumber(data.filter(w => w.status === 'active').length),
      change: { value: 8.7, type: 'increase' as const },
    },
    {
      title: '总运行次数',
      value: formatNumber(data.reduce((sum, wf) => sum + (wf.runs_count || 0), 0)),
      change: { value: 22.1, type: 'increase' as const },
    },
    {
      title: '平均成功率',
      value: '94.2%',
      change: { value: 3.5, type: 'increase' as const },
    }
  ]

  const executionTrendData = [
    { name: '00:00', executions: 8, success: 7, errors: 1 },
    { name: '04:00', executions: 3, success: 3, errors: 0 },
    { name: '08:00', executions: 15, success: 14, errors: 1 },
    { name: '12:00', executions: 22, success: 21, errors: 1 },
    { name: '16:00', executions: 18, success: 17, errors: 1 },
    { name: '20:00', executions: 12, success: 11, errors: 1 },
  ]

  const nodeTypeData = [
    { name: 'LLM', count: 15, usage: 40 },
    { name: '工具', count: 12, usage: 30 },
    { name: '条件', count: 8, usage: 15 },
    { name: '循环', count: 5, usage: 10 },
    { name: '审批', count: 3, usage: 5 },
  ]

  const fetchWF = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/workflows`)
      const json = await res.json()
      // 添加模拟数据
      const workflowsWithMockData = json.map((wf: Workflow, index: number) => ({
        ...wf,
        status: ['active', 'active', 'inactive', 'error'][index % 4] as any,
        runs_count: Math.floor(Math.random() * 200) + 20,
        success_rate: Math.floor(Math.random() * 10) + 90,
        avg_duration: Math.floor(Math.random() * 5000) + 1000,
        last_run: new Date(Date.now() - Math.random() * 86400000).toISOString()
      }))
      setData(workflowsWithMockData)
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

  const filteredData = data.filter(wf => 
    filterStatus === 'all' || wf.status === filterStatus
  )

  return (
    <PageLayout>
      <div className="space-y-1 h-full flex flex-col">
        {/* 顶部区域：统计卡片 + 图表 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-1 flex-shrink-0">
          {/* 左侧：统计卡片 */}
          <div className="lg:col-span-1">
            <UICard className="h-full">
              <CardHeader title="关键指标" />
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {workflowStats.map((stat, index) => (
                    <div key={index} className="p-2 border border-[var(--color-border-1)] rounded">
                      <div className="text-center">
                        <Text size="sm" type="tertiary" className="block mb-1">
                          {stat.title}
                        </Text>
                        <div className="flex items-center justify-center space-x-1">
                          <Text size="lg" type="primary" weight="bold">
                            {stat.value}
                          </Text>
                          {stat.change && (
                            <>
                              <span style={{ 
                                color: stat.change.type === 'increase' ? 'var(--color-semantic-success)' : 
                                       stat.change.type === 'decrease' ? 'var(--color-semantic-error)' : 
                                       'var(--color-text-3)' 
                              }}>
                                {stat.change.type === 'increase' ? '↗' : 
                                 stat.change.type === 'decrease' ? '↘' : '→'}
                              </span>
                              <span style={{ 
                                color: stat.change.type === 'increase' ? 'var(--color-semantic-success)' : 
                                       stat.change.type === 'decrease' ? 'var(--color-semantic-error)' : 
                                       'var(--color-text-3)',
                                fontSize: '14px'
                              }}>
                                {Math.abs(stat.change.value)}%
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </UICard>
          </div>

          {/* 右侧：图表区域 */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
              <UICard>
                <CardHeader
                  title="执行趋势"
                  action={
                    <Select
                      size="small"
                      value={timeRange}
                      onChange={v => setTimeRange(v)}
                      options={[
                        { value: '1h', label: '1小时' },
                        { value: '24h', label: '24小时' },
                        { value: '7d', label: '7天' }
                      ]}
                    />
                  }
                />
                <CardContent>
                  <AreaChartComponent
                    data={executionTrendData}
                    height={160}
                    areas={[
                      { dataKey: 'executions', name: '总执行', color: 'var(--color-primary-500)', fillOpacity: 0.1 },
                      { dataKey: 'success', name: '成功执行', color: 'var(--color-semantic-success)', fillOpacity: 0.1 },
                    ]}
                  />
                </CardContent>
              </UICard>

              <UICard>
                <CardHeader title="节点类型分布" />
                <CardContent>
                  <div className="space-y-2">
                    {nodeTypeData.map((type, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full" style={{
                            backgroundColor: ['var(--color-primary-500)', 'var(--color-semantic-success)', 'var(--color-semantic-warning)', 'var(--color-semantic-error)', 'var(--color-primary-600)'][index]
                          }}></div>
                          <Text size="sm" type="primary">{type.name}</Text>
                        </div>
                        <div className="text-right">
                          <Text size="sm" type="primary" weight="semibold">{type.count}</Text>
                          <Text size="sm" type="tertiary" className="block">{type.usage}%</Text>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </UICard>
            </div>
          </div>
        </div>

        {/* 中间区域：快速操作 + 状态概览 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-1 flex-shrink-0">
          <UICard>
            <CardHeader title="快速操作" />
            <CardContent>
              <div className="grid grid-cols-2 gap-1">
                <button className="p-1 border border-[var(--color-border-1)] rounded hover:bg-[var(--color-bg-2)] transition-colors">
                  <div className="text-center">
                    <div className="text-sm mb-1">⚡</div>
                    <Text size="sm" type="primary">创建工作流</Text>
                  </div>
                </button>
                <button className="p-1 border border-[var(--color-border-1)] rounded hover:bg-[var(--color-bg-2)] transition-colors">
                  <div className="text-center">
                    <div className="text-sm mb-1">🎨</div>
                    <Text size="sm" type="primary">可视化编排</Text>
                  </div>
                </button>
                <button className="p-1 border border-[var(--color-border-1)] rounded hover:bg-[var(--color-bg-2)] transition-colors">
                  <div className="text-center">
                    <div className="text-sm mb-1">▶️</div>
                    <Text size="sm" type="primary">批量运行</Text>
                  </div>
                </button>
                <button className="p-1 border border-[var(--color-border-1)] rounded hover:bg-[var(--color-bg-2)] transition-colors">
                  <div className="text-center">
                    <div className="text-sm mb-1">📊</div>
                    <Text size="sm" type="primary">执行分析</Text>
                  </div>
                </button>
              </div>
            </CardContent>
          </UICard>

          <UICard>
            <CardHeader title="状态分布" />
            <CardContent>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <StatusIndicator status="success" />
                    <Text size="sm" type="secondary">活跃</Text>
                  </div>
                  <Text size="sm" type="primary">{data.filter(wf => wf.status === 'active').length}</Text>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <StatusIndicator status="warning" />
                    <Text size="sm" type="secondary">非活跃</Text>
                  </div>
                  <Text size="sm" type="primary">{data.filter(wf => wf.status === 'inactive').length}</Text>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <StatusIndicator status="error" />
                    <Text size="sm" type="secondary">错误</Text>
                  </div>
                  <Text size="sm" type="primary">{data.filter(wf => wf.status === 'error').length}</Text>
                </div>
              </div>
            </CardContent>
          </UICard>

          <UICard>
            <CardHeader title="节点统计" />
            <CardContent>
              <div className="space-y-1">
                {nodeTypeData.map((type, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <Text size="sm" type="secondary">{type.name}</Text>
                    <div className="flex items-center space-x-1">
                      <div className="w-8 h-1.5 bg-[var(--color-bg-3)] rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full" 
                          style={{ 
                            width: `${type.usage}%`,
                            backgroundColor: ['var(--color-primary-500)', 'var(--color-semantic-success)', 'var(--color-semantic-warning)', 'var(--color-semantic-error)', 'var(--color-primary-600)'][index]
                          }}
                        ></div>
                      </div>
                      <Text size="sm" type="primary">{type.count}</Text>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </UICard>

          <UICard>
            <CardHeader title="最近执行" />
            <CardContent>
              <div className="space-y-1">
                {data.slice(0, 5).map((wf, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <StatusIndicator status={wf.status === 'active' ? 'success' : wf.status === 'inactive' ? 'warning' : 'error'} />
                      <Text size="sm" type="primary">{wf.name || wf.id}</Text>
                    </div>
                    <Text size="sm" type="tertiary">{wf.runs_count || 0} 次</Text>
                  </div>
                ))}
              </div>
            </CardContent>
          </UICard>
        </div>

        {/* 底部区域：工作流列表 */}
        <div className="flex-1 min-h-0">
          <UICard className="h-full">
            <CardHeader 
              title="工作流列表"
              action={
                <div className="flex items-center space-x-2">
                  <Select
                    size="small"
                    value={filterStatus}
                    onChange={setFilterStatus}
                    options={[
                      { value: 'all', label: '全部' },
                      { value: 'active', label: '活跃' },
                      { value: 'inactive', label: '非活跃' },
                      { value: 'error', label: '错误' }
                    ]}
                  />
                  <Button type="primary" size="small">创建工作流</Button>
                </div>
              }
            />
            <CardContent className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 min-h-0">
                <Table 
                  rowKey="id" 
                  loading={loading} 
                  dataSource={filteredData} 
                  pagination={false}
                  scroll={{ y: 200 }}
                  size="small"
                  columns={[
                    { 
                      title: '状态', 
                      dataIndex: 'status', 
                      width: 60,
                      render: (status: string) => (
                        <StatusIndicator 
                          status={status === 'active' ? 'success' : status === 'inactive' ? 'warning' : 'error'}
                        />
                      )
                    },
                    { title: '名称', dataIndex: 'name', width: 120, render: (name: string, record: Workflow) => name || record.id },
                    { 
                      title: '运行次数', 
                      dataIndex: 'runs_count', 
                      width: 80,
                      render: (value: number) => formatNumber(value)
                    },
                    { 
                      title: '成功率', 
                      dataIndex: 'success_rate', 
                      width: 80,
                      render: (value: number) => `${value}%`
                    },
                    { 
                      title: '平均耗时', 
                      dataIndex: 'avg_duration', 
                      width: 80,
                      render: (value: number) => formatTime(value)
                    },
                    { 
                      title: '最后运行', 
                      dataIndex: 'last_run', 
                      width: 100,
                      render: (value: string) => new Date(value).toLocaleDateString()
                    },
                    { 
                      title: '操作', 
                      width: 150,
                      render: (_, record: Workflow) => (
                        <Space size="small">
                          <Button size="small" onClick={() => run(record.id)}>运行</Button>
                          <Button size="small" onClick={() => showRuns(record.id)}>历史</Button>
                          <Button size="small" onClick={() => openDesigner(record)}>编排</Button>
                        </Space>
                      )
                    }
                  ]}
                />
              </div>
            </CardContent>
          </UICard>
        </div>
      </div>

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
    </PageLayout>
  )
}


