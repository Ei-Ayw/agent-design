/**
 * 文件作用：App Router 根布局，注入全局样式与设计系统主题。
 */

import React from 'react'
import type { Metadata } from 'next'
import 'antd/dist/reset.css'
import '../styles/globals.css'
import { ThemeProvider } from '../components/ThemeProvider'
import AppShell from '../components/AppShell'
import dynamic from 'next/dynamic'
const CommandPalette = dynamic(() => import('../components/CommandPalette'), { ssr: false })

export const metadata: Metadata = {
  title: 'AI Agent 控制台',
  description: 'Next.js App Router 骨架（SSE 示例）'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <ThemeProvider>
          <AppShell>
            <CommandPalette />
            {children}
          </AppShell>
        </ThemeProvider>
      </body>
    </html>
  )
}


