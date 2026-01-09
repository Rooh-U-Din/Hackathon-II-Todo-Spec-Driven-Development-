---
id: 002
title: Phase V Implementation Plan
stage: plan
date: 2026-01-05
surface: agent
model: claude-opus-4-5-20251101
feature: 005-cloud-event-driven
branch: 005-cloud-event-driven
user: human
command: /sp.plan
labels: ["plan", "phase-v", "event-driven", "dapr", "kafka", "microservices"]
links:
  spec: specs/005-cloud-event-driven/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/005-cloud-event-driven/plan.md (created)
  - specs/005-cloud-event-driven/research.md (created)
  - specs/005-cloud-event-driven/data-model.md (created)
  - specs/005-cloud-event-driven/contracts/task-api-v2.yaml (created)
  - specs/005-cloud-event-driven/contracts/event-schemas.yaml (created)
  - specs/005-cloud-event-driven/contracts/dapr-components.yaml (created)
  - specs/005-cloud-event-driven/quickstart.md (created)
  - CLAUDE.md (updated)
tests:
  - N/A (planning phase)
---

## Prompt

/sp.plan

Scope:
Generate an execution plan for Phase V based on the existing specification.
Do NOT alter or revisit Phase I-IV.
The plan must strictly follow the appended "Phase V: Advanced Cloud & Event-Driven Architecture".

Planning Strategy:
- Break work into logical milestones
- Prefer incremental, testable steps
- Ensure backward compatibility with Phase IV
- Assume existing Helm, Kubernetes, and CI setup is present

Phase V - Execution Plan:
- Milestone 1: Architecture Preparation
- Milestone 2: Advanced Task Features
- Milestone 3: Event Publishing Layer (Dapr)
- Milestone 4: Event Consumers & Async Services
- Milestone 5: Reminder Scheduling
- Milestone 6: Kubernetes Integration (Local)
- Milestone 7: Cloud Deployment
- Milestone 8: Validation & Documentation

Completion Criteria:
- All Phase V features operational
- No regressions from Phase IV
- Architecture demonstrates event-driven, cloud-native maturity
- Deployments reproducible locally and in cloud

## Response snapshot

Created comprehensive Phase V implementation plan with:

**Phase 0 - Research (research.md)**:
- 10 research questions resolved
- Key decisions: Redpanda (Kafka-compatible), Dapr abstraction, Oracle OKE, Dapr Jobs API for reminders

**Phase 1 - Design (data-model.md, contracts/)**:
- Extended Task model with 6 new fields (recurrence, due_at, priority, etc.)
- 6 new entities: TaskTag, TaskReminder, TaskEvent, AuditLog, NotificationDelivery, ProcessedEvent
- 5 database migrations defined
- OpenAPI contract for extended task API (task-api-v2.yaml)
- CloudEvents schemas for 10 event types (event-schemas.yaml)
- Dapr component specs with pub/sub, state store, secrets, subscriptions (dapr-components.yaml)

**Architecture Overview**:
- 3 new consumer microservices (notification, recurring-task, audit)
- Kafka (Redpanda) for event streaming
- Dapr for infrastructure abstraction
- CI/CD via GitHub Actions
- Cloud deployment to Oracle OKE

**Constitution Check**: PASSED (all gates verified)

**8 Milestones defined** with clear deliverables and validation criteria.

## Outcome

- Complete plan with 8 artifacts Impact: Phase V design complete, ready for task generation
- N/A Tests: Planning phase (no tests)
- 8 files created/updated Files: plan.md, research.md, data-model.md, 3 contracts, quickstart.md, CLAUDE.md
- /sp.tasks Next prompts: Ready for task generation
- Comprehensive design addresses all spec requirements Reflection: Event-driven architecture well-defined with clear boundaries

## Evaluation notes (flywheel)

- Failure modes observed: None - clean generation
- Graders run and results (PASS/FAIL): Constitution check PASS, all milestones defined
- Prompt variant (if applicable): Standard /sp.plan with detailed user input
- Next experiment (smallest change to try): None required

## ADR Suggestions

Several architectural decisions were made that warrant documentation:

1. **Message Broker Selection**: Redpanda vs Kafka vs RabbitMQ
2. **Infrastructure Abstraction**: Dapr vs direct clients
3. **Cloud Provider**: Oracle OKE vs Azure AKS vs Google GKE
4. **Reminder Scheduling**: Dapr Jobs API vs cron polling

Suggest running `/sp.adr event-driven-architecture` to document these decisions.
