---
id: 008
title: Phase V Step 4 Background Workers
stage: green
date: 2026-01-06
surface: agent
model: claude-opus-4-5-20251101
feature: 005-cloud-event-driven
branch: 005-cloud-event-driven
user: developer
command: /sp.implement
labels: ["background-workers", "ai-automation", "worker-runner", "phase-v"]
links:
  spec: specs/005-cloud-event-driven/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - backend/app/workers/__init__.py
  - backend/app/workers/base.py
  - backend/app/workers/event_worker.py
  - backend/app/workers/notification_worker.py
  - backend/app/workers/reminder_worker.py
  - backend/app/workers/ai_executor.py
  - backend/app/workers/runner.py
  - backend/scripts/run_workers.py
  - backend/tests/test_workers.py
  - backend/app/config.py (modified)
  - backend/app/models/task_event.py (modified)
  - backend/app/models/notification.py (modified)
tests:
  - backend/tests/test_workers.py (28 tests)
---

## Prompt

/sp.implement Phase V – Step 4: Background Workers, Automation & AI Execution

Implement background workers with:
1. Worker base abstraction with lifecycle methods
2. Event processing worker for outbox
3. Notification delivery worker
4. Reminder execution worker
5. AI recommendation executor with confidence threshold
6. Worker runner with observability
7. Dev entrypoint script

## Response snapshot

Implemented complete background worker infrastructure:

**Worker Architecture:**
- `WorkerBase[T]`: Generic abstract base class with `fetch_pending`, `mark_processing`, `process_item`, `mark_completed`, `mark_failed` lifecycle methods
- `WorkerResult` and `WorkerStatus`: Dataclasses for result aggregation and logging
- Idempotent processing via status checks (no version column needed)

**Workers Implemented:**
1. `EventWorker`: Processes TaskEvent outbox records with PENDING status
2. `NotificationWorker`: Delivers notifications with retry logic and exponential backoff
3. `ReminderWorker`: Triggers due reminders, creates notifications, handles task completion edge cases

**AI Automation:**
- `AIExecutor`: Safe executor with global enable/disable flag and confidence thresholds
- `ExecutionResult`: Tracks applied/skipped recommendations with reasons
- Audit logging for all AI-applied actions
- Supported actions: PRIORITY_CHANGE, ADD_REMINDER

**Runner Infrastructure:**
- `WorkerRunner`: Orchestrates all workers sequentially
- `run_worker_once()`: Single processing cycle
- `run_worker_loop()`: Continuous processing with configurable interval
- Signal handlers for graceful shutdown (SIGINT, SIGTERM)
- Structured logging throughout

**Configuration (environment variables):**
- WORKER_BATCH_SIZE (default: 50)
- WORKER_MAX_RETRIES (default: 3)
- WORKER_RETRY_DELAY_SECONDS (default: 60)
- WORKER_POLL_INTERVAL_SECONDS (default: 5)
- AI_AUTOMATION_ENABLED (default: false)
- AI_CONFIDENCE_THRESHOLD (default: 0.8)

## Outcome

- Impact: Background processing infrastructure for event-driven architecture
- Tests: 28 tests covering workers, executor, and runner
- Files: 9 new files, 3 modified files
- Next prompts: Phase V – Step 5 (final phase)
- Reflection: Clean worker abstraction enables easy addition of new worker types

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Syntax check PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
