"""Recurring Task Service - Dapr Pub/Sub Consumer.

This service subscribes to the 'task-events' topic and generates
next occurrences when recurring tasks are completed.

Phase V: Event-driven recurring task management.
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
SERVICE_NAME = "recurring-task-service"
DAPR_HTTP_PORT = int(os.getenv("DAPR_HTTP_PORT", "3500"))
PUBSUB_NAME = os.getenv("PUBSUB_NAME", "taskpubsub")
TOPIC_NAME = "task-events"


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
    logger.info(f"Subscribing to {PUBSUB_NAME}/{TOPIC_NAME}")
    yield
    logger.info(f"{SERVICE_NAME} shutting down")


app = FastAPI(
    title="Recurring Task Service",
    description="Dapr consumer for task.completed events - generates next occurrences",
    version="1.0.0",
    lifespan=lifespan,
)


@app.get("/dapr/subscribe")
async def subscribe() -> list[DaprSubscription]:
    """Return Dapr subscription configuration.

    Dapr calls this endpoint to discover topic subscriptions.
    """
    return [
        DaprSubscription(
            pubsubname=PUBSUB_NAME,
            topic=TOPIC_NAME,
            route="/events/task",
            metadata={"rawPayload": "true"},
        )
    ]


@app.post("/events/task")
async def handle_task_event(request: Request) -> Response:
    """Handle task events from Dapr Pub/Sub.

    This endpoint receives CloudEvents for task operations.
    Only task.completed events trigger recurrence generation.
    """
    try:
        body = await request.json()
        logger.info(f"Received task event: {body}")

        # Parse CloudEvent
        event = CloudEvent(**body) if isinstance(body, dict) else body
        event_type = event.type if hasattr(event, 'type') else body.get("type", "")

        # Only process task.completed events
        if event_type != "task.completed":
            logger.debug(f"Ignoring event type: {event_type}")
            return Response(status_code=200, content='{"status": "IGNORED"}')

        # Extract event ID for idempotency check
        event_id = event.id if hasattr(event, 'id') else body.get("id", "unknown")

        # Idempotency check - skip if already processed
        from app.idempotency import is_event_processed, mark_event_processed
        if is_event_processed(event_id):
            logger.info(f"Event {event_id} already processed, returning SUCCESS")
            return Response(status_code=200, content='{"status": "SUCCESS"}')

        # Import handler
        from app.handlers import handle_task_completed

        # Process the event
        event_data = event.data if hasattr(event, 'data') else body.get("data", body)
        result = await handle_task_completed(event_data)

        if result:
            # Mark as processed only on success
            mark_event_processed(event_id)
            logger.info(f"Recurring task generated for: {event_id}")
            return Response(status_code=200, content='{"status": "SUCCESS"}')
        else:
            # No recurrence needed is still a successful processing
            mark_event_processed(event_id)
            logger.info(f"No recurrence needed or non-recurring task")
            return Response(status_code=200, content='{"status": "NO_RECURRENCE"}')

    except Exception as e:
        logger.error(f"Error processing task event: {e}", exc_info=True)
        # Return 200 to prevent Dapr from retrying immediately
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
    uvicorn.run(app, host="0.0.0.0", port=5002)
