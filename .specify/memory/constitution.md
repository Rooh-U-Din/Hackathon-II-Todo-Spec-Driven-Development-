<!--
  Sync Impact Report
  ==================
  Version change: 1.0.0 → 1.1.0
  Bump rationale: MINOR - Reorganized from 12 sections to 10 principles; elevated "No External Dependencies" to standalone principle

  Modified principles:
  - "Authority and Precedence" → removed (implicit in document status)
  - "AI Obligations" → split into "AI Obligations" (III) + "No External Dependencies" (IV)
  - "Audit and Evaluation Readiness" → merged into "Phase Gate" (X)

  Added sections:
  - IV. No External Dependencies (elevated from AI Obligations)

  Removed sections:
  - I. Authority and Precedence (implicit in document governance)
  - XI. Audit and Evaluation Readiness (merged into Phase Gate)

  Templates requiring updates:
  - .specify/templates/plan-template.md ✅ (Constitution Check section compatible)
  - .specify/templates/spec-template.md ✅ (no conflicts)
  - .specify/templates/tasks-template.md ✅ (structure compatible with single project)

  Follow-up TODOs: None
-->

# Todo Console Application Constitution

**Document Status**: Authoritative / Binding
**Applies To**: Phase I only
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
- Write or modify `.py` source code files
- Insert logic directly into source code
- Perform manual bug fixes
- Bypass or contradict written specifications

Humans MAY ONLY:
- Create and update Markdown specifications
- Update this Constitution
- Review generated output
- Re-run Claude Code with revised specs

**Violation Consequence:** Any violation invalidates the entire Phase I.

### III. AI Obligations

Claude Code MUST:
- Read all spec files before any implementation
- Implement only explicitly defined behavior
- Respect all scope limitations
- Produce clean, readable, Pythonic code
- Avoid unnecessary complexity

Claude Code MUST NOT:
- Add features outside defined specs
- Persist data in any form
- Introduce web, GUI, or async functionality

### IV. No External Dependencies

**Mandatory Rules:**
- No third-party libraries are allowed
- Only Python standard library is permitted
- No network operations
- No file I/O (except specification reads during development)
- No asynchronous programming

### V. Data Lifetime

- All application data SHALL exist only in memory during runtime
- All data SHALL be destroyed upon program termination
- Persistence of any form is strictly forbidden

## Technical Standards

### VI. Code Quality

Generated code MUST:
- Target Python 3.13 or later
- Use clear functional decomposition
- Follow consistent naming conventions
- Avoid global mutable state where reasonably possible
- Include comments only where logic is non-obvious

Premature optimization is not permitted.

### VII. Command-Line Interface Standards

The CLI MUST:
- Present a clear, numbered menu interface
- Use human-readable prompts
- Display tasks in a clean, structured format
- Handle invalid input gracefully

The CLI MUST NOT:
- Crash due to user input
- Expose stack traces or internal errors to users

### VIII. Error Handling

- All user-facing errors SHALL be handled gracefully
- Invalid task identifiers SHALL result in clear messages
- Internal exceptions SHALL NOT be exposed to users

## Process Standards

### IX. Specification Evolution

If behavior is incorrect or incomplete:
1. The missing or ambiguous requirement SHALL be identified
2. The relevant specification SHALL be updated
3. Claude Code SHALL be re-executed with the updated spec

Direct code modification is strictly forbidden.

### X. Phase Gate

Phase I is considered complete only when:
- All specified features are implemented
- No excluded functionality exists
- All rules in this Constitution are satisfied
- The system can be explained and evaluated using specs alone

**Transition to Phase II** is permitted only after Phase I is:
- Functionally complete
- Stable under normal usage
- Fully compliant with this Constitution

## Scope Definition

### Included Scope (Phase I)

- Python-based console (CLI) application
- Single-user operation
- In-memory task storage
- Full CRUD operations on Todo tasks

### Explicitly Excluded Scope

- Databases of any kind
- File-based persistence (JSON, TXT, Pickle, etc.)
- Authentication or authorization
- Web frameworks or APIs
- Docker, Kubernetes, or cloud services

## Governance

This Constitution supersedes all other practices for Phase I development.

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

**Version**: 1.1.0 | **Ratified**: 2025-12-18 | **Last Amended**: 2025-12-18
