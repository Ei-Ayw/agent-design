/**
 * 文件作用：工作流页面，实现多智能体可视化、节点详情、人工介入/复盘功能
 */

"use client"

import React, { useEffect, useState } from 'react'
import { Table, Space, Button, Modal, Form, Input, Select, message, Drawer, Tabs, Timeline, Tag, Card, Descriptions, Progress, Badge, Tree, Alert, Divider } from 'antd'
import { PlusOutlined, PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined, EyeOutlined, EditOutlined, UserOutlined, RobotOutlined, CheckCircleOutlined, ExclamationCircleOutlined, ClockCircleOutlined, StopOutlined } from '@ant-design/icons'
import { PageLayout } from '../../components/ui/Layout'
import { Card as UICard, CardHeader, CardContent } from '../../components/ui/Card'
import { Title, Text, NumberDisplay } from '../../components/ui/Typography'
import { StatusIndicator } from '../../components/ui/Status'
import { formatNumber, formatTime } from '../../lib/utils'

const API = 'http://localhost:8000'

interface Workflow {
  id: string
  name: string
  description?: string
  status: 'active' | 'inactive' | 'error'
  version: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  runs_count?: number
  success_rate?: number
  avg_duration?: number
  last_run?: string
  created_at?: string
  created_by?: string
}

interface WorkflowNode {
  id: string
  type: 'llm' | 'tool' | 'condition' | 'loop' | 'merge' | 'wait' | 'human'
  name: string
  config: any
  position: { x: number; y: number }
  status?: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  result?: any
  error?: string
  start_time?: string
  end_time?: string
  duration?: number
}

interface WorkflowEdge {
  id: string
  source: string
  target: string
  condition?: string
  status?: 'active' | 'inactive'
}

interface WorkflowRun {
  id: string
  workflow_id: string
  status: 'running' | 'completed' | 'failed' | 'paused'
  progress: number
  current_node?: string
  start_time: string
  end_time?: string
  duration?: number
  input: any
  output?: any
  error?: string
  human_intervention_required?: boolean
  intervention_reason?: string
  nodes: WorkflowNode[]
}

interface HumanIntervention {
  id: string
  run_id: string
  node_id: string
  type: 'approval' | 'input' | 'decision'
  title: string
  description: string
  status: 'pending' | 'approved' | 'rejected'
  required_by: string
  created_at: string
  resolved_at?: string
  resolved_by?: string
  response?: any
}

export default function WorkflowsPage() {
  const [data, setData] = useState<Workflow[]>([])
  const [runs, setRuns] = useState<WorkflowRun[]>([])
  const [interventions, setInterventions] = useState<HumanIntervention[]>([])
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)
  const [selectedRun, setSelectedRun] = useState<WorkflowRun | null>(null)
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [runDrawerVisible, setRunDrawerVisible] = useState(false)
  const [designerDrawerVisible, setDesignerDrawerVisible] = useState(false)
  const [form] = Form.useForm()
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // 工作流编排相关数据
  const workflowStats = [
    {
      title: '工作流总数',
      value: formatNumber(data.length),
      change: { value: 12.3, type: 'increase' as const },
    },
    {
      title: '正在运行',
      value: formatNumber(runs.filter(r => r.status === 'running').length),
      change: { value: 8.7, type: 'increase' as const },
    },
    {
      title: '需要介入',
      value: formatNumber(interventions.filter(i => i.status === 'pending').length),
      change: { value: 3.2, type: 'decrease' as const },
    },
    {
      title: '平均执行时间',
      value: formatTime(3500),
      change: { value: 12.3, type: 'decrease' as const },
    }
  ]

  const nodeTypeData = [
    { name: 'LLM', count: data.reduce((sum, wf) => sum + wf.nodes.filter(n => n.type === 'llm').length, 0), color: 'var(--color-primary-500)' },
    { name: '工具', count: data.reduce((sum, wf) => sum + wf.nodes.filter(n => n.type === 'tool').length, 0), color: 'var(--color-semantic-success)' },
    { name: '条件', count: data.reduce((sum, wf) => sum + wf.nodes.filter(n => n.type === 'condition').length, 0), color: 'var(--color-semantic-warning)' },
    { name: '人工', count: data.reduce((sum, wf) => sum + wf.nodes.filter(n => n.type === 'human').length, 0), color: 'var(--color-semantic-error)' },
  ]

  useEffect(() => {
    fetchWorkflows()
    fetchRuns()
    fetchInterventions()
  }, [])

  const fetchWorkflows = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API}/workflows`)
      if (response.ok) {
        const workflows = await response.json()
        // 为每个工作流添加模拟数据
        const workflowsWithData = workflows.map((wf: any) => ({
          ...wf,
          version: '1.0.0',
          nodes: generateMockNodes(),
          edges: generateMockEdges(),
          runs_count: Math.floor(Math.random() * 100),
          success_rate: Math.floor(Math.random() * 20) + 80,
          avg_duration: Math.floor(Math.random() * 10000) + 5000,
          last_run: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          created_at: new Date(Date.now() - Math.random() * 2592000000).toISOString(),
          created_by: 'admin',
        }))
        setData(workflowsWithData)
      }
    } catch (error) {
      message.error('获取工作流列表失败')
    } finally {
      setLoading(false)
    }
  }

  const generateMockNodes = (): WorkflowNode[] => [
    {
      id: 'node-1',
      type: 'llm',
      name: '分析需求',
      config: { model: 'gpt-4', prompt: '分析用户需求' },
      position: { x: 100, y: 100 },
      status: 'completed',
      result: { analysis: '用户需要生成报告' },
      start_time: new Date(Date.now() - 300000).toISOString(),
      end_time: new Date(Date.now() - 240000).toISOString(),
      duration: 60000,
    },
    {
      id: 'node-2',
      type: 'tool',
      name: '数据收集',
      config: { tool_id: 'data-collector' },
      position: { x: 300, y: 100 },
      status: 'running',
      start_time: new Date(Date.now() - 180000).toISOString(),
    },
    {
      id: 'node-3',
      type: 'human',
      name: '人工审核',
      config: { approver: 'admin' },
      position: { x: 500, y: 100 },
      status: 'pending',
    },
    {
      id: 'node-4',
      type: 'llm',
      name: '生成报告',
      config: { model: 'gpt-4', prompt: '生成最终报告' },
      position: { x: 700, y: 100 },
      status: 'pending',
    },
  ]

  const generateMockEdges = (): WorkflowEdge[] => [
    { id: 'edge-1', source: 'node-1', target: 'node-2', status: 'active' },
    { id: 'edge-2', source: 'node-2', target: 'node-3', status: 'active' },
    { id: 'edge-3', source: 'node-3', target: 'node-4', status: 'active' },
  ]

  const fetchRuns = async () => {
    try {
      // 模拟运行数据
      const mockRuns: WorkflowRun[] = [
        {
          id: '1',
          workflow_id: 'wf-1',
          status: 'running',
          progress: 60,
          current_node: 'node-2',
          start_time: new Date(Date.now() - 300000).toISOString(),
          input: { task: '生成月度报告' },
          human_intervention_required: false,
          nodes: generateMockNodes(),
        },
        {
          id: '2',
          workflow_id: 'wf-2',
          status: 'paused',
          progress: 40,
          current_node: 'node-3',
          start_time: new Date(Date.now() - 600000).toISOString(),
          input: { task: '数据清理' },
          human_intervention_required: true,
          intervention_reason: '需要人工确认数据质量',
          nodes: generateMockNodes(),
        },
        {
          id: '3',
          workflow_id: 'wf-3',
          status: 'completed',
          progress: 100,
          start_time: new Date(Date.now() - 1800000).toISOString(),
          end_time: new Date(Date.now() - 1200000).toISOString(),
          duration: 600000,
          input: { task: '用户分析' },
          output: { result: '分析完成' },
          human_intervention_required: false,
          nodes: generateMockNodes(),
        },
      ]
      setRuns(mockRuns)
    } catch (error) {
      message.error('获取运行记录失败')
    }
  }

  const fetchInterventions = async () => {
    try {
      // 模拟人工介入数据
      const mockInterventions: HumanIntervention[] = [
        {
          id: '1',
          run_id: '2',
          node_id: 'node-3',
          type: 'approval',
          title: '数据质量确认',
          description: '请确认收集的数据质量是否符合要求',
          status: 'pending',
          required_by: 'admin',
          created_at: new Date(Date.now() - 300000).toISOString(),
        },
        {
          id: '2',
          run_id: '1',
          node_id: 'node-4',
          type: 'input',
          title: '报告模板选择',
          description: '请选择报告模板',
          status: 'approved',
          required_by: 'admin',
          created_at: new Date(Date.now() - 600000).toISOString(),
          resolved_at: new Date(Date.now() - 300000).toISOString(),
          resolved_by: 'admin',
          response: { template: 'standard' },
        },
      ]
      setInterventions(mockInterventions)
    } catch (error) {
      message.error('获取人工介入记录失败')
    }
  }

  const createWorkflow = async (values: any) => {
    try {
      const response = await fetch(`${API}/workflows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (response.ok) {
        message.success('工作流创建成功')
        setModalVisible(false)
        form.resetFields()
        fetchWorkflows()
      } else {
        message.error('工作流创建失败')
      }
    } catch (error) {
      message.error('工作流创建失败')
    }
  }

  const runWorkflow = async (workflowId: string, input: any) => {
    try {
      const response = await fetch(`${API}/workflows/${workflowId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      })
      if (response.ok) {
        message.success('工作流已启动')
        fetchRuns()
      } else {
        message.error('工作流启动失败')
      }
    } catch (error) {
      message.error('工作流启动失败')
    }
  }

  const pauseRun = async (runId: string) => {
    try {
      const response = await fetch(`${API}/workflows/runs/${runId}/pause`, {
        method: 'POST',
      })
      if (response.ok) {
        message.success('运行已暂停')
        fetchRuns()
      } else {
        message.error('暂停失败')
      }
    } catch (error) {
      message.error('暂停失败')
    }
  }

  const resumeRun = async (runId: string) => {
    try {
      const response = await fetch(`${API}/workflows/runs/${runId}/resume`, {
        method: 'POST',
      })
      if (response.ok) {
        message.success('运行已恢复')
        fetchRuns()
      } else {
        message.error('恢复失败')
      }
    } catch (error) {
      message.error('恢复失败')
    }
  }

  const resolveIntervention = async (interventionId: string, response: any) => {
    try {
      const response = await fetch(`${API}/workflows/interventions/${interventionId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response }),
      })
      if (response.ok) {
        message.success('介入已处理')
        fetchInterventions()
        fetchRuns()
      } else {
        message.error('处理失败')
      }
    } catch (error) {
      message.error('处理失败')
    }
  }

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'llm': return <RobotOutlined style={{ color: 'var(--color-primary-500)' }} />
      case 'tool': return <CheckCircleOutlined style={{ color: 'var(--color-semantic-success)' }} />
      case 'condition': return <ExclamationCircleOutlined style={{ color: 'var(--color-semantic-warning)' }} />
      case 'human': return <UserOutlined style={{ color: 'var(--color-semantic-error)' }} />
      default: return <ClockCircleOutlined />
    }
  }

  const getNodeTypeLabel = (type: string) => {
    switch (type) {
      case 'llm': return 'LLM 节点'
      case 'tool': return '工具节点'
      case 'condition': return '条件节点'
      case 'loop': return '循环节点'
      case 'merge': return '汇聚节点'
      case 'wait': return '等待节点'
      case 'human': return '人工节点'
      default: return type
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'processing'
      case 'completed': return 'success'
      case 'failed': return 'error'
      case 'paused': return 'warning'
      case 'pending': return 'default'
      default: return 'default'
    }
  }

  const getNodeStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'processing'
      case 'completed': return 'success'
      case 'failed': return 'error'
      case 'pending': return 'default'
      case 'skipped': return 'warning'
      default: return 'default'
    }
  }

  const filteredData = data.filter(workflow => 
    filterStatus === 'all' || workflow.status === filterStatus
  )

  const filteredRuns = runs.filter(run => 
    filterStatus === 'all' || run.status === filterStatus
  )

  return (
    <PageLayout>
      <div className="space-y-1 h-full flex flex-col">
        {/* 顶部区域：统计卡片 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-1 flex-shrink-0">
          {workflowStats.map((stat, index) => (
            <UICard key={index}>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Text size="sm" type="tertiary">{stat.title}</Text>
                    <div className="mt-1">
                      <NumberDisplay value={stat.value} size="lg" weight="bold" />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs ${stat.change.type === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
                      {stat.change.type === 'increase' ? '+' : '-'}{stat.change.value}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </UICard>
          ))}
        </div>

        {/* 中间区域：快速操作 + 状态概览 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-1 flex-shrink-0">
          <UICard>
            <CardHeader title="快速操作" />
            <CardContent>
              <div className="grid grid-cols-2 gap-1">
                <button 
                  className="p-1 border border-[var(--color-border-1)] rounded hover:bg-[var(--color-bg-2)] transition-colors"
                  onClick={() => setModalVisible(true)}
                >
                  <div className="text-center">
                    <div className="text-sm mb-1">⚡</div>
                    <Text size="sm" type="primary">创建工作流</Text>
                  </div>
                </button>
                <button className="p-1 border border-[var(--color-border-1)] rounded hover:bg-[var(--color-bg-2)] transition-colors">
                  <div className="text-center">
                    <div className="text-sm mb-1">🎨</div>
                    <Text size="sm" type="primary">可视化设计</Text>
                  </div>
                </button>
                <button className="p-1 border border-[var(--color-border-1)] rounded hover:bg-[var(--color-bg-2)] transition-colors">
                  <div className="text-center">
                    <div className="text-sm mb-1">▶️</div>
                    <Text size="sm" type="primary">执行工作流</Text>
                  </div>
                </button>
                <button className="p-1 border border-[var(--color-border-1)] rounded hover:bg-[var(--color-bg-2)] transition-colors">
                  <div className="text-center">
                    <div className="text-sm mb-1">🔄</div>
                    <Text size="sm" type="primary">复盘回放</Text>
                  </div>
                </button>
              </div>
            </CardContent>
          </UICard>

          <UICard>
            <CardHeader title="节点类型" />
            <CardContent>
              <div className="space-y-1">
                {nodeTypeData.map((type, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      {getNodeIcon(type.name.toLowerCase())}
                      <Text size="sm" type="secondary">{type.name}</Text>
                    </div>
                    <Text size="sm" type="primary">{type.count}</Text>
                  </div>
                ))}
              </div>
            </CardContent>
          </UICard>

          <UICard>
            <CardHeader title="运行状态" />
            <CardContent>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <StatusIndicator status="processing" />
                    <Text size="sm" type="secondary">运行中</Text>
                  </div>
                  <Text size="sm" type="primary">{runs.filter(r => r.status === 'running').length}</Text>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <StatusIndicator status="warning" />
                    <Text size="sm" type="secondary">已暂停</Text>
                  </div>
                  <Text size="sm" type="primary">{runs.filter(r => r.status === 'paused').length}</Text>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <StatusIndicator status="success" />
                    <Text size="sm" type="secondary">已完成</Text>
                  </div>
                  <Text size="sm" type="primary">{runs.filter(r => r.status === 'completed').length}</Text>
                </div>
              </div>
            </CardContent>
          </UICard>

          <UICard>
            <CardHeader title="需要介入" />
            <CardContent>
              <div className="space-y-1">
                {interventions.filter(i => i.status === 'pending').slice(0, 3).map((intervention, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <ExclamationCircleOutlined style={{ color: 'var(--color-semantic-warning)' }} />
                      <Text size="sm" type="primary">{intervention.title}</Text>
                    </div>
                    <Button size="small" type="link">处理</Button>
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
              title="工作流管理"
              action={
                <Space>
                  <Select
                    size="small"
                    value={filterStatus}
                    onChange={setFilterStatus}
                    options={[
                      { value: 'all', label: '全部状态' },
                      { value: 'active', label: '已发布' },
                      { value: 'inactive', label: '草稿' },
                      { value: 'error', label: '异常' }
                    ]}
                  />
                  <Button type="primary" size="small" onClick={() => setModalVisible(true)}>
                    <PlusOutlined /> 新建工作流
                  </Button>
                </Space>
              }
            />
            <CardContent>
              <div className="h-full overflow-y-auto">
                <Table
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
                        <StatusIndicator status={getStatusColor(status) as any} />
                      )
                    },
                    { title: '工作流名称', dataIndex: 'name', width: 120 },
                    { title: '版本', dataIndex: 'version', width: 80 },
                    { 
                      title: '节点数', 
                      dataIndex: 'nodes', 
                      width: 80,
                      render: (nodes: WorkflowNode[]) => nodes.length
                    },
                    { 
                      title: '运行次数', 
                      dataIndex: 'runs_count', 
                      width: 80,
                      render: (value: number) => formatNumber(value || 0)
                    },
                    { 
                      title: '成功率', 
                      dataIndex: 'success_rate', 
                      width: 80,
                      render: (value: number) => `${value || 0}%`
                    },
                    { 
                      title: '平均耗时', 
                      dataIndex: 'avg_duration', 
                      width: 80,
                      render: (value: number) => formatTime(value || 0)
                    },
                    { 
                      title: '最后运行', 
                      dataIndex: 'last_run', 
                      width: 120,
                      render: (value: string) => new Date(value).toLocaleDateString()
                    },
                    { 
                      title: '操作', 
                      width: 200,
                      render: (_, record: Workflow) => (
                        <Space size="small">
                          <Button 
                            size="small" 
                            icon={<EyeOutlined />}
                            onClick={() => {
                              setSelectedWorkflow(record)
                              setRunDrawerVisible(true)
                            }}
                          >
                            详情
                          </Button>
                          <Button 
                            size="small" 
                            icon={<PlayCircleOutlined />}
                            onClick={() => runWorkflow(record.id, {})}
                          >
                            运行
                          </Button>
                          <Button 
                            size="small" 
                            icon={<EditOutlined />}
                            onClick={() => {
                              setSelectedWorkflow(record)
                              setDesignerDrawerVisible(true)
                            }}
                          >
                            设计
                          </Button>
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

      {/* 创建工作流模态框 */}
      <Modal
        title="创建工作流"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={createWorkflow} layout="vertical">
          <Form.Item name="name" label="工作流名称" rules={[{ required: true }]}>
            <Input placeholder="请输入工作流名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="请输入工作流描述" />
          </Form.Item>
          <Form.Item name="category" label="分类">
            <Select placeholder="请选择分类">
              <Select.Option value="automation">自动化</Select.Option>
              <Select.Option value="analysis">分析</Select.Option>
              <Select.Option value="generation">生成</Select.Option>
              <Select.Option value="processing">处理</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 工作流详情抽屉 */}
      <Drawer
        title="工作流详情"
        width={800}
        open={runDrawerVisible}
        onClose={() => setRunDrawerVisible(false)}
      >
        {selectedWorkflow && (
          <div className="space-y-4">
            <Card>
              <Descriptions column={2} size="small">
                <Descriptions.Item label="工作流名称">{selectedWorkflow.name}</Descriptions.Item>
                <Descriptions.Item label="状态">
                  <StatusIndicator status={getStatusColor(selectedWorkflow.status) as any} />
                </Descriptions.Item>
                <Descriptions.Item label="版本">{selectedWorkflow.version}</Descriptions.Item>
                <Descriptions.Item label="创建者">{selectedWorkflow.created_by}</Descriptions.Item>
                <Descriptions.Item label="运行次数">{formatNumber(selectedWorkflow.runs_count || 0)}</Descriptions.Item>
                <Descriptions.Item label="成功率">{selectedWorkflow.success_rate}%</Descriptions.Item>
                <Descriptions.Item label="平均耗时">{formatTime(selectedWorkflow.avg_duration || 0)}</Descriptions.Item>
                <Descriptions.Item label="最后运行">
                  {selectedWorkflow.last_run ? new Date(selectedWorkflow.last_run).toLocaleString() : '从未运行'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Tabs defaultActiveKey="nodes">
              <Tabs.TabPane tab="节点详情" key="nodes">
                <div className="space-y-2">
                  {selectedWorkflow.nodes.map(node => (
                    <Card key={node.id} size="small">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getNodeIcon(node.type)}
                          <div>
                            <Text type="primary">{node.name}</Text>
                            <div className="text-xs text-gray-500">{getNodeTypeLabel(node.type)}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Tag color={getNodeStatusColor(node.status || 'pending')}>
                            {node.status || 'pending'}
                          </Tag>
                          {node.duration && (
                            <Text size="sm" type="tertiary">{formatTime(node.duration)}</Text>
                          )}
                        </div>
                      </div>
                      {node.result && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                          <Text type="tertiary">结果:</Text>
                          <pre className="mt-1">{JSON.stringify(node.result, null, 2)}</pre>
                        </div>
                      )}
                      {node.error && (
                        <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-600">
                          <Text type="danger">错误:</Text>
                          <div className="mt-1">{node.error}</div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </Tabs.TabPane>

              <Tabs.TabPane tab="运行记录" key="runs">
                <div className="space-y-2">
                  {runs.filter(run => run.workflow_id === selectedWorkflow.id).map(run => (
                    <Card key={run.id} size="small">
                      <div className="flex items-center justify-between">
                        <div>
                          <Text type="primary">运行 #{run.id}</Text>
                          <div className="text-xs text-gray-500">
                            {new Date(run.start_time).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge status={getStatusColor(run.status) as any} text={run.status} />
                          <Progress percent={run.progress} size="small" />
                        </div>
                      </div>
                      {run.human_intervention_required && (
                        <Alert
                          message="需要人工介入"
                          description={run.intervention_reason}
                          type="warning"
                          showIcon
                          className="mt-2"
                        />
                      )}
                    </Card>
                  ))}
                </div>
              </Tabs.TabPane>

              <Tabs.TabPane tab="人工介入" key="interventions">
                <div className="space-y-2">
                  {interventions.filter(i => runs.find(r => r.id === i.run_id)?.workflow_id === selectedWorkflow.id).map(intervention => (
                    <Card key={intervention.id} size="small">
                      <div className="flex items-center justify-between">
                        <div>
                          <Text type="primary">{intervention.title}</Text>
                          <div className="text-xs text-gray-500">{intervention.description}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Tag color={intervention.status === 'pending' ? 'orange' : intervention.status === 'approved' ? 'green' : 'red'}>
                            {intervention.status}
                          </Tag>
                          {intervention.status === 'pending' && (
                            <Space>
                              <Button size="small" type="primary">批准</Button>
                              <Button size="small" danger>拒绝</Button>
                            </Space>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Tabs.TabPane>
            </Tabs>
          </div>
        )}
      </Drawer>

      {/* 可视化设计器抽屉 */}
      <Drawer
        title="工作流设计器"
        width={1200}
        open={designerDrawerVisible}
        onClose={() => setDesignerDrawerVisible(false)}
      >
        {selectedWorkflow && (
          <div className="h-full">
            <Alert
              message="可视化设计器"
              description="拖拽节点来设计工作流，支持 LLM、工具、条件、人工介入等节点类型"
              type="info"
              showIcon
              className="mb-4"
            />
            <div className="h-96 bg-gray-50 rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-2xl mb-2">🎨</div>
                <div>可视化设计器界面</div>
                <div className="text-sm">支持拖拽、连线、配置节点参数</div>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </PageLayout>
  )
}