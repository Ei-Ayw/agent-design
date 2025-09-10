"use client"
/**
 * 文件作用：前端全局导航与布局（Client Component，承载 antd 组件）。
 */

import React from 'react'
import { Layout, Menu, Input, Dropdown, Avatar, ConfigProvider, theme } from 'antd'
import Link from 'next/link'

const { Search } = Input

export default function AppShell({ children }: { children: React.ReactNode }) {
  const items = [
    { key: 'home', label: <Link href="/">首页</Link> },
    { key: 'agents', label: <Link href="/agents">Agents</Link> },
    { key: 'kb', label: <Link href="/kb">知识库</Link> },
    { key: 'tools', label: <Link href="/tools">工具</Link> },
    { key: 'conversations', label: <Link href="/conversations">会话</Link> },
    { key: 'workflows', label: <Link href="/workflows">工作流</Link> },
    { key: 'observability', label: <Link href="/observability">观测/计费</Link> },
  ]

  // 设计 Tokens（与 README 规范一致）
  const tokenTheme = {
    token: {
      colorPrimary: '#007AFF',
      colorText: 'rgba(0,0,0,0.85)',
      colorTextSecondary: 'rgba(0,0,0,0.6)',
      colorBgBase: '#FFFFFF',
      colorBorderSecondary: 'rgba(0,0,0,0.06)',
      borderRadius: 8,
      fontFamily: 'Inter, SF Pro, PingFang SC, Segoe UI, Roboto, Arial, sans-serif'
    }
  } as const

  return (
    <ConfigProvider theme={tokenTheme}>
      <Layout style={{ minHeight: '100vh' }}>
        <Layout.Header style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ color: '#fff', fontWeight: 600, fontSize: 16, width: 220 }}>AI Agent 控制台</div>
          <Menu theme="dark" mode="horizontal" selectable={false} items={items} style={{ flex: 1, minWidth: 600 }} />
          <Search placeholder="搜索对象/命令 (Cmd+K)" style={{ width: 320 }} onSearch={() => {}} />
          <Dropdown
            menu={{
              items: [
                { key: 'profile', label: '个人中心' },
                { key: 'settings', label: '设置' },
                { type: 'divider' },
                { key: 'logout', label: '退出登录' }
              ]
            }}
          >
            <Avatar style={{ marginLeft: 12, cursor: 'pointer' }}>U</Avatar>
          </Dropdown>
        </Layout.Header>
        <Layout.Content style={{ padding: 24 }}>{children}</Layout.Content>
      </Layout>
    </ConfigProvider>
  )
}


