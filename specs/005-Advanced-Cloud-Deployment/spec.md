# Feature Specification: Phase V - Advanced Cloud & Event-Driven Architecture

**Feature Branch**: `005-cloud-event-driven`
**Created**: 2026-01-05
**Status**: Draft
**Input**: User description: "Phase V: Advanced Cloud & Event-Driven Architecture - Extend the Todo + AI Chat application into a production-grade, event-driven microservices system using Kubernetes, Dapr, and Kafka."

## Context

Phase IV deployed the Todo AI Chatbot on local Kubernetes (Minikube) with Helm charts. Phase V extends this foundation into a production-grade, event-driven microservices architecture with advanced task features and cloud deployment capabilities.

## Goal

Transform the Todo AI Chatbot into an event-driven microservices system with recurring tasks, reminders, and cloud deployment, demonstrating advanced cloud-native architecture patterns.

## Scope

### In-Scope

- Advanced task features: recurring tasks, due dates, reminders, priorities, tags
- Event-driven communication via Dapr Pub/Sub to Kafka-compatible broker
- Separate consumer services for notifications, recurring task generation, audit logging
- Local Kubernetes deployment with event streaming
- Cloud Kubernetes deployment (one provider)
- CI/CD pipeline via GitHub Actions

### Out-of-Scope

- Modifications to core Phase I-IV task CRUD logic (only extensions)
- Multiple cloud provider deployments simultaneously
- Enterprise features (multi-tenancy, SSO federation)
- Mobile push notifications (web/email only for reminders)
- Real-time collaborative editing

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Creates Recurring Task (Priority: P1)

As a user, I want to create tasks that automatically repeat on a schedule (daily, weekly, or custom interval), so that I don't have to manually recreate routine tasks.

**Why this priority**: Recurring tasks are the most requested advanced feature and provide immediate value for productivity. All other features build on having a working task scheduling system.

**Independent Test**: Can be fully tested by creating a daily recurring task, marking it complete, and verifying a new occurrence is automatically generated for the next day.

**Acceptance Scenarios**:

1. **Given** I am creating a new task, **When** I set recurrence to "daily", **Then** the task is saved with daily recurrence pattern
2. **Given** a daily recurring task exists, **When** I mark it complete, **Then** a new task instance is created for the next day with "pending" status
3. **Given** a weekly recurring task (every Monday), **When** completed on Monday, **Then** next occurrence is scheduled for the following Monday
4. **Given** a recurring task with custom interval (every 3 days), **When** completed, **Then** next occurrence is scheduled exactly 3 days from completion date

---

### User Story 2 - User Sets Due Dates and Receives Reminders (Priority: P2)

As a user, I want to set due dates and reminder times for tasks, so that I receive notifications before deadlines and stay on track.

**Why this priority**: Due dates and reminders are essential for task management effectiveness. This feature enables proactive user engagement and builds on the recurring task infrastructure.

**Independent Test**: Can be fully tested by creating a task with a due date and reminder, then verifying the reminder notification arrives at the scheduled time.

**Acceptance Scenarios**:

1. **Given** I am creating a task, **When** I set a due date, **Then** the task displays the due date and is sortable by due date
2. **Given** a task with reminder set for 1 hour before due, **When** the reminder time arrives, **Then** I receive a notification with the task title and due time
3. **Given** a task is overdue, **When** I view my task list, **Then** the overdue task is visually highlighted
4. **Given** I complete a task before its due date, **When** I mark it complete, **Then** any pending reminders for that task are cancelled

---

### User Story 3 - User Organizes Tasks with Priorities and Tags (Priority: P3)

As a user, I want to assign priorities (low, medium, high) and tags to tasks, so that I can organize, filter, and focus on what matters most.

**Why this priority**: Organization features enhance usability but are not blocking for core functionality. Users can work without them initially.

**Independent Test**: Can be fully tested by creating tasks with different priorities and tags, then filtering and sorting to verify correct behavior.

**Acceptance Scenarios**:

1. **Given** I am creating a task, **When** I set priority to "high", **Then** the task displays high priority indicator
2. **Given** tasks exist with mixed priorities, **When** I sort by priority, **Then** high priority tasks appear first
3. **Given** I add tags "work" and "urgent" to a task, **When** I filter by "work" tag, **Then** only tasks with that tag are displayed
4. **Given** tasks with various tags exist, **When** I search for a tag, **Then** matching tasks are returned

---

### User Story 4 - System Publishes Task Events Asynchronously (Priority: P4)

As a system operator, I want all task operations to publish events to Kafka via Dapr, so that downstream services can react to changes without tight coupling.

**Why this priority**: Event-driven architecture is foundational for scalability but requires the core features (P1-P3) to be working first.

**Independent Test**: Can be fully tested by performing a task operation and verifying the corresponding event appears in the message topic with correct payload.

**Acceptance Scenarios**:

1. **Given** a task is created, **When** the operation completes, **Then** a "task.created" event is published with task details
2. **Given** a task is completed, **When** the operation completes, **Then** a "task.completed" event is published triggering recurring task generation
3. **Given** a task is updated, **When** the operation completes, **Then** a "task.updated" event is published for real-time sync
4. **Given** Kafka is temporarily unavailable, **When** a task operation occurs, **Then** the operation succeeds and event is queued for retry

---

### User Story 5 - DevOps Engineer Deploys to Cloud Kubernetes (Priority: P5)

As a DevOps engineer, I want to deploy the complete system to a cloud Kubernetes cluster, so that the application is accessible publicly and demonstrates production readiness.

**Why this priority**: Cloud deployment is the capstone demonstration but requires all services to be working locally first.

**Independent Test**: Can be fully tested by running the deployment pipeline and verifying all services are running and accessible in the cloud cluster.

**Acceptance Scenarios**:

1. **Given** local deployment is verified working, **When** I run the cloud deployment pipeline, **Then** all services are deployed to the cloud cluster
2. **Given** services are deployed, **When** I access the application URL, **Then** the frontend loads and backend responds
3. **Given** cloud deployment is active, **When** I create a recurring task with reminder, **Then** the complete flow works (creation, event publishing, reminder delivery)
4. **Given** the pipeline runs, **When** deployment completes, **Then** monitoring and logging are accessible

---

### Edge Cases

- **EC-01**: When a recurring task is deleted, all future scheduled occurrences must be cancelled
- **EC-02**: When reminder time has already passed at task creation, reminder is scheduled for next valid time or skipped with notification
- **EC-03**: When Kafka is unavailable for extended period (>5 minutes), events are persisted locally and replayed on reconnection
- **EC-04**: When cloud cluster resources are insufficient, deployment fails gracefully with clear error message
- **EC-05**: When user completes a recurring task multiple times rapidly, only one next occurrence is generated (idempotency)
- **EC-06**: When timezone differs between server and user, due dates and reminders respect user's timezone

## Requirements *(mandatory)*

### Functional Requirements - Advanced Task Features

- **FR-01**: Tasks MUST support optional recurrence patterns (none, daily, weekly, custom days interval)
- **FR-02**: Completing a recurring task MUST automatically generate the next occurrence asynchronously
- **FR-03**: Tasks MUST support optional due_at timestamp (date and time)
- **FR-04**: Tasks MUST support optional remind_at timestamp (date and time before due)
- **FR-05**: Reminders MUST trigger notifications at the scheduled time
- **FR-06**: Tasks MUST support priority levels (low, medium, high) with medium as default
- **FR-07**: Tasks MUST support multiple text-based tags
- **FR-08**: Users MUST be able to filter tasks by status, priority, tags, and due date range
- **FR-09**: Users MUST be able to sort tasks by created date, due date, or priority
- **FR-10**: Search MUST support full-text search across task title and description, returning results in under 1 second for up to 10,000 tasks

### Functional Requirements - Event-Driven Architecture

- **FR-11**: Backend MUST publish events for all task CRUD operations via Dapr Pub/Sub (not direct broker client)
- **FR-13**: Notification service MUST consume reminder events and deliver notifications
- **FR-14**: Recurring task service MUST consume completion events and generate next occurrences
- **FR-15**: Audit service MUST consume all task events and maintain activity log
- **FR-16**: Services MUST be loosely coupled via event communication only

### Functional Requirements - Deployment

- **FR-17**: System MUST deploy to local Kubernetes with Kafka and Dapr
- **FR-18**: System MUST deploy to one cloud Kubernetes provider
- **FR-19**: Existing Helm charts MUST be extended (not replaced) for new services
- **FR-20**: CI/CD pipeline MUST automate build, test, and deployment stages

### Non-Functional Requirements

- **NFR-01**: Events MUST be delivered at least once with automatic retry (max 3 attempts with exponential backoff) and dead-letter queue for failed messages
- **NFR-02**: Reminders MUST be delivered within 1 minute of scheduled time under normal conditions
- **NFR-03**: System MUST remain functional if Kafka is temporarily unavailable (graceful degradation)
- **NFR-04**: All services MUST support horizontal scaling independently
- **NFR-05**: Event consumers MUST be idempotent to handle duplicate deliveries
- **NFR-06**: Cloud deployment MUST complete in under 15 minutes via CI/CD
- **NFR-07**: Monitoring MUST expose service health and event processing metrics
- **NFR-08**: All Phase IV functionality MUST remain intact and backward compatible

### Key Entities

- **RecurrencePattern**: Defines how a task repeats (type: none/daily/weekly/custom, interval_days, next_occurrence_at)
- **TaskReminder**: Scheduled reminder for a task (task_id, remind_at, status: pending/sent/cancelled)
- **TaskTag**: Label for organizing tasks (name, color)
- **TaskEvent**: Published event record (event_type, task_id, payload, timestamp, published_at)
- **AuditLog**: Immutable activity record (user_id, action, entity_type, entity_id, details, timestamp)
- **NotificationDelivery**: Record of sent notifications (user_id, channel, message, sent_at, status)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-01**: Recurring tasks generate next occurrence within 5 seconds of completion
- **SC-02**: Reminders are delivered within 60 seconds of scheduled time (95th percentile)
- **SC-03**: All task operations publish events successfully (99.9% success rate)
- **SC-04**: Event consumers process messages within 2 seconds of publication (median)
- **SC-05**: Local deployment completes in under 10 minutes (including infrastructure setup)
- **SC-06**: Cloud deployment completes in under 15 minutes via CI/CD pipeline
- **SC-07**: System handles 100 concurrent users without performance degradation
- **SC-08**: All Phase IV acceptance criteria continue to pass after Phase V deployment
- **SC-09**: Filter and sort operations return results in under 1 second for up to 10,000 tasks
- **SC-10**: Event broker unavailability for up to 5 minutes does not cause data loss

## Acceptance Criteria

- **AC-01**: Create recurring task and verify next occurrence generated on completion
- **AC-02**: Set reminder and verify notification received at scheduled time
- **AC-03**: Assign priorities and tags, then filter and sort tasks correctly
- **AC-04**: Verify task events appear in Kafka topics with correct payloads
- **AC-05**: Deploy to local Kubernetes with Dapr and Kafka running
- **AC-06**: Deploy to cloud Kubernetes and access application publicly
- **AC-07**: CI/CD pipeline successfully builds, tests, and deploys on push
- **AC-08**: All Phase IV features (chat, task CRUD, scaling) work correctly

## Assumptions

- Minikube setup from Phase IV is available for local testing
- Cloud Kubernetes account is provisioned (Oracle OKE, Azure AKS, or Google GKE)
- Message broker can run locally via container (Redpanda/Kafka)
- Dapr is available as container images for sidecar injection
- Users have email addresses for notification delivery (from Phase II auth)
- Web browser supports modern notification APIs (fallback to email)
- Phase IV Helm charts are compatible with extension (additive changes only)

## Dependencies

- Phase IV: Local Kubernetes deployment (complete)
- Phase III: AI chatbot and MCP tools (unchanged)
- Phase II: Authentication and task persistence (unchanged)
- External: Cloud Kubernetes cluster access
- External: Domain/DNS for cloud deployment (or use provided ingress URL)
- External: SMTP/email service for notifications (or use in-cluster mock)

## Risks

- **R-01**: Message broker complexity may extend local development setup time
- **R-02**: Cloud Kubernetes costs may exceed free tier limits (mitigate: use Oracle OKE free tier)
- **R-03**: Dapr may have learning curve (mitigate: comprehensive quickstart guide)
- **R-04**: CI/CD pipeline secrets management requires careful handling
- **R-05**: Event ordering guarantees may require partition strategy design

## Validation Checklist

- [ ] Recurring task creation and automatic regeneration works end-to-end
- [ ] Due dates display correctly and reminders trigger on schedule
- [ ] Priority and tag filtering/sorting works as expected
- [ ] Events appear in Kafka topics after task operations
- [ ] Consumer services react to events correctly (notifications, recurring generation, audit)
- [ ] Local Kubernetes deployment includes all services with Dapr
- [ ] Cloud Kubernetes deployment accessible via public URL
- [ ] CI/CD pipeline passes and deploys successfully
- [ ] All Phase IV tests and functionality remain working
- [ ] Graceful degradation when broker unavailable
