---
id: 009
title: Cross-Artifact Consistency Analysis
stage: misc
date: 2025-12-19
surface: agent
model: claude-opus-4-5-20251101
feature: 003-todo-ai-chatbot
branch: 003-todo-ai-chatbot
user: system
command: /sp.analyze
labels: ["analysis", "prerequisites", "validation"]
links:
  spec: specs/003-todo-ai-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - null
tests:
  - null
---

## Prompt

/sp.analyze

## Response snapshot

Analysis aborted due to missing prerequisites. The feature `003-todo-ai-chatbot` has `spec.md` present but is missing both `plan.md` and `tasks.md`. The `/sp.analyze` command requires all three core artifacts to perform cross-artifact consistency checks.

**Required Actions:**
1. Run `/sp.plan` to create the implementation plan
2. Run `/sp.tasks` to generate the task breakdown
3. Re-run `/sp.analyze` after both artifacts exist

## Outcome

- ✅ Impact: None - analysis blocked by missing prerequisites
- 🧪 Tests: N/A
- 📁 Files: No files modified (read-only analysis)
- 🔁 Next prompts: /sp.plan, /sp.tasks, /sp.analyze
- 🧠 Reflection: Prerequisite check correctly identified missing artifacts and provided clear guidance

## Evaluation notes (flywheel)

- Failure modes observed: None - expected behavior for incomplete feature setup
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
