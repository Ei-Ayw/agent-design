/**
 * 简单测试页面
 */

"use client"

import React from 'react'

export default function SimpleTestPage() {
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ color: 'var(--color-text-1)', marginBottom: '16px' }}>
        简单测试页面
      </h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px',
        marginBottom: '24px'
      }}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            style={{
              height: '80px',
              backgroundColor: 'var(--color-bg-3)',
              border: '1px solid var(--color-border-1)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-2)'
            }}
          >
            卡片 {index + 1}
          </div>
        ))}
      </div>
      
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        flexWrap: 'wrap',
        marginBottom: '24px'
      }}>
        <button style={{
          padding: '8px 16px',
          backgroundColor: 'var(--color-primary-500)',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}>
          主要按钮
        </button>
        
        <button style={{
          padding: '8px 16px',
          backgroundColor: 'var(--color-bg-2)',
          color: 'var(--color-text-1)',
          border: '1px solid var(--color-border-1)',
          borderRadius: '6px',
          cursor: 'pointer'
        }}>
          次要按钮
        </button>
      </div>
      
      <div style={{ 
        padding: '16px',
        backgroundColor: 'var(--color-bg-2)',
        border: '1px solid var(--color-border-1)',
        borderRadius: '8px'
      }}>
        <h3 style={{ color: 'var(--color-text-1)', marginBottom: '8px' }}>
          颜色系统测试
        </h3>
        <p style={{ color: 'var(--color-text-2)', marginBottom: '4px' }}>
          这是主要文本颜色
        </p>
        <p style={{ color: 'var(--color-text-3)', marginBottom: '4px' }}>
          这是次要文本颜色
        </p>
        <p style={{ color: 'var(--color-text-4)' }}>
          这是辅助文本颜色
        </p>
      </div>
    </div>
  )
}
