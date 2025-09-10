/**
 * 文件作用：最小登录页，调用后端 /auth/login 获取 JWT 并缓存到 localStorage。
 */

"use client"

import React from 'react'
import { Form, Input, Button, Card, message } from 'antd'
import { useRouter } from 'next/navigation'

const API = 'http://localhost:8000'

export default function LoginPage() {
  const router = useRouter()
  const onFinish = async (values: any) => {
    try {
      const res = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || '登录失败')
      localStorage.setItem('token', json.access_token)
      message.success('登录成功')
      router.push('/agents')
    } catch (e: any) {
      message.error(e.message || '登录失败')
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <Card title="登录">
        <Form layout="vertical" onFinish={onFinish} style={{ maxWidth: 360 }}>
          <Form.Item name="username" label="用户名" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true }]}><Input.Password /></Form.Item>
          <Button type="primary" htmlType="submit">登录</Button>
        </Form>
      </Card>
    </main>
  )
}


