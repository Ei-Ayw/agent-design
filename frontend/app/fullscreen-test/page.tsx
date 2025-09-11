/**
 * 全屏响应式测试页面
 */

"use client"

import React from 'react'
import { PageLayout } from '../../components/ui/Layout'
import { Card, CardHeader, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Title, Text } from '../../components/ui/Typography'

export default function FullscreenTestPage() {
  return (
    <PageLayout title="全屏响应式测试" subtitle="充分利用浏览器全屏空间的布局">
      <div className="space-y-6">
        {/* 全宽网格布局 */}
        <Card>
          <CardHeader title="全宽网格布局" />
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, index) => (
                <div
                  key={index}
                  className="h-24 bg-bg-2 border border-border-1 rounded-lg flex items-center justify-center hover:bg-bg-3 transition-colors"
                >
                  <Text size="sm">卡片 {index + 1}</Text>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 响应式数据表格布局 */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <Card>
              <CardHeader title="数据表格区域" />
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-bg-2 rounded-lg border border-border-1"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                          <Text size="sm" className="text-white">{index + 1}</Text>
                        </div>
                        <div>
                          <Text type="primary" size="sm">数据项 {index + 1}</Text>
                          <Text type="tertiary" size="xs">描述信息</Text>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">查看</Button>
                        <Button size="sm" variant="primary">操作</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader title="侧边栏信息" />
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-bg-2 rounded-lg">
                    <Text type="primary" size="sm" className="block mb-2">统计信息</Text>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Text type="tertiary" size="xs">总数</Text>
                        <Text type="primary" size="sm">1,234</Text>
                      </div>
                      <div className="flex justify-between">
                        <Text type="tertiary" size="xs">活跃</Text>
                        <Text type="success" size="sm">856</Text>
                      </div>
                      <div className="flex justify-between">
                        <Text type="tertiary" size="xs">离线</Text>
                        <Text type="error" size="sm">378</Text>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-bg-2 rounded-lg">
                    <Text type="primary" size="sm" className="block mb-2">快速操作</Text>
                    <div className="space-y-2">
                      <Button size="sm" variant="primary" className="w-full">新建项目</Button>
                      <Button size="sm" variant="outline" className="w-full">导入数据</Button>
                      <Button size="sm" variant="outline" className="w-full">导出报告</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 响应式图表区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader title="图表 1" />
            <CardContent>
              <div className="h-64 bg-bg-2 rounded-lg flex items-center justify-center border border-border-1">
                <Text type="tertiary">图表占位区域</Text>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="图表 2" />
            <CardContent>
              <div className="h-64 bg-bg-2 rounded-lg flex items-center justify-center border border-border-1">
                <Text type="tertiary">图表占位区域</Text>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 全宽操作栏 */}
        <Card>
          <CardHeader title="全宽操作栏" />
          <CardContent>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <Button variant="primary">主要操作</Button>
                <Button variant="outline">次要操作</Button>
                <Button variant="ghost">辅助操作</Button>
              </div>
              
              <div className="flex items-center space-x-4">
                <Text type="tertiary" size="sm">共 1,234 项</Text>
                <Button variant="outline" size="sm">刷新</Button>
                <Button variant="outline" size="sm">设置</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 响应式卡片网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {Array.from({ length: 18 }).map((_, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <Text size="sm" className="text-white">{index + 1}</Text>
                  </div>
                  <Text type="primary" size="sm" className="block mb-1">
                    项目 {index + 1}
                  </Text>
                  <Text type="tertiary" size="xs">
                    描述信息
                  </Text>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageLayout>
  )
}
