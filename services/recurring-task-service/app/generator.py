"""Next occurrence generator for recurring tasks.

Phase V: Calculate and generate next task occurrences based on recurrence rules.
"""

import logging
from datetime import datetime, timedelta
from enum import Enum
from typing import Any
from uuid import uuid4

logger = logging.getLogger(__name__)


class RecurrenceType(str, Enum):
    """Task recurrence types."""
    NONE = "none"
    DAILY = "daily"
    WEEKLY = "weekly"
    CUSTOM = "custom"


def calculate_next_due_date(
    current_due_at: str | datetime | None,
    recurrence_type: RecurrenceType,
    recurrence_interval: int | None = None,
) -> datetime | None:
    """Calculate the next due date based on recurrence settings.

    Args:
        current_due_at: Current due date (ISO string or datetime)
        recurrence_type: Type of recurrence
        recurrence_interval: Custom interval in days (required for CUSTOM type)

    Returns:
        datetime: Next due date, or None if cannot calculate
    """
    if recurrence_type == RecurrenceType.NONE:
        return None

    # Parse due date if string
    if isinstance(current_due_at, str):
        try:
            base_date = datetime.fromisoformat(current_due_at.replace("Z", "+00:00"))
            # Remove timezone info for calculation
            base_date = base_date.replace(tzinfo=None)
        except ValueError:
            logger.error(f"Invalid due_at format: {current_due_at}")
            return None
    elif isinstance(current_due_at, datetime):
        base_date = current_due_at
    else:
        # No due date, use current time
        base_date = datetime.utcnow()

    now = datetime.utcnow()

    # If the base date is in the past, start from now
    if base_date < now:
        base_date = now

    # Calculate next occurrence
    if recurrence_type == RecurrenceType.DAILY:
        return base_date + timedelta(days=1)
    elif recurrence_type == RecurrenceType.WEEKLY:
        return base_date + timedelta(weeks=1)
    elif recurrence_type == RecurrenceType.CUSTOM:
        if recurrence_interval and recurrence_interval > 0:
            return base_date + timedelta(days=recurrence_interval)
        else:
            logger.warning("Custom recurrence without valid interval")
            return None

    return None


def generate_next_occurrence(
    parent_task_id: str,
    user_id: str,
    title: str,
    description: str | None = None,
    recurrence_type: RecurrenceType = RecurrenceType.NONE,
    recurrence_interval: int | None = None,
    due_at: str | datetime | None = None,
    priority: str = "medium",
) -> dict[str, Any] | None:
    """Generate the next occurrence of a recurring task.

    Args:
        parent_task_id: ID of the completed parent task
        user_id: ID of the task owner
        title: Task title
        description: Task description
        recurrence_type: Type of recurrence
        recurrence_interval: Custom interval in days
        due_at: Current due date
        priority: Task priority

    Returns:
        dict: New task data for the next occurrence, or None if not applicable
    """
    if recurrence_type == RecurrenceType.NONE:
        return None

    next_due = calculate_next_due_date(due_at, recurrence_type, recurrence_interval)
    if not next_due:
        return None

    # Generate new task data
    next_task = {
        "id": str(uuid4()),
        "user_id": user_id,
        "title": title,
        "description": description,
        "is_completed": False,
        "recurrence_type": recurrence_type.value,
        "recurrence_interval": recurrence_interval,
        "due_at": next_due.isoformat(),
        "next_occurrence_at": next_due.isoformat(),
        "priority": priority,
        "parent_task_id": parent_task_id,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }

    logger.info(
        f"Generated next occurrence",
        extra={
            "parent_task_id": parent_task_id,
            "new_task_id": next_task["id"],
            "next_due_at": next_task["due_at"],
        },
    )

    return next_task


class RecurrenceGenerator:
    """Service class for generating recurring task occurrences.

    Provides higher-level interface with validation and error handling.
    """

    def __init__(self, max_future_days: int = 365):
        """Initialize the generator.

        Args:
            max_future_days: Maximum days in the future for next occurrence
        """
        self.max_future_days = max_future_days

    def can_generate(
        self,
        recurrence_type: RecurrenceType,
        recurrence_interval: int | None = None,
    ) -> bool:
        """Check if generation is possible with given settings.

        Args:
            recurrence_type: Type of recurrence
            recurrence_interval: Custom interval for CUSTOM type

        Returns:
            bool: True if generation is possible
        """
        if recurrence_type == RecurrenceType.NONE:
            return False

        if recurrence_type == RecurrenceType.CUSTOM:
            if not recurrence_interval or recurrence_interval <= 0:
                return False
            if recurrence_interval > self.max_future_days:
                return False

        return True

    def generate(
        self,
        parent_task_id: str,
        user_id: str,
        title: str,
        recurrence_type: RecurrenceType,
        **kwargs,
    ) -> dict[str, Any] | None:
        """Generate next occurrence with validation.

        Args:
            parent_task_id: ID of parent task
            user_id: ID of user
            title: Task title
            recurrence_type: Type of recurrence
            **kwargs: Additional task fields

        Returns:
            dict: New task data, or None if cannot generate
        """
        interval = kwargs.get("recurrence_interval")

        if not self.can_generate(recurrence_type, interval):
            logger.warning(
                f"Cannot generate occurrence: invalid settings",
                extra={
                    "recurrence_type": recurrence_type.value,
                    "recurrence_interval": interval,
                },
            )
            return None

        return generate_next_occurrence(
            parent_task_id=parent_task_id,
            user_id=user_id,
            title=title,
            recurrence_type=recurrence_type,
            **kwargs,
        )


# Default generator instance
_generator: RecurrenceGenerator | None = None


def get_recurrence_generator() -> RecurrenceGenerator:
    """Get the recurrence generator singleton."""
    global _generator
    if _generator is None:
        _generator = RecurrenceGenerator()
    return _generator
