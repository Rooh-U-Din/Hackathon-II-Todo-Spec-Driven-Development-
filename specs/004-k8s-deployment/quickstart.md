# Quick Start Guide: Phase IV Local Kubernetes Deployment

**Feature**: 004-k8s-deployment
**Date**: 2025-12-20

## Prerequisites

Before starting, ensure the following tools are installed:

| Tool | Version | Verification Command | Installation |
|------|---------|---------------------|--------------|
| Docker Desktop | 4.x+ | `docker --version` | [docker.com](https://docker.com) |
| Minikube | 1.32+ | `minikube version` | `winget install minikube` |
| Helm | 3.x+ | `helm version` | `winget install helm` |
| kubectl | 1.29+ | `kubectl version` | Bundled with Minikube |

### Optional AI Tools

| Tool | Purpose | Installation |
|------|---------|--------------|
| Docker AI (Gordon) | Dockerfile generation | Built into Docker Desktop |
| kubectl-ai | AI-assisted kubectl | `go install github.com/sozercan/kubectl-ai@latest` |
| kagent | Cluster health analysis | `pip install kagent` |

---

## Quick Start Steps

### 1. Start Minikube Cluster

```bash
# Start Minikube with sufficient resources
minikube start --cpus=4 --memory=8192 --driver=docker

# Verify cluster is running
minikube status
```

### 2. Configure Docker Environment

```bash
# Point Docker CLI to Minikube's Docker daemon
# Windows PowerShell:
& minikube -p minikube docker-env --shell powershell | Invoke-Expression

# Linux/macOS:
eval $(minikube docker-env)

# Verify configuration
docker images
```

### 3. Build Docker Images

```bash
# Build frontend image
docker build -t todo-frontend:local ./frontend

# Build backend image
docker build -t todo-backend:local ./backend

# Verify images exist
docker images | grep todo
```

### 4. Deploy with Helm

```bash
# Navigate to helm charts directory
cd helm/todo-app

# Install the application
helm install todo . --namespace default

# Verify deployment
helm list
kubectl get pods
```

### 5. Access the Application

```bash
# Get frontend URL
minikube service todo-frontend --url

# Get backend URL (for API testing)
minikube service todo-backend --url
```

---

## Using AI DevOps Tools

### Docker AI (Gordon)

```bash
# Generate optimized Dockerfile
docker ai "Create a multi-stage Dockerfile for a Next.js app"

# Analyze existing Dockerfile
docker ai "Optimize this Dockerfile for production"

# Get build help
docker ai "How do I build an image for Minikube?"
```

### kubectl-ai

```bash
# Deploy using natural language
kubectl-ai "Deploy the todo-app helm chart"

# Scale application
kubectl-ai "Scale todo-backend to 3 replicas"

# Debug failing pods
kubectl-ai "Why is my pod in CrashLoopBackOff?"

# Get resource usage
kubectl-ai "Show me CPU and memory usage for all pods"
```

### kagent

```bash
# Analyze cluster health
kagent analyze

# Get optimization recommendations
kagent optimize

# Check resource allocation
kagent resources
```

---

## Manual Operations (Fallback)

If AI tools are unavailable, use these standard commands:

### Scaling

```bash
# Scale frontend
kubectl scale deployment todo-frontend --replicas=3

# Scale backend
kubectl scale deployment todo-backend --replicas=3

# Verify scaling
kubectl get pods -w
```

### Debugging

```bash
# Check pod status
kubectl get pods

# View pod logs
kubectl logs -f deployment/todo-backend

# Describe pod for events
kubectl describe pod <pod-name>

# Execute into container
kubectl exec -it <pod-name> -- /bin/sh
```

### Configuration Updates

```bash
# Update values and upgrade
helm upgrade todo . --values values.yaml

# Rollback if needed
helm rollback todo 1
```

---

## Environment Configuration

### Required Secrets (before deployment)

Create `values-secrets.yaml`:

```yaml
backend:
  secrets:
    DATABASE_URL: "postgresql://user:pass@host:5432/db"
    GEMINI_API_KEY: "your-gemini-api-key"
    SECRET_KEY: "your-jwt-secret-key"
```

Deploy with secrets:

```bash
helm install todo . -f values-secrets.yaml
```

### Environment Variables

| Variable | Service | Source | Description |
|----------|---------|--------|-------------|
| NEXT_PUBLIC_API_URL | Frontend | ConfigMap | Backend API URL |
| DATABASE_URL | Backend | Secret | Neon PostgreSQL URL |
| GEMINI_API_KEY | Backend | Secret | Google Gemini API |
| SECRET_KEY | Backend | Secret | JWT signing key |
| PYTHONUNBUFFERED | Backend | ConfigMap | Python output buffering |

---

## Verification Checklist

After deployment, verify:

- [ ] `kubectl get pods` shows all pods in Running state
- [ ] Frontend is accessible at `minikube service todo-frontend --url`
- [ ] Backend API responds at `<backend-url>/health`
- [ ] Can create/list/complete tasks via chat interface
- [ ] Scaling to 3 replicas works without service interruption
- [ ] Restarting pods does not lose data

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| ImagePullBackOff | Image not in Minikube | Run `eval $(minikube docker-env)` then rebuild |
| CrashLoopBackOff | App crash at startup | Check logs: `kubectl logs <pod>` |
| Connection refused | Service not ready | Wait for readiness probe, check nodePort |
| Database connection error | Wrong DATABASE_URL | Verify secret, check network from cluster |

### Useful Commands

```bash
# View all resources
kubectl get all

# Check Helm release status
helm status todo

# View Helm values
helm get values todo

# Uninstall and reinstall
helm uninstall todo
helm install todo .
```

---

## Cleanup

```bash
# Remove Helm release
helm uninstall todo

# Stop Minikube (preserves cluster)
minikube stop

# Delete Minikube cluster (removes everything)
minikube delete
```
