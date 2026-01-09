# Data Model: Todo AI Chatbot (Phase III)

**Feature Branch**: `003-todo-ai-chatbot`
**Date**: 2025-12-19
**ORM**: SQLModel (consistent with Phase II)

## Entity Overview

Phase III introduces two new entities to support conversation persistence:

| Entity | Description | Relationship |
|--------|-------------|--------------|
| Conversation | Chat session for a user | 1 User : N Conversations |
| Message | Single chat message | 1 Conversation : N Messages |

The existing **Task** entity from Phase II is unchanged and accessed via MCP tools.

## Entity Definitions

### Conversation

Represents a chat session between a user and the AI assistant.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique conversation identifier |
| user_id | UUID | FK → users.id, NOT NULL, indexed | Owner of the conversation |
| created_at | datetime | NOT NULL, default NOW | When conversation started |
| updated_at | datetime | NOT NULL, default NOW | Last activity timestamp |

**Relationships**:
- `user`: Many-to-One → User (back_populates="conversations")
- `messages`: One-to-Many → Message (back_populates="conversation")

**Indexes**:
- `idx_conversations_user_id` on `user_id` (filter by user)
- `idx_conversations_updated_at` on `updated_at` (sort by recent)

### Message

Represents a single message in a conversation (user or assistant).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique message identifier |
| conversation_id | UUID | FK → conversations.id, NOT NULL, indexed | Parent conversation |
| user_id | UUID | FK → users.id, NOT NULL, indexed | Message owner (for isolation) |
| role | str | NOT NULL, enum: "user", "assistant" | Who sent the message |
| content | str | NOT NULL, max 10000 chars | Message text |
| created_at | datetime | NOT NULL, default NOW | When message was sent |

**Relationships**:
- `conversation`: Many-to-One → Conversation (back_populates="messages")
- `user`: Many-to-One → User

**Indexes**:
- `idx_messages_conversation_id` on `conversation_id` (load conversation history)
- `idx_messages_user_id` on `user_id` (user data isolation)
- `idx_messages_created_at` on `created_at` (chronological ordering)

### Task (Existing - Phase II)

No changes to the Task entity. Reference only:

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique task identifier |
| user_id | UUID | Owner of the task |
| title | str | Task title (1-200 chars) |
| description | str | Optional description (max 2000 chars) |
| is_completed | bool | Completion status |
| created_at | datetime | Creation timestamp |
| updated_at | datetime | Last update timestamp |

## SQLModel Definitions

```python
# backend/app/models/conversation.py

from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.message import Message
    from app.models.user import User


class Conversation(SQLModel, table=True):
    """Conversation database model."""

    __tablename__ = "conversations"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    user: "User" = Relationship(back_populates="conversations")
    messages: list["Message"] = Relationship(back_populates="conversation")


class ConversationResponse(SQLModel):
    """Schema for conversation response."""

    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
```

```python
# backend/app/models/message.py

from datetime import datetime
from typing import TYPE_CHECKING, Literal
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.conversation import Conversation
    from app.models.user import User


class Message(SQLModel, table=True):
    """Message database model."""

    __tablename__ = "messages"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    conversation_id: UUID = Field(foreign_key="conversations.id", index=True)
    user_id: UUID = Field(foreign_key="users.id", index=True)
    role: str = Field(max_length=10)  # "user" or "assistant"
    content: str = Field(max_length=10000)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    conversation: "Conversation" = Relationship(back_populates="messages")
    user: "User" = Relationship()


class MessageCreate(SQLModel):
    """Schema for message creation."""

    role: Literal["user", "assistant"]
    content: str = Field(max_length=10000)


class MessageResponse(SQLModel):
    """Schema for message response."""

    id: UUID
    role: str
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}
```

## State Transitions

### Conversation Lifecycle

```
┌─────────────┐
│   Created   │ ← First message from user
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Active    │ ← Messages added, updated_at refreshed
└──────┬──────┘
       │
       ▼ (no deletion in scope)
```

### Message Lifecycle

```
┌─────────────┐
│   Created   │ ← User sends message OR AI responds
└─────────────┘
       │
       (immutable - messages are never updated or deleted)
```

## Validation Rules

### Conversation

- `user_id` must reference existing user
- `updated_at` auto-refreshed when new message added

### Message

- `conversation_id` must reference existing conversation
- `user_id` must match conversation's `user_id` (data isolation)
- `role` must be "user" or "assistant"
- `content` must be non-empty, max 10000 characters

## Query Patterns

### Get or Create Conversation

```python
def get_or_create_conversation(session: Session, user_id: UUID) -> Conversation:
    """Get active conversation or create new one."""
    conversation = session.exec(
        select(Conversation)
        .where(Conversation.user_id == user_id)
        .order_by(Conversation.updated_at.desc())
    ).first()

    if not conversation:
        conversation = Conversation(user_id=user_id)
        session.add(conversation)
        session.commit()
        session.refresh(conversation)

    return conversation
```

### Load Recent Messages (Context Window)

```python
def get_recent_messages(
    session: Session,
    conversation_id: UUID,
    limit: int = 50
) -> list[Message]:
    """Get last N messages for AI context."""
    return list(session.exec(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc())
        .limit(limit)
    ).all())[::-1]  # Reverse to chronological order
```

### Store Message

```python
def create_message(
    session: Session,
    conversation_id: UUID,
    user_id: UUID,
    role: str,
    content: str
) -> Message:
    """Store a new message."""
    message = Message(
        conversation_id=conversation_id,
        user_id=user_id,
        role=role,
        content=content,
    )
    session.add(message)

    # Update conversation timestamp
    conversation = session.get(Conversation, conversation_id)
    if conversation:
        conversation.updated_at = datetime.utcnow()
        session.add(conversation)

    session.commit()
    session.refresh(message)
    return message
```

## Migration Notes

Phase III requires a database migration to add:

1. `conversations` table
2. `messages` table
3. Required indexes

No changes to existing `users` or `tasks` tables (Phase II preserved).
