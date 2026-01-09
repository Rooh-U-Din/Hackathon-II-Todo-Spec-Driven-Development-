# Tasks: Todo AI Chatbot (Phase III)

**Input**: Design documents from `/specs/003-todo-ai-chatbot/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in specification. Tests omitted per task generation rules.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/app/` (Python/FastAPI)
- **Frontend**: `frontend/src/` (TypeScript/Next.js)
- Paths follow existing Phase II structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add new dependencies and configuration for Phase III

- [x] T001 Add openai-agents and fastmcp to backend/requirements.txt
- [x] T002 Add OPENAI_API_KEY to backend/app/config.py Settings class
- [x] T003 [P] Create backend/app/mcp/__init__.py package initializer
- [x] T004 [P] Update backend/.env.example with OPENAI_API_KEY placeholder

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core models and services that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create Conversation model in backend/app/models/conversation.py
- [x] T006 Create Message model in backend/app/models/message.py
- [x] T007 Export new models in backend/app/models/__init__.py
- [x] T008 Create database migration for conversations and messages tables
- [x] T009 Create conversation service with get_or_create and message CRUD in backend/app/services/conversation.py
- [x] T010 Create chat service skeleton with agent setup in backend/app/services/chat.py
- [x] T011 Create chat API router skeleton in backend/app/api/chat.py
- [x] T012 Register chat router in backend/app/main.py

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 & 2 - Task Creation and Viewing via Chat (Priority: P1)

**Goal**: Users can create tasks and view their task list via natural language chat

**Independent Test**: Send "Add a task to buy groceries" and verify task created; Send "Show my tasks" and verify list returned

### Implementation for US1 & US2 (Combined - both P1)

- [x] T013 [P] [US1] Implement add_task MCP tool in backend/app/mcp/tools.py
- [x] T014 [P] [US2] Implement list_tasks MCP tool in backend/app/mcp/tools.py
- [x] T015 [US1] Configure AI agent with add_task tool and system prompt in backend/app/services/chat.py
- [x] T016 [US2] Add list_tasks tool to AI agent configuration in backend/app/services/chat.py
- [x] T017 Implement full chat endpoint logic (auth, conversation, agent execution) in backend/app/api/chat.py
- [x] T018 Add user ID validation (must match JWT subject) in backend/app/api/chat.py
- [x] T019 Add error handling for AI service errors (503 response) in backend/app/api/chat.py
- [x] T020 [P] Create chat page route in frontend/src/app/(dashboard)/chat/page.tsx
- [x] T021 [P] Create ChatInput component in frontend/src/components/ChatInput.tsx
- [x] T022 [P] Create ChatMessage component in frontend/src/components/ChatMessage.tsx
- [x] T023 Create ChatMessages container component in frontend/src/components/ChatMessages.tsx
- [x] T024 Create useChat hook for state management in frontend/src/hooks/useChat.ts
- [x] T025 Add sendChatMessage function to frontend/src/lib/api.ts
- [x] T026 Add chat link to dashboard navigation in frontend/src/app/(dashboard)/layout.tsx

**Checkpoint**: Users can create tasks and view tasks via chat - MVP complete

---

## Phase 4: User Story 3 & 4 - Complete and Delete Tasks via Chat (Priority: P2)

**Goal**: Users can mark tasks complete and delete tasks via natural language chat

**Independent Test**: Create a task, send "Mark [task] as complete" and verify status changes; Send "Delete [task]" and verify removal

### Implementation for US3 & US4 (Combined - both P2)

- [x] T027 [P] [US3] Implement complete_task MCP tool in backend/app/mcp/tools.py
- [x] T028 [P] [US4] Implement delete_task MCP tool in backend/app/mcp/tools.py
- [x] T029 [US3] Add complete_task tool to AI agent configuration in backend/app/services/chat.py
- [x] T030 [US4] Add delete_task tool to AI agent configuration in backend/app/services/chat.py
- [x] T031 Update AI system prompt with examples for complete and delete intents in backend/app/services/chat.py

**Checkpoint**: Users can complete and delete tasks via chat

---

## Phase 5: User Story 5 - Update Tasks via Chat (Priority: P3)

**Goal**: Users can update task titles and descriptions via natural language chat

**Independent Test**: Create a task, send "Rename [task] to [new name]" and verify title changes

### Implementation for US5

- [x] T032 [US5] Implement update_task MCP tool in backend/app/mcp/tools.py
- [x] T033 [US5] Add update_task tool to AI agent configuration in backend/app/services/chat.py
- [x] T034 [US5] Update AI system prompt with examples for update intents in backend/app/services/chat.py

**Checkpoint**: Users can update tasks via chat

---

## Phase 6: User Story 6 - Conversation History Persistence (Priority: P3)

**Goal**: Users can see previous conversation messages when returning to chat

**Independent Test**: Have a conversation, navigate away, return to chat and verify previous messages are visible

### Implementation for US6

- [x] T035 [US6] Implement GET /api/{user_id}/conversations endpoint in backend/app/api/chat.py
- [x] T036 [US6] Implement GET /api/{user_id}/conversations/{id}/messages endpoint in backend/app/api/chat.py
- [x] T037 [US6] Add getConversationMessages function to frontend/src/lib/api.ts
- [x] T038 [US6] Update useChat hook to load history on mount in frontend/src/hooks/useChat.ts
- [x] T039 [US6] Display loading state while fetching history in frontend/src/app/(dashboard)/chat/page.tsx

**Checkpoint**: Conversation history persists across sessions

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T040 [P] Add loading spinner/state during AI response in frontend/src/components/ChatMessages.tsx
- [x] T041 [P] Add error display component for AI failures in frontend/src/components/ChatMessages.tsx
- [x] T042 Implement context window limiting (50 messages) in backend/app/services/chat.py
- [x] T043 Add typing indicator while AI is processing in frontend/src/components/ChatInput.tsx
- [x] T044 Run quickstart.md validation scenarios manually (documented for user testing)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **US1 & US2 (Phase 3)**: Depends on Foundational - core MVP
- **US3 & US4 (Phase 4)**: Depends on Foundational - can run parallel to Phase 3
- **US5 (Phase 5)**: Depends on Foundational - can run parallel to Phases 3-4
- **US6 (Phase 6)**: Depends on Foundational - can run parallel to Phases 3-5
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

| Story | Priority | Depends On | Can Start After |
|-------|----------|------------|-----------------|
| US1 (Create) | P1 | Foundational | Phase 2 complete |
| US2 (View) | P1 | Foundational | Phase 2 complete |
| US3 (Complete) | P2 | Foundational | Phase 2 complete |
| US4 (Delete) | P2 | Foundational | Phase 2 complete |
| US5 (Update) | P3 | Foundational | Phase 2 complete |
| US6 (History) | P3 | Foundational | Phase 2 complete |

### Within Each Phase

- MCP tools can be implemented in parallel (different tools = different code paths)
- Frontend components can be implemented in parallel (different files)
- Services depend on models being complete
- API endpoints depend on services being complete

### Parallel Opportunities

**Phase 1 (Setup):**
```
T003 [P] Create mcp/__init__.py
T004 [P] Update .env.example
```

**Phase 3 (US1 & US2):**
```
T013 [P] add_task MCP tool
T014 [P] list_tasks MCP tool
T020 [P] Chat page route
T021 [P] ChatInput component
T022 [P] ChatMessage component
```

**Phase 4 (US3 & US4):**
```
T027 [P] complete_task MCP tool
T028 [P] delete_task MCP tool
```

---

## Implementation Strategy

### MVP First (US1 + US2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 & 2
4. **STOP and VALIDATE**: Test task creation and viewing via chat
5. Deploy/demo if ready - this is the MVP!

### Incremental Delivery

| Increment | Stories | Value Delivered |
|-----------|---------|-----------------|
| MVP | US1 + US2 | Create and view tasks via chat |
| +1 | US3 + US4 | Complete and delete tasks via chat |
| +2 | US5 | Update tasks via chat (full CRUD) |
| +3 | US6 | Conversation persistence |
| +4 | Polish | Loading states, error handling |

### Parallel Team Strategy

With multiple developers after Foundational phase:

- **Developer A**: US1 + US2 (backend MCP tools + chat service)
- **Developer B**: US1 + US2 (frontend components + hooks)
- **Developer C**: US3 + US4 (MCP tools for complete/delete)

---

## Task Summary

| Phase | Tasks | Parallel Tasks |
|-------|-------|----------------|
| Setup | 4 | 2 |
| Foundational | 8 | 0 |
| US1 & US2 | 14 | 5 |
| US3 & US4 | 5 | 2 |
| US5 | 3 | 0 |
| US6 | 5 | 0 |
| Polish | 5 | 2 |
| **Total** | **44** | **11** |

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- MCP tools delegate to existing Phase II task service (no new DB logic)
- All stories share the same chat endpoint; tools are added incrementally
