# Implementation Plan: Full-Stack Todo Web Application (Phase II)

**Branch**: `002-fullstack-todo-web` | **Date**: 2025-12-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-fullstack-todo-web/spec.md`

## Summary

Extend the Phase I console-based Todo application into a multi-user full-stack web application with authentication (Better Auth + JWT), REST APIs (FastAPI), and persistent storage (Neon PostgreSQL). The frontend uses Next.js with App Router and TypeScript. Phase I code remains untouched; all changes are additive.

## Technical Context

**Language/Version**: Python 3.13 (backend), TypeScript 5.x (frontend)
**Primary Dependencies**: FastAPI, SQLModel, Better Auth, Next.js 14+ (App Router)
**Storage**: Neon Serverless PostgreSQL
**Testing**: pytest (backend), Jest/Vitest (frontend)
**Target Platform**: Web (modern browsers ES2020+), Linux server for backend
**Project Type**: Web application (frontend + backend)
**Performance Goals**: <2s task operations, <5s sign-in to task list, <500ms auth rejection
**Constraints**: Phase I code untouched, JWT via BETTER_AUTH_SECRET env var
**Scale/Scope**: Hobby-scale, multi-user with strict data isolation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Note**: The Constitution (v1.1.0) applies to **Phase I only**. Phase II is explicitly permitted after Phase I completion (Constitution Section X: Phase Gate). The following gates are evaluated in the Phase II context:

| Gate | Phase I Requirement | Phase II Status | Justification |
|------|---------------------|-----------------|---------------|
| Spec-Driven Development | All code from specs | ✅ PASS | Claude Code generates 100% of implementation from specs |
| Human Constraints | No manual code changes | ✅ PASS | Human writes specs only; Claude implements |
| AI Obligations | Implement only defined behavior | ✅ PASS | All features in spec.md |
| No External Dependencies | Standard library only | ⚠️ N/A (Phase I only) | Phase II explicitly permits FastAPI, SQLModel, Better Auth, Next.js |
| Data Lifetime | In-memory only | ⚠️ N/A (Phase I only) | Phase II explicitly requires persistent storage |
| Code Quality | Python 3.13, clean code | ✅ PASS | Maintained for backend |
| CLI Standards | Numbered menu | ⚠️ N/A (Phase I only) | Phase II is web-based |
| Error Handling | Graceful errors | ✅ PASS | HTTP 401/404 responses defined |
| Spec Evolution | Update spec, re-run | ✅ PASS | Process maintained |
| Phase Gate | Phase I complete first | ✅ ASSUMED | Phase I implementation assumed complete |

**Phase I Preservation Check**:
- [ ] Phase I `/src/` directory untouched
- [ ] Phase I specs untouched
- [ ] Phase I behavior preserved

**Result**: ✅ GATE PASSED - Phase II development permitted with web stack.

## Project Structure

### Documentation (this feature)

```text
specs/002-fullstack-todo-web/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (OpenAPI spec)
│   └── openapi.yaml
├── checklists/
│   └── requirements.md  # Quality checklist
└── tasks.md             # Phase 2 output (NOT created by /sp.plan)
```

### Source Code (repository root)

```text
# Phase I (PRESERVED - DO NOT MODIFY)
src/
├── models/
├── services/
├── cli/
└── lib/

# Phase II (NEW)
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry
│   ├── config.py            # Environment configuration
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py          # User SQLModel
│   │   └── task.py          # Task SQLModel
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py          # Dependency injection (auth, db)
│   │   ├── auth.py          # Auth routes (register, login, logout)
│   │   └── tasks.py         # Task CRUD routes
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth.py          # Better Auth integration
│   │   └── tasks.py         # Task business logic
│   └── db/
│       ├── __init__.py
│       └── session.py       # Neon PostgreSQL connection
├── tests/
│   ├── conftest.py
│   ├── test_auth.py
│   └── test_tasks.py
├── requirements.txt
└── pyproject.toml

frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Landing/redirect
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   └── (dashboard)/
│   │       ├── layout.tsx   # Protected layout
│   │       └── tasks/
│   │           ├── page.tsx # Task list
│   │           └── [id]/
│   │               └── page.tsx # Task detail
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   ├── TaskList.tsx
│   │   ├── TaskCard.tsx
│   │   ├── TaskForm.tsx
│   │   └── AuthForm.tsx
│   ├── lib/
│   │   ├── api.ts           # API client
│   │   ├── auth.ts          # Auth helpers
│   │   └── types.ts         # TypeScript types
│   └── hooks/
│       ├── useAuth.ts
│       └── useTasks.ts
├── tests/
├── package.json
├── tsconfig.json
├── next.config.js
└── tailwind.config.js
```

**Structure Decision**: Web application with separate backend (FastAPI/Python) and frontend (Next.js/TypeScript). Phase I `src/` directory remains untouched. Backend uses SQLModel for ORM with Neon PostgreSQL. Frontend uses Next.js App Router with server components where appropriate.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| External dependencies (FastAPI, SQLModel, Next.js) | Phase II requirement | Phase I was standard library only; Phase II explicitly requires web stack |
| Database persistence | Multi-user data isolation | In-memory storage cannot support multiple users across sessions |
| Two separate projects (backend/frontend) | Different languages/runtimes | Single project cannot combine Python backend with Next.js frontend |

---

## Post-Design Constitution Check (Phase 1 Complete)

*Re-evaluation after Phase 1 design artifacts generated.*

| Gate | Status | Evidence |
|------|--------|----------|
| Spec-Driven Development | ✅ PASS | All designs derived from spec.md; no invented features |
| Human Constraints | ✅ PASS | No code written; only spec/plan artifacts |
| AI Obligations | ✅ PASS | data-model.md, contracts/, quickstart.md match spec requirements |
| Phase I Preservation | ✅ PASS | Plan explicitly separates `src/` (Phase I) from `backend/`, `frontend/` (Phase II) |
| Error Handling | ✅ PASS | OpenAPI spec defines HTTP 401, 404 error responses |
| Spec Evolution | ✅ PASS | Process maintained; spec.md is source of truth |

**Phase I Preservation Verification**:
- [x] Phase I `/src/` directory structure preserved in plan (DO NOT MODIFY marker)
- [x] Phase II code in separate `backend/` and `frontend/` directories
- [x] No modifications to Phase I files planned

**Result**: ✅ POST-DESIGN GATE PASSED - Ready for task generation (`/sp.tasks`).

---

## Generated Artifacts

| Artifact | Path | Status |
|----------|------|--------|
| Research | `specs/002-fullstack-todo-web/research.md` | ✅ Complete |
| Data Model | `specs/002-fullstack-todo-web/data-model.md` | ✅ Complete |
| API Contract | `specs/002-fullstack-todo-web/contracts/openapi.yaml` | ✅ Complete |
| Quickstart | `specs/002-fullstack-todo-web/quickstart.md` | ✅ Complete |
| Agent Context | `CLAUDE.md` | ✅ Updated |

## Next Steps

1. Run `/sp.tasks` to generate implementation tasks
2. Begin implementation following task order
3. Verify Phase I preservation after each major milestone
