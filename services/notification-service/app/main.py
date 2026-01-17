"""Notification Service - Dapr Pub/Sub Consumer.

This service subscribes to the 'reminders' topic and delivers
notifications to users via email, push, or in-app channels.

Phase V: Event-driven notification delivery.
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
SERVICE_NAME = "notification-service"
DAPR_HTTP_PORT = int(os.getenv("DAPR_HTTP_PORT", "3500"))
PUBSUB_NAME = os.getenv("PUBSUB_NAME", "taskpubsub")
TOPIC_NAME = "reminders"


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
    title="Notification Service",
    description="Dapr consumer for reminder notifications",
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
            route="/events/reminder",
            metadata={"rawPayload": "true"},
        )
    ]


@app.post("/events/reminder")
async def handle_reminder(request: Request) -> Response:
    """Handle reminder events from Dapr Pub/Sub.

    This endpoint receives CloudEvents for reminder notifications
    and dispatches them to the appropriate delivery channel.
    """
    try:
        body = await request.json()
        logger.info(f"Received reminder event: {body}")

        # Parse CloudEvent
        event = CloudEvent(**body) if isinstance(body, dict) else body

        # Extract event ID for idempotency check
        event_id = event.id if hasattr(event, 'id') else body.get("id", "unknown")

        # Idempotency check - skip if already processed
        from app.idempotency import is_event_processed, mark_event_processed
        if is_event_processed(event_id):
            logger.info(f"Event {event_id} already processed, returning SUCCESS")
            return Response(status_code=200, content='{"status": "SUCCESS"}')

        # Determine event type and route to appropriate handler
        event_type = event.type if hasattr(event, 'type') else body.get("type", "")
        event_data = event.data if hasattr(event, 'data') else body.get("data", body)

        # Route based on event type
        if event_type == "reminder.due":
            # Handle Dapr Jobs triggered reminder
            from app.handlers import handle_reminder_due_event
            result = await handle_reminder_due_event(event_data)
        else:
            # Handle regular reminder events
            from app.handlers import handle_reminder_event
            result = await handle_reminder_event(event_data)

        if result:
            # Mark as processed only on success
            mark_event_processed(event_id)
            logger.info(f"Reminder processed successfully: {event_id}")
            return Response(status_code=200, content='{"status": "SUCCESS"}')
        else:
            logger.warning(f"Reminder processing returned False")
            return Response(status_code=200, content='{"status": "RETRY"}')

    except Exception as e:
        logger.error(f"Error processing reminder event: {e}", exc_info=True)
        # Return 200 to prevent Dapr from retrying immediately
        # The event will be logged for investigation
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
    uvicorn.run(app, host="0.0.0.0", port=5001)
