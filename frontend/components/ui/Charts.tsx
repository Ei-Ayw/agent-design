"use client"

import React from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { Card, CardHeader, CardContent } from './Card'
import { Text } from './Typography'

// 图表主题配置
const chartTheme = {
  colors: {
    primary: 'var(--color-primary-500)',
    success: 'var(--color-semantic-success)',
    warning: 'var(--color-semantic-warning)',
    error: 'var(--color-semantic-error)',
    info: 'var(--color-semantic-info)',
    gradient: {
      from: 'var(--color-primary-500)',
      to: 'var(--color-primary-300)',
    }
  },
  grid: {
    stroke: 'var(--color-border-2)',
    strokeDasharray: '3 3',
  },
  axis: {
    stroke: 'var(--color-text-4)',
    fontSize: 12,
  },
  tooltip: {
    backgroundColor: 'var(--color-bg-3)',
    border: '1px solid var(--color-border-1)',
    borderRadius: '8px',
    color: 'var(--color-text-1)',
  }
}

// 自定义 Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div 
        style={{
          backgroundColor: chartTheme.tooltip.backgroundColor,
          border: chartTheme.tooltip.border,
          borderRadius: chartTheme.tooltip.borderRadius,
          padding: '12px',
          boxShadow: 'var(--color-shadow-2)',
        }}
      >
        <Text size="sm" type="primary" className="block mb-2">
          {label}
        </Text>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              style={{
                width: '8px',
                height: '8px',
                backgroundColor: entry.color,
                borderRadius: '50%',
              }}
            />
            <span style={{ color: chartTheme.tooltip.color, fontSize: '14px' }}>
              {entry.name}: {entry.value}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

// 折线图组件
export interface LineChartProps {
  data: any[]
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  lines?: Array<{
    dataKey: string
    name: string
    color?: string
    strokeWidth?: number
  }>
  className?: string
}

export function LineChartComponent({
  data,
  height = 300,
  showGrid = true,
  showLegend = false,
  lines = [
    { dataKey: 'value', name: '数值', color: chartTheme.colors.primary, strokeWidth: 2 }
  ],
  className
}: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        {showGrid && (
          <CartesianGrid 
            strokeDasharray={chartTheme.grid.strokeDasharray} 
            stroke={chartTheme.grid.stroke}
          />
        )}
        <XAxis 
          dataKey="name" 
          stroke={chartTheme.axis.stroke}
          fontSize={chartTheme.axis.fontSize}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          stroke={chartTheme.axis.stroke}
          fontSize={chartTheme.axis.fontSize}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        {showLegend && <Legend />}
        {lines.map((line, index) => (
          <Line
            key={index}
            type="monotone"
            dataKey={line.dataKey}
            name={line.name}
            stroke={line.color || chartTheme.colors.primary}
            strokeWidth={line.strokeWidth || 2}
            dot={{ fill: line.color || chartTheme.colors.primary, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: line.color || chartTheme.colors.primary, strokeWidth: 2 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

// 面积图组件
export interface AreaChartProps {
  data: any[]
  height?: number
  showGrid?: boolean
  areas?: Array<{
    dataKey: string
    name: string
    color?: string
    fillOpacity?: number
  }>
  className?: string
}

export function AreaChartComponent({
  data,
  height = 300,
  showGrid = true,
  areas = [
    { dataKey: 'value', name: '数值', color: chartTheme.colors.primary, fillOpacity: 0.1 }
  ],
  className
}: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <defs>
          {areas.map((area, index) => (
            <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={area.color || chartTheme.colors.primary} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={area.color || chartTheme.colors.primary} stopOpacity={0}/>
            </linearGradient>
          ))}
        </defs>
        {showGrid && (
          <CartesianGrid 
            strokeDasharray={chartTheme.grid.strokeDasharray} 
            stroke={chartTheme.grid.stroke}
          />
        )}
        <XAxis 
          dataKey="name" 
          stroke={chartTheme.axis.stroke}
          fontSize={chartTheme.axis.fontSize}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          stroke={chartTheme.axis.stroke}
          fontSize={chartTheme.axis.fontSize}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        {areas.map((area, index) => (
          <Area
            key={index}
            type="monotone"
            dataKey={area.dataKey}
            name={area.name}
            stroke={area.color || chartTheme.colors.primary}
            fill={`url(#gradient-${index})`}
            strokeWidth={2}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}

// 柱状图组件
export interface BarChartProps {
  data: any[]
  height?: number
  showGrid?: boolean
  bars?: Array<{
    dataKey: string
    name: string
    color?: string
  }>
  className?: string
}

export function BarChartComponent({
  data,
  height = 300,
  showGrid = true,
  bars = [
    { dataKey: 'value', name: '数值', color: chartTheme.colors.primary }
  ],
  className
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        {showGrid && (
          <CartesianGrid 
            strokeDasharray={chartTheme.grid.strokeDasharray} 
            stroke={chartTheme.grid.stroke}
          />
        )}
        <XAxis 
          dataKey="name" 
          stroke={chartTheme.axis.stroke}
          fontSize={chartTheme.axis.fontSize}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          stroke={chartTheme.axis.stroke}
          fontSize={chartTheme.axis.fontSize}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        {bars.map((bar, index) => (
          <Bar
            key={index}
            dataKey={bar.dataKey}
            name={bar.name}
            fill={bar.color || chartTheme.colors.primary}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

// 饼图组件
export interface PieChartProps {
  data: Array<{
    name: string
    value: number
    color?: string
  }>
  height?: number
  showLegend?: boolean
  className?: string
}

export function PieChartComponent({
  data,
  height = 300,
  showLegend = true,
  className
}: PieChartProps) {
  const colors = [
    chartTheme.colors.primary,
    chartTheme.colors.success,
    chartTheme.colors.warning,
    chartTheme.colors.error,
    chartTheme.colors.info,
  ]

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        {showLegend && <Legend />}
      </PieChart>
    </ResponsiveContainer>
  )
}

// 统计卡片图表组件
export interface StatChartProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease' | 'neutral'
  }
  chartData?: any[]
  chartType?: 'line' | 'area' | 'bar'
  height?: number
  className?: string
}

export function StatChart({
  title,
  value,
  change,
  chartData = [],
  chartType = 'area',
  height = 60,
  className
}: StatChartProps) {
  const getChangeColor = (type: string) => {
    switch (type) {
      case 'increase':
        return 'var(--color-semantic-success)'
      case 'decrease':
        return 'var(--color-semantic-error)'
      default:
        return 'var(--color-text-3)'
    }
  }

  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'increase':
        return '↗'
      case 'decrease':
        return '↘'
      default:
        return '→'
    }
  }

  const renderChart = () => {
    if (!chartData.length) return null

    switch (chartType) {
      case 'line':
        return (
          <LineChartComponent
            data={chartData}
            height={height}
            showGrid={false}
            showLegend={false}
            lines={[{ dataKey: 'value', name: title, strokeWidth: 1.5 }]}
          />
        )
      case 'area':
        return (
          <AreaChartComponent
            data={chartData}
            height={height}
            showGrid={false}
            areas={[{ dataKey: 'value', name: title, fillOpacity: 0.1 }]}
          />
        )
      case 'bar':
        return (
          <BarChartComponent
            data={chartData}
            height={height}
            showGrid={false}
            bars={[{ dataKey: 'value', name: title }]}
          />
        )
      default:
        return null
    }
  }

  return (
    <Card className={className}>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Text size="sm" type="tertiary" className="block mb-1">
                {title}
              </Text>
              <Text size="lg" type="primary" weight="bold" className="block mb-2">
                {value}
              </Text>
              {change && (
                <div className="flex items-center space-x-1">
                  <span style={{ color: getChangeColor(change.type) }}>
                    {getChangeIcon(change.type)}
                  </span>
                  <span style={{ color: getChangeColor(change.type), fontSize: '14px' }}>
                    {Math.abs(change.value)}%
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {chartData && chartData.length > 0 && (
            <div className="h-8 -mx-6 -mb-6">
              {renderChart()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
