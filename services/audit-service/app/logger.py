"""Audit logger with database persistence.

Phase V: Persistent audit logging for compliance and debugging.
"""

import logging
import os
from datetime import datetime, timezone
from enum import Enum
from typing import Any
from uuid import uuid4

from sqlmodel import Field, Session, SQLModel, create_engine, select

logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://user:password@localhost:5432/todo_db"
)


class AuditAction(str, Enum):
    """Audit action types."""
    TASK_CREATED = "task.created"
    TASK_UPDATED = "task.updated"
    TASK_COMPLETED = "task.completed"
    TASK_DELETED = "task.deleted"
    TASK_RECURRED = "task.recurred"
    REMINDER_SCHEDULED = "reminder.scheduled"
    REMINDER_SENT = "reminder.sent"
    REMINDER_CANCELLED = "reminder.cancelled"
    UNKNOWN = "unknown"


class AuditLog(SQLModel, table=True):
    """Audit log entry model.

    Stores all task and reminder events for compliance and debugging.
    """
    __tablename__ = "audit_logs"

    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    user_id: str = Field(index=True)
    action: str = Field(index=True)
    entity_type: str = Field(index=True)  # "task" or "reminder"
    entity_id: str = Field(index=True)
    details: str | None = None  # JSON string of event data
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        index=True
    )


# Database engine (lazy initialization)
_engine = None


def get_engine():
    """Get or create database engine."""
    global _engine
    if _engine is None:
        _engine = create_engine(DATABASE_URL, echo=False)
        # Create tables if they don't exist
        SQLModel.metadata.create_all(_engine)
    return _engine


async def log_event(
    user_id: str,
    action: AuditAction,
    entity_type: str,
    entity_id: str,
    details: dict[str, Any] | None = None,
) -> bool:
    """Log an audit event to the database.

    Args:
        user_id: ID of the user who triggered the event
        action: Type of action performed
        entity_type: Type of entity ("task" or "reminder")
        entity_id: ID of the entity
        details: Additional event details as dict

    Returns:
        bool: True if logged successfully
    """
    try:
        import json

        # Convert details to JSON string
        details_json = json.dumps(details) if details else None

        # Create audit log entry
        audit_log = AuditLog(
            user_id=user_id,
            action=action.value,
            entity_type=entity_type,
            entity_id=entity_id,
            details=details_json,
        )

        # Save to database
        engine = get_engine()
        with Session(engine) as session:
            session.add(audit_log)
            session.commit()

        logger.info(
            f"Audit logged: {action.value}",
            extra={
                "user_id": user_id,
                "entity_type": entity_type,
                "entity_id": entity_id,
            }
        )
        return True

    except Exception as e:
        logger.error(f"Failed to log audit event: {e}", exc_info=True)
        return False


async def get_audit_logs(
    user_id: str | None = None,
    entity_type: str | None = None,
    entity_id: str | None = None,
    action: str | None = None,
    limit: int = 100,
) -> list[AuditLog]:
    """Query audit logs with optional filters.

    Args:
        user_id: Filter by user ID
        entity_type: Filter by entity type
        entity_id: Filter by entity ID
        action: Filter by action type
        limit: Maximum number of results

    Returns:
        list[AuditLog]: Matching audit log entries
    """
    try:
        engine = get_engine()
        with Session(engine) as session:
            query = select(AuditLog)

            if user_id:
                query = query.where(AuditLog.user_id == user_id)
            if entity_type:
                query = query.where(AuditLog.entity_type == entity_type)
            if entity_id:
                query = query.where(AuditLog.entity_id == entity_id)
            if action:
                query = query.where(AuditLog.action == action)

            query = query.order_by(AuditLog.created_at.desc()).limit(limit)

            results = session.exec(query).all()
            return list(results)

    except Exception as e:
        logger.error(f"Failed to query audit logs: {e}", exc_info=True)
        return []
