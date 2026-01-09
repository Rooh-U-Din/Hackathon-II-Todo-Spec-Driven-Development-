# Quickstart: Todo AI Chatbot (Phase III)

**Feature Branch**: `003-todo-ai-chatbot`
**Prerequisites**: Phase II fully operational (authentication, task CRUD, database)

## Overview

Phase III adds an AI-powered chatbot interface for natural language task management. Users can create, view, complete, update, and delete tasks by chatting with an AI assistant.

## Setup Steps

### 1. Install New Dependencies

```bash
cd backend
pip install openai-agents fastmcp
```

Add to `requirements.txt`:
```
openai-agents>=0.1.0
fastmcp>=0.1.0
```

### 2. Add OpenAI API Key

Add to `.env`:
```
OPENAI_API_KEY=sk-your-openai-api-key-here
```

Update `backend/app/config.py` to load:
```python
OPENAI_API_KEY: str = Field(default="")
```

### 3. Create Database Tables

Run migration to add `conversations` and `messages` tables:

```bash
cd backend
alembic revision --autogenerate -m "Add conversation and message tables"
alembic upgrade head
```

### 4. Verify Phase II is Running

Ensure Phase II backend and frontend are operational:

```bash
# Terminal 1: Backend
cd backend
uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 5. Test Chat Endpoint

After implementing the chat API:

```bash
# Get a JWT token via Phase II login
TOKEN="your-jwt-token"
USER_ID="your-user-id"

# Send a chat message
curl -X POST "http://localhost:8000/api/${USER_ID}/chat" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"message": "Add a task to buy groceries"}'
```

Expected response:
```json
{
  "message": "I've added 'buy groceries' to your task list.",
  "conversation_id": "660e8400-e29b-41d4-a716-446655440001"
}
```

## Project Structure (Phase III Additions)

```
backend/
├── app/
│   ├── api/
│   │   └── chat.py          # NEW: Chat endpoint
│   ├── models/
│   │   ├── conversation.py  # NEW: Conversation entity
│   │   └── message.py       # NEW: Message entity
│   ├── services/
│   │   ├── chat.py          # NEW: Chat orchestration service
│   │   └── conversation.py  # NEW: Conversation CRUD
│   └── mcp/
│       └── tools.py         # NEW: MCP tool definitions

frontend/
├── src/
│   ├── app/
│   │   └── (dashboard)/
│   │       └── chat/
│   │           └── page.tsx # NEW: Chat interface
│   ├── components/
│   │   ├── ChatInput.tsx    # NEW: Message input component
│   │   └── ChatMessages.tsx # NEW: Message list component
│   └── hooks/
│       └── useChat.ts       # NEW: Chat state management
```

## Key Implementation Files

| File | Purpose |
|------|---------|
| `backend/app/api/chat.py` | POST /api/{user_id}/chat endpoint |
| `backend/app/mcp/tools.py` | MCP tools (add_task, list_tasks, etc.) |
| `backend/app/services/chat.py` | AI agent execution and orchestration |
| `backend/app/services/conversation.py` | Conversation/message CRUD |
| `frontend/src/app/(dashboard)/chat/page.tsx` | Chat UI page |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for AI agent |
| `DATABASE_URL` | Yes | (From Phase II) Neon PostgreSQL connection |
| `BETTER_AUTH_SECRET` | Yes | (From Phase II) JWT signing secret |

## Testing the Feature

### Manual Testing Flow

1. Sign in to the app (Phase II auth)
2. Navigate to `/chat`
3. Type: "Add a task to buy groceries"
4. Verify: AI confirms task creation
5. Type: "Show me my tasks"
6. Verify: AI lists tasks including "buy groceries"
7. Type: "Mark groceries as complete"
8. Verify: AI confirms completion
9. Navigate to `/tasks` (Phase II)
10. Verify: Task shows as completed in Phase II UI

### API Testing

```bash
# Create task
curl -X POST "http://localhost:8000/api/${USER_ID}/chat" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"message": "Add a task: Review quarterly report"}'

# List tasks
curl -X POST "http://localhost:8000/api/${USER_ID}/chat" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"message": "What are my pending tasks?"}'

# Complete task
curl -X POST "http://localhost:8000/api/${USER_ID}/chat" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"message": "Mark the quarterly report task as done"}'
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Invalid API key" | Check `OPENAI_API_KEY` in `.env` |
| "Conversation not found" | Omit `conversation_id` to start new conversation |
| "Task not found" | Use `list_tasks` first to see available tasks |
| AI timeout | Check OpenAI service status; retry after delay |
| Auth error 401 | Token expired; re-login via Phase II |

## Success Criteria Verification

| Criterion | How to Verify |
|-----------|---------------|
| SC-001: Task creation < 5s | Time from send to confirmation |
| SC-002: Task list < 3s | Time to display tasks |
| SC-003: 90% intent accuracy | Test varied phrasings |
| SC-004: Sync with Phase II | Check /tasks page after chat operation |
| SC-005: History load < 2s | Return to chat, measure load time |
