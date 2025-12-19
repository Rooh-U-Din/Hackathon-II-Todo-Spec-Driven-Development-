# Data Model: Todo Console Application

**Feature**: 001-todo-cli-crud
**Date**: 2025-12-18
**Source**: [spec.md](./spec.md) Key Entities section

## Entity: Task

### Definition

A Task represents a single todo item that the user wants to track.

### Attributes

| Attribute | Type | Required | Default | Mutable | Description |
|-----------|------|----------|---------|---------|-------------|
| `id` | int | Yes | Auto-generated | No | Unique identifier, starts at 1, increments by 1 |
| `title` | str | Yes | N/A | Yes | Name/summary of the task, must be non-empty |
| `description` | str | No | `""` | Yes | Additional details, can be empty |
| `completed` | bool | No | `False` | Yes | Whether the task is done |

### Validation Rules

| Attribute | Rule | Error Message |
|-----------|------|---------------|
| `title` | Must not be empty (whitespace-only counts as empty) | "Title cannot be empty" |
| `id` | Must be positive integer | N/A (system-generated) |

### State Transitions

```
                    ┌─────────────┐
      create()      │             │
    ─────────────►  │  Incomplete │
                    │ completed=F │
                    │             │
                    └──────┬──────┘
                           │
                           │ toggle()
                           ▼
                    ┌─────────────┐
                    │             │
                    │  Complete   │ ◄────┐
                    │ completed=T │      │
                    │             │      │ toggle()
                    └──────┬──────┘      │
                           │             │
                           └─────────────┘
```

### Python Implementation

```python
from dataclasses import dataclass, field

@dataclass
class Task:
    """Represents a todo item."""
    id: int
    title: str
    description: str = ""
    completed: bool = False
```

### Operations

| Operation | Input | Output | Side Effects |
|-----------|-------|--------|--------------|
| Create | title, description (optional) | Task | Adds to task list, increments ID counter |
| Read (all) | None | List[Task] | None |
| Read (by ID) | id: int | Task or None | None |
| Update | id, title (optional), description (optional) | Task | Modifies task in list |
| Delete | id: int | bool | Removes from list if confirmed |
| Toggle | id: int | Task | Flips completed status |

### Storage

```python
# Module-level storage
tasks: list[Task] = []
_next_id: int = 1
```

### ID Management

- IDs start at 1 (not 0) for user-friendliness
- IDs increment sequentially: 1, 2, 3, ...
- Deleted IDs are never reused
- Example: Create 3 tasks (IDs 1,2,3), delete ID 2, create new task → ID 4

### Lookup Patterns

```python
# Find task by ID
def find_task(task_id: int) -> Task | None:
    for task in tasks:
        if task.id == task_id:
            return task
    return None

# Alternative: list comprehension
task = next((t for t in tasks if t.id == task_id), None)
```

## Relationships

No relationships - single entity model for Phase I.

## Constraints from Constitution

| Constraint | How Enforced |
|------------|--------------|
| In-memory only | tasks list in module scope, no file I/O |
| Data lost on exit | No persistence mechanism |
| No external dependencies | dataclass is standard library |

## Example Data

```python
tasks = [
    Task(id=1, title="Buy groceries", description="Milk, eggs, bread", completed=False),
    Task(id=2, title="Call dentist", description="", completed=True),
    Task(id=3, title="Finish report", description="Q4 summary", completed=False),
]
_next_id = 4
```

**Display Output**:
```
[ ] ID: 1 | Buy groceries
[✓] ID: 2 | Call dentist
[ ] ID: 3 | Finish report
```
