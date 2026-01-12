---
id: 011
title: Fix CORS and 500 Error Backend
stage: green
date: 2026-01-12
surface: agent
model: claude-opus-4-5-20251101
feature: 005-cloud-event-driven
branch: 005-cloud-event-driven
user: architect
command: /sp.implement
labels: ["bugfix", "cors", "database", "backend"]
links:
  spec: specs/005-cloud-event-driven/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - backend/app/db/session.py (modified)
  - backend/app/main.py (modified)
tests:
  - Manual validation via browser console
---

## Prompt

Problem:
The frontend (Next.js running on http://localhost:3000) fails to fetch data from the backend (FastAPI on http://localhost:8000) with the following errors:
- Browser CORS error: "No 'Access-Control-Allow-Origin' header is present"
- Network error: HTTP 500 Internal Server Error on GET /api/tasks

Important context:
- Frontend and backend run on different origins
- There is no visible frontend error besides failed fetch
- Backend is FastAPI (Uvicorn)
- The issue happens immediately on page load
- This is a development / demo environment (hackathon scope)

Your tasks:
1. Identify the exact root cause of the CORS error and the 500 error.
2. Fix backend configuration so cross-origin requests from the frontend are allowed.
3. Add proper FastAPI CORSMiddleware with correct allow_origins, methods, and headers.
4. Ensure the fix does NOT break existing APIs or authentication.
5. If the 500 error is masking the CORS issue, identify and fix the backend exception as well.
6. Provide the exact code changes required (file + snippet).
7. Restart/redeploy instructions if needed (Docker / Kubernetes safe).

## Response snapshot

**Root Cause Analysis:**
1. Database connection issue: `channel_binding=require` in DATABASE_URL not properly handled by connect_args
2. CORS headers missing on 500 errors: When exception occurs before response, CORS middleware doesn't add headers

**Fixes Applied:**
1. `backend/app/db/session.py`: Parse DATABASE_URL query parameters and properly pass sslmode and channel_binding to connect_args
2. `backend/app/main.py`: Added global exception handler to ensure CORS headers on all responses including 500 errors

**Restart Required:** Yes - `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`

## Outcome

- Impact: Fixed CORS and 500 errors for local development
- Tests: Manual browser validation required
- Files: 2 files modified (session.py, main.py)
- Next prompts: Test the fix by refreshing frontend
- Reflection: The 500 error was masking CORS; both issues needed addressing

## Evaluation notes (flywheel)

- Failure modes observed: Database connection parameters in URL not properly extracted
- Graders run and results (PASS/FAIL): Manual validation pending
- Prompt variant (if applicable): standard /sp.implement
- Next experiment: Add automated integration tests for CORS scenarios
