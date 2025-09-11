/**
 * 文件作用：KB 列表与创建、文本 Ingest 占位调用。
 */

"use client"

import React, { useEffect, useState } from 'react'
import { Table, Button, Form, Input, Space, message, Card, Select, Tag, Upload } from 'antd'
import { PageLayout } from '../../components/ui/Layout'
import { Card as UICard, CardHeader, CardContent } from '../../components/ui/Card'
import { Title, Text, NumberDisplay } from '../../components/ui/Typography'
import { StatusIndicator } from '../../components/ui/Status'
import { StatChart, AreaChartComponent, LineChartComponent } from '../../components/ui/Charts'
import { formatNumber, formatTime } from '../../lib/utils'

type KB = { 
  id: string
  name?: string
  status?: 'active' | 'indexing' | 'error'
  documents?: number
  size?: number
  last_updated?: string
  search_count?: number
}

const API = 'http://localhost:8000'

export default function KBPage() {
  const [data, setData] = useState<KB[]>([])
  const [loading, setLoading] = useState(false)
  const [ingestPreview, setIngestPreview] = useState('')
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // 模拟数据
  const kbStats = [
    {
      title: '总知识库数',
      value: formatNumber(data.length),
      change: { value: 15.2, type: 'increase' as const },
    },
    {
      title: '总文档数',
      value: formatNumber(data.reduce((sum, kb) => sum + (kb.documents || 0), 0)),
      change: { value: 8.7, type: 'increase' as const },
    },
    {
      title: '总存储量',
      value: formatNumber(data.reduce((sum, kb) => sum + (kb.size || 0), 0), { unit: 'MB' }),
      change: { value: 12.3, type: 'increase' as const },
    },
    {
      title: '搜索次数',
      value: formatNumber(data.reduce((sum, kb) => sum + (kb.search_count || 0), 0)),
      change: { value: 25.6, type: 'increase' as const },
    }
  ]

  const searchTrendData = [
    { name: '00:00', searches: 12, success: 11, errors: 1 },
    { name: '04:00', searches: 8, success: 7, errors: 1 },
    { name: '08:00', searches: 25, success: 24, errors: 1 },
    { name: '12:00', searches: 35, success: 34, errors: 1 },
    { name: '16:00', searches: 28, success: 27, errors: 1 },
    { name: '20:00', searches: 18, success: 17, errors: 1 },
  ]

  const documentTypes = [
    { name: 'PDF', count: 45, size: 120 },
    { name: 'TXT', count: 32, size: 8 },
    { name: 'DOCX', count: 28, size: 45 },
    { name: 'MD', count: 15, size: 3 },
  ]

  const fetchKB = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/kb`)
      const json = await res.json()
      // 添加模拟数据
      const kbWithMockData = json.map((kb: KB, index: number) => ({
        ...kb,
        status: ['active', 'active', 'indexing', 'error'][index % 4] as any,
        documents: Math.floor(Math.random() * 100) + 10,
        size: Math.floor(Math.random() * 50) + 5,
        last_updated: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        search_count: Math.floor(Math.random() * 500) + 50
      }))
      setData(kbWithMockData)
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

  const filteredData = data.filter(kb => 
    filterStatus === 'all' || kb.status === filterStatus
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
                  {kbStats.map((stat, index) => (
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
                  title="搜索趋势"
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
                    data={searchTrendData}
                    height={160}
                    areas={[
                      { dataKey: 'searches', name: '总搜索', color: 'var(--color-primary-500)', fillOpacity: 0.1 },
                      { dataKey: 'success', name: '成功搜索', color: 'var(--color-semantic-success)', fillOpacity: 0.1 },
                    ]}
                  />
                </CardContent>
              </UICard>

              <UICard>
                <CardHeader title="文档类型分布" />
                <CardContent>
                  <div className="space-y-2">
                    {documentTypes.map((type, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full" style={{
                            backgroundColor: ['var(--color-primary-500)', 'var(--color-semantic-success)', 'var(--color-semantic-warning)', 'var(--color-semantic-error)'][index]
                          }}></div>
                          <Text size="sm" type="primary">{type.name}</Text>
                        </div>
                        <div className="text-right">
                          <Text size="sm" type="primary" weight="semibold">{type.count}</Text>
                          <Text size="sm" type="tertiary" className="block">{type.size}MB</Text>
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
                    <div className="text-sm mb-1">📚</div>
                    <Text size="sm" type="primary">创建知识库</Text>
                  </div>
                </button>
                <button className="p-1 border border-[var(--color-border-1)] rounded hover:bg-[var(--color-bg-2)] transition-colors">
                  <div className="text-center">
                    <div className="text-sm mb-1">📄</div>
                    <Text size="sm" type="primary">上传文档</Text>
                  </div>
                </button>
                <button className="p-1 border border-[var(--color-border-1)] rounded hover:bg-[var(--color-bg-2)] transition-colors">
                  <div className="text-center">
                    <div className="text-sm mb-1">🔍</div>
                    <Text size="sm" type="primary">搜索测试</Text>
                  </div>
                </button>
                <button className="p-1 border border-[var(--color-border-1)] rounded hover:bg-[var(--color-bg-2)] transition-colors">
                  <div className="text-center">
                    <div className="text-sm mb-1">⚙️</div>
                    <Text size="sm" type="primary">索引管理</Text>
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
                  <Text size="sm" type="primary">{data.filter(kb => kb.status === 'active').length}</Text>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <StatusIndicator status="warning" />
                    <Text size="sm" type="secondary">索引中</Text>
                  </div>
                  <Text size="sm" type="primary">{data.filter(kb => kb.status === 'indexing').length}</Text>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <StatusIndicator status="error" />
                    <Text size="sm" type="secondary">错误</Text>
                  </div>
                  <Text size="sm" type="primary">{data.filter(kb => kb.status === 'error').length}</Text>
                </div>
              </div>
            </CardContent>
          </UICard>

          <UICard>
            <CardHeader title="存储分布" />
            <CardContent>
              <div className="space-y-1">
                {documentTypes.map((type, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <Text size="sm" type="secondary">{type.name}</Text>
                    <div className="flex items-center space-x-1">
                      <div className="w-8 h-1.5 bg-[var(--color-bg-3)] rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full" 
                          style={{ 
                            width: `${(type.count / Math.max(...documentTypes.map(t => t.count))) * 100}%`,
                            backgroundColor: ['var(--color-primary-500)', 'var(--color-semantic-success)', 'var(--color-semantic-warning)', 'var(--color-semantic-error)'][index]
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
            <CardHeader title="最近活动" />
            <CardContent>
              <div className="space-y-1">
                {data.slice(0, 5).map((kb, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <StatusIndicator status={kb.status === 'active' ? 'success' : kb.status === 'indexing' ? 'warning' : 'error'} />
                      <Text size="sm" type="primary">{kb.name || kb.id}</Text>
                    </div>
                    <Text size="sm" type="tertiary">{kb.documents || 0} 文档</Text>
                  </div>
                ))}
              </div>
            </CardContent>
          </UICard>
        </div>

        {/* 底部区域：知识库列表 */}
        <div className="flex-1 min-h-0">
          <UICard className="h-full">
            <CardHeader 
              title="知识库列表"
              action={
                <div className="flex items-center space-x-2">
                  <Select
                    size="small"
                    value={filterStatus}
                    onChange={setFilterStatus}
                    options={[
                      { value: 'all', label: '全部' },
                      { value: 'active', label: '活跃' },
                      { value: 'indexing', label: '索引中' },
                      { value: 'error', label: '错误' }
                    ]}
                  />
                  <Button type="primary" size="small">创建知识库</Button>
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
                          status={status === 'active' ? 'success' : status === 'indexing' ? 'warning' : 'error'}
                        />
                      )
                    },
                    { title: '名称', dataIndex: 'name', width: 120, render: (name: string, record: KB) => name || record.id },
                    { 
                      title: '文档数', 
                      dataIndex: 'documents', 
                      width: 80,
                      render: (value: number) => formatNumber(value)
                    },
                    { 
                      title: '存储大小', 
                      dataIndex: 'size', 
                      width: 80,
                      render: (value: number) => `${value}MB`
                    },
                    { 
                      title: '搜索次数', 
                      dataIndex: 'search_count', 
                      width: 80,
                      render: (value: number) => formatNumber(value)
                    },
                    { 
                      title: '最后更新', 
                      dataIndex: 'last_updated', 
                      width: 100,
                      render: (value: string) => new Date(value).toLocaleDateString()
                    },
                    { 
                      title: '操作', 
                      width: 120,
                      render: (_, record: KB) => (
                        <Space size="small">
                          <Button size="small" onClick={() => ingest(record.id, '示例文本 Example text for ingest.')}>Ingest</Button>
                          <Button size="small" type="link">搜索</Button>
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


