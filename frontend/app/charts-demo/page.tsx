/**
 * 高级简约图表展示页面
 */

"use client"

import React from 'react'
import { PageLayout } from '../../components/ui/Layout'
import { Card, CardHeader, CardContent } from '../../components/ui/Card'
import { 
  LineChartComponent, 
  AreaChartComponent, 
  BarChartComponent, 
  PieChartComponent,
  StatChart 
} from '../../components/ui/Charts'
import { Title, Text } from '../../components/ui/Typography'

export default function ChartsDemoPage() {
  // 模拟数据
  const performanceData = [
    { name: '1月', value: 4000, success: 2400, error: 240 },
    { name: '2月', value: 3000, success: 1398, error: 221 },
    { name: '3月', value: 2000, success: 9800, error: 229 },
    { name: '4月', value: 2780, success: 3908, error: 200 },
    { name: '5月', value: 1890, success: 4800, error: 218 },
    { name: '6月', value: 2390, success: 3800, error: 250 },
  ]

  const trendData = [
    { name: '00:00', value: 24 },
    { name: '04:00', value: 18 },
    { name: '08:00', value: 35 },
    { name: '12:00', value: 42 },
    { name: '16:00', value: 38 },
    { name: '20:00', value: 28 },
  ]

  const costData = [
    { name: '1月', value: 1200 },
    { name: '2月', value: 1900 },
    { name: '3月', value: 3000 },
    { name: '4月', value: 2800 },
    { name: '5月', value: 1890 },
    { name: '6月', value: 2390 },
  ]

  const pieData = [
    { name: '成功', value: 85, color: 'var(--color-semantic-success)' },
    { name: '警告', value: 10, color: 'var(--color-semantic-warning)' },
    { name: '错误', value: 5, color: 'var(--color-semantic-error)' },
  ]

  const statData = [
    {
      title: '总请求数',
      value: '12.3K',
      change: { value: 12.5, type: 'increase' as const },
      chartData: trendData,
      chartType: 'area' as const,
    },
    {
      title: '成功率',
      value: '97.6%',
      change: { value: 2.1, type: 'increase' as const },
      chartData: trendData.map(d => ({ ...d, value: Math.random() * 10 + 90 })),
      chartType: 'line' as const,
    },
    {
      title: '平均延迟',
      value: '1.2s',
      change: { value: 5.2, type: 'decrease' as const },
      chartData: trendData.map(d => ({ ...d, value: Math.random() * 2 + 0.5 })),
      chartType: 'area' as const,
    },
    {
      title: '本月成本',
      value: '$123.45',
      change: { value: 8.3, type: 'increase' as const },
      chartData: costData,
      chartType: 'bar' as const,
    },
  ]

  return (
    <PageLayout title="图表展示" subtitle="高级简约大气的数据可视化">
      <div className="space-y-6">
        {/* 统计卡片图表 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {statData.map((stat, index) => (
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

        {/* 主要图表区域 */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* 性能趋势图 */}
          <div className="xl:col-span-2">
            <Card>
              <CardHeader title="性能趋势" />
              <CardContent>
                <AreaChartComponent
                  data={performanceData}
                  height={300}
                  areas={[
                    { dataKey: 'value', name: '总请求', color: 'var(--color-primary-500)', fillOpacity: 0.1 },
                    { dataKey: 'success', name: '成功请求', color: 'var(--color-semantic-success)', fillOpacity: 0.1 },
                  ]}
                />
              </CardContent>
            </Card>
          </div>

          {/* 状态分布饼图 */}
          <div>
            <Card>
              <CardHeader title="状态分布" />
              <CardContent>
                <PieChartComponent
                  data={pieData}
                  height={300}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 详细分析图表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 错误趋势 */}
          <Card>
            <CardHeader title="错误趋势" />
            <CardContent>
              <LineChartComponent
                data={performanceData}
                height={250}
                lines={[
                  { dataKey: 'error', name: '错误数', color: 'var(--color-semantic-error)', strokeWidth: 2 }
                ]}
              />
            </CardContent>
          </Card>

          {/* 成本分析 */}
          <Card>
            <CardHeader title="成本分析" />
            <CardContent>
              <BarChartComponent
                data={costData}
                height={250}
                bars={[
                  { dataKey: 'value', name: '成本 ($)', color: 'var(--color-primary-500)' }
                ]}
              />
            </CardContent>
          </Card>
        </div>

        {/* 实时监控图表 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader title="实时请求" />
            <CardContent>
              <AreaChartComponent
                data={trendData}
                height={200}
                areas={[
                  { dataKey: 'value', name: '请求数', color: 'var(--color-primary-500)', fillOpacity: 0.2 }
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="响应时间" />
            <CardContent>
              <LineChartComponent
                data={trendData.map(d => ({ ...d, value: Math.random() * 1000 + 200 }))}
                height={200}
                lines={[
                  { dataKey: 'value', name: '响应时间 (ms)', color: 'var(--color-semantic-warning)', strokeWidth: 2 }
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="吞吐量" />
            <CardContent>
              <BarChartComponent
                data={trendData.map(d => ({ ...d, value: Math.random() * 100 + 50 }))}
                height={200}
                bars={[
                  { dataKey: 'value', name: '吞吐量 (req/s)', color: 'var(--color-semantic-success)' }
                ]}
              />
            </CardContent>
          </Card>
        </div>

        {/* 高级分析面板 */}
        <Card>
          <CardHeader title="高级分析" />
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <Text type="primary" size="lg" weight="semibold" className="block mb-4">
                  多维度性能分析
                </Text>
                <LineChartComponent
                  data={performanceData}
                  height={250}
                  lines={[
                    { dataKey: 'value', name: '总请求', color: 'var(--color-primary-500)', strokeWidth: 2 },
                    { dataKey: 'success', name: '成功', color: 'var(--color-semantic-success)', strokeWidth: 2 },
                    { dataKey: 'error', name: '错误', color: 'var(--color-semantic-error)', strokeWidth: 2 },
                  ]}
                />
              </div>
              
              <div>
                <Text type="primary" size="lg" weight="semibold" className="block mb-4">
                  成本效益分析
                </Text>
                <AreaChartComponent
                  data={costData.map((d, i) => ({
                    ...d,
                    cost: d.value,
                    efficiency: performanceData[i]?.value / d.value * 100 || 0
                  }))}
                  height={250}
                  areas={[
                    { dataKey: 'cost', name: '成本 ($)', color: 'var(--color-primary-500)', fillOpacity: 0.1 },
                    { dataKey: 'efficiency', name: '效率 (%)', color: 'var(--color-semantic-success)', fillOpacity: 0.1 },
                  ]}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}
