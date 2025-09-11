/**
 * 文件作用：观测与计费页，对接 /usage、/costs 并提供 /metrics 链接。
 */

"use client"

import React, { useEffect, useState } from 'react'
import { Card, Descriptions, Space, Button, Select } from 'antd'
import { PageLayout } from '../../components/ui/Layout'
import { Card as UICard, CardHeader, CardContent } from '../../components/ui/Card'
import { Title, Text, NumberDisplay } from '../../components/ui/Typography'
import { StatusIndicator } from '../../components/ui/Status'
import { StatChart, AreaChartComponent, LineChartComponent } from '../../components/ui/Charts'
import { formatNumber, formatTime } from '../../lib/utils'

const API = 'http://localhost:8000'

export default function ObservabilityPage() {
  const [usage, setUsage] = useState<any>({})
  const [costs, setCosts] = useState<any>({})
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h')

  // 模拟数据
  const observabilityStats = [
    {
      title: '总请求数',
      value: formatNumber(usage.requests || 12345),
      change: { value: 15.2, type: 'increase' as const },
    },
    {
      title: '总 Token 数',
      value: formatNumber(usage.tokens || 2345678),
      change: { value: 8.7, type: 'increase' as const },
    },
    {
      title: '本月成本',
      value: `$${costs.usd_month || 123.45}`,
      change: { value: 12.3, type: 'increase' as const },
    },
    {
      title: '平均延迟',
      value: formatTime(1240),
      change: { value: 5.2, type: 'decrease' as const },
    }
  ]

  const costTrendData = [
    { name: '1月', cost: 1200, tokens: 120000 },
    { name: '2月', cost: 1900, tokens: 190000 },
    { name: '3月', cost: 3000, tokens: 300000 },
    { name: '4月', cost: 2800, tokens: 280000 },
    { name: '5月', cost: 1890, tokens: 189000 },
    { name: '6月', cost: 2390, tokens: 239000 },
  ]

  const usageByService = [
    { name: 'GPT-4', requests: 45, cost: 1200, tokens: 120000 },
    { name: 'Claude-3', requests: 30, cost: 800, tokens: 80000 },
    { name: 'Gemini', requests: 15, cost: 400, tokens: 40000 },
    { name: 'Llama-2', requests: 10, cost: 200, tokens: 20000 },
  ]

  const errorTrendData = [
    { name: '00:00', errors: 2, warnings: 5 },
    { name: '04:00', errors: 1, warnings: 3 },
    { name: '08:00', errors: 3, warnings: 8 },
    { name: '12:00', errors: 1, warnings: 4 },
    { name: '16:00', errors: 2, warnings: 6 },
    { name: '20:00', errors: 1, warnings: 2 },
  ]

  useEffect(() => {
    fetch(`${API}/usage`).then(r => r.json()).then(setUsage)
    fetch(`${API}/costs`).then(r => r.json()).then(setCosts)
  }, [])

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
                  {observabilityStats.map((stat, index) => (
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
                  title="成本趋势"
                  action={
                    <Select
                      size="small"
                      value={timeRange}
                      onChange={v => setTimeRange(v)}
                      options={[
                        { value: '1h', label: '1小时' },
                        { value: '24h', label: '24小时' },
                        { value: '7d', label: '7天' },
                        { value: '30d', label: '30天' }
                      ]}
                    />
                  }
                />
                <CardContent>
                  <AreaChartComponent
                    data={costTrendData}
                    height={160}
                    areas={[
                      { dataKey: 'cost', name: '成本', color: 'var(--color-semantic-warning)', fillOpacity: 0.1 },
                      { dataKey: 'tokens', name: 'Token 数', color: 'var(--color-primary-500)', fillOpacity: 0.1 },
                    ]}
                  />
                </CardContent>
              </UICard>

              <UICard>
                <CardHeader title="服务使用分布" />
                <CardContent>
                  <div className="space-y-2">
                    {usageByService.map((service, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full" style={{
                            backgroundColor: ['var(--color-primary-500)', 'var(--color-semantic-success)', 'var(--color-semantic-warning)', 'var(--color-semantic-error)'][index]
                          }}></div>
                          <Text size="sm" type="primary">{service.name}</Text>
                        </div>
                        <div className="text-right">
                          <Text size="sm" type="primary" weight="semibold">${service.cost}</Text>
                          <Text size="sm" type="tertiary" className="block">{formatNumber(service.requests)} 请求</Text>
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
                    <div className="text-sm mb-1">📊</div>
                    <Text size="sm" type="primary">导出报告</Text>
                  </div>
                </button>
                <button className="p-1 border border-[var(--color-border-1)] rounded hover:bg-[var(--color-bg-2)] transition-colors">
                  <div className="text-center">
                    <div className="text-sm mb-1">💰</div>
                    <Text size="sm" type="primary">成本分析</Text>
                  </div>
                </button>
                <button className="p-1 border border-[var(--color-border-1)] rounded hover:bg-[var(--color-bg-2)] transition-colors">
                  <div className="text-center">
                    <div className="text-sm mb-1">🔍</div>
                    <Text size="sm" type="primary">性能监控</Text>
                  </div>
                </button>
                <button className="p-1 border border-[var(--color-border-1)] rounded hover:bg-[var(--color-bg-2)] transition-colors">
                  <div className="text-center">
                    <div className="text-sm mb-1">⚙️</div>
                    <Text size="sm" type="primary">告警设置</Text>
                  </div>
                </button>
              </div>
            </CardContent>
          </UICard>

          <UICard>
            <CardHeader title="系统健康" />
            <CardContent>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <StatusIndicator status="success" />
                    <Text size="sm" type="secondary">API 服务</Text>
                  </div>
                  <Text size="sm" type="primary">99.9%</Text>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <StatusIndicator status="success" />
                    <Text size="sm" type="secondary">数据库</Text>
                  </div>
                  <Text size="sm" type="primary">99.8%</Text>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <StatusIndicator status="warning" />
                    <Text size="sm" type="secondary">缓存服务</Text>
                  </div>
                  <Text size="sm" type="primary">98.5%</Text>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <StatusIndicator status="success" />
                    <Text size="sm" type="secondary">消息队列</Text>
                  </div>
                  <Text size="sm" type="primary">99.7%</Text>
                </div>
              </div>
            </CardContent>
          </UICard>

          <UICard>
            <CardHeader title="资源使用" />
            <CardContent>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Text size="sm" type="secondary">CPU</Text>
                  <div className="flex items-center space-x-1">
                    <div className="w-12 h-1.5 bg-[var(--color-bg-3)] rounded-full overflow-hidden">
                      <div className="w-3/4 h-full bg-[var(--color-semantic-success)] rounded-full"></div>
                    </div>
                    <Text size="sm" type="primary">75%</Text>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Text size="sm" type="secondary">内存</Text>
                  <div className="flex items-center space-x-1">
                    <div className="w-12 h-1.5 bg-[var(--color-bg-3)] rounded-full overflow-hidden">
                      <div className="w-1/2 h-full bg-[var(--color-semantic-warning)] rounded-full"></div>
                    </div>
                    <Text size="sm" type="primary">50%</Text>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Text size="sm" type="secondary">磁盘</Text>
                  <div className="flex items-center space-x-1">
                    <div className="w-12 h-1.5 bg-[var(--color-bg-3)] rounded-full overflow-hidden">
                      <div className="w-1/3 h-full bg-[var(--color-semantic-success)] rounded-full"></div>
                    </div>
                    <Text size="sm" type="primary">30%</Text>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Text size="sm" type="secondary">网络</Text>
                  <Text size="sm" type="primary">12ms</Text>
                </div>
              </div>
            </CardContent>
          </UICard>

          <UICard>
            <CardHeader title="实时监控" />
            <CardContent>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Text size="sm" type="secondary">活跃会话</Text>
                  <Text size="sm" type="primary">156</Text>
                </div>
                <div className="flex items-center justify-between">
                  <Text size="sm" type="secondary">队列长度</Text>
                  <Text size="sm" type="primary">23</Text>
                </div>
                <div className="flex items-center justify-between">
                  <Text size="sm" type="secondary">错误率</Text>
                  <Text size="sm" type="primary">0.2%</Text>
                </div>
                <div className="flex items-center justify-between">
                  <Text size="sm" type="secondary">响应时间</Text>
                  <Text size="sm" type="primary">1.2s</Text>
                </div>
                <div className="flex items-center justify-between">
                  <Text size="sm" type="secondary">吞吐量</Text>
                  <Text size="sm" type="primary">1.2K/s</Text>
                </div>
              </div>
            </CardContent>
          </UICard>
        </div>

        {/* 底部区域：详细数据 + 错误趋势 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 flex-1 min-h-0">
          <UICard className="h-full">
            <CardHeader title="使用详情" />
            <CardContent className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 min-h-0">
                <Descriptions bordered size="small" column={1}>
                  <Descriptions.Item label="总请求数">{formatNumber(usage.requests || 12345)}</Descriptions.Item>
                  <Descriptions.Item label="总 Token 数">{formatNumber(usage.tokens || 2345678)}</Descriptions.Item>
                  <Descriptions.Item label="本月成本">${costs.usd_month || 123.45}</Descriptions.Item>
                  <Descriptions.Item label="平均延迟">{formatTime(1240)}</Descriptions.Item>
                  <Descriptions.Item label="成功率">97.6%</Descriptions.Item>
                  <Descriptions.Item label="活跃用户">1,234</Descriptions.Item>
                </Descriptions>
                <div className="mt-4">
                  <Button href={`${API}/metrics`} target="_blank" type="primary">
                    查看 Prometheus /metrics
                  </Button>
                </div>
              </div>
            </CardContent>
          </UICard>

          <UICard className="h-full">
            <CardHeader title="错误趋势" />
            <CardContent className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 min-h-0">
                <LineChartComponent
                  data={errorTrendData}
                  height={200}
                  lines={[
                    { dataKey: 'errors', name: '错误数', color: 'var(--color-semantic-error)', strokeWidth: 2 },
                    { dataKey: 'warnings', name: '警告数', color: 'var(--color-semantic-warning)', strokeWidth: 2 },
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


