"""Event handlers for recurring task service.

Phase V: Process task.completed events and generate next occurrences.
"""

import logging
from typing import Any

from app.generator import generate_next_occurrence, RecurrenceType

logger = logging.getLogger(__name__)


async def handle_task_completed(event_data: dict[str, Any]) -> bool:
    """Handle a task.completed event.

    Checks if the completed task is recurring and generates
    the next occurrence if needed.

    Args:
        event_data: Event payload containing task details

    Returns:
        bool: True if a new occurrence was generated
    """
    try:
        # Extract task data
        task_id = event_data.get("task_id")
        user_id = event_data.get("user_id")
        recurrence_type_str = event_data.get("recurrence_type", "none")
        recurrence_interval = event_data.get("recurrence_interval")
        due_at = event_data.get("due_at")
        title = event_data.get("title", "")
        description = event_data.get("description")
        priority = event_data.get("priority", "medium")

        if not all([task_id, user_id]):
            logger.warning(f"Incomplete task event data: {event_data}")
            return False

        # Check if task is recurring
        try:
            recurrence_type = RecurrenceType(recurrence_type_str)
        except ValueError:
            recurrence_type = RecurrenceType.NONE

        if recurrence_type == RecurrenceType.NONE:
            logger.debug(f"Task {task_id} is not recurring, skipping")
            return False

        # Generate next occurrence
        next_task = generate_next_occurrence(
            parent_task_id=task_id,
            user_id=user_id,
            title=title,
            description=description,
            recurrence_type=recurrence_type,
            recurrence_interval=recurrence_interval,
            due_at=due_at,
            priority=priority,
        )

        if next_task:
            logger.info(
                f"Generated next occurrence for task {task_id}",
                extra={
                    "parent_task_id": task_id,
                    "next_due_at": next_task.get("due_at"),
                    "recurrence_type": recurrence_type.value,
                },
            )
            # TODO: Persist to database via service invocation or direct DB access
            # For now, just log the generated task
            logger.info(f"Next occurrence data: {next_task}")
            return True
        else:
            logger.warning(f"Failed to generate next occurrence for task {task_id}")
            return False

    except Exception as e:
        logger.error(f"Error handling task.completed event: {e}", exc_info=True)
        return False
