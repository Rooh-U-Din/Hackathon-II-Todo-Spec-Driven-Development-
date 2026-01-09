# Tasks: Phase V - Advanced Cloud & Event-Driven Architecture

**Input**: Design documents from `specs/005-cloud-event-driven/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are NOT explicitly requested in the specification. Manual validation via Dapr Dashboard, kubectl, and browser is the testing approach.

**Organization**: Tasks are grouped by milestone and user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Path Conventions

Phase V files extend existing structure:
- `backend/app/models/` - Extended and new model files
- `backend/app/services/` - New services for events and reminders
- `backend/app/api/` - Extended and new API endpoints
- `services/` - NEW: Consumer microservices directory
- `helm/todo-app/charts/` - Extended with new subcharts
- `dapr/` - NEW: Dapr component configuration
- `.github/workflows/` - NEW: CI/CD pipelines

---

## Phase 9: Architecture Preparation (T063)

**Purpose**: Validate extension points and ensure backward compatibility

- [x] T063 Review existing backend task APIs and models in backend/app/models/task.py and backend/app/api/tasks.py
- [x] T063a [P] Verify Helm charts support additional services by reviewing helm/todo-app/Chart.yaml
- [x] T063b [P] Confirm Alembic migration setup exists in backend/alembic/ or create if missing
- [ ] T063c Document extension points in specs/005-cloud-event-driven/architecture-review.md

**Checkpoint**: Architecture approved for extension; no breaking changes to Phase IV

---

## Phase 10: User Story 1 - Recurring Tasks (Priority: P1)

**Goal**: Allow users to create tasks that automatically repeat on a schedule

**Independent Test**: Create a daily recurring task, mark it complete, verify new occurrence is generated for next day

### Database Schema

- [x] T064 [US1] Create Alembic migration for task recurrence fields in backend/alembic/versions/20260106_0001_001_phase_v_schema.py
- [x] T064a [US1] Add RecurrenceType enum to backend/app/models/task.py
- [x] T064b [US1] Extend Task model with recurrence_type, recurrence_interval, next_occurrence_at, parent_task_id in backend/app/models/task.py

### Backend API

- [x] T064c [US1] Update TaskCreate schema with optional recurrence fields in backend/app/models/task.py
- [x] T064d [US1] Update TaskResponse schema to include recurrence data in backend/app/models/task.py
- [x] T064e [US1] Implement recurrence validation in task creation in backend/app/services/task_service.py
- [x] T064f [US1] Implement next occurrence calculation logic in backend/app/services/task_service.py
- [x] T064g [US1] Extend complete_task to trigger recurrence generation in backend/app/services/task_service.py

### Frontend UI

- [x] T064h [P] [US1] Add recurrence selector to TaskForm component in frontend/src/components/TaskForm.tsx
- [x] T064i [P] [US1] Display recurrence badge on TaskCard in frontend/src/components/TaskCard.tsx
- [x] T064j [US1] Update task API client types with recurrence fields in frontend/src/lib/types.ts

### Validation

- [ ] T064k [US1] Run migration and verify schema changes applied correctly
- [ ] T064l [US1] Test recurring task creation via API (daily, weekly, custom interval)
- [ ] T064m [US1] Test task completion generates next occurrence within 5 seconds

**Checkpoint**: User Story 1 complete - recurring tasks work end-to-end (AC-01)

---

## Phase 11: User Story 2 - Due Dates & Reminders (Priority: P2)

**Goal**: Allow users to set due dates and receive notifications

**Independent Test**: Create task with due date and reminder, verify notification arrives at scheduled time

### Database Schema

- [x] T065 [US2] Create Alembic migration for due_at field in backend/alembic/versions/20260106_0001_001_phase_v_schema.py
- [x] T065a [US2] Create TaskReminder model in backend/app/models/reminder.py
- [x] T065b [US2] Create Alembic migration for task_reminders table in backend/alembic/versions/20260106_0001_001_phase_v_schema.py
- [x] T065c [US2] Add ReminderStatus enum to backend/app/models/reminder.py

### Backend API

- [x] T065d [US2] Update Task model with due_at field in backend/app/models/task.py
- [x] T065e [US2] Create ReminderCreate and ReminderResponse schemas in backend/app/models/reminder.py
- [x] T065f [US2] Create reminder_service with schedule/cancel logic in backend/app/services/reminders.py
- [x] T065g [US2] Add POST /tasks/{task_id}/reminder endpoint in backend/app/api/tasks.py
- [x] T065h [US2] Add DELETE /tasks/{task_id}/reminder endpoint in backend/app/api/tasks.py
- [ ] T065i [US2] Cancel pending reminders when task completed/deleted in backend/app/services/task_service.py

### Frontend UI

- [x] T065j [P] [US2] Add due date picker to TaskForm in frontend/src/components/TaskForm.tsx
- [x] T065k [P] [US2] Add reminder time picker to TaskForm in frontend/src/components/TaskForm.tsx
- [x] T065l [US2] Display due date and overdue highlighting in TaskCard in frontend/src/components/TaskCard.tsx
- [ ] T065m [US2] Update task API client with reminder endpoints in frontend/src/lib/api.ts

### Validation

- [ ] T065n [US2] Run migrations and verify reminder table created
- [ ] T065o [US2] Test reminder creation via API returns reminder data
- [ ] T065p [US2] Test reminder cancellation when task is completed

**Checkpoint**: User Story 2 complete - due dates and reminders stored correctly (AC-02 partial)

---

## Phase 12: User Story 3 - Priorities and Tags (Priority: P3)

**Goal**: Allow users to organize tasks with priorities and tags

**Independent Test**: Create tasks with priorities and tags, filter and sort to verify correct behavior

### Database Schema

- [x] T066 [US3] Add Priority enum to backend/app/models/task.py
- [x] T066a [US3] Create TaskTag model in backend/app/models/tag.py
- [x] T066b [US3] Create TaskTagAssociation model in backend/app/models/tag.py
- [x] T066c [US3] Create Alembic migration for priority field in backend/alembic/versions/20260106_0001_001_phase_v_schema.py
- [x] T066d [US3] Create Alembic migration for tags tables in backend/alembic/versions/20260106_0001_001_phase_v_schema.py

### Backend API

- [x] T066e [US3] Update Task model with priority field (default: medium) in backend/app/models/task.py
- [x] T066f [US3] Create TagCreate and TagResponse schemas in backend/app/models/tag.py
- [x] T066g [US3] Create tag_service with CRUD operations in backend/app/services/tags.py
- [x] T066h [US3] Add GET/POST /tags endpoints in backend/app/api/tags.py
- [x] T066i [US3] Add PATCH/DELETE /tags/{tag_id} endpoints in backend/app/api/tags.py
- [x] T066j [US3] Add PUT /tasks/{task_id}/tags endpoint in backend/app/api/tasks.py
- [x] T066k [US3] Implement filter parameters (status, priority, tags, due_before, due_after) in backend/app/api/tasks.py
- [x] T066l [US3] Implement sort parameters (created_at, due_at, priority) in backend/app/api/tasks.py
- [x] T066m [US3] Implement full-text search on title/description in backend/app/api/tasks.py

### Frontend UI

- [x] T066n [P] [US3] Add priority selector to TaskForm in frontend/src/components/TaskForm.tsx
- [x] T066o [P] [US3] Add tag multi-select to TaskForm in frontend/src/components/TaskForm.tsx
- [x] T066p [US3] Create TaskFilters component with filter/sort controls in frontend/src/components/TaskFilters.tsx
- [x] T066q [US3] Display priority badge on TaskCard in frontend/src/components/TaskCard.tsx
- [x] T066r [US3] Display tags on TaskCard items in frontend/src/components/TaskCard.tsx
- [x] T066s [US3] Integrate TaskFilters into task list page in frontend/src/app/(dashboard)/tasks/page.tsx

### Validation

- [ ] T066t [US3] Run migrations and verify tags tables created
- [ ] T066u [US3] Test filtering by priority returns correct results
- [ ] T066v [US3] Test filtering by tag returns only tagged tasks
- [ ] T066w [US3] Test sorting by due_at orders tasks correctly
- [ ] T066x [US3] Test full-text search returns matching tasks

**Checkpoint**: User Story 3 complete - tasks filterable by priority and tags (AC-03)

---

## Phase 13: User Story 4 - Event Publishing (Priority: P4)

**Goal**: Publish task events via Dapr Pub/Sub to Kafka

**Independent Test**: Perform task operation, verify event appears in message topic with correct payload

### Dapr Setup

- [x] T067 [US4] Create Dapr components directory at infra/dapr/components/
- [x] T067a [US4] Create Redis pub/sub component config at infra/dapr/components/pubsub.yaml (Redis for dev, Kafka for prod)
- [ ] T067b [US4] Create PostgreSQL state store config at dapr/components/statestore.yaml
- [ ] T067c [US4] Create Kubernetes secrets config at dapr/components/secrets.yaml
- [ ] T067d [US4] Create Dapr configuration at dapr/configuration.yaml

### Event Publisher

- [x] T067e [US4] Create TaskEvent model in backend/app/models/task_event.py
- [x] T067f [US4] Create Alembic migration for task_events table in backend/alembic/versions/20260106_0001_001_phase_v_schema.py
- [x] T067g [US4] Create event_publisher service with Dapr HTTP client in backend/app/events/publisher.py
- [x] T067h [US4] Implement publish_event method with retry logic in backend/app/events/publisher.py
- [x] T067i [US4] Implement outbox pattern for broker unavailability in backend/app/events/publisher.py (EventWorker processes outbox)

### Backend Integration

- [x] T067j [US4] Add Dapr configuration to backend/app/config.py
- [x] T067k [US4] Publish task.created event on task creation in backend/app/services/tasks.py
- [x] T067l [US4] Publish task.updated event on task update in backend/app/services/tasks.py
- [x] T067m [US4] Publish task.completed event on task completion in backend/app/services/tasks.py
- [x] T067n [US4] Publish task.deleted event on task deletion in backend/app/services/tasks.py
- [x] T067o [US4] Add httpx dependency for Dapr HTTP API in backend/pyproject.toml

### Validation

- [ ] T067p [US4] Test event publishing with Dapr standalone mode
- [ ] T067q [US4] Verify events contain correct CloudEvents envelope
- [ ] T067r [US4] Test outbox replay when broker reconnects

**Checkpoint**: User Story 4 partial - events published reliably (AC-04)

---

## Phase 14: Event Consumer Services (T068)

**Purpose**: Create consumer microservices that react to events

### Services Directory Structure

- [ ] T068 Create services directory structure at services/
- [ ] T068a [P] Create notification-service structure at services/notification-service/
- [ ] T068b [P] Create recurring-task-service structure at services/recurring-task-service/
- [ ] T068c [P] Create audit-service structure at services/audit-service/

### Notification Service

- [ ] T068d [US4] Create FastAPI app with Dapr subscription in services/notification-service/app/main.py
- [ ] T068e [US4] Create event handlers for reminders topic in services/notification-service/app/handlers.py
- [ ] T068f [US4] Create notifier with email/mock delivery in services/notification-service/app/notifier.py
- [ ] T068g [US4] Create Dockerfile for notification service at services/notification-service/Dockerfile
- [ ] T068h [US4] Create pyproject.toml with dependencies at services/notification-service/pyproject.toml

### Recurring Task Service

- [ ] T068i [US4] Create FastAPI app with Dapr subscription in services/recurring-task-service/app/main.py
- [ ] T068j [US4] Create task.completed handler in services/recurring-task-service/app/handlers.py
- [ ] T068k [US4] Create next occurrence generator logic in services/recurring-task-service/app/generator.py
- [ ] T068l [US4] Create Dockerfile for recurring-task service at services/recurring-task-service/Dockerfile
- [ ] T068m [US4] Create pyproject.toml with dependencies at services/recurring-task-service/pyproject.toml

### Audit Service

- [x] T068n [US4] Create AuditLog model in backend/app/models/audit_log.py
- [x] T068o [US4] Create Alembic migration for audit_logs table in backend/alembic/versions/20260106_0001_001_phase_v_schema.py
- [ ] T068p [US4] Create FastAPI app with Dapr subscription in services/audit-service/app/main.py
- [ ] T068q [US4] Create event handlers for all topics in services/audit-service/app/handlers.py
- [ ] T068r [US4] Create audit logger with DB persistence in services/audit-service/app/logger.py
- [ ] T068s [US4] Create Dockerfile for audit service at services/audit-service/Dockerfile
- [ ] T068t [US4] Create pyproject.toml with dependencies at services/audit-service/pyproject.toml

### Idempotency

- [ ] T068u [US4] Implement ProcessedEvent tracking in each consumer service
- [ ] T068v [US4] Add idempotency check before event processing

**Checkpoint**: T068 complete - consumers react correctly to events; services independently deployable

---

## Phase 15: Reminder Scheduling via Dapr Jobs (T069)

**Purpose**: Schedule and deliver reminders at exact times

### Dapr Jobs Integration

- [ ] T069 [US2] Extend reminder_service with Dapr Jobs API client in backend/app/services/reminder_service.py
- [ ] T069a [US2] Implement schedule_reminder to create Dapr job in backend/app/services/reminder_service.py
- [ ] T069b [US2] Implement cancel_reminder to delete Dapr job in backend/app/services/reminder_service.py
- [ ] T069c [US2] Update POST /tasks/{task_id}/reminder to schedule Dapr job in backend/app/api/tasks.py
- [ ] T069d [US2] Update DELETE /tasks/{task_id}/reminder to cancel Dapr job in backend/app/api/tasks.py

### Notification Service Integration

- [x] T069e [US2] Create NotificationDelivery model in backend/app/models/notification.py
- [x] T069f [US2] Create Alembic migration for notification_deliveries in backend/alembic/versions/20260106_0001_001_phase_v_schema.py
- [ ] T069g [US2] Handle reminder.due events from Dapr Jobs in services/notification-service/app/handlers.py
- [ ] T069h [US2] Update reminder status to sent/failed after delivery in services/notification-service/app/handlers.py

### Validation

- [ ] T069i [US2] Test reminder scheduling creates Dapr job
- [ ] T069j [US2] Test reminder delivery within 60 seconds of scheduled time
- [ ] T069k [US2] Test reminder cancellation deletes Dapr job

**Checkpoint**: T069 complete - accurate reminder execution; no missed or duplicated reminders (AC-02 complete)

---

## Phase 15.5: Background Workers & AI Automation (T069W)

**Purpose**: In-process background workers for event processing, notifications, reminders, and AI automation

**Note**: This phase provides an alternative to separate microservices, enabling simpler deployment while maintaining the same functionality.

### Worker Abstraction Layer

- [x] T069W-a Create WorkerBase abstract class in backend/app/workers/base.py
- [x] T069W-b Create WorkerResult and WorkerStatus dataclasses in backend/app/workers/base.py
- [x] T069W-c Add ProcessingStatus enum to TaskEvent model in backend/app/models/task_event.py
- [x] T069W-d Add PROCESSING status and retry fields to NotificationDelivery in backend/app/models/notification.py

### Event Processing Worker

- [x] T069W-e Create EventWorker for TaskEvent outbox processing in backend/app/workers/event_worker.py
- [x] T069W-f Implement fetch_pending with PENDING status filter
- [x] T069W-g Implement idempotent mark_processing via status check

### Notification Worker

- [x] T069W-h Create NotificationWorker for delivery processing in backend/app/workers/notification_worker.py
- [x] T069W-i Implement retry logic with exponential backoff
- [x] T069W-j Implement simulated delivery (placeholder for real email/push)

### Reminder Worker

- [x] T069W-k Create ReminderWorker for due reminder processing in backend/app/workers/reminder_worker.py
- [x] T069W-l Implement task existence and completion checks
- [x] T069W-m Create NotificationDelivery on reminder trigger
- [x] T069W-n Handle edge cases (task deleted, task completed)

### AI Automation Executor

- [x] T069W-o Create AIExecutor with confidence threshold gating in backend/app/workers/ai_executor.py
- [x] T069W-p Add global AI_AUTOMATION_ENABLED flag to config
- [x] T069W-q Implement priority change handler
- [x] T069W-r Implement add reminder handler
- [x] T069W-s Add audit logging for all AI-applied actions

### Worker Runner & Observability

- [x] T069W-t Create WorkerRunner orchestrator in backend/app/workers/runner.py
- [x] T069W-u Implement run_worker_once() for single cycle
- [x] T069W-v Implement run_worker_loop() with configurable interval
- [x] T069W-w Add signal handlers for graceful shutdown (SIGINT/SIGTERM)
- [x] T069W-x Add structured logging throughout
- [x] T069W-y Add worker configuration to backend/app/config.py

### Dev Entrypoint & Testing

- [x] T069W-z Create CLI entrypoint at backend/scripts/run_workers.py
- [x] T069W-aa Create worker tests at backend/tests/test_workers.py (28 tests)

**Checkpoint**: T069W complete - background workers process events, notifications, reminders with AI automation

---

## Phase 16: Local Kubernetes Deployment (T070)

**Purpose**: Deploy all services to Minikube with Dapr and Kafka

### Helm Chart Extensions

- [ ] T070 [US5] Update helm/todo-app/Chart.yaml with new service dependencies
- [ ] T070a [US5] Update helm/todo-app/values.yaml with Phase V configuration
- [ ] T070b [P] [US5] Create notification-service Helm subchart at helm/todo-app/charts/notification/
- [ ] T070c [P] [US5] Create recurring-task-service Helm subchart at helm/todo-app/charts/recurring-task/
- [ ] T070d [P] [US5] Create audit-service Helm subchart at helm/todo-app/charts/audit/
- [x] T070e [US5] Create Dapr annotations in backend deployment at helm/todo-app/charts/backend/templates/deployment.yaml
- [ ] T070f [US5] Add Dapr annotations to each consumer service deployment template

### Kafka Deployment

- [ ] T070g [US5] Add Redpanda Helm dependency to helm/todo-app/Chart.yaml
- [ ] T070h [US5] Configure Redpanda values in helm/todo-app/values.yaml
- [ ] T070i [US5] Create Kafka topics via Redpanda init container or job

### Dapr Deployment

- [ ] T070j [US5] Create Dapr component manifests for Kubernetes at helm/todo-app/templates/dapr-components.yaml
- [ ] T070k [US5] Verify Dapr sidecar injection is enabled in cluster

### Local Validation

- [ ] T070l [US5] Start Minikube with sufficient resources (6 CPU, 12GB RAM)
- [ ] T070m [US5] Install Dapr on Minikube cluster
- [ ] T070n [US5] Deploy application via helm install
- [ ] T070o [US5] Verify all pods running with Dapr sidecars
- [ ] T070p [US5] Test task creation publishes event to Kafka
- [ ] T070q [US5] Test consumer services process events correctly
- [ ] T070r [US5] Test end-to-end flow: create recurring task → complete → verify new occurrence

**Checkpoint**: T070 complete - all pods running; events flow end-to-end (AC-05)

---

## Phase 17: Cloud Deployment (T071)

**Purpose**: Deploy to managed Kubernetes with CI/CD

### Cloud Cluster Setup

- [ ] T071 [US5] Document Oracle OKE cluster provisioning steps in specs/005-cloud-event-driven/cloud-setup.md
- [ ] T071a [US5] Create values-cloud.yaml with cloud-specific overrides at helm/todo-app/values-cloud.yaml
- [ ] T071b [US5] Configure managed Kafka connection (Redpanda Cloud or Confluent) in values-cloud.yaml

### GitHub Actions CI/CD

- [ ] T071c [P] [US5] Create CI workflow at .github/workflows/ci.yaml (lint, test, build, push)
- [ ] T071d [P] [US5] Create cloud deploy workflow at .github/workflows/deploy-cloud.yaml
- [ ] T071e [US5] Configure GitHub repository secrets for OCI/cloud credentials
- [ ] T071f [US5] Add image tags and registry configuration in workflows

### Cloud Deployment

- [ ] T071g [US5] Install Dapr on cloud cluster
- [ ] T071h [US5] Deploy application to cloud via GitHub Actions
- [ ] T071i [US5] Verify all services accessible via LoadBalancer/Ingress

### Cloud Validation

- [ ] T071j [US5] Test frontend accessible from public URL
- [ ] T071k [US5] Test backend API responds correctly
- [ ] T071l [US5] Test end-to-end flow in cloud environment
- [ ] T071m [US5] Verify CI/CD completes in under 15 minutes

**Checkpoint**: T071 complete - cloud deployment successful; zero manual steps required (AC-06, AC-07)

---

## Phase 18: Validation & Documentation (T072)

**Purpose**: Final validation and documentation

### End-to-End Testing

- [ ] T072 Verify Phase IV features still work (chat, task CRUD, scaling)
- [ ] T072a Test recurring task creation and automatic regeneration (AC-01)
- [ ] T072b Test due date display and reminder delivery (AC-02)
- [ ] T072c Test priority and tag filtering/sorting (AC-03)
- [ ] T072d Test event publishing to Kafka topics (AC-04)

### Failure Scenario Testing

- [ ] T072e Test consumer service restart recovers from dead-letter queue
- [ ] T072f Test Kafka unavailability triggers outbox pattern
- [ ] T072g Test duplicate event delivery handled by idempotency check

### Edge Case Validation

- [ ] T072h Verify EC-01: Recurring task deletion cancels future occurrences
- [ ] T072i Verify EC-02: Past reminder time handled gracefully
- [ ] T072j Verify EC-03: Broker unavailability >5 min replays events
- [ ] T072k Verify EC-05: Rapid completions generate single occurrence (idempotency)

### Documentation

- [ ] T072l [P] Update README.md with Phase V architecture section
- [ ] T072m [P] Update helm/todo-app/README.md with new services
- [ ] T072n Verify specs/005-cloud-event-driven/quickstart.md is complete
- [ ] T072o Create hackathon evaluation summary document

**Checkpoint**: T072 complete - Phase V fully documented; reviewer-ready artifacts available (AC-08)

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 9: Architecture Preparation (T063)
    │
    ▼
Phase 10: US1 - Recurring Tasks (T064) ← MVP
    │
    ├──────────────────┬────────────────┐
    ▼                  ▼                ▼
Phase 11: US2      Phase 12: US3     Phase 13: US4
(Due Dates)        (Priorities)      (Event Publishing)
    │                  │                │
    └──────────────────┴────────────────┘
                       │
                       ▼
                Phase 14: Consumer Services (T068)
                       │
                       ▼
                Phase 15: Reminder Scheduling (T069)
                       │
                       ▼
           Phase 15.5: Background Workers (T069W) ← COMPLETE
                       │
                       ▼
                Phase 16: Local K8s (T070)
                       │
                       ▼
                Phase 17: Cloud Deployment (T071)
                       │
                       ▼
                Phase 18: Validation (T072)
```

### User Story Dependencies

- **T063 (Architecture)**: No dependencies - can start immediately
- **T064 (US1 Recurring)**: Depends on T063 - core feature (MVP)
- **T065 (US2 Reminders)**: Depends on T064 - needs task completion events
- **T066 (US3 Priorities/Tags)**: Can run parallel with T065 after T064
- **T067 (US4 Events)**: Can run parallel with T065/T066 after T064
- **T068 (Consumers)**: Depends on T067 - needs event publisher
- **T069 (Dapr Jobs)**: Depends on T065, T068 - needs reminders and notification service
- **T069W (Workers)**: Depends on T067-T069 - provides in-process alternative to microservices ✅ COMPLETE
- **T070 (Local K8s)**: Depends on T068, T069, T069W - needs all services
- **T071 (Cloud)**: Depends on T070 - needs local validation first
- **T072 (Validation)**: Depends on T071 - final validation

### Parallel Opportunities

**Phase 10 (US1)**:
- T064h, T064i can run in parallel (different frontend components)

**Phase 11 (US2)**:
- T065j, T065k can run in parallel (different form components)

**Phase 12 (US3)**:
- T066n, T066o can run in parallel (different form components)

**Phase 14 (Consumers)**:
- T068a, T068b, T068c can run in parallel (different service directories)

**Phase 16 (Local K8s)**:
- T070b, T070c, T070d can run in parallel (different Helm subcharts)

**Phase 17 (Cloud)**:
- T071c, T071d can run in parallel (different GitHub Actions workflows)

**Phase 18 (Validation)**:
- T072l, T072m can run in parallel (different README files)

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 9: Architecture Preparation (T063)
2. Complete Phase 10: Recurring Tasks (T064)
3. **STOP and VALIDATE**: Test recurring task creation and regeneration
4. Demo: Basic recurring tasks working via API and UI

### Incremental Delivery

1. T063 → Architecture validated
2. T064 → US1: Recurring tasks working (MVP!)
3. T065-T066 (parallel) → US2+US3: Due dates, reminders, priorities, tags
4. T067 → US4: Event publishing integrated
5. T068 → Consumer services deployed
6. T069 → Reminder scheduling via Dapr Jobs
7. **T069W → Background workers with AI automation ✅ COMPLETE**
8. T070 → Local Kubernetes deployment verified
9. T071 → Cloud deployment with CI/CD
10. T072 → Final validation and documentation

### Single Developer Strategy

Execute phases sequentially:
1. Phase 9: Architecture (T063)
2. Phase 10: US1 Recurring (T064) → Validate
3. Phase 11: US2 Reminders (T065) → Validate
4. Phase 12: US3 Priorities/Tags (T066) → Validate
5. Phase 13: US4 Events (T067) → Validate
6. Phase 14: Consumers (T068) → Validate
7. Phase 15: Dapr Jobs (T069) → Validate
8. **Phase 15.5: Workers (T069W) → ✅ COMPLETE**
9. Phase 16: Local K8s (T070) → Validate
10. Phase 17: Cloud (T071) → Validate
11. Phase 18: Documentation (T072) → Complete

---

## Task Summary

| Phase | Tasks | Completed | Remaining | Story |
|-------|-------|-----------|-----------|-------|
| 9. Architecture | 4 | 3 | 1 | - |
| 10. US1 Recurring | 13 | 10 | 3 | US1 |
| 11. US2 Reminders | 16 | 11 | 5 | US2 |
| 12. US3 Priorities | 24 | 16 | 8 | US3 |
| 13. US4 Events | 18 | 13 | 5 | US4 |
| 14. Consumers | 22 | 2 | 20 | US4 |
| 15. Dapr Jobs | 11 | 2 | 9 | US2 |
| **15.5. Workers** | **27** | **27** | **0** | **-** |
| 16. Local K8s | 18 | 1 | 17 | US5 |
| 17. Cloud | 13 | 0 | 13 | US5 |
| 18. Validation | 15 | 0 | 15 | - |
| **Total** | **181** | **85** | **96** | - |

---

## Phase V Completion Criteria

- All tasks T063-T072 completed
- No regressions from Phase IV (verified via AC-08)
- Event-driven architecture validated end-to-end
- Recurring tasks generate next occurrence within 5 seconds (SC-01)
- Reminders delivered within 60 seconds (SC-02)
- 99.9% event publish success rate (SC-03)
- Local deployment in under 10 minutes (SC-05)
- Cloud deployment in under 15 minutes (SC-06)
- All acceptance criteria AC-01 through AC-08 verified

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable after US1 (MVP)
- Manual validation via Dapr Dashboard, kubectl, and browser (no automated tests per spec)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All Phase IV features must continue working (NFR-08)
- Dapr Jobs API preferred over cron polling for reminders (per research.md)
- Redpanda used as Kafka-compatible broker (per research.md)
- Oracle OKE preferred for cloud deployment (per research.md)
