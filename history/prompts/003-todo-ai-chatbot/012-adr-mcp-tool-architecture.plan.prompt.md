---
id: 012
title: ADR MCP Tool Architecture
stage: plan
date: 2025-12-19
surface: agent
model: claude-opus-4-5-20251101
feature: 003-todo-ai-chatbot
branch: 003-todo-ai-chatbot
user: system
command: /sp.adr
labels: ["adr", "architecture", "mcp", "ai-agent"]
links:
  spec: specs/003-todo-ai-chatbot/spec.md
  ticket: null
  adr: history/adr/ADR-001-ai-agent-mcp-tool-architecture.md
  pr: null
files:
  - history/adr/ADR-001-ai-agent-mcp-tool-architecture.md
tests:
  - null
---

## Prompt

/sp.adr mcp-tool-implementation

## Response snapshot

Created ADR-001: AI Agent and MCP Tool Architecture

**Decision Cluster:**
- AI Framework: OpenAI Agents SDK with @function_tool decorator
- MCP Tool Deployment: In-process tools within FastAPI (not separate server)
- Execution Pattern: Synchronous within HTTP request/response cycle
- Tool Integration: Delegate to existing Phase II task services

**Significance Test:** PASS
- Impacts how engineers write/structure software: YES
- Notable tradeoffs or alternatives: YES (3 alternatives documented)
- Will be questioned or revisited later: YES (scaling concerns)

**Alternatives Rejected:**
1. Separate MCP server process - over-engineering for scale
2. REST API calls from agent - unnecessary indirection
3. Async job queue with WebSocket - excluded by constitution

**Acceptance Criteria:** All items PASS

## Outcome

- ✅ Impact: First ADR created for Phase III, documents critical architecture decision
- 🧪 Tests: N/A (documentation)
- 📁 Files: 1 file created (history/adr/ADR-001-ai-agent-mcp-tool-architecture.md)
- 🔁 Next prompts: /sp.tasks
- 🧠 Reflection: ADR properly clusters related decisions; create-adr.sh script missing, used manual creation

## Evaluation notes (flywheel)

- Failure modes observed: create-adr.sh script not found; used manual ADR creation
- Graders run and results (PASS/FAIL): Significance test PASS, Acceptance criteria PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Add create-adr.sh script to .specify/scripts/bash/
