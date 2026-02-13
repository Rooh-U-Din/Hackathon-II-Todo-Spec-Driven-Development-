# Todo App Helm Chart

Deploy the Todo AI Chatbot application to a local Kubernetes cluster.

## Prerequisites

| Tool | Version | Installation |
|------|---------|--------------|
| Docker Desktop | 4.x+ | [docker.com](https://docker.com) |
| Minikube | 1.32+ | `winget install minikube` |
| Helm | 3.x+ | `winget install helm` |
| kubectl | 1.29+ | Bundled with Minikube |

## Quick Start

### 1. Start Minikube

```bash
# Start with recommended resources
minikube start --cpus=4 --memory=8192 --driver=docker

# Verify cluster is running
minikube status
```

### 2. Configure Docker Environment

```bash
# Point Docker CLI to Minikube's daemon
# Windows PowerShell:
& minikube -p minikube docker-env --shell powershell | Invoke-Expression

# Linux/macOS:
eval $(minikube docker-env)
```

### 3. Build Docker Images

```bash
# From repository root
docker build -t todo-frontend:local -f Dockerfile.frontend ./frontend
docker build -t todo-backend:local -f Dockerfile.backend ./backend

# Verify images
docker images | grep todo
```

### 4. Configure Secrets

Create `values-secrets.yaml` with your credentials:

```yaml
backend:
  secrets:
    DATABASE_URL: "postgresql://user:pass@host:5432/db"
    GEMINI_API_KEY: "your-gemini-api-key"
    SECRET_KEY: "your-jwt-secret-key"
```

### 5. Deploy

```bash
# Install the application
helm install todo ./helm/todo-app -f values-secrets.yaml

# Verify deployment
helm list
kubectl get pods
```

### 6. Access Application

```bash
# Get service URLs
minikube service todo-app-frontend --url
minikube service todo-app-backend --url

# Or access directly via NodePorts:
# Frontend: http://<minikube-ip>:30080
# Backend:  http://<minikube-ip>:30081
```

## Configuration

### Observability & Monitoring

All services expose health and metrics endpoints for monitoring:

| Service | Health Endpoint | Metrics Endpoint | Port |
|---------|----------------|------------------|------|
| Backend | `GET /health` | `GET /metrics` | 8000 |
| Frontend | `GET /api/health` | N/A | 3000 |
| Notification Service | `GET /health` | `GET /metrics` | 5001 |
| Recurring Task Service | `GET /health` | `GET /metrics` | 5002 |
| Audit Service | `GET /health` | `GET /metrics` | 5003 |

**Metrics Format**: Prometheus exposition format

**Key Metrics**:
- `backend_requests_total` - Total HTTP requests (labels: method, endpoint, status)
- `backend_request_duration_seconds` - Request duration histogram
- `notification_service_notifications_sent_total` - Notifications sent (labels: channel, status)
- `notification_service_events_processed_total` - Events processed (labels: event_type, status)
- `recurring_task_service_tasks_generated_total` - Recurring tasks generated (labels: recurrence_type)
- `recurring_task_service_events_processed_total` - Events processed (labels: event_type, status)
- `audit_service_logs_created_total` - Audit logs created (labels: action, entity_type)
- `audit_service_events_processed_total` - Events processed (labels: event_type, status)

**Accessing Metrics**:
```bash
# Backend metrics
curl http://<minikube-ip>:30081/metrics

# Consumer service metrics (via port-forward)
kubectl port-forward svc/notification-service 5001:5001
curl http://localhost:5001/metrics
```

### values.yaml Options

| Parameter | Description | Default |
|-----------|-------------|---------|
| `frontend.replicaCount` | Frontend replicas | 1 |
| `frontend.service.nodePort` | Frontend NodePort | 30080 |
| `backend.replicaCount` | Backend replicas | 1 |
| `backend.service.nodePort` | Backend NodePort | 30081 |
| `backend.resources.limits.memory` | Backend memory limit | 1Gi |

### Override Values

```bash
# Scale replicas
helm upgrade todo ./helm/todo-app --set frontend.replicaCount=3

# Use custom values file
helm upgrade todo ./helm/todo-app -f values-production.yaml
```

## Operations

### Scaling

```bash
# Scale via kubectl
kubectl scale deployment todo-app-frontend --replicas=3
kubectl scale deployment todo-app-backend --replicas=3

# Scale via Helm
helm upgrade todo ./helm/todo-app --set frontend.replicaCount=3 --set backend.replicaCount=3
```

### Viewing Logs

```bash
# Frontend logs
kubectl logs -f deployment/todo-app-frontend

# Backend logs
kubectl logs -f deployment/todo-app-backend
```

### Debugging

```bash
# Check pod status
kubectl get pods

# Describe pod for events
kubectl describe pod <pod-name>

# Execute into container
kubectl exec -it <pod-name> -- /bin/sh
```

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| ImagePullBackOff | Image not in Minikube | Run `eval $(minikube docker-env)` then rebuild |
| CrashLoopBackOff | App crash at startup | Check logs: `kubectl logs <pod>` |
| Connection refused | Service not ready | Wait for readiness probe, check nodePort |
| Database error | Wrong DATABASE_URL | Verify secret, check network from cluster |

### Check Events

```bash
kubectl get events --sort-by='.lastTimestamp'
```

### Validate Chart

```bash
helm lint ./helm/todo-app
helm template todo ./helm/todo-app
```

## Cleanup

```bash
# Remove Helm release
helm uninstall todo

# Stop Minikube (preserves cluster)
minikube stop

# Delete Minikube cluster (removes everything)
minikube delete
```

## Chart Structure

```
helm/todo-app/
├── Chart.yaml          # Parent chart metadata
├── values.yaml         # Default configuration
└── charts/
    ├── frontend/       # Frontend subchart
    │   ├── Chart.yaml
    │   ├── values.yaml
    │   └── templates/
    │       ├── deployment.yaml
    │       └── service.yaml
    └── backend/        # Backend subchart
        ├── Chart.yaml
        ├── values.yaml
        └── templates/
            ├── deployment.yaml
            ├── service.yaml
            ├── configmap.yaml
            └── secret.yaml
```

## Phase V: Event-Driven Services (Planned)

Phase V extends the Helm chart with consumer microservices:

### Planned Subcharts

| Service | Purpose | Subscribes To |
|---------|---------|---------------|
| notification | Deliver reminders | `reminders` topic |
| recurring-task | Generate next occurrences | `task-events` topic |
| audit | Log all activity | `task-events` topic |

### Phase V Chart Structure (Planned)

```
helm/todo-app/
├── Chart.yaml              # Updated with new dependencies
├── values.yaml             # Extended configuration
├── values-cloud.yaml       # Cloud deployment overrides
└── charts/
    ├── frontend/           # Existing
    ├── backend/            # Existing (extended with Dapr annotations)
    ├── notification/       # NEW: Notification service
    ├── recurring-task/     # NEW: Recurring task service
    ├── audit/              # NEW: Audit service
    ├── kafka/              # NEW: Redpanda/Kafka
    └── dapr/               # NEW: Dapr components
```

### Dapr Integration

Phase V services use Dapr sidecars for:
- **Pub/Sub**: Event messaging via Redis/Kafka
- **State Store**: PostgreSQL for distributed state
- **Secrets**: Kubernetes secrets management

Configuration files in `infra/dapr/components/`:
- `pubsub.yaml` - Redis/Kafka pub/sub component
- `statestore.yaml` - PostgreSQL state store
- `secrets.yaml` - Kubernetes secrets
- `configuration.yaml` - Dapr runtime config

## Version

- Chart Version: 0.1.0
- App Version: 1.0.0
- Phase V Status: In Progress (47%)
