# Data Model: Phase IV - Local Kubernetes Deployment

**Feature**: 004-k8s-deployment
**Date**: 2025-12-20

## Overview

Phase IV does not introduce new application data models. Instead, it defines infrastructure entities that describe the Kubernetes deployment configuration. These entities are expressed as Helm chart values and Kubernetes manifests.

---

## Infrastructure Entities

### 1. Docker Image (Frontend)

Represents the containerized Next.js frontend application.

| Attribute | Type | Description |
|-----------|------|-------------|
| name | string | Image name: `todo-frontend` |
| tag | string | Image tag: `local` |
| baseImage | string | Node 20 Alpine |
| port | integer | Container port: 3000 |
| buildContext | path | `./frontend` |

**Build Stages**:
1. `builder`: Compile TypeScript, build Next.js
2. `runner`: Production runtime with minimal footprint

---

### 2. Docker Image (Backend)

Represents the containerized FastAPI backend application.

| Attribute | Type | Description |
|-----------|------|-------------|
| name | string | Image name: `todo-backend` |
| tag | string | Image tag: `local` |
| baseImage | string | Python 3.13 Slim |
| port | integer | Container port: 8000 |
| buildContext | path | `./backend` |

**Build Stages**:
1. `builder`: Install dependencies, compile Python packages
2. `runner`: Production runtime with application code

---

### 3. Helm Chart (Parent)

Top-level chart that coordinates frontend and backend deployment.

| Attribute | Type | Description |
|-----------|------|-------------|
| name | string | `todo-app` |
| version | string | `0.1.0` |
| appVersion | string | `1.0.0` |
| dependencies | array | `[frontend, backend]` |

---

### 4. Deployment (Frontend)

Kubernetes Deployment for frontend pods.

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| replicaCount | integer | 1 | Number of pod replicas |
| image.repository | string | `todo-frontend` | Image name |
| image.tag | string | `local` | Image tag |
| image.pullPolicy | string | `Never` | Use local images |
| resources.requests.cpu | string | `100m` | CPU request |
| resources.requests.memory | string | `128Mi` | Memory request |
| resources.limits.cpu | string | `500m` | CPU limit |
| resources.limits.memory | string | `512Mi` | Memory limit |
| containerPort | integer | 3000 | Application port |

---

### 5. Deployment (Backend)

Kubernetes Deployment for backend pods.

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| replicaCount | integer | 1 | Number of pod replicas |
| image.repository | string | `todo-backend` | Image name |
| image.tag | string | `local` | Image tag |
| image.pullPolicy | string | `Never` | Use local images |
| resources.requests.cpu | string | `200m` | CPU request |
| resources.requests.memory | string | `256Mi` | Memory request |
| resources.limits.cpu | string | `1000m` | CPU limit |
| resources.limits.memory | string | `1Gi` | Memory limit |
| containerPort | integer | 8000 | Application port |

---

### 6. Service (Frontend)

Kubernetes Service exposing frontend pods.

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| type | string | `NodePort` | Service type |
| port | integer | 80 | Service port |
| targetPort | integer | 3000 | Container port |
| nodePort | integer | 30080 | External port |

---

### 7. Service (Backend)

Kubernetes Service exposing backend pods.

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| type | string | `NodePort` | Service type |
| port | integer | 80 | Service port |
| targetPort | integer | 8000 | Container port |
| nodePort | integer | 30081 | External port |

---

### 8. ConfigMap (Backend)

Non-sensitive configuration for backend pods.

| Key | Type | Description |
|-----|------|-------------|
| PYTHONUNBUFFERED | string | Python output buffering (`1`) |
| LOG_LEVEL | string | Logging level (`INFO`) |

---

### 9. Secret (Backend)

Sensitive configuration for backend pods.

| Key | Type | Description |
|-----|------|-------------|
| DATABASE_URL | string | Neon PostgreSQL connection string |
| GEMINI_API_KEY | string | Google Gemini API key |
| SECRET_KEY | string | JWT signing key |

---

## Entity Relationships

```
┌─────────────────┐
│   Helm Chart    │
│   (todo-app)    │
└────────┬────────┘
         │ contains
         ▼
┌────────────────────────────────────────┐
│                                        │
│  ┌──────────────┐  ┌──────────────┐   │
│  │   Frontend   │  │   Backend    │   │
│  │   Subchart   │  │   Subchart   │   │
│  └──────┬───────┘  └──────┬───────┘   │
│         │                  │           │
│         ▼                  ▼           │
│  ┌────────────┐    ┌────────────┐     │
│  │ Deployment │    │ Deployment │     │
│  │ (frontend) │    │ (backend)  │     │
│  └──────┬─────┘    └──────┬─────┘     │
│         │                  │           │
│         ▼                  ▼           │
│  ┌──────────┐      ┌──────────┐       │
│  │ Service  │      │ Service  │       │
│  │ NodePort │      │ NodePort │       │
│  │ :30080   │      │ :30081   │       │
│  └──────────┘      └────┬─────┘       │
│                         │              │
│              ┌──────────┼──────────┐  │
│              ▼          ▼          ▼  │
│         ConfigMap   Secret     (DB)   │
│                                 ▲     │
│                                 │     │
│                         External Neon │
└────────────────────────────────────────┘
```

---

## Validation Rules

### Docker Images
- Images MUST be built with multi-stage Dockerfiles
- Images MUST NOT contain development dependencies
- Images MUST expose correct ports (3000, 8000)

### Deployments
- Deployments MUST set resource requests and limits
- Deployments MUST configure liveness and readiness probes
- Deployments MUST support replica scaling (1-10)

### Services
- Services MUST use NodePort type for Minikube access
- NodePorts MUST be in range 30000-32767
- Services MUST target correct container ports

### Configuration
- ConfigMaps MUST NOT contain secrets
- Secrets MUST be base64 encoded
- All sensitive values MUST use Secrets, not ConfigMaps

---

## State Transitions

Phase IV does not introduce stateful components. All state remains in:
- External Neon PostgreSQL database (unchanged from Phase III)
- No in-cluster persistent volumes required
- Pods are stateless and can be recreated without data loss
