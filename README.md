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
# 推荐先访问 /login 登录获取 JWT（保存在 localStorage），
# 之后再访问 /agents、/workflows 等需要鉴权的功能页。
```

### 3) SSE 演示
- 前端页面点击“开始订阅 SSE”，后台 `GET /sse/demo` 将流式返回 5 条消息。

### 4) RAG 混检与工具调用
- KB 检索：前端 `/kb/search`，后端 `GET /kb/{kid}/search`（混检占位+重排）。
- 工具调用：前端 `/tools/invoke`，后端 `POST /tools/{id}/invoke`（基于 JSON Schema 校验）。

### 5) 工作流与审批
- 运行：前端 `/workflows` 页面触发，后端 `POST /workflows/{id}/run`。
- 审批：在运行历史弹窗中点击“审批节点”，对应后端 `POST /workflows/runs/{run_id}/approve`。

### 6) OpenTelemetry（可选）
- 设置环境变量 `OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318`（或你的 OTLP 接收器地址）。
- 服务启动后将通过 OTLP/HTTP 导出 Trace；已自动注入 FastAPI 与 httpx。

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

## 部署（Docker/K8s/Helm 概览）
### Docker 镜像（示例）
后端：
```bash
docker build -t your-registry/agent-backend:latest -f - backend <<'DOCKER'
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install -r requirements.txt
COPY . /app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
DOCKER
```

前端：
```bash
docker build -t your-registry/agent-frontend:latest -f - frontend <<'DOCKER'
FROM node:20-alpine as build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm i || true
COPY . .
RUN npm run build
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app .
EXPOSE 3000
CMD ["npm", "start"]
DOCKER
```

### Helm
```bash
helm install agent ./deploy/helm -n agent --create-namespace
```

