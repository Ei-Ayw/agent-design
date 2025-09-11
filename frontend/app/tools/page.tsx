/**
 * 文件作用：Tools 列表与创建页。
 */

"use client"

import React, { useEffect, useState } from 'react'
import { Table, Button, Form, Input, Space, message, Card, Select, Tag } from 'antd'
import { PageLayout } from '../../components/ui/Layout'
import { Card as UICard, CardHeader, CardContent } from '../../components/ui/Card'
import { Title, Text, NumberDisplay } from '../../components/ui/Typography'
import { StatusIndicator } from '../../components/ui/Status'
import { StatChart, AreaChartComponent, LineChartComponent } from '../../components/ui/Charts'
import { formatNumber, formatTime } from '../../lib/utils'

type Tool = { 
  id: string
  name: string
  description?: string
  category?: 'api' | 'database' | 'file' | 'web' | 'ai'
  status?: 'active' | 'inactive' | 'error'
  usage_count?: number
  success_rate?: number
  avg_latency?: number
  last_used?: string
}

const API = 'http://localhost:8000'

export default function ToolsPage() {
  const [data, setData] = useState<Tool[]>([])
  const [loading, setLoading] = useState(false)
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  // 模拟数据
  const toolStats = [
    {
      title: '总工具数',
      value: formatNumber(data.length),
      change: { value: 6.8, type: 'increase' as const },
    },
    {
      title: '活跃工具',
      value: formatNumber(data.filter(t => t.status === 'active').length),
      change: { value: 10.2, type: 'increase' as const },
    },
    {
      title: '总调用次数',
      value: formatNumber(data.reduce((sum, tool) => sum + (tool.usage_count || 0), 0)),
      change: { value: 18.5, type: 'increase' as const },
    },
    {
      title: '平均成功率',
      value: '96.8%',
      change: { value: 1.2, type: 'increase' as const },
    }
  ]

  const usageTrendData = [
    { name: '00:00', calls: 15, success: 14, errors: 1 },
    { name: '04:00', calls: 8, success: 7, errors: 1 },
    { name: '08:00', calls: 28, success: 27, errors: 1 },
    { name: '12:00', calls: 45, success: 44, errors: 1 },
    { name: '16:00', calls: 32, success: 31, errors: 1 },
    { name: '20:00', calls: 22, success: 21, errors: 1 },
  ]

  const categoryData = [
    { name: 'API', count: 12, usage: 45 },
    { name: '数据库', count: 8, usage: 30 },
    { name: '文件', count: 6, usage: 15 },
    { name: 'Web', count: 4, usage: 10 },
  ]

  const fetchTools = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/tools`)
      const json = await res.json()
      // 添加模拟数据
      const toolsWithMockData = json.map((tool: Tool, index: number) => ({
        ...tool,
        category: ['api', 'database', 'file', 'web', 'ai'][index % 5] as any,
        status: ['active', 'active', 'inactive', 'error'][index % 4] as any,
        usage_count: Math.floor(Math.random() * 1000) + 50,
        success_rate: Math.floor(Math.random() * 5) + 95,
        avg_latency: Math.floor(Math.random() * 1000) + 100,
        last_used: new Date(Date.now() - Math.random() * 86400000).toISOString()
      }))
      setData(toolsWithMockData)
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

  const filteredData = data.filter(tool => 
    filterCategory === 'all' || tool.category === filterCategory
  )

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'api': 'API',
      'database': '数据库',
      'file': '文件',
      'web': 'Web',
      'ai': 'AI'
    }
    return labels[category] || category
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'api': 'var(--color-primary-500)',
      'database': 'var(--color-semantic-success)',
      'file': 'var(--color-semantic-warning)',
      'web': 'var(--color-semantic-error)',
      'ai': 'var(--color-primary-600)'
    }
    return colors[category] || 'var(--color-text-3)'
  }

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
                  {toolStats.map((stat, index) => (
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
                  title="调用趋势"
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
                    data={usageTrendData}
                    height={160}
                    areas={[
                      { dataKey: 'calls', name: '总调用', color: 'var(--color-primary-500)', fillOpacity: 0.1 },
                      { dataKey: 'success', name: '成功调用', color: 'var(--color-semantic-success)', fillOpacity: 0.1 },
                    ]}
                  />
                </CardContent>
              </UICard>

              <UICard>
                <CardHeader title="分类分布" />
                <CardContent>
                  <div className="space-y-2">
                    {categoryData.map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full" style={{
                            backgroundColor: ['var(--color-primary-500)', 'var(--color-semantic-success)', 'var(--color-semantic-warning)', 'var(--color-semantic-error)'][index]
                          }}></div>
                          <Text size="sm" type="primary">{category.name}</Text>
                        </div>
                        <div className="text-right">
                          <Text size="sm" type="primary" weight="semibold">{category.count}</Text>
                          <Text size="sm" type="tertiary" className="block">{category.usage}%</Text>
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
                    <div className="text-sm mb-1">🔧</div>
                    <Text size="sm" type="primary">创建工具</Text>
                  </div>
                </button>
                <button className="p-1 border border-[var(--color-border-1)] rounded hover:bg-[var(--color-bg-2)] transition-colors">
                  <div className="text-center">
                    <div className="text-sm mb-1">📦</div>
                    <Text size="sm" type="primary">导入工具</Text>
                  </div>
                </button>
                <button className="p-1 border border-[var(--color-border-1)] rounded hover:bg-[var(--color-bg-2)] transition-colors">
                  <div className="text-center">
                    <div className="text-sm mb-1">🧪</div>
                    <Text size="sm" type="primary">测试工具</Text>
                  </div>
                </button>
                <button className="p-1 border border-[var(--color-border-1)] rounded hover:bg-[var(--color-bg-2)] transition-colors">
                  <div className="text-center">
                    <div className="text-sm mb-1">📊</div>
                    <Text size="sm" type="primary">使用统计</Text>
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
                  <Text size="sm" type="primary">{data.filter(t => t.status === 'active').length}</Text>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <StatusIndicator status="warning" />
                    <Text size="sm" type="secondary">非活跃</Text>
                  </div>
                  <Text size="sm" type="primary">{data.filter(t => t.status === 'inactive').length}</Text>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <StatusIndicator status="error" />
                    <Text size="sm" type="secondary">错误</Text>
                  </div>
                  <Text size="sm" type="primary">{data.filter(t => t.status === 'error').length}</Text>
                </div>
              </div>
            </CardContent>
          </UICard>

          <UICard>
            <CardHeader title="分类统计" />
            <CardContent>
              <div className="space-y-1">
                {categoryData.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <Text size="sm" type="secondary">{category.name}</Text>
                    <div className="flex items-center space-x-1">
                      <div className="w-8 h-1.5 bg-[var(--color-bg-3)] rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full" 
                          style={{ 
                            width: `${category.usage}%`,
                            backgroundColor: ['var(--color-primary-500)', 'var(--color-semantic-success)', 'var(--color-semantic-warning)', 'var(--color-semantic-error)'][index]
                          }}
                        ></div>
                      </div>
                      <Text size="sm" type="primary">{category.count}</Text>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </UICard>

          <UICard>
            <CardHeader title="热门工具" />
            <CardContent>
              <div className="space-y-1">
                {data.slice(0, 5).map((tool, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 rounded-full" style={{
                        backgroundColor: getCategoryColor(tool.category || 'api')
                      }}></div>
                      <Text size="sm" type="primary">{tool.name}</Text>
                    </div>
                    <Text size="sm" type="tertiary">{formatNumber(tool.usage_count || 0)}</Text>
                  </div>
                ))}
              </div>
            </CardContent>
          </UICard>
        </div>

        {/* 底部区域：工具列表 */}
        <div className="flex-1 min-h-0">
          <UICard className="h-full">
            <CardHeader 
              title="工具列表"
              action={
                <div className="flex items-center space-x-2">
                  <Select
                    size="small"
                    value={filterCategory}
                    onChange={setFilterCategory}
                    options={[
                      { value: 'all', label: '全部' },
                      { value: 'api', label: 'API' },
                      { value: 'database', label: '数据库' },
                      { value: 'file', label: '文件' },
                      { value: 'web', label: 'Web' },
                      { value: 'ai', label: 'AI' }
                    ]}
                  />
                  <Button type="primary" size="small">创建工具</Button>
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
                    { 
                      title: '分类', 
                      dataIndex: 'category', 
                      width: 80,
                      render: (category: string) => (
                        <Tag color={getCategoryColor(category)}>
                          {getCategoryLabel(category)}
                        </Tag>
                      )
                    },
                    { title: '描述', dataIndex: 'description', width: 150, ellipsis: true },
                    { 
                      title: '调用次数', 
                      dataIndex: 'usage_count', 
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
                      width: 100,
                      render: (_, record: Tool) => (
                        <Space size="small">
                          <Button size="small" type="link">测试</Button>
                          <Button size="small" type="link">编辑</Button>
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


