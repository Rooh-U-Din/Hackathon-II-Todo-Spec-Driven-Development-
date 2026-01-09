# AI DevOps Tools Usage Documentation

**Feature**: 004-k8s-deployment
**Date**: 2025-12-20
**Status**: Documented with Fallbacks

## Tool Availability Check

| Tool | Status | Fallback Used |
|------|--------|---------------|
| Docker AI (Gordon) | NOT AVAILABLE | Claude Code generated Dockerfiles |
| kubectl-ai | NOT AVAILABLE | Manual kubectl commands |
| kagent | NOT AVAILABLE | kubectl describe/logs/top |

## AI Tool Usage Per Constitution

Per constitution Phase IV requirements (ADR-01, ADR-02, ADR-03), AI tools MUST be used with fallback to manual commands if unavailable.

---

## Docker AI Agent (Gordon) - ADR-01

### Intended Usage
- Dockerfile generation and optimization
- Build assistance for Minikube
- Container execution help

### Fallback Applied
Claude Code generated multi-stage Dockerfiles:
- `Dockerfile.frontend`: Node.js 20 Alpine, 3-stage build (deps → builder → runner)
- `Dockerfile.backend`: Python 3.13 Slim, 2-stage build (builder → runner)

### Evidence
Dockerfiles created at repository root:
- `Dockerfile.frontend` - 53 lines, optimized for Next.js standalone mode
- `Dockerfile.backend` - 50 lines, optimized with venv and health check

---

## kubectl-ai - ADR-02

### Intended Usage
- Deploy Helm charts with natural language
- Scale replicas
- Debug pod failures

### Fallback Commands

| kubectl-ai Command | Fallback kubectl Command |
|-------------------|--------------------------|
| `kubectl-ai "Check status of todo-app deployment"` | `kubectl get all -l app.kubernetes.io/instance=todo` |
| `kubectl-ai "Scale todo-app-backend to 3 replicas"` | `kubectl scale deployment todo-app-backend --replicas=3` |
| `kubectl-ai "Show logs for todo-app-backend"` | `kubectl logs -l app.kubernetes.io/name=backend -f` |
| `kubectl-ai "Why is my pod in CrashLoopBackOff?"` | `kubectl describe pod <pod-name> && kubectl logs <pod-name> --previous` |

---

## kagent - ADR-03

### Intended Usage
- Cluster health analysis
- Resource optimization insights

### Fallback Commands

| kagent Command | Fallback kubectl Command |
|----------------|--------------------------|
| `kagent analyze` | `kubectl describe nodes && kubectl top nodes` |
| `kagent resources` | `kubectl top pods --all-namespaces` |
| `kagent optimize` | `kubectl describe pods -l app.kubernetes.io/instance=todo` |

---

## Compliance Statement

Per constitution Phase IV Operational Principles:
> AI tools are first-class operators, not optional helpers

This documentation demonstrates:
1. ✅ AI tool availability was verified
2. ✅ Fallback commands are documented
3. ✅ Implementation proceeded with fallback (Claude Code + manual kubectl)
4. ✅ All ADR requirements addressed

---

## Quickstart Commands (Fallback Mode)

### Deploy Application
```bash
# Start Minikube
minikube start --cpus=4 --memory=8192

# Configure Docker to use Minikube
eval $(minikube docker-env)   # Linux/macOS
& minikube -p minikube docker-env --shell powershell | Invoke-Expression  # Windows

# Build images
docker build -t todo-frontend:local -f Dockerfile.frontend ./frontend
docker build -t todo-backend:local -f Dockerfile.backend ./backend

# Deploy with Helm
helm install todo ./helm/todo-app --namespace default

# Verify deployment
kubectl get pods -w
```

### Scale Application
```bash
# Scale frontend to 3 replicas
kubectl scale deployment todo-app-frontend --replicas=3

# Scale backend to 3 replicas
kubectl scale deployment todo-app-backend --replicas=3

# Watch scaling progress
kubectl get pods -w
```

### Debug Issues
```bash
# Check pod status
kubectl get pods

# View pod logs
kubectl logs -f deployment/todo-app-backend

# Describe pod for events
kubectl describe pod <pod-name>

# View resource usage
kubectl top pods
```

### Cluster Analysis
```bash
# Node status
kubectl describe nodes

# Resource usage
kubectl top nodes
kubectl top pods

# Events
kubectl get events --sort-by='.lastTimestamp'
```
