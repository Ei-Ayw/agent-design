/**
 * 文件作用：观测页面，实现会话回放/拦截事件功能
 */

"use client"

import React, { useEffect, useState } from 'react'
import { Table, Space, Button, Modal, Form, Input, Select, message, Drawer, Tabs, Timeline, Tag, Card, Descriptions, Progress, Badge, Alert, Divider, Input as AntInput } from 'antd'
import { PlayCircleOutlined, PauseCircleOutlined, EyeOutlined, ExclamationCircleOutlined, CheckCircleOutlined, ClockCircleOutlined, UserOutlined, RobotOutlined, SearchOutlined, FilterOutlined, DownloadOutlined } from '@ant-design/icons'
import { PageLayout } from '../../components/ui/Layout'
import { Card as UICard, CardHeader, CardContent } from '../../components/ui/Card'
import { Title, Text, NumberDisplay } from '../../components/ui/Typography'
import { StatusIndicator } from '../../components/ui/Status'
import { formatNumber, formatTime } from '../../lib/utils'

const API = 'http://localhost:8000'

interface Conversation {
  id: string
  user_id: string
  user_name: string
  agent_id: string
  agent_name: string
  status: 'active' | 'completed' | 'failed' | 'interrupted'
  start_time: string
  end_time?: string
  duration?: number
  message_count: number
  token_usage: number
  cost: number
  safety_incidents: number
  quality_score?: number
}

interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  token_count: number
  processing_time: number
  safety_flags?: string[]
  quality_metrics?: {
    relevance: number
    helpfulness: number
    accuracy: number
  }
}

interface SafetyIncident {
  id: string
  conversation_id: string
  message_id: string
  type: 'inappropriate' | 'harmful' | 'bias' | 'privacy' | 'security'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  detected_at: string
  resolved_at?: string
  resolved_by?: string
  action_taken?: string
}

interface AuditEvent {
  id: string
  event_type: 'login' | 'logout' | 'conversation_start' | 'conversation_end' | 'tool_call' | 'safety_incident' | 'admin_action'
  user_id: string
  user_name: string
  resource_id?: string
  resource_type?: string
  details: any
  timestamp: string
  ip_address?: string
  user_agent?: string
}

export default function ObservabilityPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [safetyIncidents, setSafetyIncidents] = useState<SafetyIncident[]>([])
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [loading, setLoading] = useState(false)
  const [replayDrawerVisible, setReplayDrawerVisible] = useState(false)
  const [incidentDrawerVisible, setIncidentDrawerVisible] = useState(false)
  const [auditDrawerVisible, setAuditDrawerVisible] = useState(false)
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // 观测相关数据
  const observabilityStats = [
    {
      title: '今日会话',
      value: formatNumber(conversations.length),
      change: { value: 15.2, type: 'increase' as const },
    },
    {
      title: '安全事件',
      value: formatNumber(safetyIncidents.filter(i => i.severity === 'high' || i.severity === 'critical').length),
      change: { value: 3.2, type: 'decrease' as const },
    },
    {
      title: '平均质量分',
      value: `${Math.round(conversations.reduce((sum, c) => sum + (c.quality_score || 0), 0) / Math.max(conversations.length, 1))}`,
      change: { value: 2.1, type: 'increase' as const },
    },
    {
      title: '平均响应时间',
      value: formatTime(1200),
      change: { value: 5.2, type: 'decrease' as const },
    }
  ]

  const incidentTypes = [
    { name: '不当内容', count: safetyIncidents.filter(i => i.type === 'inappropriate').length, color: 'var(--color-semantic-warning)' },
    { name: '有害内容', count: safetyIncidents.filter(i => i.type === 'harmful').length, color: 'var(--color-semantic-error)' },
    { name: '偏见内容', count: safetyIncidents.filter(i => i.type === 'bias').length, color: 'var(--color-primary-500)' },
    { name: '隐私泄露', count: safetyIncidents.filter(i => i.type === 'privacy').length, color: 'var(--color-semantic-success)' },
  ]

  useEffect(() => {
    fetchConversations()
    fetchSafetyIncidents()
    fetchAuditEvents()
  }, [])

  const fetchConversations = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API}/conversations`)
      if (response.ok) {
        const convs = await response.json()
        // 为每个会话添加模拟数据
        const convsWithData = convs.map((conv: any) => ({
          ...conv,
          user_name: '用户' + Math.floor(Math.random() * 100),
          agent_name: 'Agent' + Math.floor(Math.random() * 10),
          message_count: Math.floor(Math.random() * 50) + 5,
          token_usage: Math.floor(Math.random() * 10000) + 1000,
          cost: Math.random() * 10 + 0.1,
          safety_incidents: Math.floor(Math.random() * 3),
          quality_score: Math.floor(Math.random() * 20) + 80,
          duration: Math.floor(Math.random() * 300000) + 30000,
          end_time: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        }))
        setConversations(convsWithData)
      }
    } catch (error) {
      message.error('获取会话列表失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      // 模拟消息数据
      const mockMessages: Message[] = [
        {
          id: '1',
          conversation_id: conversationId,
          role: 'user',
          content: '请帮我分析一下这个数据',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          token_count: 15,
          processing_time: 0,
        },
        {
          id: '2',
          conversation_id: conversationId,
          role: 'assistant',
          content: '我来帮您分析这个数据。首先让我查看一下数据的结构和内容...',
          timestamp: new Date(Date.now() - 240000).toISOString(),
          token_count: 45,
          processing_time: 1200,
          quality_metrics: {
            relevance: 0.9,
            helpfulness: 0.85,
            accuracy: 0.88,
          },
        },
        {
          id: '3',
          conversation_id: conversationId,
          role: 'user',
          content: '数据中有异常值吗？',
          timestamp: new Date(Date.now() - 180000).toISOString(),
          token_count: 12,
          processing_time: 0,
        },
        {
          id: '4',
          conversation_id: conversationId,
          role: 'assistant',
          content: '是的，我发现了几个异常值。让我详细说明一下...',
          timestamp: new Date(Date.now() - 120000).toISOString(),
          token_count: 38,
          processing_time: 800,
          safety_flags: ['potential_bias'],
          quality_metrics: {
            relevance: 0.95,
            helpfulness: 0.9,
            accuracy: 0.92,
          },
        },
      ]
      setMessages(mockMessages)
    } catch (error) {
      message.error('获取消息列表失败')
    }
  }

  const fetchSafetyIncidents = async () => {
    try {
      // 模拟安全事件数据
      const mockIncidents: SafetyIncident[] = [
        {
          id: '1',
          conversation_id: 'conv-1',
          message_id: 'msg-1',
          type: 'inappropriate',
          severity: 'medium',
          description: '检测到不当语言使用',
          detected_at: new Date(Date.now() - 1800000).toISOString(),
          resolved_at: new Date(Date.now() - 1200000).toISOString(),
          resolved_by: 'admin',
          action_taken: '内容已过滤',
        },
        {
          id: '2',
          conversation_id: 'conv-2',
          message_id: 'msg-2',
          type: 'privacy',
          severity: 'high',
          description: '可能包含敏感个人信息',
          detected_at: new Date(Date.now() - 3600000).toISOString(),
          resolved_at: new Date(Date.now() - 3000000).toISOString(),
          resolved_by: 'admin',
          action_taken: '内容已屏蔽',
        },
        {
          id: '3',
          conversation_id: 'conv-3',
          message_id: 'msg-3',
          type: 'bias',
          severity: 'low',
          description: '检测到潜在偏见内容',
          detected_at: new Date(Date.now() - 5400000).toISOString(),
        },
      ]
      setSafetyIncidents(mockIncidents)
    } catch (error) {
      message.error('获取安全事件失败')
    }
  }

  const fetchAuditEvents = async () => {
    try {
      // 模拟审计事件数据
      const mockEvents: AuditEvent[] = [
        {
          id: '1',
          event_type: 'conversation_start',
          user_id: 'user-1',
          user_name: '张三',
          resource_id: 'conv-1',
          resource_type: 'conversation',
          details: { agent_id: 'agent-1' },
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0...',
        },
        {
          id: '2',
          event_type: 'tool_call',
          user_id: 'user-1',
          user_name: '张三',
          resource_id: 'tool-1',
          resource_type: 'tool',
          details: { tool_name: 'data_analyzer', parameters: {} },
          timestamp: new Date(Date.now() - 1500000).toISOString(),
          ip_address: '192.168.1.100',
        },
        {
          id: '3',
          event_type: 'safety_incident',
          user_id: 'user-2',
          user_name: '李四',
          resource_id: 'incident-1',
          resource_type: 'safety_incident',
          details: { incident_type: 'inappropriate', severity: 'medium' },
          timestamp: new Date(Date.now() - 1200000).toISOString(),
          ip_address: '192.168.1.101',
        },
      ]
      setAuditEvents(mockEvents)
    } catch (error) {
      message.error('获取审计事件失败')
    }
  }

  const replayConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`${API}/conversations/${conversationId}/replay`, {
        method: 'POST',
      })
      if (response.ok) {
        message.success('会话回放已启动')
      } else {
        message.error('会话回放失败')
      }
    } catch (error) {
      message.error('会话回放失败')
    }
  }

  const resolveIncident = async (incidentId: string, action: string) => {
    try {
      const response = await fetch(`${API}/safety/incidents/${incidentId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, resolved_by: 'admin' }),
      })
      if (response.ok) {
        message.success('安全事件已处理')
        fetchSafetyIncidents()
      } else {
        message.error('处理失败')
      }
    } catch (error) {
      message.error('处理失败')
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'blue'
      case 'medium': return 'orange'
      case 'high': return 'red'
      case 'critical': return 'purple'
      default: return 'default'
    }
  }

  const getIncidentTypeLabel = (type: string) => {
    switch (type) {
      case 'inappropriate': return '不当内容'
      case 'harmful': return '有害内容'
      case 'bias': return '偏见内容'
      case 'privacy': return '隐私泄露'
      case 'security': return '安全威胁'
      default: return type
    }
  }

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'login': return '登录'
      case 'logout': return '登出'
      case 'conversation_start': return '会话开始'
      case 'conversation_end': return '会话结束'
      case 'tool_call': return '工具调用'
      case 'safety_incident': return '安全事件'
      case 'admin_action': return '管理操作'
      default: return type
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'processing'
      case 'completed': return 'success'
      case 'failed': return 'error'
      case 'interrupted': return 'warning'
      default: return 'default'
    }
  }

  const filteredConversations = conversations.filter(conv => {
    const matchesStatus = filterStatus === 'all' || conv.status === filterStatus
    const matchesSearch = searchQuery === '' || 
      conv.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.agent_name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const filteredIncidents = safetyIncidents.filter(incident => 
    filterStatus === 'all' || incident.severity === filterStatus
  )

  return (
    <PageLayout>
      <div className="space-y-1 h-full flex flex-col">
        {/* 顶部区域：统计卡片 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-1 flex-shrink-0">
          {observabilityStats.map((stat, index) => (
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
                <button className="p-1 border border-[var(--color-border-1)] rounded hover:bg-[var(--color-bg-2)] transition-colors">
                  <div className="text-center">
                    <div className="text-sm mb-1">🔍</div>
                    <Text size="sm" type="primary">会话搜索</Text>
                  </div>
                </button>
                <button className="p-1 border border-[var(--color-border-1)] rounded hover:bg-[var(--color-bg-2)] transition-colors">
                  <div className="text-center">
                    <div className="text-sm mb-1">📊</div>
                    <Text size="sm" type="primary">导出报告</Text>
                  </div>
                </button>
                <button className="p-1 border border-[var(--color-border-1)] rounded hover:bg-[var(--color-bg-2)] transition-colors">
                  <div className="text-center">
                    <div className="text-sm mb-1">🛡️</div>
                    <Text size="sm" type="primary">安全监控</Text>
                  </div>
                </button>
                <button className="p-1 border border-[var(--color-border-1)] rounded hover:bg-[var(--color-bg-2)] transition-colors">
                  <div className="text-center">
                    <div className="text-sm mb-1">📋</div>
                    <Text size="sm" type="primary">审计日志</Text>
                  </div>
                </button>
              </div>
            </CardContent>
          </UICard>

          <UICard>
            <CardHeader title="安全事件类型" />
            <CardContent>
              <div className="space-y-1">
                {incidentTypes.map((type, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <Text size="sm" type="secondary">{type.name}</Text>
                    <div className="flex items-center space-x-1">
                      <div className="w-8 h-1.5 bg-[var(--color-bg-3)] rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full" 
                          style={{ 
                            width: `${(type.count / Math.max(...incidentTypes.map(t => t.count))) * 100}%`,
                            backgroundColor: type.color
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
            <CardHeader title="会话状态" />
            <CardContent>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <StatusIndicator status="processing" />
                    <Text size="sm" type="secondary">进行中</Text>
                  </div>
                  <Text size="sm" type="primary">{conversations.filter(c => c.status === 'active').length}</Text>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <StatusIndicator status="success" />
                    <Text size="sm" type="secondary">已完成</Text>
                  </div>
                  <Text size="sm" type="primary">{conversations.filter(c => c.status === 'completed').length}</Text>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <StatusIndicator status="error" />
                    <Text size="sm" type="secondary">失败</Text>
                  </div>
                  <Text size="sm" type="primary">{conversations.filter(c => c.status === 'failed').length}</Text>
                </div>
              </div>
            </CardContent>
          </UICard>

          <UICard>
            <CardHeader title="待处理事件" />
            <CardContent>
              <div className="space-y-1">
                {safetyIncidents.filter(i => !i.resolved_at).slice(0, 3).map((incident, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <ExclamationCircleOutlined style={{ color: 'var(--color-semantic-warning)' }} />
                      <Text size="sm" type="primary">{getIncidentTypeLabel(incident.type)}</Text>
                    </div>
                    <Tag color={getSeverityColor(incident.severity)} size="small">
                      {incident.severity}
                    </Tag>
                  </div>
                ))}
              </div>
            </CardContent>
          </UICard>
        </div>

        {/* 底部区域：会话列表 */}
        <div className="flex-1 min-h-0">
          <UICard className="h-full">
            <CardHeader
              title="会话监控"
              action={
                <Space>
                  <AntInput
                    placeholder="搜索用户或Agent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    prefix={<SearchOutlined />}
                    style={{ width: 200 }}
                  />
                  <Select
                    size="small"
                    value={filterStatus}
                    onChange={setFilterStatus}
                    options={[
                      { value: 'all', label: '全部状态' },
                      { value: 'active', label: '进行中' },
                      { value: 'completed', label: '已完成' },
                      { value: 'failed', label: '失败' },
                      { value: 'interrupted', label: '中断' }
                    ]}
                  />
                  <Button size="small" icon={<DownloadOutlined />}>导出</Button>
                </Space>
              }
            />
            <CardContent>
              <div className="h-full overflow-y-auto">
                <Table
                  loading={loading}
                  dataSource={filteredConversations}
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
                    { title: '用户', dataIndex: 'user_name', width: 80 },
                    { title: 'Agent', dataIndex: 'agent_name', width: 80 },
                    { 
                      title: '消息数', 
                      dataIndex: 'message_count', 
                      width: 80,
                      render: (value: number) => formatNumber(value)
                    },
                    { 
                      title: 'Token 使用', 
                      dataIndex: 'token_usage', 
                      width: 80,
                      render: (value: number) => formatNumber(value)
                    },
                    { 
                      title: '成本', 
                      dataIndex: 'cost', 
                      width: 80,
                      render: (value: number) => `$${value.toFixed(2)}`
                    },
                    { 
                      title: '安全事件', 
                      dataIndex: 'safety_incidents', 
                      width: 80,
                      render: (value: number) => (
                        <Tag color={value > 0 ? 'red' : 'green'}>
                          {value > 0 ? `${value} 个` : '无'}
                        </Tag>
                      )
                    },
                    { 
                      title: '质量分', 
                      dataIndex: 'quality_score', 
                      width: 80,
                      render: (value: number) => (
                        <Tag color={value >= 90 ? 'green' : value >= 80 ? 'orange' : 'red'}>
                          {value}
                        </Tag>
                      )
                    },
                    { 
                      title: '开始时间', 
                      dataIndex: 'start_time', 
                      width: 120,
                      render: (value: string) => new Date(value).toLocaleString()
                    },
                    { 
                      title: '操作', 
                      width: 150,
                      render: (_, record: Conversation) => (
                        <Space size="small">
                          <Button 
                            size="small" 
                            icon={<EyeOutlined />}
                            onClick={() => {
                              setSelectedConversation(record)
                              fetchMessages(record.id)
                              setReplayDrawerVisible(true)
                            }}
                          >
                            回放
                          </Button>
                          <Button 
                            size="small" 
                            icon={<PlayCircleOutlined />}
                            onClick={() => replayConversation(record.id)}
                          >
                            重播
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

      {/* 会话回放抽屉 */}
      <Drawer
        title="会话回放"
        width={800}
        open={replayDrawerVisible}
        onClose={() => setReplayDrawerVisible(false)}
      >
        {selectedConversation && (
          <div className="space-y-4">
            <Card>
              <Descriptions column={2} size="small">
                <Descriptions.Item label="用户">{selectedConversation.user_name}</Descriptions.Item>
                <Descriptions.Item label="Agent">{selectedConversation.agent_name}</Descriptions.Item>
                <Descriptions.Item label="状态">
                  <StatusIndicator status={getStatusColor(selectedConversation.status) as any} />
                </Descriptions.Item>
                <Descriptions.Item label="消息数">{selectedConversation.message_count}</Descriptions.Item>
                <Descriptions.Item label="Token 使用">{formatNumber(selectedConversation.token_usage)}</Descriptions.Item>
                <Descriptions.Item label="成本">${selectedConversation.cost.toFixed(2)}</Descriptions.Item>
                <Descriptions.Item label="安全事件">
                  <Tag color={selectedConversation.safety_incidents > 0 ? 'red' : 'green'}>
                    {selectedConversation.safety_incidents > 0 ? `${selectedConversation.safety_incidents} 个` : '无'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="质量分">
                  <Tag color={selectedConversation.quality_score && selectedConversation.quality_score >= 90 ? 'green' : 'orange'}>
                    {selectedConversation.quality_score}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="开始时间">
                  {new Date(selectedConversation.start_time).toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="结束时间">
                  {selectedConversation.end_time ? new Date(selectedConversation.end_time).toLocaleString() : '进行中'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="消息时间线">
              <Timeline>
                {messages.map(message => (
                  <Timeline.Item
                    key={message.id}
                    color={message.role === 'user' ? 'blue' : message.role === 'assistant' ? 'green' : 'gray'}
                    dot={message.role === 'user' ? <UserOutlined /> : message.role === 'assistant' ? <RobotOutlined /> : <ClockCircleOutlined />}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <Text size="sm" type="primary">
                          {message.role === 'user' ? '用户' : message.role === 'assistant' ? 'Assistant' : '系统'}
                        </Text>
                        <div className="flex items-center space-x-2">
                          <Text size="xs" type="tertiary">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </Text>
                          <Text size="xs" type="tertiary">
                            {message.token_count} tokens
                          </Text>
                          {message.processing_time > 0 && (
                            <Text size="xs" type="tertiary">
                              {formatTime(message.processing_time)}
                            </Text>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 p-2 bg-gray-50 rounded">
                        <Text size="sm">{message.content}</Text>
                      </div>
                      {message.safety_flags && message.safety_flags.length > 0 && (
                        <div className="mt-2">
                          <Tag color="red">安全标记: {message.safety_flags.join(', ')}</Tag>
                        </div>
                      )}
                      {message.quality_metrics && (
                        <div className="mt-2 flex space-x-2">
                          <Tag color="blue">相关性: {(message.quality_metrics.relevance * 100).toFixed(0)}%</Tag>
                          <Tag color="green">有用性: {(message.quality_metrics.helpfulness * 100).toFixed(0)}%</Tag>
                          <Tag color="orange">准确性: {(message.quality_metrics.accuracy * 100).toFixed(0)}%</Tag>
                        </div>
                      )}
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>

            {selectedConversation.safety_incidents > 0 && (
              <Card title="安全事件" className="border-red-200">
                <Alert
                  message="检测到安全事件"
                  description={`此会话包含 ${selectedConversation.safety_incidents} 个安全事件，请查看详细信息`}
                  type="warning"
                  showIcon
                  action={
                    <Button size="small" onClick={() => setIncidentDrawerVisible(true)}>
                      查看详情
                    </Button>
                  }
                />
              </Card>
            )}
          </div>
        )}
      </Drawer>

      {/* 安全事件抽屉 */}
      <Drawer
        title="安全事件详情"
        width={600}
        open={incidentDrawerVisible}
        onClose={() => setIncidentDrawerVisible(false)}
      >
        <div className="space-y-4">
          {safetyIncidents.map(incident => (
            <Card key={incident.id} size="small">
              <div className="flex items-center justify-between">
                <div>
                  <Text type="primary">{getIncidentTypeLabel(incident.type)}</Text>
                  <div className="text-sm text-gray-600 mt-1">{incident.description}</div>
                </div>
                <Tag color={getSeverityColor(incident.severity)}>{incident.severity}</Tag>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                检测时间: {new Date(incident.detected_at).toLocaleString()}
              </div>
              {incident.resolved_at ? (
                <div className="mt-2">
                  <Tag color="green">已处理</Tag>
                  <div className="text-xs text-gray-500">
                    处理时间: {new Date(incident.resolved_at).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    处理人: {incident.resolved_by}
                  </div>
                  <div className="text-xs text-gray-500">
                    处理措施: {incident.action_taken}
                  </div>
                </div>
              ) : (
                <div className="mt-2 flex space-x-2">
                  <Button size="small" type="primary" onClick={() => resolveIncident(incident.id, '屏蔽内容')}>
                    屏蔽内容
                  </Button>
                  <Button size="small" onClick={() => resolveIncident(incident.id, '标记为误报')}>
                    误报
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </Drawer>
    </PageLayout>
  )
}