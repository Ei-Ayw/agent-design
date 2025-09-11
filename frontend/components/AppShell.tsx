"use client"
/**
 * 文件作用：前端全局导航与布局（Client Component，使用新的设计系统）。
 */

import React from 'react'
import { Layout, Menu, Dropdown, Avatar } from 'antd'
import Link from 'next/link'
import { SearchInput } from './ui/Input'
import { ThemeToggle } from './ThemeToggle'
import { useTheme } from './ThemeProvider'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { mode } = useTheme()
  
  const items = [
    { key: 'home', label: <Link href="/">首页</Link> },
    { key: 'agents', label: <Link href="/agents">Agents</Link> },
    { key: 'kb', label: <Link href="/kb">知识库</Link> },
    { key: 'tools', label: <Link href="/tools">工具</Link> },
    { key: 'conversations', label: <Link href="/conversations">会话</Link> },
    { key: 'workflows', label: <Link href="/workflows">工作流</Link> },
    { key: 'observability', label: <Link href="/observability">观测/计费</Link> },
  ]

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--color-bg-1)' }}>
      <Layout.Header 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 16,
          background: mode === 'light' ? '#ffffff' : '#1e293b',
          borderBottom: '1px solid var(--color-border-1)',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}
      >
        <div 
          style={{ 
            color: 'var(--color-text-1)', 
            fontWeight: 600, 
            fontSize: 16, 
            width: 220 
          }}
        >
          AI Agent 控制台
        </div>
        
        <Menu 
          theme={mode}
          mode="horizontal" 
          selectable={false} 
          items={items} 
          style={{ 
            flex: 1, 
            minWidth: 600,
            background: 'transparent',
            borderBottom: 'none'
          }} 
        />
        
        <SearchInput 
          placeholder="搜索对象/命令 (Cmd+K)" 
          style={{ width: 320 }} 
          onSearch={() => {}} 
        />
        
        <ThemeToggle />
        
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
          <Avatar 
            style={{ 
              marginLeft: 12, 
              cursor: 'pointer',
              background: 'var(--color-primary-500)'
            }}
          >
            U
          </Avatar>
        </Dropdown>
      </Layout.Header>
      
      <Layout.Content 
        style={{ 
          padding: 0,
          background: 'var(--color-bg-1)',
          height: 'calc(100vh - 64px)', // Fixed height instead of minHeight
          overflow: 'hidden' // Prevent scrolling
        }}
      >
        <div style={{ height: '100%', overflow: 'auto' }}>
          {children}
        </div>
      </Layout.Content>
    </Layout>
  )
}


