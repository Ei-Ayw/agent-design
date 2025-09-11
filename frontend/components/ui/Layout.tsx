"use client"

import React from 'react'
import { Layout as AntLayout, Row, Col, Grid as AntGrid } from 'antd'
import { cn } from '../../lib/utils'

const { useBreakpoint } = AntGrid

// 容器组件
export interface ContainerProps {
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  className?: string
}

export function Container({
  children,
  maxWidth = 'full',
  padding = 'none',
  className,
}: ContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    '2xl': 'max-w-8xl',
    full: 'max-w-full',
  }

  const paddingClasses = {
    none: 'px-0',
    sm: 'px-4',
    md: 'px-6',
    lg: 'px-8',
  }

  return (
    <div
      className={cn(
        'w-full',
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  )
}

// 网格系统
export interface GridProps {
  children: React.ReactNode
  cols?: 1 | 2 | 3 | 4 | 6 | 12
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Grid({ children, cols = 12, gap = 'md', className }: GridProps) {
  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  }

  return (
    <div
      className={cn(
        'grid',
        `grid-cols-${cols}`,
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  )
}

// 网格项
export interface GridItemProps {
  children: React.ReactNode
  span?: number
  offset?: number
  className?: string
}

export function GridItem({ children, span, offset, className }: GridItemProps) {
  return (
    <div
      className={cn(
        span && `col-span-${span}`,
        offset && `col-start-${offset + 1}`,
        className
      )}
    >
      {children}
    </div>
  )
}

// 响应式网格
export interface ResponsiveGridProps {
  children: React.ReactNode
  xs?: number
  sm?: number
  md?: number
  lg?: number
  xl?: number
  xxl?: number
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function ResponsiveGrid({
  children,
  xs = 1,
  sm,
  md,
  lg,
  xl,
  xxl,
  gap = 'md',
  className,
}: ResponsiveGridProps) {
  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  }

  const gridClasses = [
    'grid',
    gapClasses[gap],
    `grid-cols-${xs}`,
    sm && `sm:grid-cols-${sm}`,
    md && `md:grid-cols-${md}`,
    lg && `lg:grid-cols-${lg}`,
    xl && `xl:grid-cols-${xl}`,
    xxl && `2xl:grid-cols-${xxl}`,
  ].filter(Boolean)

  return (
    <div className={cn(gridClasses, className)}>
      {children}
    </div>
  )
}

// 页面布局
export interface PageLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  breadcrumb?: React.ReactNode
  className?: string
}

export function PageLayout({
  children,
  title,
  subtitle,
  actions,
  breadcrumb,
  className,
}: PageLayoutProps) {
  return (
    <div className={cn('h-full bg-[var(--color-bg-1)] flex flex-col', className)}>
      <div className="w-full px-4 sm:px-6 lg:px-8 flex-shrink-0">
        <div className="py-1">
          {breadcrumb && (
            <div className="mb-1">
              {breadcrumb}
            </div>
          )}
          
          {(title || actions) && (
            <div className="flex items-start justify-between mb-1">
              <div className="flex-1">
                {title && (
                  <h1 className="text-base font-bold text-[var(--color-text-1)] mb-0.5">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-xs text-[var(--color-text-3)]">
                    {subtitle}
                  </p>
                )}
              </div>
              {actions && (
                <div className="ml-4">
                  {actions}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <div className="w-full px-4 sm:px-6 lg:px-8 pb-4">
          {children}
        </div>
      </div>
    </div>
  )
}

// 卡片网格布局
export interface CardGridProps {
  children: React.ReactNode
  columns?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

export function CardGrid({
  children,
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 'md',
  className,
}: CardGridProps) {
  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
  }

  const gridClasses = [
    'grid',
    gapClasses[gap],
    `grid-cols-${columns.xs || 1}`,
    columns.sm && `sm:grid-cols-${columns.sm}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`,
  ].filter(Boolean)

  return (
    <div className={cn(gridClasses, className)}>
      {children}
    </div>
  )
}

// 侧边栏布局
export interface SidebarLayoutProps {
  children: React.ReactNode
  sidebar: React.ReactNode
  sidebarWidth?: number
  collapsible?: boolean
  collapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
  className?: string
}

export function SidebarLayout({
  children,
  sidebar,
  sidebarWidth = 240,
  collapsible = false,
  collapsed = false,
  onCollapse,
  className,
}: SidebarLayoutProps) {
  return (
    <div className={cn('flex h-screen', className)}>
      <div
        className={cn(
          'bg-[var(--color-bg-2)] border-r border-[var(--color-border-1)] transition-all duration-200',
          collapsed ? 'w-16' : `w-[${sidebarWidth}px]`
        )}
        style={{ width: collapsed ? 64 : sidebarWidth }}
      >
        {sidebar}
      </div>
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}

// 两栏布局
export interface TwoColumnLayoutProps {
  children: React.ReactNode
  left: React.ReactNode
  right: React.ReactNode
  leftWidth?: number
  rightWidth?: number
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

export function TwoColumnLayout({
  children,
  left,
  right,
  leftWidth = 300,
  rightWidth = 300,
  gap = 'md',
  className,
}: TwoColumnLayoutProps) {
  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
  }

  return (
    <div className={cn('flex', gapClasses[gap], className)}>
      <div style={{ width: leftWidth, minWidth: leftWidth }}>
        {left}
      </div>
      <div className="flex-1">
        {children}
      </div>
      <div style={{ width: rightWidth, minWidth: rightWidth }}>
        {right}
      </div>
    </div>
  )
}

// 响应式工具钩子
export function useResponsive() {
  const screens = useBreakpoint()
  
  return {
    xs: screens.xs,
    sm: screens.sm,
    md: screens.md,
    lg: screens.lg,
    xl: screens.xl,
    xxl: screens.xxl,
    isMobile: !screens.sm,
    isTablet: Boolean(screens.sm && !screens.lg),
    isDesktop: Boolean(screens.lg),
  }
}

// 响应式显示组件
export interface ResponsiveProps {
  children: React.ReactNode
  showOn?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  hideOn?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  className?: string
}

export function Responsive({ children, showOn, hideOn, className }: ResponsiveProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive()
  
  let shouldShow: boolean = true
  
  if (showOn) {
    shouldShow = (showOn === 'xs' && isMobile) ||
                 (showOn === 'sm' && isTablet) ||
                 (showOn === 'lg' && isDesktop)
  }
  
  if (hideOn) {
    shouldShow = !((hideOn === 'xs' && isMobile) ||
                   (hideOn === 'sm' && isTablet) ||
                   (hideOn === 'lg' && isDesktop))
  }
  
  if (!shouldShow) {
    return null
  }
  
  return <div className={className}>{children}</div>
}
