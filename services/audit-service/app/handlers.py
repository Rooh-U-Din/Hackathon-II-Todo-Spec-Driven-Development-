"""Event handlers for audit service.

Phase V: Log all events to audit table for compliance and debugging.
"""

import logging
from typing import Any

from app.logger import log_event, AuditAction

logger = logging.getLogger(__name__)

# Import metrics from main module
try:
    from app.main import AUDIT_LOGS_CREATED, EVENTS_PROCESSED
except ImportError:
    # Fallback if metrics not available (for testing)
    AUDIT_LOGS_CREATED = None
    EVENTS_PROCESSED = None

# Map event types to audit actions
EVENT_TYPE_TO_ACTION = {
    "task.created": AuditAction.TASK_CREATED,
    "task.updated": AuditAction.TASK_UPDATED,
    "task.completed": AuditAction.TASK_COMPLETED,
    "task.deleted": AuditAction.TASK_DELETED,
    "task.recurred": AuditAction.TASK_RECURRED,
    "reminder.scheduled": AuditAction.REMINDER_SCHEDULED,
    "reminder.sent": AuditAction.REMINDER_SENT,
    "reminder.cancelled": AuditAction.REMINDER_CANCELLED,
}


async def handle_any_event(
    event_type: str,
    event_id: str,
    event_data: dict[str, Any],
) -> bool:
    """Handle any event by logging it to the audit table.

    Args:
        event_type: Type of the event (e.g., task.created)
        event_id: Unique event ID
        event_data: Event payload

    Returns:
        bool: True if logged successfully
    """
    try:
        # Extract common fields
        user_id = event_data.get("user_id")
        task_id = event_data.get("task_id")
        entity_id = task_id or event_data.get("reminder_id") or event_id

        if not user_id:
            logger.warning(f"Event missing user_id: {event_type} - {event_id}")
            # Still log the event but with placeholder user_id
            user_id = "00000000-0000-0000-0000-000000000000"

        # Map event type to action
        action = EVENT_TYPE_TO_ACTION.get(event_type, AuditAction.UNKNOWN)

        # Determine entity type
        if event_type.startswith("task."):
            entity_type = "task"
        elif event_type.startswith("reminder."):
            entity_type = "reminder"
        else:
            entity_type = "unknown"

        # Build details
        details = {
            "event_id": event_id,
            "event_type": event_type,
            **event_data,
        }

        # Log the event
        result = await log_event(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=str(entity_id) if entity_id else event_id,
            details=details,
        )

        # Track metrics
        if result and AUDIT_LOGS_CREATED:
            AUDIT_LOGS_CREATED.labels(
                action=action.value,
                entity_type=entity_type
            ).inc()

        if result:
            logger.info(
                f"Audit logged: {action.value}",
                extra={
                    "event_id": event_id,
                    "event_type": event_type,
                    "entity_id": entity_id,
                },
            )
        return result

    except Exception as e:
        logger.error(f"Error logging audit event: {e}", exc_info=True)
        return False


async def handle_task_created(event_data: dict[str, Any]) -> bool:
    """Handle task.created event."""
    return await handle_any_event(
        event_type="task.created",
        event_id=event_data.get("event_id", "unknown"),
        event_data=event_data,
    )


async def handle_task_updated(event_data: dict[str, Any]) -> bool:
    """Handle task.updated event."""
    return await handle_any_event(
        event_type="task.updated",
        event_id=event_data.get("event_id", "unknown"),
        event_data=event_data,
    )


async def handle_task_completed(event_data: dict[str, Any]) -> bool:
    """Handle task.completed event."""
    return await handle_any_event(
        event_type="task.completed",
        event_id=event_data.get("event_id", "unknown"),
        event_data=event_data,
    )


async def handle_task_deleted(event_data: dict[str, Any]) -> bool:
    """Handle task.deleted event."""
    return await handle_any_event(
        event_type="task.deleted",
        event_id=event_data.get("event_id", "unknown"),
        event_data=event_data,
    )


async def handle_reminder_event(event_data: dict[str, Any]) -> bool:
    """Handle any reminder event."""
    event_type = event_data.get("type", "reminder.unknown")
    return await handle_any_event(
        event_type=event_type,
        event_id=event_data.get("event_id", "unknown"),
        event_data=event_data,
    )
