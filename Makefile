# 文件作用：常用开发与部署命令集合。

.PHONY: backend frontend dev dev-backend dev-frontend docker-backend docker-frontend helm-install

backend:
	cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

frontend:
	cd frontend && npm run dev

dev: dev-backend dev-frontend

dev-backend:
	cd backend && python -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend:
	cd frontend && npm i && npm run dev

docker-backend:
	docker build -t agent-backend:local ./backend

docker-frontend:
	docker build -t agent-frontend:local ./frontend

helm-install:
	helm install agent ./deploy/helm -n agent --create-namespace


