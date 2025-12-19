---
id: 003
title: Phase III AI Chatbot Addition
stage: constitution
date: 2025-12-19
surface: agent
model: claude-opus-4-5-20251101
feature: none
branch: main
user: architect
command: /sp.constitution
labels: ["constitution", "phase-iii", "ai-chatbot", "mcp"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - null
---

## Prompt

Append to /sp.constitution — Phase 3: Todo AI Chatbot

⚠️ Note: Phase 1 & Phase 2 content remains intact. This addition is only for Phase 3.

Phase III: Todo AI Chatbot
Objective: Transform the Full-Stack Todo App into an AI-powered chatbot that manages tasks via natural language using MCP server architecture.

Features:
- Conversational interface for all task CRUD operations
- AI logic via OpenAI Agents SDK
- Stateless chat endpoint with database persistence
- AI agents use MCP tools to manage tasks
- Friendly confirmations and error handling

Technology Stack:
Layer             Technology                     Notes
Frontend          OpenAI ChatKit                 Chat UI for task management
Backend           Python FastAPI                 Chat endpoint, MCP server integration
AI Framework      OpenAI Agents SDK              NLP reasoning, tool execution
MCP Server        Official MCP SDK               Exposes task operations as tools
ORM               SQLModel                        Task, Conversation, Message models
Database          Neon Serverless PostgreSQL      Conversation and task storage
Authentication    Better Auth + JWT              Auth for user context
Spec-Driven Dev   Claude Code + Spec-Kit Plus   Follow specs, no manual coding

MCP Tools:
Tool          Purpose               Input Parameters                                   Returns
add_task      Create a new task     user_id (str), title (str), description (opt)     task_id, status, title
list_tasks    Retrieve tasks        user_id (str), status (opt: all/pending/completed) Array of task objects
complete_task Mark task complete    user_id (str), task_id (int)                       task_id, status, title
delete_task   Delete a task         user_id (str), task_id (int)                       task_id, status, title
update_task   Modify task           user_id (str), task_id (int), title (opt), description (opt) task_id, status, title

Conversation Flow (Stateless):
1. Receive user message
2. Fetch conversation history from DB
3. Store user message
4. Run AI agent with MCP tools
5. Store assistant response
6. Return response to frontend

Security & Auth:
- JWT required for API calls
- Backend verifies tokens using BETTER_AUTH_SECRET
- Users can only access their own tasks

Endpoints:
Method  Endpoint                 Description
POST    /api/{user_id}/chat      Send message, get AI response, execute MCP tools

Expected Outcomes:
- AI chatbot can manage tasks via natural language
- Conversation state persists across requests
- Handles errors gracefully
- Fully integrated with Phase 1 & Phase 2 features

## Response snapshot

Updated constitution from version 1.1.0 to 1.2.0 (MINOR bump).

**Changes made:**
- Added "Included Scope (Phase III)" section with complete technology stack
- Added Phase III MCP tools specification table
- Added Phase III conversation flow (stateless design)
- Added Phase III endpoint specification
- Updated Phase Gate with transition criteria from Phase II to Phase III
- Updated "Applies To" header to include Phase III
- Extended Human Constraints to include `.ts`, `.tsx` files
- Updated Interface Standards with Phase III (Chat) requirements

**Template compatibility verified:**
- plan-template.md ✅ (no conflicts)
- spec-template.md ✅ (no conflicts)
- tasks-template.md ✅ (structure compatible)

## Outcome

- ✅ Impact: Constitution extended with Phase III scope; version 1.2.0
- 🧪 Tests: N/A (documentation change)
- 📁 Files: .specify/memory/constitution.md updated
- 🔁 Next prompts: /sp.specify for Phase III feature specification
- 🧠 Reflection: Successfully added Phase III without modifying Phase I/II principles; MINOR version bump appropriate for new phase scope

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): standard /sp.constitution
- Next experiment (smallest change to try): N/A
