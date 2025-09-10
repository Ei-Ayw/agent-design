/**
 * 文件作用：App Router 根布局，注入全局样式与 Ant Design 主题。
 */

import React from 'react'
import type { Metadata } from 'next'
import 'antd/dist/reset.css'
import AppShell from '../components/AppShell'

export const metadata: Metadata = {
  title: 'AI Agent 控制台',
  description: 'Next.js App Router 骨架（SSE 示例）'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}


