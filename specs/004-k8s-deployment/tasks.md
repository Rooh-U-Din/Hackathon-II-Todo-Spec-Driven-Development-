# Tasks: Phase IV - Local Kubernetes Deployment

**Input**: Design documents from `specs/004-k8s-deployment/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/helm-values-schema.yaml, quickstart.md

**Tests**: Tests are NOT explicitly requested in the specification. Manual validation via Helm and kubectl is the testing approach.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

Phase IV infrastructure files are at repository root:
- `Dockerfile.frontend`, `Dockerfile.backend` - Docker configurations
- `helm/todo-app/` - Parent Helm chart
- `helm/todo-app/charts/frontend/` - Frontend subchart
- `helm/todo-app/charts/backend/` - Backend subchart

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create project structure for Phase IV infrastructure files

- [x] T001 Create Helm chart directory structure at helm/todo-app/ with charts/frontend/ and charts/backend/ subdirectories
- [x] T002 [P] Create .dockerignore for frontend in frontend/.dockerignore
- [x] T003 [P] Create .dockerignore for backend in backend/.dockerignore

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core Docker and Helm infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until Docker images are buildable and parent Helm chart exists

### Docker Containerization

- [x] T004 [P] Create multi-stage Dockerfile for frontend (Next.js standalone) in Dockerfile.frontend
- [x] T005 [P] Create multi-stage Dockerfile for backend (FastAPI) in Dockerfile.backend
- [x] T006 Verify AI tools availability and document fallback status (Gordon, kubectl-ai, kagent)
- [ ] T007 Build and verify frontend Docker image locally using `docker build -t todo-frontend:local -f Dockerfile.frontend ./frontend`
- [ ] T008 Build and verify backend Docker image locally using `docker build -t todo-backend:local -f Dockerfile.backend ./backend`

### Helm Parent Chart

- [x] T009 Create parent Chart.yaml at helm/todo-app/Chart.yaml with frontend and backend dependencies
- [x] T010 Create parent values.yaml at helm/todo-app/values.yaml with global configuration
- [x] T011 Create _helpers.tpl at helm/todo-app/templates/_helpers.tpl

**Checkpoint**: Docker images build successfully in under 3 minutes each, Helm parent chart structure ready

---

## Phase 3: User Story 1 - Deploy Application (Priority: P1) MVP

**Goal**: Deploy Todo AI Chatbot to Minikube using a single Helm command

**Independent Test**: Run `helm install todo ./helm/todo-app` and verify:
1. All Kubernetes resources created
2. Pods reach Running state within 2 minutes
3. Frontend accessible via NodePort 30080
4. Backend API responds via NodePort 30081

### Frontend Subchart

- [x] T012 [P] [US1] Create frontend Chart.yaml at helm/todo-app/charts/frontend/Chart.yaml
- [x] T013 [P] [US1] Create frontend values.yaml at helm/todo-app/charts/frontend/values.yaml with image, port, resources, nodePort 30080
- [x] T014 [US1] Create _helpers.tpl at helm/todo-app/charts/frontend/templates/_helpers.tpl
- [x] T015 [US1] Create deployment.yaml at helm/todo-app/charts/frontend/templates/deployment.yaml with liveness/readiness probes
- [x] T016 [US1] Create service.yaml at helm/todo-app/charts/frontend/templates/service.yaml with NodePort type

### Backend Subchart

- [x] T017 [P] [US1] Create backend Chart.yaml at helm/todo-app/charts/backend/Chart.yaml
- [x] T018 [P] [US1] Create backend values.yaml at helm/todo-app/charts/backend/values.yaml with image, port, resources, nodePort 30081
- [x] T019 [US1] Create _helpers.tpl at helm/todo-app/charts/backend/templates/_helpers.tpl
- [x] T020 [US1] Create deployment.yaml at helm/todo-app/charts/backend/templates/deployment.yaml with liveness/readiness probes
- [x] T021 [US1] Create service.yaml at helm/todo-app/charts/backend/templates/service.yaml with NodePort type
- [x] T022 [US1] Create configmap.yaml at helm/todo-app/charts/backend/templates/configmap.yaml for non-sensitive config
- [x] T023 [US1] Create secret.yaml at helm/todo-app/charts/backend/templates/secret.yaml for DATABASE_URL, GEMINI_API_KEY, SECRET_KEY

### Validation

> **NOTE**: Tasks T024-T031 require Docker/Helm/Minikube in user's local environment.
> Run these commands in a terminal with Docker Desktop and Minikube configured.

- [ ] T024 [US1] Run `helm lint ./helm/todo-app` to validate chart structure
- [ ] T025 [US1] Start Minikube cluster with `minikube start --cpus=4 --memory=8192`
- [ ] T026 [US1] Configure Docker environment with `minikube docker-env` and build images in Minikube
- [ ] T027 [US1] Deploy application using `helm install todo ./helm/todo-app --namespace default`
- [ ] T028 [US1] Verify all pods reach Running state within 2 minutes using `kubectl get pods -w`
- [ ] T029 [US1] Verify frontend accessible via `curl http://$(minikube ip):30080` returns 200 OK
- [ ] T030 [US1] Verify backend API responds via `curl http://$(minikube ip):30081/health` returns 200 OK
- [ ] T031 [US1] Verify Phase III features work: create task via chat, list tasks, complete task

**Checkpoint**: User Story 1 complete - application deploys with single `helm install` command, all acceptance scenarios pass

---

## Phase 4: User Story 2 - Scale Application (Priority: P2)

**Goal**: Horizontally scale application by adjusting replica counts

**Independent Test**: Scale replicas via kubectl, verify pods reach Running state, confirm requests continue working

> **NOTE**: Tasks T032-T038 require running Minikube cluster with deployed application.

### Implementation

- [ ] T032 [US2] Scale frontend to 3 replicas using `kubectl scale deployment todo-app-frontend --replicas=3`
- [ ] T033 [US2] Verify all 3 frontend pods reach Running state within 2 minutes
- [ ] T034 [US2] Scale backend to 3 replicas using `kubectl scale deployment todo-app-backend --replicas=3`
- [ ] T035 [US2] Verify all 3 backend pods reach Running state within 2 minutes
- [ ] T036 [US2] Test load balancing by making 10 requests and verifying responses from different pods via logs
- [ ] T037 [US2] Terminate one backend pod using `kubectl delete pod <pod-name>` and verify remaining pods continue serving
- [ ] T038 [US2] Verify data persists in external database after pod termination by creating and retrieving a task

**Checkpoint**: User Story 2 complete - application scales horizontally without service interruption (SC-05)

---

## Phase 5: User Story 3 - AI DevOps Tools (Priority: P3)

**Goal**: Use AI-assisted DevOps tools for deployment and operations

**Independent Test**: Execute AI tool commands and verify correct outputs; document fallback usage if tools unavailable

> **STATUS**: AI tools not available in this environment. Fallback documentation complete.
> See: specs/004-k8s-deployment/ai-devops-usage.md

### Docker AI Agent (Gordon)

- [x] T039 [P] [US3] Execute Gordon Dockerfile analysis: `docker ai "Analyze and optimize Dockerfile.frontend"` (or document fallback)
- [x] T040 [P] [US3] Execute Gordon build help: `docker ai "How to build for Minikube?"` (or document fallback)

### kubectl-ai

- [x] T041 [P] [US3] Execute kubectl-ai deployment: `kubectl-ai "Check status of todo-app deployment"` (or document fallback with `kubectl get all`)
- [x] T042 [P] [US3] Execute kubectl-ai scaling: `kubectl-ai "Scale todo-app-backend to 2 replicas"` (or document fallback)
- [x] T043 [P] [US3] Execute kubectl-ai debugging: `kubectl-ai "Show logs for todo-app-backend"` (or document fallback with `kubectl logs`)

### kagent

- [x] T044 [P] [US3] Execute kagent cluster analysis: `kagent analyze` (or document fallback with `kubectl describe nodes`)
- [x] T045 [P] [US3] Execute kagent resource check: `kagent resources` (or document fallback with `kubectl top pods`)

### Documentation

- [x] T046 [US3] Document AI tool usage results and fallback commands used in specs/004-k8s-deployment/ai-devops-usage.md

**Checkpoint**: User Story 3 complete - AI DevOps tool usage documented with examples and fallbacks

---

## Phase 6: User Story 4 - Configure Environment (Priority: P4)

**Goal**: Configure environment-specific values through Helm values.yaml

**Independent Test**: Modify values.yaml, run helm upgrade, verify pods use updated configuration

> **NOTE**: Tasks T048-T052 require running Minikube cluster with deployed application.

### Implementation

- [x] T047 [US4] Create values-local.yaml at helm/todo-app/values-local.yaml with local development overrides
- [ ] T048 [US4] Test helm upgrade with modified replica count: `helm upgrade todo ./helm/todo-app --set frontend.replicaCount=2`
- [ ] T049 [US4] Test helm upgrade with modified resource limits: increase backend memory limit to 2Gi
- [ ] T050 [US4] Verify ConfigMap changes propagate to pods by updating LOG_LEVEL and checking pod env
- [ ] T051 [US4] Verify Secret changes trigger rolling update by updating a secret value and observing pod restart
- [ ] T052 [US4] Verify no secrets are hardcoded in images by inspecting `docker history todo-backend:local`

**Checkpoint**: User Story 4 complete - configuration changes apply via Helm values without hardcoding

---

## Phase 7: Edge Case Validation

**Purpose**: Verify edge case behaviors defined in spec.md

> **NOTE**: Tasks T053-T056 require running Minikube cluster with deployed application.

- [ ] T053 [P] Verify EC-01: Attempt to scale beyond Minikube resources, confirm pods show Pending with resource events
- [ ] T054 [P] Verify EC-02: Temporarily misconfigure image name, confirm ImagePullBackOff status and retry behavior
- [ ] T055 [P] Verify EC-03: Temporarily set invalid DATABASE_URL, confirm backend health probe fails and pod restarts
- [ ] T056 Verify EC-04: Apply configuration change via helm upgrade, confirm rolling update replaces pods one at a time

**Checkpoint**: All edge cases validated per spec.md EC-01 through EC-04

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Documentation and final validation

> **NOTE**: Tasks T059-T062 require running Minikube cluster with deployed application.

- [x] T057 [P] Create deployment README at helm/todo-app/README.md with installation, configuration, and troubleshooting
- [ ] T058 [P] Update project README.md with Phase IV deployment instructions section
- [ ] T059 Run full validation checklist from spec.md (6 items)
- [ ] T060 Verify all Phase III features still work in containerized deployment (chat, tasks CRUD)
- [x] T061 Document Minikube teardown process in helm/todo-app/README.md
- [ ] T062 Verify reproducibility: uninstall, reinstall, confirm identical behavior (NFR-01)

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup
    │
    ▼
Phase 2: Foundational (Docker + Helm parent) ← BLOCKS ALL USER STORIES
    │
    ▼
Phase 3: US1 - Deploy Application (P1) ← MVP
    │
    ├──────────────────┬────────────────┬────────────────┐
    ▼                  ▼                ▼                ▼
Phase 4: US2       Phase 5: US3     Phase 6: US4     Phase 7:
(Scaling)          (AI Tools)       (Configuration)  Edge Cases
    │                  │                │                │
    └──────────────────┴────────────────┴────────────────┘
                       │
                       ▼
               Phase 8: Polish
```

### User Story Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational - core deployment (MVP)
- **User Story 2 (Phase 4)**: Depends on US1 completion (needs working deployment to scale)
- **User Story 3 (Phase 5)**: Can run in parallel with US2/US4 after US1 (documentation + tool usage)
- **User Story 4 (Phase 6)**: Depends on US1 completion (needs working deployment to configure)
- **Edge Cases (Phase 7)**: Can run in parallel with US2/US3/US4 after US1
- **Polish (Phase 8)**: Depends on all phases complete

### Within Each User Story

- Helm templates before deployment commands
- Chart structure (Chart.yaml, values.yaml) before templates
- Build images before deploy
- Deploy before validate
- AI tools can be used at any point during their respective story

### Parallel Opportunities

**Phase 1 (Setup)**:
- T002 and T003 can run in parallel (different .dockerignore files)

**Phase 2 (Foundational)**:
- T004 and T005 can run in parallel (different Dockerfiles)

**Phase 3 (US1)**:
- Frontend subchart (T012-T016) and backend subchart (T017-T023) can be developed in parallel
- T012+T017 (Chart.yaml) parallel, T013+T018 (values.yaml) parallel

**Phase 5 (US3)**:
- All AI tool tasks (T039-T045) can run in parallel

**Phase 7 (Edge Cases)**:
- T053, T054, T055 can run in parallel (independent scenarios)

**Phase 8 (Polish)**:
- T057 and T058 can run in parallel (different README files)

---

## Parallel Example: User Story 1

```bash
# Launch frontend and backend Chart.yaml creation in parallel:
Task: "Create frontend Chart.yaml at helm/todo-app/charts/frontend/Chart.yaml"
Task: "Create backend Chart.yaml at helm/todo-app/charts/backend/Chart.yaml"

# Launch frontend and backend values.yaml creation in parallel:
Task: "Create frontend values.yaml at helm/todo-app/charts/frontend/values.yaml"
Task: "Create backend values.yaml at helm/todo-app/charts/backend/values.yaml"

# Launch Dockerfile creation in parallel (Phase 2):
Task: "Create multi-stage Dockerfile for frontend in Dockerfile.frontend"
Task: "Create multi-stage Dockerfile for backend in Dockerfile.backend"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T011) - Docker images + parent chart
3. Complete Phase 3: User Story 1 (T012-T031) - Full deployment
4. **STOP and VALIDATE**: Test deployment via browser, verify all pods running
5. Demo: Application running on Minikube with `helm install`

### Incremental Delivery

1. Setup + Foundational → Docker images and Helm structure ready
2. Add User Story 1 → Test deployment → Demo (MVP!)
3. Add User Story 2 → Test scaling → Demo
4. Add User Story 3 → Document AI tools → Demo
5. Add User Story 4 → Test configuration → Demo
6. Edge Cases → Validate resilience → Demo
7. Polish → Final documentation and validation

### Single Developer Strategy

Execute phases sequentially:
1. Phase 1 + 2: Infrastructure (T001-T011)
2. Phase 3: US1 deployment (T012-T031) → Validate
3. Phase 4: US2 scaling (T032-T038) → Validate
4. Phase 5: US3 AI tools (T039-T046) → Document
5. Phase 6: US4 configuration (T047-T052) → Validate
6. Phase 7: Edge cases (T053-T056) → Validate
7. Phase 8: Polish (T057-T062) → Complete

---

## Task Summary

| Phase | Tasks | Parallel | Story |
|-------|-------|----------|-------|
| 1. Setup | 3 | 2 | - |
| 2. Foundational | 8 | 2 | - |
| 3. US1 Deploy | 20 | 4 | US1 |
| 4. US2 Scale | 7 | 0 | US2 |
| 5. US3 AI Tools | 8 | 7 | US3 |
| 6. US4 Config | 6 | 0 | US4 |
| 7. Edge Cases | 4 | 3 | - |
| 8. Polish | 6 | 2 | - |
| **Total** | **62** | **20** | - |

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable after US1 (MVP)
- Manual validation via Helm, kubectl, and browser (no automated tests per spec)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- AI tools (Gordon, kubectl-ai, kagent) MUST be used per constitution; fallbacks documented if unavailable
- Edge case validation (Phase 7) added per /sp.analyze findings
- SC-08: Docker images must build in under 3 minutes each
- SC-01: Full deployment under 5 minutes (4+ CPU cores, warm cache)
