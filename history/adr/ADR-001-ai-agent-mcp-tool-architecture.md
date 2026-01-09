# ADR-001: AI Agent and MCP Tool Architecture

> **Scope**: This ADR documents the clustered decision for AI agent implementation including: agent framework choice, MCP tool deployment model, and execution pattern.

- **Status:** Accepted
- **Date:** 2025-12-19
- **Feature:** 003-todo-ai-chatbot
- **Context:** Phase III requires an AI-powered chatbot for natural language task management. The system must process user messages through an AI agent that can invoke task operations (CRUD) while maintaining a stateless server architecture per constitution requirements.

## Decision

We will implement the AI agent using the following integrated approach:

- **AI Framework**: OpenAI Agents SDK with `@function_tool` decorator
- **MCP Tool Deployment**: In-process tools within the FastAPI application (not separate MCP server)
- **Execution Pattern**: Synchronous execution within HTTP request/response cycle
- **Tool Integration**: MCP tools delegate to existing Phase II task service functions

### Key Implementation Details

1. Tools are defined using `@function_tool` decorator and run in the same process as FastAPI
2. AI agent executes synchronously with a 10-second timeout
3. Tools call existing `app.services.tasks` functions directly via SQLModel session
4. No inter-process communication or separate server management required

## Consequences

### Positive

- **Simpler deployment**: Single FastAPI process, no orchestration of multiple services
- **Direct database access**: Tools share SQLModel session with existing services
- **Lower latency**: No inter-process communication overhead
- **Easier debugging**: Single process, unified logging and error handling
- **Constitution compliance**: No background job queues (excluded by constitution)
- **Code reuse**: Leverages battle-tested Phase II task service logic

### Negative

- **Scaling constraints**: Cannot scale AI processing independently from API
- **Timeout risk**: Long AI responses may hit 10-second limit
- **Single point of failure**: AI errors could affect entire request
- **No streaming**: Cannot stream partial responses (sync execution)
- **Resource contention**: AI processing shares resources with other API requests

## Alternatives Considered

### Alternative A: Separate MCP Server Process

- **Approach**: Run MCP server as standalone process, communicate via stdio or HTTP
- **Pros**: Independent scaling, isolation, standard MCP protocol
- **Cons**: Added complexity, inter-process communication overhead, more deployment components
- **Why Rejected**: Over-engineering for expected scale (100 concurrent users); constitution excludes background job queues

### Alternative B: REST API Calls from Agent

- **Approach**: Agent calls Phase II REST endpoints instead of direct service calls
- **Pros**: Full API contract enforcement, network-level isolation
- **Cons**: Redundant HTTP overhead, circular dependency, slower
- **Why Rejected**: Unnecessary indirection; direct service calls are simpler and faster

### Alternative C: Async Job Queue with WebSocket Responses

- **Approach**: Queue AI processing as background job, return results via WebSocket
- **Pros**: Better UX for long responses, scalable
- **Cons**: Requires Redis/RabbitMQ, WebSocket infrastructure, more complex frontend
- **Why Rejected**: Explicitly excluded by constitution (Phase I, II constraints)

## References

- Feature Spec: [specs/003-todo-ai-chatbot/spec.md](../../specs/003-todo-ai-chatbot/spec.md)
- Implementation Plan: [specs/003-todo-ai-chatbot/plan.md](../../specs/003-todo-ai-chatbot/plan.md)
- Research: [specs/003-todo-ai-chatbot/research.md](../../specs/003-todo-ai-chatbot/research.md)
- Related ADRs: None (first ADR for Phase III)
- Evaluator Evidence: Plan constitution check (all 10 principles PASS)
