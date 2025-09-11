/**
 * 文件作用：重构首页仪表盘（指标卡/趋势图位/最近运行/告警）。
 */

"use client"

import React, { useEffect, useState } from 'react'
import { Select, Table, Tag } from 'antd'
import { PageLayout } from '../components/ui/Layout'
import { Card, StatCard, CardHeader, CardContent } from '../components/ui/Card'
import { Title, Text, NumberDisplay } from '../components/ui/Typography'
import { StatusIndicator } from '../components/ui/Status'
import { StatChart, AreaChartComponent, LineChartComponent } from '../components/ui/Charts'
import { formatNumber, formatTime } from '../lib/utils'

export default function HomePage() {
  const [range, setRange] = useState<'1h' | '24h' | '7d'>('24h')
  const [recent, setRecent] = useState<any[]>([])

  // 模拟数据
  const performanceData = [
    { name: '00:00', value: 24, success: 23, error: 1 },
    { name: '04:00', value: 18, success: 17, error: 1 },
    { name: '08:00', value: 35, success: 34, error: 1 },
    { name: '12:00', value: 42, success: 41, error: 1 },
    { name: '16:00', value: 38, success: 37, error: 1 },
    { name: '20:00', value: 28, success: 27, error: 1 },
  ]

  const costData = [
    { name: '1月', value: 1200 },
    { name: '2月', value: 1900 },
    { name: '3月', value: 3000 },
    { name: '4月', value: 2800 },
    { name: '5月', value: 1890 },
    { name: '6月', value: 2390 },
  ]

  const errorTrendData = [
    { name: '00:00', errors: 2, warnings: 5 },
    { name: '04:00', errors: 1, warnings: 3 },
    { name: '08:00', errors: 3, warnings: 8 },
    { name: '12:00', errors: 1, warnings: 4 },
    { name: '16:00', errors: 2, warnings: 6 },
    { name: '20:00', errors: 1, warnings: 2 },
  ]

  const agentPerformanceData = [
    { name: 'GPT-4', requests: 1200, success: 98.5, latency: 1.2 },
    { name: 'Claude-3', requests: 800, success: 97.8, latency: 1.5 },
    { name: 'Gemini', requests: 600, success: 96.2, latency: 2.1 },
    { name: 'Llama-2', requests: 400, success: 94.5, latency: 3.2 },
  ]

  // 模拟最近运行数据
  const mockRecentRuns = [
    { id: 1, type: 'Agent', name: '客服助手', status: 'ok', latency: '1.2s', ts: '2024-01-15 14:30:25' },
    { id: 2, type: 'Workflow', name: '文档处理流程', status: 'ok', latency: '3.5s', ts: '2024-01-15 14:28:15' },
    { id: 3, type: 'Tool', name: '天气查询', status: 'pending', latency: '0.8s', ts: '2024-01-15 14:25:42' },
    { id: 4, type: 'Agent', name: '代码审查', status: 'error', latency: '2.1s', ts: '2024-01-15 14:22:18' },
    { id: 5, type: 'Workflow', name: '数据分析', status: 'ok', latency: '5.2s', ts: '2024-01-15 14:20:05' },
    { id: 6, type: 'Tool', name: '翻译服务', status: 'ok', latency: '0.9s', ts: '2024-01-15 14:18:33' },
  ]

  const stats = [
    {
      title: '请求数',
      value: formatNumber(12345, { compact: true }),
      change: { value: 12.5, type: 'increase' as const },
      chartData: performanceData,
      chartType: 'area' as const,
    },
    {
      title: '成功率',
      value: '97.6%',
      change: { value: 2.1, type: 'increase' as const },
      chartData: performanceData.map(d => ({ ...d, value: Math.random() * 5 + 95 })),
      chartType: 'line' as const,
    },
    {
      title: 'P95 延迟',
      value: formatTime(1240),
      change: { value: 5.2, type: 'decrease' as const },
      // 移除图表，只显示数值
    },
    {
      title: '本月成本',
      value: '$123.45',
      change: { value: 8.3, type: 'increase' as const },
      // 移除图表，只显示数值
    }
  ]

  const alerts = [
    { type: 'DLP', message: 'DLP 命中（会话 123，已拦截）', status: 'warning' },
    { type: '权限', message: '工具越权（用户 A，已阻断）', status: 'error' },
    { type: '配额', message: 'API 配额即将用完', status: 'info' }
  ]

  useEffect(() => {
    // 模拟数据加载
    setRecent(mockRecentRuns)
  }, [])

  return (
    <PageLayout>
      <div className="space-y-1">
        {/* 顶部区域：统计卡片 + 图表 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-1">
          {/* 左侧：统计卡片 */}
          <div className="lg:col-span-1">
            <div className="grid grid-cols-2 gap-1">
              {stats.map((stat, index) => (
                <StatChart
                  key={index}
                  title={stat.title}
                  value={stat.value}
                  change={stat.change}
                  chartData={stat.chartData}
                  chartType={stat.chartType}
                />
              ))}
            </div>
          </div>

          {/* 右侧：图表区域 */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 h-full">
              <Card>
                <CardHeader
                  title="性能趋势"
                  action={
                    <Select
                      size="small"
                      value={range}
                      onChange={v => setRange(v)}
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
                    height={100}
                    areas={[
                      { dataKey: 'value', name: '总请求', color: 'var(--color-primary-500)', fillOpacity: 0.1 },
                      { dataKey: 'success', name: '成功请求', color: 'var(--color-semantic-success)', fillOpacity: 0.1 },
                    ]}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader title="错误趋势" />
                <CardContent>
                  <LineChartComponent
                    data={errorTrendData}
                    height={100}
                    lines={[
                      { dataKey: 'errors', name: '错误数', color: 'var(--color-semantic-error)', strokeWidth: 2 },
                      { dataKey: 'warnings', name: '警告数', color: 'var(--color-semantic-warning)', strokeWidth: 2 },
                    ]}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* 中间区域：Agent性能 + 快速操作 + 系统状态 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-1">
          <Card>
            <CardHeader title="Agent 性能" />
            <CardContent>
              <div className="grid grid-cols-2 gap-1">
                {agentPerformanceData.map((agent, index) => (
                  <div key={index} className="p-1 border border-[var(--color-border-1)] rounded">
                    <div className="flex items-center justify-between mb-1">
                      <Text size="sm" type="primary" weight="semibold">
                        {agent.name}
                      </Text>
                      <StatusIndicator 
                        status={agent.success > 97 ? 'success' : agent.success > 95 ? 'warning' : 'error'} 
                      />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex justify-between">
                        <Text size="sm" type="secondary">请求</Text>
                        <Text size="sm" type="primary">{formatNumber(agent.requests)}</Text>
                      </div>
                      <div className="flex justify-between">
                        <Text size="sm" type="secondary">成功率</Text>
                        <Text size="sm" type="primary">{agent.success}%</Text>
                      </div>
                      <div className="flex justify-between">
                        <Text size="sm" type="secondary">延迟</Text>
                        <Text size="sm" type="primary">{agent.latency}s</Text>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
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
                    <Text size="sm" type="primary">运行工作流</Text>
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
                    <Text size="sm" type="primary">查看报告</Text>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="系统状态" />
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
                <div className="flex items-center justify-between">
                  <Text size="sm" type="secondary">用户</Text>
                  <Text size="sm" type="primary">1,234</Text>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
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
          </Card>
        </div>


        {/* 底部区域：最近运行 + 告警 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-1">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader title="最近运行" />
              <CardContent>
                <Table
                  rowKey="id"
                  size="small"
                  dataSource={recent}
                  pagination={false}
                  scroll={{ y: 80 }}
                  columns={[
                    { title: '类型', dataIndex: 'type', width: 50 },
                    { title: '名称', dataIndex: 'name', width: 80 },
                    { 
                      title: '状态', 
                      dataIndex: 'status', 
                      width: 50,
                      render: (status: string) => (
                        <StatusIndicator 
                          status={status === 'ok' ? 'success' : status === 'pending' ? 'warning' : 'error'}
                          text={status}
                        />
                      )
                    },
                    { title: '耗时', dataIndex: 'latency', width: 50 },
                    { title: '时间', dataIndex: 'ts', width: 100 }
                  ]}
                />
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader title="告警/拦截" />
              <CardContent>
                <div className="space-y-1">
                  {alerts.map((alert, index) => (
                    <div key={index} className="flex items-start space-x-1">
                      <StatusIndicator status={alert.status as any} />
                      <div className="flex-1">
                        <Text size="sm" type="tertiary">
                          {alert.type}
                        </Text>
                        <Text size="sm" className="block">
                          {alert.message}
                        </Text>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}


