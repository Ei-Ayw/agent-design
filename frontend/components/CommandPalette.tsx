"use client"
/**
 * 文件作用：命令面板（Cmd+K）占位，可快速跳转与触发操作。
 */

import React, { useEffect, useMemo, useState } from 'react'
import { Modal, Input, List, Typography } from 'antd'
import { useRouter } from 'next/navigation'

type Cmd = { key: string; label: string; action: () => void }

export default function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')

  const base: Cmd[] = [
    { key: 'go-home', label: '跳转：首页', action: () => router.push('/') },
    { key: 'go-agents', label: '跳转：Agents', action: () => router.push('/agents') },
    { key: 'go-conv', label: '跳转：会话工作台', action: () => router.push('/conversations') },
    { key: 'go-kb', label: '跳转：知识库', action: () => router.push('/kb') },
    { key: 'go-tools', label: '跳转：工具', action: () => router.push('/tools') },
    { key: 'go-workflows', label: '跳转：工作流编排器', action: () => router.push('/workflows') }
  ]

  const list = useMemo(() => base.filter(i => i.label.toLowerCase().includes(q.toLowerCase())), [q])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); setOpen(v => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <Modal open={open} onCancel={() => setOpen(false)} footer={null} title={null} width={640} closable={false}
           styles={{ content: { padding: 0, borderRadius: 8 } }}>
      <div style={{ padding: 16, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <Input autoFocus placeholder="搜索命令或页面（Cmd+K 关闭）" value={q} onChange={e => setQ(e.target.value)} />
      </div>
      <List
        style={{ maxHeight: 360, overflow: 'auto' }}
        dataSource={list}
        renderItem={(item) => (
          <List.Item style={{ cursor:'pointer', padding: '12px 16px' }}
                     onClick={() => { setOpen(false); item.action() }}>
            <Typography.Text>{item.label}</Typography.Text>
          </List.Item>
        )}
      />
    </Modal>
  )
}


