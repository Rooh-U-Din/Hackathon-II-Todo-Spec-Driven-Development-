# Tasks: Todo Console Application

**Input**: Design documents from `/specs/001-todo-cli-crud/`
**Prerequisites**: plan.md, spec.md, data-model.md, research.md, quickstart.md

**Tests**: Manual verification per Constitution constraints (no test framework)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/main.py` (all code in single file per plan.md)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create src/ directory at repository root
- [x] T002 Create empty src/main.py file with Python 3.13+ shebang and module docstring

**Checkpoint**: Project structure ready for implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Implement Task dataclass with id, title, description, completed attributes in src/main.py
- [x] T004 Implement module-level task storage (tasks list, _next_id counter) in src/main.py
- [x] T005 Implement find_task(task_id) helper function for ID lookup in src/main.py
- [x] T006 Implement display_menu() function showing all 6 options in src/main.py
- [x] T007 Implement get_menu_choice() function with input validation in src/main.py
- [x] T008 Implement main() function with menu loop structure in src/main.py
- [x] T009 Add if __name__ == "__main__" entry point in src/main.py

**Checkpoint**: Foundation ready - menu displays and accepts input, user story implementation can begin

---

## Phase 3: User Story 1 - Add New Task (Priority: P1)

**Goal**: Allow users to create new tasks with title and optional description

**Independent Test**: Run app, select option 1, enter title, verify task creation message

### Implementation for User Story 1

- [x] T010 [US1] Implement get_non_empty_input(prompt) helper for title validation in src/main.py
- [x] T011 [US1] Implement add_task() function that prompts for title and description in src/main.py
- [x] T012 [US1] Wire add_task() to menu option 1 in main loop in src/main.py
- [x] T013 [US1] Add confirmation message after successful task creation in src/main.py

**Checkpoint**: User Story 1 complete - users can add tasks

---

## Phase 4: User Story 2 - View All Tasks (Priority: P1)

**Goal**: Display all tasks with ID, title, and completion status indicators

**Independent Test**: Add tasks via US1, select option 2, verify all tasks display correctly

### Implementation for User Story 2

- [x] T014 [US2] Implement format_task(task) helper to format single task line with checkbox in src/main.py
- [x] T015 [US2] Implement view_tasks() function that displays all tasks or "no tasks" message in src/main.py
- [x] T016 [US2] Wire view_tasks() to menu option 2 in main loop in src/main.py

**Checkpoint**: User Stories 1 & 2 complete - MVP functional (add + view)

---

## Phase 5: User Story 3 - Update Existing Task (Priority: P2)

**Goal**: Allow users to modify task title and description

**Independent Test**: Add task, select option 3, update fields, view to verify changes

### Implementation for User Story 3

- [x] T017 [US3] Implement get_task_id_input(prompt) helper for ID input with validation in src/main.py
- [x] T018 [US3] Implement update_task() function that prompts for ID and new values in src/main.py
- [x] T019 [US3] Add logic to preserve original values when input is empty in src/main.py
- [x] T020 [US3] Wire update_task() to menu option 3 in main loop in src/main.py

**Checkpoint**: User Story 3 complete - users can update tasks

---

## Phase 6: User Story 4 - Delete Task (Priority: P2)

**Goal**: Allow users to remove tasks with confirmation

**Independent Test**: Add task, select option 4, confirm deletion, view to verify removal

### Implementation for User Story 4

- [x] T021 [US4] Implement get_confirmation(prompt) helper for y/n input in src/main.py
- [x] T022 [US4] Implement delete_task() function with ID lookup and confirmation in src/main.py
- [x] T023 [US4] Wire delete_task() to menu option 4 in main loop in src/main.py

**Checkpoint**: User Story 4 complete - users can delete tasks

---

## Phase 7: User Story 5 - Toggle Task Completion (Priority: P2)

**Goal**: Allow users to mark tasks complete or incomplete

**Independent Test**: Add task, select option 5, toggle status, view to verify checkbox change

### Implementation for User Story 5

- [x] T024 [US5] Implement toggle_task() function that flips completed status in src/main.py
- [x] T025 [US5] Add confirmation message showing new status in src/main.py
- [x] T026 [US5] Wire toggle_task() to menu option 5 in main loop in src/main.py

**Checkpoint**: User Story 5 complete - users can toggle completion

---

## Phase 8: User Story 6 - Exit Application (Priority: P3)

**Goal**: Clean application termination with goodbye message

**Independent Test**: Select option 6, verify goodbye message and termination

### Implementation for User Story 6

- [x] T027 [US6] Implement exit handling in main loop with goodbye message in src/main.py
- [x] T028 [US6] Ensure clean program termination (break from loop) in src/main.py

**Checkpoint**: User Story 6 complete - application exits gracefully

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup

- [x] T029 Review all error messages for user-friendliness in src/main.py
- [x] T030 Verify no stack traces can be exposed to users in src/main.py
- [x] T031 Run manual validation against quickstart.md checklist
- [x] T032 Verify all 29 functional requirements (FR-001 to FR-029) are implemented

**Checkpoint**: All user stories complete and validated

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 - BLOCKS all user stories
- **Phase 3-8 (User Stories)**: All depend on Phase 2 completion
  - US1 (Add) and US2 (View) are P1 - implement first
  - US3 (Update), US4 (Delete), US5 (Toggle) are P2 - implement after P1
  - US6 (Exit) is P3 - implement last
- **Phase 9 (Polish)**: Depends on all user stories being complete

### User Story Dependencies

| Story | Priority | Dependencies | Can Parallelize? |
|-------|----------|--------------|------------------|
| US1 - Add Task | P1 | Phase 2 only | Yes (with US2) |
| US2 - View Tasks | P1 | Phase 2 only | Yes (with US1) |
| US3 - Update Task | P2 | Phase 2 + US1 (for test data) | Yes (with US4, US5) |
| US4 - Delete Task | P2 | Phase 2 + US1 (for test data) | Yes (with US3, US5) |
| US5 - Toggle | P2 | Phase 2 + US1 (for test data) | Yes (with US3, US4) |
| US6 - Exit | P3 | Phase 2 only | Independent |

### Within Single File Constraint

Since all code is in `src/main.py`, tasks within a phase should be executed sequentially to avoid conflicts. However, conceptually the user stories are independent.

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational (T003-T009)
3. Complete Phase 3: User Story 1 - Add Task (T010-T013)
4. Complete Phase 4: User Story 2 - View Tasks (T014-T016)
5. **STOP and VALIDATE**: Test add + view functionality
6. This is a working MVP!

### Full Implementation

1. MVP (Phases 1-4)
2. Phase 5: Update Task (T017-T020)
3. Phase 6: Delete Task (T021-T023)
4. Phase 7: Toggle Completion (T024-T026)
5. Phase 8: Exit (T027-T028)
6. Phase 9: Polish (T029-T032)

### Verification Points

After each phase, manually verify:
- Application runs without errors
- New functionality works per acceptance scenarios
- Previous functionality still works
- No stack traces visible on any input

---

## Task Summary

| Phase | Story | Task Count | Tasks |
|-------|-------|------------|-------|
| 1 | Setup | 2 | T001-T002 |
| 2 | Foundational | 7 | T003-T009 |
| 3 | US1 - Add | 4 | T010-T013 |
| 4 | US2 - View | 3 | T014-T016 |
| 5 | US3 - Update | 4 | T017-T020 |
| 6 | US4 - Delete | 3 | T021-T023 |
| 7 | US5 - Toggle | 3 | T024-T026 |
| 8 | US6 - Exit | 2 | T027-T028 |
| 9 | Polish | 4 | T029-T032 |
| **Total** | | **32** | T001-T032 |

---

## Notes

- All tasks target single file: `src/main.py`
- No [P] markers used since all tasks modify same file (no true parallelization)
- [USn] labels track which user story each task belongs to
- Manual verification replaces automated tests (per Constitution)
- Each checkpoint is a valid stopping point for incremental delivery
- Constitution compliance: no external dependencies, in-memory only, graceful errors
