# Data Model: Phase V - Advanced Cloud & Event-Driven Architecture

**Feature**: 005-cloud-event-driven
**Date**: 2026-01-05
**Status**: Complete

## Overview

This document defines the data model extensions for Phase V. All changes are additive to preserve backward compatibility with Phase II/III/IV.

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Phase V Data Model                                │
│                                                                              │
│  ┌──────────┐       ┌──────────────────────────────────────────────────┐   │
│  │   User   │       │                      Task                        │   │
│  │  (P-II)  │◄──────│  (Extended from Phase II)                        │   │
│  └──────────┘       │                                                   │   │
│       │             │  + recurrence_type: enum                          │   │
│       │             │  + recurrence_interval: int (nullable)            │   │
│       │             │  + next_occurrence_at: datetime (nullable)        │   │
│       │             │  + due_at: datetime (nullable)                    │   │
│       │             │  + priority: enum (default: medium)               │   │
│       │             │  + parent_task_id: UUID (nullable, self-ref)      │   │
│       │             └────────────────────┬─────────────────────────────┘   │
│       │                                  │                                  │
│       │         ┌────────────────────────┼────────────────────────┐        │
│       │         │                        │                        │        │
│       │         ▼                        ▼                        ▼        │
│       │  ┌─────────────┐   ┌─────────────────────┐   ┌─────────────────┐  │
│       │  │ TaskReminder│   │ TaskTagAssociation  │   │   TaskEvent     │  │
│       │  │   (NEW)     │   │      (NEW)          │   │    (NEW)        │  │
│       │  │             │   │                     │   │                 │  │
│       │  │ remind_at   │   │ task_id ──────────┐ │   │ event_type      │  │
│       │  │ status      │   │ tag_id ─────────┐ │ │   │ payload (JSON)  │  │
│       │  │ job_id      │   │                 │ │ │   │ published_at    │  │
│       │  └──────┬──────┘   └─────────────────┼─┼─┘   │ correlation_id  │  │
│       │         │                            │ │     └────────┬────────┘  │
│       │         │                            │ │              │           │
│       │         ▼                            ▼ │              │           │
│       │  ┌─────────────────┐        ┌─────────▼──┐           │           │
│       │  │ Notification    │        │  TaskTag   │           │           │
│       │  │   Delivery      │        │   (NEW)    │           │           │
│       │  │    (NEW)        │        │            │           │           │
│       │  │                 │        │ name       │           │           │
│       │  │ channel         │        │ color      │           │           │
│       │  │ status          │        │ user_id    │           │           │
│       │  │ sent_at         │        └────────────┘           │           │
│       │  └─────────────────┘                                 │           │
│       │                                                      │           │
│       └──────────────────────────────────────────────────────┼───────────┤
│                                                              │           │
│                                                              ▼           │
│                                                     ┌─────────────────┐  │
│                                                     │   AuditLog      │  │
│                                                     │    (NEW)        │  │
│                                                     │                 │  │
│                                                     │ action          │  │
│                                                     │ entity_type     │  │
│                                                     │ entity_id       │  │
│                                                     │ details (JSON)  │  │
│                                                     │ timestamp       │  │
│                                                     └─────────────────┘  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Entities

### Task (Extended)

**Location**: `backend/app/models/task.py`
**Change Type**: Extended (backward compatible)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Existing |
| user_id | UUID | FK → users.id | Existing |
| title | str | max 200 chars | Existing |
| description | str | nullable, max 2000 | Existing |
| is_completed | bool | default False | Existing |
| created_at | datetime | auto | Existing |
| updated_at | datetime | auto | Existing |
| **recurrence_type** | enum | nullable, default none | NEW: none/daily/weekly/custom |
| **recurrence_interval** | int | nullable | NEW: days for custom recurrence |
| **next_occurrence_at** | datetime | nullable | NEW: when next instance is due |
| **due_at** | datetime | nullable | NEW: task deadline |
| **priority** | enum | default medium | NEW: low/medium/high |
| **parent_task_id** | UUID | nullable, FK → tasks.id | NEW: links recurring instances |

**Validation Rules**:
- `recurrence_interval` required when `recurrence_type` is "custom"
- `next_occurrence_at` auto-calculated on completion for recurring tasks
- `due_at` must be in the future at creation time
- `parent_task_id` creates self-referential relationship for recurring chains

**State Transitions**:
```
pending → completed (is_completed = True)
    │
    └──▶ [if recurring] → NEW pending task created with next_occurrence_at
```

---

### TaskTag (NEW)

**Location**: `backend/app/models/tag.py`
**Change Type**: New entity

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| user_id | UUID | FK → users.id | Owner of tag |
| name | str | max 50 chars, unique per user | Tag label |
| color | str | nullable, hex color | Display color (#RRGGBB) |
| created_at | datetime | auto | Creation timestamp |

**Validation Rules**:
- Tag names must be unique within a user's tags
- Color must be valid hex format if provided
- Maximum 100 tags per user

---

### TaskTagAssociation (NEW)

**Location**: `backend/app/models/tag.py`
**Change Type**: New entity (junction table)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| task_id | UUID | PK, FK → tasks.id | Task reference |
| tag_id | UUID | PK, FK → task_tags.id | Tag reference |
| created_at | datetime | auto | Association timestamp |

**Validation Rules**:
- Composite primary key (task_id, tag_id)
- Cascade delete when task or tag is deleted
- Maximum 10 tags per task

---

### TaskReminder (NEW)

**Location**: `backend/app/models/reminder.py`
**Change Type**: New entity

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| task_id | UUID | FK → tasks.id | Associated task |
| user_id | UUID | FK → users.id | Task owner (denormalized for queries) |
| remind_at | datetime | required | When to send reminder |
| status | enum | default pending | pending/sent/cancelled/failed |
| dapr_job_id | str | nullable | Dapr Jobs API job ID |
| created_at | datetime | auto | Creation timestamp |
| sent_at | datetime | nullable | When notification was sent |

**State Transitions**:
```
pending ──▶ sent (notification delivered successfully)
    │
    ├──▶ cancelled (task completed or deleted)
    │
    └──▶ failed (delivery failed after retries)
```

**Validation Rules**:
- `remind_at` must be in the future at creation
- `remind_at` should be before task `due_at` (warning if after)
- One active reminder per task (cancel existing before creating new)

---

### TaskEvent (NEW)

**Location**: `backend/app/models/task_event.py`
**Change Type**: New entity

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Event ID (also used as CloudEvents id) |
| event_type | str | required | task.created/updated/completed/deleted |
| task_id | UUID | FK → tasks.id (nullable for deleted) | Source task |
| user_id | UUID | FK → users.id | Task owner |
| payload | JSON | required | Full event data |
| correlation_id | UUID | nullable | Links related events |
| created_at | datetime | auto | Event creation time |
| published_at | datetime | nullable | When published to broker |
| published | bool | default False | Publication status |

**Event Types**:
- `task.created` - Task creation
- `task.updated` - Task modification (title, description, due_at, etc.)
- `task.completed` - Task marked complete
- `task.deleted` - Task deletion
- `reminder.due` - Reminder time reached
- `reminder.sent` - Notification delivered

**Validation Rules**:
- Events are immutable after creation
- `published_at` set when Dapr confirms publish
- Unpublished events can be retried (outbox pattern)

---

### AuditLog (NEW)

**Location**: `backend/app/models/audit_log.py`
**Change Type**: New entity

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| user_id | UUID | FK → users.id | Acting user |
| action | str | required | create/update/complete/delete/login/etc. |
| entity_type | str | required | task/tag/reminder/user |
| entity_id | UUID | nullable | Affected entity ID |
| details | JSON | nullable | Additional context |
| ip_address | str | nullable | Request source IP |
| user_agent | str | nullable | Request user agent |
| timestamp | datetime | auto | Event timestamp |

**Validation Rules**:
- Immutable after creation (append-only)
- Retention: 90 days (configurable)
- No cascade delete from other entities

---

### NotificationDelivery (NEW)

**Location**: `backend/app/models/notification.py`
**Change Type**: New entity

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| user_id | UUID | FK → users.id | Recipient |
| reminder_id | UUID | FK → task_reminders.id (nullable) | Source reminder |
| channel | enum | required | email/web_push |
| recipient | str | required | Email address or push endpoint |
| subject | str | nullable | Notification subject |
| message | str | required | Notification body |
| status | enum | default pending | pending/sent/failed |
| sent_at | datetime | nullable | Delivery timestamp |
| error_message | str | nullable | Failure reason |
| created_at | datetime | auto | Creation timestamp |

**State Transitions**:
```
pending ──▶ sent (delivery confirmed)
    │
    └──▶ failed (delivery error after retries)
```

---

### ProcessedEvent (NEW - Consumer Tables)

**Location**: Each consumer service maintains its own table
**Change Type**: New entity (per consumer)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| event_id | UUID | PK | CloudEvents id |
| consumer_id | str | required | Consumer service identifier |
| processed_at | datetime | auto | Processing timestamp |

**Purpose**: Ensures idempotent event processing across consumers.

---

## Enumerations

### RecurrenceType

```python
class RecurrenceType(str, Enum):
    NONE = "none"
    DAILY = "daily"
    WEEKLY = "weekly"
    CUSTOM = "custom"
```

### Priority

```python
class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
```

### ReminderStatus

```python
class ReminderStatus(str, Enum):
    PENDING = "pending"
    SENT = "sent"
    CANCELLED = "cancelled"
    FAILED = "failed"
```

### NotificationChannel

```python
class NotificationChannel(str, Enum):
    EMAIL = "email"
    WEB_PUSH = "web_push"
```

### DeliveryStatus

```python
class DeliveryStatus(str, Enum):
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"
```

---

## Database Migrations

### Migration 001: Add Task Extensions

```sql
-- Add recurrence fields to tasks
ALTER TABLE tasks ADD COLUMN recurrence_type VARCHAR(10) DEFAULT 'none';
ALTER TABLE tasks ADD COLUMN recurrence_interval INTEGER;
ALTER TABLE tasks ADD COLUMN next_occurrence_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE tasks ADD COLUMN due_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE tasks ADD COLUMN priority VARCHAR(10) DEFAULT 'medium';
ALTER TABLE tasks ADD COLUMN parent_task_id UUID REFERENCES tasks(id);

-- Add index for recurring task queries
CREATE INDEX idx_tasks_next_occurrence ON tasks(next_occurrence_at) WHERE recurrence_type != 'none';
CREATE INDEX idx_tasks_due_at ON tasks(due_at) WHERE due_at IS NOT NULL;
CREATE INDEX idx_tasks_priority ON tasks(priority);
```

### Migration 002: Create Task Tags

```sql
CREATE TABLE task_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);

CREATE TABLE task_tag_associations (
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES task_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (task_id, tag_id)
);

CREATE INDEX idx_task_tags_user ON task_tags(user_id);
CREATE INDEX idx_task_tag_assoc_tag ON task_tag_associations(tag_id);
```

### Migration 003: Create Reminders

```sql
CREATE TABLE task_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    remind_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(10) DEFAULT 'pending',
    dapr_job_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_reminders_remind_at ON task_reminders(remind_at) WHERE status = 'pending';
CREATE INDEX idx_reminders_task ON task_reminders(task_id);
CREATE INDEX idx_reminders_user ON task_reminders(user_id);
```

### Migration 004: Create Events and Audit

```sql
CREATE TABLE task_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    payload JSONB NOT NULL,
    correlation_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    published BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_events_unpublished ON task_events(created_at) WHERE published = FALSE;
CREATE INDEX idx_events_task ON task_events(task_id);
CREATE INDEX idx_events_type ON task_events(event_type);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    details JSONB,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
```

### Migration 005: Create Notifications

```sql
CREATE TABLE notification_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    reminder_id UUID REFERENCES task_reminders(id) ON DELETE SET NULL,
    channel VARCHAR(20) NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(200),
    message TEXT NOT NULL,
    status VARCHAR(10) DEFAULT 'pending',
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notification_deliveries(user_id);
CREATE INDEX idx_notifications_status ON notification_deliveries(status) WHERE status = 'pending';
```

---

## Backward Compatibility

All changes are designed to be backward compatible:

1. **New columns are nullable**: Existing tasks work without new fields
2. **Default values**: `priority` defaults to "medium", `recurrence_type` to "none"
3. **No removed fields**: All Phase II/III fields preserved
4. **API compatibility**: Existing endpoints return same response shape
5. **Database migrations**: Run non-destructive ALTER TABLE statements

---

**Data Model Status**: COMPLETE
**Ready for**: API contracts generation
