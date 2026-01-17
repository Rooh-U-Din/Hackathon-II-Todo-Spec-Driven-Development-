# Phase 0 Research: Local Kubernetes Deployment

**Feature**: 004-k8s-deployment
**Date**: 2025-12-20
**Status**: Complete

## Research Summary

This document consolidates all research findings required for Phase IV implementation planning. All NEEDS CLARIFICATION items from Technical Context have been resolved.

---

## 1. Docker Multi-Stage Build Strategy

### Decision
Use multi-stage Docker builds for both frontend and backend to optimize image size.

### Rationale
- Multi-stage builds separate build dependencies from runtime dependencies
- Reduces final image size significantly (often 50-70% smaller)
- Improves security by excluding build tools from production images
- Aligns with constitution requirement FR-01 and FR-02

### Alternatives Considered
| Alternative | Pros | Cons | Decision |
|-------------|------|------|----------|
| Single-stage build | Simpler Dockerfile | Large images (500MB+ for Node, 1GB+ for Python) | Rejected |
| Multi-stage build | Smaller images, better security | Slightly more complex Dockerfile | **Selected** |
| Distroless images | Smallest possible size | Limited debugging capability, complex setup | Consider for future |

### Implementation Details
- **Frontend**: Use `node:20-alpine` for build, `node:20-alpine` for runtime with only production deps
- **Backend**: Use `python:3.13-slim` for build and runtime, install only production dependencies

---

## 2. Minikube Service Exposure Strategy

### Decision
Use NodePort services for local access to frontend and backend.

### Rationale
- NodePort is the simplest approach for local Minikube development
- Works reliably on Windows, macOS, and Linux
- `minikube service` command provides easy URL access
- LoadBalancer type requires additional setup (metallb) for local environments

### Alternatives Considered
| Alternative | Pros | Cons | Decision |
|-------------|------|------|----------|
| ClusterIP | Secure, internal only | Requires ingress for external access | Rejected for simplicity |
| NodePort | Simple, works everywhere | Port range 30000-32767 | **Selected** |
| LoadBalancer | Production-like | Requires metallb on Minikube | Rejected for complexity |
| Ingress | Domain-based routing | Requires ingress controller setup | Rejected for Phase IV |

### Implementation Details
- Frontend: NodePort on port 30080 (maps to container port 3000)
- Backend: NodePort on port 30081 (maps to container port 8000)
- Access via `minikube service <service-name> --url`

---

## 3. Environment Variable Management

### Decision
Use ConfigMaps for non-sensitive configuration, Kubernetes Secrets for sensitive data, with Helm values.yaml templating.

### Rationale
- Separates configuration from code (12-factor app)
- Helm values.yaml provides single source of truth for configuration
- ConfigMaps for API URLs, feature flags
- Secrets for database credentials, API keys
- No hardcoding in images or manifests (NFR-05)

### Alternatives Considered
| Alternative | Pros | Cons | Decision |
|-------------|------|------|----------|
| Hardcoded in Dockerfile | Simple | Violates NFR-05, not configurable | Rejected |
| Environment in values.yaml only | Single file | Secrets visible in plain text | Rejected |
| ConfigMap + Secrets via Helm | Secure, configurable | Slightly more complex | **Selected** |
| External secrets operator | Production-grade | Overkill for local development | Rejected |

### Implementation Details
- ConfigMap for: `NEXT_PUBLIC_API_URL`, `NODE_ENV`, `PYTHONUNBUFFERED`
- Secret for: `DATABASE_URL`, `GEMINI_API_KEY`, `SECRET_KEY`
- Helm values.yaml templates both ConfigMap and Secret

---

## 4. Helm Chart Structure

### Decision
Create separate Helm charts for frontend and backend as a parent chart with subcharts.

### Rationale
- Allows independent deployment and scaling of frontend/backend
- Single `helm install` deploys entire application
- values.yaml provides unified configuration
- Follows Helm best practices for microservices

### Alternatives Considered
| Alternative | Pros | Cons | Decision |
|-------------|------|------|----------|
| Single monolithic chart | Simple, one chart | Cannot scale independently | Rejected |
| Separate independent charts | Maximum flexibility | Multiple install commands | Rejected |
| Parent chart with subcharts | Single install, independent scaling | More complex structure | **Selected** |

### Implementation Details
```
helm/
├── todo-app/
│   ├── Chart.yaml           # Parent chart
│   ├── values.yaml          # Shared configuration
│   └── charts/
│       ├── frontend/        # Frontend subchart
│       │   ├── Chart.yaml
│       │   ├── values.yaml
│       │   └── templates/
│       │       ├── deployment.yaml
│       │       └── service.yaml
│       └── backend/         # Backend subchart
│           ├── Chart.yaml
│           ├── values.yaml
│           └── templates/
│               ├── deployment.yaml
│               ├── service.yaml
│               ├── configmap.yaml
│               └── secret.yaml
```

---

## 5. Image Registry Strategy

### Decision
Use Minikube's built-in Docker daemon for local image storage.

### Rationale
- No external registry required for local development
- `eval $(minikube docker-env)` allows building directly in Minikube's Docker
- Images are immediately available to pods
- Simplest approach for Phase IV local deployment

### Alternatives Considered
| Alternative | Pros | Cons | Decision |
|-------------|------|------|----------|
| Docker Hub | Standard, sharable | Requires account, push/pull time | Rejected for local |
| Local registry (registry:2) | Private, fast | Additional setup complexity | Rejected |
| Minikube Docker daemon | Zero setup, fast | Images not sharable externally | **Selected** |

### Implementation Details
- Set `imagePullPolicy: Never` in Helm charts
- Build images after running `eval $(minikube docker-env)`
- Tag images as `todo-frontend:local` and `todo-backend:local`

---

## 6. Health Check Strategy

### Decision
Implement liveness and readiness probes for both services.

### Rationale
- Kubernetes can automatically restart unhealthy pods
- Readiness probes prevent traffic to pods not ready to serve
- Essential for reliable horizontal scaling
- Aligns with SC-05 (scaling without interruption)

### Implementation Details
- **Frontend**:
  - Liveness: HTTP GET `/` on port 3000
  - Readiness: HTTP GET `/` on port 3000
  - Initial delay: 10 seconds

- **Backend**:
  - Liveness: HTTP GET `/health` on port 8000 (needs endpoint)
  - Readiness: HTTP GET `/health` on port 8000
  - Initial delay: 15 seconds

---

## 7. Resource Limits

### Decision
Set conservative resource requests and limits suitable for Minikube.

### Rationale
- Minikube has limited resources (typically 2-4 CPU, 4-8GB RAM)
- Resource limits prevent a single pod from consuming all cluster resources
- Requests ensure pods get minimum required resources
- Enables proper scheduling for horizontal scaling

### Implementation Details
| Service | CPU Request | CPU Limit | Memory Request | Memory Limit |
|---------|-------------|-----------|----------------|--------------|
| Frontend | 100m | 500m | 128Mi | 512Mi |
| Backend | 200m | 1000m | 256Mi | 1Gi |

---

## 8. AI DevOps Tools Integration

### Decision
Use AI tools as first-class operators where available, with fallback to manual commands.

### Rationale
- Constitution requires AI tools for DevOps tasks (NFR-04, ADR-01/02/03)
- Docker AI Agent (Gordon) for Dockerfile optimization
- kubectl-ai for deployment operations
- kagent for cluster health analysis

### Tool Availability Check
| Tool | Purpose | Availability | Fallback |
|------|---------|--------------|----------|
| Docker AI (Gordon) | Dockerfile generation, optimization | Docker Desktop feature | Claude Code generates Dockerfile |
| kubectl-ai | Deploy, scale, debug | Requires separate install | Standard kubectl commands |
| kagent | Cluster health, optimization | Requires separate install | kubectl describe/logs/top |

### Implementation Details
1. Document AI tool commands in quickstart.md
2. Provide manual command alternatives
3. Evidence of AI tool usage captured in PHR

---

## Dependencies Verified

| Dependency | Version | Purpose | Status |
|------------|---------|---------|--------|
| Docker Desktop | 4.x+ | Container building | Assumed installed |
| Minikube | 1.32+ | Local Kubernetes | Assumed installed |
| Helm | 3.x | Package management | Assumed installed |
| kubectl | 1.29+ | Cluster management | Bundled with Minikube |
| Python | 3.13 | Backend runtime | In pyproject.toml |
| Node.js | 20.x | Frontend runtime | In package.json |

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Minikube resource exhaustion | Pods fail to schedule | Set conservative limits, document requirements |
| Database connectivity from cluster | Backend fails to connect | Verify Neon allows external connections |
| AI tools not installed | Cannot fulfill ADR requirements | Provide manual fallback commands |
| Windows path issues in Docker | Build failures | Use Linux containers, forward slashes |

---

## Research Completion

All Technical Context NEEDS CLARIFICATION items have been resolved:
- [x] Docker build strategy → Multi-stage builds
- [x] Service exposure → NodePort
- [x] Configuration management → ConfigMap + Secrets
- [x] Helm structure → Parent chart with subcharts
- [x] Image registry → Minikube Docker daemon
- [x] Health checks → Liveness/Readiness probes
- [x] Resource limits → Conservative Minikube-friendly values
- [x] AI tools → Document usage, provide fallbacks

**Research Status**: COMPLETE
**Ready for Phase 1**: Yes
