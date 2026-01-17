# Research: Phase V - Advanced Cloud & Event-Driven Architecture

**Feature**: 005-cloud-event-driven
**Date**: 2026-01-05
**Status**: Complete

## Research Questions

This document captures technology decisions and best practices research for Phase V implementation.

---

## RQ-01: Message Broker Selection

**Question**: Which message broker should be used for event-driven communication?

**Decision**: Redpanda (Kafka-compatible)

**Rationale**:
- Kafka-compatible API ensures ecosystem compatibility with Dapr
- Significantly simpler to run locally than Apache Kafka (single binary)
- Lower resource requirements for Minikube (2GB vs 6GB+ for Kafka + ZooKeeper)
- Production-ready with managed cloud option (Redpanda Cloud)
- No ZooKeeper dependency

**Alternatives Considered**:
| Option | Pros | Cons | Rejected Because |
|--------|------|------|------------------|
| Apache Kafka | Industry standard, mature | Heavy resource usage, ZooKeeper dependency | Too heavy for local development |
| RabbitMQ | Lightweight, good Dapr support | Not Kafka-compatible, different semantics | Less ecosystem tooling |
| NATS | Very lightweight | Limited Dapr Pub/Sub features | Missing features for at-least-once |
| Azure Event Hubs | Managed, Kafka-compatible | Azure-only | Limits cloud provider choice |

**Implementation Notes**:
- Use Redpanda Helm chart for local deployment
- Use Redpanda Cloud or Confluent Cloud for production
- Configure 3 topics: `task-events`, `reminders`, `task-updates`
- Retention: 7 days for development, 30 days for production

---

## RQ-02: Infrastructure Abstraction Layer

**Question**: How should services interact with Kafka without direct coupling?

**Decision**: Dapr (Distributed Application Runtime)

**Rationale**:
- Provides Pub/Sub, State Store, Secrets, and Service Invocation as building blocks
- Sidecar pattern enables language-agnostic integration
- Swappable components (can change from Kafka to RabbitMQ without code changes)
- Jobs API provides exact-time scheduling for reminders
- Active CNCF project with strong community

**Alternatives Considered**:
| Option | Pros | Cons | Rejected Because |
|--------|------|------|------------------|
| Direct Kafka client | Full control | Tight coupling, harder testing | Violates FR-12 |
| Spring Cloud Stream | Mature abstraction | Java/JVM only | Backend is Python |
| Celery | Python-native | Task queue pattern, not event streaming | Wrong paradigm |
| Custom abstraction | Tailored | Development overhead | Reinventing wheel |

**Implementation Notes**:
- Dapr version: 1.14+ (stable Jobs API)
- Sidecar injection via annotations in Kubernetes
- Components configured via Kubernetes CRDs
- Use Dapr Dashboard for local debugging

---

## RQ-03: Cloud Kubernetes Provider

**Question**: Which cloud Kubernetes provider should be used for production deployment?

**Decision**: Oracle Cloud OKE (primary), Azure AKS (fallback)

**Rationale**:
- Oracle OKE offers always-free tier with 4 AMD-based nodes
- No credit card required for free tier
- Sufficient for hackathon demonstration
- Dapr and Redpanda can be installed on any Kubernetes cluster

**Alternatives Considered**:
| Option | Pros | Cons | Rejected Because |
|--------|------|------|------------------|
| Google GKE | Excellent, free tier | Free tier limited to 1 zonal cluster | Less free resources |
| Azure AKS | Great Dapr support | Requires credit card, costs can accumulate | Cost risk |
| AWS EKS | Industry standard | Most expensive, complex setup | Cost and complexity |
| DigitalOcean | Simple, affordable | No free tier | Cost for hackathon |

**Implementation Notes**:
- Use Oracle Cloud CLI (oci) for cluster provisioning
- Terraform scripts for reproducibility
- GitHub Actions secrets for OCI credentials
- Fallback documentation for Azure AKS if Oracle unavailable

---

## RQ-04: Reminder Scheduling Approach

**Question**: How should reminders be scheduled and triggered at exact times?

**Decision**: Dapr Jobs API

**Rationale**:
- Purpose-built for exact-time scheduling in Dapr ecosystem
- No polling required (cron-based approaches waste resources)
- Automatic retry and failure handling
- Integrates with existing Dapr sidecar

**Alternatives Considered**:
| Option | Pros | Cons | Rejected Because |
|--------|------|------|------------------|
| Cron job polling | Simple | Wasteful, not exact time | Spec says no cron polling |
| Celery beat | Python-native | Separate infrastructure | Additional complexity |
| Kubernetes CronJobs | Native to K8s | Minute granularity only | Not precise enough |
| APScheduler | In-process | No distributed coordination | Single point of failure |

**Implementation Notes**:
- Schedule job when reminder is created
- Job triggers HTTP callback to notification service
- Store job ID in TaskReminder for cancellation
- Handle timezone conversion at job creation

---

## RQ-05: Database Schema Migration Strategy

**Question**: How should database schema changes be managed for Phase V extensions?

**Decision**: Alembic with SQLModel

**Rationale**:
- Alembic is the standard migration tool for SQLAlchemy/SQLModel
- Supports backward-compatible migrations (add columns, not remove)
- Already compatible with existing Phase II/III database setup
- Can run migrations as Kubernetes Job before deployment

**Alternatives Considered**:
| Option | Pros | Cons | Rejected Because |
|--------|------|------|------------------|
| Manual SQL scripts | Full control | Error-prone, no rollback | Risk of errors |
| Django migrations | Mature | Wrong ORM | Using SQLModel |
| Flyway | Cross-platform | Java-based | Python ecosystem preferred |

**Implementation Notes**:
- New columns: `recurrence_type`, `recurrence_interval`, `next_occurrence_at`, `due_at`, `remind_at`, `priority`
- New tables: `task_tags`, `task_tag_associations`, `task_reminders`, `task_events`, `audit_logs`
- All new columns nullable for backward compatibility
- Migration run as init container in Kubernetes

---

## RQ-06: Notification Delivery Channel

**Question**: How should reminder notifications be delivered to users?

**Decision**: Email (primary) with Web Push (optional)

**Rationale**:
- Email addresses already available from Phase II authentication
- Simple SMTP integration with Neon PostgreSQL email or external service
- Web Push can be added incrementally
- Meets spec requirement for "web/email only"

**Alternatives Considered**:
| Option | Pros | Cons | Rejected Because |
|--------|------|------|------------------|
| Mobile push | Rich experience | Out of scope (spec says web/email) | Spec exclusion |
| SMS | Reliable | Cost, complexity | Over-engineering |
| In-app only | Simplest | User may miss it | Defeats reminder purpose |

**Implementation Notes**:
- Use Resend, Mailgun, or similar for SMTP
- For local development: mock email service (MailHog or log-only)
- Store NotificationDelivery record for audit
- Web Push via browser Notification API (optional enhancement)

---

## RQ-07: Event Schema Format

**Question**: What format should be used for event payloads?

**Decision**: CloudEvents specification with JSON encoding

**Rationale**:
- CloudEvents is CNCF standard for event data
- Dapr uses CloudEvents by default
- Provides standard envelope (source, type, time, data)
- JSON encoding for simplicity and debuggability

**Implementation Notes**:
```json
{
  "specversion": "1.0",
  "type": "task.completed",
  "source": "/backend/tasks",
  "id": "uuid-here",
  "time": "2026-01-05T10:30:00Z",
  "datacontenttype": "application/json",
  "data": {
    "task_id": "uuid",
    "user_id": "uuid",
    "title": "Task title",
    "completed_at": "2026-01-05T10:30:00Z"
  }
}
```

Event types:
- `task.created` - New task created
- `task.updated` - Task modified
- `task.completed` - Task marked complete
- `task.deleted` - Task deleted
- `reminder.due` - Reminder time reached
- `reminder.sent` - Notification delivered

---

## RQ-08: Consumer Idempotency Strategy

**Question**: How should consumers handle duplicate event deliveries?

**Decision**: Idempotency key based on event ID + consumer tracking table

**Rationale**:
- At-least-once delivery means duplicates are expected
- Event ID from CloudEvents provides unique identifier
- Consumer maintains processed_events table
- Check-then-process pattern with database transaction

**Implementation Notes**:
- Each consumer has `processed_events` table with `event_id` unique constraint
- Before processing: check if event_id exists
- If exists: acknowledge without reprocessing
- If not: process and insert event_id atomically
- Cleanup: remove entries older than retention period

---

## RQ-09: CI/CD Pipeline Structure

**Question**: How should the CI/CD pipeline be organized?

**Decision**: GitHub Actions with separate build and deploy stages

**Rationale**:
- GitHub Actions is already used in most projects
- Free tier sufficient for hackathon
- Native integration with GitHub repository
- Matrix builds for multiple services

**Pipeline Structure**:
```
ci.yaml (on push/PR):
  - Lint Python/TypeScript
  - Run unit tests
  - Build Docker images
  - Push to container registry (GitHub Container Registry)

deploy-cloud.yaml (on release/manual):
  - Pull images from registry
  - Run Helm upgrade
  - Verify deployment health
  - Run smoke tests
```

**Implementation Notes**:
- Use GitHub Container Registry (ghcr.io) for images
- Store cloud credentials as GitHub Secrets
- Deploy to cloud only on tagged releases or manual trigger
- Include rollback step on failure

---

## RQ-10: Local Development Experience

**Question**: How should developers run the full stack locally?

**Decision**: Docker Compose for services + Minikube for Kubernetes validation

**Rationale**:
- Docker Compose is simpler for daily development
- Minikube for validating Kubernetes-specific behavior
- Dapr CLI supports standalone mode (no Kubernetes required for basic testing)

**Development Modes**:
1. **Local (Docker Compose)**: Fast iteration, all services in containers
2. **Minikube**: Full Kubernetes simulation with Dapr sidecars
3. **Hybrid**: Backend on host, dependencies in Docker

**Implementation Notes**:
- `docker-compose.dev.yaml` with all services
- Dapr CLI for local Pub/Sub testing
- Minikube profile for Phase V stack
- Documentation for each mode in quickstart.md

---

## Summary of Decisions

| Question | Decision | Key Benefit |
|----------|----------|-------------|
| Message Broker | Redpanda | Lightweight Kafka-compatible |
| Abstraction Layer | Dapr | Loose coupling, portability |
| Cloud Provider | Oracle OKE | Always-free tier |
| Reminder Scheduling | Dapr Jobs API | Exact-time, no polling |
| Schema Migration | Alembic | Standard SQLModel tooling |
| Notifications | Email (SMTP) | Leverages existing user data |
| Event Format | CloudEvents JSON | CNCF standard |
| Idempotency | Event ID tracking | Handles duplicates |
| CI/CD | GitHub Actions | Free, integrated |
| Local Dev | Docker Compose + Minikube | Flexibility |

---

**Research Status**: COMPLETE
**Ready for**: Phase 1 Design (data-model.md, contracts/)
