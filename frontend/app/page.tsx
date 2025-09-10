/**
 * 文件作用：重构首页仪表盘（指标卡/趋势图位/最近运行/告警）。
 */

"use client"

import React, { useEffect, useState } from 'react'
import { Space, Typography, Card, Row, Col, Statistic, Table, Tag, Select } from 'antd'

export default function HomePage() {
  const [range, setRange] = useState<'1h' | '24h' | '7d'>('24h')
  const [recent, setRecent] = useState<any[]>([])

  return (
    <main style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Typography.Title level={3}>总览</Typography.Title>
        <Row gutter={24}>
          <Col span={6}><Card><Statistic title="请求数" value={12345} /></Card></Col>
          <Col span={6}><Card><Statistic title="成功率" value={97.6} suffix="%" /></Card></Col>
          <Col span={6}><Card><Statistic title="P95 延迟" value={1240} suffix="ms" /></Card></Col>
          <Col span={6}><Card><Statistic title="本月成本" value={123.45} prefix="$" /></Card></Col>
        </Row>
        <Row gutter={24}>
          <Col span={12}><Card title={
            <Space>
              <span>成功率 / 延迟</span>
              <Select size="small" value={range} onChange={v => setRange(v)} options={[{value:'1h',label:'1h'},{value:'24h',label:'24h'},{value:'7d',label:'7d'}]} />
            </Space>
          }>
            <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color:'#8E8E93' }}>图表占位（接入 AntV/ECharts）</div>
          </Card></Col>
          <Col span={12}><Card title="成本">
            <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color:'#8E8E93' }}>图表占位（接入 AntV/ECharts）</div>
          </Card></Col>
        </Row>
        <Row gutter={24}>
          <Col span={14}><Card title="最近运行">
            <Table rowKey="id" size="small" dataSource={recent} pagination={false}
              columns={[
                { title: '类型', dataIndex: 'type' },
                { title: '名称', dataIndex: 'name' },
                { title: '状态', dataIndex: 'status', render: (s:string) => <Tag color={s==='ok'?'green':s==='pending'?'orange':'red'}>{s}</Tag> },
                { title: '耗时', dataIndex: 'latency' },
                { title: '开始时间', dataIndex: 'ts' }
              ]}
            />
          </Card></Col>
          <Col span={10}><Card title="告警/拦截">
            <ul style={{ margin:0, paddingLeft: 18, color:'#8E8E93' }}>
              <li>示例：DLP 命中（会话 123，已拦截）</li>
              <li>示例：工具越权（用户 A，已阻断）</li>
            </ul>
          </Card></Col>
        </Row>
      </Space>
    </main>
  )
}


