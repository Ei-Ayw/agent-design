"use client"

import React from 'react'
import { Input as AntInput, InputProps as AntInputProps } from 'antd'
import { cn } from '../../lib/utils'

export interface InputProps extends Omit<AntInputProps, 'size' | 'variant'> {
  variant?: 'default' | 'filled' | 'outlined'
  size?: 'sm' | 'md' | 'lg'
  error?: boolean
  className?: string
}

const inputVariants = {
  variant: {
    default: 'bg-[var(--color-bg-3)] border-[var(--color-border-1)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-opacity-20',
    filled: 'bg-[var(--color-bg-2)] border-[var(--color-border-2)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-opacity-20',
    outlined: 'bg-transparent border-[var(--color-border-1)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-opacity-20',
  },
  size: {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-base',
    lg: 'h-12 px-5 text-lg',
  },
}

export function Input({
  variant = 'default',
  size = 'md',
  error = false,
  className,
  ...props
}: InputProps) {
  return (
    <AntInput
      className={cn(
        'rounded-lg transition-all duration-200 focus:outline-none',
        inputVariants.variant[variant],
        inputVariants.size[size],
        error && 'border-[var(--color-semantic-error)] focus:border-[var(--color-semantic-error)] focus:ring-[var(--color-semantic-error)]',
        className
      )}
      {...props}
    />
  )
}

// 密码输入框
export interface PasswordInputProps extends Omit<InputProps, 'type'> {
  showPassword?: boolean
  onToggleVisibility?: () => void
}

export function PasswordInput({
  showPassword = false,
  onToggleVisibility,
  ...props
}: PasswordInputProps) {
  const { size, variant, error, className, ...restProps } = props
  
  return (
    <AntInput.Password
      className={cn(
        'rounded-lg transition-all duration-200 focus:outline-none',
        inputVariants.variant[variant || 'default'],
        inputVariants.size[size || 'md'],
        error && 'border-[var(--color-semantic-error)] focus:border-[var(--color-semantic-error)] focus:ring-[var(--color-semantic-error)]',
        className
      )}
      visibilityToggle={{
        visible: showPassword,
        onVisibleChange: onToggleVisibility,
      }}
      {...restProps}
    />
  )
}

// 搜索输入框
export interface SearchInputProps extends Omit<InputProps, 'type'> {
  onSearch?: (value: string) => void
  loading?: boolean
}

export function SearchInput({
  onSearch,
  loading = false,
  ...props
}: SearchInputProps) {
  const { size, variant, error, className, ...restProps } = props
  
  return (
    <AntInput.Search
      className={cn(
        'rounded-lg transition-all duration-200 focus:outline-none',
        inputVariants.variant[variant || 'default'],
        inputVariants.size[size || 'md'],
        error && 'border-[var(--color-semantic-error)] focus:border-[var(--color-semantic-error)] focus:ring-[var(--color-semantic-error)]',
        className
      )}
      onSearch={onSearch}
      loading={loading}
      {...restProps}
    />
  )
}

// 文本域
export interface TextAreaProps extends Omit<AntInputProps, 'size' | 'variant'> {
  variant?: 'default' | 'filled' | 'outlined'
  size?: 'sm' | 'md' | 'lg'
  error?: boolean
  className?: string
  rows?: number
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
}

export function TextArea({
  variant = 'default',
  size = 'md',
  error = false,
  className,
  rows = 4,
  resize = 'vertical',
  ...props
}: TextAreaProps) {
  const { prefix, suffix, addonBefore, addonAfter, ...restProps } = props as any
  
  return (
    <AntInput.TextArea
      className={cn(
        'rounded-lg transition-all duration-200 focus:outline-none',
        inputVariants.variant[variant],
        inputVariants.size[size],
        error && 'border-[var(--color-semantic-error)] focus:border-[var(--color-semantic-error)] focus:ring-[var(--color-semantic-error)]',
        className
      )}
      style={{
        resize,
        minHeight: size === 'sm' ? '80px' : size === 'lg' ? '120px' : '100px',
      }}
      rows={rows}
      {...restProps}
    />
  )
}

// 数字输入框
export interface NumberInputProps extends Omit<InputProps, 'type'> {
  min?: number
  max?: number
  step?: number
  precision?: number
  formatter?: (value: string | number) => string
  parser?: (value: string) => string
}

export function NumberInput({
  min,
  max,
  step = 1,
  precision,
  formatter,
  parser,
  ...props
}: NumberInputProps) {
  const { size, variant, error, className, ...restProps } = props
  
  return (
    <AntInput
      type="number"
      className={cn(
        'rounded-lg transition-all duration-200 focus:outline-none',
        inputVariants.variant[variant || 'default'],
        inputVariants.size[size || 'md'],
        error && 'border-[var(--color-semantic-error)] focus:border-[var(--color-semantic-error)] focus:ring-[var(--color-semantic-error)]',
        className
      )}
      min={min}
      max={max}
      step={step}
      {...restProps}
    />
  )
}
