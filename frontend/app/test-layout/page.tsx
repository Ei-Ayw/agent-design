/**
 * 布局测试页面
 */

"use client"

import React from 'react'
import { PageLayout } from '../../components/ui/Layout'
import { Card, CardHeader, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Title, Text } from '../../components/ui/Typography'

export default function TestLayoutPage() {
  return (
    <PageLayout title="布局测试" subtitle="验证 Tailwind CSS 和设计系统是否正常工作">
      <div className="space-y-6">
        {/* 基础网格测试 */}
        <Card>
          <CardHeader title="网格布局测试" />
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="h-20 bg-bg-2 border border-border-1 rounded-lg flex items-center justify-center"
                >
                  <Text size="sm">项目 {index + 1}</Text>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 按钮测试 */}
        <Card>
          <CardHeader title="按钮组件测试" />
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">主要按钮</Button>
              <Button variant="secondary">次要按钮</Button>
              <Button variant="outline">轮廓按钮</Button>
              <Button variant="ghost">幽灵按钮</Button>
              <Button variant="link">链接按钮</Button>
            </div>
          </CardContent>
        </Card>

        {/* 颜色测试 */}
        <Card>
          <CardHeader title="颜色系统测试" />
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Text size="sm" type="tertiary">背景层级</Text>
                <div className="h-8 bg-bg-1 border border-border-1 rounded flex items-center px-2">
                  <Text size="xs">bg-1</Text>
                </div>
                <div className="h-8 bg-bg-2 border border-border-1 rounded flex items-center px-2">
                  <Text size="xs">bg-2</Text>
                </div>
                <div className="h-8 bg-bg-3 border border-border-1 rounded flex items-center px-2">
                  <Text size="xs">bg-3</Text>
                </div>
                <div className="h-8 bg-bg-4 border border-border-1 rounded flex items-center px-2">
                  <Text size="xs">bg-4</Text>
                </div>
              </div>
              
              <div className="space-y-2">
                <Text size="sm" type="tertiary">文本层级</Text>
                <Text type="primary" size="sm">text-1 主标题</Text>
                <Text type="secondary" size="sm">text-2 副标题</Text>
                <Text type="tertiary" size="sm">text-3 描述文本</Text>
                <Text type="quaternary" size="sm">text-4 辅助文本</Text>
              </div>
              
              <div className="space-y-2">
                <Text size="sm" type="tertiary">主色调</Text>
                <div className="h-8 bg-primary-500 rounded flex items-center px-2">
                  <Text size="xs" className="text-white">Primary</Text>
                </div>
                <div className="h-8 bg-semantic-success rounded flex items-center px-2">
                  <Text size="xs" className="text-white">Success</Text>
                </div>
                <div className="h-8 bg-semantic-warning rounded flex items-center px-2">
                  <Text size="xs" className="text-white">Warning</Text>
                </div>
                <div className="h-8 bg-semantic-error rounded flex items-center px-2">
                  <Text size="xs" className="text-white">Error</Text>
                </div>
              </div>
              
              <div className="space-y-2">
                <Text size="sm" type="tertiary">响应式测试</Text>
                <div className="block sm:hidden">
                  <Text size="sm" type="success">移动端显示</Text>
                </div>
                <div className="hidden sm:block md:hidden">
                  <Text size="sm" type="secondary">平板端显示</Text>
                </div>
                <div className="hidden md:block">
                  <Text size="sm" type="warning">桌面端显示</Text>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 间距测试 */}
        <Card>
          <CardHeader title="间距系统测试" />
          <CardContent>
            <div className="space-y-4">
              <div className="p-xs bg-bg-2 rounded">
                <Text size="sm">xs 间距 (4px)</Text>
              </div>
              <div className="p-sm bg-bg-2 rounded">
                <Text size="sm">sm 间距 (8px)</Text>
              </div>
              <div className="p-md bg-bg-2 rounded">
                <Text size="sm">md 间距 (16px)</Text>
              </div>
              <div className="p-lg bg-bg-2 rounded">
                <Text size="sm">lg 间距 (24px)</Text>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}
