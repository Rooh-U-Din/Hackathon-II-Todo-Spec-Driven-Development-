"""Event handlers for notification service.

Phase V: Process reminder events and trigger notifications.
"""

import logging
import os
from typing import Any

import httpx

from app.notifier import send_notification, NotificationChannel

logger = logging.getLogger(__name__)

# Backend URL for status updates
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")


async def handle_reminder_due_event(event_data: dict[str, Any]) -> bool:
    """Handle reminder.due events from Dapr Jobs.

    This is called when a scheduled Dapr job triggers for a reminder.

    Args:
        event_data: Event payload from Dapr Jobs

    Returns:
        bool: True if notification sent and status updated
    """
    try:
        reminder_id = event_data.get("reminder_id")
        task_id = event_data.get("task_id")
        user_id = event_data.get("user_id")

        if not all([reminder_id, task_id, user_id]):
            logger.warning(f"Incomplete reminder.due event: {event_data}")
            return False

        logger.info(
            "Processing reminder.due from Dapr Jobs",
            extra={
                "reminder_id": reminder_id,
                "task_id": task_id,
                "user_id": user_id,
            },
        )

        # Fetch task details for the notification
        task_title = await _fetch_task_title(task_id, user_id)

        # Send the notification
        message = f"Reminder: {task_title or 'Task'} is due soon!"
        result = await send_notification(
            channel=NotificationChannel.IN_APP,
            user_id=user_id,
            subject="Task Reminder",
            message=message,
            metadata={
                "reminder_id": reminder_id,
                "task_id": task_id,
                "trigger": "dapr_jobs",
            },
        )

        # Update reminder status in backend
        await _update_reminder_status(
            reminder_id=reminder_id,
            status="sent" if result else "failed",
        )

        return result

    except Exception as e:
        logger.error(f"Error handling reminder.due event: {e}", exc_info=True)
        # Try to mark as failed
        if reminder_id:
            await _update_reminder_status(reminder_id, "failed")
        return False


async def _fetch_task_title(task_id: str, user_id: str) -> str | None:
    """Fetch task title from backend for notification message.

    Args:
        task_id: The task ID
        user_id: The user ID (for auth context)

    Returns:
        str: Task title or None if not found
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{BACKEND_URL}/api/tasks/{task_id}",
                headers={"X-User-ID": user_id},
                timeout=5.0,
            )
            if response.status_code == 200:
                data = response.json()
                return data.get("title")
    except Exception as e:
        logger.warning(f"Could not fetch task title: {e}")
    return None


async def _update_reminder_status(
    reminder_id: str,
    status: str,
) -> bool:
    """Update reminder status in backend after delivery.

    Args:
        reminder_id: The reminder ID
        status: New status ("sent" or "failed")

    Returns:
        bool: True if status updated successfully
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.patch(
                f"{BACKEND_URL}/api/reminders/{reminder_id}/status",
                json={"status": status},
                timeout=5.0,
            )
            if response.status_code in (200, 204):
                logger.info(
                    f"Reminder status updated to {status}",
                    extra={"reminder_id": reminder_id},
                )
                return True
            else:
                logger.warning(
                    f"Failed to update reminder status: {response.status_code}",
                    extra={"reminder_id": reminder_id},
                )
                return False
    except Exception as e:
        logger.error(f"Error updating reminder status: {e}")
        return False


async def handle_reminder_event(event_data: dict[str, Any]) -> bool:
    """Handle a reminder event.

    Args:
        event_data: Event payload containing reminder details

    Returns:
        bool: True if notification sent successfully
    """
    try:
        # Extract reminder data
        reminder_id = event_data.get("reminder_id")
        task_id = event_data.get("task_id")
        user_id = event_data.get("user_id")
        task_title = event_data.get("task_title", "Task reminder")
        remind_at = event_data.get("remind_at")

        if not all([reminder_id, task_id, user_id]):
            logger.warning(f"Incomplete reminder event data: {event_data}")
            return False

        # Build notification message
        message = f"Reminder: {task_title}"
        if remind_at:
            message += f" (scheduled for {remind_at})"

        # Send notification via all configured channels
        results = []

        # Try in-app notification first (always available)
        result = await send_notification(
            channel=NotificationChannel.IN_APP,
            user_id=user_id,
            subject="Task Reminder",
            message=message,
            metadata={
                "reminder_id": reminder_id,
                "task_id": task_id,
            },
        )
        results.append(result)

        # Log result
        if any(results):
            logger.info(
                f"Notification sent for reminder {reminder_id}",
                extra={
                    "reminder_id": reminder_id,
                    "task_id": task_id,
                    "user_id": user_id,
                },
            )
            return True
        else:
            logger.warning(
                f"Failed to send notification for reminder {reminder_id}",
                extra={"results": results},
            )
            return False

    except Exception as e:
        logger.error(f"Error handling reminder event: {e}", exc_info=True)
        return False


async def handle_task_event(event_data: dict[str, Any]) -> bool:
    """Handle task-related events (created, completed, deleted).

    These events can trigger notifications for task activity.

    Args:
        event_data: Event payload containing task details

    Returns:
        bool: True if processed successfully
    """
    try:
        event_type = event_data.get("event_type", "")
        task_id = event_data.get("task_id")
        user_id = event_data.get("user_id")
        title = event_data.get("title", "")

        # Only notify for high-priority task events
        priority = event_data.get("priority", "medium")
        if priority != "high":
            logger.debug(f"Skipping notification for non-high-priority task: {task_id}")
            return True

        # Build notification based on event type
        if event_type == "task.completed":
            subject = "Task Completed"
            message = f"You completed: {title}"
        elif event_type == "task.created":
            subject = "New High-Priority Task"
            message = f"New task created: {title}"
        else:
            # Skip other event types
            return True

        result = await send_notification(
            channel=NotificationChannel.IN_APP,
            user_id=user_id,
            subject=subject,
            message=message,
            metadata={
                "task_id": task_id,
                "event_type": event_type,
            },
        )

        return result

    except Exception as e:
        logger.error(f"Error handling task event: {e}", exc_info=True)
        return False
