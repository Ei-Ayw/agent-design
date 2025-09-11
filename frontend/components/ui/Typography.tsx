"use client"

import React from 'react'
import { Typography as AntTypography } from 'antd'
import { cn } from '../../lib/utils'

const { Title: AntTitle, Text: AntText, Paragraph: AntParagraph } = AntTypography

// 标题组件
export interface TitleProps {
  level?: 1 | 2 | 3 | 4 | 5
  children: React.ReactNode
  className?: string
  color?: 'primary' | 'secondary' | 'tertiary' | 'inherit'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
}

export function Title({
  level = 1,
  children,
  className,
  color = 'primary',
  weight = 'bold',
}: TitleProps) {
  const colorClasses = {
    primary: 'text-[var(--color-text-1)]',
    secondary: 'text-[var(--color-text-2)]',
    tertiary: 'text-[var(--color-text-3)]',
    inherit: 'text-inherit',
  }

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  }

  const sizeClasses = {
    1: 'text-4xl',
    2: 'text-3xl',
    3: 'text-2xl',
    4: 'text-xl',
    5: 'text-lg',
  }

  return (
    <AntTitle
      level={level}
      className={cn(
        'm-0',
        sizeClasses[level],
        colorClasses[color],
        weightClasses[weight],
        className
      )}
    >
      {children}
    </AntTitle>
  )
}

// 副标题组件
export interface SubtitleProps {
  children: React.ReactNode
  className?: string
  color?: 'primary' | 'secondary' | 'tertiary'
  size?: 'sm' | 'md' | 'lg'
}

export function Subtitle({
  children,
  className,
  color = 'secondary',
  size = 'md',
}: SubtitleProps) {
  const colorClasses = {
    primary: 'text-[var(--color-text-1)]',
    secondary: 'text-[var(--color-text-2)]',
    tertiary: 'text-[var(--color-text-3)]',
  }

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }

  return (
    <h2
      className={cn(
        'm-0 font-medium',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    >
      {children}
    </h2>
  )
}

// 文本组件
export interface TextProps {
  children: React.ReactNode
  className?: string
  type?: 'primary' | 'secondary' | 'tertiary' | 'quaternary' | 'success' | 'warning' | 'error'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  code?: boolean
  mark?: boolean
  delete?: boolean
  underline?: boolean
  italic?: boolean
}

export function Text({
  children,
  className,
  type = 'primary',
  size = 'md',
  weight = 'normal',
  code = false,
  mark = false,
  delete: del = false,
  underline = false,
  italic = false,
}: TextProps) {
  const typeClasses = {
    primary: 'text-[var(--color-text-1)]',
    secondary: 'text-[var(--color-text-2)]',
    tertiary: 'text-[var(--color-text-3)]',
    quaternary: 'text-[var(--color-text-4)]',
    success: 'text-[var(--color-semantic-success)]',
    warning: 'text-[var(--color-semantic-warning)]',
    error: 'text-[var(--color-semantic-error)]',
  }

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  }

  return (
    <AntText
      className={cn(
        typeClasses[type],
        sizeClasses[size],
        weightClasses[weight],
        code && 'font-mono bg-[var(--color-bg-2)] px-1 py-0.5 rounded text-sm',
        mark && 'bg-yellow-200 dark:bg-yellow-800',
        del && 'line-through',
        underline && 'underline',
        italic && 'italic',
        className
      )}
      code={code}
      mark={mark}
      delete={del}
      underline={underline}
      italic={italic}
    >
      {children}
    </AntText>
  )
}

// 段落组件
export interface ParagraphProps {
  children: React.ReactNode
  className?: string
  type?: 'primary' | 'secondary' | 'tertiary'
  size?: 'sm' | 'md' | 'lg'
  spacing?: 'tight' | 'normal' | 'relaxed'
}

export function Paragraph({
  children,
  className,
  type = 'primary',
  size = 'md',
  spacing = 'normal',
}: ParagraphProps) {
  const typeClasses = {
    primary: 'text-[var(--color-text-1)]',
    secondary: 'text-[var(--color-text-2)]',
    tertiary: 'text-[var(--color-text-3)]',
  }

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }

  const spacingClasses = {
    tight: 'leading-tight',
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
  }

  return (
    <AntParagraph
      className={cn(
        'm-0',
        typeClasses[type],
        sizeClasses[size],
        spacingClasses[spacing],
        className
      )}
    >
      {children}
    </AntParagraph>
  )
}

// 标签组件
export interface LabelProps {
  children: React.ReactNode
  className?: string
  type?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
  variant?: 'filled' | 'outlined' | 'soft'
}

export function Label({
  children,
  className,
  type = 'default',
  size = 'md',
  variant = 'soft',
}: LabelProps) {
  const typeClasses = {
    default: 'text-[var(--color-text-2)] bg-[var(--color-bg-2)] border-[var(--color-border-1)]',
    primary: 'text-[var(--color-primary-500)] bg-[var(--color-primary-50)] border-[var(--color-primary-200)]',
    success: 'text-[var(--color-semantic-success)] bg-green-50 border-green-200',
    warning: 'text-[var(--color-semantic-warning)] bg-yellow-50 border-yellow-200',
    error: 'text-[var(--color-semantic-error)] bg-red-50 border-red-200',
    info: 'text-[var(--color-semantic-info)] bg-blue-50 border-blue-200',
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  const variantClasses = {
    filled: 'border-0',
    outlined: 'bg-transparent border',
    soft: 'border',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md font-medium',
        typeClasses[type],
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

// 数值强调组件
export interface NumberDisplayProps {
  value: number | string
  unit?: string
  precision?: number
  showSign?: boolean
  compact?: boolean
  className?: string
  color?: 'primary' | 'success' | 'warning' | 'error' | 'inherit'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
}

export function NumberDisplay({
  value,
  unit = '',
  precision = 0,
  showSign = false,
  compact = false,
  className,
  color = 'primary',
  size = 'md',
  weight = 'semibold',
}: NumberDisplayProps) {
  const colorClasses = {
    primary: 'text-[var(--color-text-1)]',
    success: 'text-[var(--color-semantic-success)]',
    warning: 'text-[var(--color-semantic-warning)]',
    error: 'text-[var(--color-semantic-error)]',
    inherit: 'text-inherit',
  }

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  }

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  }

  // 格式化数值
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val
    
    let formatted: string | number = val
    
    // 紧凑格式
    if (compact && Math.abs(val) >= 1000) {
      const units = ['', 'K', 'M', 'B', 'T']
      const unitIndex = Math.floor(Math.log10(Math.abs(val)) / 3)
      const scaled = val / Math.pow(1000, unitIndex)
      formatted = scaled.toFixed(precision) + units[unitIndex]
    } else {
      // 千分位格式
      formatted = val.toLocaleString('zh-CN', {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
      })
    }
    
    // 添加符号
    if (showSign && val > 0) {
      formatted = '+' + formatted
    }
    
    return formatted
  }

  return (
    <span
      className={cn(
        'tabular-nums',
        colorClasses[color],
        sizeClasses[size],
        weightClasses[weight],
        className
      )}
    >
      {formatValue(value)}
      {unit && <span className="ml-1 text-sm opacity-75">{unit}</span>}
    </span>
  )
}

// 代码块组件
export interface CodeBlockProps {
  children: React.ReactNode
  language?: string
  className?: string
  showLineNumbers?: boolean
}

export function CodeBlock({
  children,
  language = 'text',
  className,
  showLineNumbers = false,
}: CodeBlockProps) {
  return (
    <pre
      className={cn(
        'bg-[var(--color-bg-2)] border border-[var(--color-border-1)] rounded-lg p-4 overflow-x-auto',
        'text-sm font-mono text-[var(--color-text-2)]',
        className
      )}
    >
      <code className={`language-${language}`}>
        {children}
      </code>
    </pre>
  )
}
