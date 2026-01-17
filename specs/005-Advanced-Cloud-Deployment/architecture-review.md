# Phase V Architecture Review: Extension Points Analysis

**Document**: Architecture Extension Points Review
**Date**: 2026-01-15
**Status**: Approved for Extension
**Reviewer**: Claude Code (SAFE MODE)

## Executive Summary

This document identifies and validates extension points in the existing Phase I-IV codebase that Phase V will extend. All extensions are designed to be **additive and backward-compatible**.

**Key Finding**: The existing architecture is well-suited for Phase V extensions with minimal risk to existing functionality.

---

## 1. Backend Task Model Extension Points

### Location: `backend/app/models/task.py`

**Current State** (Phase IV):
- `Task` model with core fields: id, user_id, title, description, is_completed, created_at, updated_at
- Relationship to User model via SQLModel

**Phase V Extensions** (Identified):
```python
# Lines 48-55 - Commented fields ready for activation:
- recurrence_type: RecurrenceType (none/daily/weekly/custom)
- recurrence_interval: int (days for custom recurrence)
- next_occurrence_at: datetime
- due_at: datetime
- priority: Priority (low/medium/high)
- parent_task_id: UUID (for recurring task chains)
```

**Extension Safety**:
- All new fields are nullable with defaults
- Existing API responses remain unchanged until TaskResponse is updated
- TaskCreate/TaskUpdate schemas already accept Phase V fields (lines 60-83)
- Backward compatible: clients not sending new fields get defaults

**Risk Level**: LOW - All changes are additive with safe defaults

---

## 2. Backend API Extension Points

### Location: `backend/app/api/tasks.py`

**Current State** (Phase IV):
- Standard CRUD endpoints: POST/GET/PUT/DELETE /api/tasks
- Toggle completion: POST /api/tasks/{id}/toggle

**Phase V Extensions** (Already Implemented):
```
Lines 58-94: Enhanced list_tasks_endpoint with:
- priority filter (Query param)
- tag_id filter (Query param)
- due_before/due_after filters (Query params)
- search (full-text on title/description)
- sort_by (created_at, due_at, priority)
- sort_order (asc/desc)

Lines 185-261: Reminder endpoints:
- POST /api/tasks/{id}/reminder
- DELETE /api/tasks/{id}/reminder
- GET /api/tasks/{id}/reminder

Lines 269-309: Tag assignment endpoints:
- PUT /api/tasks/{id}/tags
- GET /api/tasks/{id}/tags
```

**Extension Safety**:
- All new query params have defaults (backward compatible)
- New endpoints use new paths (no collision with existing)
- Existing endpoints unchanged in behavior

**Risk Level**: LOW - Additive endpoints only

---

## 3. Event Publishing Extension Points

### Location: `backend/app/events/`

**Structure**:
```
backend/app/events/
├── __init__.py       # Package exports
├── types.py          # TaskEventType enum, event payloads
├── publisher.py      # EventPublisher with outbox pattern
└── consumers.py      # Event consumer handlers
```

**Extension Points**:
1. **EventPublisher** (`publisher.py`):
   - Publishes to Dapr Pub/Sub via HTTP
   - Outbox pattern for reliability (events stored in DB before publish)
   - Retry logic with exponential backoff

2. **TaskEventType** (`types.py`):
   - task.created
   - task.updated
   - task.completed
   - task.deleted

**Phase V Usage**:
- Task service calls publisher on CRUD operations
- Events include full task payload + metadata
- Consumers can be microservices OR in-process workers

**Risk Level**: LOW - Event publishing is opt-in via configuration

---

## 4. Background Workers Extension Points

### Location: `backend/app/workers/`

**Structure**:
```
backend/app/workers/
├── __init__.py            # Package exports
├── base.py                # WorkerBase abstract class
├── event_worker.py        # Processes TaskEvent outbox
├── notification_worker.py # Delivers notifications
├── reminder_worker.py     # Triggers due reminders
├── ai_executor.py         # AI automation (priority, reminders)
└── runner.py              # WorkerRunner orchestrator
```

**Extension Points**:
1. **WorkerBase** (`base.py`):
   - Abstract interface for all workers
   - Common patterns: fetch_pending, process_item, mark_complete

2. **WorkerRunner** (`runner.py`):
   - Orchestrates multiple workers
   - Configurable intervals and graceful shutdown
   - Can add new workers without changing runner

**Phase V Benefit**:
- Workers provide **alternative to microservices**
- Same functionality without Kubernetes complexity
- Can run in-process or as separate pods

**Risk Level**: LOW - Workers are independent processes

---

## 5. Helm Chart Extension Points

### Location: `helm/todo-app/`

**Current State** (Phase IV):
```
helm/todo-app/
├── Chart.yaml              # Parent chart
├── values.yaml             # Global config
├── templates/_helpers.tpl  # Template helpers
└── charts/
    ├── frontend/           # Next.js subchart
    └── backend/            # FastAPI subchart
```

**Phase V Extensions** (Planned):
```
helm/todo-app/
└── charts/
    ├── notification/       # NEW: Notification service subchart
    ├── recurring-task/     # NEW: Recurring task service subchart
    ├── audit/              # NEW: Audit service subchart
    ├── kafka/              # NEW: Redpanda/Kafka subchart
    └── dapr/               # NEW: Dapr components subchart
```

**Extension Points**:
1. **Chart.yaml dependencies**: Add new subcharts as dependencies
2. **values.yaml**: Add configuration blocks for new services
3. **values-cloud.yaml**: Override for cloud deployment

**Risk Level**: LOW - New subcharts are independent

---

## 6. Dapr Configuration Extension Points

### Location: `infra/dapr/components/` (partially created)

**Current State**:
```
infra/dapr/components/
└── pubsub.yaml    # Redis pub/sub component
```

**Phase V Extensions** (Planned):
```
dapr/
├── components/
│   ├── pubsub.yaml         # Kafka pub/sub (update from Redis)
│   ├── statestore.yaml     # PostgreSQL state store
│   └── secrets.yaml        # Kubernetes secrets binding
└── configuration.yaml      # Dapr runtime config
```

**Extension Safety**:
- Dapr components are declarative YAML
- Backend uses Dapr HTTP API (no code changes needed)
- Components can be swapped without code changes

**Risk Level**: LOW - Configuration only

---

## 7. Database Schema Extension Points

### Migration Strategy

**Location**: `backend/alembic/versions/`

**Phase V Migration** (Identified):
- File: `20260106_0001_001_phase_v_schema.py`
- Adds nullable columns to `tasks` table
- Creates new tables: `task_reminders`, `task_tags`, `task_events`, `audit_logs`, `notification_deliveries`

**Extension Safety**:
- All new columns are nullable with defaults
- No existing columns modified
- Foreign keys use ON DELETE CASCADE where appropriate
- Indexes added for query performance

**Risk Level**: MEDIUM - Requires migration execution
- Mitigation: Run migration in maintenance window
- Rollback: Alembic downgrade available

---

## 8. Frontend Extension Points

### Location: `frontend/src/`

**Components Extended**:
| Component | Extension | Status |
|-----------|-----------|--------|
| TaskForm.tsx | Recurrence, due date, priority, tags | DONE |
| TaskCard.tsx | Priority badge, tags display, due date | DONE |
| TaskFilters.tsx | Filter/sort controls | NEW (created) |
| useTasks.ts | Filter params, reminder endpoints | PARTIAL |

**Extension Safety**:
- New UI elements are additive
- Existing task display unchanged
- New fields only shown when populated

**Risk Level**: LOW - UI changes are cosmetic

---

## 9. Identified Gaps (Safe to Address)

| Gap | Location | Risk | Recommendation |
|-----|----------|------|----------------|
| Dapr statestore.yaml missing | dapr/components/ | LOW | Create new file |
| Dapr secrets.yaml missing | dapr/components/ | LOW | Create new file |
| Dapr configuration.yaml missing | dapr/ | LOW | Create new file |
| Consumer services not created | services/ | LOW | Create new directories |
| CI/CD workflows missing | .github/workflows/ | LOW | Create new files |

---

## 10. Architecture Compatibility Matrix

| Phase | Component | Compatibility | Notes |
|-------|-----------|---------------|-------|
| I | CLI CRUD | N/A | Separate application |
| II | Auth System | COMPATIBLE | No changes needed |
| II | Task Service | EXTENDS | Adds event publishing |
| II | Database | EXTENDS | New tables, nullable columns |
| III | AI Chatbot | COMPATIBLE | MCP tools unchanged |
| III | Chat Service | COMPATIBLE | No changes needed |
| IV | Helm Charts | EXTENDS | Adds subcharts |
| IV | Docker Images | COMPATIBLE | Same Dockerfiles |

---

## 11. Backward Compatibility Guarantees

### API Contract
- All existing endpoints maintain same request/response format
- New endpoints use new paths only
- New query parameters have defaults

### Database
- Existing data unaffected by migrations
- New columns nullable with sensible defaults
- No data type changes on existing columns

### Configuration
- Existing environment variables unchanged
- New variables optional with defaults
- Helm values backward compatible

---

## 12. Conclusion

**Architecture Review Status**: APPROVED

The Phase IV architecture provides well-defined extension points that enable Phase V features without modifying core functionality. All identified extensions follow additive patterns with safe defaults.

**Recommendations**:
1. Execute database migration during low-traffic period
2. Enable Phase V features via configuration flags
3. Use background workers as fallback to microservices
4. Test locally before cloud deployment

---

**Document prepared under SAFE MODE constraints**
**No runtime code modified during this review**
