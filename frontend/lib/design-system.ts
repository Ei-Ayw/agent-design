/**
 * 设计系统核心配置
 * 基于明/暗双主题，以 bg-1~bg-4、text-1~text-4 做层级对比与信息密度控制
 */

export type ThemeMode = 'light' | 'dark'

// 色板定义
export const colorPalette = {
  // 主色调
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe', 
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#007AFF', // 系统蓝，用于关键动作/标题
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  
  // 中性色 - 明暗主题通用
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  
  // 语义色
  semantic: {
    success: '#10b981',
    warning: '#f59e0b', 
    error: '#ef4444',
    info: '#3b82f6',
  }
} as const

// 明主题色板
export const lightTheme = {
  // 背景层级 - 从浅到深
  'bg-1': '#ffffff',      // 页面背景
  'bg-2': '#f8fafc',      // 分组/标签背景
  'bg-3': '#f1f5f9',      // 卡片背景
  'bg-4': '#e2e8f0',      // 模态背景
  
  // 文本层级 - 从深到浅
  'text-1': '#0f172a',    // 主标题
  'text-2': '#334155',    // 副标题
  'text-3': '#64748b',    // 描述文本
  'text-4': '#94a3b8',    // 标签/辅助文本
  
  // 边框与分割线
  'border-1': '#e2e8f0',  // 主要边框
  'border-2': '#f1f5f9',  // 次要边框
  
  // 阴影
  'shadow-1': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  'shadow-2': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  'shadow-3': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
} as const

// 暗主题色板
export const darkTheme = {
  // 背景层级 - 从深到浅
  'bg-1': '#0f172a',      // 页面背景
  'bg-2': '#1e293b',      // 分组/标签背景
  'bg-3': '#334155',      // 卡片背景
  'bg-4': '#475569',      // 模态背景
  
  // 文本层级 - 从浅到深
  'text-1': '#f8fafc',    // 主标题
  'text-2': '#e2e8f0',    // 副标题
  'text-3': '#cbd5e1',    // 描述文本
  'text-4': '#94a3b8',    // 标签/辅助文本
  
  // 边框与分割线
  'border-1': '#334155',  // 主要边框
  'border-2': '#1e293b',  // 次要边框
  
  // 阴影
  'shadow-1': '0 1px 2px 0 rgb(0 0 0 / 0.3)',
  'shadow-2': '0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)',
  'shadow-3': '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
} as const

// 设计 tokens
export const designTokens = {
  // 间距系统
  spacing: {
    xs: '4px',
    sm: '8px', 
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
  },
  
  // 圆角系统
  borderRadius: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  
  // 字体系统
  typography: {
    fontFamily: {
      sans: 'Inter, SF Pro, PingFang SC, Segoe UI, Roboto, Arial, sans-serif',
      mono: 'SF Mono, Monaco, Inconsolata, Roboto Mono, Consolas, monospace',
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  
  // 断点系统
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // 过渡动画
  transition: {
    fast: '150ms ease-in-out',
    normal: '200ms ease-in-out',
    slow: '300ms ease-in-out',
  },
  
  // Z-index 层级
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
  },
} as const

// 组件变体配置
export const componentVariants = {
  button: {
    size: {
      sm: { height: '32px', padding: '0 12px', fontSize: '14px' },
      md: { height: '40px', padding: '0 16px', fontSize: '16px' },
      lg: { height: '48px', padding: '0 20px', fontSize: '18px' },
    },
    variant: {
      primary: {},
      secondary: {},
      outline: {},
      ghost: {},
      link: {},
    },
  },
  
  card: {
    padding: {
      sm: '16px',
      md: '24px', 
      lg: '32px',
    },
  },
} as const

// 主题切换工具函数
export function getThemeColors(mode: ThemeMode) {
  return mode === 'light' ? lightTheme : darkTheme
}

// CSS 变量生成器
export function generateCSSVariables(mode: ThemeMode) {
  const colors = getThemeColors(mode)
  const variables: Record<string, string> = {}
  
  // 生成颜色变量
  Object.entries(colors).forEach(([key, value]) => {
    variables[`--color-${key}`] = value
  })
  
  // 生成设计 token 变量
  Object.entries(designTokens).forEach(([category, tokens]) => {
    Object.entries(tokens).forEach(([key, value]) => {
      if (typeof value === 'object') {
        Object.entries(value).forEach(([subKey, subValue]) => {
          variables[`--${category}-${key}-${subKey}`] = String(subValue)
        })
      } else {
        variables[`--${category}-${key}`] = String(value)
      }
    })
  })
  
  return variables
}
