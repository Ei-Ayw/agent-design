/**
 * 文件作用：观测与计费页，对接 /usage、/costs 并提供 /metrics 链接。
 */

"use client"

import React, { useEffect, useState } from 'react'
import { Card, Descriptions, Space, Button } from 'antd'

const API = 'http://localhost:8000'

export default function ObservabilityPage() {
  const [usage, setUsage] = useState<any>({})
  const [costs, setCosts] = useState<any>({})

  useEffect(() => {
    fetch(`${API}/usage`).then(r => r.json()).then(setUsage)
    fetch(`${API}/costs`).then(r => r.json()).then(setCosts)
  }, [])

  return (
    <main style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="Usage">
          <Descriptions bordered size="small">
            <Descriptions.Item label="Requests">{usage.requests}</Descriptions.Item>
            <Descriptions.Item label="Tokens">{usage.tokens}</Descriptions.Item>
          </Descriptions>
        </Card>
        <Card title="Costs">
          <Descriptions bordered size="small">
            <Descriptions.Item label="USD/月">{costs.usd_month}</Descriptions.Item>
          </Descriptions>
        </Card>
        <Button href={`${API}/metrics`} target="_blank">查看 Prometheus /metrics</Button>
      </Space>
    </main>
  )
}


