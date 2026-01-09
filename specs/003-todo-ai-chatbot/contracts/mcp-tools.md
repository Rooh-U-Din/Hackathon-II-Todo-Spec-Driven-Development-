# MCP Tools Contract: Todo AI Chatbot

**Feature Branch**: `003-todo-ai-chatbot`
**Date**: 2025-12-19
**Protocol**: Model Context Protocol (MCP)

## Overview

The MCP server exposes 5 tools for task management operations. Each tool is stateless and delegates to the existing Phase II task service.

## Tool Definitions

### add_task

Creates a new task for the authenticated user.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "format": "uuid",
      "description": "ID of the authenticated user"
    },
    "title": {
      "type": "string",
      "minLength": 1,
      "maxLength": 200,
      "description": "Task title"
    },
    "description": {
      "type": "string",
      "maxLength": 2000,
      "description": "Optional task description"
    }
  },
  "required": ["user_id", "title"]
}
```

**Output Schema**:
```json
{
  "type": "object",
  "properties": {
    "task_id": {
      "type": "string",
      "format": "uuid",
      "description": "ID of the created task"
    },
    "status": {
      "type": "string",
      "enum": ["created"],
      "description": "Operation status"
    },
    "title": {
      "type": "string",
      "description": "Title of the created task"
    }
  },
  "required": ["task_id", "status", "title"]
}
```

**Example**:
```
Input:  {"user_id": "550e8400-...", "title": "Buy groceries", "description": "Milk, eggs, bread"}
Output: {"task_id": "660e8400-...", "status": "created", "title": "Buy groceries"}
```

---

### list_tasks

Retrieves tasks for the authenticated user with optional filtering.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "format": "uuid",
      "description": "ID of the authenticated user"
    },
    "status": {
      "type": "string",
      "enum": ["all", "pending", "completed"],
      "default": "all",
      "description": "Filter by completion status"
    }
  },
  "required": ["user_id"]
}
```

**Output Schema**:
```json
{
  "type": "object",
  "properties": {
    "tasks": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {"type": "string", "format": "uuid"},
          "title": {"type": "string"},
          "description": {"type": "string"},
          "is_completed": {"type": "boolean"},
          "created_at": {"type": "string", "format": "date-time"}
        },
        "required": ["id", "title", "is_completed", "created_at"]
      }
    },
    "count": {
      "type": "integer",
      "description": "Number of tasks returned"
    }
  },
  "required": ["tasks", "count"]
}
```

**Example**:
```
Input:  {"user_id": "550e8400-...", "status": "pending"}
Output: {
  "tasks": [
    {"id": "660e8400-...", "title": "Buy groceries", "is_completed": false, "created_at": "2025-12-19T10:00:00Z"},
    {"id": "770e8400-...", "title": "Review report", "is_completed": false, "created_at": "2025-12-19T09:00:00Z"}
  ],
  "count": 2
}
```

---

### complete_task

Marks a task as completed.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "format": "uuid",
      "description": "ID of the authenticated user"
    },
    "task_id": {
      "type": "string",
      "format": "uuid",
      "description": "ID of the task to complete"
    }
  },
  "required": ["user_id", "task_id"]
}
```

**Output Schema**:
```json
{
  "type": "object",
  "properties": {
    "task_id": {
      "type": "string",
      "format": "uuid"
    },
    "status": {
      "type": "string",
      "enum": ["completed", "not_found"],
      "description": "Operation result"
    },
    "title": {
      "type": "string",
      "description": "Title of the completed task (if found)"
    }
  },
  "required": ["task_id", "status"]
}
```

**Example**:
```
Input:  {"user_id": "550e8400-...", "task_id": "660e8400-..."}
Output: {"task_id": "660e8400-...", "status": "completed", "title": "Buy groceries"}
```

**Error Case**:
```
Input:  {"user_id": "550e8400-...", "task_id": "nonexistent"}
Output: {"task_id": "nonexistent", "status": "not_found"}
```

---

### delete_task

Removes a task from the user's list.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "format": "uuid",
      "description": "ID of the authenticated user"
    },
    "task_id": {
      "type": "string",
      "format": "uuid",
      "description": "ID of the task to delete"
    }
  },
  "required": ["user_id", "task_id"]
}
```

**Output Schema**:
```json
{
  "type": "object",
  "properties": {
    "task_id": {
      "type": "string",
      "format": "uuid"
    },
    "status": {
      "type": "string",
      "enum": ["deleted", "not_found"]
    },
    "title": {
      "type": "string",
      "description": "Title of the deleted task (if found)"
    }
  },
  "required": ["task_id", "status"]
}
```

**Example**:
```
Input:  {"user_id": "550e8400-...", "task_id": "660e8400-..."}
Output: {"task_id": "660e8400-...", "status": "deleted", "title": "Buy groceries"}
```

---

### update_task

Modifies task details (title and/or description).

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "format": "uuid",
      "description": "ID of the authenticated user"
    },
    "task_id": {
      "type": "string",
      "format": "uuid",
      "description": "ID of the task to update"
    },
    "title": {
      "type": "string",
      "minLength": 1,
      "maxLength": 200,
      "description": "New task title (optional)"
    },
    "description": {
      "type": "string",
      "maxLength": 2000,
      "description": "New task description (optional)"
    }
  },
  "required": ["user_id", "task_id"]
}
```

**Output Schema**:
```json
{
  "type": "object",
  "properties": {
    "task_id": {
      "type": "string",
      "format": "uuid"
    },
    "status": {
      "type": "string",
      "enum": ["updated", "not_found", "no_changes"]
    },
    "title": {
      "type": "string",
      "description": "Current title after update"
    }
  },
  "required": ["task_id", "status"]
}
```

**Example**:
```
Input:  {"user_id": "550e8400-...", "task_id": "660e8400-...", "title": "Buy organic groceries"}
Output: {"task_id": "660e8400-...", "status": "updated", "title": "Buy organic groceries"}
```

---

## Security Constraints

1. **User Isolation**: All tools require `user_id` parameter; operations are scoped to that user only
2. **No Cross-User Access**: Tools never return tasks belonging to other users
3. **Not Found Behavior**: When a task doesn't exist or belongs to another user, return `"status": "not_found"` without revealing whether the task exists for another user

## Implementation Notes

- Tools delegate to existing `app.services.tasks` functions
- No new database logic in MCP layer
- All tools are synchronous (Phase II services are synchronous)
- Tools return structured JSON, not natural language (AI agent formats responses)
