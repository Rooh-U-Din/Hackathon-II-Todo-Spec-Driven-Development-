# Research: Todo AI Chatbot (Phase III)

**Feature Branch**: `003-todo-ai-chatbot`
**Date**: 2025-12-19
**Status**: Complete

## Research Topics

### 1. OpenAI Agents SDK for Tool-Based AI Agents

**Decision**: Use OpenAI Agents SDK with `@function_tool` decorator for tool definitions

**Rationale**:
- Native support for custom tools via Python decorators
- Built-in session management for conversation history
- Structured error handling with specific exception types
- MCP server integration via `MCPServerStdio` or `MCPServerStreamableHttp`

**Alternatives Considered**:
- LangChain: More complex, overkill for our simple CRUD use case
- Raw OpenAI API: Would require manual tool call handling and conversation management
- Anthropic Claude API: Not mentioned in constitution; OpenAI Agents SDK specified

**Key Patterns**:

```python
from agents import Agent, Runner, function_tool

@function_tool
async def add_task(user_id: str, title: str, description: str = "") -> dict:
    """Create a new task for the authenticated user."""
    # Implementation calls existing task service
    return {"task_id": "...", "status": "created", "title": title}

agent = Agent(
    name="Todo Assistant",
    instructions="Help users manage tasks via natural language.",
    tools=[add_task, list_tasks, complete_task, delete_task, update_task],
)

result = await Runner.run(agent, user_message, max_turns=5)
```

### 2. MCP Server Architecture for Task Operations

**Decision**: Use FastMCP Python SDK with stateless design pattern

**Rationale**:
- FastMCP provides simple `@mcp.tool()` decorator for tool definitions
- Type hints auto-generate JSON schemas for tool parameters
- Supports stdio (local) and HTTP transports (production)
- Stateless design aligns with FR-010 requirement

**Alternatives Considered**:
- Custom tool handlers: More code, less standardization
- REST API direct calls: Bypasses MCP architecture specified in requirements
- GraphQL: More complexity than needed for 5 CRUD operations

**Key Patterns**:

```python
from fastmcp import FastMCP
from pydantic import BaseModel

mcp = FastMCP(name="TodoMCPServer")

@mcp.tool()
async def add_task(user_id: str, title: str, description: str = "") -> dict:
    """Add a new task to the user's todo list."""
    # Delegate to existing task service
    task = await task_service.create(user_id, title, description)
    return {"task_id": str(task.id), "status": "created", "title": task.title}
```

### 3. Conversation History Management

**Decision**: Use SQLModel entities (Conversation, Message) with database persistence

**Rationale**:
- Aligns with existing Phase II ORM pattern (SQLModel)
- Maintains stateless server architecture (FR-010)
- Supports FR-011 context limiting (last 50 messages)
- Integrates with Neon PostgreSQL already in use

**Alternatives Considered**:
- OpenAI Sessions API: External dependency, less control over data
- Redis for ephemeral storage: Adds new dependency
- In-memory with file backup: Not suitable for multi-instance deployment

**Key Patterns**:

```python
# Conversation Flow (stateless per request):
# 1. Receive message with user_id
# 2. Get or create Conversation for user
# 3. Load recent messages (limit 50) for AI context
# 4. Store user message before AI processing
# 5. Execute AI agent with MCP tools
# 6. Store AI response
# 7. Return response to client
```

### 4. Integration with Phase II Task Service

**Decision**: MCP tools delegate to existing `app.services.tasks` functions

**Rationale**:
- Reuses battle-tested CRUD logic from Phase II
- Maintains data consistency (same database, same models)
- Respects constitution constraint: "Phase II code MUST NOT be modified"
- User isolation already enforced by task service

**Alternatives Considered**:
- Duplicate task logic in MCP tools: Violates DRY, risks inconsistency
- Direct database access from MCP: Bypasses validation in service layer
- New task API: Redundant with existing Phase II REST API

**Key Patterns**:

```python
# MCP tool delegates to existing service
from app.services.tasks import create_task, get_user_tasks

@mcp.tool()
async def add_task(user_id: str, title: str, description: str = "") -> dict:
    task_data = TaskCreate(title=title, description=description)
    task = create_task(session, UUID(user_id), task_data)
    return {"task_id": str(task.id), "status": "created", "title": task.title}
```

### 5. Error Handling Strategy

**Decision**: Multi-layer error handling with user-friendly messages

**Rationale**:
- Tool-level: Return structured error objects (not exceptions)
- Agent-level: Catch `MaxTurnsExceeded`, `ModelBehaviorError`
- API-level: Return 500 with generic message, log details internally
- Aligns with FR-009 and SC-008

**Error Categories**:

| Error Type | Handling | User Message |
|------------|----------|--------------|
| Task not found | Return error in tool response | "I couldn't find that task" |
| Auth failure | HTTP 401 before agent runs | "Please sign in to continue" |
| AI service down | Catch exception, return 503 | "Service temporarily unavailable" |
| Max turns exceeded | Catch, return partial result | "Let me know if you need more help" |

### 6. Frontend Chat UI Approach

**Decision**: Use React chat components in Next.js App Router

**Rationale**:
- Aligns with existing Phase II frontend (Next.js 14+)
- App Router supports server components and streaming
- No additional framework dependencies needed
- Constitution mentions "OpenAI ChatKit" but simple React components suffice

**Alternatives Considered**:
- OpenAI ChatKit: Additional dependency, may conflict with existing styling
- Third-party chat widget: Less control, potential security concerns
- WebSocket real-time: Excluded by constitution (Phase I, II constraint)

## Dependencies to Add

| Package | Version | Purpose |
|---------|---------|---------|
| openai-agents | ^0.1.x | AI agent framework with tool support |
| fastmcp | ^0.1.x | MCP server SDK |
| pydantic | ^2.x | Already in use; for tool schemas |

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
│                     /app/(dashboard)/chat/page.tsx           │
└──────────────────────────┬──────────────────────────────────┘
                           │ POST /api/{user_id}/chat
                           │ Authorization: Bearer <jwt>
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (FastAPI)                          │
│  /app/api/chat.py                                           │
│  1. Validate JWT                                            │
│  2. Load conversation history (last 50)                     │
│  3. Store user message                                      │
│  4. Execute OpenAI Agent with MCP tools                     │
│  5. Store AI response                                       │
│  6. Return response                                         │
└──────────────────────────┬──────────────────────────────────┘
                           │ Tool calls
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   MCP Server (FastMCP)                       │
│  /app/mcp/tools.py                                          │
│  - add_task                                                 │
│  - list_tasks                                               │
│  - complete_task                                            │
│  - delete_task                                              │
│  - update_task                                              │
└──────────────────────────┬──────────────────────────────────┘
                           │ Delegates to
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Existing Task Service (Phase II)                │
│  /app/services/tasks.py                                     │
│  - create_task()                                            │
│  - get_user_tasks()                                         │
│  - update_task()                                            │
│  - delete_task()                                            │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Neon PostgreSQL (Phase II)                      │
│  Tables: users, tasks, conversations, messages               │
└─────────────────────────────────────────────────────────────┘
```

## Open Questions Resolved

1. **Q: Should MCP server run as separate process or in-process?**
   A: In-process using function tools directly; MCP server pattern is conceptual (tools exposed via `@function_tool` decorator, not separate server)

2. **Q: How to handle long-running AI responses?**
   A: Set reasonable timeout (10s per FR-010), return partial response on timeout

3. **Q: How to identify tasks by name vs ID?**
   A: AI agent uses `list_tasks` first, then operates on task_id; fuzzy matching handled by AI reasoning

## Next Steps

- Phase 1: Generate data-model.md with Conversation and Message entities
- Phase 1: Generate API contracts for POST /api/{user_id}/chat
- Phase 1: Generate quickstart.md with setup instructions
