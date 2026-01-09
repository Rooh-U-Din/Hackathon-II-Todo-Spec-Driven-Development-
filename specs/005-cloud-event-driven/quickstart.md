# Quickstart Guide: Phase V - Advanced Cloud & Event-Driven Architecture

**Feature**: 005-cloud-event-driven
**Date**: 2026-01-05
**Prerequisites**: Phase IV deployment working, Docker, Minikube, Helm, kubectl

## Overview

This guide walks through setting up the Phase V event-driven architecture locally and in the cloud.

---

## Prerequisites

### Required Tools

```bash
# Verify existing tools from Phase IV
docker --version          # 24.0+
minikube version          # 1.32+
helm version              # 3.13+
kubectl version --client  # 1.28+

# Install Dapr CLI
# macOS/Linux
curl -fsSL https://raw.githubusercontent.com/dapr/cli/master/install/install.sh | bash

# Windows (PowerShell)
iwr -useb https://raw.githubusercontent.com/dapr/cli/master/install/install.ps1 | iex

# Verify Dapr
dapr --version  # 1.14+

# Optional: k9s for cluster management
# brew install k9s (macOS) or choco install k9s (Windows)
```

### Required Accounts

- **Oracle Cloud** (for OKE deployment): https://cloud.oracle.com/
- **GitHub** (for CI/CD): Repository access with Actions enabled

---

## Local Development Setup

### Option 1: Docker Compose (Fastest for Development)

```bash
# Start all services
docker compose -f docker-compose.dev.yaml up -d

# Services started:
# - Backend (FastAPI + Dapr sidecar): localhost:8000
# - Frontend (Next.js): localhost:3000
# - Redpanda (Kafka): localhost:9092
# - Redpanda Console: localhost:8080
# - PostgreSQL: localhost:5432

# View logs
docker compose -f docker-compose.dev.yaml logs -f backend

# Run database migrations
docker compose exec backend alembic upgrade head

# Stop all services
docker compose -f docker-compose.dev.yaml down
```

### Option 2: Minikube (Full Kubernetes Simulation)

```bash
# Start Minikube with sufficient resources
minikube start --cpus=6 --memory=12288 --driver=docker

# Enable required addons
minikube addons enable ingress
minikube addons enable metrics-server

# Install Dapr on Minikube
dapr init -k --wait

# Verify Dapr installation
dapr status -k
# Should show: dapr-operator, dapr-sidecar-injector, dapr-placement, dapr-scheduler

# Deploy Redpanda (Kafka-compatible)
helm repo add redpanda https://charts.redpanda.com
helm install redpanda redpanda/redpanda \
  --namespace default \
  --set statefulset.replicas=1 \
  --set resources.cpu.cores=1 \
  --set resources.memory.container.max=2Gi

# Wait for Redpanda to be ready
kubectl rollout status statefulset/redpanda --timeout=5m

# Create Kafka topics
kubectl exec -it redpanda-0 -- rpk topic create task-events --partitions 3
kubectl exec -it redpanda-0 -- rpk topic create reminders --partitions 3
kubectl exec -it redpanda-0 -- rpk topic create task-updates --partitions 3

# Deploy application via Helm
helm upgrade --install todo ./helm/todo-app \
  --namespace default \
  --set global.dapr.enabled=true \
  --set backend.dapr.enabled=true \
  --set services.notification.enabled=true \
  --set services.recurringTask.enabled=true \
  --set services.audit.enabled=true

# Wait for pods
kubectl get pods -w

# Access services
minikube service todo-frontend --url
# Open the URL in browser

# View Dapr dashboard
dapr dashboard -k
# Opens http://localhost:8080
```

---

## Verifying the Setup

### 1. Create a Task with Recurrence

```bash
# Get the backend URL
BACKEND_URL=$(minikube service todo-backend --url)

# Create a recurring task
curl -X POST "$BACKEND_URL/api/tasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Daily standup",
    "recurrence_type": "daily",
    "due_at": "2026-01-06T09:00:00Z",
    "remind_at": "2026-01-06T08:45:00Z",
    "priority": "high"
  }'
```

### 2. Verify Event Publishing

```bash
# Check Redpanda topics
kubectl exec -it redpanda-0 -- rpk topic consume task-events --num 1

# Should see CloudEvents JSON:
# {
#   "specversion": "1.0",
#   "type": "task.created",
#   ...
# }
```

### 3. Complete Task and Verify Recurring Generation

```bash
# Complete the task
curl -X POST "$BACKEND_URL/api/tasks/{task_id}/complete" \
  -H "Authorization: Bearer $TOKEN"

# Response includes next_occurrence:
# {
#   "task": { ... is_completed: true },
#   "next_occurrence": { ... title: "Daily standup", due_at: "2026-01-07T09:00:00Z" }
# }

# Verify task.completed event
kubectl exec -it redpanda-0 -- rpk topic consume task-events --num 1 --offset -1
```

### 4. Check Consumer Services

```bash
# Notification service logs
kubectl logs -l app=notification-service -f

# Recurring task service logs
kubectl logs -l app=recurring-task-service -f

# Audit service logs
kubectl logs -l app=audit-service -f
```

---

## Cloud Deployment (Oracle OKE)

### 1. Provision OKE Cluster

```bash
# Install OCI CLI
# https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm

# Configure OCI CLI
oci setup config

# Create OKE cluster (via Console or Terraform)
# Use "Quick Create" for simplicity:
# - Shape: VM.Standard.E4.Flex (2 OCPU, 16GB)
# - Node count: 3
# - Kubernetes version: 1.28+

# Configure kubectl for OKE
oci ce cluster create-kubeconfig \
  --cluster-id <cluster-ocid> \
  --file $HOME/.kube/config \
  --region <region> \
  --token-version 2.0.0

# Verify connection
kubectl get nodes
```

### 2. Install Dapr on OKE

```bash
# Initialize Dapr with HA mode
dapr init -k --enable-ha --wait

# Verify
dapr status -k
```

### 3. Deploy Redpanda Cloud (or Self-Hosted)

```bash
# Option A: Redpanda Cloud (recommended)
# 1. Create cluster at https://cloud.redpanda.com
# 2. Get bootstrap server URL and credentials
# 3. Create topics via Redpanda Console

# Option B: Self-hosted Redpanda on OKE
helm install redpanda redpanda/redpanda \
  --namespace default \
  --set statefulset.replicas=3 \
  --set resources.cpu.cores=2 \
  --set resources.memory.container.max=4Gi \
  --set tls.enabled=true
```

### 4. Configure Secrets

```bash
# Create Kubernetes secrets
kubectl create secret generic database-secrets \
  --from-literal=connection-string="$DATABASE_URL"

kubectl create secret generic kafka-secrets \
  --from-literal=brokers="$KAFKA_BROKERS" \
  --from-literal=username="$KAFKA_USERNAME" \
  --from-literal=password="$KAFKA_PASSWORD"

kubectl create secret generic gemini-secrets \
  --from-literal=api-key="$GEMINI_API_KEY"
```

### 5. Deploy Application

```bash
# Deploy with cloud values
helm upgrade --install todo ./helm/todo-app \
  --namespace default \
  --values ./helm/todo-app/values-cloud.yaml \
  --set backend.secrets.databaseUrl="$DATABASE_URL" \
  --set backend.secrets.geminiApiKey="$GEMINI_API_KEY"

# Wait for deployment
kubectl rollout status deployment/todo-backend --timeout=5m
kubectl rollout status deployment/todo-frontend --timeout=5m

# Get external IP
kubectl get svc todo-frontend -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

### 6. Configure CI/CD (GitHub Actions)

```yaml
# .github/workflows/deploy-cloud.yaml
name: Deploy to OKE

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Configure OCI CLI
        uses: oracle-actions/configure-kubectl-oke@v1.5.1
        with:
          cluster: ${{ secrets.OKE_CLUSTER_OCID }}
          region: ${{ secrets.OCI_REGION }}

      - name: Deploy to OKE
        run: |
          helm upgrade --install todo ./helm/todo-app \
            --namespace default \
            --values ./helm/todo-app/values-cloud.yaml \
            --set image.tag=${{ github.ref_name }}
```

---

## Troubleshooting

### Dapr Issues

```bash
# Check Dapr sidecar injection
kubectl get pods -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[*].name}{"\n"}{end}'
# Should show: <pod-name>   <app-container>   daprd

# Check Dapr logs
kubectl logs <pod-name> -c daprd

# Verify pub/sub component
dapr components -k
```

### Kafka/Redpanda Issues

```bash
# Check Redpanda status
kubectl exec -it redpanda-0 -- rpk cluster info

# List topics
kubectl exec -it redpanda-0 -- rpk topic list

# Check consumer group lag
kubectl exec -it redpanda-0 -- rpk group describe todo-app
```

### Event Processing Issues

```bash
# Check dead-letter topics
kubectl exec -it redpanda-0 -- rpk topic consume task-events-dlq

# View consumer service errors
kubectl logs -l app=notification-service --tail=100 | grep ERROR
```

---

## Clean Up

### Local (Minikube)

```bash
# Uninstall application
helm uninstall todo

# Uninstall Redpanda
helm uninstall redpanda

# Uninstall Dapr
dapr uninstall -k

# Stop Minikube
minikube stop
# Or delete completely
minikube delete
```

### Cloud (OKE)

```bash
# Uninstall application
helm uninstall todo

# Delete OKE cluster via Console or:
oci ce cluster delete --cluster-id <cluster-ocid>
```

---

## Next Steps

1. Run `/sp.tasks` to generate implementation tasks
2. Run `/sp.implement` to execute the plan
3. Validate against acceptance criteria in spec.md

---

**Quickstart Status**: COMPLETE
**Estimated Setup Time**: 30 minutes (local), 60 minutes (cloud)
