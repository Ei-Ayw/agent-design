"use client"

import React from 'react'
import { Card as AntCard, CardProps as AntCardProps } from 'antd'
import { cn } from '../../lib/utils'

export interface CardProps extends Omit<AntCardProps, 'size'> {
  variant?: 'default' | 'outlined' | 'elevated'
  size?: 'sm' | 'md' | 'lg'
  hoverable?: boolean
  className?: string
  children: React.ReactNode
}

const cardVariants = {
  variant: {
    default: 'bg-[var(--color-bg-3)] border-[var(--color-border-2)]',
    outlined: 'bg-[var(--color-bg-3)] border-[var(--color-border-1)]',
    elevated: 'bg-[var(--color-bg-3)] border-[var(--color-border-2)] shadow-[var(--color-shadow-2)]',
  },
  size: {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  },
}

export function Card({
  variant = 'default',
  size = 'md',
  hoverable = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <AntCard
      className={cn(
        'rounded-lg transition-all duration-200',
        cardVariants.variant[variant],
        hoverable && 'hover:shadow-[var(--color-shadow-2)] hover:border-[var(--color-border-1)]',
        className
      )}
      bodyStyle={{ padding: 0 }}
      {...props}
    >
      <div className={cn(cardVariants.size[size])}>
        {children}
      </div>
    </AntCard>
  )
}

// 卡片标题组件
export interface CardHeaderProps {
  title?: React.ReactNode
  subtitle?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function CardHeader({ title, subtitle, action, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between mb-4', className)}>
      <div className="flex-1">
        {title && (
          <h3 className="text-lg font-semibold text-[var(--color-text-1)] mb-1">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-sm text-[var(--color-text-3)]">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="ml-4">
          {action}
        </div>
      )}
    </div>
  )
}

// 卡片内容组件
export interface CardContentProps {
  children: React.ReactNode
  className?: string
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn('text-[var(--color-text-2)]', className)}>
      {children}
    </div>
  )
}

// 卡片底部组件
export interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-[var(--color-border-2)]', className)}>
      {children}
    </div>
  )
}

// 统计卡片组件
export interface StatCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease' | 'neutral'
  }
  icon?: React.ReactNode
  className?: string
}

export function StatCard({ title, value, change, icon, className }: StatCardProps) {
  const getChangeColor = (type: string) => {
    switch (type) {
      case 'increase':
        return 'text-[var(--color-semantic-success)]'
      case 'decrease':
        return 'text-[var(--color-semantic-error)]'
      default:
        return 'text-[var(--color-text-3)]'
    }
  }

  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'increase':
        return '↗'
      case 'decrease':
        return '↘'
      default:
        return '→'
    }
  }

  return (
    <Card className={cn('relative', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-[var(--color-text-3)] mb-1">{title}</p>
          <p className="text-2xl font-bold text-[var(--color-text-1)] mb-2">
            {value}
          </p>
          {change && (
            <div className={cn('flex items-center text-sm', getChangeColor(change.type))}>
              <span className="mr-1">{getChangeIcon(change.type)}</span>
              <span>{Math.abs(change.value)}%</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="ml-4 text-[var(--color-text-4)]">
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}
