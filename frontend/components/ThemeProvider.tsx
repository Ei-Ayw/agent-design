"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { ConfigProvider, theme } from 'antd'
import { ThemeMode, getThemeColors, generateCSSVariables } from '../lib/design-system'

interface ThemeContextType {
  mode: ThemeMode
  toggleTheme: () => void
  setTheme: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
  defaultMode?: ThemeMode
}

export function ThemeProvider({ children, defaultMode = 'light' }: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(defaultMode)
  
  // 从 localStorage 读取主题偏好
  useEffect(() => {
    const saved = localStorage.getItem('theme-mode') as ThemeMode
    if (saved && (saved === 'light' || saved === 'dark')) {
      setMode(saved)
    }
  }, [])
  
  // 保存主题偏好到 localStorage
  const setTheme = (newMode: ThemeMode) => {
    setMode(newMode)
    localStorage.setItem('theme-mode', newMode)
  }
  
  const toggleTheme = () => {
    setTheme(mode === 'light' ? 'dark' : 'light')
  }
  
  // 生成 CSS 变量并注入到 document
  useEffect(() => {
    const cssVariables = generateCSSVariables(mode)
    const root = document.documentElement
    
    Object.entries(cssVariables).forEach(([property, value]) => {
      root.style.setProperty(property, value)
    })
    
    // 设置 data-theme 属性用于 CSS 选择器
    root.setAttribute('data-theme', mode)
  }, [mode])
  
  // Ant Design 主题配置
  const antdTheme = {
    algorithm: mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: '#007AFF',
      colorBgBase: mode === 'light' ? '#ffffff' : '#0f172a',
      colorTextBase: mode === 'light' ? '#0f172a' : '#f8fafc',
      colorTextSecondary: mode === 'light' ? '#64748b' : '#cbd5e1',
      colorBorder: mode === 'light' ? '#e2e8f0' : '#334155',
      colorBorderSecondary: mode === 'light' ? '#f1f5f9' : '#1e293b',
      borderRadius: 8,
      fontFamily: 'Inter, SF Pro, PingFang SC, Segoe UI, Roboto, Arial, sans-serif',
      fontSize: 14,
      lineHeight: 1.5,
    },
    components: {
      Layout: {
        headerBg: mode === 'light' ? '#ffffff' : '#1e293b',
        bodyBg: mode === 'light' ? '#f8fafc' : '#0f172a',
        siderBg: mode === 'light' ? '#ffffff' : '#1e293b',
      },
      Card: {
        colorBgContainer: mode === 'light' ? '#ffffff' : '#334155',
        colorBorderSecondary: mode === 'light' ? '#f1f5f9' : '#1e293b',
      },
      Table: {
        headerBg: mode === 'light' ? '#f8fafc' : '#1e293b',
        rowHoverBg: mode === 'light' ? '#f8fafc' : '#1e293b',
      },
      Button: {
        borderRadius: 8,
        controlHeight: 40,
      },
      Input: {
        borderRadius: 8,
        controlHeight: 40,
      },
    },
  }
  
  const contextValue: ThemeContextType = {
    mode,
    toggleTheme,
    setTheme,
  }
  
  return (
    <ThemeContext.Provider value={contextValue}>
      <ConfigProvider theme={antdTheme}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  )
}
