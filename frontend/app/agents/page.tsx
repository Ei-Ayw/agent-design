/**
 * 文件作用：Agents 列表与创建页（直连后端），支持跳转运行页。
 */

"use client"

import React, { useEffect, useState } from 'react'
import { Table, Button, Form, Input, Space, message, Card, Select, Tag } from 'antd'
import Link from 'next/link'
import { PageLayout } from '../../components/ui/Layout'
import { Card as UICard, CardHeader, CardContent } from '../../components/ui/Card'
import { Title, Text, NumberDisplay } from '../../components/ui/Typography'
import { StatusIndicator } from '../../components/ui/Status'
import { StatChart, AreaChartComponent, LineChartComponent } from '../../components/ui/Charts'
import { formatNumber, formatTime } from '../../lib/utils'

type Agent = {
  id: string
  name: string
  description?: string
  system_prompt?: string
  model?: string
  status?: 'active' | 'inactive' | 'error'
  requests?: number
  success_rate?: number
  avg_latency?: number
  last_run?: string
}

const API = 'http://localhost:8000'

export default function AgentsPage() {
  const [data, setData] = useState<Agent[]>([])
  const [loading, setLoading] = useState(false)
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // 模拟数据
  const agentStats = [
    {
      title: '总 Agent 数',
      value: formatNumber(data.length),
      change: { value: 8.3, type: 'increase' as const },
    },
    {
      title: '活跃 Agent',
      value: formatNumber(data.filter(a => a.status === 'active').length),
      change: { value: 12.5, type: 'increase' as const },
    },
    {
      title: '平均成功率',
      value: '97.6%',
      change: { value: 2.1, type: 'increase' as const },
    },
    {
      title: '平均延迟',
      value: formatTime(1240),
      change: { value: 5.2, type: 'decrease' as const },
    }
  ]

  const performanceData = [
    { name: '00:00', requests: 24, success: 23, errors: 1 },
    { name: '04:00', requests: 18, success: 17, errors: 1 },
    { name: '08:00', requests: 35, success: 34, errors: 1 },
    { name: '12:00', requests: 42, success: 41, errors: 1 },
    { name: '16:00', requests: 38, success: 37, errors: 1 },
    { name: '20:00', requests: 28, success: 27, errors: 1 },
  ]

  const modelUsageData = [
    { name: 'GPT-4', usage: 45, cost: 1200 },
    { name: 'Claude-3', usage: 30, cost: 800 },
    { name: 'Gemini', usage: 15, cost: 400 },
    { name: 'Llama-2', usage: 10, cost: 200 },
  ]

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
      // 添加模拟数据
      const agentsWithMockData = json.map((agent: Agent, index: number) => ({
        ...agent,
        status: ['active', 'active', 'inactive', 'error'][index % 4] as any,
        requests: Math.floor(Math.random() * 1000) + 100,
        success_rate: Math.floor(Math.random() * 5) + 95,
        avg_latency: Math.floor(Math.random() * 2000) + 500,
        last_run: new Date(Date.now() - Math.random() * 86400000).toISOString()
      }))
      setData(agentsWithMockData)
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

  const filteredData = data.filter(agent => 
    filterStatus === 'all' || agent.status === filterStatus
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
                  {agentStats.map((stat, index) => (
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
                  title="请求趋势"
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
                    data={performanceData}
                    height={160}
                    areas={[
                      { dataKey: 'requests', name: '总请求', color: 'var(--color-primary-500)', fillOpacity: 0.1 },
                      { dataKey: 'success', name: '成功请求', color: 'var(--color-semantic-success)', fillOpacity: 0.1 },
                    ]}
                  />
                </CardContent>
              </UICard>

              <UICard>
                <CardHeader title="模型使用分布" />
                <CardContent>
                  <div className="space-y-2">
                    {modelUsageData.map((model, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full" style={{
                            backgroundColor: ['var(--color-primary-500)', 'var(--color-semantic-success)', 'var(--color-semantic-warning)', 'var(--color-semantic-error)'][index]
                          }}></div>
                          <Text size="sm" type="primary">{model.name}</Text>
                        </div>
                        <div className="text-right">
                          <Text size="sm" type="primary" weight="semibold">{model.usage}%</Text>
                          <Text size="sm" type="tertiary" className="block">${model.cost}</Text>
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
                    <div className="text-sm mb-1">🤖</div>
                    <Text size="sm" type="primary">创建 Agent</Text>
                  </div>
                </button>
                <button className="p-1 border border-[var(--color-border-1)] rounded hover:bg-[var(--color-bg-2)] transition-colors">
                  <div className="text-center">
                    <div className="text-sm mb-1">⚡</div>
                    <Text size="sm" type="primary">批量运行</Text>
                  </div>
                </button>
                <button className="p-1 border border-[var(--color-border-1)] rounded hover:bg-[var(--color-bg-2)] transition-colors">
                  <div className="text-center">
                    <div className="text-sm mb-1">🔧</div>
                    <Text size="sm" type="primary">工具管理</Text>
                  </div>
                </button>
                <button className="p-1 border border-[var(--color-border-1)] rounded hover:bg-[var(--color-bg-2)] transition-colors">
                  <div className="text-center">
                    <div className="text-sm mb-1">📊</div>
                    <Text size="sm" type="primary">性能分析</Text>
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
                  <Text size="sm" type="primary">{data.filter(a => a.status === 'active').length}</Text>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <StatusIndicator status="warning" />
                    <Text size="sm" type="secondary">非活跃</Text>
                  </div>
                  <Text size="sm" type="primary">{data.filter(a => a.status === 'inactive').length}</Text>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <StatusIndicator status="error" />
                    <Text size="sm" type="secondary">错误</Text>
                  </div>
                  <Text size="sm" type="primary">{data.filter(a => a.status === 'error').length}</Text>
                </div>
              </div>
            </CardContent>
          </UICard>

          <UICard>
            <CardHeader title="模型分布" />
            <CardContent>
              <div className="space-y-1">
                {modelUsageData.map((model, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <Text size="sm" type="secondary">{model.name}</Text>
                    <div className="flex items-center space-x-1">
                      <div className="w-8 h-1.5 bg-[var(--color-bg-3)] rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full" 
                          style={{ 
                            width: `${model.usage}%`,
                            backgroundColor: ['var(--color-primary-500)', 'var(--color-semantic-success)', 'var(--color-semantic-warning)', 'var(--color-semantic-error)'][index]
                          }}
                        ></div>
                      </div>
                      <Text size="sm" type="primary">{model.usage}%</Text>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </UICard>

          <UICard>
            <CardHeader title="最近活动" />
            <CardContent>
              <div className="space-y-1">
                {data.slice(0, 5).map((agent, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <StatusIndicator status={agent.status === 'active' ? 'success' : agent.status === 'inactive' ? 'warning' : 'error'} />
                      <Text size="sm" type="primary">{agent.name}</Text>
                    </div>
                    <Text size="sm" type="tertiary">{formatTime(agent.avg_latency || 0)}</Text>
                  </div>
                ))}
              </div>
            </CardContent>
          </UICard>
        </div>

        {/* 底部区域：Agent 列表 */}
        <div className="flex-1 min-h-0">
          <UICard className="h-full">
            <CardHeader 
              title="Agent 列表"
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
                  <Button type="primary" size="small">创建 Agent</Button>
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
                    { title: '名称', dataIndex: 'name', width: 120 },
                    { title: '模型', dataIndex: 'model', width: 100 },
                    { 
                      title: '请求数', 
                      dataIndex: 'requests', 
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
                      title: '平均延迟', 
                      dataIndex: 'avg_latency', 
                      width: 80,
                      render: (value: number) => formatTime(value)
                    },
                    { 
                      title: '操作', 
                      width: 120,
                      render: (_, record: Agent) => (
                        <Space size="small">
                          <Link href={`/agents/${record.id}/run`}>
                            <Button type="link" size="small">运行</Button>
                          </Link>
                          <Button size="small" onClick={() => bindTool(record.id)}>绑定工具</Button>
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
    </PageLayout>
  )
}


