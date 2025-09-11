"use client"

import React from 'react'
import { Skeleton, Empty, Result, Spin } from 'antd'
import { cn } from '../../lib/utils'

// Skeleton 组件
export interface SkeletonProps {
  variant?: 'text' | 'rectangular' | 'circular'
  width?: string | number
  height?: string | number
  rows?: number
  className?: string
}

export function SkeletonLoader({
  variant = 'rectangular',
  width,
  height,
  rows = 3,
  className,
}: SkeletonProps) {
  if (variant === 'text') {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton.Input
            key={index}
            active
            size="small"
            style={{ width: width || '100%', height: height || 16 }}
          />
        ))}
      </div>
    )
  }

  if (variant === 'circular') {
    return (
      <Skeleton.Avatar
        active
        size={typeof width === 'number' ? width : 40}
        shape="circle"
        className={className}
      />
    )
  }

  return (
    <Skeleton.Input
      active
      style={{ width: width || '100%', height: height || 40 }}
      className={className}
    />
  )
}

// 卡片骨架屏
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('p-6 border border-[var(--color-border-2)] rounded-lg bg-[var(--color-bg-3)]', className)}>
      <div className="space-y-4">
        <Skeleton.Input active size="small" style={{ width: '60%', height: 20 }} />
        <Skeleton.Input active size="small" style={{ width: '100%', height: 16 }} />
        <Skeleton.Input active size="small" style={{ width: '80%', height: 16 }} />
        <div className="flex justify-between items-center pt-4">
          <Skeleton.Input active size="small" style={{ width: '40%', height: 16 }} />
          <Skeleton.Avatar active size={32} shape="circle" />
        </div>
      </div>
    </div>
  )
}

// 表格骨架屏
export function TableSkeleton({ 
  columns = 4, 
  rows = 5, 
  className 
}: { 
  columns?: number
  rows?: number
  className?: string 
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* 表头 */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton.Input
            key={index}
            active
            size="small"
            style={{ width: '100%', height: 20 }}
          />
        ))}
      </div>
      {/* 表体 */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton.Input
              key={colIndex}
              active
              size="small"
              style={{ width: '100%', height: 16 }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// Empty 状态组件
export interface EmptyStateProps {
  title?: string
  description?: string
  image?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  title = '暂无数据',
  description = '当前没有可显示的内容',
  image,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12', className)}>
      {image && (
        <div className="mb-4 text-[var(--color-text-4)]">
          {image}
        </div>
      )}
      <h3 className="text-lg font-medium text-[var(--color-text-1)] mb-2">
        {title}
      </h3>
      <p className="text-sm text-[var(--color-text-3)] mb-6 text-center max-w-sm">
        {description}
      </p>
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  )
}

// Error 状态组件
export interface ErrorStateProps {
  title?: string
  description?: string
  error?: Error | string
  action?: React.ReactNode
  className?: string
}

export function ErrorState({
  title = '出现错误',
  description,
  error,
  action,
  className,
}: ErrorStateProps) {
  const errorMessage = error instanceof Error ? error.message : error

  return (
    <div className={cn('flex flex-col items-center justify-center py-12', className)}>
      <div className="mb-4 text-4xl text-[var(--color-semantic-error)]">
        ⚠️
      </div>
      <h3 className="text-lg font-medium text-[var(--color-text-1)] mb-2">
        {title}
      </h3>
      <p className="text-sm text-[var(--color-text-3)] mb-6 text-center max-w-sm">
        {description || errorMessage || '发生了未知错误，请稍后重试'}
      </p>
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  )
}

// Loading 状态组件
export interface LoadingStateProps {
  tip?: string
  size?: 'small' | 'default' | 'large'
  className?: string
}

export function LoadingState({
  tip = '加载中...',
  size = 'default',
  className,
}: LoadingStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12', className)}>
      <Spin size={size} tip={tip} />
    </div>
  )
}

// 内联加载状态
export function InlineLoading({ 
  loading, 
  children, 
  tip 
}: { 
  loading: boolean
  children: React.ReactNode
  tip?: string 
}) {
  return (
    <Spin spinning={loading} tip={tip}>
      {children}
    </Spin>
  )
}

// 状态指示器
export interface StatusIndicatorProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'pending'
  text?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function StatusIndicator({
  status,
  text,
  size = 'md',
  className,
}: StatusIndicatorProps) {
  const statusConfig = {
    success: { color: 'var(--color-semantic-success)', icon: '●' },
    warning: { color: 'var(--color-semantic-warning)', icon: '●' },
    error: { color: 'var(--color-semantic-error)', icon: '●' },
    info: { color: 'var(--color-semantic-info)', icon: '●' },
    pending: { color: 'var(--color-text-3)', icon: '●' },
  }

  const config = statusConfig[status]
  const sizeClasses = {
    sm: 'w-2 h-2 text-xs',
    md: 'w-3 h-3 text-sm',
    lg: 'w-4 h-4 text-base',
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <span
        className={cn('inline-block', sizeClasses[size])}
        style={{ color: config.color }}
      >
        {config.icon}
      </span>
      {text && (
        <span className="text-sm text-[var(--color-text-2)]">
          {text}
        </span>
      )}
    </div>
  )
}
