"""Idempotency tracking for recurring-task service.

Phase V: Prevent duplicate event processing using in-memory cache
with optional Redis/database persistence for production.
"""

import logging
import os
from datetime import datetime, timezone
from typing import Optional

logger = logging.getLogger(__name__)

# In-memory cache for processed events (use Redis in production)
_processed_events: dict[str, datetime] = {}

# Cache TTL in seconds (default: 24 hours)
CACHE_TTL_SECONDS = int(os.getenv("IDEMPOTENCY_TTL_SECONDS", "86400"))

# Maximum cache size before cleanup
MAX_CACHE_SIZE = int(os.getenv("IDEMPOTENCY_MAX_SIZE", "10000"))


def is_event_processed(event_id: str) -> bool:
    """Check if an event has already been processed.

    Args:
        event_id: Unique event identifier

    Returns:
        bool: True if event was already processed
    """
    if not event_id:
        logger.warning("Event ID is empty, cannot check idempotency")
        return False

    if event_id in _processed_events:
        logger.info(f"Event {event_id} already processed, skipping")
        return True

    return False


def mark_event_processed(event_id: str) -> None:
    """Mark an event as successfully processed.

    Args:
        event_id: Unique event identifier
    """
    if not event_id:
        logger.warning("Event ID is empty, cannot mark as processed")
        return

    # Clean up old entries if cache is too large
    if len(_processed_events) >= MAX_CACHE_SIZE:
        _cleanup_old_entries()

    _processed_events[event_id] = datetime.now(timezone.utc)
    logger.debug(f"Marked event {event_id} as processed")


def _cleanup_old_entries() -> None:
    """Remove expired entries from the cache."""
    now = datetime.now(timezone.utc)
    expired_keys = []

    for event_id, processed_at in _processed_events.items():
        age_seconds = (now - processed_at).total_seconds()
        if age_seconds > CACHE_TTL_SECONDS:
            expired_keys.append(event_id)

    for key in expired_keys:
        del _processed_events[key]

    if expired_keys:
        logger.info(f"Cleaned up {len(expired_keys)} expired idempotency entries")


def get_processed_count() -> int:
    """Get the number of processed events in cache.

    Returns:
        int: Number of events in cache
    """
    return len(_processed_events)


def clear_cache() -> None:
    """Clear the processed events cache (for testing)."""
    _processed_events.clear()
    logger.info("Idempotency cache cleared")
