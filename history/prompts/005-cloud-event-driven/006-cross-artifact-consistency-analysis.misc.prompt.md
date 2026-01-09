---
id: 006
title: Cross-Artifact Consistency Analysis
stage: misc
date: 2026-01-05
surface: agent
model: claude-opus-4-5-20251101
feature: 005-cloud-event-driven
branch: 005-cloud-event-driven
user: architect
command: /sp.analyze
labels: ["analysis", "quality", "consistency", "coverage"]
links:
  spec: specs/005-cloud-event-driven/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - history/prompts/005-cloud-event-driven/006-cross-artifact-consistency-analysis.misc.prompt.md (created)
tests:
  - N/A (read-only analysis)
---

## Prompt

```text
$ARGUMENTS
```

User invoked `/sp.analyze` to perform cross-artifact consistency and quality analysis across spec.md, plan.md, and tasks.md for Phase V (005-cloud-event-driven) feature.

## Response snapshot

Comprehensive analysis report generated identifying:

- **2 CRITICAL issues**: Constitution alignment (Phase V not defined in v1.3.0), OpenAI vs Gemini discrepancy
- **5 HIGH issues**: Terminology inconsistency (Dapr/Kafka naming), Redis vs Redpanda dev env conflict, timezone underspecification, frontend component references, NFR-07 coverage gap
- **10 MEDIUM issues**: Full-text search tech unspecified, clock skew handling, queue size limits, entity duplication, mock email missing, various ambiguities
- **3 LOW issues**: Minor ordering, tag defaults, broker test task

**Coverage Metrics**:
- 27/28 requirements have task coverage (96.4%)
- 1 requirement (NFR-07: monitoring) has no tasks
- 154 total tasks across 10 phases

**Recommendation**: Resolve CRITICAL and HIGH issues before running `/sp.implement`.

## Outcome

- ✅ Impact: Quality gate - identified blockers before implementation
- 🧪 Tests: N/A (read-only analysis)
- 📁 Files: 1 PHR created
- 🔁 Next prompts: Constitution amendment, spec clarification, add missing tasks
- 🧠 Reflection: Analysis detected real gaps (monitoring, timezone, dev environment config)

## Evaluation notes (flywheel)

- Failure modes observed: None - analysis completed successfully
- Graders run and results (PASS/FAIL): N/A (analysis command)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Run /sp.analyze after constitution amendment to verify resolution
