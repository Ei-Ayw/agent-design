/**
 * 文件作用：计费与配额页面，实现计费管理功能
 */

"use client"

import React, { useEffect, useState } from 'react'
import { Table, Space, Button, Modal, Form, Input, Select, message, Drawer, Tabs, Tag, Card, Descriptions, Progress, Badge, Alert, Divider, Statistic, Row, Col } from 'antd'
import { DollarOutlined, CreditCardOutlined, SettingOutlined, DownloadOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ExclamationCircleOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { PageLayout } from '../../components/ui/Layout'
import { Card as UICard, CardHeader, CardContent } from '../../components/ui/Card'
import { Title, Text, NumberDisplay } from '../../components/ui/Typography'
import { StatusIndicator } from '../../components/ui/Status'
import { formatNumber, formatTime } from '../../lib/utils'

const API = 'http://localhost:8000'

interface BillingPlan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  billing_cycle: 'monthly' | 'yearly'
  features: string[]
  limits: {
    api_calls: number
    tokens: number
    storage: number
    agents: number
    workflows: number
  }
  status: 'active' | 'inactive' | 'archived'
  created_at: string
}

interface Usage {
  id: string
  user_id: string
  plan_id: string
  period_start: string
  period_end: string
  api_calls: number
  tokens: number
  storage: number
  agents: number
  workflows: number
  cost: number
  status: 'current' | 'past' | 'pending'
}

interface Quota {
  id: string
  user_id: string
  resource_type: 'api_calls' | 'tokens' | 'storage' | 'agents' | 'workflows'
  limit: number
  used: number
  reset_period: 'daily' | 'monthly' | 'yearly'
  reset_date: string
  status: 'normal' | 'warning' | 'exceeded'
}

interface PaymentMethod {
  id: string
  type: 'credit_card' | 'bank_transfer' | 'paypal'
  last_four: string
  brand: string
  expiry_month: number
  expiry_year: number
  is_default: boolean
  status: 'active' | 'inactive' | 'expired'
}

interface Invoice {
  id: string
  user_id: string
  plan_id: string
  amount: number
  currency: string
  status: 'pending' | 'paid' | 'failed' | 'refunded'
  due_date: string
  paid_date?: string
  items: InvoiceItem[]
  created_at: string
}

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  total: number
}

export default function BillingPage() {
  const [plans, setPlans] = useState<BillingPlan[]>([])
  const [usage, setUsage] = useState<Usage[]>([])
  const [quotas, setQuotas] = useState<Quota[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(false)
  const [planModalVisible, setPlanModalVisible] = useState(false)
  const [quotaModalVisible, setQuotaModalVisible] = useState(false)
  const [invoiceDrawerVisible, setInvoiceDrawerVisible] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [form] = Form.useForm()
  const [quotaForm] = Form.useForm()
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('30d')

  // 计费相关数据
  const billingStats = [
    {
      title: '当前计划',
      value: '专业版',
      change: { value: 0, type: 'increase' as const },
    },
    {
      title: '本月费用',
      value: '$245.60',
      change: { value: 12.3, type: 'increase' as const },
    },
    {
      title: '使用率',
      value: '78%',
      change: { value: 5.2, type: 'increase' as const },
    },
    {
      title: '剩余配额',
      value: '22%',
      change: { value: 5.2, type: 'decrease' as const },
    }
  ]

  const usageBreakdown = [
    { name: 'API 调用', used: 125000, limit: 200000, color: 'var(--color-primary-500)' },
    { name: 'Token 消耗', used: 2500000, limit: 5000000, color: 'var(--color-semantic-success)' },
    { name: '存储空间', used: 15.2, limit: 50, color: 'var(--color-semantic-warning)' },
    { name: 'Agent 数量', used: 8, limit: 20, color: 'var(--color-semantic-error)' },
  ]

  useEffect(() => {
    fetchPlans()
    fetchUsage()
    fetchQuotas()
    fetchPaymentMethods()
    fetchInvoices()
  }, [])

  const fetchPlans = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API}/billing/plans`)
      if (response.ok) {
        const plansData = await response.json()
        // 模拟计费计划数据
        const mockPlans: BillingPlan[] = [
          {
            id: '1',
            name: '基础版',
            description: '适合个人用户和小团队',
            price: 29,
            currency: 'USD',
            billing_cycle: 'monthly',
            features: ['10,000 API 调用', '100,000 Tokens', '1GB 存储', '3个 Agent'],
            limits: {
              api_calls: 10000,
              tokens: 100000,
              storage: 1,
              agents: 3,
              workflows: 5,
            },
            status: 'active',
            created_at: new Date().toISOString(),
          },
          {
            id: '2',
            name: '专业版',
            description: '适合中型团队和企业',
            price: 99,
            currency: 'USD',
            billing_cycle: 'monthly',
            features: ['100,000 API 调用', '1,000,000 Tokens', '10GB 存储', '20个 Agent'],
            limits: {
              api_calls: 100000,
              tokens: 1000000,
              storage: 10,
              agents: 20,
              workflows: 50,
            },
            status: 'active',
            created_at: new Date().toISOString(),
          },
          {
            id: '3',
            name: '企业版',
            description: '适合大型企业和组织',
            price: 299,
            currency: 'USD',
            billing_cycle: 'monthly',
            features: ['无限 API 调用', '无限 Tokens', '100GB 存储', '无限 Agent'],
            limits: {
              api_calls: -1,
              tokens: -1,
              storage: 100,
              agents: -1,
              workflows: -1,
            },
            status: 'active',
            created_at: new Date().toISOString(),
          },
        ]
        setPlans(mockPlans)
      }
    } catch (error) {
      message.error('获取计费计划失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsage = async () => {
    try {
      // 模拟使用量数据
      const mockUsage: Usage[] = [
        {
          id: '1',
          user_id: 'user-1',
          plan_id: '2',
          period_start: new Date(Date.now() - 2592000000).toISOString(),
          period_end: new Date().toISOString(),
          api_calls: 125000,
          tokens: 2500000,
          storage: 15.2,
          agents: 8,
          workflows: 25,
          cost: 245.60,
          status: 'current',
        },
        {
          id: '2',
          user_id: 'user-1',
          plan_id: '2',
          period_start: new Date(Date.now() - 5184000000).toISOString(),
          period_end: new Date(Date.now() - 2592000000).toISOString(),
          api_calls: 98000,
          tokens: 2100000,
          storage: 12.8,
          agents: 6,
          workflows: 20,
          cost: 198.40,
          status: 'past',
        },
      ]
      setUsage(mockUsage)
    } catch (error) {
      message.error('获取使用量失败')
    }
  }

  const fetchQuotas = async () => {
    try {
      // 模拟配额数据
      const mockQuotas: Quota[] = [
        {
          id: '1',
          user_id: 'user-1',
          resource_type: 'api_calls',
          limit: 200000,
          used: 125000,
          reset_period: 'monthly',
          reset_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'normal',
        },
        {
          id: '2',
          user_id: 'user-1',
          resource_type: 'tokens',
          limit: 5000000,
          used: 2500000,
          reset_period: 'monthly',
          reset_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'normal',
        },
        {
          id: '3',
          user_id: 'user-1',
          resource_type: 'storage',
          limit: 50,
          used: 15.2,
          reset_period: 'monthly',
          reset_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'normal',
        },
        {
          id: '4',
          user_id: 'user-1',
          resource_type: 'agents',
          limit: 20,
          used: 8,
          reset_period: 'monthly',
          reset_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'normal',
        },
      ]
      setQuotas(mockQuotas)
    } catch (error) {
      message.error('获取配额信息失败')
    }
  }

  const fetchPaymentMethods = async () => {
    try {
      // 模拟支付方式数据
      const mockPaymentMethods: PaymentMethod[] = [
        {
          id: '1',
          type: 'credit_card',
          last_four: '4242',
          brand: 'Visa',
          expiry_month: 12,
          expiry_year: 2025,
          is_default: true,
          status: 'active',
        },
        {
          id: '2',
          type: 'credit_card',
          last_four: '5555',
          brand: 'Mastercard',
          expiry_month: 8,
          expiry_year: 2024,
          is_default: false,
          status: 'active',
        },
      ]
      setPaymentMethods(mockPaymentMethods)
    } catch (error) {
      message.error('获取支付方式失败')
    }
  }

  const fetchInvoices = async () => {
    try {
      // 模拟发票数据
      const mockInvoices: Invoice[] = [
        {
          id: '1',
          user_id: 'user-1',
          plan_id: '2',
          amount: 245.60,
          currency: 'USD',
          status: 'paid',
          due_date: new Date(Date.now() - 86400000).toISOString(),
          paid_date: new Date(Date.now() - 86400000).toISOString(),
          items: [
            {
              id: '1',
              description: '专业版订阅 - 2024年1月',
              quantity: 1,
              unit_price: 99.00,
              total: 99.00,
            },
            {
              id: '2',
              description: '额外 API 调用 (25,000)',
              quantity: 25000,
              unit_price: 0.002,
              total: 50.00,
            },
            {
              id: '3',
              description: '额外 Token 消耗 (500,000)',
              quantity: 500000,
              unit_price: 0.0001,
              total: 50.00,
            },
            {
              id: '4',
              description: '额外存储空间 (5.2GB)',
              quantity: 5.2,
              unit_price: 0.1,
              total: 0.52,
            },
          ],
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: '2',
          user_id: 'user-1',
          plan_id: '2',
          amount: 198.40,
          currency: 'USD',
          status: 'paid',
          due_date: new Date(Date.now() - 2592000000).toISOString(),
          paid_date: new Date(Date.now() - 2592000000).toISOString(),
          items: [
            {
              id: '1',
              description: '专业版订阅 - 2023年12月',
              quantity: 1,
              unit_price: 99.00,
              total: 99.00,
            },
          ],
          created_at: new Date(Date.now() - 2592000000).toISOString(),
        },
      ]
      setInvoices(mockInvoices)
    } catch (error) {
      message.error('获取发票列表失败')
    }
  }

  const createPlan = async (values: any) => {
    try {
      const response = await fetch(`${API}/billing/plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (response.ok) {
        message.success('计费计划创建成功')
        setPlanModalVisible(false)
        form.resetFields()
        fetchPlans()
      } else {
        message.error('计费计划创建失败')
      }
    } catch (error) {
      message.error('计费计划创建失败')
    }
  }

  const updateQuota = async (values: any) => {
    try {
      const response = await fetch(`${API}/billing/quotas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (response.ok) {
        message.success('配额更新成功')
        setQuotaModalVisible(false)
        quotaForm.resetFields()
        fetchQuotas()
      } else {
        message.error('配额更新失败')
      }
    } catch (error) {
      message.error('配额更新失败')
    }
  }

  const downloadInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`${API}/billing/invoices/${invoiceId}/download`)
      if (response.ok) {
        message.success('发票下载已开始')
      } else {
        message.error('发票下载失败')
      }
    } catch (error) {
      message.error('发票下载失败')
    }
  }

  const getResourceTypeLabel = (type: string) => {
    switch (type) {
      case 'api_calls': return 'API 调用'
      case 'tokens': return 'Token 消耗'
      case 'storage': return '存储空间'
      case 'agents': return 'Agent 数量'
      case 'workflows': return '工作流数量'
      default: return type
    }
  }

  const getResourceTypeUnit = (type: string) => {
    switch (type) {
      case 'api_calls': return '次'
      case 'tokens': return '个'
      case 'storage': return 'GB'
      case 'agents': return '个'
      case 'workflows': return '个'
      default: return ''
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'inactive': return 'warning'
      case 'archived': return 'default'
      case 'paid': return 'success'
      case 'pending': return 'processing'
      case 'failed': return 'error'
      case 'refunded': return 'default'
      case 'normal': return 'success'
      case 'warning': return 'warning'
      case 'exceeded': return 'error'
      default: return 'default'
    }
  }

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0 // 无限制
    return Math.round((used / limit) * 100)
  }

  const getQuotaStatus = (used: number, limit: number) => {
    if (limit === -1) return 'normal' // 无限制
    const percentage = (used / limit) * 100
    if (percentage >= 100) return 'exceeded'
    if (percentage >= 80) return 'warning'
    return 'normal'
  }

  return (
    <PageLayout>
      <div className="space-y-1 h-full flex flex-col">
        {/* 顶部区域：统计卡片 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-1 flex-shrink-0">
          {billingStats.map((stat, index) => (
            <UICard key={index}>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Text size="sm" type="tertiary">{stat.title}</Text>
                    <div className="mt-1">
                      <NumberDisplay value={stat.value} size="lg" weight="bold" />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs ${stat.change.type === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
                      {stat.change.type === 'increase' ? '+' : '-'}{stat.change.value}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </UICard>
          ))}
        </div>

        {/* 中间区域：使用量概览 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 flex-shrink-0">
          <UICard>
            <CardHeader title="使用量概览" />
            <CardContent>
              <div className="space-y-3">
                {usageBreakdown.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <Text size="sm" type="secondary">{item.name}</Text>
                      <Text size="sm" type="primary">
                        {formatNumber(item.used)} / {item.limit === -1 ? '∞' : formatNumber(item.limit)}
                      </Text>
                    </div>
                    <Progress 
                      percent={getUsagePercentage(item.used, item.limit)} 
                      size="small"
                      status={getQuotaStatus(item.used, item.limit) === 'exceeded' ? 'exception' : 
                              getQuotaStatus(item.used, item.limit) === 'warning' ? 'active' : 'success'}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </UICard>

          <UICard>
            <CardHeader title="配额状态" />
            <CardContent>
              <div className="space-y-2">
                {quotas.map(quota => (
                  <div key={quota.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <StatusIndicator status={getStatusColor(quota.status) as any} />
                      <Text size="sm" type="secondary">{getResourceTypeLabel(quota.resource_type)}</Text>
                    </div>
                    <div className="text-right">
                      <Text size="sm" type="primary">
                        {formatNumber(quota.used)} / {quota.limit === -1 ? '∞' : formatNumber(quota.limit)}
                      </Text>
                      <div className="text-xs text-gray-500">
                        {getUsagePercentage(quota.used, quota.limit)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </UICard>
        </div>

        {/* 底部区域：计费管理 */}
        <div className="flex-1 min-h-0">
          <UICard className="h-full">
            <CardHeader
              title="计费管理"
              action={
                <Space>
                  <Button size="small" onClick={() => setPlanModalVisible(true)}>
                    <PlusOutlined /> 创建计划
                  </Button>
                  <Button size="small" onClick={() => setQuotaModalVisible(true)}>
                    <SettingOutlined /> 配额设置
                  </Button>
                  <Button size="small" icon={<DownloadOutlined />}>导出账单</Button>
                </Space>
              }
            />
            <CardContent>
              <div className="h-full overflow-y-auto">
                <Tabs defaultActiveKey="invoices">
                  <Tabs.TabPane tab="发票记录" key="invoices">
                    <Table
                      loading={loading}
                      dataSource={invoices}
                      pagination={false}
                      scroll={{ y: 200 }}
                      size="small"
                      columns={[
                        { 
                          title: '发票号', 
                          dataIndex: 'id', 
                          width: 100,
                          render: (id: string) => `#${id}`
                        },
                        { 
                          title: '金额', 
                          dataIndex: 'amount', 
                          width: 100,
                          render: (amount: number, record: Invoice) => `$${amount.toFixed(2)} ${record.currency}`
                        },
                        { 
                          title: '状态', 
                          dataIndex: 'status', 
                          width: 80,
                          render: (status: string) => (
                            <Tag color={getStatusColor(status)}>{status}</Tag>
                          )
                        },
                        { 
                          title: '到期日期', 
                          dataIndex: 'due_date', 
                          width: 120,
                          render: (date: string) => new Date(date).toLocaleDateString()
                        },
                        { 
                          title: '支付日期', 
                          dataIndex: 'paid_date', 
                          width: 120,
                          render: (date: string) => date ? new Date(date).toLocaleDateString() : '-'
                        },
                        { 
                          title: '操作', 
                          width: 120,
                          render: (_, record: Invoice) => (
                            <Space size="small">
                              <Button 
                                size="small" 
                                icon={<EyeOutlined />}
                                onClick={() => {
                                  setSelectedInvoice(record)
                                  setInvoiceDrawerVisible(true)
                                }}
                              >
                                查看
                              </Button>
                              <Button 
                                size="small" 
                                icon={<DownloadOutlined />}
                                onClick={() => downloadInvoice(record.id)}
                              >
                                下载
                              </Button>
                            </Space>
                          )
                        }
                      ]}
                    />
                  </Tabs.TabPane>

                  <Tabs.TabPane tab="计费计划" key="plans">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {plans.map(plan => (
                        <Card key={plan.id} className="relative">
                          <div className="text-center">
                            <Title level={4}>{plan.name}</Title>
                            <div className="text-2xl font-bold text-primary">
                              ${plan.price}
                              <span className="text-sm text-gray-500">/{plan.billing_cycle === 'monthly' ? '月' : '年'}</span>
                            </div>
                            <Text type="secondary" className="block mt-2">{plan.description}</Text>
                          </div>
                          <div className="mt-4 space-y-2">
                            {plan.features.map((feature, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <CheckCircleOutlined className="text-green-500" />
                                <Text size="sm">{feature}</Text>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 flex space-x-2">
                            <Button type="primary" block>选择计划</Button>
                            <Button icon={<EditOutlined />} />
                          </div>
                        </Card>
                      ))}
                    </div>
                  </Tabs.TabPane>

                  <Tabs.TabPane tab="支付方式" key="payment">
                    <div className="space-y-4">
                      {paymentMethods.map(method => (
                        <Card key={method.id} size="small">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <CreditCardOutlined className="text-xl" />
                              <div>
                                <Text type="primary">
                                  {method.brand} •••• {method.last_four}
                                </Text>
                                <div className="text-sm text-gray-500">
                                  过期时间: {method.expiry_month}/{method.expiry_year}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {method.is_default && (
                                <Tag color="green">默认</Tag>
                              )}
                              <Tag color={getStatusColor(method.status)}>{method.status}</Tag>
                              <Button size="small" icon={<EditOutlined />} />
                              <Button size="small" icon={<DeleteOutlined />} danger />
                            </div>
                          </div>
                        </Card>
                      ))}
                      <Button type="dashed" block icon={<PlusOutlined />}>
                        添加支付方式
                      </Button>
                    </div>
                  </Tabs.TabPane>
                </Tabs>
              </div>
            </CardContent>
          </UICard>
        </div>
      </div>

      {/* 创建计费计划模态框 */}
      <Modal
        title="创建计费计划"
        open={planModalVisible}
        onCancel={() => setPlanModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} onFinish={createPlan} layout="vertical">
          <Form.Item name="name" label="计划名称" rules={[{ required: true }]}>
            <Input placeholder="请输入计划名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="请输入计划描述" />
          </Form.Item>
          <Form.Item name="price" label="价格" rules={[{ required: true }]}>
            <Input type="number" placeholder="请输入价格" />
          </Form.Item>
          <Form.Item name="billing_cycle" label="计费周期" rules={[{ required: true }]}>
            <Select placeholder="请选择计费周期">
              <Select.Option value="monthly">按月</Select.Option>
              <Select.Option value="yearly">按年</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="features" label="功能特性">
            <Input.TextArea rows={4} placeholder="请输入功能特性，每行一个" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 配额设置模态框 */}
      <Modal
        title="配额设置"
        open={quotaModalVisible}
        onCancel={() => setQuotaModalVisible(false)}
        onOk={() => quotaForm.submit()}
      >
        <Form form={quotaForm} onFinish={updateQuota} layout="vertical">
          <Form.Item name="resource_type" label="资源类型" rules={[{ required: true }]}>
            <Select placeholder="请选择资源类型">
              <Select.Option value="api_calls">API 调用</Select.Option>
              <Select.Option value="tokens">Token 消耗</Select.Option>
              <Select.Option value="storage">存储空间</Select.Option>
              <Select.Option value="agents">Agent 数量</Select.Option>
              <Select.Option value="workflows">工作流数量</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="limit" label="限制数量" rules={[{ required: true }]}>
            <Input type="number" placeholder="请输入限制数量，-1表示无限制" />
          </Form.Item>
          <Form.Item name="reset_period" label="重置周期" rules={[{ required: true }]}>
            <Select placeholder="请选择重置周期">
              <Select.Option value="daily">每日</Select.Option>
              <Select.Option value="monthly">每月</Select.Option>
              <Select.Option value="yearly">每年</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 发票详情抽屉 */}
      <Drawer
        title="发票详情"
        width={600}
        open={invoiceDrawerVisible}
        onClose={() => setInvoiceDrawerVisible(false)}
      >
        {selectedInvoice && (
          <div className="space-y-4">
            <Card>
              <Descriptions column={2} size="small">
                <Descriptions.Item label="发票号">#{selectedInvoice.id}</Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag color={getStatusColor(selectedInvoice.status)}>{selectedInvoice.status}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="金额">
                  ${selectedInvoice.amount.toFixed(2)} {selectedInvoice.currency}
                </Descriptions.Item>
                <Descriptions.Item label="到期日期">
                  {new Date(selectedInvoice.due_date).toLocaleDateString()}
                </Descriptions.Item>
                <Descriptions.Item label="支付日期">
                  {selectedInvoice.paid_date ? new Date(selectedInvoice.paid_date).toLocaleDateString() : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {new Date(selectedInvoice.created_at).toLocaleDateString()}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="费用明细">
              <div className="space-y-2">
                {selectedInvoice.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <Text type="primary">{item.description}</Text>
                      <div className="text-sm text-gray-500">
                        数量: {item.quantity} × ${item.unit_price.toFixed(2)}
                      </div>
                    </div>
                    <Text type="primary">${item.total.toFixed(2)}</Text>
                  </div>
                ))}
                <Divider />
                <div className="flex items-center justify-between font-bold">
                  <Text type="primary">总计</Text>
                  <Text type="primary">${selectedInvoice.amount.toFixed(2)}</Text>
                </div>
              </div>
            </Card>

            <div className="flex space-x-2">
              <Button type="primary" icon={<DownloadOutlined />} onClick={() => downloadInvoice(selectedInvoice.id)}>
                下载发票
              </Button>
              <Button>发送邮件</Button>
            </div>
          </div>
        )}
      </Drawer>
    </PageLayout>
  )
}

