/**
 * 文件作用：知识库页面，实现索引状态/检索评测功能
 */

"use client"

import React, { useEffect, useState } from 'react'
import { Table, Space, Button, Modal, Form, Input, Select, message, Drawer, Tabs, Progress, Tag, Card, Descriptions, Input as AntInput, Rate, Statistic, Row, Col } from 'antd'
import { PlusOutlined, SearchOutlined, ReloadOutlined, EyeOutlined, EditOutlined, DeleteOutlined, UploadOutlined, DownloadOutlined, BarChartOutlined } from '@ant-design/icons'
import { PageLayout } from '../../components/ui/Layout'
import { Card as UICard, CardHeader, CardContent } from '../../components/ui/Card'
import { Title, Text, NumberDisplay } from '../../components/ui/Typography'
import { StatusIndicator } from '../../components/ui/Status'
import { formatNumber, formatTime } from '../../lib/utils'

const API = 'http://localhost:8000'

interface KnowledgeBase {
  id: string
  name?: string
  description?: string
  status: 'active' | 'indexing' | 'error' | 'paused'
  documents: number
  chunks: number
  size: number
  last_updated: string
  created_at: string
  indexing_progress?: number
  search_count?: number
  avg_response_time?: number
  accuracy_score?: number
}

interface Document {
  id: string
  name: string
  type: string
  size: number
  status: 'pending' | 'processing' | 'indexed' | 'error'
  chunks: number
  indexed_at?: string
  error_message?: string
}

interface SearchTest {
  id: string
  query: string
  expected_answer?: string
  actual_answer: string
  relevance_score: number
  response_time: number
  timestamp: string
  kb_id: string
}

interface IndexJob {
  id: string
  kb_id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  total_documents: number
  processed_documents: number
  start_time: string
  end_time?: string
  error_message?: string
}

export default function KBPage() {
  const [data, setData] = useState<KnowledgeBase[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [searchTests, setSearchTests] = useState<SearchTest[]>([])
  const [indexJobs, setIndexJobs] = useState<IndexJob[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false)
  const [selectedKB, setSelectedKB] = useState<KnowledgeBase | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [form] = Form.useForm()
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // 知识库索引状态相关数据
  const indexingStats = [
    {
      title: '知识库总数',
      value: formatNumber(data.length),
      change: { value: 12.5, type: 'increase' as const },
    },
    {
      title: '正在索引',
      value: formatNumber(data.filter(kb => kb.status === 'indexing').length),
      change: { value: 8.3, type: 'increase' as const },
    },
    {
      title: '索引完成率',
      value: `${Math.round((data.filter(kb => kb.status === 'active').length / Math.max(data.length, 1)) * 100)}%`,
      change: { value: 5.2, type: 'increase' as const },
    },
    {
      title: '平均准确率',
      value: `${Math.round(data.reduce((sum, kb) => sum + (kb.accuracy_score || 0), 0) / Math.max(data.length, 1))}%`,
      change: { value: 2.1, type: 'increase' as const },
    }
  ]

  const documentTypes = [
    { name: 'PDF', count: documents.filter(d => d.type === 'pdf').length, color: 'var(--color-primary-500)' },
    { name: 'Word', count: documents.filter(d => d.type === 'docx').length, color: 'var(--color-semantic-success)' },
    { name: 'TXT', count: documents.filter(d => d.type === 'txt').length, color: 'var(--color-semantic-warning)' },
    { name: 'Markdown', count: documents.filter(d => d.type === 'md').length, color: 'var(--color-semantic-error)' },
  ]

  useEffect(() => {
    fetchKBs()
    fetchDocuments()
    fetchSearchTests()
    fetchIndexJobs()
  }, [])

  const fetchKBs = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API}/kb`)
      if (response.ok) {
        const kbs = await response.json()
        // 为每个知识库添加模拟数据
        const kbsWithData = kbs.map((kb: any) => ({
          ...kb,
          documents: Math.floor(Math.random() * 100) + 10,
          chunks: Math.floor(Math.random() * 1000) + 100,
          size: Math.floor(Math.random() * 1000) + 100,
          last_updated: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          created_at: new Date(Date.now() - Math.random() * 2592000000).toISOString(),
          indexing_progress: Math.floor(Math.random() * 100),
          search_count: Math.floor(Math.random() * 1000),
          avg_response_time: Math.floor(Math.random() * 2000) + 500,
          accuracy_score: Math.floor(Math.random() * 20) + 80,
        }))
        setData(kbsWithData)
      }
    } catch (error) {
      message.error('获取知识库列表失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchDocuments = async () => {
    try {
      // 模拟文档数据
      const mockDocuments: Document[] = [
        {
          id: '1',
          name: '产品手册.pdf',
          type: 'pdf',
          size: 2048000,
          status: 'indexed',
          chunks: 45,
          indexed_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '2',
          name: '技术文档.docx',
          type: 'docx',
          size: 1024000,
          status: 'processing',
          chunks: 0,
        },
        {
          id: '3',
          name: 'FAQ.txt',
          type: 'txt',
          size: 512000,
          status: 'indexed',
          chunks: 12,
          indexed_at: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: '4',
          name: 'API文档.md',
          type: 'md',
          size: 256000,
          status: 'error',
          chunks: 0,
          error_message: '解析失败：格式不支持',
        },
      ]
      setDocuments(mockDocuments)
    } catch (error) {
      message.error('获取文档列表失败')
    }
  }

  const fetchSearchTests = async () => {
    try {
      // 模拟检索评测数据
      const mockTests: SearchTest[] = [
        {
          id: '1',
          query: '如何重置密码？',
          expected_answer: '在登录页面点击忘记密码',
          actual_answer: '您可以在登录页面点击"忘记密码"链接来重置密码',
          relevance_score: 0.95,
          response_time: 1200,
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          kb_id: 'kb-1',
        },
        {
          id: '2',
          query: 'API 调用限制',
          expected_answer: '每分钟100次请求',
          actual_answer: 'API调用限制为每分钟100次请求，超出限制将返回429错误',
          relevance_score: 0.88,
          response_time: 800,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          kb_id: 'kb-1',
        },
        {
          id: '3',
          query: '数据库连接配置',
          expected_answer: '使用环境变量配置',
          actual_answer: '数据库连接信息应通过环境变量进行配置，确保安全性',
          relevance_score: 0.92,
          response_time: 1500,
          timestamp: new Date(Date.now() - 5400000).toISOString(),
          kb_id: 'kb-2',
        },
      ]
      setSearchTests(mockTests)
    } catch (error) {
      message.error('获取检索评测失败')
    }
  }

  const fetchIndexJobs = async () => {
    try {
      // 模拟索引任务数据
      const mockJobs: IndexJob[] = [
        {
          id: '1',
          kb_id: 'kb-1',
          status: 'running',
          progress: 75,
          total_documents: 100,
          processed_documents: 75,
          start_time: new Date(Date.now() - 1800000).toISOString(),
        },
        {
          id: '2',
          kb_id: 'kb-2',
          status: 'completed',
          progress: 100,
          total_documents: 50,
          processed_documents: 50,
          start_time: new Date(Date.now() - 3600000).toISOString(),
          end_time: new Date(Date.now() - 1800000).toISOString(),
        },
        {
          id: '3',
          kb_id: 'kb-3',
          status: 'failed',
          progress: 30,
          total_documents: 80,
          processed_documents: 24,
          start_time: new Date(Date.now() - 7200000).toISOString(),
          end_time: new Date(Date.now() - 5400000).toISOString(),
          error_message: '文档格式不支持',
        },
      ]
      setIndexJobs(mockJobs)
    } catch (error) {
      message.error('获取索引任务失败')
    }
  }

  const createKB = async (values: any) => {
    try {
      const response = await fetch(`${API}/kb`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (response.ok) {
        message.success('知识库创建成功')
        setModalVisible(false)
        form.resetFields()
        fetchKBs()
      } else {
        message.error('知识库创建失败')
      }
    } catch (error) {
      message.error('知识库创建失败')
    }
  }

  const reindexKB = async (kbId: string) => {
    try {
      const response = await fetch(`${API}/kb/${kbId}/reindex`, {
        method: 'POST',
      })
      if (response.ok) {
        message.success('重新索引已启动')
        fetchKBs()
        fetchIndexJobs()
      } else {
        message.error('重新索引失败')
      }
    } catch (error) {
      message.error('重新索引失败')
    }
  }

  const testSearch = async (kbId: string, query: string) => {
    try {
      const response = await fetch(`${API}/kb/${kbId}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit: 5 }),
      })
      if (response.ok) {
        const results = await response.json()
        setSearchResults(results)
        message.success('搜索测试完成')
      } else {
        message.error('搜索测试失败')
      }
    } catch (error) {
      message.error('搜索测试失败')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'indexing': return 'processing'
      case 'error': return 'error'
      case 'paused': return 'warning'
      default: return 'default'
    }
  }

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case 'indexed': return 'success'
      case 'processing': return 'processing'
      case 'error': return 'error'
      case 'pending': return 'default'
      default: return 'default'
    }
  }

  const filteredData = data.filter(kb => 
    filterStatus === 'all' || kb.status === filterStatus
  )

  return (
    <PageLayout>
      <div className="space-y-1 h-full flex flex-col">
        {/* 顶部区域：统计卡片 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-1 flex-shrink-0">
          {indexingStats.map((stat, index) => (
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
                    <div className="text-sm mb-1">📚</div>
                    <Text size="sm" type="primary">创建知识库</Text>
                  </div>
                </button>
                <button className="p-1 border border-[var(--color-border-1)] rounded hover:bg-[var(--color-bg-2)] transition-colors">
                  <div className="text-center">
                    <div className="text-sm mb-1">📄</div>
                    <Text size="sm" type="primary">上传文档</Text>
                  </div>
                </button>
                <button className="p-1 border border-[var(--color-border-1)] rounded hover:bg-[var(--color-bg-2)] transition-colors">
                  <div className="text-center">
                    <div className="text-sm mb-1">🔄</div>
                    <Text size="sm" type="primary">重建索引</Text>
                  </div>
                </button>
                <button className="p-1 border border-[var(--color-border-1)] rounded hover:bg-[var(--color-bg-2)] transition-colors">
                  <div className="text-center">
                    <div className="text-sm mb-1">📊</div>
                    <Text size="sm" type="primary">检索评测</Text>
                  </div>
                </button>
              </div>
            </CardContent>
          </UICard>

          <UICard>
            <CardHeader title="索引状态" />
            <CardContent>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <StatusIndicator status="success" />
                    <Text size="sm" type="secondary">已完成</Text>
                  </div>
                  <Text size="sm" type="primary">{data.filter(kb => kb.status === 'active').length}</Text>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <StatusIndicator status="processing" />
                    <Text size="sm" type="secondary">索引中</Text>
                  </div>
                  <Text size="sm" type="primary">{data.filter(kb => kb.status === 'indexing').length}</Text>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <StatusIndicator status="error" />
                    <Text size="sm" type="secondary">索引失败</Text>
                  </div>
                  <Text size="sm" type="primary">{data.filter(kb => kb.status === 'error').length}</Text>
                </div>
              </div>
            </CardContent>
          </UICard>

          <UICard>
            <CardHeader title="文档类型" />
            <CardContent>
              <div className="space-y-1">
                {documentTypes.map((type, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <Text size="sm" type="secondary">{type.name}</Text>
                    <div className="flex items-center space-x-1">
                      <div className="w-8 h-1.5 bg-[var(--color-bg-3)] rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full" 
                          style={{ 
                            width: `${(type.count / Math.max(...documentTypes.map(t => t.count))) * 100}%`,
                            backgroundColor: type.color
                          }}
                        ></div>
                      </div>
                      <Text size="sm" type="primary">{type.count}</Text>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </UICard>

          <UICard>
            <CardHeader title="检索评测" />
            <CardContent>
              <div className="space-y-1">
                {searchTests.slice(0, 3).map((test, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Rate disabled value={Math.round(test.relevance_score * 5)} size="small" />
                      <Text size="sm" type="primary">{test.query}</Text>
                    </div>
                    <Text size="sm" type="tertiary">{formatTime(test.response_time)}</Text>
                  </div>
                ))}
              </div>
            </CardContent>
          </UICard>
        </div>

        {/* 底部区域：知识库列表 */}
        <div className="flex-1 min-h-0">
          <UICard className="h-full">
            <CardHeader
              title="知识库管理"
              action={
                <Space>
                  <Select
                    size="small"
                    value={filterStatus}
                    onChange={setFilterStatus}
                    options={[
                      { value: 'all', label: '全部状态' },
                      { value: 'active', label: '已完成' },
                      { value: 'indexing', label: '索引中' },
                      { value: 'error', label: '索引失败' },
                      { value: 'paused', label: '已暂停' }
                    ]}
                  />
                  <Button type="primary" size="small" onClick={() => setModalVisible(true)}>
                    <PlusOutlined /> 新建知识库
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
                      width: 80,
                      render: (status: string) => (
                        <StatusIndicator status={getStatusColor(status) as any} />
                      )
                    },
                    { title: '知识库名称', dataIndex: 'name', width: 150, render: (name: string, record: KnowledgeBase) => name || record.id },
                    { 
                      title: '文档数量', 
                      dataIndex: 'documents', 
                      width: 80,
                      render: (value: number) => formatNumber(value)
                    },
                    { 
                      title: '索引进度', 
                      dataIndex: 'indexing_progress', 
                      width: 100,
                      render: (progress: number, record: KnowledgeBase) => (
                        <Progress 
                          percent={progress || 0} 
                          size="small" 
                          status={record.status === 'error' ? 'exception' : record.status === 'indexing' ? 'active' : 'success'}
                        />
                      )
                    },
                    { 
                      title: '准确率', 
                      dataIndex: 'accuracy_score', 
                      width: 80,
                      render: (score: number) => `${score || 0}%`
                    },
                    { 
                      title: '搜索次数', 
                      dataIndex: 'search_count', 
                      width: 80,
                      render: (value: number) => formatNumber(value)
                    },
                    { 
                      title: '最后更新', 
                      dataIndex: 'last_updated', 
                      width: 120,
                      render: (value: string) => new Date(value).toLocaleDateString()
                    },
                    { 
                      title: '操作', 
                      width: 200,
                      render: (_, record: KnowledgeBase) => (
                        <Space size="small">
                          <Button 
                            size="small" 
                            icon={<EyeOutlined />}
                            onClick={() => {
                              setSelectedKB(record)
                              setDetailDrawerVisible(true)
                            }}
                          >
                            详情
                          </Button>
                          <Button 
                            size="small" 
                            icon={<SearchOutlined />}
                            onClick={() => {
                              setSelectedKB(record)
                              setDetailDrawerVisible(true)
                            }}
                          >
                            测试
                          </Button>
                          <Button 
                            size="small" 
                            icon={<ReloadOutlined />}
                            onClick={() => reindexKB(record.id)}
                          >
                            重建
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

      {/* 创建知识库模态框 */}
      <Modal
        title="创建知识库"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={createKB} layout="vertical">
          <Form.Item name="name" label="知识库名称" rules={[{ required: true }]}>
            <Input placeholder="请输入知识库名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="请输入知识库描述" />
          </Form.Item>
          <Form.Item name="chunk_size" label="分块大小" initialValue={1000}>
            <Input type="number" placeholder="请输入分块大小" />
          </Form.Item>
          <Form.Item name="chunk_overlap" label="分块重叠" initialValue={200}>
            <Input type="number" placeholder="请输入分块重叠" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 知识库详情抽屉 */}
      <Drawer
        title="知识库详情"
        width={800}
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
      >
        {selectedKB && (
          <div className="space-y-4">
            <Card>
              <Descriptions column={2} size="small">
                <Descriptions.Item label="知识库名称">{selectedKB.name || selectedKB.id}</Descriptions.Item>
                <Descriptions.Item label="状态">
                  <StatusIndicator status={getStatusColor(selectedKB.status) as any} />
                </Descriptions.Item>
                <Descriptions.Item label="文档数量">{selectedKB.documents}</Descriptions.Item>
                <Descriptions.Item label="分块数量">{selectedKB.chunks}</Descriptions.Item>
                <Descriptions.Item label="存储大小">{formatNumber(selectedKB.size, { unit: 'MB' })}</Descriptions.Item>
                <Descriptions.Item label="准确率">{selectedKB.accuracy_score}%</Descriptions.Item>
                <Descriptions.Item label="搜索次数">{selectedKB.search_count}</Descriptions.Item>
                <Descriptions.Item label="平均响应时间">{formatTime(selectedKB.avg_response_time || 0)}</Descriptions.Item>
              </Descriptions>
            </Card>

            <Tabs defaultActiveKey="documents">
              <Tabs.TabPane tab="文档管理" key="documents">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Text type="secondary">文档列表</Text>
                    <Button size="small" icon={<UploadOutlined />}>上传文档</Button>
                  </div>
                  <Table
                    dataSource={documents}
                    size="small"
                    pagination={false}
                    columns={[
                      { title: '文档名称', dataIndex: 'name', width: 150 },
                      { title: '类型', dataIndex: 'type', width: 80 },
                      { 
                        title: '状态', 
                        dataIndex: 'status', 
                        width: 80,
                        render: (status: string) => (
                          <Tag color={getDocumentStatusColor(status)}>{status}</Tag>
                        )
                      },
                      { title: '分块数', dataIndex: 'chunks', width: 80 },
                      { 
                        title: '操作', 
                        width: 100,
                        render: (_, record: Document) => (
                          <Space size="small">
                            <Button size="small" type="link">查看</Button>
                            <Button size="small" type="link" danger>删除</Button>
                          </Space>
                        )
                      }
                    ]}
                  />
                </div>
              </Tabs.TabPane>

              <Tabs.TabPane tab="检索测试" key="search">
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <AntInput
                      placeholder="输入测试查询"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onPressEnter={() => testSearch(selectedKB.id, searchQuery)}
                    />
                    <Button 
                      type="primary" 
                      icon={<SearchOutlined />}
                      onClick={() => testSearch(selectedKB.id, searchQuery)}
                    >
                      测试搜索
                    </Button>
                  </div>
                  
                  {searchResults.length > 0 && (
                    <Card title="搜索结果">
                      <div className="space-y-2">
                        {searchResults.map((result, index) => (
                          <div key={index} className="p-2 border rounded">
                            <Text type="primary">{result.title}</Text>
                            <div className="mt-1 text-sm text-gray-600">{result.content}</div>
                            <div className="mt-1 text-xs text-gray-400">相似度: {(result.score * 100).toFixed(1)}%</div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  <Card title="历史测试">
                    <Table
                      dataSource={searchTests.filter(test => test.kb_id === selectedKB.id)}
                      size="small"
                      pagination={false}
                      columns={[
                        { title: '查询', dataIndex: 'query', width: 200 },
                        { 
                          title: '相关性', 
                          dataIndex: 'relevance_score', 
                          width: 100,
                          render: (score: number) => (
                            <Rate disabled value={Math.round(score * 5)} size="small" />
                          )
                        },
                        { 
                          title: '响应时间', 
                          dataIndex: 'response_time', 
                          width: 100,
                          render: (time: number) => formatTime(time)
                        },
                        { 
                          title: '时间', 
                          dataIndex: 'timestamp', 
                          width: 120,
                          render: (time: string) => new Date(time).toLocaleString()
                        }
                      ]}
                    />
                  </Card>
                </div>
              </Tabs.TabPane>

              <Tabs.TabPane tab="索引任务" key="indexing">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Text type="secondary">索引任务历史</Text>
                    <Button size="small" icon={<ReloadOutlined />}>重新索引</Button>
                  </div>
                  <Table
                    dataSource={indexJobs.filter(job => job.kb_id === selectedKB.id)}
                    size="small"
                    pagination={false}
                    columns={[
                      { 
                        title: '状态', 
                        dataIndex: 'status', 
                        width: 80,
                        render: (status: string) => (
                          <Tag color={getStatusColor(status)}>{status}</Tag>
                        )
                      },
                      { 
                        title: '进度', 
                        dataIndex: 'progress', 
                        width: 100,
                        render: (progress: number, record: IndexJob) => (
                          <Progress 
                            percent={progress} 
                            size="small" 
                            status={record.status === 'failed' ? 'exception' : record.status === 'running' ? 'active' : 'success'}
                          />
                        )
                      },
                      { title: '文档数', dataIndex: 'total_documents', width: 80 },
                      { title: '已处理', dataIndex: 'processed_documents', width: 80 },
                      { 
                        title: '开始时间', 
                        dataIndex: 'start_time', 
                        width: 120,
                        render: (time: string) => new Date(time).toLocaleString()
                      },
                      { 
                        title: '结束时间', 
                        dataIndex: 'end_time', 
                        width: 120,
                        render: (time: string) => time ? new Date(time).toLocaleString() : '-'
                      }
                    ]}
                  />
                </div>
              </Tabs.TabPane>
            </Tabs>
          </div>
        )}
      </Drawer>
    </PageLayout>
  )
}