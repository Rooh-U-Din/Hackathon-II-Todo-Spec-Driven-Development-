# Implementation Plan: Phase V - Advanced Cloud & Event-Driven Architecture

**Branch**: `005-cloud-event-driven` | **Date**: 2026-01-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/005-cloud-event-driven/spec.md`

## Summary

Extend the Phase IV Todo AI Chatbot into an event-driven microservices system with:
1. Advanced task features (recurring tasks, due dates, reminders, priorities, tags)
2. Event publishing via Dapr Pub/Sub to Kafka
3. Consumer microservices (notifications, recurring task generator, audit logging)
4. Local Kubernetes deployment with Dapr and Kafka
5. Cloud Kubernetes deployment with CI/CD pipeline

This phase adds application features AND infrastructure, unlike Phase IV which was infrastructure-only.

## Technical Context

**Language/Version**: Python 3.13 (backend services), Node.js 20 (frontend)
**Primary Dependencies**: Dapr 1.14+, Kafka (Redpanda), Helm 3.x, GitHub Actions
**Storage**: Neon PostgreSQL (extended schema), Dapr State Store
**Testing**: pytest (unit), manual validation (integration), Helm lint (infra)
**Target Platform**: Minikube (local), Oracle OKE / Azure AKS / Google GKE (cloud)
**Project Type**: Web + Microservices (frontend + backend + consumer services)
**Performance Goals**: Events processed <2s, reminders delivered <60s, 100 concurrent users
**Constraints**: Minikube (6 CPU, 12GB RAM for full stack), at-least-once event delivery
**Scale/Scope**: 3 new microservices, 6 new database tables, 3 Kafka topics

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Evidence |
|------|--------|----------|
| Spec-Driven Development (I) | PASS | All implementation follows specs/005-cloud-event-driven/spec.md |
| Human Constraints (II) | PASS | Humans write specs only; Claude Code generates all code |
| AI Obligations (III) | PASS | Only explicitly defined behavior implemented |
| External Dependencies (IV) | PASS | Phase V permits external dependencies (Dapr, Kafka) |
| Data Lifetime (V) | PASS | PostgreSQL persistence via SQLModel; Dapr state store |
| Code Quality (VI) | PASS | Python 3.13, TypeScript 5.x, clear decomposition |
| Interface Standards (VII) | PASS | REST APIs per OpenAPI, Dapr HTTP for events |
| Error Handling (VIII) | PASS | Graceful degradation, idempotent consumers |
| Phase Gate (X) | PASS | Phase IV complete; Minikube deployment operational |
| Phase V Scope | PASS | Backward compatible; extends Phase IV infrastructure |
| Backward Compatibility | PASS | NFR-08: All Phase IV functionality intact |

**Pre-Design Gate**: PASSED
**Post-Design Gate**: PENDING (re-evaluate after Phase 1)

**Note**: Constitution version 1.3.0 covers Phases I-IV. Phase V scope is validated against existing principles and extends them. A formal constitution amendment to add Phase V section is recommended but not blocking for planning.

## Project Structure

### Documentation (this feature)

```text
specs/005-cloud-event-driven/
├── spec.md              # Feature specification
├── plan.md              # This implementation plan
├── research.md          # Phase 0 research findings
├── data-model.md        # Extended entity definitions
├── quickstart.md        # Local deployment guide
├── contracts/           # API and event contracts
│   ├── task-api-v2.yaml       # Extended task API
│   ├── event-schemas.yaml     # Kafka event schemas
│   └── dapr-components.yaml   # Dapr component specs
├── checklists/
│   └── requirements.md  # Specification quality checklist
└── tasks.md             # Phase 2 output (created by /sp.tasks)
```

### Source Code (repository root)

```text
# Phase III/IV (PRESERVED - extended only)
backend/
├── app/
│   ├── main.py              # Extended with event publishing
│   ├── config.py            # Extended with Dapr config
│   ├── models/              # Extended task model + new entities
│   │   ├── task.py          # + recurrence, due_at, priority, tags
│   │   ├── reminder.py      # NEW
│   │   ├── tag.py           # NEW
│   │   ├── task_event.py    # NEW
│   │   └── audit_log.py     # NEW
│   ├── api/
│   │   ├── tasks.py         # Extended with filter/sort/search
│   │   └── events.py        # NEW - Dapr subscription endpoints
│   ├── services/
│   │   ├── task_service.py  # Extended with event publishing
│   │   ├── event_publisher.py  # NEW - Dapr pub/sub client
│   │   └── reminder_service.py # NEW - Dapr Jobs API
│   ├── mcp/                 # UNCHANGED
│   └── db/                  # UNCHANGED
└── pyproject.toml           # Extended dependencies

frontend/
├── src/
│   ├── app/                 # Extended task UI
│   └── components/
│       ├── TaskForm.tsx     # Extended with recurrence, due date, priority, tags
│       ├── TaskList.tsx     # Extended with filter/sort
│       └── TaskFilters.tsx  # NEW
├── package.json
└── next.config.js

# Phase V (NEW - consumer microservices)
services/
├── notification-service/
│   ├── app/
│   │   ├── main.py          # Dapr subscriber
│   │   ├── handlers.py      # Event handlers
│   │   └── notifier.py      # Email/web notification
│   ├── Dockerfile
│   └── pyproject.toml
├── recurring-task-service/
│   ├── app/
│   │   ├── main.py          # Dapr subscriber
│   │   ├── handlers.py      # task.completed handler
│   │   └── generator.py     # Next occurrence logic
│   ├── Dockerfile
│   └── pyproject.toml
└── audit-service/
    ├── app/
    │   ├── main.py          # Dapr subscriber
    │   ├── handlers.py      # All event handlers
    │   └── logger.py        # Audit log persistence
    ├── Dockerfile
    └── pyproject.toml

# Phase V (NEW - infrastructure extensions)
helm/
└── todo-app/
    ├── Chart.yaml           # Updated dependencies
    ├── values.yaml          # Extended configuration
    ├── values-cloud.yaml    # NEW - cloud overrides
    └── charts/
        ├── frontend/        # EXTENDED
        ├── backend/         # EXTENDED
        ├── notification/    # NEW subchart
        ├── recurring-task/  # NEW subchart
        ├── audit/           # NEW subchart
        ├── kafka/           # NEW - Redpanda/Strimzi
        └── dapr/            # NEW - Dapr components

# Phase V (NEW - CI/CD)
.github/
└── workflows/
    ├── ci.yaml              # Build and test
    └── deploy-cloud.yaml    # Cloud deployment

# Phase V (NEW - Dapr configuration)
dapr/
├── components/
│   ├── pubsub.yaml          # Kafka pub/sub
│   ├── statestore.yaml      # PostgreSQL state
│   └── secrets.yaml         # Kubernetes secrets
└── configuration.yaml       # Dapr config
```

**Structure Decision**: Extends Phase IV structure with:
1. New `services/` directory for consumer microservices (separation of concerns)
2. Extended backend with event publishing (minimal changes to existing code)
3. New Helm subcharts for each new service (independent scaling)
4. CI/CD workflows in `.github/workflows/`
5. Dapr configuration in `dapr/` directory

## Complexity Tracking

> No constitution violations. Complexity additions are justified by event-driven architecture requirements.

| Addition | Justification | Alternatives Considered |
|----------|--------------|------------------------|
| 3 new microservices | Loose coupling per FR-16; independent scaling per NFR-04 | Monolith with background workers (rejected: tight coupling) |
| Dapr abstraction | FR-12 requires broker abstraction; simplifies local/cloud portability | Direct Kafka client (rejected: tight coupling, harder testing) |
| Kafka via Redpanda | Lightweight Kafka-compatible for local; managed Kafka for cloud | RabbitMQ (rejected: less Dapr support), NATS (rejected: less tooling) |
| 6 new DB tables | Separate concerns: reminders, tags, events, audit logs | JSON columns in Task (rejected: query complexity) |

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Kubernetes Cluster                                   │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                        Helm Release: todo-app                          │ │
│  │                                                                        │ │
│  │   ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────┐   │ │
│  │   │  Frontend   │    │   Backend   │    │     Kafka (Redpanda)    │   │ │
│  │   │  (Next.js)  │───▶│  (FastAPI)  │───▶│                         │   │ │
│  │   │             │    │  + Dapr     │    │  Topics:                │   │ │
│  │   └─────────────┘    │  Sidecar    │    │  - task-events          │   │ │
│  │                      └──────┬──────┘    │  - reminders            │   │ │
│  │                             │           │  - task-updates         │   │ │
│  │                             │           └───────────┬─────────────┘   │ │
│  │                             │                       │                  │ │
│  │              ┌──────────────┼───────────────────────┤                  │ │
│  │              │              │                       │                  │ │
│  │              ▼              ▼                       ▼                  │ │
│  │   ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐        │ │
│  │   │  Notification   │ │ Recurring Task  │ │    Audit        │        │ │
│  │   │    Service      │ │    Service      │ │   Service       │        │ │
│  │   │  + Dapr Sidecar │ │  + Dapr Sidecar │ │  + Dapr Sidecar │        │ │
│  │   │                 │ │                 │ │                 │        │ │
│  │   │ Subscribes:     │ │ Subscribes:     │ │ Subscribes:     │        │ │
│  │   │ - reminders     │ │ - task-events   │ │ - task-events   │        │ │
│  │   └────────┬────────┘ └────────┬────────┘ └────────┬────────┘        │ │
│  │            │                   │                   │                  │ │
│  │            │                   ▼                   ▼                  │ │
│  │            │          ┌─────────────────────────────────┐             │ │
│  │            │          │       Neon PostgreSQL           │             │ │
│  │            │          │  (tasks, reminders, tags,       │             │ │
│  │            ▼          │   audit_logs, events)           │             │ │
│  │     Email/Web Push    └─────────────────────────────────┘             │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                           Dapr Control Plane                           │ │
│  │   - Pub/Sub Component (Kafka)                                          │ │
│  │   - State Store Component (PostgreSQL)                                 │ │
│  │   - Secrets Component (Kubernetes Secrets)                             │ │
│  │   - Jobs API (Scheduler)                                               │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Implementation Milestones

### Milestone 1: Architecture Preparation

**Goal**: Validate extension points and ensure backward compatibility.

**Deliverables**:
- Review existing backend task model and APIs
- Identify extension points for recurring tasks and reminders
- Validate current Helm charts support additional services
- Confirm PostgreSQL schema migration strategy (Alembic)

**Validation**: Architecture readiness confirmed, no breaking changes to existing APIs

### Milestone 2: Advanced Task Features

**Goal**: Implement recurring tasks, due dates, reminders, priorities, tags.

**Deliverables**:
- Extended Task model with recurrence, due_at, priority fields
- TaskTag and TaskReminder entities
- Extended task API with filter, sort, search endpoints
- Frontend UI for new task fields

**Validation**: All FR-01 through FR-10 functional via backend APIs; existing CRUD unchanged

### Milestone 3: Event Publishing Layer (Dapr)

**Goal**: Publish task events via Dapr Pub/Sub to Kafka.

**Deliverables**:
- Dapr SDK integration in backend
- Event publisher service
- Event schemas for task.created, task.completed, task.updated, task.deleted
- Retry/fallback logic for broker unavailability

**Validation**: Task events published reliably; backend decoupled from Kafka

### Milestone 4: Event Consumers & Async Services

**Goal**: Create consumer microservices that react to events.

**Deliverables**:
- Notification service (Dapr subscriber for reminders topic)
- Recurring-task-generator service (Dapr subscriber for task-events topic)
- Audit service (Dapr subscriber for all events)
- Idempotency and retry handling

**Validation**: Consumers react correctly; services independently deployable

### Milestone 5: Reminder Scheduling

**Goal**: Schedule and deliver reminders at exact times.

**Deliverables**:
- Dapr Jobs API integration for scheduled reminders
- Reminder state management (pending/sent/cancelled)
- Failure recovery and replay logic

**Validation**: Reminders delivered within 60 seconds of scheduled time

### Milestone 6: Kubernetes Integration (Local)

**Goal**: Deploy all services to Minikube with Dapr and Kafka.

**Deliverables**:
- Helm subcharts for new services
- Kafka deployment (Redpanda via Helm)
- Dapr installation and component configuration
- Service-to-service invocation validation

**Validation**: Fully working local Kubernetes environment; event-driven flow end-to-end

### Milestone 7: Cloud Deployment

**Goal**: Deploy to managed Kubernetes with CI/CD.

**Deliverables**:
- Cloud Kubernetes cluster provisioned (Oracle OKE preferred)
- Dapr installed on cloud cluster
- Managed Kafka connection (or Redpanda Cloud)
- GitHub Actions CI/CD pipeline
- Helm values-cloud.yaml overrides

**Validation**: Production-grade cloud deployment; repeatable pipeline

### Milestone 8: Validation & Documentation

**Goal**: Final testing and documentation.

**Deliverables**:
- End-to-end functional testing
- Failure scenario validation (consumer down, Kafka lag)
- README with Phase V architecture
- Quickstart guide for local and cloud deployment

**Validation**: Phase V fully validated; clear documentation for reviewers

## Dependencies Map

```
research.md
    │
    ├── data-model.md
    │
    ├── contracts/task-api-v2.yaml
    │
    ├── contracts/event-schemas.yaml
    │
    ├── contracts/dapr-components.yaml
    │
    ├── quickstart.md
    │
    └── plan.md (this file)
            │
            └── tasks.md (created by /sp.tasks)
```

## Risk Mitigation

| Risk | Mitigation Strategy |
|------|---------------------|
| R-01: Broker complexity | Start with Redpanda (simpler than Kafka); document setup steps |
| R-02: Cloud cost overrun | Use Oracle OKE free tier; document cost estimates |
| R-03: Dapr learning curve | Comprehensive quickstart guide; use Dapr Dashboard for debugging |
| R-04: Secrets management | GitHub Secrets for CI/CD; Kubernetes Secrets for runtime |
| R-05: Event ordering | Use task_id as partition key for ordered delivery per task |
| NEW: Schema migration | Alembic migrations with backward-compatible columns |
| NEW: Consumer downtime | Dead-letter queue for failed messages; replay capability |

## Success Metrics

| Metric | Target | Validation Method |
|--------|--------|-------------------|
| Recurring task generation | < 5 seconds | Timestamp diff in audit log |
| Reminder delivery | < 60 seconds (p95) | Notification service logs |
| Event publish success | 99.9% | Backend metrics endpoint |
| Event consumer latency | < 2 seconds (median) | Consumer service metrics |
| Local deployment | < 10 minutes | Timed `helm install` + Dapr + Kafka |
| Cloud deployment | < 15 minutes | GitHub Actions pipeline duration |
| Concurrent users | 100 | Load test with k6 or similar |
| Phase IV features | 100% working | Run Phase IV acceptance tests |

## Next Steps

1. ✅ Plan created (this file)
2. Generate research.md with technology decisions
3. Generate data-model.md with extended entities
4. Generate contracts/ with API and event schemas
5. Generate quickstart.md with deployment guide
6. Run `/sp.tasks` to generate actionable task list
7. Run `/sp.implement` to execute tasks

---

**Plan Status**: IN PROGRESS
**Ready for**: Research phase (Phase 0)
