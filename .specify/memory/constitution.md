<!--
  Sync Impact Report
  ==================
  Version change: 1.3.0 → 1.4.0
  Bump rationale: MINOR - Added Phase V scope definition for Advanced Cloud & Event-Driven Architecture (new phase gate extension)

  Modified principles:
  - None - all existing Phase I, II, III, IV principles preserved
  - Updated references throughout to include Phase V

  Added sections:
  - "Included Scope (Phase V)" under Scope Definition
  - Phase V technology stack table (Dapr, Kafka/Redpanda, consumer microservices)
  - Phase V deliverables specification (extended app, event infrastructure, cloud deployment)
  - Phase V transition gate in Phase Gate section
  - Updated "Explicitly Excluded Scope" to reflect Phase V changes (cloud deployment now included)

  Removed sections:
  - None

  Templates requiring updates:
  - .specify/templates/plan-template.md ✅ (no conflicts; Phase V follows same structure)
  - .specify/templates/spec-template.md ✅ (no conflicts; event-driven specs follow same pattern)
  - .specify/templates/tasks-template.md ✅ (structure compatible; Phase V tasks follow same phases)

  Follow-up TODOs:
  - Add tasks for NFR-07 monitoring requirements (health endpoints, metrics exposure)
  - Clarify "infrastructure abstraction layer" → "Dapr" in spec.md for consistency
-->

# Todo Application Constitution

**Document Status**: Authoritative / Binding
**Applies To**: Phase I (core), Phase II, Phase III, Phase IV, and Phase V (extended scope)
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

**Phase II, Phase III, Phase IV, and Phase V**: External dependencies are permitted as defined in Phase-specific scope.

### V. Data Lifetime

**Phase I:**
- All application data SHALL exist only in memory during runtime
- All data SHALL be destroyed upon program termination
- Persistence of any form is strictly forbidden

**Phase II, Phase III, Phase IV, and Phase V:**
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

**Phase IV (Kubernetes):**
- All deployments MUST be declarative via Helm charts
- Services MUST be accessible within Minikube cluster
- Pods MUST be horizontally scalable via replicas
- No hardcoded environment values in charts

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

**Transition to Phase IV** is permitted only after Phase III is:
- Functionally complete (AI chatbot operational)
- All MCP tools working correctly
- Frontend and backend integrated and stable

**Transition to Phase V** is permitted only after Phase IV is:
- Functionally complete (Kubernetes deployment operational)
- All services running on Minikube
- Helm charts validated and working

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

### Included Scope (Phase IV)

⚠️ **Rule of Preservation:** All Phase I, Phase II, and Phase III specifications, architecture, code, and behavior MUST remain unchanged. Phase IV is strictly an infrastructure and deployment extension.

**Objective:** Deploy the existing Phase III Todo AI Chatbot as a cloud-native application on a local Kubernetes cluster using Minikube, Helm Charts, and AI-assisted DevOps tools. No application-level features or logic may be modified.

**Development Philosophy:** Follow Spec-Driven Infrastructure Automation using the Agentic Dev Stack. Workflow MUST be: Write spec → Generate plan → Break into tasks → Implement via Claude Code / AI tools. Manual infrastructure coding is discouraged unless AI tooling is unavailable.

**Scope Constraints:**
- This phase focuses ONLY on deployment, orchestration, and infrastructure
- Frontend and backend logic from Phase III must be reused as-is
- No changes to APIs, MCP tools, agents, or database schema
- All deployments must be reproducible locally using Minikube
- The system must remain stateless at the server level

**Phase IV Technology Stack:**

| Layer | Technology | Notes |
|-------|------------|-------|
| Containerization | Docker (Docker Desktop) | Multi-stage builds preferred |
| Docker AI | Docker AI Agent (Gordon) | Dockerfile generation, optimization |
| Orchestration | Kubernetes (Minikube) | Local cluster deployment |
| Package Manager | Helm Charts | Declarative deployment configuration |
| AI DevOps | kubectl-ai, kagent | AI-assisted Kubernetes operations |
| Application | Phase III Todo AI Chatbot | Unchanged from Phase III |

**Phase IV Mandatory Requirements:**

1. **Containerization**
   - Containerize frontend (ChatKit-based UI)
   - Containerize backend (FastAPI + OpenAI Agents SDK + MCP server)
   - Prefer multi-stage Docker builds
   - Images must be runnable inside Minikube

2. **Docker AI Usage**
   - Use Docker AI Agent (Gordon) for Dockerfile generation, image optimization, build/run assistance
   - If Gordon is unavailable, use Claude Code to generate Docker commands

3. **Kubernetes Deployment**
   - Deploy the system on a local Minikube cluster
   - Use Kubernetes best practices (Deployments, Services)
   - Support scaling via replicas

4. **Helm Charts (Required)**
   - Create Helm charts for todo-frontend and todo-backend
   - Charts must support configuration via values.yaml
   - No hardcoded environment values

5. **AI-Assisted Kubernetes Operations**
   - Use kubectl-ai for deployment creation, scaling, debugging failing pods
   - Use kagent for cluster health analysis, resource optimization insights

**Phase IV Operational Principles:**
- Infrastructure must be declarative and reproducible
- Helm is the single source of truth for Kubernetes deployment
- AI tools are first-class operators, not optional helpers
- The system must be horizontally scalable
- Server restarts must not affect application state

**Phase IV Deliverables:**

1. GitHub repository containing:
   - /frontend (unchanged application code)
   - /backend (unchanged application code)
   - Dockerfiles for frontend and backend
   - /helm charts for frontend and backend
   - README with Minikube + Helm setup instructions

2. Proof of Deployment:
   - Running pods in Minikube
   - Accessible frontend service
   - Backend service reachable inside cluster

3. AI DevOps Evidence:
   - Documented kubectl-ai usage
   - Documented kagent usage
   - Docker AI (Gordon) usage where available

**Phase IV Success Criteria:**
- Application runs fully on Minikube
- No Phase III functionality is broken
- Helm charts control all deployments
- AI tools are actively used for DevOps tasks
- Deployment can be reproduced from README

### Included Scope (Phase V)

⚠️ **Rule of Preservation:** All Phase I-IV specifications, architecture, code, and behavior MUST remain unchanged. Phase V extends Phase IV with advanced features and cloud deployment.

**Objective:** Transform the Todo AI Chatbot into a production-grade, event-driven microservices system with advanced task features (recurring tasks, reminders, priorities, tags) and cloud Kubernetes deployment capabilities.

**Development Philosophy:** Continue Spec-Driven Development with event-driven architecture patterns. All new features must be backward compatible with Phase IV.

**Scope Constraints:**
- Extends Phase IV with new application features AND cloud infrastructure
- All Phase IV functionality must remain intact (NFR-08)
- Event-driven communication via Dapr Pub/Sub abstraction
- Consumer microservices for notifications, recurring tasks, and audit logging
- Local and cloud Kubernetes deployment support

**Phase V Technology Stack:**

| Layer | Technology | Notes |
|-------|------------|-------|
| Backend Extensions | Python 3.13 + FastAPI | Event publishing, extended task model |
| Event Broker | Kafka (Redpanda) | Dapr Pub/Sub component |
| Service Mesh | Dapr 1.14+ | Pub/Sub, State Store, Jobs API |
| Consumer Services | Python 3.13 microservices | Notification, recurring-task, audit |
| Orchestration | Kubernetes + Helm 3.x | Local (Minikube) and cloud (OKE/AKS/GKE) |
| CI/CD | GitHub Actions | Automated build, test, deploy |
| Database | Neon PostgreSQL (extended) | New tables: reminders, tags, events, audit logs |

**Phase V Mandatory Requirements:**

1. **Advanced Task Features**
   - Recurring tasks (daily, weekly, custom interval)
   - Due dates and reminder scheduling
   - Priority levels (low, medium, high)
   - Tag-based organization
   - Filter, sort, and search capabilities

2. **Event-Driven Architecture**
   - Publish task events via Dapr Pub/Sub
   - Consumer microservices react to events
   - At-least-once delivery semantics
   - Idempotent event processing
   - Graceful degradation when broker unavailable

3. **Reminder Scheduling**
   - Dapr Jobs API for scheduled reminders
   - Notification delivery via email/web
   - Reminder state management (pending/sent/cancelled)

4. **Cloud Deployment**
   - Deploy to managed Kubernetes (Oracle OKE, Azure AKS, or Google GKE)
   - CI/CD pipeline via GitHub Actions
   - Production-grade configuration with Helm value overrides
   - LoadBalancer services for external access

**Phase V Operational Principles:**
- All services must be loosely coupled via events
- Horizontal scaling for all components
- Monitoring and observability required
- Backward compatibility with Phase IV is non-negotiable
- Infrastructure as Code via Helm charts

**Phase V Deliverables:**

1. Extended Application:
   - backend/ with event publishing and extended models
   - frontend/ with new task features UI
   - services/ directory with 3 consumer microservices
   - Database migrations for new tables

2. Event Infrastructure:
   - Dapr component configurations
   - Kafka/Redpanda deployment via Helm
   - Event schemas and contracts

3. Cloud Deployment:
   - Extended Helm charts with new subcharts
   - values-cloud.yaml for production overrides
   - GitHub Actions CI/CD workflows
   - Cloud setup documentation

**Phase V Success Criteria:**
- All Phase IV features continue working (AC-08)
- Recurring tasks generate next occurrence within 5 seconds
- Reminders delivered within 60 seconds (p95)
- Event publish success rate 99.9%
- Local deployment completes in under 10 minutes
- Cloud deployment completes in under 15 minutes via CI/CD
- System handles 100 concurrent users

### Explicitly Excluded Scope (All Phases)

- Multiple cloud provider deployments simultaneously (Phase V: one provider only)
- Background job queues (Phase I, II) - Phase V uses Dapr Jobs API
- Real-time websockets (Phase I, II) - Phase V uses event-driven patterns
- Multi-tenant enterprise features
- Mobile push notifications (Phase V: web/email only)
- Real-time collaborative editing

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

**Version**: 1.4.0 | **Ratified**: 2025-12-18 | **Last Amended**: 2026-02-13
