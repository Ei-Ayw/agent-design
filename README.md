# 项目说明

本项目为 AI Agent 平台参考实现（后端 FastAPI，前端 Next.js 14）。

## 目录结构
- backend：FastAPI 应用（健康检查、SSE 示例、腾讯云占位客户端与路由）
- frontend：Next.js App Router（SSE 订阅示例）
- DESIGN.md：架构设计文档（含 Mermaid 流程图）

## 快速开始

### 1) 后端（FastAPI）
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# 创建 .env（可参考 backend/.env.example）
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
# 健康检查
curl http://localhost:8000/health/live | cat
```

### 2) 前端（Next.js）
```bash
cd frontend
npm i
npm run dev
# 访问 http://localhost:3000
```

### 3) SSE 演示
- 前端页面点击“开始订阅 SSE”，后台 `GET /sse/demo` 将流式返回 5 条消息。

## 环境变量
- 后端环境变量示例见 `backend/.env.example`，请复制为 `.env` 并填写真实值。
- 切勿将密钥写入代码或提交到版本库。

## 开发规范
- 每个代码文件头部注明“文件作用”。
- 注释以中文为主，解释“为什么”。
- 配置项集中在 `app/config.py`，通过环境变量注入。

## 后续规划
- 接入真实腾讯云 SDK（或自实现 TC3 签名）
- 增加会话/Agent 路由与工作流编排
- 引入鉴权、RBAC、审计与观测（OTel/Prom）

