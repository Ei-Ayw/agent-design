"use client"
/**
 * 文件作用：前端全局导航与布局（Client Component，承载 antd 组件）。
 */

import React from 'react'
import { Layout, Menu } from 'antd'
import Link from 'next/link'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
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
  )
}


