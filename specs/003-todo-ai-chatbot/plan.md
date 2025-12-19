# Implementation Plan: Todo AI Chatbot (Phase III)

**Branch**: `003-todo-ai-chatbot` | **Date**: 2025-12-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-todo-ai-chatbot/spec.md`

## Summary

Phase III adds an AI-powered chatbot interface to the existing Todo application. Users interact via natural language to perform task CRUD operations. The architecture uses OpenAI Agents SDK for AI reasoning and FastMCP for tool definitions, with a stateless server design that persists all conversation state in the database.

## Technical Context

**Language/Version**: Python 3.13 (backend), TypeScript 5.x (frontend)
**Primary Dependencies**: FastAPI, OpenAI Agents SDK, FastMCP, SQLModel
**Storage**: Neon Serverless PostgreSQL (existing from Phase II)
**Testing**: pytest (backend), Jest/Playwright (frontend)
**Target Platform**: Web application (Linux server for backend, modern browsers for frontend)
**Project Type**: Web (frontend + backend)
**Performance Goals**: Task creation < 5s, task list < 3s, 100 concurrent users
**Constraints**: Stateless server, JWT auth, Phase II code preserved
**Scale/Scope**: Single-tenant, existing user base from Phase II

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven Development | PASS | All implementation derived from spec.md |
| II. Human Constraints | PASS | Human writes specs only; Claude generates code |
| III. AI Obligations | PASS | Implementation follows spec exactly |
| IV. No External Dependencies | N/A | Phase III allows external deps per constitution |
| V. Data Lifetime | PASS | Database persistence via Neon PostgreSQL |
| VI. Code Quality | PASS | Python 3.13, TypeScript 5.x, clear decomposition |
| VII. Interface Standards | PASS | Natural language chat interface with friendly responses |
| VIII. Error Handling | PASS | Graceful errors without stack traces (FR-009) |
| IX. Specification Evolution | PASS | Behavior changes via spec updates only |
| X. Phase Gate | PASS | Phase II complete; Phase III scope defined |

**Constitution Re-check (Post Phase 1)**:
- [x] All design decisions align with constitution principles
- [x] No features added beyond spec scope
- [x] Phase II code remains unmodified (MCP tools delegate to existing services)

## Project Structure

### Documentation (this feature)

```text
specs/003-todo-ai-chatbot/
├── plan.md              # This file
├── research.md          # Phase 0: Technology decisions
├── data-model.md        # Phase 1: Conversation, Message entities
├── quickstart.md        # Phase 1: Setup instructions
├── contracts/           # Phase 1: API contracts
│   ├── chat-api.yaml    # OpenAPI spec for chat endpoint
│   └── mcp-tools.md     # MCP tool definitions
└── tasks.md             # Phase 2: Implementation tasks (from /sp.tasks)
```

### Source Code (repository root)

```text
# Phase I (PRESERVED - DO NOT MODIFY)
src/
├── models/
├── services/
├── cli/
└── lib/

# Phase II (PRESERVED - DO NOT MODIFY)
backend/
├── app/
│   ├── main.py              # FastAPI entry
│   ├── config.py            # Environment config
│   ├── models/              # SQLModel entities (User, Task)
│   ├── api/                 # Route handlers (auth, tasks)
│   ├── services/            # Business logic
│   └── db/                  # Database session
└── tests/

# Phase III Additions
backend/
├── app/
│   ├── api/
│   │   └── chat.py          # NEW: Chat endpoint
│   ├── models/
│   │   ├── conversation.py  # NEW: Conversation entity
│   │   └── message.py       # NEW: Message entity
│   ├── services/
│   │   ├── chat.py          # NEW: Chat orchestration
│   │   └── conversation.py  # NEW: Conversation CRUD
│   └── mcp/
│       └── tools.py         # NEW: MCP tool definitions
└── tests/
    └── test_chat.py         # NEW: Chat endpoint tests

frontend/
├── src/
│   ├── app/
│   │   └── (dashboard)/
│   │       └── chat/
│   │           └── page.tsx # NEW: Chat interface page
│   ├── components/
│   │   ├── ChatInput.tsx    # NEW: Message input
│   │   └── ChatMessages.tsx # NEW: Message list
│   └── hooks/
│       └── useChat.ts       # NEW: Chat state management
└── tests/
    └── chat.spec.ts         # NEW: Chat UI tests
```

**Structure Decision**: Web application structure (Option 2) with Phase III additions layered on Phase II without modification. New files only; existing services reused via delegation.

## Complexity Tracking

> No constitution violations requiring justification.

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| MCP Pattern | In-process tools via @function_tool | Simpler than separate MCP server process |
| AI Framework | OpenAI Agents SDK | Constitution specifies; simpler than LangChain |
| Conversation Storage | Database (SQLModel) | Maintains stateless server architecture |

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
│                   MCP Tools (In-Process)                     │
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
│  (Unchanged - delegation only)                              │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Neon PostgreSQL (Phase II)                      │
│  Tables: users, tasks, conversations (new), messages (new)  │
└─────────────────────────────────────────────────────────────┘
```

## Dependencies to Add

| Package | Version | Purpose |
|---------|---------|---------|
| openai-agents | ^0.1.x | AI agent framework with tool support |
| fastmcp | ^0.1.x | MCP server SDK (for tool decorators) |
| pydantic | ^2.x | Already in use; for tool schemas |

## Key Design Decisions

1. **In-Process MCP Tools**: Tools defined with `@function_tool` decorator, not separate MCP server
2. **Stateless Server**: All state in database; no session memory between requests
3. **Context Window**: Last 50 messages loaded for AI context (FR-011)
4. **Tool Delegation**: MCP tools call existing Phase II task service functions
5. **Error Isolation**: AI errors return friendly messages (FR-009, SC-008)

## Generated Artifacts

| Artifact | Path | Status |
|----------|------|--------|
| Research | [research.md](./research.md) | Complete |
| Data Model | [data-model.md](./data-model.md) | Complete |
| Chat API | [contracts/chat-api.yaml](./contracts/chat-api.yaml) | Complete |
| MCP Tools | [contracts/mcp-tools.md](./contracts/mcp-tools.md) | Complete |
| Quickstart | [quickstart.md](./quickstart.md) | Complete |

## Next Steps

Run `/sp.tasks` to generate implementation tasks from this plan.

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| OpenAI API latency | SC-001/SC-002 not met | Set 10s timeout; return partial response |
| AI misinterprets intent | SC-003 < 90% | Clear system prompt; ask for clarification |
| Token usage costs | Budget overrun | Limit context to 50 messages; monitor usage |
