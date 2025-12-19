# Tasks: Full-Stack Todo Web Application (Phase II)

**Input**: Design documents from `/specs/002-fullstack-todo-web/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/openapi.yaml, research.md, quickstart.md
**Tests**: Not explicitly requested - implementation tasks only

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/app/` for source, `backend/tests/` for tests
- **Frontend**: `frontend/src/` for source, `frontend/tests/` for tests
- Phase I `src/` directory is PRESERVED - DO NOT MODIFY

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Initialize both backend and frontend projects with required dependencies

- [X] T001 [P] Create backend directory structure per plan.md at backend/
- [X] T002 [P] Create frontend directory structure per plan.md at frontend/
- [X] T003 [P] Create backend/pyproject.toml with Python 3.13 and dependencies (fastapi, sqlmodel, uvicorn, python-jose, passlib, bcrypt)
- [X] T004 [P] Create backend/requirements.txt with pinned versions
- [X] T005 [P] Create frontend/package.json with Next.js 14, TypeScript, and dependencies
- [X] T006 [P] Create frontend/tsconfig.json with strict TypeScript configuration
- [X] T007 [P] Create frontend/next.config.js with App Router configuration
- [X] T008 [P] Create frontend/tailwind.config.js for styling
- [X] T009 Create backend/app/__init__.py (empty module marker)
- [X] T010 Create backend/app/config.py with environment variable loading (DATABASE_URL, BETTER_AUTH_SECRET, FRONTEND_URL)
- [X] T011 Create frontend/.env.local.example with NEXT_PUBLIC_API_URL placeholder

**Checkpoint**: Project scaffolding complete - can run `pip install` and `npm install`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [X] T012 Create backend/app/db/__init__.py (empty module marker)
- [X] T013 Create backend/app/db/session.py with Neon PostgreSQL connection (pool_pre_ping=True, sslmode=require)
- [X] T014 [P] Create backend/app/models/__init__.py with model exports
- [X] T015 [P] Create backend/app/models/user.py with User SQLModel per data-model.md
- [X] T016 [P] Create backend/app/models/task.py with Task SQLModel per data-model.md
- [X] T017 Create backend/app/api/__init__.py (empty module marker)
- [X] T018 Create backend/app/api/deps.py with get_db_session dependency and get_current_user placeholder
- [X] T019 Create backend/app/services/__init__.py (empty module marker)
- [X] T020 Create backend/app/main.py with FastAPI app, CORS middleware, and health endpoint
- [X] T021 Create frontend/src/lib/types.ts with TypeScript types matching API schemas
- [X] T022 Create frontend/src/lib/api.ts with base API client (fetch wrapper with auth header)
- [X] T023 Create frontend/src/app/layout.tsx with root layout and metadata
- [X] T024 Create frontend/src/app/page.tsx with landing page (redirect to /login or /tasks based on auth)

**Checkpoint**: Foundation ready - database connects, FastAPI runs, Next.js serves pages

---

## Phase 3: User Story 1 - User Registration (Priority: P1)

**Goal**: Allow new users to create an account and receive a JWT token

**Independent Test**: Complete registration flow → account created → JWT returned

### Implementation for User Story 1

- [X] T025 [US1] Create backend/app/services/auth.py with hash_password and verify_password functions using bcrypt
- [X] T026 [US1] Add create_user function to backend/app/services/auth.py (check email uniqueness, hash password, insert user)
- [X] T027 [US1] Add generate_jwt function to backend/app/services/auth.py using python-jose with BETTER_AUTH_SECRET
- [X] T028 [US1] Create backend/app/api/auth.py with POST /api/auth/register endpoint per openapi.yaml
- [X] T029 [US1] Add email validation (RFC 5322) to register endpoint in backend/app/api/auth.py
- [X] T030 [US1] Add password policy validation (8+ chars, uppercase, lowercase, digit) to register endpoint
- [X] T031 [US1] Create frontend/src/components/AuthForm.tsx with email/password inputs and validation
- [X] T032 [US1] Create frontend/src/app/(auth)/register/page.tsx with registration form using AuthForm component
- [X] T033 [US1] Add client-side validation for email format and password policy in register page
- [X] T034 [US1] Add API call to POST /api/auth/register and handle success/error responses
- [X] T035 [US1] Store JWT token in httpOnly cookie or secure storage after successful registration
- [X] T036 [US1] Redirect to /tasks after successful registration

**Checkpoint**: User can register → receives JWT → redirected to task list

---

## Phase 4: User Story 2 - User Sign In (Priority: P1)

**Goal**: Allow registered users to sign in and receive a JWT token

**Independent Test**: Sign in with valid credentials → JWT returned → access protected routes

### Implementation for User Story 2

- [X] T037 [US2] Add authenticate_user function to backend/app/services/auth.py (lookup by email, verify password)
- [X] T038 [US2] Add POST /api/auth/login endpoint to backend/app/api/auth.py per openapi.yaml
- [X] T039 [US2] Return generic error message on invalid credentials (no hint about which field is wrong)
- [X] T040 [US2] Update backend/app/api/deps.py get_current_user to decode and validate JWT token
- [X] T041 [US2] Add HTTPException 401 for invalid/expired tokens in get_current_user
- [X] T042 [US2] Create frontend/src/app/(auth)/login/page.tsx with login form using AuthForm component
- [X] T043 [US2] Add API call to POST /api/auth/login and handle success/error responses
- [X] T044 [US2] Store JWT token after successful login
- [X] T045 [US2] Create frontend/src/lib/auth.ts with isAuthenticated, getToken, clearToken helpers
- [X] T046 [US2] Create frontend/src/hooks/useAuth.ts hook for auth state management
- [X] T047 [US2] Redirect to /tasks after successful login

**Checkpoint**: User can sign in → JWT stored → can access protected routes

---

## Phase 5: User Story 3 - Create Task (Priority: P2)

**Goal**: Authenticated users can create new tasks

**Independent Test**: Create task with title → task appears in list with user_id association

### Implementation for User Story 3

- [X] T048 [US3] Create backend/app/services/tasks.py with create_task function (associate with user_id)
- [X] T049 [US3] Create backend/app/api/tasks.py with POST /api/tasks endpoint per openapi.yaml
- [X] T050 [US3] Add Depends(get_current_user) to POST /api/tasks for authentication
- [X] T051 [US3] Add title validation (1-200 chars) and description validation (0-2000 chars) to create endpoint
- [X] T052 [US3] Create frontend/src/components/TaskForm.tsx with title input and optional description textarea
- [X] T053 [US3] Add client-side validation for title (required, max 200) and description (max 2000)
- [X] T054 [US3] Create frontend/src/hooks/useTasks.ts with createTask mutation
- [X] T055 [US3] Add "New Task" button/form to task list page that uses TaskForm component

**Checkpoint**: Authenticated user can create task → task persisted with correct user_id

---

## Phase 6: User Story 4 - View My Tasks (Priority: P2)

**Goal**: Authenticated users can see a list of only their own tasks

**Independent Test**: View task list → only own tasks shown → other users' tasks not visible

### Implementation for User Story 4

- [X] T056 [US4] Add get_user_tasks function to backend/app/services/tasks.py (filter by user_id, with pagination)
- [X] T057 [US4] Add GET /api/tasks endpoint to backend/app/api/tasks.py per openapi.yaml
- [X] T058 [US4] Add query parameters for completed filter, limit, and offset
- [X] T059 [US4] Create frontend/src/components/TaskList.tsx to display array of tasks
- [X] T060 [US4] Create frontend/src/components/TaskCard.tsx for individual task display (title, status, date)
- [X] T061 [US4] Add getTasks query to frontend/src/hooks/useTasks.ts
- [X] T062 [US4] Create frontend/src/app/(dashboard)/tasks/page.tsx with TaskList component
- [X] T063 [US4] Create frontend/src/app/(dashboard)/layout.tsx with protected route wrapper (redirect if not authenticated)
- [X] T064 [US4] Add empty state component when user has no tasks

**Checkpoint**: Authenticated user sees only their own tasks in a list

---

## Phase 7: User Story 5 - View Task Details (Priority: P2)

**Goal**: Authenticated users can view details of a specific task they own

**Independent Test**: Click task → see full details (title, description, status, timestamps)

### Implementation for User Story 5

- [X] T065 [US5] Add get_task_by_id function to backend/app/services/tasks.py (filter by user_id AND task_id)
- [X] T066 [US5] Add GET /api/tasks/{taskId} endpoint to backend/app/api/tasks.py per openapi.yaml
- [X] T067 [US5] Return 404 for task not found OR task not owned by user (prevent enumeration)
- [X] T068 [US5] Add UUID format validation for taskId parameter
- [X] T069 [US5] Add getTask query to frontend/src/hooks/useTasks.ts
- [X] T070 [US5] Create frontend/src/app/(dashboard)/tasks/[id]/page.tsx with task detail view
- [X] T071 [US5] Display title, description, is_completed status, created_at, updated_at in detail view

**Checkpoint**: User can view full details of their own tasks

---

## Phase 8: User Story 6 - Update Task (Priority: P2)

**Goal**: Authenticated users can update their own tasks

**Independent Test**: Edit task title/description → changes persist → updated_at changes

### Implementation for User Story 6

- [X] T072 [US6] Add update_task function to backend/app/services/tasks.py (verify ownership, update fields)
- [X] T073 [US6] Add PUT /api/tasks/{taskId} endpoint to backend/app/api/tasks.py per openapi.yaml
- [X] T074 [US6] Return 404 for task not owned by user
- [X] T075 [US6] Add validation for empty title on update
- [X] T076 [US6] Update updated_at timestamp on successful update
- [X] T077 [US6] Add updateTask mutation to frontend/src/hooks/useTasks.ts
- [X] T078 [US6] Add edit mode to task detail page frontend/src/app/(dashboard)/tasks/[id]/page.tsx
- [X] T079 [US6] Reuse TaskForm component for editing with pre-populated values

**Checkpoint**: User can edit their own tasks and see changes persist

---

## Phase 9: User Story 7 - Toggle Task Completion (Priority: P2)

**Goal**: Authenticated users can mark tasks complete/incomplete

**Independent Test**: Toggle task → is_completed flips → UI updates

### Implementation for User Story 7

- [X] T080 [US7] Add toggle_task_completion function to backend/app/services/tasks.py (flip is_completed)
- [X] T081 [US7] Add POST /api/tasks/{taskId}/toggle endpoint to backend/app/api/tasks.py per openapi.yaml
- [X] T082 [US7] Return 404 for task not owned by user
- [X] T083 [US7] Add toggleTask mutation to frontend/src/hooks/useTasks.ts
- [X] T084 [US7] Add checkbox/toggle button to TaskCard component in frontend/src/components/TaskCard.tsx
- [X] T085 [US7] Update task list UI optimistically when toggling completion

**Checkpoint**: User can toggle task completion status

---

## Phase 10: User Story 8 - Delete Task (Priority: P3)

**Goal**: Authenticated users can delete their own tasks

**Independent Test**: Delete task → task removed from list → cannot retrieve via API

### Implementation for User Story 8

- [X] T086 [US8] Add delete_task function to backend/app/services/tasks.py (verify ownership, delete)
- [X] T087 [US8] Add DELETE /api/tasks/{taskId} endpoint to backend/app/api/tasks.py per openapi.yaml
- [X] T088 [US8] Return 404 for task not owned by user
- [X] T089 [US8] Add deleteTask mutation to frontend/src/hooks/useTasks.ts
- [X] T090 [US8] Add delete button to TaskCard or task detail page
- [X] T091 [US8] Add confirmation dialog before delete in frontend

**Checkpoint**: User can delete their own tasks with confirmation

---

## Phase 11: User Story 9 - Sign Out (Priority: P3)

**Goal**: Authenticated users can sign out to secure their account

**Independent Test**: Sign out → token cleared → protected routes return 401

### Implementation for User Story 9

- [X] T092 [US9] Add POST /api/auth/logout endpoint to backend/app/api/auth.py per openapi.yaml
- [X] T093 [US9] Clear any server-side session state on logout (if applicable)
- [X] T094 [US9] Add logout function to frontend/src/lib/auth.ts (clear token)
- [X] T095 [US9] Add logout function to frontend/src/hooks/useAuth.ts
- [X] T096 [US9] Add "Sign Out" button to dashboard layout frontend/src/app/(dashboard)/layout.tsx
- [X] T097 [US9] Redirect to /login after successful logout

**Checkpoint**: User can sign out and cannot access protected routes

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and validation

- [X] T098 [P] Add error boundary component to frontend/src/app/error.tsx
- [X] T099 [P] Add loading states to frontend/src/app/loading.tsx
- [X] T100 [P] Add 404 page to frontend/src/app/not-found.tsx
- [X] T101 Add responsive styling to all pages (mobile 320px to desktop 1920px)
- [X] T102 Add backend/app/api/health.py with GET /health endpoint for monitoring
- [X] T103 Register all routers in backend/app/main.py (auth, tasks, health)
- [X] T104 Run quickstart.md validation to ensure setup instructions work
- [X] T105 Verify Phase I src/ directory is untouched

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **US1-US2 (Phase 3-4)**: Depend on Foundational - Must complete before task operations
- **US3-US7 (Phase 5-9)**: Depend on US1+US2 completion (need auth to work)
- **US8-US9 (Phase 10-11)**: Depend on US1+US2 completion
- **Polish (Phase 12)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (Registration)**: Can start after Foundational - No dependencies
- **US2 (Sign In)**: Can start after Foundational - Shares auth service with US1, can parallel
- **US3 (Create Task)**: Requires US1+US2 (need working auth)
- **US4 (View Tasks)**: Requires US1+US2, can parallel with US3
- **US5 (View Details)**: Requires US4 (need task list first)
- **US6 (Update Task)**: Requires US5 (need detail view)
- **US7 (Toggle)**: Requires US4 (need task list), can parallel with US5/US6
- **US8 (Delete)**: Requires US4 (need task list), can parallel with US5/US6/US7
- **US9 (Sign Out)**: Requires US2 (need sign in), can parallel with US3-US8

### Within Each User Story

- Backend API before frontend integration
- Models/services before API endpoints
- Core functionality before validation/error handling

### Parallel Opportunities

- Setup tasks T001-T008 can all run in parallel
- Backend/frontend foundational work can parallel after T001-T002
- US1 and US2 can share auth service work
- US3-US4 can start in parallel once auth is complete
- US5, US6, US7, US8 can largely parallel (different endpoints)
- US9 is independent of US3-US8

---

## Parallel Example: Phase 1 Setup

```bash
# All these tasks can run in parallel:
T001: Create backend directory structure
T002: Create frontend directory structure
T003: Create backend/pyproject.toml
T004: Create backend/requirements.txt
T005: Create frontend/package.json
T006: Create frontend/tsconfig.json
T007: Create frontend/next.config.js
T008: Create frontend/tailwind.config.js
```

---

## Implementation Strategy

### MVP First (US1 + US2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US1 (Registration)
4. Complete Phase 4: US2 (Sign In)
5. **STOP and VALIDATE**: Test auth flow end-to-end
6. User can register and sign in (MVP auth ready)

### Task CRUD Increment (US3 + US4)

7. Complete Phase 5: US3 (Create Task)
8. Complete Phase 6: US4 (View Tasks)
9. **STOP and VALIDATE**: Test create + view flow
10. User can create and view their tasks

### Full Feature Set (US5-US9)

11. Complete Phases 7-11 in priority order
12. Complete Phase 12: Polish
13. **FINAL VALIDATION**: Run quickstart.md, verify Phase I preserved

---

## Task Summary

| Phase | User Story | Task Count | Parallel Tasks |
|-------|------------|------------|----------------|
| 1 | Setup | 11 | 8 |
| 2 | Foundational | 13 | 4 |
| 3 | US1 - Registration | 12 | 0 |
| 4 | US2 - Sign In | 11 | 0 |
| 5 | US3 - Create Task | 8 | 0 |
| 6 | US4 - View Tasks | 9 | 0 |
| 7 | US5 - View Details | 7 | 0 |
| 8 | US6 - Update Task | 8 | 0 |
| 9 | US7 - Toggle | 6 | 0 |
| 10 | US8 - Delete | 6 | 0 |
| 11 | US9 - Sign Out | 6 | 0 |
| 12 | Polish | 8 | 3 |
| **Total** | | **105** | **15** |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Phase I src/ directory MUST remain untouched throughout
