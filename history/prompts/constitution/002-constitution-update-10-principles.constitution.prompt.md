---
id: 002
title: Constitution Update 10 Principles
stage: constitution
date: 2025-12-18
surface: agent
model: claude-opus-4-5-20251101
feature: none
branch: 001-todo-cli-crud
user: Human Architect
command: /sp.constitution
labels: ["constitution", "governance", "principles", "reorganization"]
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

Project name: "Todo Console Application"
Target Language: Python 3.13
Current Phase: Phase 1 (In-Memory MVP)
Category: hobby

# Scope Boundary
[In scope]
- Python-based console (CLI) application
- Single-user operation
- In-memory task storage
- Full CRUD operations on Todo tasks

[Explicitly out of scope]
- Databases of any kind
- File-based persistence (JSON, TXT, Pickle, etc.)
- Authentication or authorization
- Web frameworks or APIs
- Docker, Kubernetes, or cloud services

# Guiding Principles

Principle 1: "Spec-Driven Development"
- human only writes specifications (in Markdown)
- human will NOT write, edit or patch any application code
- Claude will generate 100% of the implementation
- all defects or undesired behavior are fixed by rewriting/correcting specs; human will never touch generated code
- Claude will execute only based on written specifications
- Claude will not add features beyond defined specs
- Assumptions, inferred features, or speculative enhancements are strictly prohibited

Principle 2: "Human Constraints"
- humans may only create and update Markdown specs
- humans may not write or modify source code files
- violation of human constraints invalidates the entire phase

Principle 3: "AI Obligations"
- Claude must read all spec files before any implementation
- Claude must implement only explicitly defined behavior
- Claude must respect all scope limitations
- Claude must produce clean, Pythonic code without unnecessary complexity

Principle 4: "No External Dependencies"
- No third-party libraries allowed
- Standard library only
- No network, file I/O (except spec reads), or async

Principle 5: "Data Lifetime"
- All data exists only in memory during runtime
- All data must be destroyed on program termination
- No persistence of any kind is permitted

Principle 6: "Code Quality"
- Target Python 3.13
- Clear functional decomposition
- Consistent naming conventions
- Avoid global mutable state
- No premature optimization
- Comments only where logic is non-obvious

Principle 7: "CLI Behavior"
- Clear numbered menu interface
- Human-readable prompts
- Structured task display
- Graceful handling of invalid input
- No crashes from user input
- No stack traces exposed to users

Principle 8: "Error Handling"
- All user-facing errors handled gracefully
- Invalid identifiers show clear messages
- No internal exceptions exposed

Principle 9: "Spec Evolution"
- If behavior is wrong, update the spec
- Re-run Claude with the updated spec
- Never directly modify code

Principle 10: "Phase Gate"
- Phase I complete when all features implemented
- No excluded functionality present
- All constitution rules satisfied
- System explainable via specs alone
- Transition to next phase only after current is stable and compliant

## Response snapshot

Updated constitution from v1.0.0 to v1.1.0 (MINOR bump). Reorganized 12 sections into 10 explicit principles as requested. Key changes:
- Elevated "No External Dependencies" to standalone Principle IV (previously embedded in AI Obligations)
- Removed "Authority and Precedence" (now implicit in document status)
- Merged "Audit and Evaluation Readiness" into "Phase Gate" (Principle X)
- Added "Project Category: Hobby" to document header
- All templates verified compatible, no updates required

## Outcome

- ✅ Impact: Constitution reorganized to match user's 10 explicit principles structure
- 🧪 Tests: N/A (governance document)
- 📁 Files: .specify/memory/constitution.md updated
- 🔁 Next prompts: /sp.specify to create feature specs following this constitution
- 🧠 Reflection: Version bump correctly assessed as MINOR since structure changed but no principles removed

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): Standard constitution update
- Next experiment (smallest change to try): Consider adding principle numbering cross-references in templates
