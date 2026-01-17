# Cloud Setup Guide - Phase V

This document describes how to deploy the Phase V Todo application to managed Kubernetes (Oracle OKE, Azure AKS, or Google GKE).

## Prerequisites

1. **Cloud CLI tools installed**:
   - Oracle OCI CLI (`oci`) or Azure CLI (`az`) or Google Cloud SDK (`gcloud`)
   - `kubectl` configured for your cluster
   - `helm` v3.x installed
   - `dapr` CLI installed

2. **Container registry access**:
   - Oracle OCIR, Azure ACR, or Google GCR
   - Docker configured to push to registry

3. **Managed Kafka** (optional):
   - Redpanda Cloud, Confluent Cloud, or managed Kafka service
   - OR use in-cluster Redpanda (included in Helm chart)

## Oracle OKE Setup

### 1. Create OKE Cluster

```bash
# Create cluster via OCI Console or CLI
oci ce cluster create \
  --compartment-id <compartment-ocid> \
  --name todo-app-cluster \
  --kubernetes-version v1.28.2 \
  --vcn-id <vcn-ocid> \
  --service-lb-subnet-ids <subnet-ocid>

# Configure kubectl
oci ce cluster create-kubeconfig \
  --cluster-id <cluster-ocid> \
  --file ~/.kube/config
```

### 2. Create Node Pool

```bash
oci ce node-pool create \
  --cluster-id <cluster-ocid> \
  --compartment-id <compartment-ocid> \
  --name todo-app-nodes \
  --node-shape VM.Standard.E4.Flex \
  --node-shape-config '{"memoryInGBs": 16, "ocpus": 4}' \
  --size 3
```

## Azure AKS Setup

```bash
# Create resource group
az group create --name todo-app-rg --location eastus

# Create AKS cluster
az aks create \
  --resource-group todo-app-rg \
  --name todo-app-cluster \
  --node-count 3 \
  --node-vm-size Standard_DS3_v2 \
  --enable-managed-identity

# Get credentials
az aks get-credentials --resource-group todo-app-rg --name todo-app-cluster
```

## Google GKE Setup

```bash
# Create GKE cluster
gcloud container clusters create todo-app-cluster \
  --zone us-central1-a \
  --num-nodes 3 \
  --machine-type e2-standard-4 \
  --enable-autoscaling --min-nodes 2 --max-nodes 5

# Get credentials
gcloud container clusters get-credentials todo-app-cluster --zone us-central1-a
```

## Install Dapr on Cluster

```bash
# Initialize Dapr on Kubernetes
dapr init -k

# Verify installation
dapr status -k
```

## Build and Push Docker Images

```bash
# Set registry
export REGISTRY=<your-registry>  # e.g., iad.ocir.io/namespace

# Build and push backend
docker build -t $REGISTRY/todo-backend:v2.0.0 ./backend
docker push $REGISTRY/todo-backend:v2.0.0

# Build and push frontend
docker build -t $REGISTRY/todo-frontend:v2.0.0 ./frontend
docker push $REGISTRY/todo-frontend:v2.0.0

# Build and push consumer services
for service in notification-service recurring-task-service audit-service; do
  docker build -t $REGISTRY/$service:v2.0.0 ./services/$service
  docker push $REGISTRY/$service:v2.0.0
done
```

## Deploy with Helm

```bash
# Add Redpanda Helm repo
helm repo add redpanda https://charts.redpanda.com
helm repo update

# Create namespace
kubectl create namespace todo-app

# Create secrets
kubectl create secret generic db-credentials \
  --namespace todo-app \
  --from-literal=connection-string="postgresql://user:pass@host:5432/db"

kubectl create secret generic app-secrets \
  --namespace todo-app \
  --from-literal=GEMINI_API_KEY="your-key" \
  --from-literal=SECRET_KEY="your-secret"

# Install with cloud values
helm install todo ./helm/todo-app \
  --namespace todo-app \
  --values ./helm/todo-app/values-cloud.yaml \
  --set global.imageRegistry=$REGISTRY
```

## Verify Deployment

```bash
# Check pods
kubectl get pods -n todo-app

# Check Dapr sidecars
kubectl get pods -n todo-app -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{range .spec.containers[*]}{.name}{" "}{end}{"\n"}{end}'

# Get external IP
kubectl get svc -n todo-app

# Test frontend
curl http://<EXTERNAL-IP>/

# Test backend health
curl http://<EXTERNAL-IP>/api/health
```

## Managed Kafka Configuration

If using managed Kafka (Redpanda Cloud, Confluent):

1. Update `values-cloud.yaml`:
```yaml
redpanda:
  enabled: false  # Disable in-cluster Redpanda

dapr:
  pubsub:
    brokers: "your-managed-kafka:9092"  # Managed Kafka endpoint
```

2. Update Dapr component for SASL authentication if required:
```yaml
metadata:
  - name: authType
    value: "password"
  - name: saslUsername
    secretKeyRef:
      name: kafka-credentials
      key: username
  - name: saslPassword
    secretKeyRef:
      name: kafka-credentials
      key: password
```

## CI/CD with GitHub Actions

See `.github/workflows/deploy-cloud.yaml` for automated deployment.

Required GitHub Secrets:
- `REGISTRY_USERNAME`: Container registry username
- `REGISTRY_PASSWORD`: Container registry password
- `KUBE_CONFIG`: Base64-encoded kubeconfig
- `DATABASE_URL`: PostgreSQL connection string
- `GEMINI_API_KEY`: Google AI API key

## Troubleshooting

### Pods not starting
```bash
kubectl describe pod <pod-name> -n todo-app
kubectl logs <pod-name> -n todo-app
```

### Dapr sidecar issues
```bash
kubectl logs <pod-name> -n todo-app -c daprd
```

### Event flow issues
```bash
# Check Dapr pubsub component
kubectl get component -n todo-app
kubectl describe component taskpubsub -n todo-app
```
