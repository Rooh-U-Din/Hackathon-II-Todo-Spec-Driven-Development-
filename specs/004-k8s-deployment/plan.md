# Implementation Plan: Phase IV - Local Kubernetes Deployment

**Branch**: `004-k8s-deployment` | **Date**: 2025-12-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/004-k8s-deployment/spec.md`

## Summary

Deploy the existing Phase III Todo AI Chatbot (Next.js frontend + FastAPI backend) as a cloud-native application on a local Kubernetes cluster using Minikube and Helm charts. This is a pure infrastructure phase with no application code changes. AI-assisted DevOps tools (Docker AI, kubectl-ai, kagent) will be used for container and cluster operations.

## Technical Context

**Language/Version**: Python 3.13 (backend), Node.js 20 (frontend)
**Primary Dependencies**: Docker, Minikube, Helm 3.x, kubectl
**Storage**: External Neon PostgreSQL (unchanged from Phase III)
**Testing**: Manual validation via Helm, kubectl, and browser testing
**Target Platform**: Local Kubernetes (Minikube) on Windows/macOS/Linux
**Project Type**: Web (frontend + backend)
**Performance Goals**: Pods running within 2 minutes, frontend accessible within 30 seconds
**Constraints**: Minikube resources (4 CPU, 8GB RAM recommended), stateless containers
**Scale/Scope**: 1-3 replicas per service, local development only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Evidence |
|------|--------|----------|
| Spec-Driven Development (I) | PASS | All implementation follows specs/004-k8s-deployment/spec.md |
| Human Constraints (II) | PASS | Humans write specs only; Claude Code generates Dockerfiles/Helm charts |
| AI Obligations (III) | PASS | Only explicitly defined infrastructure behavior implemented |
| External Dependencies (IV) | PASS | Phase IV permits external dependencies |
| Data Lifetime (V) | PASS | No in-container state; external Neon PostgreSQL |
| Code Quality (VI) | PASS | Infrastructure as code follows Helm/Docker best practices |
| Interface Standards - K8s (VII) | PASS | Declarative Helm, NodePort services, scalable replicas |
| Error Handling (VIII) | PASS | Health probes, graceful degradation via Kubernetes |
| Phase Gate (X) | PASS | Phase III complete; AI chatbot operational |
| Phase IV Scope | PASS | No application code changes; infrastructure only |
| Phase IV Requirements | PASS | Docker, Helm, Minikube, AI DevOps tools specified |

**Pre-Design Gate**: PASSED
**Post-Design Gate**: PASSED (re-evaluated after Phase 1)

## Project Structure

### Documentation (this feature)

```text
specs/004-k8s-deployment/
├── spec.md              # Feature specification
├── plan.md              # This implementation plan
├── research.md          # Phase 0 research findings
├── data-model.md        # Infrastructure entity definitions
├── quickstart.md        # Quick start deployment guide
├── contracts/           # Configuration contracts
│   └── helm-values-schema.yaml
├── checklists/
│   └── requirements.md  # Specification quality checklist
└── tasks.md             # Phase 2 output (created by /sp.tasks)
```

### Source Code (repository root)

```text
# Phase III (UNCHANGED - preserved per constitution)
backend/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── models/
│   ├── api/
│   ├── services/
│   ├── mcp/
│   └── db/
└── pyproject.toml

frontend/
├── src/
│   ├── app/
│   └── components/
├── package.json
└── next.config.js

# Phase IV (NEW - infrastructure only)
Dockerfile.frontend      # Multi-stage frontend build
Dockerfile.backend       # Multi-stage backend build

helm/
└── todo-app/
    ├── Chart.yaml
    ├── values.yaml
    └── charts/
        ├── frontend/
        │   ├── Chart.yaml
        │   ├── values.yaml
        │   └── templates/
        │       ├── deployment.yaml
        │       ├── service.yaml
        │       └── _helpers.tpl
        └── backend/
            ├── Chart.yaml
            ├── values.yaml
            └── templates/
                ├── deployment.yaml
                ├── service.yaml
                ├── configmap.yaml
                ├── secret.yaml
                └── _helpers.tpl
```

**Structure Decision**: Infrastructure-only extension to existing Phase III web application structure. No changes to application source code directories.

## Complexity Tracking

> No constitution violations requiring justification. Infrastructure additions are explicitly permitted by Phase IV scope.

| Addition | Justification | Alternatives Considered |
|----------|--------------|------------------------|
| Helm parent/subchart | Single install command, independent scaling | Monolithic chart (rejected: no independent scaling) |
| Multi-stage Dockerfiles | Image optimization per FR-01/FR-02 | Single-stage (rejected: large images) |
| NodePort services | Simplest Minikube access | LoadBalancer (rejected: requires metallb) |

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Minikube Cluster                            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 Helm Release: todo-app                   │   │
│  │                                                          │   │
│  │   ┌───────────────────┐   ┌───────────────────┐        │   │
│  │   │   Deployment:     │   │   Deployment:     │        │   │
│  │   │   todo-frontend   │   │   todo-backend    │        │   │
│  │   │   (1-3 replicas)  │   │   (1-3 replicas)  │        │   │
│  │   │                   │   │                   │        │   │
│  │   │  ┌─────────────┐  │   │  ┌─────────────┐  │        │   │
│  │   │  │ Pod: Next.js│  │   │  │ Pod: FastAPI│  │        │   │
│  │   │  │ Port: 3000  │  │   │  │ Port: 8000  │  │        │   │
│  │   │  └─────────────┘  │   │  └─────────────┘  │        │   │
│  │   └─────────┬─────────┘   └─────────┬─────────┘        │   │
│  │             │                       │                   │   │
│  │   ┌─────────▼─────────┐   ┌─────────▼─────────┐        │   │
│  │   │  Service:         │   │  Service:         │        │   │
│  │   │  NodePort :30080  │   │  NodePort :30081  │        │   │
│  │   └───────────────────┘   └─────────┬─────────┘        │   │
│  │                                     │                   │   │
│  │                           ┌─────────┴─────────┐        │   │
│  │                           │ ConfigMap + Secret │        │   │
│  │                           └───────────────────┘        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS
                                    ▼
                         ┌─────────────────────┐
                         │  Neon PostgreSQL    │
                         │  (External)         │
                         └─────────────────────┘
```

## Implementation Phases

### Phase 1: Docker Containerization

**Goal**: Create optimized Docker images for frontend and backend.

**Deliverables**:
- `Dockerfile.frontend`: Multi-stage build for Next.js
- `Dockerfile.backend`: Multi-stage build for FastAPI
- Images built and verified locally

**AI Tool Usage**:
- Docker AI (Gordon) for Dockerfile generation and optimization
- Claude Code as fallback for Dockerfile creation

### Phase 2: Helm Chart Development

**Goal**: Create declarative Helm charts for Kubernetes deployment.

**Deliverables**:
- Parent chart `todo-app` with Chart.yaml and values.yaml
- Frontend subchart with Deployment and Service templates
- Backend subchart with Deployment, Service, ConfigMap, Secret templates
- Helm lint validation passing

**AI Tool Usage**:
- kubectl-ai for Helm template validation
- Claude Code for chart generation

### Phase 3: Minikube Deployment

**Goal**: Deploy and verify application on local Kubernetes.

**Deliverables**:
- Successful `helm install` execution
- All pods in Running state
- Services accessible via NodePort
- Health probes passing

**AI Tool Usage**:
- kubectl-ai for deployment and debugging
- kagent for cluster health analysis

### Phase 4: Scaling and Validation

**Goal**: Verify horizontal scaling and all acceptance criteria.

**Deliverables**:
- Scaling test from 1 to 3 replicas successful
- Pod restart test with no data loss
- All Phase III features verified working
- Documentation complete

**AI Tool Usage**:
- kubectl-ai for scaling operations
- kagent for resource optimization

## Dependencies Map

```
research.md (complete)
    │
    ├── data-model.md (complete)
    │
    ├── contracts/helm-values-schema.yaml (complete)
    │
    ├── quickstart.md (complete)
    │
    └── plan.md (this file - complete)
            │
            └── tasks.md (complete - regenerated)
```

## Risk Mitigation

| Risk | Mitigation Strategy |
|------|---------------------|
| Minikube resource exhaustion | Document minimum requirements (4 CPU, 8GB RAM) |
| Database connectivity | Verify Neon allows external connections from cluster |
| AI tools unavailable | Provide manual command fallbacks in quickstart.md |
| Image build failures on Windows | Use Linux containers, test path handling |

## Success Metrics

| Metric | Target | Validation Method |
|--------|--------|-------------------|
| Deployment time | < 5 minutes | Timed `helm install` |
| Pod startup | < 2 minutes | `kubectl get pods -w` |
| Frontend access | < 30 seconds | Browser access after pod ready |
| Scaling | No interruption | Load test during scale |
| Data persistence | No loss on restart | Create task, restart pod, verify |

## Next Steps

1. ✅ Run `/sp.tasks` to generate actionable task list (completed)
2. Run `/sp.implement` to execute tasks using Claude Code and AI DevOps tools
3. Validate against acceptance criteria
4. Document AI tool usage in PHR

---

**Plan Status**: COMPLETE
**Ready for**: `/sp.implement` to execute implementation tasks
