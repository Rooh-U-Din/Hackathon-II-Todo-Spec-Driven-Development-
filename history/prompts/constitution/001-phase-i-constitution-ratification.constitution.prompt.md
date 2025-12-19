---
id: 001
title: Phase I Constitution Ratification
stage: constitution
date: 2025-12-18
surface: agent
model: claude-opus-4-5-20251101
feature: none
branch: master
user: Human Architect
command: /sp.constitution
labels: ["constitution", "phase-i", "todo-app", "sdd", "governance"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - N/A (governance document)
---

## Prompt

pec Constitution — Phase I (Todo Console Application)

Document Status: Authoritative / Binding
Applies To: Phase I only
Execution Agent: Claude Code (AI Engineer)
Authoring Authority: Human Architect (Specs Only)

1. Authority and Precedence

This Constitution is the highest governing document for Phase I.

In case of conflict between this document and any other specification, instruction, or generated output, this Constitution SHALL prevail.

All specifications, prompts, and implementations MUST comply with this Constitution.

2. Development Model
2.1 Spec-Driven Development (Mandatory)

Humans SHALL write specifications in Markdown.

Humans SHALL NOT write, edit, or patch application code.

Claude Code SHALL generate 100% of the implementation.

Any defect or undesired behavior SHALL be resolved by updating specifications, not by modifying code.

2.2 AI-First Execution

Claude Code is treated as an implementation agent executing written specs.

Assumptions, inferred features, or speculative enhancements are strictly prohibited.

3. Human Constraints (Non-Negotiable)

Humans MUST NOT:

Write or modify .py files

Insert logic directly into source code

Perform manual bug fixes

Bypass or contradict written specifications

Humans MAY ONLY:

Write and refine Markdown specifications

Update this Constitution

Review generated output

Re-run Claude Code with revised specs

Any violation invalidates Phase I.

4. AI Obligations

Claude Code MUST:

Read all referenced specifications prior to implementation

Implement only explicitly defined behavior

Respect all scope limitations

Produce clean, readable, Pythonic code

Avoid unnecessary complexity

Claude Code MUST NOT:

Add features outside defined specs

Persist data in any form

Use external or third-party libraries

Introduce web, GUI, network, or async functionality

5. Phase I Scope Definition
5.1 Included Scope

Python-based console (CLI) application

Single-user operation

In-memory task storage

Full CRUD operations on Todo tasks

5.2 Explicitly Excluded Scope

Databases of any kind

File-based persistence (JSON, TXT, Pickle, etc.)

Authentication or authorization

Web frameworks or APIs

Docker, Kubernetes, or cloud services

6. Data Lifetime and Ownership

All application data SHALL exist only in memory

All data SHALL be destroyed upon program termination

Persistence of any form is explicitly forbidden

7. Code Quality Requirements

Generated code MUST:

Target Python 3.13 or later

Use clear functional decomposition

Follow consistent naming conventions

Avoid global mutable state where reasonably possible

Include comments only where logic is non-obvious

Premature optimization is not permitted.

8. Command-Line Interface Standards

The CLI MUST:

Present a clear, numbered menu

Use human-readable prompts

Display tasks in a clean, structured format

Handle invalid input gracefully

The CLI MUST NOT:

Crash due to user input

Expose stack traces or internal errors

9. Error Handling Policy

All user-facing errors SHALL be handled gracefully

Invalid task identifiers SHALL result in clear messages

Internal exceptions SHALL NOT be exposed

10. Specification Evolution Rule

If behavior is incorrect or incomplete:

The missing or ambiguous requirement SHALL be identified

The relevant specification SHALL be updated

Claude Code SHALL be re-executed

Direct code modification is strictly forbidden.

11. Audit and Evaluation Readiness

Phase I is considered complete only if:

All specified features are implemented

No excluded functionality exists

All rules in this Constitution are satisfied

The system can be explained and evaluated using specs alone

12. Phase Transition Gate

Transition to Phase II is permitted only after Phase I is:

Functionally complete

Stable under normal usage

Fully compliant with this Constitution

## Response snapshot

Created Phase I Constitution v1.0.0 for Todo Console Application with 12 core principles organized into three categories:

**Core Principles (I-VI):**
- Authority and Precedence
- Spec-Driven Development
- Human Constraints (Non-Negotiable)
- AI Obligations
- Scope Definition (Included/Excluded)
- Data Lifetime and Ownership

**Technical Standards (VII-IX):**
- Code Quality Requirements (Python 3.13+)
- CLI Standards
- Error Handling Policy

**Process Standards (X-XII):**
- Specification Evolution Rule
- Audit and Evaluation Readiness
- Phase Transition Gate

Added Governance section with amendment procedure, versioning policy (semantic), and compliance review expectations.

## Outcome

- Impact: Initial constitution ratified for Phase I Todo Console Application
- Tests: N/A (governance document)
- Files: .specify/memory/constitution.md (created/replaced)
- Next prompts: /sp.specify to create feature specification for Todo CRUD operations
- Reflection: Constitution successfully captures all 12 sections from user input with clear, testable language (SHALL/MUST/MUST NOT)

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Manual validation PASS - no unresolved placeholders, all dates ISO format, principles declarative
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
