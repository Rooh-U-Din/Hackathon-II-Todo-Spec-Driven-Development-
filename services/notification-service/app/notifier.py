"""Notification delivery module.

Phase V: Supports multiple notification channels with mock implementations
for development and testing. Real implementations can be added later.
"""

import logging
from enum import Enum
from typing import Any

logger = logging.getLogger(__name__)


class NotificationChannel(str, Enum):
    """Supported notification channels."""
    EMAIL = "email"
    PUSH = "push"
    IN_APP = "in_app"


class NotificationResult:
    """Result of a notification delivery attempt."""

    def __init__(
        self,
        success: bool,
        channel: NotificationChannel,
        message_id: str | None = None,
        error: str | None = None,
    ):
        self.success = success
        self.channel = channel
        self.message_id = message_id
        self.error = error


async def send_notification(
    channel: NotificationChannel,
    user_id: str,
    subject: str,
    message: str,
    metadata: dict[str, Any] | None = None,
) -> bool:
    """Send a notification via the specified channel.

    Args:
        channel: Delivery channel (email, push, in_app)
        user_id: Target user ID
        subject: Notification subject/title
        message: Notification body
        metadata: Additional metadata for the notification

    Returns:
        bool: True if notification was sent successfully
    """
    try:
        if channel == NotificationChannel.EMAIL:
            return await _send_email(user_id, subject, message, metadata)
        elif channel == NotificationChannel.PUSH:
            return await _send_push(user_id, subject, message, metadata)
        elif channel == NotificationChannel.IN_APP:
            return await _send_in_app(user_id, subject, message, metadata)
        else:
            logger.warning(f"Unknown notification channel: {channel}")
            return False

    except Exception as e:
        logger.error(f"Failed to send notification via {channel}: {e}")
        return False


async def _send_email(
    user_id: str,
    subject: str,
    message: str,
    metadata: dict[str, Any] | None = None,
) -> bool:
    """Send email notification.

    Currently a mock implementation. In production, integrate with:
    - SendGrid
    - AWS SES
    - Mailgun
    - Or any SMTP provider
    """
    logger.info(
        f"[MOCK EMAIL] To: user_{user_id}@example.com | Subject: {subject} | Body: {message}"
    )
    # TODO: Implement real email sending
    # Example with SendGrid:
    # import sendgrid
    # sg = sendgrid.SendGridAPIClient(api_key=os.environ.get('SENDGRID_API_KEY'))
    # ...
    return True


async def _send_push(
    user_id: str,
    subject: str,
    message: str,
    metadata: dict[str, Any] | None = None,
) -> bool:
    """Send push notification.

    Currently a mock implementation. In production, integrate with:
    - Firebase Cloud Messaging (FCM)
    - Apple Push Notification Service (APNS)
    - OneSignal
    - Pusher
    """
    logger.info(
        f"[MOCK PUSH] To: {user_id} | Title: {subject} | Body: {message}"
    )
    # TODO: Implement real push notifications
    # Example with FCM:
    # from firebase_admin import messaging
    # message = messaging.Message(
    #     notification=messaging.Notification(title=subject, body=message),
    #     token=device_token,
    # )
    # messaging.send(message)
    return True


async def _send_in_app(
    user_id: str,
    subject: str,
    message: str,
    metadata: dict[str, Any] | None = None,
) -> bool:
    """Send in-app notification.

    This stores the notification for retrieval by the frontend.
    Currently a mock implementation that just logs.

    In production, this would:
    1. Store in database notification_deliveries table
    2. Optionally send via WebSocket for real-time updates
    """
    logger.info(
        f"[MOCK IN-APP] To: {user_id} | Title: {subject} | Body: {message} | Meta: {metadata}"
    )
    # TODO: Implement real in-app notifications
    # Example:
    # notification = NotificationDelivery(
    #     user_id=user_id,
    #     channel=NotificationChannel.IN_APP,
    #     subject=subject,
    #     message=message,
    #     status=DeliveryStatus.SENT,
    # )
    # session.add(notification)
    # session.commit()
    return True


class NotificationService:
    """Service class for managing notifications.

    Provides a higher-level interface for sending notifications
    with retry logic and channel fallbacks.
    """

    def __init__(
        self,
        default_channel: NotificationChannel = NotificationChannel.IN_APP,
    ):
        self.default_channel = default_channel

    async def notify_user(
        self,
        user_id: str,
        subject: str,
        message: str,
        channels: list[NotificationChannel] | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> list[NotificationResult]:
        """Send notification to user via one or more channels.

        Args:
            user_id: Target user ID
            subject: Notification subject
            message: Notification body
            channels: List of channels to use (default: [default_channel])
            metadata: Additional metadata

        Returns:
            List of results for each channel attempted
        """
        channels = channels or [self.default_channel]
        results = []

        for channel in channels:
            success = await send_notification(
                channel=channel,
                user_id=user_id,
                subject=subject,
                message=message,
                metadata=metadata,
            )
            results.append(
                NotificationResult(
                    success=success,
                    channel=channel,
                    error=None if success else "Delivery failed",
                )
            )

        return results


# Default service instance
_service: NotificationService | None = None


def get_notification_service() -> NotificationService:
    """Get the notification service singleton."""
    global _service
    if _service is None:
        _service = NotificationService()
    return _service
