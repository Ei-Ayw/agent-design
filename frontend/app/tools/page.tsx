/**
 * 文件作用：工具页面，实现 Schema/分权功能
 */

"use client"

import React, { useEffect, useState } from 'react'
import { Table, Space, Button, Modal, Form, Input, Select, message, Drawer, Tabs, Tag, Card, Descriptions, Switch, Tree, CodeEditor, Alert, Divider } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, KeyOutlined, UserOutlined, TeamOutlined, CodeOutlined, TestTubeOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons'
import { PageLayout } from '../../components/ui/Layout'
import { Card as UICard, CardHeader, CardContent } from '../../components/ui/Card'
import { Title, Text, NumberDisplay } from '../../components/ui/Typography'
import { StatusIndicator } from '../../components/ui/Status'
import { formatNumber, formatTime } from '../../lib/utils'

const API = 'http://localhost:8000'

interface Tool {
  id: string
  name: string
  description?: string
  category: string
  status: 'active' | 'inactive' | 'error'
  schema: any
  permissions: ToolPermission[]
  usage_count?: number
  success_rate?: number
  avg_latency?: number
  last_used?: string
  created_at?: string
  created_by?: string
}

interface ToolPermission {
  id: string
  tool_id: string
  user_id?: string
  role_id?: string
  permission_type: 'read' | 'execute' | 'admin'
  granted_by: string
  granted_at: string
  expires_at?: string
}

interface ToolSchema {
  name: string
  description: string
  parameters: {
    type: string
    properties: Record<string, any>
    required: string[]
  }
  returns: {
    type: string
    description: string
  }
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
}

export default function ToolsPage() {
  const [data, setData] = useState<Tool[]>([])
  const [permissions, setPermissions] = useState<ToolPermission[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [permissionModalVisible, setPermissionModalVisible] = useState(false)
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false)
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null)
  const [form] = Form.useForm()
  const [permissionForm] = Form.useForm()
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // 工具 Schema/分权相关数据
  const toolStats = [
    {
      title: '工具总数',
      value: formatNumber(data.length),
      change: { value: 8.3, type: 'increase' as const },
    },
    {
      title: '已发布工具',
      value: formatNumber(data.filter(t => t.status === 'active').length),
      change: { value: 12.5, type: 'increase' as const },
    },
    {
      title: '需要权限',
      value: formatNumber(data.filter(t => t.permissions.length > 0).length),
      change: { value: 5.2, type: 'increase' as const },
    },
    {
      title: '今日调用',
      value: formatNumber(data.reduce((sum, t) => sum + (t.usage_count || 0), 0)),
      change: { value: 18.7, type: 'increase' as const },
    }
  ]

  const categoryData = [
    { name: 'API 调用', count: data.filter(t => t.category === 'api').length, color: 'var(--color-primary-500)' },
    { name: '数据处理', count: data.filter(t => t.category === 'data').length, color: 'var(--color-semantic-success)' },
    { name: '文件操作', count: data.filter(t => t.category === 'file').length, color: 'var(--color-semantic-warning)' },
    { name: '系统工具', count: data.filter(t => t.category === 'system').length, color: 'var(--color-semantic-error)' },
  ]

  useEffect(() => {
    fetchTools()
    fetchPermissions()
    fetchUsers()
    fetchRoles()
  }, [])

  const fetchTools = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API}/tools`)
      if (response.ok) {
        const tools = await response.json()
        // 为每个工具添加模拟数据
        const toolsWithData = tools.map((tool: any) => ({
          ...tool,
          category: ['api', 'data', 'file', 'system'][Math.floor(Math.random() * 4)],
          usage_count: Math.floor(Math.random() * 1000),
          success_rate: Math.floor(Math.random() * 20) + 80,
          avg_latency: Math.floor(Math.random() * 2000) + 500,
          last_used: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          created_at: new Date(Date.now() - Math.random() * 2592000000).toISOString(),
          created_by: 'admin',
          permissions: [],
        }))
        setData(toolsWithData)
      }
    } catch (error) {
      message.error('获取工具列表失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchPermissions = async () => {
    try {
      // 模拟权限数据
      const mockPermissions: ToolPermission[] = [
        {
          id: '1',
          tool_id: 'tool-1',
          user_id: 'user-1',
          permission_type: 'execute',
          granted_by: 'admin',
          granted_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: '2',
          tool_id: 'tool-2',
          role_id: 'role-1',
          permission_type: 'read',
          granted_by: 'admin',
          granted_at: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: '3',
          tool_id: 'tool-3',
          user_id: 'user-2',
          permission_type: 'admin',
          granted_by: 'admin',
          granted_at: new Date(Date.now() - 259200000).toISOString(),
          expires_at: new Date(Date.now() + 2592000000).toISOString(),
        },
      ]
      setPermissions(mockPermissions)
    } catch (error) {
      message.error('获取权限列表失败')
    }
  }

  const fetchUsers = async () => {
    try {
      // 模拟用户数据
      const mockUsers: User[] = [
        { id: 'user-1', name: '张三', email: 'zhangsan@example.com', role: 'developer' },
        { id: 'user-2', name: '李四', email: 'lisi@example.com', role: 'admin' },
        { id: 'user-3', name: '王五', email: 'wangwu@example.com', role: 'user' },
      ]
      setUsers(mockUsers)
    } catch (error) {
      message.error('获取用户列表失败')
    }
  }

  const fetchRoles = async () => {
    try {
      // 模拟角色数据
      const mockRoles: Role[] = [
        { 
          id: 'role-1', 
          name: '开发者', 
          description: '可以创建和执行工具',
          permissions: ['tool:read', 'tool:execute', 'tool:create']
        },
        { 
          id: 'role-2', 
          name: '管理员', 
          description: '拥有所有权限',
          permissions: ['tool:read', 'tool:execute', 'tool:create', 'tool:admin']
        },
        { 
          id: 'role-3', 
          name: '普通用户', 
          description: '只能执行已授权的工具',
          permissions: ['tool:execute']
        },
      ]
      setRoles(mockRoles)
    } catch (error) {
      message.error('获取角色列表失败')
    }
  }

  const createTool = async (values: any) => {
    try {
      const response = await fetch(`${API}/tools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (response.ok) {
        message.success('工具创建成功')
        setModalVisible(false)
        form.resetFields()
        fetchTools()
      } else {
        message.error('工具创建失败')
      }
    } catch (error) {
      message.error('工具创建失败')
    }
  }

  const testTool = async (toolId: string, parameters: any) => {
    try {
      const response = await fetch(`${API}/tools/${toolId}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parameters }),
      })
      if (response.ok) {
        const result = await response.json()
        message.success('工具测试成功')
        return result
      } else {
        message.error('工具测试失败')
      }
    } catch (error) {
      message.error('工具测试失败')
    }
  }

  const grantPermission = async (values: any) => {
    try {
      const response = await fetch(`${API}/tools/${selectedTool?.id}/permissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (response.ok) {
        message.success('权限授予成功')
        setPermissionModalVisible(false)
        permissionForm.resetFields()
        fetchPermissions()
      } else {
        message.error('权限授予失败')
      }
    } catch (error) {
      message.error('权限授予失败')
    }
  }

  const revokePermission = async (permissionId: string) => {
    try {
      const response = await fetch(`${API}/tools/permissions/${permissionId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        message.success('权限撤销成功')
        fetchPermissions()
      } else {
        message.error('权限撤销失败')
      }
    } catch (error) {
      message.error('权限撤销失败')
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'api': return 'API 调用'
      case 'data': return '数据处理'
      case 'file': return '文件操作'
      case 'system': return '系统工具'
      default: return category
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'api': return 'blue'
      case 'data': return 'green'
      case 'file': return 'orange'
      case 'system': return 'red'
      default: return 'default'
    }
  }

  const getPermissionTypeLabel = (type: string) => {
    switch (type) {
      case 'read': return '读取'
      case 'execute': return '执行'
      case 'admin': return '管理'
      default: return type
    }
  }

  const getPermissionTypeColor = (type: string) => {
    switch (type) {
      case 'read': return 'blue'
      case 'execute': return 'green'
      case 'admin': return 'red'
      default: return 'default'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'inactive': return 'warning'
      case 'error': return 'error'
      default: return 'default'
    }
  }

  const filteredData = data.filter(tool => 
    filterStatus === 'all' || tool.status === filterStatus
  )

  const toolPermissions = permissions.filter(p => p.tool_id === selectedTool?.id)

  return (
    <PageLayout>
      <div className="space-y-1 h-full flex flex-col">
        {/* 顶部区域：统计卡片 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-1 flex-shrink-0">
          {toolStats.map((stat, index) => (
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

        {/* 中间区域：快速操作 + 状态概览 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-1 flex-shrink-0">
          <UICard>
            <CardHeader title="快速操作" />
            <CardContent>
              <div className="grid grid-cols-2 gap-1">
                <button 
                  className="p-1 border border-[var(--color-border-1)] rounded hover:bg-[var(--color-bg-2)] transition-colors"
                  onClick={() => setModalVisible(true)}
                >
                  <div className="text-center">
                    <div className="text-sm mb-1">🔧</div>
                    <Text size="sm" type="primary">创建工具</Text>
                  </div>
                </button>
                <button className="p-1 border border-[var(--color-border-1)] rounded hover:bg-[var(--color-bg-2)] transition-colors">
                  <div className="text-center">
                    <div className="text-sm mb-1">📦</div>
                    <Text size="sm" type="primary">导入工具</Text>
                  </div>
                </button>
                <button className="p-1 border border-[var(--color-border-1)] rounded hover:bg-[var(--color-bg-2)] transition-colors">
                  <div className="text-center">
                    <div className="text-sm mb-1">🧪</div>
                    <Text size="sm" type="primary">工具测试</Text>
                  </div>
                </button>
                <button className="p-1 border border-[var(--color-border-1)] rounded hover:bg-[var(--color-bg-2)] transition-colors">
                  <div className="text-center">
                    <div className="text-sm mb-1">🔐</div>
                    <Text size="sm" type="primary">权限管理</Text>
                  </div>
                </button>
              </div>
            </CardContent>
          </UICard>

          <UICard>
            <CardHeader title="工具分类" />
            <CardContent>
              <div className="space-y-1">
                {categoryData.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <Text size="sm" type="secondary">{category.name}</Text>
                    <div className="flex items-center space-x-1">
                      <div className="w-8 h-1.5 bg-[var(--color-bg-3)] rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full" 
                          style={{ 
                            width: `${(category.count / Math.max(...categoryData.map(c => c.count))) * 100}%`,
                            backgroundColor: category.color
                          }}
                        ></div>
                      </div>
                      <Text size="sm" type="primary">{category.count}</Text>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </UICard>

          <UICard>
            <CardHeader title="权限状态" />
            <CardContent>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <StatusIndicator status="success" />
                    <Text size="sm" type="secondary">已授权</Text>
                  </div>
                  <Text size="sm" type="primary">{data.filter(t => t.permissions.length > 0).length}</Text>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <StatusIndicator status="warning" />
                    <Text size="sm" type="secondary">公开工具</Text>
                  </div>
                  <Text size="sm" type="primary">{data.filter(t => t.permissions.length === 0).length}</Text>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <StatusIndicator status="error" />
                    <Text size="sm" type="secondary">权限过期</Text>
                  </div>
                  <Text size="sm" type="primary">0</Text>
                </div>
              </div>
            </CardContent>
          </UICard>

          <UICard>
            <CardHeader title="使用排行" />
            <CardContent>
              <div className="space-y-1">
                {data.slice(0, 3).map((tool, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 rounded-full" style={{
                        backgroundColor: getCategoryColor(tool.category) === 'blue' ? 'var(--color-primary-500)' : 
                                        getCategoryColor(tool.category) === 'green' ? 'var(--color-semantic-success)' :
                                        getCategoryColor(tool.category) === 'orange' ? 'var(--color-semantic-warning)' : 'var(--color-semantic-error)'
                      }}></div>
                      <Text size="sm" type="primary">{tool.name}</Text>
                    </div>
                    <Text size="sm" type="tertiary">{formatNumber(tool.usage_count || 0)} 次</Text>
                  </div>
                ))}
              </div>
            </CardContent>
          </UICard>
        </div>

        {/* 底部区域：工具列表 */}
        <div className="flex-1 min-h-0">
          <UICard className="h-full">
            <CardHeader
              title="工具管理"
              action={
                <Space>
                  <Select
                    size="small"
                    value={filterStatus}
                    onChange={setFilterStatus}
                    options={[
                      { value: 'all', label: '全部状态' },
                      { value: 'active', label: '已发布' },
                      { value: 'inactive', label: '草稿' },
                      { value: 'error', label: '异常' }
                    ]}
                  />
                  <Button type="primary" size="small" onClick={() => setModalVisible(true)}>
                    <PlusOutlined /> 新建工具
                  </Button>
                </Space>
              }
            />
            <CardContent>
              <div className="h-full overflow-y-auto">
                <Table
                  loading={loading}
                  dataSource={filteredData}
                  pagination={false}
                  scroll={{ y: 200 }}
                  size="small"
                  columns={[
                    { 
                      title: '状态', 
                      dataIndex: 'status', 
                      width: 60,
                      render: (status: string) => (
                        <StatusIndicator status={getStatusColor(status) as any} />
                      )
                    },
                    { title: '工具名称', dataIndex: 'name', width: 120 },
                    { 
                      title: '分类', 
                      dataIndex: 'category', 
                      width: 80,
                      render: (category: string) => (
                        <Tag color={getCategoryColor(category)}>
                          {getCategoryLabel(category)}
                        </Tag>
                      )
                    },
                    { title: '描述', dataIndex: 'description', width: 150, ellipsis: true },
                    { 
                      title: '权限', 
                      dataIndex: 'permissions', 
                      width: 80,
                      render: (permissions: ToolPermission[]) => (
                        <Tag color={permissions.length > 0 ? 'orange' : 'green'}>
                          {permissions.length > 0 ? '受限' : '公开'}
                        </Tag>
                      )
                    },
                    { 
                      title: '今日调用', 
                      dataIndex: 'usage_count', 
                      width: 80,
                      render: (value: number) => formatNumber(value || 0)
                    },
                    { 
                      title: '成功率', 
                      dataIndex: 'success_rate', 
                      width: 80,
                      render: (value: number) => `${value || 0}%`
                    },
                    { 
                      title: '操作', 
                      width: 200,
                      render: (_, record: Tool) => (
                        <Space size="small">
                          <Button 
                            size="small" 
                            icon={<EyeOutlined />}
                            onClick={() => {
                              setSelectedTool(record)
                              setDetailDrawerVisible(true)
                            }}
                          >
                            详情
                          </Button>
                          <Button 
                            size="small" 
                            icon={<KeyOutlined />}
                            onClick={() => {
                              setSelectedTool(record)
                              setPermissionModalVisible(true)
                            }}
                          >
                            权限
                          </Button>
                          <Button 
                            size="small" 
                            icon={<TestTubeOutlined />}
                            onClick={() => {
                              setSelectedTool(record)
                              setDetailDrawerVisible(true)
                            }}
                          >
                            测试
                          </Button>
                        </Space>
                      )
                    }
                  ]}
                />
              </div>
            </CardContent>
          </UICard>
        </div>
      </div>

      {/* 创建工具模态框 */}
      <Modal
        title="创建工具"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={800}
      >
        <Form form={form} onFinish={createTool} layout="vertical">
          <Form.Item name="name" label="工具名称" rules={[{ required: true }]}>
            <Input placeholder="请输入工具名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="请输入工具描述" />
          </Form.Item>
          <Form.Item name="category" label="分类" rules={[{ required: true }]}>
            <Select placeholder="请选择分类">
              <Select.Option value="api">API 调用</Select.Option>
              <Select.Option value="data">数据处理</Select.Option>
              <Select.Option value="file">文件操作</Select.Option>
              <Select.Option value="system">系统工具</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="schema" label="Schema 定义" rules={[{ required: true }]}>
            <Input.TextArea 
              rows={10} 
              placeholder="请输入 JSON Schema 定义"
              defaultValue={JSON.stringify({
                name: "example_tool",
                description: "示例工具",
                parameters: {
                  type: "object",
                  properties: {
                    param1: {
                      type: "string",
                      description: "参数1"
                    }
                  },
                  required: ["param1"]
                },
                returns: {
                  type: "object",
                  description: "返回结果"
                }
              }, null, 2)}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 权限管理模态框 */}
      <Modal
        title="权限管理"
        open={permissionModalVisible}
        onCancel={() => setPermissionModalVisible(false)}
        onOk={() => permissionForm.submit()}
      >
        <Form form={permissionForm} onFinish={grantPermission} layout="vertical">
          <Form.Item name="permission_type" label="权限类型" rules={[{ required: true }]}>
            <Select placeholder="请选择权限类型">
              <Select.Option value="read">读取</Select.Option>
              <Select.Option value="execute">执行</Select.Option>
              <Select.Option value="admin">管理</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="grant_type" label="授权类型" rules={[{ required: true }]}>
            <Select placeholder="请选择授权类型">
              <Select.Option value="user">用户</Select.Option>
              <Select.Option value="role">角色</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="user_id" label="用户" dependencies={['grant_type']}>
            <Select placeholder="请选择用户" disabled={permissionForm.getFieldValue('grant_type') !== 'user'}>
              {users.map(user => (
                <Select.Option key={user.id} value={user.id}>{user.name} ({user.email})</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="role_id" label="角色" dependencies={['grant_type']}>
            <Select placeholder="请选择角色" disabled={permissionForm.getFieldValue('grant_type') !== 'role'}>
              {roles.map(role => (
                <Select.Option key={role.id} value={role.id}>{role.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="expires_at" label="过期时间">
            <Input type="datetime-local" placeholder="可选，留空表示永不过期" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 工具详情抽屉 */}
      <Drawer
        title="工具详情"
        width={800}
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
      >
        {selectedTool && (
          <div className="space-y-4">
            <Card>
              <Descriptions column={2} size="small">
                <Descriptions.Item label="工具名称">{selectedTool.name}</Descriptions.Item>
                <Descriptions.Item label="状态">
                  <StatusIndicator status={getStatusColor(selectedTool.status) as any} />
                </Descriptions.Item>
                <Descriptions.Item label="分类">
                  <Tag color={getCategoryColor(selectedTool.category)}>
                    {getCategoryLabel(selectedTool.category)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="创建者">{selectedTool.created_by}</Descriptions.Item>
                <Descriptions.Item label="今日调用">{formatNumber(selectedTool.usage_count || 0)}</Descriptions.Item>
                <Descriptions.Item label="成功率">{selectedTool.success_rate}%</Descriptions.Item>
                <Descriptions.Item label="平均延迟">{formatTime(selectedTool.avg_latency || 0)}</Descriptions.Item>
                <Descriptions.Item label="最后使用">
                  {selectedTool.last_used ? new Date(selectedTool.last_used).toLocaleString() : '从未使用'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Tabs defaultActiveKey="schema">
              <Tabs.TabPane tab="Schema 定义" key="schema">
                <Card>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Text type="secondary">JSON Schema</Text>
                      <Button size="small" icon={<EditOutlined />}>编辑</Button>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <pre className="text-sm overflow-auto">
                        {JSON.stringify(selectedTool.schema || {
                          name: selectedTool.name,
                          description: selectedTool.description,
                          parameters: {
                            type: "object",
                            properties: {},
                            required: []
                          },
                          returns: {
                            type: "object",
                            description: "返回结果"
                          }
                        }, null, 2)}
                      </pre>
                    </div>
                  </div>
                </Card>
              </Tabs.TabPane>

              <Tabs.TabPane tab="权限管理" key="permissions">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Text type="secondary">权限列表</Text>
                    <Button 
                      size="small" 
                      type="primary" 
                      icon={<KeyOutlined />}
                      onClick={() => setPermissionModalVisible(true)}
                    >
                      授予权限
                    </Button>
                  </div>
                  
                  <Table
                    dataSource={toolPermissions}
                    size="small"
                    pagination={false}
                    columns={[
                      { 
                        title: '权限类型', 
                        dataIndex: 'permission_type', 
                        width: 80,
                        render: (type: string) => (
                          <Tag color={getPermissionTypeColor(type)}>
                            {getPermissionTypeLabel(type)}
                          </Tag>
                        )
                      },
                      { 
                        title: '授权对象', 
                        dataIndex: 'user_id', 
                        width: 120,
                        render: (userId: string, record: ToolPermission) => {
                          if (userId) {
                            const user = users.find(u => u.id === userId)
                            return user ? `${user.name} (用户)` : '未知用户'
                          } else if (record.role_id) {
                            const role = roles.find(r => r.id === record.role_id)
                            return role ? `${role.name} (角色)` : '未知角色'
                          }
                          return '-'
                        }
                      },
                      { 
                        title: '授权人', 
                        dataIndex: 'granted_by', 
                        width: 80
                      },
                      { 
                        title: '授权时间', 
                        dataIndex: 'granted_at', 
                        width: 120,
                        render: (time: string) => new Date(time).toLocaleString()
                      },
                      { 
                        title: '过期时间', 
                        dataIndex: 'expires_at', 
                        width: 120,
                        render: (time: string) => time ? new Date(time).toLocaleString() : '永不过期'
                      },
                      { 
                        title: '操作', 
                        width: 80,
                        render: (_, record: ToolPermission) => (
                          <Button 
                            size="small" 
                            type="link" 
                            danger
                            onClick={() => revokePermission(record.id)}
                          >
                            撤销
                          </Button>
                        )
                      }
                    ]}
                  />
                </div>
              </Tabs.TabPane>

              <Tabs.TabPane tab="工具测试" key="test">
                <Card>
                  <div className="space-y-4">
                    <Alert
                      message="工具测试"
                      description="输入测试参数来验证工具功能"
                      type="info"
                      showIcon
                    />
                    
                    <div className="space-y-2">
                      <Text type="secondary">测试参数</Text>
                      <Input.TextArea 
                        rows={6} 
                        placeholder="请输入 JSON 格式的测试参数"
                        defaultValue={JSON.stringify({
                          param1: "test_value"
                        }, null, 2)}
                      />
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        type="primary" 
                        icon={<TestTubeOutlined />}
                        onClick={() => {
                          // 这里应该调用 testTool 函数
                          message.info('工具测试功能待实现')
                        }}
                      >
                        执行测试
                      </Button>
                      <Button>重置参数</Button>
                    </div>
                  </div>
                </Card>
              </Tabs.TabPane>
            </Tabs>
          </div>
        )}
      </Drawer>
    </PageLayout>
  )
}