# 设计系统文档

## 概述

本设计系统基于明/暗双主题，以 `bg-1~bg-4`、`text-1~text-4` 做层级对比与信息密度控制，提供一致的用户体验。

## 主题与色板

### 明主题色板

```css
/* 背景层级 - 从浅到深 */
--color-bg-1: #ffffff;      /* 页面背景 */
--color-bg-2: #f8fafc;      /* 分组/标签背景 */
--color-bg-3: #f1f5f9;      /* 卡片背景 */
--color-bg-4: #e2e8f0;      /* 模态背景 */

/* 文本层级 - 从深到浅 */
--color-text-1: #0f172a;    /* 主标题 */
--color-text-2: #334155;    /* 副标题 */
--color-text-3: #64748b;    /* 描述文本 */
--color-text-4: #94a3b8;    /* 标签/辅助文本 */
```

### 暗主题色板

```css
/* 背景层级 - 从深到浅 */
--color-bg-1: #0f172a;      /* 页面背景 */
--color-bg-2: #1e293b;      /* 分组/标签背景 */
--color-bg-3: #334155;      /* 卡片背景 */
--color-bg-4: #475569;      /* 模态背景 */

/* 文本层级 - 从浅到深 */
--color-text-1: #f8fafc;    /* 主标题 */
--color-text-2: #e2e8f0;    /* 副标题 */
--color-text-3: #cbd5e1;    /* 描述文本 */
--color-text-4: #94a3b8;    /* 标签/辅助文本 */
```

### 主色调

- **系统蓝**: `#007AFF` - 用于关键动作/标题
- **语义色**: 成功 `#10b981`、警告 `#f59e0b`、错误 `#ef4444`、信息 `#3b82f6`

## 排版与信息层级

### 字体系统

```css
/* 字体族 */
--font-family-sans: Inter, SF Pro, PingFang SC, Segoe UI, Roboto, Arial, sans-serif;
--font-family-mono: SF Mono, Monaco, Inconsolata, Roboto Mono, Consolas, monospace;

/* 字体大小 */
--font-size-xs: 12px;    /* 标签 */
--font-size-sm: 14px;    /* 描述 */
--font-size-base: 16px;  /* 正文 */
--font-size-lg: 18px;    /* 副标题 */
--font-size-xl: 20px;    /* 标题 */
--font-size-2xl: 24px;   /* 大标题 */
--font-size-3xl: 30px;   /* 主标题 */
--font-size-4xl: 36px;   /* 超大标题 */
```

### 信息层级

1. **主标题** - `text-1` + `font-bold` + `text-2xl/3xl/4xl`
2. **副标题** - `text-2` + `font-semibold` + `text-lg/xl`
3. **描述文本** - `text-3` + `font-normal` + `text-sm/base`
4. **标签/辅助** - `text-4` + `font-normal` + `text-xs/sm`

### 数值强调

- **千分位格式**: 使用 `formatNumber()` 工具函数
- **单位显示**: 数值后添加单位，如 `1,234 ms`、`97.6%`
- **涨跌色**: 上涨用成功色，下跌用错误色
- **精度控制**: 根据数据类型设置合适的小数位数

## 组件范式

### 基础组件

基于 shadcn/ui 风格，提供以下基础组件：

- **Button**: 5种变体（primary/secondary/outline/ghost/link）
- **Input**: 3种变体（default/filled/outlined）+ 特殊类型（密码/搜索/数字/文本域）
- **Card**: 3种变体（default/outlined/elevated）+ 组合组件（Header/Content/Footer）
- **Typography**: 标题/副标题/文本/段落/标签/数值显示

### 业务组件

- **StatCard**: 统计卡片，支持数值、变化趋势、图标
- **StatusIndicator**: 状态指示器，支持多种状态类型
- **SkeletonLoader**: 骨架屏，支持文本/矩形/圆形变体
- **EmptyState**: 空状态，支持自定义图标和操作
- **ErrorState**: 错误状态，支持错误信息和重试操作

### 组件规范

- 单文件不超过 300 行
- 复杂组件拆分子组件
- 使用 TypeScript 提供完整类型定义
- 支持 className 自定义样式
- 提供合理的默认值和变体

## 交互反馈

### 状态管理

- **Skeleton**: 加载状态，提供内容占位
- **Empty**: 空状态，引导用户操作
- **Error**: 错误状态，提供错误信息和恢复方案
- **Loading**: 加载状态，显示进度或旋转动画

### 过渡动画

- **快速**: 150ms - 用于悬停、聚焦等即时反馈
- **标准**: 200ms - 用于状态切换、颜色变化
- **缓慢**: 300ms - 用于页面切换、模态显示

### 交互状态

- **悬浮态**: 轻微阴影提升，边框颜色加深
- **聚焦态**: 蓝色边框 + 外发光效果
- **禁用态**: 50% 透明度，鼠标指针禁用
- **激活态**: 背景色加深，边框颜色变化

## 响应式与可读性

### 断点系统

```css
--breakpoint-sm: 640px;   /* 手机 */
--breakpoint-md: 768px;   /* 平板 */
--breakpoint-lg: 1024px;  /* 桌面 */
--breakpoint-xl: 1280px;  /* 大屏 */
--breakpoint-2xl: 1536px; /* 超大屏 */
```

### 移动优先策略

- 默认样式针对移动设备优化
- 使用 `min-width` 媒体查询向上适配
- 表格在小屏可横滑或信息折叠
- 图表在小屏优先显示关键信息

### 可读性优化

- 行高 1.5，确保文本易读
- 对比度符合 WCAG 2.1 AA 标准
- 字体大小最小 12px
- 重要信息使用粗体或颜色强调

## 图形与媒体

### 图表配色

- 主色调使用系统蓝 `#007AFF`
- 辅助色使用语义色（成功/警告/错误/信息）
- 背景对比度适中，不干扰数据阅读
- 支持明暗主题自动切换

### 图片优化

- 使用 Next.js Image 组件自动优化
- 支持 WebP 格式和响应式加载
- 提供占位符和错误状态
- 懒加载提升性能

### SVG 图标

- 组件化管理，支持主题色切换
- 统一尺寸规范（16px/20px/24px）
- 提供语义化命名
- 支持自定义颜色和大小

## 使用指南

### 安装依赖

```bash
npm install clsx tailwind-merge
npm install -D tailwindcss postcss autoprefixer
```

### 基础使用

```tsx
import { Button, Card, Title, Text } from '@/components/ui'

function MyComponent() {
  return (
    <Card>
      <Title level={2}>标题</Title>
      <Text type="secondary">描述文本</Text>
      <Button variant="primary">按钮</Button>
    </Card>
  )
}
```

### 主题切换

```tsx
import { useTheme } from '@/components/ui'

function ThemeToggle() {
  const { mode, toggleTheme } = useTheme()
  
  return (
    <button onClick={toggleTheme}>
      切换到{mode === 'light' ? '暗色' : '明色'}主题
    </button>
  )
}
```

### 响应式布局

```tsx
import { ResponsiveGrid, Container } from '@/components/ui'

function ResponsiveLayout() {
  return (
    <Container>
      <ResponsiveGrid xs={1} sm={2} md={3} lg={4}>
        {/* 网格项 */}
      </ResponsiveGrid>
    </Container>
  )
}
```

## 最佳实践

1. **一致性**: 使用设计系统提供的组件和样式
2. **可访问性**: 确保键盘导航和屏幕阅读器支持
3. **性能**: 合理使用懒加载和代码分割
4. **维护性**: 遵循组件拆分和类型定义规范
5. **测试**: 为关键组件编写单元测试和视觉回归测试
