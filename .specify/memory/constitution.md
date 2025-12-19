<!--
  Sync Impact Report
  ==================
  Version change: 1.1.0 → 1.2.0
  Bump rationale: MINOR - Added Phase III scope definition and technology stack (new phase gate extension)

  Modified principles:
  - None - all existing Phase I principles preserved

  Added sections:
  - "Included Scope (Phase III)" under Scope Definition
  - Phase III technology stack table
  - Phase III MCP tools specification
  - Phase III transition gate in Phase Gate section

  Removed sections:
  - None

  Templates requiring updates:
  - .specify/templates/plan-template.md ✅ (no conflicts; Phase III uses same structure)
  - .specify/templates/spec-template.md ✅ (no conflicts)
  - .specify/templates/tasks-template.md ✅ (structure compatible)

  Follow-up TODOs: None
-->

# Todo Application Constitution

**Document Status**: Authoritative / Binding
**Applies To**: Phase I (core), Phase II and Phase III (extended scope)
**Execution Agent**: Claude Code (AI Engineer)
**Authoring Authority**: Human Architect (Specs Only)
**Project Category**: Hobby

## Core Principles

### I. Spec-Driven Development

All development MUST follow Spec-Driven Development (SDD) methodology.

**Mandatory Rules:**
- Humans SHALL write specifications in Markdown
- Humans SHALL NOT write, edit, or patch any application code
- Claude Code SHALL generate 100% of the implementation
- All defects or undesired behavior SHALL be resolved by updating specifications, not by modifying code
- Claude Code SHALL execute only based on written specifications
- Claude Code SHALL NOT add features beyond defined specs
- Assumptions, inferred features, or speculative enhancements are strictly prohibited

### II. Human Constraints

Humans MUST NOT:
- Write or modify `.py`, `.ts`, `.tsx` source code files
- Insert logic directly into source code
- Perform manual bug fixes
- Bypass or contradict written specifications

Humans MAY ONLY:
- Create and update Markdown specifications
- Update this Constitution
- Review generated output
- Re-run Claude Code with revised specs

**Violation Consequence:** Any violation invalidates the affected Phase.

### III. AI Obligations

Claude Code MUST:
- Read all spec files before any implementation
- Implement only explicitly defined behavior
- Respect all scope limitations
- Produce clean, readable code following language idioms
- Avoid unnecessary complexity

Claude Code MUST NOT:
- Add features outside defined specs
- Introduce functionality not permitted by the current Phase

### IV. No External Dependencies (Phase I Only)

**Mandatory Rules (Phase I):**
- No third-party libraries are allowed
- Only Python standard library is permitted
- No network operations
- No file I/O (except specification reads during development)
- No asynchronous programming

**Phase II and Phase III**: External dependencies are permitted as defined in Phase-specific scope.

### V. Data Lifetime

**Phase I:**
- All application data SHALL exist only in memory during runtime
- All data SHALL be destroyed upon program termination
- Persistence of any form is strictly forbidden

**Phase II and Phase III:**
- Database persistence is REQUIRED via Neon Serverless PostgreSQL
- All data operations MUST go through the defined ORM (SQLModel)

## Technical Standards

### VI. Code Quality

Generated code MUST:
- Target Python 3.13 or later (backend)
- Target TypeScript 5.x or later (frontend)
- Use clear functional decomposition
- Follow consistent naming conventions
- Avoid global mutable state where reasonably possible
- Include comments only where logic is non-obvious

Premature optimization is not permitted.

### VII. Interface Standards

**Phase I (CLI):**
- Present a clear, numbered menu interface
- Use human-readable prompts
- Display tasks in a clean, structured format
- Handle invalid input gracefully

**Phase II (Web):**
- REST API endpoints per OpenAPI specification
- Next.js App Router for frontend
- Responsive design (320px to 1920px)

**Phase III (Chat):**
- Natural language conversational interface
- AI agent processes user messages via MCP tools
- Friendly confirmations and error handling

All interfaces MUST NOT:
- Crash due to user input
- Expose stack traces or internal errors to users

### VIII. Error Handling

- All user-facing errors SHALL be handled gracefully
- Invalid task identifiers SHALL result in clear messages
- Internal exceptions SHALL NOT be exposed to users
- HTTP 401 for authentication failures; HTTP 404 for not found (without leaking existence)

## Process Standards

### IX. Specification Evolution

If behavior is incorrect or incomplete:
1. The missing or ambiguous requirement SHALL be identified
2. The relevant specification SHALL be updated
3. Claude Code SHALL be re-executed with the updated spec

Direct code modification is strictly forbidden.

### X. Phase Gate

**Phase I Completion:**
- All specified features are implemented
- No excluded functionality exists
- All rules in this Constitution are satisfied
- The system can be explained and evaluated using specs alone

**Transition to Phase II** is permitted only after Phase I is:
- Functionally complete
- Stable under normal usage
- Fully compliant with this Constitution

**Transition to Phase III** is permitted only after Phase II is:
- Functionally complete (all user stories implemented)
- Authentication and task CRUD operational
- Database persistence verified

## Scope Definition

### Included Scope (Phase I)

- Python-based console (CLI) application
- Single-user operation
- In-memory task storage
- Full CRUD operations on Todo tasks

### Included Scope (Phase II)

- Full-stack web application (frontend + backend)
- Multi-user operation with authentication
- Persistent storage via Neon PostgreSQL
- REST API with JWT authentication

**Phase II Technology Stack:**

| Layer | Technology | Notes |
|-------|------------|-------|
| Frontend | Next.js 14+ (App Router) | TypeScript, React |
| Backend | Python FastAPI | REST API |
| ORM | SQLModel | Task, User models |
| Database | Neon Serverless PostgreSQL | Persistent storage |
| Authentication | Better Auth + JWT | User identity |

### Included Scope (Phase III)

- AI-powered chatbot for task management
- Conversational interface for all CRUD operations
- MCP server architecture exposing task operations as tools
- Stateless chat endpoint with database persistence for conversations

**Phase III Technology Stack:**

| Layer | Technology | Notes |
|-------|------------|-------|
| Frontend | OpenAI ChatKit | Chat UI for task management |
| Backend | Python FastAPI | Chat endpoint, MCP server integration |
| AI Framework | OpenAI Agents SDK | NLP reasoning, tool execution |
| MCP Server | Official MCP SDK | Exposes task operations as tools |
| ORM | SQLModel | Task, Conversation, Message models |
| Database | Neon Serverless PostgreSQL | Conversation and task storage |
| Authentication | Better Auth + JWT | User context for API calls |
| Spec-Driven Dev | Claude Code + Spec-Kit Plus | Follow specs, no manual coding |

**Phase III MCP Tools:**

| Tool | Purpose | Input Parameters | Returns |
|------|---------|------------------|---------|
| add_task | Create a new task | user_id (str), title (str), description (opt) | task_id, status, title |
| list_tasks | Retrieve tasks | user_id (str), status (opt: all/pending/completed) | Array of task objects |
| complete_task | Mark task complete | user_id (str), task_id (int) | task_id, status, title |
| delete_task | Delete a task | user_id (str), task_id (int) | task_id, status, title |
| update_task | Modify task | user_id (str), task_id (int), title (opt), description (opt) | task_id, status, title |

**Phase III Conversation Flow (Stateless):**

1. Receive user message
2. Fetch conversation history from database
3. Store user message
4. Run AI agent with MCP tools
5. Store assistant response
6. Return response to frontend

**Phase III Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/{user_id}/chat | Send message, get AI response, execute MCP tools |

### Explicitly Excluded Scope (All Phases)

- Docker, Kubernetes, or cloud orchestration
- Background job queues (Phase I, II)
- Real-time websockets (Phase I, II)
- Multi-tenant enterprise features

## Governance

This Constitution supersedes all other practices for all Phase development.

**Amendment Procedure:**
1. Proposed changes MUST be documented in Markdown
2. Changes require explicit approval from the Human Architect
3. All amendments MUST include rationale and migration plan
4. Version number MUST be updated according to semantic versioning

**Versioning Policy:**
- MAJOR: Backward incompatible governance/principle removals or redefinitions
- MINOR: New principle/section added or materially expanded guidance
- PATCH: Clarifications, wording, typo fixes, non-semantic refinements

**Compliance Review:**
- All implementations must verify compliance with this Constitution
- Complexity must be justified against the simplicity principle
- Constitution checks are mandatory gates in the planning phase

**Version**: 1.2.0 | **Ratified**: 2025-12-18 | **Last Amended**: 2025-12-19
