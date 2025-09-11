/**
 * 文件作用：多智能体协作页面，实现多智能体可视化、节点详情、人工介入/复盘功能
 */

"use client"

import React, { useEffect, useState } from 'react'
import { Table, Space, Button, Modal, Form, Input, Select, message, Drawer, Tabs, Timeline, Tag, Card, Descriptions, Progress, Badge } from 'antd'
import { PlusOutlined, PlayCircleOutlined, EyeOutlined, EditOutlined, UserOutlined, RobotOutlined, CheckCircleOutlined, ExclamationCircleOutlined, PauseCircleOutlined, ReloadOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { PageLayout } from '../../components/ui/Layout'
import { Card as UICard, CardHeader, CardContent } from '../../components/ui/Card'
import { Title, Text, NumberDisplay } from '../../components/ui/Typography'
import { StatusIndicator } from '../../components/ui/Status'
import { formatNumber, formatTime } from '../../lib/utils'

const API = 'http://localhost:8000'

interface Agent {
  id: string
  name?: string
  model: string
  status: 'active' | 'inactive' | 'error'
  role: 'planner' | 'worker' | 'critic' | 'memory'
  tools_count?: number
  today_calls?: number
  success_rate?: number
  avg_latency?: number
  last_run?: string
  created_at?: string
}

interface CollaborationSession {
  id: string
  title: string
  agents: Agent[]
  status: 'running' | 'completed' | 'failed' | 'paused'
  current_step: number
  total_steps: number
  progress: number
  created_at: string
  updated_at: string
  human_intervention_required?: boolean
}

interface AgentNode {
  id: string
  agent_id: string
  agent_name: string
  role: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  input: any
  output: any
  error?: string
  start_time: string
  end_time?: string
  duration?: number
}

export default function AgentsPage() {
  const [data, setData] = useState<Agent[]>([])
  const [sessions, setSessions] = useState<CollaborationSession[]>([])
  const [selectedSession, setSelectedSession] = useState<CollaborationSession | null>(null)
  const [sessionNodes, setSessionNodes] = useState<AgentNode[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [sessionDrawerVisible, setSessionDrawerVisible] = useState(false)
  const [form] = Form.useForm()
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // 多智能体协作相关数据
  const collaborationStats = [
    {
      title: '活跃会话',
      value: formatNumber(sessions.filter(s => s.status === 'running').length),
      change: { value: 15.2, type: 'increase' as const },
    },
    {
      title: '今日完成',
      value: formatNumber(sessions.filter(s => s.status === 'completed').length),
      change: { value: 8.7, type: 'increase' as const },
    },
    {
      title: '需要人工介入',
      value: formatNumber(sessions.filter(s => s.human_intervention_required).length),
      change: { value: 3.2, type: 'decrease' as const },
    },
    {
      title: '平均完成时间',
      value: formatTime(3500),
      change: { value: 12.3, type: 'decrease' as const },
    }
  ]

  const agentRoleData = [
    { name: 'Planner', count: data.filter(a => a.role === 'planner').length, color: 'var(--color-primary-500)' },
    { name: 'Worker', count: data.filter(a => a.role === 'worker').length, color: 'var(--color-semantic-success)' },
    { name: 'Critic', count: data.filter(a => a.role === 'critic').length, color: 'var(--color-semantic-warning)' },
    { name: 'Memory', count: data.filter(a => a.role === 'memory').length, color: 'var(--color-semantic-error)' },
  ]

  useEffect(() => {
    fetchAgents()
    fetchSessions()
  }, [])

  const fetchAgents = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API}/agents`)
      if (response.ok) {
        const agents = await response.json()
        // 为每个 agent 添加角色和模拟数据
        const agentsWithRoles = agents.map((agent: any) => ({
          ...agent,
          role: ['planner', 'worker', 'critic', 'memory'][Math.floor(Math.random() * 4)],
          tools_count: Math.floor(Math.random() * 10) + 1,
          today_calls: Math.floor(Math.random() * 100),
          success_rate: Math.floor(Math.random() * 20) + 80,
          avg_latency: Math.floor(Math.random() * 2000) + 500,
          last_run: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          created_at: new Date(Date.now() - Math.random() * 2592000000).toISOString(),
        }))
        setData(agentsWithRoles)
      }
    } catch (error) {
      message.error('获取 Agent 列表失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchSessions = async () => {
    try {
      // 模拟协作会话数据
      const mockSessions: CollaborationSession[] = [
        {
          id: '1',
          title: '数据分析任务',
          agents: data.slice(0, 3),
          status: 'running',
          current_step: 3,
          total_steps: 5,
          progress: 60,
          created_at: new Date(Date.now() - 1800000).toISOString(),
          updated_at: new Date().toISOString(),
          human_intervention_required: false,
        },
        {
          id: '2',
          title: '文档生成任务',
          agents: data.slice(1, 4),
          status: 'paused',
          current_step: 2,
          total_steps: 4,
          progress: 50,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          updated_at: new Date(Date.now() - 300000).toISOString(),
          human_intervention_required: true,
        },
        {
          id: '3',
          title: '代码审查任务',
          agents: data.slice(2, 5),
          status: 'completed',
          current_step: 4,
          total_steps: 4,
          progress: 100,
          created_at: new Date(Date.now() - 7200000).toISOString(),
          updated_at: new Date(Date.now() - 1800000).toISOString(),
          human_intervention_required: false,
        },
      ]
      setSessions(mockSessions)
    } catch (error) {
      message.error('获取协作会话失败')
    }
  }

  const fetchSessionNodes = async (sessionId: string) => {
    try {
      // 模拟节点数据
      const mockNodes: AgentNode[] = [
        {
          id: '1',
          agent_id: 'agent-1',
          agent_name: 'Planner Agent',
          role: 'planner',
          status: 'completed',
          input: { task: '分析用户需求' },
          output: { plan: '分三步执行：数据收集、分析、报告生成' },
          start_time: new Date(Date.now() - 1800000).toISOString(),
          end_time: new Date(Date.now() - 1500000).toISOString(),
          duration: 300,
        },
        {
          id: '2',
          agent_id: 'agent-2',
          agent_name: 'Worker Agent',
          role: 'worker',
          status: 'running',
          input: { plan: '执行数据收集' },
          output: null,
          start_time: new Date(Date.now() - 1200000).toISOString(),
        },
        {
          id: '3',
          agent_id: 'agent-3',
          agent_name: 'Critic Agent',
          role: 'critic',
          status: 'pending',
          input: null,
          output: null,
          start_time: '',
        },
      ]
      setSessionNodes(mockNodes)
    } catch (error) {
      message.error('获取节点详情失败')
    }
  }

  const createAgent = async (values: any) => {
    try {
      const response = await fetch(`${API}/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (response.ok) {
        message.success('Agent 创建成功')
        setModalVisible(false)
        form.resetFields()
        fetchAgents()
      } else {
        message.error('Agent 创建失败')
      }
    } catch (error) {
      message.error('Agent 创建失败')
    }
  }

  const startCollaboration = async (agentIds: string[]) => {
    try {
      const response = await fetch(`${API}/collaboration/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_ids: agentIds }),
      })
      if (response.ok) {
        message.success('协作会话已启动')
        fetchSessions()
      } else {
        message.error('启动协作失败')
      }
    } catch (error) {
      message.error('启动协作失败')
    }
  }

  const pauseSession = async (sessionId: string) => {
    try {
      const response = await fetch(`${API}/collaboration/${sessionId}/pause`, {
        method: 'POST',
      })
      if (response.ok) {
        message.success('会话已暂停')
        fetchSessions()
      } else {
        message.error('暂停会话失败')
      }
    } catch (error) {
      message.error('暂停会话失败')
    }
  }

  const resumeSession = async (sessionId: string) => {
    try {
      const response = await fetch(`${API}/collaboration/${sessionId}/resume`, {
        method: 'POST',
      })
      if (response.ok) {
        message.success('会话已恢复')
        fetchSessions()
      } else {
        message.error('恢复会话失败')
      }
    } catch (error) {
      message.error('恢复会话失败')
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'planner': return <RobotOutlined style={{ color: 'var(--color-primary-500)' }} />
      case 'worker': return <UserOutlined style={{ color: 'var(--color-semantic-success)' }} />
      case 'critic': return <ExclamationCircleOutlined style={{ color: 'var(--color-semantic-warning)' }} />
      case 'memory': return <CheckCircleOutlined style={{ color: 'var(--color-semantic-error)' }} />
      default: return <RobotOutlined />
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'planner': return '规划者'
      case 'worker': return '执行者'
      case 'critic': return '评审者'
      case 'memory': return '记忆者'
      default: return role
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'processing'
      case 'completed': return 'success'
      case 'failed': return 'error'
      case 'paused': return 'warning'
      default: return 'default'
    }
  }

  const filteredData = data.filter(agent => 
    filterStatus === 'all' || agent.status === filterStatus
  )

  const filteredSessions = sessions.filter(session => 
    filterStatus === 'all' || session.status === filterStatus
  )

  return (
    <PageLayout>
      <div className="space-y-1 h-full flex flex-col">
        {/* 顶部区域：统计卡片 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-1 flex-shrink-0">
          {collaborationStats.map((stat, index) => (
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
                    <div className="text-sm mb-1">🤖</div>
                    <Text size="sm" type="primary">创建 Agent</Text>
                  </div>
                </button>
                <button className="p-1 border border-[var(--color-border-1)] rounded hover:bg-[var(--color-bg-2)] transition-colors">
                  <div className="text-center">
                    <div className="text-sm mb-1">👥</div>
                    <Text size="sm" type="primary">启动协作</Text>
                  </div>
                </button>
                <button className="p-1 border border-[var(--color-border-1)] rounded hover:bg-[var(--color-bg-2)] transition-colors">
                  <div className="text-center">
                    <div className="text-sm mb-1">📊</div>
                    <Text size="sm" type="primary">协作分析</Text>
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
            <CardHeader title="Agent 角色分布" />
            <CardContent>
              <div className="space-y-1">
                {agentRoleData.map((role, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      {getRoleIcon(role.name.toLowerCase())}
                      <Text size="sm" type="secondary">{getRoleLabel(role.name.toLowerCase())}</Text>
                    </div>
                    <Text size="sm" type="primary">{role.count}</Text>
                  </div>
                ))}
              </div>
            </CardContent>
          </UICard>

          <UICard>
            <CardHeader title="活跃会话" />
            <CardContent>
              <div className="space-y-1">
                {sessions.slice(0, 3).map((session, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Badge status={getStatusColor(session.status) as any} />
                      <Text size="sm" type="primary">{session.title}</Text>
                    </div>
                    <Text size="sm" type="tertiary">{session.progress}%</Text>
                  </div>
                ))}
              </div>
            </CardContent>
          </UICard>

          <UICard>
            <CardHeader title="需要介入" />
            <CardContent>
              <div className="space-y-1">
                {sessions.filter(s => s.human_intervention_required).slice(0, 3).map((session, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <ExclamationCircleOutlined style={{ color: 'var(--color-semantic-warning)' }} />
                      <Text size="sm" type="primary">{session.title}</Text>
                    </div>
                    <Button size="small" type="link">介入</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </UICard>
        </div>

        {/* 底部区域：协作会话列表 */}
        <div className="flex-1 min-h-0">
          <UICard className="h-full">
            <CardHeader
              title="协作会话"
              action={
                <Space>
                  <Select
                    size="small"
                    value={filterStatus}
                    onChange={setFilterStatus}
                    options={[
                      { value: 'all', label: '全部状态' },
                      { value: 'running', label: '运行中' },
                      { value: 'completed', label: '已完成' },
                      { value: 'paused', label: '已暂停' },
                      { value: 'failed', label: '失败' }
                    ]}
                  />
                  <Button type="primary" size="small" onClick={() => setModalVisible(true)}>
                    <PlusOutlined /> 新建会话
                  </Button>
                </Space>
              }
            />
            <CardContent>
              <div className="h-full overflow-y-auto">
                <Table
                  loading={loading}
                  dataSource={filteredSessions}
                  pagination={false}
                  scroll={{ y: 200 }}
                  size="small"
                  columns={[
                    { 
                      title: '状态', 
                      dataIndex: 'status', 
                      width: 80,
                      render: (status: string) => (
                        <Badge status={getStatusColor(status) as any} text={status} />
                      )
                    },
                    { title: '会话标题', dataIndex: 'title', width: 150 },
                    { 
                      title: '参与 Agent', 
                      dataIndex: 'agents', 
                      width: 120,
                      render: (agents: Agent[]) => (
                        <Space size="small">
                          {agents.slice(0, 2).map(agent => (
                            <Tag key={agent.id} color="blue">{getRoleLabel(agent.role)}</Tag>
                          ))}
                          {agents.length > 2 && <Tag>+{agents.length - 2}</Tag>}
                        </Space>
                      )
                    },
                    { 
                      title: '进度', 
                      dataIndex: 'progress', 
                      width: 100,
                      render: (progress: number) => (
                        <Progress percent={progress} size="small" />
                      )
                    },
                    { 
                      title: '创建时间', 
                      dataIndex: 'created_at', 
                      width: 120,
                      render: (value: string) => new Date(value).toLocaleString()
                    },
                    { 
                      title: '操作', 
                      width: 150,
                      render: (_, record: CollaborationSession) => (
                        <Space size="small">
                          <Button 
                            size="small" 
                            icon={<EyeOutlined />}
                            onClick={() => {
                              setSelectedSession(record)
                              fetchSessionNodes(record.id)
                              setSessionDrawerVisible(true)
                            }}
                          >
                            详情
                          </Button>
                          {record.status === 'running' ? (
                            <Button 
                              size="small" 
                              icon={<PauseCircleOutlined />}
                              onClick={() => pauseSession(record.id)}
                            >
                              暂停
                            </Button>
                          ) : record.status === 'paused' ? (
                            <Button 
                              size="small" 
                              icon={<ReloadOutlined />}
                              onClick={() => resumeSession(record.id)}
                            >
                              恢复
                            </Button>
                          ) : null}
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

      {/* 创建 Agent 模态框 */}
      <Modal
        title="创建 Agent"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={createAgent} layout="vertical">
          <Form.Item name="name" label="Agent 名称" rules={[{ required: true }]}>
            <Input placeholder="请输入 Agent 名称" />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true }]}>
            <Select placeholder="请选择角色">
              <Select.Option value="planner">规划者</Select.Option>
              <Select.Option value="worker">执行者</Select.Option>
              <Select.Option value="critic">评审者</Select.Option>
              <Select.Option value="memory">记忆者</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="model" label="模型" rules={[{ required: true }]}>
            <Select placeholder="请选择模型">
              <Select.Option value="gpt-4">GPT-4</Select.Option>
              <Select.Option value="gpt-3.5-turbo">GPT-3.5 Turbo</Select.Option>
              <Select.Option value="claude-3">Claude 3</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="system_prompt" label="系统提示词">
            <Input.TextArea rows={4} placeholder="请输入系统提示词" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 会话详情抽屉 */}
      <Drawer
        title="协作会话详情"
        width={800}
        open={sessionDrawerVisible}
        onClose={() => setSessionDrawerVisible(false)}
      >
        {selectedSession && (
          <div className="space-y-4">
            <Card>
              <Descriptions column={2} size="small">
                <Descriptions.Item label="会话标题">{selectedSession.title}</Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Badge status={getStatusColor(selectedSession.status) as any} text={selectedSession.status} />
                </Descriptions.Item>
                <Descriptions.Item label="进度">
                  <Progress percent={selectedSession.progress} />
                </Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {new Date(selectedSession.created_at).toLocaleString()}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="参与 Agent">
              <div className="grid grid-cols-2 gap-2">
                {selectedSession.agents.map(agent => (
                  <div key={agent.id} className="flex items-center space-x-2 p-2 border rounded">
                    {getRoleIcon(agent.role)}
                    <div>
                      <Text size="sm" type="primary">{agent.name || agent.id}</Text>
                      <Text size="xs" type="tertiary">{getRoleLabel(agent.role)}</Text>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="执行流程">
              <Timeline>
                {sessionNodes.map(node => (
                  <Timeline.Item
                    key={node.id}
                    color={node.status === 'completed' ? 'green' : node.status === 'running' ? 'blue' : node.status === 'failed' ? 'red' : 'gray'}
                    dot={getRoleIcon(node.role)}
                  >
                    <div>
                      <Text size="sm" type="primary">{node.agent_name}</Text>
                      <div className="mt-1">
                        <Tag color={node.status === 'completed' ? 'green' : node.status === 'running' ? 'blue' : node.status === 'failed' ? 'red' : 'default'}>
                          {node.status}
                        </Tag>
                      </div>
                      {node.output && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                          <Text type="tertiary">输出:</Text>
                          <pre className="mt-1">{JSON.stringify(node.output, null, 2)}</pre>
                        </div>
                      )}
                      {node.error && (
                        <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-600">
                          <Text type="danger">错误:</Text>
                          <div className="mt-1">{node.error}</div>
                        </div>
                      )}
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>

            {selectedSession.human_intervention_required && (
              <Card title="人工介入" className="border-orange-200 bg-orange-50">
                <div className="space-y-2">
                  <Text type="warning">此会话需要人工介入</Text>
                  <div className="flex space-x-2">
                    <Button type="primary" size="small">批准继续</Button>
                    <Button size="small">修改参数</Button>
                    <Button size="small" danger>终止会话</Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </Drawer>
    </PageLayout>
  )
}