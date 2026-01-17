"""Audit Service - Dapr Pub/Sub Consumer.

This service subscribes to all task events and logs them
to the audit_logs table for compliance and debugging.

Phase V: Event-driven audit logging.
"""

import logging
import os
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, Request, Response
from pydantic import BaseModel

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Service configuration
SERVICE_NAME = "audit-service"
DAPR_HTTP_PORT = int(os.getenv("DAPR_HTTP_PORT", "3500"))
PUBSUB_NAME = os.getenv("PUBSUB_NAME", "taskpubsub")
TASK_EVENTS_TOPIC = "task-events"
REMINDERS_TOPIC = "reminders"


class CloudEvent(BaseModel):
    """CloudEvents 1.0 envelope."""
    specversion: str = "1.0"
    type: str
    source: str
    id: str
    time: str | None = None
    datacontenttype: str = "application/json"
    data: dict[str, Any] = {}


class DaprSubscription(BaseModel):
    """Dapr subscription configuration."""
    pubsubname: str
    topic: str
    route: str
    metadata: dict[str, str] = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    logger.info(f"{SERVICE_NAME} starting up")
    logger.info(f"Subscribing to {PUBSUB_NAME}/{TASK_EVENTS_TOPIC} and {REMINDERS_TOPIC}")
    yield
    logger.info(f"{SERVICE_NAME} shutting down")


app = FastAPI(
    title="Audit Service",
    description="Dapr consumer for all task events - logs to audit table",
    version="1.0.0",
    lifespan=lifespan,
)


@app.get("/dapr/subscribe")
async def subscribe() -> list[DaprSubscription]:
    """Return Dapr subscription configuration.

    Dapr calls this endpoint to discover topic subscriptions.
    We subscribe to both task-events and reminders topics.
    """
    return [
        DaprSubscription(
            pubsubname=PUBSUB_NAME,
            topic=TASK_EVENTS_TOPIC,
            route="/events/task",
            metadata={"rawPayload": "true"},
        ),
        DaprSubscription(
            pubsubname=PUBSUB_NAME,
            topic=REMINDERS_TOPIC,
            route="/events/reminder",
            metadata={"rawPayload": "true"},
        ),
    ]


@app.post("/events/task")
async def handle_task_event(request: Request) -> Response:
    """Handle task events from Dapr Pub/Sub.

    All task events are logged to the audit table.
    """
    try:
        body = await request.json()
        logger.info(f"Received task event: {body}")

        # Parse CloudEvent
        event = CloudEvent(**body) if isinstance(body, dict) else body

        # Extract event data
        event_data = event.data if hasattr(event, 'data') else body.get("data", body)
        event_type = event.type if hasattr(event, 'type') else body.get("type", "unknown")
        event_id = event.id if hasattr(event, 'id') else body.get("id", "unknown")

        # Idempotency check - skip if already processed
        from app.idempotency import is_event_processed, mark_event_processed
        if is_event_processed(event_id):
            logger.info(f"Event {event_id} already processed, returning SUCCESS")
            return Response(status_code=200, content='{"status": "SUCCESS"}')

        # Import handler
        from app.handlers import handle_any_event

        result = await handle_any_event(
            event_type=event_type,
            event_id=event_id,
            event_data=event_data,
        )

        if result:
            # Mark as processed only on success
            mark_event_processed(event_id)
            logger.info(f"Task event logged: {event_id}")
            return Response(status_code=200, content='{"status": "SUCCESS"}')
        else:
            logger.warning(f"Failed to log task event: {event_id}")
            return Response(status_code=200, content='{"status": "RETRY"}')

    except Exception as e:
        logger.error(f"Error processing task event: {e}", exc_info=True)
        return Response(status_code=200, content='{"status": "DROP"}')


@app.post("/events/reminder")
async def handle_reminder_event(request: Request) -> Response:
    """Handle reminder events from Dapr Pub/Sub.

    All reminder events are logged to the audit table.
    """
    try:
        body = await request.json()
        logger.info(f"Received reminder event: {body}")

        # Parse CloudEvent
        event = CloudEvent(**body) if isinstance(body, dict) else body

        # Extract event data
        event_data = event.data if hasattr(event, 'data') else body.get("data", body)
        event_type = event.type if hasattr(event, 'type') else body.get("type", "unknown")
        event_id = event.id if hasattr(event, 'id') else body.get("id", "unknown")

        # Idempotency check - skip if already processed
        from app.idempotency import is_event_processed, mark_event_processed
        if is_event_processed(event_id):
            logger.info(f"Event {event_id} already processed, returning SUCCESS")
            return Response(status_code=200, content='{"status": "SUCCESS"}')

        # Import handler
        from app.handlers import handle_any_event

        result = await handle_any_event(
            event_type=event_type,
            event_id=event_id,
            event_data=event_data,
        )

        if result:
            # Mark as processed only on success
            mark_event_processed(event_id)
            logger.info(f"Reminder event logged: {event_id}")
            return Response(status_code=200, content='{"status": "SUCCESS"}')
        else:
            logger.warning(f"Failed to log reminder event: {event_id}")
            return Response(status_code=200, content='{"status": "RETRY"}')

    except Exception as e:
        logger.error(f"Error processing reminder event: {e}", exc_info=True)
        return Response(status_code=200, content='{"status": "DROP"}')


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy", "service": SERVICE_NAME}


@app.get("/ready")
async def ready():
    """Readiness check endpoint."""
    return {"status": "ready", "service": SERVICE_NAME}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5003)
