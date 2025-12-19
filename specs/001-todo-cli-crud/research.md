# Research: Todo Console Application

**Feature**: 001-todo-cli-crud
**Date**: 2025-12-18
**Purpose**: Document technical decisions and rationale for Phase I implementation

## Research Summary

This document captures technical decisions for the Todo Console Application. Given the strict Constitution constraints (no external dependencies, in-memory only, standard library), research focuses on Python standard library best practices rather than technology selection.

## Technical Decisions

### 1. Task Data Structure

**Decision**: Use Python `dataclass` for Task representation

**Rationale**:
- Built into Python 3.7+ (standard library)
- Provides clean, readable attribute access (`task.id` vs `task["id"]`)
- Auto-generates `__init__`, `__repr__` for debugging
- Type hints for documentation without runtime overhead
- Immutable option available if needed

**Alternatives Considered**:

| Option | Pros | Cons | Rejected Because |
|--------|------|------|------------------|
| Plain dict | No import needed | No type safety, verbose access | Less Pythonic, harder to maintain |
| NamedTuple | Immutable, memory efficient | Can't modify fields | Tasks need mutable `completed` |
| Custom class | Full control | More boilerplate | dataclass provides same with less code |

### 2. Task Storage

**Decision**: Use Python `list` to store Task objects

**Rationale**:
- Simple iteration for display (View Tasks)
- Append for creation
- List comprehension for lookup by ID
- Remove/filter for deletion
- No ordering requirements beyond creation order

**Alternatives Considered**:

| Option | Pros | Cons | Rejected Because |
|--------|------|------|------------------|
| dict[id, Task] | O(1) lookup | Overkill for expected scale | Premature optimization |
| collections.OrderedDict | Maintains order + O(1) | More complex | List is simpler and sufficient |

### 3. ID Generation

**Decision**: Module-level counter variable, increment on each create

**Rationale**:
- Simplest possible approach
- Starts at 1 (user-friendly)
- Never reuses IDs (per spec assumption)
- No UUID complexity needed

**Implementation**:
```python
_next_id = 1

def create_task(title: str, description: str = "") -> Task:
    global _next_id
    task = Task(id=_next_id, title=title, description=description)
    _next_id += 1
    return task
```

### 4. Input Handling

**Decision**: Use `input()` with try/except for validation

**Rationale**:
- Standard library function
- Synchronous (no async complexity)
- Works in all terminal environments
- EOFError handling for edge cases

**Error Strategy**:
- Catch `ValueError` for int conversion
- Catch `EOFError` for unexpected input termination
- Never let exceptions propagate to user

### 5. Menu Implementation

**Decision**: While loop with if/elif dispatch

**Rationale**:
- Clear, readable control flow
- Easy to trace for debugging
- No need for command pattern complexity
- Match/case available in Python 3.10+ but if/elif is more explicit

**Structure**:
```python
while True:
    display_menu()
    choice = get_menu_choice()
    if choice == 1:
        add_task()
    elif choice == 2:
        view_tasks()
    # ... etc
    elif choice == 6:
        print("Goodbye!")
        break
```

### 6. Output Formatting

**Decision**: Simple print statements with f-strings

**Rationale**:
- Clean, readable syntax
- No formatting library needed
- Checkmark display: `[✓]` / `[ ]` using Unicode

**Task Display Format**:
```
[✓] ID: 1 | Buy groceries
[ ] ID: 2 | Call dentist
```

## Constraints Verification

| Constraint | Implementation Approach | Verified |
|------------|------------------------|----------|
| No external libraries | Standard library only | Yes |
| In-memory storage | Python list | Yes |
| Python 3.13+ | dataclass, type hints, f-strings | Yes |
| No persistence | No file I/O code | Yes |
| Graceful errors | try/except everywhere | Yes |

## Open Questions

None - all technical decisions resolved per Constitution constraints.

## References

- Python dataclasses: https://docs.python.org/3/library/dataclasses.html
- Python input(): https://docs.python.org/3/library/functions.html#input
- Unicode checkmark: U+2713 (✓)
