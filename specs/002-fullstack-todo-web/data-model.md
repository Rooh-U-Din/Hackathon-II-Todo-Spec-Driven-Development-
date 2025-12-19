# Data Model: Full-Stack Todo Web Application (Phase II)

**Date**: 2025-12-18
**Branch**: `002-fullstack-todo-web`
**Database**: Neon Serverless PostgreSQL
**ORM**: SQLModel

## Entity Relationship Diagram

```
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│            User                 │       │            Task                 │
├─────────────────────────────────┤       ├─────────────────────────────────┤
│ id: UUID (PK)                   │       │ id: UUID (PK)                   │
│ email: VARCHAR(255) UNIQUE      │──────<│ user_id: UUID (FK)              │
│ hashed_password: VARCHAR(255)   │       │ title: VARCHAR(200)             │
│ created_at: TIMESTAMP           │       │ description: TEXT (nullable)    │
│ updated_at: TIMESTAMP           │       │ is_completed: BOOLEAN           │
└─────────────────────────────────┘       │ created_at: TIMESTAMP           │
                                          │ updated_at: TIMESTAMP           │
                                          └─────────────────────────────────┘
```

## Entities

### User

Represents an authenticated user of the system.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User's email address |
| hashed_password | VARCHAR(255) | NOT NULL | Bcrypt-hashed password |
| created_at | TIMESTAMP | NOT NULL, default=now() | Account creation time |
| updated_at | TIMESTAMP | NOT NULL, auto-update | Last modification time |

**Validation Rules**:
- Email must be valid format (RFC 5322 compliant)
- Email must be unique across all users
- Password must be minimum 8 characters before hashing
- Password must contain at least one uppercase, lowercase, and digit

**SQLModel Definition**:
```python
from sqlmodel import SQLModel, Field, Relationship
from uuid import UUID, uuid4
from datetime import datetime

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(max_length=255, unique=True, index=True)
    hashed_password: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship
    tasks: list["Task"] = Relationship(back_populates="user", cascade_delete=True)
```

---

### Task

Represents a todo item owned by a user.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique identifier |
| user_id | UUID | FK(users.id), NOT NULL | Owner reference |
| title | VARCHAR(200) | NOT NULL | Task title |
| description | TEXT | nullable | Optional description |
| is_completed | BOOLEAN | NOT NULL, default=false | Completion status |
| created_at | TIMESTAMP | NOT NULL, default=now() | Task creation time |
| updated_at | TIMESTAMP | NOT NULL, auto-update | Last modification time |

**Validation Rules**:
- Title must be 1-200 characters
- Description must be 0-2000 characters (or null)
- User ID must reference an existing user
- is_completed defaults to false

**SQLModel Definition**:
```python
class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True)
    title: str = Field(max_length=200)
    description: str | None = Field(default=None, max_length=2000)
    is_completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship
    user: User = Relationship(back_populates="tasks")
```

---

## Relationships

### User → Task (One-to-Many)

- **Cardinality**: One User has zero or more Tasks
- **Ownership**: Task is owned by exactly one User
- **Cascade**: Deleting a User deletes all their Tasks
- **Navigation**:
  - `user.tasks` returns list of tasks
  - `task.user` returns the owning user

---

## Indexes

| Table | Column(s) | Type | Purpose |
|-------|-----------|------|---------|
| users | email | UNIQUE | Fast email lookup for auth |
| tasks | user_id | B-TREE | Fast task listing by user |
| tasks | (user_id, is_completed) | COMPOSITE | Filtered task queries |

---

## Pydantic Schemas (API DTOs)

### User Schemas

```python
from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str  # Raw password, will be hashed

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: UUID
    email: str
    created_at: datetime

    class Config:
        from_attributes = True
```

### Task Schemas

```python
class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=2000)

class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=2000)
    is_completed: bool | None = None

class TaskResponse(BaseModel):
    id: UUID
    title: str
    description: str | None
    is_completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TaskListResponse(BaseModel):
    tasks: list[TaskResponse]
    total: int
```

---

## State Transitions

### Task Status

```
┌─────────────┐     toggle      ┌─────────────┐
│ Incomplete  │ ◄─────────────► │  Complete   │
│ (default)   │                 │             │
└─────────────┘                 └─────────────┘
```

- New tasks start as **Incomplete** (`is_completed=false`)
- Toggle operation flips between Incomplete and Complete
- No other states exist in Phase II

---

## Database Migrations

Migrations should be managed with Alembic using the **unpooled** connection string.

### Initial Migration Script (Conceptual)

```sql
-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_user_completed ON tasks(user_id, is_completed);
```

---

## Data Integrity Rules

1. **Referential Integrity**: Tasks cannot exist without a valid user
2. **Cascade Delete**: Deleting a user removes all their tasks
3. **Unique Email**: No two users can have the same email address
4. **Auto-timestamps**: `created_at` set on insert; `updated_at` updated on modification
5. **UUID Primary Keys**: Prevents ID enumeration attacks
