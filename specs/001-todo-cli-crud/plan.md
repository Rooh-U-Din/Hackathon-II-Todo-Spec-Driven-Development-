# Implementation Plan: Todo Console Application

**Branch**: `001-todo-cli-crud` | **Date**: 2025-12-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-todo-cli-crud/spec.md`

## Summary

Implement a Python CLI application for Todo task management with full CRUD operations. The application runs in a terminal, stores all data in memory only, and provides a numbered menu interface for user interaction. No external dependencies are permitted.

## Technical Context

**Language/Version**: Python 3.13+
**Primary Dependencies**: None (standard library only per Constitution)
**Storage**: In-memory only (Python list/dict)
**Testing**: Manual verification (no test framework per Constitution constraints)
**Target Platform**: Standard terminal environment (Windows/Linux/macOS)
**Project Type**: Single project
**Performance Goals**: Menu response within 1 second (SC-007)
**Constraints**: No persistence, no external libraries, single-user, CLI only
**Scale/Scope**: Single session, unlimited tasks (memory-bound)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Status |
|-----------|-------------|--------|
| I. Authority | Constitution is highest governing document | PASS |
| II. Spec-Driven | Claude Code generates 100% of implementation | PASS |
| III. Human Constraints | Humans write specs only, no .py edits | PASS |
| IV. AI Obligations | Implement only explicit behavior, no extras | PASS |
| V. Scope Definition | CLI app, single-user, in-memory, CRUD | PASS |
| VI. Data Lifetime | Memory only, destroyed on exit | PASS |
| VII. Code Quality | Python 3.13+, functional decomposition, clean | PASS |
| VIII. CLI Standards | Numbered menu, human-readable, graceful errors | PASS |
| IX. Error Handling | No crashes, no stack traces, friendly messages | PASS |
| X. Spec Evolution | Fix via spec update, not code edit | PASS |
| XI. Audit Readiness | Explainable via specs alone | PASS |
| XII. Phase Transition | All features, no forbidden functionality | PASS |

**Gate Status: PASSED** - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/001-todo-cli-crud/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```text
src/
└── main.py              # Single entry point (all code in one file per simplicity)
```

**Structure Decision**: Minimal single-file structure chosen because:
1. Constitution mandates simplicity - no premature abstraction
2. No external dependencies means no package management complexity
3. In-memory storage eliminates need for separate data layer
4. CLI application with 6 menu options fits well in single module
5. Facilitates audit - entire implementation visible in one file

## Complexity Tracking

> No violations - design is maximally simple per Constitution.

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| File structure | Single `main.py` | Simplest possible, all logic visible |
| Data storage | Python list | Native structure, no ORM needed |
| Task model | Dictionary or dataclass | Clean, readable, Pythonic |
| ID generation | Counter variable | Simple increment, no UUID complexity |
| Input handling | try/except with input() | Standard library, graceful errors |

## Implementation Approach

### Module Organization (within main.py)

```
1. Data structures (Task representation, task list)
2. CRUD operations (create, read, update, delete, toggle)
3. UI functions (menu display, input prompts, output formatting)
4. Main loop (menu dispatch, error handling)
5. Entry point (if __name__ == "__main__")
```

### Key Design Decisions

1. **Task Storage**: List of dictionaries (or dataclass instances)
   - Simple iteration for view/search
   - ID lookup via list comprehension
   - Deletion via list.remove() or filter

2. **ID Generation**: Global counter starting at 1
   - Increment on each create
   - Never reuse deleted IDs (per spec assumption)

3. **Menu Loop**: While True with exit condition
   - Display menu each iteration
   - Dispatch based on user choice
   - Return to menu after operation

4. **Error Handling**: Try/except at input boundaries
   - ValueError for non-numeric input
   - Friendly messages for all error cases
   - Never expose internal exceptions

## Artifacts to Generate

| Artifact | Purpose | Location |
|----------|---------|----------|
| research.md | Document technical decisions | specs/001-todo-cli-crud/ |
| data-model.md | Task entity definition | specs/001-todo-cli-crud/ |
| quickstart.md | How to run the application | specs/001-todo-cli-crud/ |

## Next Steps

1. `/sp.tasks` - Generate implementation task list from this plan
2. `/sp.implement` - Execute tasks to generate `src/main.py`
3. Manual verification against spec acceptance scenarios
