/**
 * 设计系统展示页面
 */

"use client"

import React, { useState } from 'react'
import { 
  PageLayout, 
  Card, 
  CardHeader, 
  CardContent,
  Button,
  Input,
  SearchInput,
  TextArea,
  Title,
  Subtitle,
  Text,
  Paragraph,
  Label,
  NumberDisplay,
  StatCard,
  StatusIndicator,
  SkeletonLoader,
  EmptyState,
  ErrorState,
  LoadingState,
  ResponsiveGrid,
  Container
} from '../../components/ui'

export default function DesignSystemPage() {
  const [inputValue, setInputValue] = useState('')
  const [textareaValue, setTextareaValue] = useState('')

  return (
    <PageLayout 
      title="设计系统" 
      subtitle="展示所有设计系统组件和样式规范"
    >
      <div className="space-y-8">
        {/* 色板展示 */}
        <Card>
          <CardHeader title="色板系统" />
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Text size="sm" type="tertiary">背景层级</Text>
                <div className="space-y-1">
                  <div className="h-8 bg-[var(--color-bg-1)] border border-[var(--color-border-1)] rounded flex items-center px-2">
                    <Text size="xs">bg-1</Text>
                  </div>
                  <div className="h-8 bg-[var(--color-bg-2)] border border-[var(--color-border-1)] rounded flex items-center px-2">
                    <Text size="xs">bg-2</Text>
                  </div>
                  <div className="h-8 bg-[var(--color-bg-3)] border border-[var(--color-border-1)] rounded flex items-center px-2">
                    <Text size="xs">bg-3</Text>
                  </div>
                  <div className="h-8 bg-[var(--color-bg-4)] border border-[var(--color-border-1)] rounded flex items-center px-2">
                    <Text size="xs">bg-4</Text>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Text size="sm" type="tertiary">文本层级</Text>
                <div className="space-y-1">
                  <Text type="primary" size="sm">text-1 主标题</Text>
                  <Text type="secondary" size="sm">text-2 副标题</Text>
                  <Text type="tertiary" size="sm">text-3 描述文本</Text>
                  <Text type="quaternary" size="sm">text-4 辅助文本</Text>
                </div>
              </div>
              
              <div className="space-y-2">
                <Text size="sm" type="tertiary">主色调</Text>
                <div className="space-y-1">
                  <div className="h-8 bg-[var(--color-primary-500)] rounded flex items-center px-2">
                    <Text size="xs" className="text-white">Primary</Text>
                  </div>
                  <div className="h-8 bg-[var(--color-semantic-success)] rounded flex items-center px-2">
                    <Text size="xs" className="text-white">Success</Text>
                  </div>
                  <div className="h-8 bg-[var(--color-semantic-warning)] rounded flex items-center px-2">
                    <Text size="xs" className="text-white">Warning</Text>
                  </div>
                  <div className="h-8 bg-[var(--color-semantic-error)] rounded flex items-center px-2">
                    <Text size="xs" className="text-white">Error</Text>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Text size="sm" type="tertiary">状态指示器</Text>
                <div className="space-y-2">
                  <StatusIndicator status="success" text="成功" />
                  <StatusIndicator status="warning" text="警告" />
                  <StatusIndicator status="error" text="错误" />
                  <StatusIndicator status="info" text="信息" />
                  <StatusIndicator status="pending" text="等待" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 排版系统 */}
        <Card>
          <CardHeader title="排版系统" />
          <CardContent>
            <div className="space-y-4">
              <div>
                <Title level={1}>主标题 H1</Title>
                <Title level={2}>副标题 H2</Title>
                <Title level={3}>小标题 H3</Title>
                <Subtitle>副标题文本</Subtitle>
              </div>
              
              <div className="space-y-2">
                <Paragraph type="primary">
                  这是主要段落文本，用于描述重要信息。Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </Paragraph>
                <Paragraph type="secondary">
                  这是次要段落文本，用于补充说明。Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </Paragraph>
                <Paragraph type="tertiary">
                  这是辅助段落文本，用于提供额外信息。Ut enim ad minim veniam, quis nostrud exercitation.
                </Paragraph>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Label type="default">默认标签</Label>
                <Label type="primary">主要标签</Label>
                <Label type="success">成功标签</Label>
                <Label type="warning">警告标签</Label>
                <Label type="error">错误标签</Label>
                <Label type="info">信息标签</Label>
              </div>
              
              <div className="space-y-2">
                <NumberDisplay value={1234567} unit="次" compact />
                <NumberDisplay value={97.6} unit="%" precision={1} />
                <NumberDisplay value={1240} unit="ms" />
                <NumberDisplay value={123.45} unit="$" precision={2} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 按钮组件 */}
        <Card>
          <CardHeader title="按钮组件" />
          <CardContent>
            <div className="space-y-4">
              <div>
                <Text size="sm" type="tertiary" className="block mb-2">按钮变体</Text>
                <div className="flex flex-wrap gap-2">
                  <Button variant="primary">主要按钮</Button>
                  <Button variant="secondary">次要按钮</Button>
                  <Button variant="outline">轮廓按钮</Button>
                  <Button variant="ghost">幽灵按钮</Button>
                  <Button variant="link">链接按钮</Button>
                </div>
              </div>
              
              <div>
                <Text size="sm" type="tertiary" className="block mb-2">按钮尺寸</Text>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm">小按钮</Button>
                  <Button size="md">中按钮</Button>
                  <Button size="lg">大按钮</Button>
                </div>
              </div>
              
              <div>
                <Text size="sm" type="tertiary" className="block mb-2">按钮状态</Text>
                <div className="flex flex-wrap gap-2">
                  <Button>正常</Button>
                  <Button loading>加载中</Button>
                  <Button disabled>禁用</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 输入组件 */}
        <Card>
          <CardHeader title="输入组件" />
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Text size="sm" type="tertiary" className="block mb-2">基础输入框</Text>
                  <Input 
                    placeholder="请输入内容" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                </div>
                
                <div>
                  <Text size="sm" type="tertiary" className="block mb-2">搜索输入框</Text>
                  <SearchInput placeholder="搜索..." />
                </div>
                
                <div>
                  <Text size="sm" type="tertiary" className="block mb-2">密码输入框</Text>
                  <Input type="password" placeholder="请输入密码" />
                </div>
                
                <div>
                  <Text size="sm" type="tertiary" className="block mb-2">数字输入框</Text>
                  <Input type="number" placeholder="请输入数字" />
                </div>
              </div>
              
              <div>
                <Text size="sm" type="tertiary" className="block mb-2">文本域</Text>
                <TextArea 
                  placeholder="请输入多行文本..."
                  rows={4}
                  value={textareaValue}
                  onChange={(e) => setTextareaValue(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 统计卡片 */}
        <Card>
          <CardHeader title="统计卡片" />
          <CardContent>
            <ResponsiveGrid xs={1} sm={2} md={4} gap="md">
              <StatCard
                title="总请求数"
                value="12.3K"
                change={{ value: 12.5, type: 'increase' }}
                icon="📊"
              />
              <StatCard
                title="成功率"
                value="97.6%"
                change={{ value: 2.1, type: 'increase' }}
                icon="✅"
              />
              <StatCard
                title="平均延迟"
                value="1.2s"
                change={{ value: 5.2, type: 'decrease' }}
                icon="⚡"
              />
              <StatCard
                title="本月成本"
                value="$123.45"
                change={{ value: 8.3, type: 'increase' }}
                icon="💰"
              />
            </ResponsiveGrid>
          </CardContent>
        </Card>

        {/* 状态组件 */}
        <Card>
          <CardHeader title="状态组件" />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Text size="sm" type="tertiary" className="block mb-2">骨架屏</Text>
                <SkeletonLoader variant="text" rows={3} />
              </div>
              
              <div>
                <Text size="sm" type="tertiary" className="block mb-2">空状态</Text>
                <EmptyState
                  title="暂无数据"
                  description="当前没有可显示的内容"
                  action={<Button size="sm">刷新</Button>}
                />
              </div>
              
              <div>
                <Text size="sm" type="tertiary" className="block mb-2">错误状态</Text>
                <ErrorState
                  title="加载失败"
                  description="数据加载出现错误"
                  action={<Button size="sm">重试</Button>}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 响应式布局 */}
        <Card>
          <CardHeader title="响应式布局" />
          <CardContent>
            <div className="space-y-4">
              <Text size="sm" type="tertiary">
                在不同屏幕尺寸下，网格会自动调整列数：
              </Text>
              <ResponsiveGrid xs={1} sm={2} md={3} lg={4} gap="md">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-20 bg-[var(--color-bg-2)] border border-[var(--color-border-1)] rounded flex items-center justify-center"
                  >
                    <Text size="sm">项目 {index + 1}</Text>
                  </div>
                ))}
              </ResponsiveGrid>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}
