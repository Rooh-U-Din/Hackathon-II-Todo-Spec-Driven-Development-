# Phase V Consumer Microservices

This directory contains event-driven consumer microservices for Phase V.

## Overview

These services subscribe to task events via Dapr Pub/Sub and perform specialized processing:

| Service | Purpose | Subscribes To |
|---------|---------|---------------|
| notification-service | Deliver email/web notifications | `reminders` topic |
| recurring-task-service | Generate next task occurrences | `task-events` topic (task.completed) |
| audit-service | Log all task activity | `task-events` topic (all events) |

## Architecture

```
┌─────────────────┐     ┌───────────────┐
│  Todo Backend   │────▶│  Kafka/Redis  │
│  (Publisher)    │     │  (Pub/Sub)    │
└─────────────────┘     └───────┬───────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌───────────────┐     ┌─────────────────┐     ┌───────────────┐
│ Notification  │     │ Recurring Task  │     │    Audit      │
│   Service     │     │    Service      │     │   Service     │
└───────────────┘     └─────────────────┘     └───────────────┘
```

## Alternative: Background Workers

Phase 15.5 provides in-process background workers as an alternative to these microservices:
- `backend/app/workers/` contains equivalent functionality
- Workers run in the same process as the backend
- Simpler deployment but less scalable

## Directory Structure

```
services/
├── README.md                    # This file
├── notification-service/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI + Dapr subscriber
│   │   ├── handlers.py          # Event handlers
│   │   └── notifier.py          # Email/web delivery
│   ├── Dockerfile
│   └── pyproject.toml
├── recurring-task-service/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI + Dapr subscriber
│   │   ├── handlers.py          # task.completed handler
│   │   └── generator.py         # Next occurrence logic
│   ├── Dockerfile
│   └── pyproject.toml
└── audit-service/
    ├── app/
    │   ├── __init__.py
    │   ├── main.py              # FastAPI + Dapr subscriber
    │   ├── handlers.py          # All event handlers
    │   └── logger.py            # DB persistence
    ├── Dockerfile
    └── pyproject.toml
```

## Running Locally

Each service can be run with Dapr:

```bash
# Start notification service
cd services/notification-service
dapr run --app-id notification-service --app-port 5001 -- python -m app.main

# Start recurring-task service
cd services/recurring-task-service
dapr run --app-id recurring-task-service --app-port 5002 -- python -m app.main

# Start audit service
cd services/audit-service
dapr run --app-id audit-service --app-port 5003 -- python -m app.main
```

## Kubernetes Deployment

Services are deployed via Helm subcharts in `helm/todo-app/charts/`:
- Each service has its own subchart
- Dapr sidecar injection enabled via annotations
- Horizontal scaling supported

---

**SAFE MODE**: This directory structure is new and does not modify existing code.
