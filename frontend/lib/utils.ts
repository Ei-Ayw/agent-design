/**
 * 工具函数集合
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// 合并 className 的工具函数
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 格式化数字 - 千分位、精度、单位
export function formatNumber(
  value: number,
  options: {
    precision?: number
    unit?: string
    showSign?: boolean
    compact?: boolean
  } = {}
) {
  const { precision = 0, unit = '', showSign = false, compact = false } = options
  
  let formatted: string | number = value
  
  // 紧凑格式（如 1.2K, 1.5M）
  if (compact && Math.abs(value) >= 1000) {
    const units = ['', 'K', 'M', 'B', 'T']
    const unitIndex = Math.floor(Math.log10(Math.abs(value)) / 3)
    const scaled = value / Math.pow(1000, unitIndex)
    formatted = scaled.toFixed(precision) + units[unitIndex]
  } else {
    // 千分位格式
    formatted = value.toLocaleString('zh-CN', {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    })
  }
  
  // 添加符号
  if (showSign && value > 0) {
    formatted = '+' + formatted
  }
  
  // 添加单位
  if (unit) {
    formatted = formatted + unit
  }
  
  return formatted
}

// 格式化百分比
export function formatPercentage(value: number, precision: number = 1) {
  return `${value.toFixed(precision)}%`
}

// 格式化货币
export function formatCurrency(value: number, currency: string = '¥', precision: number = 2) {
  return `${currency}${formatNumber(value, { precision })}`
}

// 格式化时间
export function formatTime(value: number, unit: 'ms' | 's' | 'm' | 'h' = 'ms') {
  const units = {
    ms: { factor: 1, suffix: 'ms' },
    s: { factor: 1000, suffix: 's' },
    m: { factor: 60000, suffix: 'm' },
    h: { factor: 3600000, suffix: 'h' },
  }
  
  const { factor, suffix } = units[unit]
  const converted = value / factor
  
  if (converted < 1) {
    return `${value}ms`
  } else if (converted < 60) {
    return `${converted.toFixed(1)}${suffix}`
  } else if (converted < 3600) {
    const minutes = Math.floor(converted / 60)
    const seconds = Math.floor(converted % 60)
    return `${minutes}m ${seconds}s`
  } else {
    const hours = Math.floor(converted / 3600)
    const minutes = Math.floor((converted % 3600) / 60)
    return `${hours}h ${minutes}m`
  }
}

// 获取状态颜色
export function getStatusColor(status: string) {
  const statusColors: Record<string, string> = {
    success: 'var(--color-semantic-success)',
    warning: 'var(--color-semantic-warning)',
    error: 'var(--color-semantic-error)',
    info: 'var(--color-semantic-info)',
    pending: 'var(--color-semantic-warning)',
    running: 'var(--color-primary-500)',
    completed: 'var(--color-semantic-success)',
    failed: 'var(--color-semantic-error)',
  }
  
  return statusColors[status.toLowerCase()] || 'var(--color-text-3)'
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => func(...args), wait)
  }
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// 生成唯一 ID
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

// 深拷贝
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T
  }
  
  if (typeof obj === 'object') {
    const cloned = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }
  
  return obj
}

// 检查是否为移动设备
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
}

// 检查是否为暗色主题
export function isDarkMode(): boolean {
  if (typeof window === 'undefined') return false
  return document.documentElement.getAttribute('data-theme') === 'dark'
}
