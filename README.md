# Todo AI Chatbot - Cloud-Native Deployment

A full-stack AI-powered task management application with natural language interface, deployed on Kubernetes.

## Project Overview

This project demonstrates a complete software development lifecycle following **Spec-Driven Development (SDD)** methodology across four phases:

| Phase | Description | Status |
|-------|-------------|--------|
| Phase I | Python CLI Todo Application | Complete |
| Phase II | Full-Stack Web Application (Next.js + FastAPI) | Complete |
| Phase III | AI Chatbot with MCP Tool Integration | Complete |
| Phase IV | Kubernetes Deployment with Helm | Complete |
| Phase V | Enhanced Task Management (Priorities, Due Dates, Tags, Recurrence) | Complete |

## Architecture

```
                                    User
                                      |
                                      v
                    +----------------------------------+
                    |        Minikube Cluster          |
                    |                                  |
                    |   +----------+    +----------+   |
                    |   | Frontend |    | Backend  |   |
                    |   | Next.js  |<-->| FastAPI  |   |
                    |   | :30080   |    | :30081   |   |
                    |   +----------+    +----------+   |
                    |        |               |         |
                    |        +-------+-------+         |
                    |                |                 |
                    +----------------|----------------+
                                     |
                                     v
                        +------------------------+
                        |   Neon PostgreSQL      |
                        |   (External Database)  |
                        +------------------------+
                                     |
                                     v
                        +------------------------+
                        |   Google Gemini API    |
                        |   (AI Processing)      |
                        +------------------------+
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 14 (App Router) | React-based UI with TypeScript |
| Backend | FastAPI (Python 3.13) | REST API with async support |
| AI | Google Gemini API | Natural language processing |
| Database | Neon PostgreSQL | Serverless persistent storage |
| Auth | Better Auth + JWT | User authentication |
| Container | Docker | Multi-stage builds |
| Orchestration | Kubernetes (Minikube) | Local cluster deployment |
| Package Manager | Helm 3.x | Declarative deployment |

## Features

- **AI-Powered Chat Interface**: Natural language task management
- **Full CRUD Operations**: Create, read, update, delete tasks
- **User Authentication**: Secure JWT-based authentication
- **Horizontal Scaling**: Scale replicas without service interruption
- **Health Monitoring**: Kubernetes liveness/readiness probes
- **Configuration Management**: Helm values for environment-specific configs

### Phase V: Enhanced Task Management
- **Priority Levels**: High, Medium, Low priority with visual indicators
- **Due Dates**: Set due dates with overdue highlighting
- **Recurring Tasks**: Daily, Weekly, or Custom interval recurrence
- **Task Tags**: Organize tasks with custom tags (CRUD + assignment)
- **Task Reminders**: Schedule reminders for tasks
- **Advanced Filtering**: Filter by status, priority, search, and sort options
- **Database Migrations**: Alembic migrations for schema evolution

## Prerequisites

| Tool | Version | Installation |
|------|---------|--------------|
| Docker Desktop | 4.x+ | [docker.com](https://docker.com) |
| Minikube | 1.32+ | `winget install minikube` or `brew install minikube` |
| Helm | 3.x+ | `winget install helm` or `brew install helm` |
| kubectl | 1.29+ | Bundled with Minikube |
| Node.js | 20+ | [nodejs.org](https://nodejs.org) |
| Python | 3.13+ | [python.org](https://python.org) |

## Environment Variables

Create a `values-secrets.yaml` file with your credentials:

```yaml
backend:
  secrets:
    DATABASE_URL: "postgresql://user:password@host:5432/database?sslmode=require"
    GEMINI_API_KEY: "your-google-gemini-api-key"
    SECRET_KEY: "your-jwt-secret-key-min-32-chars"
```

**Required Variables:**

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `DATABASE_URL` | Neon PostgreSQL connection string | [neon.tech](https://neon.tech) |
| `GEMINI_API_KEY` | Google AI API key | [ai.google.dev](https://ai.google.dev) |
| `SECRET_KEY` | JWT signing secret (min 32 chars) | Generate securely |

## Deployment Steps

### 1. Start Minikube Cluster

```bash
# Start with recommended resources (4 CPU, 8GB RAM)
minikube start --cpus=4 --memory=8192 --driver=docker

# Verify cluster is running
minikube status
kubectl cluster-info
```

### 2. Configure Docker Environment

```bash
# Windows PowerShell:
& minikube -p minikube docker-env --shell powershell | Invoke-Expression

# Linux/macOS:
eval $(minikube docker-env)
```

### 3. Build Docker Images

```bash
# Build frontend image
docker build -t todo-frontend:local -f Dockerfile.frontend ./frontend

# Build backend image
docker build -t todo-backend:local -f Dockerfile.backend ./backend

# Verify images are available
docker images | grep todo
```

### 4. Deploy with Helm

```bash
# Deploy application with secrets
helm install todo ./helm/todo-app -f values-secrets.yaml

# Watch pods come up
kubectl get pods -w
```

### 5. Verify Deployment

```bash
# Check all pods are running
kubectl get pods

# Check services
kubectl get svc

# Get frontend URL
minikube service todo-app-frontend --url
```

### 6. Access Application

```bash
# Frontend (Web UI)
http://<minikube-ip>:30080

# Backend (API)
http://<minikube-ip>:30081

# Get Minikube IP
minikube ip
```

## Validation Steps

### Health Check

```bash
# Frontend health
curl http://$(minikube ip):30080

# Backend health
curl http://$(minikube ip):30081/health

# API docs
open http://$(minikube ip):30081/docs
```

### Scaling Test

```bash
# Scale to 3 replicas
kubectl scale deployment todo-app-frontend --replicas=3
kubectl scale deployment todo-app-backend --replicas=3

# Verify all pods running
kubectl get pods
```

### Persistence Test

```bash
# Create a task via chat
# Delete a backend pod
kubectl delete pod <backend-pod-name>

# Verify task still exists after pod restart
```

## AI/DevOps Features

This project leverages AI-assisted DevOps workflows:

| Tool | Purpose | Usage |
|------|---------|-------|
| Claude Code | Spec-driven code generation | All implementation |
| Docker AI (Gordon) | Dockerfile optimization | Fallback: Claude Code |
| kubectl-ai | Kubernetes operations | Fallback: kubectl |
| kagent | Cluster health analysis | Fallback: kubectl describe |

See [AI DevOps Usage](specs/004-k8s-deployment/ai-devops-usage.md) for detailed documentation.

## Project Structure

```
/
├── backend/                 # FastAPI backend (Python)
│   ├── app/
│   │   ├── api/             # REST endpoints
│   │   ├── models/          # SQLModel entities
│   │   ├── services/        # Business logic
│   │   ├── mcp/             # MCP tool integration
│   │   └── db/              # Database session
│   ├── alembic/             # Database migrations (Phase V)
│   └── pyproject.toml
├── frontend/                # Next.js frontend (TypeScript)
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom hooks
│   │   └── lib/             # API client, types
│   └── package.json
├── helm/                    # Kubernetes deployment
│   └── todo-app/
│       ├── Chart.yaml       # Parent chart
│       ├── values.yaml      # Configuration
│       └── charts/
│           ├── frontend/    # Frontend subchart
│           └── backend/     # Backend subchart
├── specs/                   # Feature specifications
├── Dockerfile.frontend      # Frontend container
├── Dockerfile.backend       # Backend container
└── README.md                # This file
```

## Cleanup

```bash
# Uninstall Helm release
helm uninstall todo

# Stop Minikube (preserves cluster)
minikube stop

# Delete Minikube cluster completely
minikube delete
```

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| ImagePullBackOff | Image not in Minikube | Run `eval $(minikube docker-env)` then rebuild |
| CrashLoopBackOff | App crash at startup | Check logs: `kubectl logs <pod>` |
| Connection refused | Service not ready | Wait for readiness probe |
| Database error | Wrong DATABASE_URL | Verify secret in values-secrets.yaml |

### View Logs

```bash
kubectl logs -f deployment/todo-app-frontend
kubectl logs -f deployment/todo-app-backend
```

### Check Events

```bash
kubectl get events --sort-by='.lastTimestamp'
```

## Documentation

- [Feature Specification](specs/004-k8s-deployment/spec.md)
- [Implementation Plan](specs/004-k8s-deployment/plan.md)
- [Task List](specs/004-k8s-deployment/tasks.md)
- [Helm Chart README](helm/todo-app/README.md)
- [AI DevOps Usage](specs/004-k8s-deployment/ai-devops-usage.md)

## License

This project was created for hackathon demonstration purposes.

---

**Version**: 1.1.0 | **Last Updated**: 2026-01-06
