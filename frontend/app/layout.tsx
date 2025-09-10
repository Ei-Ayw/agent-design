/**
 * 文件作用：App Router 根布局，注入全局样式与 Ant Design 主题。
 */

import React from 'react'
import type { Metadata } from 'next'
import 'antd/dist/reset.css'
import { Layout, Menu } from 'antd'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'AI Agent 控制台',
  description: 'Next.js App Router 骨架（SSE 示例）'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <Layout style={{ minHeight: '100vh' }}>
          <Layout.Header>
            <div style={{ color: '#fff', fontWeight: 600 }}>AI Agent 控制台</div>
            <Menu theme="dark" mode="horizontal" selectable={false} items={[
              { key: 'home', label: <Link href="/">首页</Link> },
              { key: 'agents', label: <Link href="/agents">Agents</Link> },
              { key: 'kb', label: <Link href="/kb">知识库</Link> },
              { key: 'tools', label: <Link href="/tools">工具</Link> },
              { key: 'conversations', label: <Link href="/conversations">会话</Link> },
              { key: 'workflows', label: <Link href="/workflows">工作流</Link> },
              { key: 'observability', label: <Link href="/observability">观测/计费</Link> },
            ]} />
          </Layout.Header>
          <Layout.Content>
            {children}
          </Layout.Content>
        </Layout>
      </body>
    </html>
  )
}


