"use client"

import React from 'react'
import { Button as AntButton, ButtonProps as AntButtonProps } from 'antd'
import { cn } from '../../lib/utils'

export interface ButtonProps extends Omit<AntButtonProps, 'size' | 'variant'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  children: React.ReactNode
  className?: string
}

const buttonVariants = {
  variant: {
    primary: 'bg-[var(--color-primary-500)] text-white border-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] hover:border-[var(--color-primary-600)]',
    secondary: 'bg-[var(--color-bg-2)] text-[var(--color-text-1)] border-[var(--color-border-1)] hover:bg-[var(--color-bg-3)] hover:border-[var(--color-border-1)]',
    outline: 'bg-transparent text-[var(--color-primary-500)] border-[var(--color-primary-500)] hover:bg-[var(--color-primary-50)]',
    ghost: 'bg-transparent text-[var(--color-text-1)] border-transparent hover:bg-[var(--color-bg-2)]',
    link: 'bg-transparent text-[var(--color-primary-500)] border-transparent hover:text-[var(--color-primary-600)] hover:bg-transparent',
  },
  size: {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-base',
    lg: 'h-12 px-5 text-lg',
  },
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <AntButton
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        buttonVariants.variant[variant],
        buttonVariants.size[size],
        className
      )}
      loading={loading}
      disabled={disabled}
      {...props}
    >
      {children}
    </AntButton>
  )
}

// 导出预设按钮组件
export const PrimaryButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="primary" {...props} />
)

export const SecondaryButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="secondary" {...props} />
)

export const OutlineButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="outline" {...props} />
)

export const GhostButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="ghost" {...props} />
)

export const LinkButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="link" {...props} />
)
